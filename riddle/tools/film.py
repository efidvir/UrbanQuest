#!/usr/bin/env python3
"""Cut the story film that opens the quest from a few seconds of each mission clip.

    python3 film.py <out-dir>/<name> <clip.mp4>:<start>:<seconds> ...

The pieces are joined in the order given, crossfading half a second into each other, and the sound
fades out at the end. Writes, next to each other:
    <name>.mp4         the film, small enough for phones (H.264, starts playing while it loads)
    <name>-first.webp  its first frame, shown until it plays

It prints the second at which each piece starts, which is where its caption goes in the riddle's
"film": {"captions": [{"t": ..., "he": ..., "en": ...}]}.

Needs ffmpeg.
"""
import argparse
import os
import subprocess
import tempfile

ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
ap.add_argument('out', help='output path without extension, e.g. riddle/art/story')
ap.add_argument('pieces', nargs='+', help='clip.mp4:start:seconds')
ap.add_argument('--width', type=int, default=960)
ap.add_argument('--crf', type=int, default=26, help='quality, lower is better (default 26)')
a = ap.parse_args()

X = 0.5  # crossfade, seconds
pieces = []
for p in a.pieces:
    path, start, dur = p.rsplit(':', 2)
    pieces.append((path, float(start), float(dur)))

inputs, parts = [], []
for i, (path, start, dur) in enumerate(pieces):
    inputs += ['-i', path]
    parts.append(f'[{i}:v]trim=start={start}:duration={dur},setpts=PTS-STARTPTS,fps=24,'
                 f'scale={a.width}:-2:flags=lanczos,setsar=1,format=yuv420p[v{i}]')
    parts.append(f'[{i}:a]atrim=start={start}:duration={dur},asetpts=PTS-STARTPTS,'
                 f'aformat=sample_rates=48000:channel_layouts=stereo[a{i}]')
v, au, length, starts = 'v0', 'a0', pieces[0][2], [0.0]
for i in range(1, len(pieces)):
    offset = length - X
    starts.append(round(offset, 2))
    parts.append(f'[{v}][v{i}]xfade=transition=fade:duration={X}:offset={offset:.3f}[vx{i}]')
    parts.append(f'[{au}][a{i}]acrossfade=d={X}[ax{i}]')
    v, au, length = f'vx{i}', f'ax{i}', offset + pieces[i][2]
# Only the sound fades out: the picture stays on the last frame, which the page keeps showing.
parts.append(f'[{au}]afade=t=out:st={length - 1.2:.3f}:d=1.2[aout]')

subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(parts),
                '-map', f'[{v}]', '-map', '[aout]',
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', str(a.crf), '-pix_fmt', 'yuv420p', '-profile:v', 'main',
                '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', a.out + '.mp4'], check=True)
with tempfile.TemporaryDirectory() as tmp:
    first = os.path.join(tmp, 'first.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.out + '.mp4', '-frames:v', '1', first], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', first, '-c:v', 'libwebp', '-quality', '82',
                    a.out + '-first.webp'], check=True)
for f in (a.out + '.mp4', a.out + '-first.webp'):
    print(f, os.path.getsize(f) // 1024, 'KB')
print(f'{length:.2f} seconds; the pieces start at', ', '.join(f'{s:g}' for s in starts))

#!/usr/bin/env python3
"""Turn a generated video clip into the files a riddle page plays.

    python3 clip.py <clip.mp4> <out-dir>/<name> [--start 0] [--end 10] [--width 960]

writes, next to each other:
    <name>.mp4         the clip, small enough for phones (H.264, starts playing while it loads)
    <name>-first.webp  its first frame, shown until the clip starts
    <name>.webp        its last frame: the fixed picture the page settles on when the clip ends

Needs ffmpeg.
"""
import argparse
import os
import subprocess
import tempfile

ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
ap.add_argument('src')
ap.add_argument('out', help='output path without extension, e.g. riddle/art/start-intro')
ap.add_argument('--start', type=float, default=0, help='trim: first second to keep')
ap.add_argument('--end', type=float, default=None, help='trim: last second to keep')
ap.add_argument('--width', type=int, default=960)
ap.add_argument('--crf', type=int, default=27, help='quality, lower is better (default 27)')
a = ap.parse_args()

trim = ['-ss', str(a.start)] + (['-to', str(a.end)] if a.end else [])
scale = f'scale={a.width}:-2:flags=lanczos'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *trim, '-i', a.src, '-vf', scale,
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', str(a.crf), '-pix_fmt', 'yuv420p', '-profile:v', 'main',
                '-c:a', 'aac', '-b:a', '64k', '-ac', '2', '-movflags', '+faststart', a.out + '.mp4'], check=True)
with tempfile.TemporaryDirectory() as tmp:
    first = os.path.join(tmp, 'first.png')
    last = os.path.join(tmp, 'last.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.out + '.mp4', '-frames:v', '1', first], check=True)
    # The very last frame: seek close to the end and keep overwriting until the stream runs out.
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.5', '-i', a.out + '.mp4', '-update', '1', '-q:v', '1', last], check=True)
    for png, dst in ((first, a.out + '-first.webp'), (last, a.out + '.webp')):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', '82', dst], check=True)
for f in (a.out + '.mp4', a.out + '-first.webp', a.out + '.webp'):
    print(f, os.path.getsize(f) // 1024, 'KB')

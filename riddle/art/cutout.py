#!/usr/bin/env python3
"""Turn a picture from an image generator into a file for the riddle page.

Cut-outs (Udi, Mitzi, props) are drawn on a plain bright-green background. The green becomes
transparent, green fringes on the edges are toned down, and the picture is trimmed to the figure,
so the feet touch the bottom edge. Scenes are cropped to 3:2. Both are saved as WebP.

    python3 cutout.py udi-wave.png udi-wave.webp
    python3 cutout.py --scene intro.png intro.webp

Needs Pillow and numpy: pip install pillow numpy
"""
import argparse

import numpy as np
from PIL import Image

ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
ap.add_argument('src', help='the picture from the image generator (PNG or JPEG)')
ap.add_argument('dst', help='where to write the WebP')
ap.add_argument('--scene', action='store_true', help='a full scene for a story screen: crop to 3:2, keep the background')
ap.add_argument('--quality', type=int, default=82, help='WebP quality, 0-100 (default 82)')
a = ap.parse_args()

im = Image.open(a.src).convert('RGB')
if a.scene:
    w, h = im.size
    if w / h > 1.5:
        cw = round(h * 1.5)
        im = im.crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h))
    else:
        ch = round(w / 1.5)
        im = im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))
    im.save(a.dst, 'WEBP', quality=a.quality, method=6)
else:
    px = np.asarray(im).astype(np.int16)
    r, g, b = px[..., 0], px[..., 1], px[..., 2]
    greenness = g - np.maximum(r, b)                # how much greener a pixel is than it is red or blue
    alpha = np.clip((110 - greenness) / 60, 0, 1)   # the green background goes, with a soft edge
    g = np.minimum(g, np.maximum(r, b) + 8)         # take the green tint off the edges
    out = np.dstack([r, g, b, np.round(alpha * 255)]).clip(0, 255).astype(np.uint8)
    cut = Image.fromarray(out, 'RGBA')
    cut = cut.crop(cut.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
    cut.save(a.dst, 'WEBP', quality=a.quality, method=6)

print(a.dst, '%d x %d' % Image.open(a.dst).size)

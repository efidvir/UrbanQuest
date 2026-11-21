#!/usr/bin/env python3
"""Turn a picture from an image generator into a file for the riddle page.

Cut-outs (Udi, Mitzi, props) are drawn on a plain bright-green background. The green becomes
transparent, green fringes on the edges are toned down, and the picture is trimmed to the figure,
so the feet touch the bottom edge. Scenes are cropped to 3:2. Both are saved as WebP.

    python3 cutout.py --tan udi-wave.png udi-wave.webp
    python3 cutout.py --scene intro.png intro.webp

On a green background the image generator draws Udi's skin a bright orange; --tan brings it back to
the warm tan of the original story pictures (only bright orange is touched, not his brown trousers).

Needs Pillow and numpy: pip install pillow numpy
"""
import argparse

import numpy as np
from PIL import Image

ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
ap.add_argument('src', help='the picture from the image generator (PNG or JPEG)')
ap.add_argument('dst', help='where to write the WebP')
ap.add_argument('--scene', action='store_true', help='a full scene for a story screen: crop to 3:2, keep the background')
ap.add_argument('--tan', action='store_true', help="tone Udi's skin down to the tan of the story pictures")
ap.add_argument('--quality', type=int, default=82, help='WebP quality, 0-100 (default 82)')
a = ap.parse_args()


def tan(im):
    """Darken bright, saturated orange (Udi's skin) a little; darker browns stay as they are."""
    hsv = np.asarray(im.convert('HSV')).astype(np.float32) / 255
    h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]

    def step(x, e0, e1):
        t = np.clip((x - e0) / (e1 - e0), 0, 1)
        return t * t * (3 - 2 * t)

    skin = step(h, 8, 16) * (1 - step(h, 38, 46)) * step(s, 0.45, 0.6) * step(v, 0.68, 0.8)
    s, v = s * (1 - 0.04 * skin), v * (1 - 0.14 * skin)
    out = np.dstack([h / 360, s, v])
    return Image.fromarray((out * 255).round().astype(np.uint8), 'HSV').convert('RGB')


im = Image.open(a.src).convert('RGB')
if a.tan:
    im = tan(im)
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
    # Trim to the figure, ignoring stray one- or two-pixel lines (seams at the picture's edges).
    solid = alpha > 0.5
    cols = np.flatnonzero(solid.sum(axis=0) > 2)
    rows = np.flatnonzero(solid.sum(axis=1) > 2)
    cut = cut.crop((int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1))
    cut.save(a.dst, 'WEBP', quality=a.quality, method=6)

print(a.dst, '%d x %d' % Image.open(a.dst).size)

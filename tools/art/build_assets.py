"""Builds the v4 table art for 2 Patti from source files.

Inputs (not committed, see ASSET_LICENSES.md for origin):
  --bg       generated room-and-dealer image (9:16)
  --felt     generated felt texture (square)
  --cards    folder of PNGs rendered from the public-domain Vector-Playing-Cards SVGs
  --portraits folder with <name>.jpg generated portraits
Outputs go to assets/art/.
Requires Pillow with WebP support.
"""
import argparse, math, os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops

ap = argparse.ArgumentParser()
ap.add_argument('--bg'); ap.add_argument('--felt'); ap.add_argument('--cards'); ap.add_argument('--portraits')
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'art'))
a = ap.parse_args()
out = os.path.abspath(a.out)
os.makedirs(os.path.join(out, 'cards'), exist_ok=True)
os.makedirs(os.path.join(out, 'portraits'), exist_ok=True)

# 1. Room and dealer background: 1080x1920 JPEG.
bg = Image.open(a.bg).convert('RGB').resize((1080, 1920), Image.LANCZOS)
bg = bg.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
bg.save(os.path.join(out, 'room-dealer.jpg'), quality=80, optimize=True, progressive=True)

# 2. Felt-and-rail table, 1400x1100 with alpha. Superellipse outline, padded dark rail.
TW, TH = 1400, 1100
SS = 2  # supersample for smooth edges


def superellipse_mask(w, h, inset, n=3.2, top_flat=0.0):
    m = Image.new('L', (w * SS, h * SS), 0)
    d = ImageDraw.Draw(m)
    cx, cy = w * SS / 2, h * SS / 2
    rx, ry = w * SS / 2 - inset * SS, h * SS / 2 - inset * SS
    pts = []
    for i in range(720):
        t = 2 * math.pi * i / 720
        c, s = math.cos(t), math.sin(t)
        x = cx + rx * math.copysign(abs(c) ** (2 / n), c)
        y = cy + ry * math.copysign(abs(s) ** (2 / n), s)
        pts.append((x, y))
    d.polygon(pts, fill=255)
    return m.resize((w, h), Image.LANCZOS)


outer = superellipse_mask(TW, TH, 0)
RAIL = 64
inner = superellipse_mask(TW, TH, RAIL)

# Rail: dark leather with a soft top highlight and inner bevel.
rail = Image.new('RGB', (TW, TH), (24, 21, 19))
grad = Image.linear_gradient('L').resize((TW, TH))  # 0 top -> 255 bottom
hi = Image.new('RGB', (TW, TH), (70, 60, 52))
rail = Image.composite(rail, hi, grad.point(lambda v: min(255, 120 + v)))
# Padded look: lighter band in the middle of the rail.
band_o = superellipse_mask(TW, TH, RAIL * 0.28)
band_i = superellipse_mask(TW, TH, RAIL * 0.62)
band = ImageChops.subtract(band_o, band_i).filter(ImageFilter.GaussianBlur(10))
rail = Image.composite(Image.new('RGB', (TW, TH), (58, 50, 44)), rail, band.point(lambda v: int(v * 0.55)))
# Outer dark edge.
edge = ImageChops.subtract(outer, superellipse_mask(TW, TH, 6)).filter(ImageFilter.GaussianBlur(2))
rail = Image.composite(Image.new('RGB', (TW, TH), (8, 7, 6)), rail, edge)

# Felt: texture tinted to the palette, with a soft centre light and a vignette.
felt_src = Image.open(a.felt).convert('L').resize((700, 700), Image.LANCZOS)
tile = Image.new('L', (TW, TH))
for y in range(0, TH, 700):
    for x in range(0, TW, 700):
        tile.paste(felt_src, (x, y))
tile = ImageEnhance.Contrast(tile).enhance(1.6)
dark, light = (16, 74, 40), (40, 126, 72)
felt = Image.merge('RGB', [tile.point(lambda v, i=i: int(dark[i] + (light[i] - dark[i]) * v / 255)) for i in range(3)])
rad = Image.radial_gradient('L').resize((TW, int(TH * 1.15))).crop((0, int(TH * 0.05), TW, int(TH * 0.05) + TH))  # 0 centre -> 255 edge
felt = Image.composite(Image.new('RGB', (TW, TH), (8, 40, 22)), felt, rad.point(lambda v: int(min(255, max(0, (v - 90) * 1.1)))))
# Inner shadow cast by the rail onto the felt.
sh = ImageChops.subtract(inner, superellipse_mask(TW, TH, RAIL + 26)).filter(ImageFilter.GaussianBlur(14))
felt = Image.composite(Image.new('RGB', (TW, TH), (5, 25, 14)), felt, sh.point(lambda v: int(v * 0.75)))

table = Image.composite(felt, rail, inner)
# Thin highlight where rail meets felt.
lip = ImageChops.subtract(superellipse_mask(TW, TH, RAIL - 3), inner).filter(ImageFilter.GaussianBlur(1.2))
table = Image.composite(Image.new('RGB', (TW, TH), (92, 80, 66)), table, lip.point(lambda v: int(v * 0.5)))
table = table.convert('RGBA')
table.putalpha(outer)
table.save(os.path.join(out, 'table.webp'), quality=82, method=6)

# 3. Card faces from the public-domain deck, plus a navy card back.
for f in sorted(os.listdir(a.cards)):
    if not f.endswith('.png') or f.startswith('Joker'):
        continue
    im = Image.open(os.path.join(a.cards, f)).convert('RGBA')
    im.save(os.path.join(out, 'cards', f.replace('.png', '.webp')), quality=90, method=6)

CW, CH = 168, 245
back = Image.new('RGBA', (CW * SS, CH * SS), (0, 0, 0, 0))
d = ImageDraw.Draw(back)
r = 7 * SS
d.rounded_rectangle((0, 0, CW * SS - 1, CH * SS - 1), r, fill=(250, 250, 248, 255))
m = 9 * SS
d.rounded_rectangle((m, m, CW * SS - m, CH * SS - m), r * 0.6, fill=(28, 42, 74, 255))
# Subtle diamond lattice.
step = 14 * SS
inner_box = (m, m, CW * SS - m, CH * SS - m)
lat = Image.new('RGBA', back.size, (0, 0, 0, 0))
ld = ImageDraw.Draw(lat)
for k in range(-CH * SS, CW * SS + CH * SS, step):
    ld.line([(k, 0), (k + CH * SS, CH * SS)], fill=(70, 92, 140, 255), width=SS)
    ld.line([(k, 0), (k - CH * SS, CH * SS)], fill=(70, 92, 140, 255), width=SS)
lmask = Image.new('L', back.size, 0)
ImageDraw.Draw(lmask).rounded_rectangle((m + 5 * SS, m + 5 * SS, CW * SS - m - 5 * SS, CH * SS - m - 5 * SS), r * 0.4, fill=120)
back.paste(lat, (0, 0), ImageChops.multiply(lmask, lat.getchannel('A')))
d.rounded_rectangle((m + 4 * SS, m + 4 * SS, CW * SS - m - 4 * SS, CH * SS - m - 4 * SS), r * 0.4, outline=(160, 140, 90, 255), width=SS)
back = back.resize((CW, CH), Image.LANCZOS)
back.save(os.path.join(out, 'cards', 'back.webp'), quality=90, method=6)

# 4. Portraits: centre crop, 192x192 JPEG.
for f in sorted(os.listdir(a.portraits)):
    if not f.lower().endswith(('.jpg', '.png')):
        continue
    im = Image.open(os.path.join(a.portraits, f)).convert('RGB')
    w, h = im.size
    s = int(min(w, h) * 0.82)
    left, top = (w - s) // 2, int((h - s) * 0.3)
    im = im.crop((left, top, left + s, top + s)).resize((192, 192), Image.LANCZOS)
    im.save(os.path.join(out, 'portraits', os.path.splitext(f)[0] + '.jpg'), quality=84, optimize=True)
print('ok', out)

#!/usr/bin/env python3
"""Told Straight — measure the approved card standard from the artwork.

Re-derives everything in brand/20260801-toldstraight-approved-card-standard.md
directly from episodes/ToldStraight-Ep01/cover.png. The standard is therefore
reproducible rather than asserted.

On 2026-07-27 the type shootout recorded the Ep01 faces as "unknown, and
unknowable from the PNGs" and eyeballed the type scale instead, because the
pixel-measurement script was refused by the lane guard. The guard was removed
with the governance consolidation (#94). This is that measurement.

    uv run --with pillow --no-project python <this file> [--identify] [--proof]

  (default)    geometry: palette, per-element ink boxes, rules
  --identify   fit the title/mono faces against every font on this machine
  --proof      render the card from the measured numbers and diff it

Reads font metrics only. No font data is copied, embedded, or committed.
"""

import argparse
import glob
import os
import sys
from collections import Counter

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("needs pillow:  uv run --with pillow --no-project python " + __file__)

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COVER = os.path.join(REPO, "episodes/ToldStraight-Ep01/cover.png")

PAL = {
    "paper": (237, 233, 224),
    "ink": (17, 17, 17),
    "red": (176, 42, 40),
    "grey": (120, 116, 108),
    "hair": (200, 196, 186),
}

TITLE_TTF = "/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf"
MONO_TTF = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"

# per-glyph ink-width / cap-height measured off the Ep01 title
TITLE_PROFILE = {
    "B": 0.667,
    "E": 0.605,
    "H": 0.639,
    "I": 0.163,
    "M": 0.769,
    "N": 0.633,
    "P": 0.612,
    "Q": 0.803,
    "R": 0.714,
    "S": 0.646,
    "T": 0.639,
    "U": 0.633,
}

ELEMENTS = [
    ("header_left", 62, 90, 380, 125, "FORM ADHD-01"),
    ("header_right", 880, 90, 1538, 125, "DEPT. OF NEURODEVELOPMENTAL AFFAIRS"),
    ("title_1", 140, 280, 1460, 450, "MEMBERSHIP"),
    ("title_2", 140, 455, 1460, 580, "HAS"),
    ("title_3", 140, 610, 1460, 770, "REQUIREMENTS"),
    ("subtitle", 140, 820, 1460, 870, "ADULT ADHD - TOLD STRAIGHT"),
    ("f1_key", 150, 930, 460, 970, "MEMBER:"),
    ("f2_key", 150, 1024, 460, 1060, "STATUS:"),
    ("f3_key", 150, 1114, 460, 1155, "ESTABLISHED:"),
    ("footer_1", 62, 1505, 300, 1532, "PODCAST"),
    # y stops at 1554: the frame's bottom rule starts at 1555 and would
    # otherwise be measured as ink and inflate this box.
    ("footer_2", 66, 1536, 520, 1554, "TOLD STRAIGHT / EP.01"),
]


def load(path):
    im = Image.open(path).convert("RGB")
    return im, im.load()


def is_dark(px, x, y, thr=170):
    r, g, b = px[x, y]
    return (r + g + b) / 3 < thr and not (abs(r - 176) < 45 and abs(g - 42) < 45)


def ink_box(px, x0, y0, x1, y1):
    xs, ys = [], []
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if is_dark(px, x, y):
                xs.append(x)
                ys.append(y)
    return (min(xs), min(ys), max(xs), max(ys)) if xs else None


def cap_font(path, cap_px, index=0):
    lo, hi = 4, 700
    for _ in range(28):
        mid = (lo + hi) / 2
        f = ImageFont.truetype(path, max(4, int(round(mid))), index=index)
        img = Image.new("L", (2200, 900), 255)
        ImageDraw.Draw(img).text((60, 60), "H", font=f, fill=0)
        bb = img.point(lambda p: 255 if p < 128 else 0).getbbox()
        c = (bb[3] - bb[1]) if bb else 0
        lo, hi = (mid, hi) if c < cap_px else (lo, mid)
    return ImageFont.truetype(path, int(round((lo + hi) / 2)), index=index)


def tracked_ink(font, text, track_em):
    tr = track_em / 1000.0 * font.size
    img = Image.new("L", (8000, 1200), 255)
    d = ImageDraw.Draw(img)
    x = 300.0
    for ch in text:
        d.text((x, 200), ch, font=font, fill=0)
        x += d.textlength(ch, font=font) + tr
    return img.point(lambda p: 255 if p < 128 else 0)


def fit_tracking(font, text, width_px):
    lo, hi = -400.0, 600.0
    for _ in range(34):
        mid = (lo + hi) / 2
        bb = tracked_ink(font, text, mid).getbbox()
        w = (bb[2] - bb[0]) if bb else 0
        lo, hi = (mid, hi) if w < width_px else (lo, mid)
    return round((lo + hi) / 2)


def geometry():
    im, px = load(COVER)
    W, H = im.size
    print(f"CANVAS {W}x{H}   source {os.path.relpath(COVER, REPO)}")

    cnt = Counter()
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            best = min(
                PAL, key=lambda k: sum((a - b) ** 2 for a, b in zip(px[x, y], PAL[k]))
            )
            cnt[best] += 1
    tot = sum(cnt.values())
    print("\nPALETTE")
    for k, v in cnt.most_common():
        print(f"  {k:6s} #{'%02X%02X%02X' % PAL[k]}  {100 * v / tot:5.2f}%")

    print(f"\n{'element':<14} {'ink box':<28} {'w':>5}{'cap':>5} {'pt':>6}{'track':>7}")
    print("-" * 74)
    for name, x0, y0, x1, y1, text in ELEMENTS:
        b = ink_box(px, x0, y0, x1, y1)
        if not b:
            print(f"{name:<14} NOT FOUND")
            continue
        bx0, by0, bx1, by1 = b
        w, h = bx1 - bx0 + 1, by1 - by0 + 1
        cap = 147 if name == "title_3" else h
        ttf = TITLE_TTF if name.startswith("title") else MONO_TTF
        f = cap_font(ttf, cap)
        tr = fit_tracking(f, text, w)
        print(
            f"{name:<14} x{bx0:4d}-{bx1:<4d} y{by0:4d}-{by1:<4d}  "
            f"{w:5d}{cap:5d} {f.size:5d}p{tr:+7d}"
        )

    red = [
        y
        for y in range(700, 820)
        if sum(
            1
            for x in range(62, W - 62)
            if abs(px[x, y][0] - 176) < 45 and abs(px[x, y][1] - 42) < 45
        )
        > 400
    ]
    if red:
        print(f"\nred rule   y {red[0]}-{red[-1]}  thickness {len(red)}")
    hair = [
        y
        for y in range(900, 1250)
        if sum(
            1
            for x in range(62, W - 62)
            if abs(px[x, y][0] - 200) < 22 and abs(px[x, y][1] - 196) < 22
        )
        > 600
    ]
    if hair:
        print("hairlines  y " + ", ".join(str(v) for v in hair))


def identify():
    """Fit every installed font against the measured per-glyph profile."""
    paths = glob.glob(
        os.path.expanduser(
            "~/Library/Application Support/Adobe/CoreSync/plugins/livetype/**/*.otf"
        ),
        recursive=True,
    )
    for d in (
        "/System/Library/Fonts",
        "/System/Library/Fonts/Supplemental",
        "/Library/Fonts",
        os.path.expanduser("~/Library/Fonts"),
    ):
        for e in ("otf", "ttf", "ttc"):
            paths += glob.glob(f"{d}/*.{e}")

    rows = []
    for p in paths:
        for idx in range(0, 12):
            try:
                f = ImageFont.truetype(p, 300, index=idx)
                nm = " / ".join(f.getname())
            except Exception:
                break

            def ink(t):
                img = Image.new("L", (1600, 700), 255)
                ImageDraw.Draw(img).text((80, 80), t, font=f, fill=0)
                return img.point(lambda q: 255 if q < 128 else 0).getbbox()

            try:
                cb = ink("H")
            except Exception:
                break
            if not cb or (cb[3] - cb[1]) < 50:
                break
            cap = cb[3] - cb[1]
            errs, ok = [], True
            for c, want in TITLE_PROFILE.items():
                bb = ink(c)
                if not bb:
                    ok = False
                    break
                errs.append(((bb[2] - bb[0]) / cap - want) ** 2)
            if ok:
                rows.append(((sum(errs) / len(errs)) ** 0.5, nm, os.path.basename(p)))
            if not p.endswith(".ttc"):
                break

    rows.sort()
    print(f"\nTITLE FACE — {len(rows)} faces tested, per-glyph RMS (lower is better)")
    print(f"{'RMS':>7}  {'face':<44} file")
    for r, nm, fn in rows[:10]:
        print(f"{r:7.4f}  {nm:<44} {fn}")
    print(
        "\nTracking cannot change a glyph's width, so this ratio identifies the\n"
        "FACE regardless of how the line was spaced."
    )


def proof():
    """Render from the measured numbers; report ink agreement."""
    im, px = load(COVER)
    W = H = 1600
    out = Image.new("RGB", (W, H), PAL["paper"])
    d = ImageDraw.Draw(out)

    def put(text, ttf, cap, track, colour, cap_top, left=None, centre=None):
        f = cap_font(ttf, cap)
        bw = tracked_ink(f, text, track)
        bb = bw.getbbox()
        if not bb:
            return
        iw = bb[2] - bb[0]
        ox = (left if left is not None else centre - iw / 2) - (bb[0] - 300.0)
        oy = cap_top - (bb[1] - 200.0)
        x = ox
        tr = track / 1000.0 * f.size
        for ch in text:
            d.text((x, oy), ch, font=f, fill=colour)
            x += d.textlength(ch, font=f) + tr

    d.rectangle([40, 40, W - 41, H - 41], outline=PAL["ink"], width=6)
    put("FORM ADHD-01", MONO_TTF, 21, 108, PAL["ink"], 96, left=71)
    put(
        "DEPT. OF NEURODEVELOPMENTAL AFFAIRS",
        MONO_TTF,
        18,
        0,
        PAL["grey"],
        99,
        left=900,
    )
    d.rectangle([62, 149, 1537, 151], fill=PAL["ink"])
    put("MEMBERSHIP", TITLE_TTF, 147, -13, PAL["ink"], 293, centre=801.5)
    put("HAS", TITLE_TTF, 111, -21, PAL["ink"], 463, centre=801.5)
    put("REQUIREMENTS", TITLE_TTF, 147, -12, PAL["ink"], 619, centre=802)
    d.rectangle([120, 776, 1480, 783], fill=PAL["red"])
    put("ADULT ADHD - TOLD STRAIGHT", MONO_TTF, 31, 142, PAL["ink"], 831, centre=801.5)
    for key, val, top, rule, vx in [
        ("MEMBER:", "[ YOU ]", 938, 985, 600),
        ("STATUS:", "DIAGNOSED - CONFIRMED", 1030, 1077, 590),
        ("ESTABLISHED:", "1775 (older than the U.S.)", 1122, 1169, 593),
    ]:
        put(key, MONO_TTF, 23, 22, PAL["grey"], top, left=160)
        put(val, MONO_TTF, 23, 22, PAL["ink"], top, left=vx)
        d.rectangle([160, rule, 1440, rule + 1], fill=PAL["hair"])
    put("PODCAST", MONO_TTF, 18, -3, PAL["grey"], 1511, left=72)
    put("TOLD STRAIGHT / EP.01", MONO_TTF, 18, 0, PAL["ink"], 1537, left=71)

    np_ = out.load()
    inter = union = 0
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            if x > 950 and y > 1230:  # rotated stamp: not modelled
                continue
            a = sum(px[x, y]) / 3 < 170
            b = sum(np_[x, y]) / 3 < 170
            union += 1 if (a or b) else 0
            inter += 1 if (a and b) else 0
    print(f"\nproof ink IoU vs the approved card (stamp excluded): {inter / union:.4f}")
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--identify", action="store_true")
    ap.add_argument("--proof", action="store_true")
    ap.add_argument("--save", metavar="PATH", help="write the proof render")
    a = ap.parse_args()
    if a.identify:
        identify()
    elif a.proof or a.save:
        img = proof()
        if a.save:
            img.save(a.save)
            print("wrote", a.save)
    else:
        geometry()

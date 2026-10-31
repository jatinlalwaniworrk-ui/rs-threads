"""Cut the logo files the site needs out of the stacked logo.

Source: assets-source/logo-full.png (red rose in a double circle, "Rose", "EMBROIDERY THREAD",
on white). Output goes to public/. Run again whenever the source logo changes:

    python3 scripts/make-logos.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-source" / "logo-full.png"
OUT = ROOT / "public"

RED = (219, 33, 41)   # #DB2129
INK = (30, 30, 29)    # #1E1E1D

# Circle of the round mark, measured on the 1080 x 1350 source.
CX, CY, R = 539.5, 516.5, 139


def knock_out_white(img):
    """White to transparent, keeping the exact brand red and ink on anti-aliased edges."""
    img = img.convert("RGB")
    out = Image.new("RGBA", img.size)
    src, dst = img.load(), out.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = src[x, y]
            if r - g > 40:  # red family: green channel carries the coverage
                a = (255 - g) / (255 - RED[1])
                colour = RED
            else:
                a = (255 - (r + g + b) / 3) / (255 - sum(INK) / 3)
                colour = INK
            a = max(0.0, min(1.0, a))
            dst[x, y] = (*colour, round(a * 255))
    return out


def trim(img, pad=0):
    box = img.getbbox()
    box = (max(box[0] - pad, 0), max(box[1] - pad, 0),
           min(box[2] + pad, img.width), min(box[3] + pad, img.height))
    return img.crop(box)


def only(img, keep):
    """Clear every pixel where keep(x, y) is False."""
    img = img.copy()
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            if not keep(x, y):
                px[x, y] = (0, 0, 0, 0)
    return img


def in_circle(x, y):
    return (x - CX) ** 2 + (y - CY) ** 2 <= R ** 2


def fit_height(img, h):
    return img.resize((round(img.width * h / img.height), h), Image.LANCZOS)


def on_white(img, size, scale):
    canvas = Image.new("RGB", size, "white")
    mark = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    canvas.paste(mark, ((size[0] - mark.width) // 2, (size[1] - mark.height) // 2), mark)
    return canvas


def save(img, name, webp=False):
    img.save(OUT / f"{name}.png", optimize=True)
    if webp:
        img.save(OUT / f"{name}.webp", quality=90, method=6)


def main():
    full = knock_out_white(Image.open(SRC))

    stacked = trim(full, pad=4)
    save(stacked, "logo")

    mark = trim(only(full, in_circle), pad=2)
    save(fit_height(mark, 144), "logo-mark", webp=True)

    # Horizontal lockup for the header: mark beside "Rose" over "EMBROIDERY THREAD".
    words = trim(only(full, lambda x, y: y > 600 and not in_circle(x, y)))
    gap = round(mark.height * 0.12)
    words_h = round(mark.height * 0.86)
    words = fit_height(words, words_h)
    lockup = Image.new("RGBA", (mark.width + gap + words.width, mark.height), (0, 0, 0, 0))
    lockup.paste(mark, (0, 0), mark)
    lockup.paste(words, (mark.width + gap, (mark.height - words_h) // 2), words)
    save(fit_height(lockup, 144), "logo-horizontal", webp=True)

    # Icons and share image: round mark on white.
    sq = max(mark.size)
    square = Image.new("RGBA", (sq, sq), (0, 0, 0, 0))
    square.paste(mark, ((sq - mark.width) // 2, (sq - mark.height) // 2), mark)
    square.resize((32, 32), Image.LANCZOS).save(OUT / "favicon-32.png", optimize=True)
    on_white(square, (180, 180), 160 / sq).save(OUT / "apple-touch-icon.png", optimize=True)
    on_white(square, (192, 192), 176 / sq).save(OUT / "icon-192.png", optimize=True)
    on_white(square, (512, 512), 468 / sq).save(OUT / "icon-512.png", optimize=True)
    on_white(square, (1200, 630), 500 / sq).save(OUT / "og-image.jpg", quality=88, optimize=True)


if __name__ == "__main__":
    main()

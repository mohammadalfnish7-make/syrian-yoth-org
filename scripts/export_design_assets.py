#!/usr/bin/env python3
"""Export design source files from عناصر/ to web-ready assets in public/."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = PROJECT_ROOT / "عناصر"
FONT_OUT = PROJECT_ROOT / "public" / "fonts"
IMAGE_OUT = PROJECT_ROOT / "public" / "images"
HERO_OUT = IMAGE_OUT / "hero"


def convert_fonts() -> list[Path]:
    from fontTools.ttLib import TTFont

    FONT_OUT.mkdir(parents=True, exist_ok=True)
    created: list[Path] = []

    for otf in sorted((SOURCE_DIR / "font").glob("*.otf")):
        woff2_path = FONT_OUT / otf.name.replace("itf", "").replace(".otf", ".woff2")
        font = TTFont(str(otf))
        font.flavor = "woff2"
        font.save(str(woff2_path))
        created.append(woff2_path)
        print(f"  Font: {woff2_path.name}")

    return created


def convert_logo() -> tuple[Path, Path]:
    import pymupdf

    logo_ai = SOURCE_DIR / "لوغو.ai"
    logo_png = IMAGE_OUT / "logo.png"
    favicon_png = PROJECT_ROOT / "public" / "favicon.png"

    IMAGE_OUT.mkdir(parents=True, exist_ok=True)

    doc = pymupdf.open(str(logo_ai))
    page = doc[0]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(4, 4), alpha=True)
    pix.save(str(logo_png))

    rect = page.rect
    side = min(rect.width, rect.height)
    x0 = rect.x0 + (rect.width - side) / 2
    y0 = rect.y0 + (rect.height - side) / 2
    clip = pymupdf.Rect(x0, y0, x0 + side, y0 + side)
    fav_pix = page.get_pixmap(
        matrix=pymupdf.Matrix(128 / side, 128 / side), clip=clip, alpha=True
    )
    fav_pix.save(str(favicon_png))
    doc.close()

    print(f"  Logo: {logo_png.name}")
    print(f"  Favicon: {favicon_png.name}")
    return logo_png, favicon_png


def convert_psds(max_width: int = 1920, quality: int = 85) -> list[Path]:
    from psd_tools import PSDImage

    HERO_OUT.mkdir(parents=True, exist_ok=True)
    created: list[Path] = []

    psd_map = {
        "جلسة رمضانية حوارية.psd": "ramadan-session.webp",
        "ملتقى شباب حمص.psd": "homs-youth.webp",
    }

    for src_name, dst_name in psd_map.items():
        src = SOURCE_DIR / src_name
        dst = HERO_OUT / dst_name
        if not src.exists():
            print(f"  Skipping missing PSD: {src_name}", file=sys.stderr)
            continue

        psd = PSDImage.open(str(src))
        img = psd.composite()
        if img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)))

        img.save(str(dst), "WEBP", quality=quality)
        created.append(dst)
        print(f"  PSD: {src_name} -> {dst_name} ({img.size})")

    return created


def main() -> int:
    parser = argparse.ArgumentParser(description="Export عناصر design files to web assets")
    parser.add_argument("--fonts-only", action="store_true")
    parser.add_argument("--logo-only", action="store_true")
    parser.add_argument("--psd-only", action="store_true")
    parser.add_argument("--max-width", type=int, default=1920)
    parser.add_argument("--quality", type=int, default=85)
    args = parser.parse_args()

    run_all = not (args.fonts_only or args.logo_only or args.psd_only)

    if not SOURCE_DIR.exists():
        print(f"Source directory not found: {SOURCE_DIR}", file=sys.stderr)
        return 1

    print("Exporting design assets...")

    if run_all or args.fonts_only:
        print("\nFonts:")
        convert_fonts()

    if run_all or args.logo_only:
        print("\nLogo:")
        convert_logo()

    if run_all or args.psd_only:
        print("\nPSD posters:")
        convert_psds(max_width=args.max_width, quality=args.quality)

    print("\nDone!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

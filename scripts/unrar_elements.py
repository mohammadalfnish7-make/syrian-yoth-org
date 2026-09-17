#!/usr/bin/env python3
"""Extract عناصر.rar to the project root.

Uses bsdtar (macOS built-in) for RAR v5 archives. Falls back to rarfile if needed.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_RAR = os.path.join(PROJECT_ROOT, "عناصر.rar")
DEFAULT_OUTPUT = PROJECT_ROOT


def find_tool(name: str, *candidates: str) -> str | None:
    for candidate in (*candidates, name):
        path = shutil.which(candidate)
        if path:
            return path
    return None


def extract_with_bsdtar(rar_path: str, output_dir: str) -> None:
    bsdtar = find_tool("bsdtar", "/usr/bin/bsdtar")
    if not bsdtar:
        raise RuntimeError("bsdtar not found")

    result = subprocess.run(
        [bsdtar, "-xf", rar_path, "-C", output_dir],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "bsdtar extraction failed")


def extract_with_rarfile(rar_path: str, output_dir: str) -> list[str]:
    import rarfile

    unrar = find_tool("unrar", "/opt/homebrew/bin/unrar", "/usr/local/bin/unrar")
    if not unrar:
        raise RuntimeError("unrar not found. Install it with: brew install unrar")

    rarfile.UNRAR_TOOL = unrar
    with rarfile.RarFile(rar_path) as archive:
        archive.extractall(path=output_dir)
        return [info.filename for info in archive.infolist() if not info.is_dir()]


def list_extracted_files(output_dir: str, prefix: str = "عناصر") -> list[tuple[str, int]]:
    root = os.path.join(output_dir, prefix)
    if not os.path.isdir(root):
        return []

    files: list[tuple[str, int]] = []
    for dirpath, _, filenames in os.walk(root):
        for filename in filenames:
            full_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(full_path, output_dir)
            files.append((rel_path, os.path.getsize(full_path)))
    return sorted(files)


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract عناصر.rar")
    parser.add_argument("--rar", default=DEFAULT_RAR, help="Path to the .rar file")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Extraction directory")
    parser.add_argument(
        "--method",
        choices=("bsdtar", "rarfile", "auto"),
        default="auto",
        help="Extraction backend (default: auto, prefers bsdtar for RAR v5)",
    )
    args = parser.parse_args()

    if not os.path.isfile(args.rar):
        print(f"RAR file not found: {args.rar}", file=sys.stderr)
        return 1

    os.makedirs(args.output, exist_ok=True)

    method = args.method
    if method == "auto":
        method = "bsdtar" if find_tool("bsdtar", "/usr/bin/bsdtar") else "rarfile"

    try:
        if method == "bsdtar":
            extract_with_bsdtar(args.rar, args.output)
        else:
            extract_with_rarfile(args.rar, args.output)
    except Exception as exc:
        print(f"Extraction failed ({method}): {exc}", file=sys.stderr)
        if method == "auto" or args.method != "auto":
            return 1
        return 1

    files = list_extracted_files(args.output)
    print(f"Extracted {len(files)} file(s) to {args.output} using {method}:")
    for path, size in files:
        print(f"  {path} ({size:,} bytes)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""
Render a social-post HTML file to a PNG at exact pixel dimensions using
headless Chrome, then verify the output size actually matches.

Why --virtual-time-budget matters: without it Chrome screenshots on the load
event, before Google Fonts finish loading. With `font-display: block` the text
renders INVISIBLE (the brand headline silently vanishes from the PNG); with
`swap` it falls back to a system font. Both look like a finished image at a
glance. The budget lets network fonts finish before capture. (A Playwright-based
engine can do better with `document.fonts.ready`; this script stays dependency-free
on the plain Chrome CLI, where a time budget is the only lever.)

--scale renders at N x the CSS size (e.g. 2x -> 2160x2700 for a 1080x1350 slide).
Instagram recompresses every upload; a 2x source survives that noticeably crisper.
Keep 1x where the platform caps file size (YouTube thumbnails < 2 MB).

Usage:
  python render_post.py <input.html> <output.png> --size 1080x1350 [--scale 2]
  python render_post.py slide1.html slide2.html --out-dir out/ --size 1080x1350
"""

import argparse
import shutil
import struct
import subprocess
import sys
from pathlib import Path

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
]

DEFAULT_FONT_BUDGET_MS = 8000
ALLOWED_SCALES = (1, 2, 3)


def find_chrome():
    for candidate in CHROME_CANDIDATES:
        if Path(candidate).exists():
            return candidate
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return None


def parse_size(size):
    try:
        width, height = size.lower().split("x")
        return int(width), int(height)
    except ValueError:
        raise argparse.ArgumentTypeError(f"--size must look like 1080x1350, got '{size}'")


def png_dimensions(path):
    with open(path, "rb") as f:
        header = f.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG file")
    return struct.unpack(">II", header[16:24])


def build_command(chrome, html_path, png_path, width, height, budget_ms, scale=1):
    return [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--force-device-scale-factor={scale}",
        f"--virtual-time-budget={budget_ms}",
        f"--window-size={width},{height}",
        f"--screenshot={Path(png_path).resolve()}",
        Path(html_path).resolve().as_uri(),
    ]


def expected_dimensions(width, height, scale):
    return width * scale, height * scale


def render(chrome, html_path, png_path, width, height, budget_ms, scale=1):
    cmd = build_command(chrome, html_path, png_path, width, height, budget_ms, scale)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0 or not Path(png_path).exists():
        raise RuntimeError(
            f"Chrome failed to render {html_path} (exit {result.returncode}): {result.stderr.strip()[:500]}"
        )

    actual = png_dimensions(png_path)
    expected = expected_dimensions(width, height, scale)
    if actual != expected:
        raise RuntimeError(
            f"{png_path} rendered at {actual[0]}x{actual[1]}, expected {expected[0]}x{expected[1]} "
            f"({width}x{height} at {scale}x). Check the template's html/body width & height match --size."
        )
    return actual


def plan_jobs(inputs, out_dir=None):
    """Map input HTML files to output PNG paths.

    A single HTML followed by a .png path renders to that exact path; otherwise
    every input renders into out_dir (default: current dir) named after itself.
    """
    if not out_dir and len(inputs) == 2 and inputs[1].lower().endswith(".png"):
        return [(inputs[0], Path(inputs[1]))]
    target = Path(out_dir or ".")
    return [(html, target / f"{Path(html).stem}.png") for html in inputs]


def main():
    parser = argparse.ArgumentParser(description="Render social-post HTML to exact-size PNG")
    parser.add_argument("inputs", nargs="+", help="HTML file(s); with a single input, optionally followed by output.png")
    parser.add_argument("--size", required=True, type=parse_size, help="e.g. 1080x1350")
    parser.add_argument("--out-dir", help="Directory for PNGs when rendering several files (named after each HTML file)")
    parser.add_argument("--font-budget-ms", type=int, default=DEFAULT_FONT_BUDGET_MS,
                        help="Time allowed for web fonts/images to load before capture (default 8000)")
    parser.add_argument("--scale", type=int, default=1, choices=ALLOWED_SCALES,
                        help="Pixel density: 2 recommended for Instagram feed/carousel, 1 where file size is capped")
    args = parser.parse_args()

    chrome = find_chrome()
    if not chrome:
        print("Error: Google Chrome/Chromium not found. Install Chrome, or use 'ide saja' mode instead.",
              file=sys.stderr)
        sys.exit(1)

    width, height = args.size
    jobs = plan_jobs(args.inputs, args.out_dir)
    for _, png in jobs:
        png.parent.mkdir(parents=True, exist_ok=True)

    failures = 0
    for html, png in jobs:
        if not Path(html).exists():
            print(f"FAIL {html}: file not found", file=sys.stderr)
            failures += 1
            continue
        try:
            w, h = render(chrome, html, png, width, height, args.font_budget_ms, args.scale)
            print(f"OK   {png}  ({w}x{h})")
        except (RuntimeError, ValueError, subprocess.TimeoutExpired) as exc:
            print(f"FAIL {html}: {exc}", file=sys.stderr)
            failures += 1

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()

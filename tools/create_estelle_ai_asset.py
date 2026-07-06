from __future__ import annotations

import argparse
import base64
import shutil
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def load_rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"))


def remove_checker_background(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    mx = rgb.max(axis=2).astype(np.int16)
    mn = rgb.min(axis=2).astype(np.int16)
    chroma = mx - mn

    # The source checkerboard is baked into the image as near-neutral light gray.
    # Flood filling from the canvas edges avoids eating pale clothing inside the figure.
    bg_candidate = (mn >= 232) & (chroma <= 9)
    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def push(y: int, x: int) -> None:
        if bg_candidate[y, x] and not visited[y, x]:
            visited[y, x] = True
            q.append((y, x))

    for x in range(w):
        push(0, x)
        push(h - 1, x)
    for y in range(h):
        push(y, 0)
        push(y, w - 1)

    while q:
        y, x = q.popleft()
        ny = y - 1
        if ny >= 0:
            push(ny, x)
        ny = y + 1
        if ny < h:
            push(ny, x)
        nx = x - 1
        if nx >= 0:
            push(y, nx)
        nx = x + 1
        if nx < w:
            push(y, nx)

    yy, xx = np.mgrid[0:h, 0:w]
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    red_hair_seed = (r > 70) & (r > g + 22) & (r > b + 8)
    protected_face = (((xx - 512) / 74) ** 2 + ((yy - 220) / 128) ** 2) < 1
    protected_face |= ((xx > 472) & (xx < 552) & (yy > 155) & (yy < 278))
    hair_region = (yy < 850) & (((xx < 492) | (xx > 532)) | (yy < 190))
    hair_seed = red_hair_seed & hair_region & ~protected_face
    near_hair = np.asarray(
        Image.fromarray(np.where(hair_seed, 255, 0).astype(np.uint8), "L").filter(
            ImageFilter.MaxFilter(101)
        )
    ) > 0
    top_head_holes = bg_candidate & (yy < 380) & (xx > 315) & (xx < 720) & ~protected_face
    hair_background_holes = (bg_candidate & near_hair & hair_region & ~protected_face) | top_head_holes

    alpha = np.where(visited | hair_background_holes, 0, 255).astype(np.uint8)

    # Remove the pale checker fringe completely; otherwise it shows as a white halo on dark backgrounds.
    fg = alpha > 0
    edge = np.zeros_like(fg)
    edge[1:, :] |= fg[1:, :] & ~fg[:-1, :]
    edge[:-1, :] |= fg[:-1, :] & ~fg[1:, :]
    edge[:, 1:] |= fg[:, 1:] & ~fg[:, :-1]
    edge[:, :-1] |= fg[:, :-1] & ~fg[:, 1:]
    alpha[edge & bg_candidate] = 0

    rgba = np.dstack([rgb, alpha])
    return rgba


def save_clean_png(rgba: np.ndarray, path: Path) -> None:
    Image.fromarray(rgba, "RGBA").save(path)


def save_black_background_png(rgba: np.ndarray, path: Path) -> None:
    alpha = rgba[:, :, 3:4].astype(np.float32) / 255.0
    composited = (rgba[:, :, :3].astype(np.float32) * alpha).astype(np.uint8)
    Image.fromarray(composited, "RGB").save(path)


def make_masks(rgba: np.ndarray) -> dict[str, np.ndarray]:
    rgb = rgba[:, :, :3].astype(np.int16)
    alpha = rgba[:, :, 3] > 0
    h, w, _ = rgba.shape
    yy, xx = np.mgrid[0:h, 0:w]

    r = rgb[:, :, 0]
    g = rgb[:, :, 1]
    b = rgb[:, :, 2]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    chroma = mx - mn
    bright = mx

    redish = alpha & (r > 70) & (r > g + 22) & (r > b + 8)
    hair_zone = (yy < 640) | (((xx < 360) | (xx > 665)) & (yy < 1210))
    costume_zone = yy >= 360

    skin_regions = (
        ((xx > 400) & (xx < 625) & (yy > 80) & (yy < 365))
        | ((xx > 310) & (xx < 575) & (yy > 245) & (yy < 500))
        | ((xx > 640) & (xx < 825) & (yy > 720) & (yy < 1195))
        | ((xx > 425) & (xx < 585) & (yy > 1330) & (yy < 1530))
    )
    skin_color = (r > 168) & (g > 112) & (b > 105) & (r > g + 8) & (g >= b - 12)

    gold = alpha & (r > 100) & (g > 62) & (b < 115) & (r >= g - 8) & (g > b + 15) & (chroma > 38)
    skin = alpha & skin_regions & skin_color & ~gold
    hair = redish & hair_zone & ~skin & ~gold
    burgundy = redish & costume_zone & ~hair & ~skin & ~gold
    dark = alpha & (bright < 92) & (yy > 300) & ~hair
    pale_costume = alpha & (bright > 145) & (chroma < 105) & (yy > 330) & ~skin

    face_zone = (xx > 390) & (xx < 630) & (yy > 115) & (yy < 315)
    eyes_mouth = alpha & face_zone & ((bright < 128) | ((r > 120) & (r > g + 25) & (yy > 170)))
    lineart = alpha & ((bright < 63) | ((bright < 95) & (chroma > 35)))
    highlights = alpha & (bright > 200) & (r > g + 10) & (r > b + 8) & ((yy < 700) | costume_zone)

    silhouette = alpha
    return {
        "Silhouette_Base": silhouette,
        "Hair_Back": hair & ((xx < 465) | (xx > 575) | (yy > 260)),
        "Hair_Front": hair & (xx >= 365) & (xx <= 680) & (yy < 720),
        "Hair_Highlights": highlights & hair_zone,
        "Skin": skin,
        "Eyes_Mouth": eyes_mouth,
        "Blouse_Inner_Skirt": pale_costume,
        "Corset": burgundy & (xx > 355) & (xx < 685) & (yy > 360) & (yy < 805),
        "Burgundy_Drape": burgundy,
        "Dark_Skirt_Lace": dark,
        "Gold_Ornaments": gold,
        "Lineart": lineart,
    }


LAYER_STYLES = {
    "Silhouette_Base": ("#f2d8ce", 0.26),
    "Hair_Back": ("#7b1027", 0.78),
    "Hair_Front": ("#a01631", 0.82),
    "Hair_Highlights": ("#d64b5e", 0.45),
    "Skin": ("#f4cfc8", 0.76),
    "Eyes_Mouth": ("#5c0d1b", 0.86),
    "Blouse_Inner_Skirt": ("#f1d4c8", 0.62),
    "Corset": ("#5e0d17", 0.82),
    "Burgundy_Drape": ("#8f1724", 0.72),
    "Dark_Skirt_Lace": ("#231922", 0.62),
    "Gold_Ornaments": ("#c69347", 0.82),
    "Lineart": ("#241018", 0.66),
}


def rle_paths(mask: np.ndarray, scale_x: float, scale_y: float, max_rects: int = 1200) -> list[str]:
    paths: list[str] = []
    current: list[str] = []
    rects = 0
    h, w = mask.shape
    for y in range(h):
        row = mask[y]
        x = 0
        while x < w:
            if not row[x]:
                x += 1
                continue
            x0 = x
            while x < w and row[x]:
                x += 1
            x1 = x
            px0 = x0 * scale_x
            px1 = x1 * scale_x
            py0 = y * scale_y
            py1 = (y + 1) * scale_y
            current.append(f"M{px0:.2f},{py0:.2f}H{px1:.2f}V{py1:.2f}H{px0:.2f}Z")
            rects += 1
            if rects >= max_rects:
                paths.append("".join(current))
                current = []
                rects = 0
    if current:
        paths.append("".join(current))
    return paths


def downsample_mask(mask: np.ndarray, width: int) -> np.ndarray:
    h, w = mask.shape
    height = round(h * width / w)
    img = Image.fromarray(np.where(mask, 255, 0).astype(np.uint8), "L")
    img = img.resize((width, height), Image.Resampling.BILINEAR)
    return np.asarray(img) > 112


def svg_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def write_svg(rgba: np.ndarray, masks: dict[str, np.ndarray], clean_png: Path, out_svg: Path) -> None:
    h, w, _ = rgba.shape
    vector_w = 512
    vector_h = round(h * vector_w / w)
    scale_x = w / vector_w
    scale_y = h / vector_h
    png_b64 = base64.b64encode(clean_png.read_bytes()).decode("ascii")

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" version="1.1">',
        "<title>Estelle Character Illustrator Hybrid Asset</title>",
        "<desc>Editable SVG groups plus a cleaned raster texture reference. Open in Illustrator and save as AI for native editing.</desc>",
        '<g id="Character">',
    ]

    for layer_name in LAYER_STYLES:
        fill, opacity = LAYER_STYLES[layer_name]
        small = downsample_mask(masks[layer_name], vector_w)
        paths = rle_paths(small, scale_x, scale_y)
        lines.append(f'  <g id="{svg_escape(layer_name)}" fill="{fill}" opacity="{opacity:.2f}">')
        for i, d in enumerate(paths, 1):
            lines.append(f'    <path id="{svg_escape(layer_name)}_{i:03d}" d="{d}"/>')
        lines.append("  </g>")

    lines.extend(
        [
            '  <g id="Reference_Raster_Texture" opacity="0.94">',
            f'    <image id="Cleaned_Original_Texture" x="0" y="0" width="{w}" height="{h}" href="data:image/png;base64,{png_b64}"/>',
            "  </g>",
            "</g>",
            "</svg>",
        ]
    )
    out_svg.write_text("\n".join(lines), encoding="utf-8")


def write_pdf_ai(clean_png: Path, out_pdf: Path, out_ai: Path, width: int, height: int) -> None:
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas

    c = canvas.Canvas(str(out_pdf), pagesize=(width, height), pageCompression=1)
    c.setTitle("Estelle Character Hybrid Illustrator Asset")
    c.drawImage(ImageReader(str(clean_png)), 0, 0, width=width, height=height, mask="auto")
    c.showPage()
    c.save()
    shutil.copyfile(out_pdf, out_ai)


def write_readme(out_dir: Path) -> None:
    text = """Estelle Illustrator hybrid asset

Files:
- Estelle_character_vector_hybrid.svg: main editable Illustrator import file with named groups.
- Estelle_character_hybrid.ai: PDF-compatible Illustrator-openable file.
- Estelle_character_hybrid.pdf: same PDF-compatible artwork for fallback import.
- Estelle_character_clean.png: checkerboard-removed texture reference.
- Estelle_character_black_bg.png: black-background QA preview for checking leftover pale pixels.

Recommended workflow:
1. Open Estelle_character_vector_hybrid.svg in Adobe Illustrator.
2. Use the named groups under Character for color edits and part selection.
3. Keep or hide Reference_Raster_Texture depending on whether you want original texture detail.
4. Save as a native .ai file from Illustrator.

Note:
This is a hybrid production asset generated without Adobe Illustrator installed. The SVG contains real vector paths grouped by character parts; the raster texture preserves the original fine lace, hair, and ornament detail.
"""
    (out_dir / "README.txt").write_text(text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    rgb = load_rgb(args.input)
    rgba = remove_checker_background(rgb)
    clean_png = args.output_dir / "Estelle_character_clean.png"
    save_clean_png(rgba, clean_png)
    save_black_background_png(rgba, args.output_dir / "Estelle_character_black_bg.png")
    masks = make_masks(rgba)
    write_svg(rgba, masks, clean_png, args.output_dir / "Estelle_character_vector_hybrid.svg")
    write_pdf_ai(
        clean_png,
        args.output_dir / "Estelle_character_hybrid.pdf",
        args.output_dir / "Estelle_character_hybrid.ai",
        rgba.shape[1],
        rgba.shape[0],
    )
    write_readme(args.output_dir)


if __name__ == "__main__":
    main()

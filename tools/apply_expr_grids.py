from __future__ import annotations

import shutil
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


WORKSPACE = Path(__file__).resolve().parents[1]
SOURCE_ROOT = Path(r"C:\Users\a\Desktop\1")
DEST_ROOT = WORKSPACE / "public" / "char"
BACKUP_ROOT = DEST_ROOT / "backup" / "20260706_expr_grid"
TARGET_WIDTH = 540

CHARACTER_SOURCES = {
    "001": "estelle",
    "002": "rozelin",
    "003": "rayner",
    "004": "eden",
    "005": "michael",
    "006": "adele",
    "007": "valen",
    "008": "isolde",
}

GRID_EXPRESSIONS = [
    ["neutral", "soft", "happy", "laugh"],
    ["shy", "serious", "determined", "surprised"],
    ["sad", "distressed", "tearful", "angry"],
    ["smirk", "scheme", "embarrassed", "cold"],
]

# Keep old scenario calls to "greet" working while adding the new neutral pose.
ALIASES = {"neutral": ["greet"]}
DARK_OUTFIT_CHARS = {"eden", "rayner", "rozelin", "valen"}
ORIGINAL_BACKUP_CHARS = {"estelle", "rozelin", "valen"}


def binary_dilate(mask: np.ndarray, iterations: int = 1) -> np.ndarray:
    out = mask.copy()
    for _ in range(iterations):
        p = np.pad(out, 1, mode="constant", constant_values=False)
        out = (
            p[:-2, :-2] | p[:-2, 1:-1] | p[:-2, 2:]
            | p[1:-1, :-2] | p[1:-1, 1:-1] | p[1:-1, 2:]
            | p[2:, :-2] | p[2:, 1:-1] | p[2:, 2:]
        )
    return out


def connected_component(mask: np.ndarray, seed_edges: tuple[str, ...] = ("top", "left", "right")) -> np.ndarray:
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def add(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and mask[y, x] and not seen[y, x]:
            seen[y, x] = True
            queue.append((y, x))

    if "top" in seed_edges:
        for x in range(w):
            add(0, x)
    if "bottom" in seed_edges:
        for x in range(w):
            add(h - 1, x)
    if "left" in seed_edges:
        for y in range(h):
            add(y, 0)
    if "right" in seed_edges:
        for y in range(h):
            add(y, w - 1)

    while queue:
        y, x = queue.popleft()
        add(y - 1, x)
        add(y + 1, x)
        add(y, x - 1)
        add(y, x + 1)

    return seen


def central_component(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=bool)
    best: list[tuple[int, int]] = []
    best_score = -1.0
    target_x = w / 2

    for start_y, start_x in zip(*np.nonzero(mask & ~seen)):
        pixels: list[tuple[int, int]] = []
        queue: deque[tuple[int, int]] = deque([(int(start_y), int(start_x))])
        seen[start_y, start_x] = True
        while queue:
            y, x = queue.popleft()
            pixels.append((y, x))
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))

        if len(pixels) < 32:
            continue
        xs = np.fromiter((x for _, x in pixels), dtype=np.float32)
        cx = float(xs.mean())
        score = len(pixels) - abs(cx - target_x) * 20
        if score > best_score:
            best_score = score
            best = pixels

    out = np.zeros_like(mask)
    for y, x in best:
        out[y, x] = True
    return out


def row_envelope(mask: np.ndarray, pad: int) -> np.ndarray:
    h, w = mask.shape
    lo = np.full(h, np.nan)
    hi = np.full(h, np.nan)
    x_grid = np.broadcast_to(np.arange(w), (h, w))
    for y in range(h):
        xs = np.flatnonzero(mask[y])
        if xs.size:
            lo[y] = xs.min()
            hi[y] = xs.max()

    valid = np.flatnonzero(~np.isnan(lo))
    out = np.zeros((h, w), dtype=bool)
    if not valid.size:
        return out

    rows = np.arange(h)
    lo_i = np.interp(rows, valid, lo[valid])
    hi_i = np.interp(rows, valid, hi[valid])
    y_min = int(valid.min())
    y_max = int(valid.max())
    for y in range(y_min, y_max + 1):
        y0 = max(y_min, y - 7)
        y1 = min(y_max + 1, y + 8)
        left = max(0, int(np.floor(np.nanmin(lo_i[y0:y1]))) - pad)
        right = min(w - 1, int(np.ceil(np.nanmax(hi_i[y0:y1]))) + pad)
        out[y] = (x_grid[y] >= left) & (x_grid[y] <= right)
    return out


def remove_black_background(img: Image.Image, preserve_dark_outfit: bool = False) -> Image.Image:
    arr = np.array(img.convert("RGBA"))
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    max_rgb = rgb.max(axis=2)
    min_rgb = rgb.min(axis=2)
    chroma = max_rgb - min_rgb
    valid = alpha > 0

    bright_frame = valid & (min_rgb >= 222) & (chroma <= 48)
    white_frame = connected_component(bright_frame, ("top", "bottom", "left", "right"))

    line_frame = np.zeros_like(white_frame)

    if preserve_dark_outfit:
        edge_black = valid & (max_rgb <= 6) & (chroma <= 6)
        pure_black = np.zeros_like(edge_black)
    else:
        edge_black = valid & (max_rgb <= 34) & (chroma <= 18)
        pure_black = valid & (max_rgb <= 8) & (chroma <= 8)
    black_bg = connected_component(edge_black, ("top", "bottom", "left", "right"))

    remove = white_frame | line_frame | black_bg | pure_black
    alpha[remove] = 0
    alpha[alpha < 8] = 0
    arr[:, :, 3] = alpha

    out = Image.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    if bbox:
        top = max(0, bbox[1] - 2)
        bottom = min(out.height, bbox[3] + 2)
        out = out.crop((0, top, out.width, bottom))
    return out


def paste_with_alpha(dst: Image.Image, src: Image.Image, xy: tuple[int, int]) -> None:
    dst.alpha_composite(src, xy)


def extend_to_target_width(img: Image.Image, width: int = TARGET_WIDTH) -> Image.Image:
    src = img.convert("RGBA")
    if src.width > width:
        left = max(0, (src.width - width) // 2)
        src = src.crop((left, 0, left + width, src.height))

    out = Image.new("RGBA", (width, src.height), (0, 0, 0, 0))
    x = (width - src.width) // 2

    paste_with_alpha(out, src, (x, 0))

    # Add only a narrow softened continuation where the sprite reaches the side.
    # Wide mirroring creates duplicate bodies, while single-column stretching creates streaks.
    for side in ("left", "right"):
        max_len = x if side == "left" else width - x - src.width
        if max_len <= 0:
            continue
        strip_w = min(max_len, 32, max(1, src.width // 10))
        if side == "left":
            strip = src.crop((0, 0, strip_w, src.height)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            pos = (x - strip_w, 0)
        else:
            strip = src.crop((src.width - strip_w, 0, src.width, src.height)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            pos = (x + src.width, 0)

        arr = np.array(strip)
        fade = np.linspace(0.18, 0.75, strip_w, dtype=np.float32)
        if side == "right":
            fade = fade[::-1]
        arr[:, :, 3] = np.clip(arr[:, :, 3].astype(np.float32) * fade[None, :], 0, 255).astype(np.uint8)
        paste_with_alpha(out, Image.fromarray(arr, "RGBA"), pos)
    return out


def grid_files(folder: Path) -> list[Path]:
    c_files = [folder / f"c{i}.png" for i in range(1, 5)]
    if all(path.exists() for path in c_files):
        return c_files

    expr_files: list[Path] = []
    for i in range(1, 5):
        matches = sorted(folder.glob(f"*_expr_grid_{i:02d}.png"))
        if not matches:
            raise FileNotFoundError(f"Missing grid {i:02d} in {folder}")
        expr_files.append(matches[0])
    return expr_files


def backup_existing(char_id: str) -> None:
    char_dir = DEST_ROOT / char_id
    if char_id not in ORIGINAL_BACKUP_CHARS:
        char_dir.mkdir(parents=True, exist_ok=True)
        return

    existing = sorted(char_dir.glob("*.png"))
    if not existing:
        char_dir.mkdir(parents=True, exist_ok=True)
        return

    backup_dir = BACKUP_ROOT / char_id
    if backup_dir.exists() and any(backup_dir.iterdir()):
        print(f"backup exists, keeping current backup: {backup_dir}")
        return

    backup_dir.mkdir(parents=True, exist_ok=True)
    for path in existing:
        shutil.move(str(path), str(backup_dir / path.name))
    print(f"backed up {char_id}: {len(existing)} files")


def hair_style_refs(path: Path) -> list[Image.Image]:
    if not path.exists():
        return []

    img = Image.open(path).convert("RGBA")
    w, h = img.size
    cw = w / 4
    margin_x = max(10, round(min(w / 4, h) * 0.02))
    margin_y = max(14, round(min(w / 4, h) * 0.025))
    refs: list[Image.Image] = []
    for col in range(4):
        x0 = round(cw * col) + margin_x
        x1 = round(cw * (col + 1)) - margin_x
        refs.append(img.crop((x0, margin_y, x1, h - margin_y)))
    return refs


def apply_eden_hair_style(img: Image.Image, ref: Image.Image) -> Image.Image:
    base = img.convert("RGBA")
    ref = ref.convert("RGBA").resize(base.size, Image.Resampling.LANCZOS)
    arr = np.array(ref)
    rgb = arr[:, :, :3].astype(np.int16)
    alpha = arr[:, :, 3]
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    max_rgb = rgb.max(axis=2)
    min_rgb = rgb.min(axis=2)
    chroma = max_rgb - min_rgb
    h, w = alpha.shape
    yy, xx = np.mgrid[:h, :w]

    hair_color = (
        (alpha > 0)
        & (max_rgb > 25)
        & (max_rgb < 210)
        & (chroma > 12)
        & (r >= b + 6)
        & (g >= b - 8)
    )
    hair_zone = (
        (yy < h * 0.22)
        | ((yy < h * 0.34) & ((xx < w * 0.43) | (xx > w * 0.57)))
        | ((yy < h * 0.48) & ((xx < w * 0.25) | (xx > w * 0.72)))
    )
    mask = binary_dilate(hair_color & hair_zone, 1)

    overlay = arr.copy()
    overlay[:, :, 3] = np.where(mask, alpha, 0).astype(np.uint8)
    out = base.copy()
    out.alpha_composite(Image.fromarray(overlay, "RGBA"))
    return out


def split_grid(
    path: Path,
    preserve_dark_outfit: bool = False,
    hair_refs: list[Image.Image] | None = None,
) -> list[Image.Image]:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    cw = w / 4
    cells: list[Image.Image] = []
    margin_x = max(10, round(min(w / 4, h) * 0.02))
    margin_y = max(14, round(min(w / 4, h) * 0.025))
    for col in range(4):
        x0 = round(cw * col) + margin_x
        x1 = round(cw * (col + 1)) - margin_x
        crop = img.crop((x0, margin_y, x1, h - margin_y))
        cleaned = remove_black_background(crop, preserve_dark_outfit)
        if hair_refs:
            cleaned = apply_eden_hair_style(cleaned, hair_refs[col % len(hair_refs)])
            cleaned = remove_black_background(cleaned, preserve_dark_outfit)
        cells.append(cleaned)
    return cells


def save_expression(char_id: str, emotion: str, image: Image.Image) -> None:
    char_dir = DEST_ROOT / char_id
    char_dir.mkdir(parents=True, exist_ok=True)
    for name in [emotion, *ALIASES.get(emotion, [])]:
        for out_path in (char_dir / f"{name}.png", char_dir / f"bust_{name}.png"):
            tmp_path = out_path.with_suffix(out_path.suffix + ".tmp")
            with tmp_path.open("wb") as file:
                image.save(file, format="PNG")
            tmp_path.replace(out_path)


def main() -> None:
    for folder_name, char_id in CHARACTER_SOURCES.items():
        source_dir = SOURCE_ROOT / folder_name
        backup_existing(char_id)
        files = grid_files(source_dir)
        hair_refs = hair_style_refs(source_dir / "eden.png") if char_id == "eden" else None
        written = 0
        for grid_index, path in enumerate(files):
            cells = split_grid(path, char_id in DARK_OUTFIT_CHARS, hair_refs)
            for emotion, image in zip(GRID_EXPRESSIONS[grid_index], cells):
                save_expression(char_id, emotion, image)
                written += 2 + (2 * len(ALIASES.get(emotion, [])))
        print(f"processed {folder_name} -> {char_id}: {written} files")


if __name__ == "__main__":
    main()

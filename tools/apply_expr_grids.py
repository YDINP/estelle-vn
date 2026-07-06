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
DARK_OUTFIT_CHARS = {"rayner", "valen"}
ORIGINAL_BACKUP_CHARS = {"estelle", "rozelin", "valen"}


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


def remove_black_background(img: Image.Image, preserve_dark_outfit: bool = False) -> Image.Image:
    arr = np.array(img.convert("RGBA"))
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    max_rgb = rgb.max(axis=2)
    min_rgb = rgb.min(axis=2)
    chroma = max_rgb - min_rgb

    # First remove white ornamental frame remnants, then edge-connected black.
    white_frame = connected_component(min_rgb >= 245, ("top", "bottom", "left", "right"))
    if preserve_dark_outfit:
        h, w = max_rgb.shape
        x = np.broadcast_to(np.arange(w), (h, w))
        strong_foreground = (max_rgb >= 32) | ((chroma >= 16) & (max_rgb >= 20))
        lo_by_row = np.full(h, np.nan)
        hi_by_row = np.full(h, np.nan)
        inside_span = np.zeros((h, w), dtype=bool)
        for y in range(h):
            xs = np.flatnonzero(strong_foreground[y])
            if xs.size > 4:
                lo_by_row[y] = max(0, int(xs.min()) - 8)
                hi_by_row[y] = min(w - 1, int(xs.max()) + 8)
        valid = np.flatnonzero(~np.isnan(lo_by_row))
        if valid.size:
            rows = np.arange(h)
            lo_interp = np.interp(rows, valid, lo_by_row[valid])
            hi_interp = np.interp(rows, valid, hi_by_row[valid])
            for y in range(int(valid.min()), int(valid.max()) + 1):
                y0 = max(int(valid.min()), y - 5)
                y1 = min(int(valid.max()) + 1, y + 6)
                lo = int(max(0, np.nanmin(lo_interp[y0:y1]) - 2))
                hi = int(min(w - 1, np.nanmax(hi_interp[y0:y1]) + 2))
                inside_span[y] = (x[y] >= lo) & (x[y] <= hi)
        black_candidate = (max_rgb <= 42) & ~inside_span
    else:
        black_candidate = max_rgb <= 42
    black_bg = connected_component(black_candidate, ("top", "left", "right"))

    remove = white_frame | black_bg
    alpha[remove] = 0
    alpha[alpha < 8] = 0
    arr[:, :, 3] = alpha

    out = Image.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
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


def split_grid(path: Path, preserve_dark_outfit: bool = False) -> list[Image.Image]:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    cells: list[Image.Image] = []
    margin = max(14, round(min(w / 4, h) * 0.025))
    for col in range(4):
        x0 = round(w * col / 4) + margin
        x1 = round(w * (col + 1) / 4) - margin
        crop = img.crop((x0, margin, x1, h - margin))
        cells.append(remove_black_background(crop, preserve_dark_outfit))
    return cells


def save_expression(char_id: str, emotion: str, image: Image.Image) -> None:
    char_dir = DEST_ROOT / char_id
    char_dir.mkdir(parents=True, exist_ok=True)
    for name in [emotion, *ALIASES.get(emotion, [])]:
        for out_path in (char_dir / f"{name}.png", char_dir / f"bust_{name}.png"):
            with out_path.open("wb") as file:
                image.save(file, format="PNG")


def main() -> None:
    for folder_name, char_id in CHARACTER_SOURCES.items():
        source_dir = SOURCE_ROOT / folder_name
        backup_existing(char_id)
        files = grid_files(source_dir)
        written = 0
        for grid_index, path in enumerate(files):
            cells = split_grid(path, char_id in DARK_OUTFIT_CHARS)
            for emotion, image in zip(GRID_EXPRESSIONS[grid_index], cells):
                save_expression(char_id, emotion, image)
                written += 2 + (2 * len(ALIASES.get(emotion, [])))
        print(f"processed {folder_name} -> {char_id}: {written} files")


if __name__ == "__main__":
    main()

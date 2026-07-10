from pathlib import Path
import shutil
import subprocess
import sys

from PIL import Image


ROOT = Path(r"C:/Users/a/Documents/Projects/EstelleVN")
PYTHON = Path(r"C:/Users/a/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe")
CHROMA = Path(r"C:/Users/a/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py")
GENERATED = Path(r"C:/Users/a/.codex/generated_images")
SOURCE_DIR = ROOT / "tmp" / "rozelin_pose_refs_sources"
OUT_DIR = ROOT / "dist" / "char" / "rozelin" / "reference_pose_expr"
BASE = ROOT / "dist" / "char" / "rozelin" / "neutral.png"


def latest_generated() -> Path:
    files = sorted(GENERATED.rglob("*.png"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not files:
        raise SystemExit("No generated png found.")
    return files[0]


def align_to_base(cut_path: Path, out_path: Path) -> None:
    base = Image.open(BASE).convert("RGBA")
    src = Image.open(cut_path).convert("RGBA")
    base_box = base.getchannel("A").getbbox()
    src_box = src.getchannel("A").getbbox()
    if not base_box or not src_box:
        raise SystemExit("Missing alpha bounds.")

    base_w = base_box[2] - base_box[0]
    base_h = base_box[3] - base_box[1]
    src_w = src_box[2] - src_box[0]
    src_h = src_box[3] - src_box[1]
    scale = min(base_w / src_w, base_h / src_h)

    resized = src.resize(
        (round(src.width * scale), round(src.height * scale)),
        Image.Resampling.LANCZOS,
    )
    resized_box = resized.getchannel("A").getbbox()
    x = (base_box[0] + base_box[2]) // 2 - (resized_box[0] + resized_box[2]) // 2
    y = base_box[3] - resized_box[3]

    out = Image.new("RGBA", base.size, (0, 0, 0, 0))
    out.alpha_composite(resized, (x, y))
    out.save(out_path)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: process_rozelin_ref.py <name>")

    name = sys.argv[1]
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    source = SOURCE_DIR / f"{name}_source.png"
    cut = SOURCE_DIR / f"{name}_cut.png"
    out = OUT_DIR / f"{name}.png"
    shutil.copy2(latest_generated(), source)

    subprocess.run(
        [
            str(PYTHON),
            str(CHROMA),
            "--input",
            str(source),
            "--out",
            str(cut),
            "--key-color",
            "#00ffff",
            "--soft-matte",
            "--transparent-threshold",
            "65",
            "--opaque-threshold",
            "185",
            "--edge-contract",
            "1",
            "--edge-feather",
            "0.15",
            "--despill",
            "--force",
        ],
        check=True,
    )
    align_to_base(cut, out)
    im = Image.open(out)
    print(f"saved {out} {im.size} alpha={im.getchannel('A').getextrema()}")


if __name__ == "__main__":
    main()

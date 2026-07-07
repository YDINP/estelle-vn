"""신규 5캐릭터(레이너/이든/미카엘/클로에/이졸데) 표정 시트 일괄 재컷.

구 apply_expr_grids 파이프라인(black<=42 플러드)이 어두운 의상을 배경으로
오인 제거(이든 네이비 제복 대량 소실)하고 프레임 라인 잔재를 남기는 문제
→ 로젤린 파이프라인으로 교체:
  - 배경이 순검정(전 시트 실측 p95=1)이라 black_thr=6으로 의상과 분리
  - 크롭 마진 12px(라인 y4~7, 캐릭터 y30~51 실측) — 머리/양옆 보존
  - 흰 프레임 플러드는 상/좌/우 에지만 시드(흰 의상 하단 절단면 보호)
  - 잔재는 keep-main(코너 존/미세 분리 성분 제거)으로 정리
표정 배치는 apply_expr_grids.GRID_EXPRESSIONS(시트 n = n행)와 동일.
bust_{emotion}.png는 기존 관례대로 전신 동일본 저장.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

import numpy as np

from apply_estelle_pairs import cut_cell, erode, shift_or
from apply_expr_grids import GRID_EXPRESSIONS, connected_component
from apply_rozelin_c import keep_main

SRC = Path(r"C:\Users\a\Desktop\1")
DEST_ROOT = Path(__file__).resolve().parents[1] / "public" / "char"

MARGIN = 12


def dilate(mask, r: int):
    out = mask.copy()
    for _ in range(r):
        out = out | shift_or(out)
    return out


def cut_dark_open(img, r: int = 4):
    """레이너 전용 — 의상이 진짜 0값 검정이라 임계/스팬 분리 모두 불가.
    누수는 좁은 통로로 들어온다는 점을 이용: 순검정(≤2) 에지 플러드 후
    모폴로지 열림(erode r → dilate r)으로 통로 유입분만 걷어내고 배경 본체만
    제거. 실루엣 주변 ~r px 검정 잔여는 게임 다크 배경에서 비가시."""
    from PIL import Image as I
    arr = np.array(img.convert("RGBA"))
    rgb = arr[:, :, :3].astype(np.int16)
    alpha = arr[:, :, 3]
    max_rgb = rgb.max(axis=2)
    bg0 = connected_component(max_rgb <= 2, ("top", "left", "right"))
    core = bg0.copy()
    for _ in range(r):
        core = erode(core)
    bg = dilate(core, r) & bg0
    alpha[bg] = 0
    alpha[alpha < 8] = 0
    # 실루엣의 검은 안티앨리어스 잔테두리 살짝 정리 + 페더
    ring = (alpha > 0) & shift_or(alpha == 0) & (max_rgb <= 2)
    alpha[ring] = 0
    edge = (alpha > 0) & shift_or(alpha == 0)
    alpha[edge] = (alpha[edge].astype(np.int16) * 45 // 100).astype(np.uint8)
    arr[:, :, 3] = alpha
    out = I.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out

# 캐릭터 → (폴더, 시트 파일명 패턴 {n}=1..4)
SHEETS: dict[str, tuple[str, str]] = {
    "rayner": ("003", "rayner_expr_grid_{n:02d}.png"),
    "eden": ("004", "eden_expr_grid_{n:02d}.png"),
    "michael": ("005", "michael_expr_grid_{n:02d}.png"),
    "adele": ("006", "c{n}.png"),
    "isolde": ("008", "c{n}.png"),
}


def main() -> None:
    for char_id, (folder, pattern) in SHEETS.items():
        dest = DEST_ROOT / char_id
        dest.mkdir(parents=True, exist_ok=True)
        for sheet_idx in range(4):
            path = SRC / folder / pattern.format(n=sheet_idx + 1)
            img = Image.open(path).convert("RGBA")
            w, h = img.size
            for col in range(4):
                x0 = round(w * col / 4) + MARGIN
                x1 = round(w * (col + 1) / 4) - MARGIN
                crop = img.crop((x0, MARGIN, x1, h - MARGIN))
                if char_id == "rayner":
                    # 의상 자체가 순검정(0값 포함)이라 임계/스팬 모두 실패 →
                    # 모폴로지 열림 기반 전용 컷
                    cell = cut_dark_open(crop)
                else:
                    cell = cut_cell(crop, black_thr=6, frame_edges=("top", "left", "right"))
                cell = keep_main(cell)
                emotion = GRID_EXPRESSIONS[sheet_idx][col]
                cell.save(dest / f"{emotion}.png")
                cell.save(dest / f"bust_{emotion}.png")
            print(f"{char_id} sheet{sheet_idx + 1} done")
    print("done")


if __name__ == "__main__":
    main()

"""로젤린 신규 16표정 (2컷 x 8시트 c1~c8, 검은 배경 + 흰 장식 프레임) 컷.

- 전신({emotion}.png) + 허벅지선 반신(bust_{emotion}.png) 동시 생성.
- 프레임 기하 실측: 라인은 셀 가장자리 y/x≈8 고정, 캐릭터는 y≈30부터.
  → 크롭 마진 12px (에스텔의 42px는 이 시트에선 머리/양옆을 잘라먹음).
  크롭 후 남는 코너 장식은 keep-main(최대 성분 대비 미세 분리 성분 제거)으로 정리.
- 배경/머리카락 사이 검은 포켓 제거, 얼굴·의상의 검정(눈동자/검은 레이스) 보존:
  배경이 순검정(실측 max 1)이라 black_thr=6으로 레이스(p10 9~)와 분리.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

from apply_estelle_pairs import cut_cell

SOURCE_DIR = Path(r"C:\Users\a\Desktop\1\002")
DEST_DIR = Path(__file__).resolve().parents[1] / "public" / "char" / "rozelin"

FRAME_MARGIN = 12  # 프레임 라인(≈8px) 바로 바깥까지만 크롭 — 머리(y≈30) 보존
BUST_RATIO = 0.62  # 전신 높이 대비 반신(허벅지선) 컷 비율

# 시트 c{n} → (cell0, cell1) 표정 — 얼굴 그리드 판독 기반 수동 매핑.
# 오배정 시 여기만 고쳐 재실행. (c4/c6/c8 계열은 판독 확신도 낮음 — 교체 후보)
MAPPING: dict[int, tuple[str, str]] = {
    1: ("smirk", "soft"),
    2: ("shy", "cold"),
    3: ("sad", "angry"),
    4: ("serious", "determined"),
    5: ("neutral", "tearful"),
    6: ("distressed", "embarrassed"),
    7: ("scheme", "surprised"),
    8: ("laugh", "happy"),
}


def keep_main(img: Image.Image, min_ratio: float = 0.03) -> Image.Image:
    """최대 불투명 성분(캐릭터) 대비 min_ratio 미만의 분리 성분(코너 장식 잔재) 제거."""
    arr = np.array(img)
    alpha = arr[:, :, 3]
    mask = alpha > 8
    hh, ww = mask.shape
    seen = np.zeros_like(mask)
    comps: list[list[tuple[int, int]]] = []
    for y0, x0 in zip(*np.nonzero(mask)):
        if seen[y0, x0]:
            continue
        queue = deque([(y0, x0)])
        seen[y0, x0] = True
        pix: list[tuple[int, int]] = []
        while queue:
            y, x = queue.popleft()
            pix.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < hh and 0 <= nx < ww and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))
        comps.append(pix)
    comps.sort(key=len, reverse=True)
    corner = 150  # 코너 장식 존 — 이 안에 중심이 있는 분리 성분은 크기 무관 제거
    for pix in comps[1:]:
        ys = [p[0] for p in pix]
        xs = [p[1] for p in pix]
        cy, cx = float(np.median(ys)), float(np.median(xs))
        in_corner = (cy < corner or cy > hh - corner) and (cx < corner or cx > ww - corner)
        if in_corner or len(pix) < len(comps[0]) * min_ratio:
            for p in pix:
                alpha[p] = 0
    arr[:, :, 3] = alpha
    out = Image.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def main() -> None:
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    for idx in range(1, 9):
        img = Image.open(SOURCE_DIR / f"c{idx}.png").convert("RGBA")
        w, h = img.size
        half = w // 2
        for col in range(2):
            x0 = half * col + FRAME_MARGIN
            x1 = half * (col + 1) - FRAME_MARGIN
            body = cut_cell(img.crop((x0, FRAME_MARGIN, x1, h - FRAME_MARGIN)), black_thr=6)
            body = keep_main(body)
            bw, bh = body.size
            bust = body.crop((0, 0, bw, int(bh * BUST_RATIO)))
            bbox = bust.getbbox()
            if bbox:  # 스커트 폭 기준이던 좌우 여백 정리
                bust = bust.crop(bbox)
            emotion = MAPPING[idx][col]
            body.save(DEST_DIR / f"{emotion}.png")
            bust.save(DEST_DIR / f"bust_{emotion}.png")
            print(f"c{idx}[{col}] -> {emotion} body{body.size} bust{bust.size}")
    print("done")


if __name__ == "__main__":
    main()

"""발렌 c1~c4 (흰 테두리 + 검은 배경) 전용 컷.

새 발렌 아트는 캐릭터 외곽에 흰 윤곽선이 있으나 모피 실루엣 구간에서
끊겨 있어 플러드필 방어벽으로는 쓸 수 없다(의상 내부 전멸 사고 원인).
절차:
  1) 스트립을 4셀로 분할(흰 프레임 라인은 margin 크롭으로 제거)
  2) 배경 제거 = apply_expr_grids의 행별 스팬 보호 컷(DARK_OUTFIT 경로).
     윤곽선은 강한 전경 신호로 스팬 검출 정확도만 높여줌
  3) 남은 흰 윤곽선을 투명 경계에서 안쪽으로 저채도 peel (내부 흰색 보존)
  4) 유채색 프린지는 흰색 기여 역산(un-blend) + 경계 1px 알파 페더
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

from apply_expr_grids import GRID_EXPRESSIONS, remove_black_background

SOURCE_DIR = Path(r"C:\Users\a\Desktop\1\007")
DEST_DIR = Path(__file__).resolve().parents[1] / "public" / "char" / "valen"


def neighbors_of(mask: np.ndarray) -> np.ndarray:
    n = np.zeros_like(mask)
    n[1:, :] |= mask[:-1, :]
    n[:-1, :] |= mask[1:, :]
    n[:, 1:] |= mask[:, :-1]
    n[:, :-1] |= mask[:, 1:]
    return n


def cut_cell(img: Image.Image) -> Image.Image:
    # ⚠️ 흰 윤곽선은 모피 실루엣 구간에서 끊겨 있고(벽 불성립), 배경 검정(~21)과
    # 의상 순검정(1~)은 임계값 분리도 불가 → 배경 제거는 검증된 행별 캐릭터
    # 스팬 보호 휴리스틱(apply_expr_grids, DARK_OUTFIT 경로)에 맡긴다.
    # 윤곽선은 스팬 검출을 정확하게 만드는 강한 전경 신호로만 기여.
    base = remove_black_background(img.convert("RGBA"), preserve_dark_outfit=True)

    arr = np.array(base)
    rgb = arr[:, :, :3].astype(np.int16)
    alpha = arr[:, :, 3]
    max_rgb = rgb.max(axis=2)
    min_rgb = rgb.min(axis=2)

    # 스팬 보호가 남긴 검은 배경 할로(계단형 잔여)를 경계에서 안쪽으로 한정
    # 깎음 — 흰 윤곽선(밝음)이나 의상 텍스처(>50)를 만나면 멈춤. 상한 16px라
    # 윤곽선 없는 모피 구간에서도 새까만 끝단만 살짝 다듬는 수준.
    for _ in range(28):
        ring = (alpha > 0) & neighbors_of(alpha == 0) & (max_rgb <= 50)
        if not ring.any():
            break
        alpha[ring] = 0

    # 흰 윤곽선 peel — 투명 영역과 맞닿은 밝은 '무채색' 픽셀만 안쪽으로 벗겨냄.
    # 채도 조건으로 피부(웜톤)·적발은 보존, 내부 하이라이트는 경계와 안 닿아 보존.
    chroma = max_rgb - min_rgb
    for _ in range(8):
        ring = (alpha > 0) & neighbors_of(alpha == 0) & (min_rgb >= 170) & (chroma <= 60)
        if not ring.any():
            break
        alpha[ring] = 0
    # 잔여 안티앨리어스(회백 프린지) — 저채도 한정 3회
    for _ in range(3):
        ring = (alpha > 0) & neighbors_of(alpha == 0) & (min_rgb >= 120) & (chroma <= 40)
        if not ring.any():
            break
        alpha[ring] = 0
    # 유채색 프린지(흰 윤곽선+머리색 혼색)는 peel로 못 잡음 — 흰색 기여를
    # 역산(un-blend)해 원색으로 복원 (defringe.py와 동일 원리, white=255)
    for ring_idx, w_mix in ((0, 0.45), (1, 0.22)):
        ring = (alpha > 0) & neighbors_of(alpha == 0) if ring_idx == 0 else ring2
        bright = ring & (max_rgb >= 140)
        if ring_idx == 0:
            ring2 = neighbors_of(ring) & (alpha > 0) & ~ring
        if bright.any():
            c = rgb[bright].astype(np.float32)
            rgb[bright] = np.clip((c - 255.0 * w_mix) / (1.0 - w_mix), 0, 255).astype(np.int16)
    arr[:, :, :3] = rgb.astype(np.uint8)

    # 경계 1px 페더로 계단 완화
    edge = (alpha > 0) & neighbors_of(alpha == 0)
    alpha[edge] = (alpha[edge].astype(np.int16) * 45 // 100).astype(np.uint8)

    arr[:, :, 3] = alpha
    out = Image.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def main() -> None:
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    written = 0
    for grid_index in range(4):
        img = Image.open(SOURCE_DIR / f"c{grid_index + 1}.png").convert("RGBA")
        w, h = img.size
        margin = max(14, round(min(w / 4, h) * 0.025))
        for col in range(4):
            x0 = round(w * col / 4) + margin
            x1 = round(w * (col + 1) / 4) - margin
            cell = cut_cell(img.crop((x0, margin, x1, h - margin)))
            emotion = GRID_EXPRESSIONS[grid_index][col]
            for name in (f"{emotion}.png", f"bust_{emotion}.png"):
                cell.save(DEST_DIR / name)
                written += 1
            print(f"c{grid_index + 1}[{col}] -> {emotion} {cell.size}")
    print(f"done: {written} files -> {DEST_DIR}")


if __name__ == "__main__":
    main()

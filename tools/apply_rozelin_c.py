"""로젤린 신규 16표정 (2컷 x 8시트 c1~c8, 검은 배경 + 흰 장식 프레임) 컷.

- 전신({emotion}.png) + 허벅지선 반신(bust_{emotion}.png) 동시 생성.
- 배경/머리카락 사이 검은 포켓 제거, 얼굴·의상의 검정(눈동자/검은 레이스)은 보존
  → apply_estelle_pairs.cut_cell 재사용 (채도 가드 + 성분 평균 밝기 게이트 검증됨).
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

from apply_estelle_pairs import FRAME_MARGIN, cut_cell

SOURCE_DIR = Path(r"C:\Users\a\Desktop\1\002")
DEST_DIR = Path(__file__).resolve().parents[1] / "public" / "char" / "rozelin"

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


def main() -> None:
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    for idx in range(1, 9):
        img = Image.open(SOURCE_DIR / f"c{idx}.png").convert("RGBA")
        w, h = img.size
        half = w // 2
        for col in range(2):
            x0 = half * col + FRAME_MARGIN
            x1 = half * (col + 1) - FRAME_MARGIN
            # black_thr=6: 배경이 순검정(실측 max 1)이라 낮은 임계로 분리 —
            # 드레스의 검은 레이스(p10 9~)가 배경 플러드에 먹히지 않게 함
            body = cut_cell(img.crop((x0, FRAME_MARGIN, x1, h - FRAME_MARGIN)), black_thr=6)
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

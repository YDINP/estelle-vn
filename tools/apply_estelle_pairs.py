"""에스텔 신규 16표정 (2컷 x 8파일, 검은 배경 + 흰 장식 프레임) 컷.

요구: 배경 검정 제거(머리카락 사이 갇힌 포켓 포함), 캐릭터 내부는 보존.
에스텔은 밝은 팔레트(금발/크림 드레스)라 검은 배경과 임계값 분리가 가능.
갇힌 검은 포켓 vs 캐릭터 선화(둘 다 검정) 구분은 '두께': 포켓은 뭉툭한
블롭, 선화는 1~3px 획 → k회 침식에서 살아남는 성분만 포켓으로 제거.
"""
from __future__ import annotations

import re
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

from apply_expr_grids import connected_component

SOURCE_DIR = Path(r"C:\Users\a\Desktop\1\001")
DEST_DIR = Path(__file__).resolve().parents[1] / "public" / "char" / "estelle"

# 파일 (n) 번호 → (cell0, cell1) 표정. 다운로드 순번이라 생성 순서와 무관 —
# 아트 내용(표정 판독) 기준 수동 매핑. 오배정 시 여기만 고쳐 재실행.
MAPPING: dict[int, tuple[str, str]] = {
    1: ("neutral", "laugh"),
    2: ("cold", "happy"),
    3: ("shy", "distressed"),
    4: ("tearful", "angry"),
    5: ("sad", "soft"),
    6: ("embarrassed", "determined"),
    7: ("smirk", "scheme"),
    8: ("surprised", "serious"),
}

FRAME_MARGIN = 42  # 흰 이중 테두리+코너 장식 대부분을 잘라내는 크롭


def shift_or(mask: np.ndarray) -> np.ndarray:
    n = np.zeros_like(mask)
    n[1:, :] |= mask[:-1, :]
    n[:-1, :] |= mask[1:, :]
    n[:, 1:] |= mask[:, :-1]
    n[:, :-1] |= mask[:, 1:]
    return n


def erode(mask: np.ndarray) -> np.ndarray:
    n = mask.copy()
    n[1:, :] &= mask[:-1, :]
    n[:-1, :] &= mask[1:, :]
    n[:, 1:] &= mask[:, :-1]
    n[:, :-1] &= mask[:, 1:]
    return n


def cut_cell(img: Image.Image, black_thr: int = 38, black_chroma: int = 14) -> Image.Image:
    arr = np.array(img.convert("RGBA"))
    rgb = arr[:, :, :3].astype(np.int16)
    alpha = arr[:, :, 3]
    max_rgb = rgb.max(axis=2)
    min_rgb = rgb.min(axis=2)

    # 크롭 후 남은 프레임 잔재(에지 접촉 순백 장식) 제거
    frame = connected_component(min_rgb >= 235, ("top", "bottom", "left", "right"))

    # 채도 조건: 배경 검정은 무채색(chroma~0), 눈동자 코어는 짙어도 청색
    # 채도가 있어 제외됨 (채도 없이는 pupil이 포켓으로 오인 제거되는 사고)
    # black_thr: 의상에 저채도 검정(레이스 등)이 있는 캐릭터는 낮춰서 호출
    # (배경이 순검정일 때만 유효 — 로젤린 실측: bg max 1 vs 레이스 p10 9)
    black = (max_rgb <= black_thr) & ((max_rgb - min_rgb) <= black_chroma)
    # ① 에지 연결 배경 — 드레스가 밝아 내부로 샐 경로 없음(4에지 시드 안전)
    bg = connected_component(black, ("top", "bottom", "left", "right"))
    # ② 갇힌 검은 포켓(머리카락 사이 등): 두께 있는 성분만 제거, 얇은 선화 보존.
    #    2회 침식 생존 픽셀을 시드로 포켓 내 측지 복원 → 성분 단위 판정.
    #    속눈썹 등 어두운 이목구비도 두께를 통과하므로 성분 평균 밝기로 최종
    #    구분: 배경 포켓은 순검정(평균 3~5), 이목구비는 짙어도 11+ (실측)
    pocket_cand = black & ~bg
    core = erode(erode(pocket_cand))
    pockets = np.zeros_like(pocket_cand)
    seen = np.zeros_like(pocket_cand)
    hh, ww = pocket_cand.shape
    for y0, x0 in zip(*np.nonzero(core)):
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
                if 0 <= ny < hh and 0 <= nx < ww and pocket_cand[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))
        mean_v = float(np.mean([max_rgb[p] for p in pix]))
        if mean_v <= 8.0:
            for p in pix:
                pockets[p] = True

    removed = frame | bg | pockets
    alpha[removed] = 0
    alpha[alpha < 8] = 0

    # 검은 프린지 un-blend — 경계 픽셀의 검정 혼입을 역산해 원색 복원
    for w_mix, ring_src in ((0.45, None), (0.22, "second")):
        if ring_src is None:
            ring = (alpha > 0) & shift_or(alpha == 0)
            ring1 = ring
        else:
            ring = shift_or(ring1) & (alpha > 0) & ~ring1
        dark = ring & (max_rgb <= 200)  # 밝은 픽셀은 혼입 미미
        if dark.any():
            c = rgb[dark].astype(np.float32)
            rgb[dark] = np.clip(c / (1.0 - w_mix), 0, 255).astype(np.int16)
    arr[:, :, :3] = rgb.astype(np.uint8)

    # 경계 1px 페더
    edge = (alpha > 0) & shift_or(alpha == 0)
    alpha[edge] = (alpha[edge].astype(np.int16) * 45 // 100).astype(np.uint8)
    arr[:, :, 3] = alpha

    out = Image.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def source_files() -> dict[int, Path]:
    files: dict[int, Path] = {}
    for path in SOURCE_DIR.glob("*.png"):
        m = re.search(r"\((\d+)\)", path.name)
        if m and int(m.group(1)) in MAPPING:
            files[int(m.group(1))] = path
    missing = set(MAPPING) - set(files)
    if missing:
        raise FileNotFoundError(f"source missing: {sorted(missing)}")
    return files


def main() -> None:
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    for idx, path in sorted(source_files().items()):
        img = Image.open(path).convert("RGBA")
        w, h = img.size
        half = w // 2
        for col in range(2):
            x0 = half * col + FRAME_MARGIN
            x1 = half * (col + 1) - FRAME_MARGIN
            cell = cut_cell(img.crop((x0, FRAME_MARGIN, x1, h - FRAME_MARGIN)))
            emotion = MAPPING[idx][col]
            for name in (f"{emotion}.png", f"bust_{emotion}.png"):
                cell.save(DEST_DIR / name)
            print(f"({idx})[{col}] -> {emotion} {cell.size}")
    print("done")


if __name__ == "__main__":
    main()

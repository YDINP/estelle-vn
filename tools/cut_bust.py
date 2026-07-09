#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""로젤린(및 동일 규격 캐릭터) 전신 PNG에서 상반신(bust) 크롭 생성.
- 입력: public/char/<id>/<emotion>.png (투명배경, 캐릭터 1인 중앙 배치)
- 출력: public/char/<id>/bust_<emotion>.png
크롭 규칙(기존 bust 프레이밍 재현):
  세로 = 알파 콘텐츠 상단(머리끝)에서 콘텐츠 높이의 HEIGHT_RATIO 만큼.
  가로 = 종횡비 ASPECT(w/h) 고정, 어깨 중심(상단 영역 알파 무게중심)에 정렬.
"""
import sys, os
from PIL import Image

HEIGHT_RATIO = 0.62   # 콘텐츠 높이 대비 bust 세로 (머리끝~허리)
ASPECT = 0.626        # bust 종횡비 w/h (기존 404x645 기준)

EMOTIONS = ["neutral","soft","happy","laugh","shy","serious","determined",
            "surprised","sad","distressed","tearful","angry","smirk","scheme",
            "embarrassed","cold"]

def content_center_x(im, y0, y1):
    """y0~y1 구간 알파 픽셀의 x 무게중심 (어깨/머리 중심 추정)."""
    px = im.load(); w,h = im.size
    sx = 0; n = 0
    for y in range(y0, y1, 4):
        for x in range(0, w, 3):
            if px[x,y][3] > 40:
                sx += x; n += 1
    return sx/n if n else w/2

def cut(path_in, path_out, dry=False):
    im = Image.open(path_in).convert("RGBA")
    w,h = im.size
    bx = im.getbbox()  # (l,t,r,b)
    l,t,r,b = bx
    ch = b - t
    crop_h = int(ch * HEIGHT_RATIO)
    top = t
    bottom = min(h, t + crop_h)
    # 상단 1/3(머리~어깨) 무게중심으로 가로 정렬
    cx = content_center_x(im, top, top + crop_h//3)
    crop_w = int(crop_h * ASPECT)
    left = int(cx - crop_w/2)
    right = left + crop_w
    # 경계 보정
    if left < 0: right -= left; left = 0
    if right > w: left -= (right - w); right = w
    left = max(0, left)
    box = (left, top, right, bottom)
    print(f"{os.path.basename(path_in)}: fullbbox={bx} cx={cx:.0f} crop={box} -> {right-left}x{bottom-top}")
    if not dry:
        im.crop(box).save(path_out)

def main():
    args = sys.argv[1:]
    dry = "--dry" in args
    args = [a for a in args if not a.startswith("--")]
    root = args[0] if args else "public/char/rozelin"
    only = args[1] if len(args) > 1 else None
    ems = [only] if only else EMOTIONS
    for e in ems:
        pin = os.path.join(root, f"{e}.png")
        if not os.path.exists(pin):
            print("skip(없음):", pin); continue
        pout = os.path.join(root, f"bust_{e}.png")
        cut(pin, pout, dry)

if __name__ == "__main__":
    main()

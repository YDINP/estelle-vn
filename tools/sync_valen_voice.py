# valen_route.ts 의 발렌 대사 old->new 매핑을 추출해 story md 에 리터럴 치환.
# 정확 매치만 치환하므로 미스매치는 파일을 건드리지 않음(무해).
import re, subprocess, sys

def extract(src):
    pat = re.compile(r'\b(?:V|rv)\("((?:[^"\\]|\\.)*)"')
    out = []
    for m in pat.finditer(src):
        s = m.group(1).replace('\\"', '"')  # 코드 이스케이프 → md raw
        out.append(s)
    return out

old_src = subprocess.check_output(
    ["git", "show", "HEAD:src/data/valen_route.ts"], text=True, encoding="utf-8")
new_src = open("src/data/valen_route.ts", encoding="utf-8").read()
old = extract(old_src)
new = extract(new_src)
if len(old) != len(new):
    print("라인 수 불일치 old=%d new=%d — 중단" % (len(old), len(new)))
    sys.exit(1)

pairs = [(o, n) for o, n in zip(old, new) if o != n]
print("대사 매핑 %d쌍(변경분) / 전체 %d" % (len(pairs), len(old)))

for t in ["story/route-valen.md", "story/outline-valen.md"]:
    try:
        txt = open(t, encoding="utf-8").read()
    except FileNotFoundError:
        print("skip(없음):", t)
        continue
    hit = 0
    for o, n in pairs:
        if o in txt:
            txt = txt.replace(o, n)
            hit += 1
    open(t, "w", encoding="utf-8").write(txt)
    print("%s: %d/%d 치환" % (t, hit, len(pairs)))

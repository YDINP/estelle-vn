# 캐릭터 목소리 감사기 — STORY-BIBLE §3 대비 어투 위반 플래그.
# 존댓말/경어 캐릭터가 반말 종결로 끝나는 라인을 후보로 표시(오탐 가능, 사람이 최종판단).
import re, os, sys, glob

FILES = glob.glob("src/data/*route*.ts") + ["src/data/season1.ts"]

# 존댓말/경어 필수 화자 (반말 종결이면 위반 후보)
POLITE = {"estelle","rozelin","eden","michael","isolde","chancellor","fiance"}
# 반말 허용 화자: adele(클로에 소녀 반말), valen(황제 사극체=별도), narration
SKIP = {"narration","adele","valen"}

# 정중/경어 종결 시그니처 (이 중 하나로 끝나면 OK)
POLITE_END = re.compile(
    r'(요|죠|다|까|께요|세요|십시오|시오|소서|니다|나요|가요|군요|네요|데요|래요|봐요|어요|아요|여요|시죠|지요|리까|더이다|나이다|옵니다|사옵|나이까|'
    r'느냐|하라|노라|이니라|느니라|리라|더냐|는가|—|…|"|\'|\)|」|』)\s*$'
)
# 명백 반말 종결 (문장 마지막이 이 형태면 위반 강함)
BANMAL_END = re.compile(r'([가-힣])(어|아|야|지|네|군|걸|잖아|거든|는데|든지|해|봐|줘|와|가|나)\.?\s*$')

def build_map(src):
    m = {}
    for line in src.splitlines():
        mm = re.search(r'const\s+([A-Za-z]+)\s*=.*?speaker:\s*"([a-z]+)"', line)
        if mm:
            m[mm.group(1)] = mm.group(2)
    return m

def iter_lines(src, bmap):
    names = sorted(bmap.keys(), key=len, reverse=True)
    if not names:
        return
    pat = re.compile(r'\b(' + '|'.join(names) + r')\("((?:[^"\\]|\\.)*)"')
    for mm in pat.finditer(src):
        yield mm.group(1), bmap[mm.group(1)], mm.group(2).replace('\\"', '"')

def last_sentence(t):
    parts = re.split(r'(?<=[.!?…])\s+', t.strip())
    return parts[-1] if parts else t

total_flag = 0
for f in sorted(set(FILES)):
    src = open(f, encoding="utf-8").read()
    bmap = build_map(src)
    flags = []
    for b, sp, text in iter_lines(src, bmap):
        if sp in SKIP or sp not in POLITE:
            continue
        ls = last_sentence(text)
        if POLITE_END.search(ls):
            continue
        if BANMAL_END.search(ls):
            flags.append((sp, text))
    if flags:
        print("\n### %s — 위반후보 %d" % (f, len(flags)))
        for sp, text in flags:
            total_flag += 1
            print("  [%s] %s" % (sp, text[:120]))
print("\n=== 총 위반후보 %d ===" % total_flag)

# ── 덤프 모드: 특정 화자 전 라인 출력 (사람 눈 감사용) ──
if len(sys.argv) > 1 and sys.argv[1] == "dump":
    want = set(sys.argv[2:])
    for f in sorted(set(FILES)):
        src = open(f, encoding="utf-8").read()
        bmap = build_map(src)
        rows = [(sp, t) for _, sp, t in iter_lines(src, bmap) if sp in want]
        if rows:
            print("\n### %s" % f)
            for sp, t in rows:
                print("  [%s] %s" % (sp, t))

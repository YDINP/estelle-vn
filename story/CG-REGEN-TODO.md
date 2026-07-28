# CG 재생성 대기 목록 (레퍼런스 미반영분)

> 생성: `tools/cg-regen-report.mjs` · 기준일 2026-07-27
>
> 초기 CG는 `ILLUST-SPEC.md`의 **구버전 텍스트 서술**을 앵커로 생성돼 그림 속 인물이
> 게임 속 캐릭터와 달랐다. 아래 컷들은 아직 교정되지 않았고, 배포본에서는
> `art-backup/mismatched-cg/` 로 **격리**해 뒀다(엔진의 `.cg-missing` 폴백이 플레이스홀더 표시).
>
> ⚠️ **Codex 사용량 한도로 중단됨 — 리셋 2026-08-02.**

## 재개 절차
```bash
node tools/cg-worklist.mjs --emit --all
node tools/cg-generate.mjs --route <id> --batch 2 --all   # 엔딩부터
node tools/cg-place.mjs --force
node .tmp/dupcheck.mjs        # 루트 간 중복 배치 점검
```
`cg-generate.mjs`가 아래 레퍼런스 파일을 codex image_gen에 자동으로 넘긴다 — 수동 지정 불필요.

## 캐릭터 레퍼런스 정본

| 캐릭터 | 레퍼런스 파일 | 외형 |
|---|---|---|
| 릴리아 (lilia) | `public/char/lilia/soft.webp` | 금발 반묶음(작은 꽃·리본)·파란 눈·세이지그린 오버드레스+크림 언더스커트(긴소매)·금 리본벨트 에메랄드 |
| 마리온 (marion) | `public/char/marion/soft.webp` | 와인빛 적발 롱웨이브·붉은 눈·진홍+검정 로코코 볼가운·검은 레이스 초커 |
| 벨포르 (belfor) | `public/char/belfor/soft.webp` | 갈색 숏컷·황금 눈·감청(네이비) 군복코트+은색 견장·검은 장갑/롱부츠 |
| 벨리안 (belian) | `public/char/belian/soft.webp` | 적발·앰버 눈·검정+금 자수 대형 케이프(모피 어깨)·붉은 선버스트 브로치 |
| 루시엔 (lucienne) | `public/char/lucienne/soft.webp` | 은백~라벤더 롱스트레이트(앞머리)·보라 눈·연보라 라일락 시폰 드레스 |
| 리비아 (livia) | `public/char/livia/soft.webp` | 갈색 롱웨이브(금색 별 장식)·황금 눈·짙은 녹색 오프숄더 귀족드레스 |
| 레이먼 (reimon) | `public/char/reimon/soft.webp` | 흑발 숏컷·파란 눈·전신 검정 깃털 대형망토+흑금 군복 |
| 아젤 (azael) | `public/char/azael/soft.webp` | 은발·황금 눈·흰금 십자문양 성기사 갑주+흑금 안감 케이프 |
| 메피안 (mephian) | *(레퍼런스 미사용 — 실루엣 지시)* | 얼굴 없는 검은 실루엣 노신사 (게임 정본 표현) |
| 약혼자 (fiance) | *(레퍼런스 미사용 — 실루엣 지시)* | 얼굴 없는 그림자 귀족 남성 (게임 정본 표현) |

## 잔여 18컷 — 격리 15 · 유지 3

- 🔴 **격리** — 어긋난 캐릭터가 등장해 `art-backup/mismatched-cg/` 로 옮겼다. 게임에선 플레이스홀더가 뜬다.
- 🟡 **유지** — 배포본에 그대로 있다. 아젤은 구 앵커가 실제 아트와 일치했고(육안 확인),
  `cg_lvp_bad`는 인물이 등장하지 않는 컷(텅 빈 별채)이다. 화풍 통일을 위해 재생성 대상에는 남겨 둔다.

### reimon — 7컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_rmp23` | 🔴 격리 | `reimon/seven_threads.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>아젤=`char/azael/soft.webp` | 23화 — 대연회장 경비 편성 회의. 홀 도면 위에 일곱 개의 나무 말이 놓이고, 일곱 사람의 밤이 한 상자로 수렴한다 |
| `cg_rmp25` | 🔴 격리 | `reimon/three_hours.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>메피안(실루엣) | 25화[막⑤·배드게이트②] — 재상부 증인 대기실. 위증 서약서 앞의 벨포르, 그를 둘러싼 창 여덟 자루, 그리고 문간의 레이먼 |
| `cg_rmp26` | 🔴 격리 | `reimon/upper_gallery.webp` | 레이먼=`char/reimon/soft.webp` | 26화 — 왕관의 밤 상단 회랑. 목소리 없는 손짓 하나로 홀 전체의 경비를 지휘하고, 곁에는 재상부의 '의전 보조' 넷이 서 있다 |
| `cg_rmp28` | 🔴 격리 | `reimon/evidence_command.webp` | 벨포르=`char/belfor/soft.webp`<br>벨리안=`char/belian/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>약혼자(실루엣) | 28화 — 세 봉랍이 같은 주형에서 나왔다는 감정 결과. 회랑에서 내려진 확보 명령 '근위대는 증거를 따른다. 저 둘을 확보하라' |
| `cg_rmp_good` | 🔴 격리 | `reimon/end_good.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp` | 30화 GOOD — 두 맹세의 화해. 검을 반납하지도, 한쪽을 버리지도 않은 채 북문을 나서는 길. 프롤로그 눈밭의 대구 |
| `cg_rmp_bad` | 🔴 격리 | `reimon/end_bad.webp` | 레이먼=`char/reimon/soft.webp` | 30화 BAD — 오명은 벗었으나 감옥이 더 촘촘해진 세계선. 프롤로그의 눈밭이 반복되고, 이번엔 곁의 한 사람까지 붙들려 함께 얼어붙는다 |
| `cg_rmp_true` | 🔴 격리 | `reimon/end_true.webp` | 레이먼=`char/reimon/soft.webp` | 30화 TRUE — 구원 + 제3의 손 회수. 문장 없는 인장으로 봉해진 글자 있는 편지, 그리고 두 깃발 뒤에 남는 세 번째 그림자 |

### belfor — 4컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_bfp28` | 🔴 격리 | `belfor/he_chose.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>약혼자(실루엣) | 28화 — 레이먼의 '저 둘을 확보하라'. 벨포르가 영애가 아니라 약혼자·집사를 확보한다 |
| `cg_bfp_good` | 🔴 격리 | `belfor/end_good.webp` | 벨포르=`char/belfor/soft.webp` | 30화 GOOD — 새벽 연병장. 1회차에 부러진 검이 놓였던 바로 그 자리에 검을 거꾸로 세워 꽂고 새 맹세를 한다 |
| `cg_bfp_bad` | 🔴 격리 | `belfor/end_bad.webp` | 벨포르=`char/belfor/soft.webp` | BAD 엔딩 공통 컷 — 15화 게이트①·25화 게이트②·30화 게이트③ 실패 분기에서 사용. 빗속 연병장에서 무릎에 검신을 대고 스스로 검을 부러뜨린다 |
| `cg_bfp_true` | 🔴 격리 | `belfor/end_true.webp` | 벨포르=`char/belfor/soft.webp`<br>아젤=`char/azael/soft.webp` | 30화 TRUE — 구원 + 제3의 손 회수. 봉랍이 눌린 각도로 '왼손'을 짚어내고, 미제 사건 번호를 남긴 뒤 검을 꽂는다 |

### belian — 4컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_blp28` | 🔴 격리 | `belian/swapped_chalice.webp` | 벨리안=`char/belian/soft.webp` | 28화 — 왕관의 밤 절정. 홀의 모든 눈이 증언대를 보는 사이, 무릎 꿇은 늙은 시종장이 품에서 이 나간 낡은 잔을 꺼내 독 든 잔과 바꾼다. 앞막의 손 떨림이 회수되는 순간 |
| `cg_blp_good` | 🔴 격리 | `belian/end_good.webp` | 벨리안=`char/belian/soft.webp` | 30화 GOOD — 대관식. 주교의 손에서 왕관이 내려앉는 동안 벨리안은 눈을 감지 않고 곁에 남은 일곱을 센다. 이 나간 낡은 잔으로 축배를 들고, 이번엔 웃음이 지워지지 않는다 |
| `cg_blp_bad` | 🔴 격리 | `belian/end_bad.webp` | 벨리안=`char/belian/soft.webp` | 30화 BAD — 대관식 직전, 왕관을 주교의 손에서 스스로 빼앗아 쓴다. 각본가의 빈 자리를 제가 삼키기로 한 순간. 이후 궁의 모든 문에 사람을 세우고, 당신을 새장에 붙든다 |
| `cg_blp_true` | 🔴 격리 | `belian/end_true.webp` | 벨리안=`char/belian/soft.webp` | 30화 TRUE — 대관식 새벽, 문서고에서 의전 명부 여백에 손톱을 대던 손이 붙들린다. 스무 해마다 봄을 꺾어 온 그 손이 처음으로 실패한 밤. 이후 벨리안은 웃으며 왕관을 쓰고, 스무 해 뒤를 위한 기록을 남기기 시작한다 |

### azael — 3컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_azp_good` | 🟡 유지 | `azael/end_good.webp` | 아젤=`char/azael/soft.webp` | 30화 GOOD — 성 카나 대성당 재심정. 아젤이 제 손으로 갑주의 흰 천을 벗기고, 지워진 적 없는 문장이 아침빛에 드러난다 |
| `cg_azp_bad` | 🟡 유지 | `azael/end_bad.webp` | 아젤=`char/azael/soft.webp` | 엔딩 BAD (15·25·30화 fail 공용) — 국경 이정표 아래, 문장이 뜯긴 백은 갑주와 봉랍이 뜯긴 빈 기록함 |
| `cg_azp_true` | 🟡 유지 | `azael/end_true.webp` | 아젤=`char/azael/soft.webp` | 30화 TRUE — 열두 해 전 명부 여백에서 같은 필적을 발견한 뒤, 문장이 온전한 갑주로 국경을 향해 서는 두 사람 |

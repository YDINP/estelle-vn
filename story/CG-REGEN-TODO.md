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

## 잔여 35컷 — 격리 31 · 유지 4

- 🔴 **격리** — 어긋난 캐릭터가 등장해 `art-backup/mismatched-cg/` 로 옮겼다. 게임에선 플레이스홀더가 뜬다.
- 🟡 **유지** — 배포본에 그대로 있다. 아젤은 구 앵커가 실제 아트와 일치했고(육안 확인),
  `cg_lvp_bad`는 인물이 등장하지 않는 컷(텅 빈 별채)이다. 화풍 통일을 위해 재생성 대상에는 남겨 둔다.

### marion — 7컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_map25` | 🔴 격리 | `marion/three_hours_before.webp` | 릴리아=`char/lilia/soft.webp`<br>마리온=`char/marion/soft.webp`<br>리비아=`char/livia/soft.webp`<br>메피안(실루엣) | 25화[막⑤·배드게이트②] — 각본실. '리비아냐, 릴리아냐, 아니면 당신 자신이냐' — 마지막 저울 앞에서 마리온의 두 손에 |
| `cg_map26` | 🔴 격리 | `marion/midnight_accusation.webp` | 릴리아=`char/lilia/soft.webp`<br>마리온=`char/marion/soft.webp`<br>벨리안=`char/belian/soft.webp`<br>메피안(실루엣) | 26화[6비트①] — 자정 종 아홉 번째에 메피안이 하이델 공작영애를 반역으로 고발한다. 천 개의 시선이 증인석에서 증언대까지 |
| `cg_map27` | 🔴 격리 | `marion/lost_script.webp` | 마리온=`char/marion/soft.webp`<br>아젤=`char/azael/soft.webp` | 27화[6비트②] — 증언대의 마리온이 예법의 빈틈에 선 당신을 보고, 열한 줄을 끝내 발화하지 않는다. 이 루트의 주 카메라 |
| `cg_map28` | 🔴 격리 | `marion/the_seizure.webp` | 마리온=`char/marion/soft.webp`<br>벨포르=`char/belfor/soft.webp`<br>벨리안=`char/belian/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>메피안(실루엣)<br>약혼자(실루엣) | 28화[6비트④⑤⑥] — 레이먼의 확보 명령을 벨포르가 집행한다. 표적은 약혼자와 집사. 벨리안이 재가하고, 메피안이 스스로  |
| `cg_map_good` | 🔴 격리 | `marion/end_good.webp` | 마리온=`char/marion/soft.webp`<br>리비아=`char/livia/soft.webp` | 30화 GOOD — 경매로 넘어간 발루아 저택, 헐린 온실 잔해 위에 마리온이 손수 스물두 그루의 장미를 심는다. 계산을 버린 |
| `cg_map_bad` | 🔴 격리 | `marion/end_bad.webp` | 마리온=`char/marion/soft.webp` | 30화 BAD (15화·25화 실패 분기 공용) — 프롤로그의 반복. 문장이 지워진 마차가 국경을 넘고, 이번엔 당신이 창밖에 |
| `cg_map_true` | 🔴 격리 | `marion/end_true.webp` | 마리온=`char/marion/soft.webp` | 30화 TRUE — 흙 묻은 손 그대로 검인청 명부를 펼친 마리온. 견본 고리의 등록 번호가 십이 년 전 발루아 검인일을 가리 |

### reimon — 7컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_rmp23` | 🔴 격리 | `reimon/seven_threads.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>아젤=`char/azael/soft.webp` | 23화 — 대연회장 경비 편성 회의. 홀 도면 위에 일곱 개의 나무 말이 놓이고, 일곱 사람의 밤이 한 상자로 수렴한다 |
| `cg_rmp25` | 🔴 격리 | `reimon/three_hours.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>메피안(실루엣) | 25화[막⑤·배드게이트②] — 재상부 증인 대기실. 위증 서약서 앞의 벨포르, 그를 둘러싼 창 여덟 자루, 그리고 문간의 레이 |
| `cg_rmp26` | 🔴 격리 | `reimon/upper_gallery.webp` | 레이먼=`char/reimon/soft.webp` | 26화 — 왕관의 밤 상단 회랑. 목소리 없는 손짓 하나로 홀 전체의 경비를 지휘하고, 곁에는 재상부의 '의전 보조' 넷이 서 |
| `cg_rmp28` | 🔴 격리 | `reimon/evidence_command.webp` | 벨포르=`char/belfor/soft.webp`<br>벨리안=`char/belian/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>약혼자(실루엣) | 28화 — 세 봉랍이 같은 주형에서 나왔다는 감정 결과. 회랑에서 내려진 확보 명령 '근위대는 증거를 따른다. 저 둘을 확보하 |
| `cg_rmp_good` | 🔴 격리 | `reimon/end_good.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp` | 30화 GOOD — 두 맹세의 화해. 검을 반납하지도, 한쪽을 버리지도 않은 채 북문을 나서는 길. 프롤로그 눈밭의 대구 |
| `cg_rmp_bad` | 🔴 격리 | `reimon/end_bad.webp` | 레이먼=`char/reimon/soft.webp` | 30화 BAD — 오명은 벗었으나 감옥이 더 촘촘해진 세계선. 프롤로그의 눈밭이 반복되고, 이번엔 곁의 한 사람까지 붙들려 함 |
| `cg_rmp_true` | 🔴 격리 | `reimon/end_true.webp` | 레이먼=`char/reimon/soft.webp` | 30화 TRUE — 구원 + 제3의 손 회수. 문장 없는 인장으로 봉해진 글자 있는 편지, 그리고 두 깃발 뒤에 남는 세 번째 |

### belfor — 4컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_bfp28` | 🔴 격리 | `belfor/he_chose.webp` | 벨포르=`char/belfor/soft.webp`<br>레이먼=`char/reimon/soft.webp`<br>약혼자(실루엣) | 28화 — 레이먼의 '저 둘을 확보하라'. 벨포르가 영애가 아니라 약혼자·집사를 확보한다 |
| `cg_bfp_good` | 🔴 격리 | `belfor/end_good.webp` | 벨포르=`char/belfor/soft.webp` | 30화 GOOD — 새벽 연병장. 1회차에 부러진 검이 놓였던 바로 그 자리에 검을 거꾸로 세워 꽂고 새 맹세를 한다 |
| `cg_bfp_bad` | 🔴 격리 | `belfor/end_bad.webp` | 벨포르=`char/belfor/soft.webp` | BAD 엔딩 공통 컷 — 15화 게이트①·25화 게이트②·30화 게이트③ 실패 분기에서 사용. 빗속 연병장에서 무릎에 검신을  |
| `cg_bfp_true` | 🔴 격리 | `belfor/end_true.webp` | 벨포르=`char/belfor/soft.webp`<br>아젤=`char/azael/soft.webp` | 30화 TRUE — 구원 + 제3의 손 회수. 봉랍이 눌린 각도로 '왼손'을 짚어내고, 미제 사건 번호를 남긴 뒤 검을 꽂는다 |

### belian — 4컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_blp28` | 🔴 격리 | `belian/swapped_chalice.webp` | 벨리안=`char/belian/soft.webp` | 28화 — 왕관의 밤 절정. 홀의 모든 눈이 증언대를 보는 사이, 무릎 꿇은 늙은 시종장이 품에서 이 나간 낡은 잔을 꺼내 독 |
| `cg_blp_good` | 🔴 격리 | `belian/end_good.webp` | 벨리안=`char/belian/soft.webp` | 30화 GOOD — 대관식. 주교의 손에서 왕관이 내려앉는 동안 벨리안은 눈을 감지 않고 곁에 남은 일곱을 센다. 이 나간 낡 |
| `cg_blp_bad` | 🔴 격리 | `belian/end_bad.webp` | 벨리안=`char/belian/soft.webp` | 30화 BAD — 대관식 직전, 왕관을 주교의 손에서 스스로 빼앗아 쓴다. 각본가의 빈 자리를 제가 삼키기로 한 순간. 이후  |
| `cg_blp_true` | 🔴 격리 | `belian/end_true.webp` | 벨리안=`char/belian/soft.webp` | 30화 TRUE — 대관식 새벽, 문서고에서 의전 명부 여백에 손톱을 대던 손이 붙들린다. 스무 해마다 봄을 꺾어 온 그 손이 |

### lilia — 4컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_lip29` | 🔴 격리 | `lilia/chancellor_turns.webp` | 릴리아=`char/lilia/soft.webp`<br>메피안(실루엣) | 29화 — 연행되던 메피안이 홀 문턱에서 돌아보며 "봄은 한 번 꺾인 적이 있지요… 두 번이 없으리라 보십니까?"라 남긴다.  |
| `cg_lip_good` | 🔴 격리 | `lilia/end_good.webp` | 릴리아=`char/lilia/soft.webp`<br>마리온=`char/marion/soft.webp`<br>리비아=`char/livia/soft.webp` | 30화 GOOD — 하이델 정원 문 앞. 스스로 선 공작영애가 이름 없는 조력자를 배웅하며 "은인이고, 공범이고, 벗이에요", |
| `cg_lip_bad` | 🔴 격리 | `lilia/end_bad.webp` | 릴리아=`char/lilia/soft.webp` | BAD 공통(15화 게이트 실패 / 25화 게이트 실패 / 30화 게이트 실패) — 프롤로그의 탑이 되풀이된다. 다만 이번에는 |
| `cg_lip_true` | 🔴 격리 | `lilia/end_true.webp` | 릴리아=`char/lilia/soft.webp`<br>메피안(실루엣) | 30화 TRUE(전 8루트 GOOD 관통) — 구원된 봄 위에서 릴리아가 '제3의 손'을 추적할 새 장부의 첫 줄에 일곱 이름 |

### azael — 3컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_azp_good` | 🟡 유지 | `azael/end_good.webp` | 아젤=`char/azael/soft.webp` | 30화 GOOD — 성 카나 대성당 재심정. 아젤이 제 손으로 갑주의 흰 천을 벗기고, 지워진 적 없는 문장이 아침빛에 드러난 |
| `cg_azp_bad` | 🟡 유지 | `azael/end_bad.webp` | 아젤=`char/azael/soft.webp` | 엔딩 BAD (15·25·30화 fail 공용) — 국경 이정표 아래, 문장이 뜯긴 백은 갑주와 봉랍이 뜯긴 빈 기록함 |
| `cg_azp_true` | 🟡 유지 | `azael/end_true.webp` | 아젤=`char/azael/soft.webp` | 30화 TRUE — 열두 해 전 명부 여백에서 같은 필적을 발견한 뒤, 문장이 온전한 갑주로 국경을 향해 서는 두 사람 |

### livia — 3컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_lvp_good` | 🔴 격리 | `livia/end_good.webp` | 릴리아=`char/lilia/soft.webp`<br>리비아=`char/livia/soft.webp` | 30화 GOOD — 볕 아래에서 릴리아가 그 이름을 소리 내어 세 번 부른다 |
| `cg_lvp_bad` | 🟡 유지 | `livia/end_bad.webp` | *(인물 없음)* | 30화 BAD / 15·25화 게이트 실패 — 텅 빈 별채. 이번엔 당신이 창밖에서 지켜본다 |
| `cg_lvp_true` | 🔴 격리 | `livia/end_true.webp` | 릴리아=`char/lilia/soft.webp`<br>리비아=`char/livia/soft.webp` | 30화 TRUE — 돌아온 상자에 답장 한 줄을 적어 넣는다. 정원 끝으로 이름 없는 손이 멀어진다 |

### lucienne — 3컷 (엔딩 3)

| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |
|---|---|---|---|---|
| `cg_lup_good` | 🔴 격리 | `lucienne/end_good.webp` | 루시엔=`char/lucienne/soft.webp` | 30화 GOOD — 실패할 자유. 실뜯개를 서랍에 넣고, 어긋난 한 땀을 그대로 둔 채 완성으로 선언한다. 사십오 분 규칙 폐 |
| `cg_lup_bad` | 🔴 격리 | `lucienne/end_bad.webp` | 루시엔=`char/lucienne/soft.webp` | 30화 BAD — 완벽의 감옥. 어긋난 한 땀을 뜯어내고 백합을 처음부터 다시 놓는 나날. 당신마저 '결함 있는 변수'로 얼려 |
| `cg_lup_true` | 🔴 격리 | `lucienne/end_true.webp` | 루시엔=`char/lucienne/soft.webp` | 30화 TRUE — 구원 + 제3의 손 회수. 어긋난 한 땀을 남긴 채, 스승의 편지·인장 없는 밀랍 조각·타다 만 '첫 봄, |

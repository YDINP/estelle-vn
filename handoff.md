# Handoff - EstelleVN
> 마지막 업데이트: 2026-07-27 (완성 스프린트)

## 배포
- **라이브: https://ydinp.github.io/estelle-vn/**
- `main` 푸시 → GitHub Actions 자동 빌드·배포 (`.github/workflows/deploy.yml`). 별도 조작 불필요
- 2026-07-27 완성 스프린트 14커밋(`391076d`~`0c08a5f`) 배포 완료.
  배포본에 대해 QA 전량 재실행: 8루트 전수 48/48 · TRUE 엔딩 6/6 · 엔진 스모크 29/29 · 콘솔 에러 0
- ⚠️ 현재 라이브는 **CG 31컷이 플레이스홀더** 상태다(아래 재생성 대기 항목). 게임 진행에는 지장 없다

## 현재 이슈

### 🔴 CG 35컷이 아직 구버전 캐릭터 외형 (재생성 대기)
CG를 처음 만들 때 `ILLUST-SPEC.md`의 **구버전 텍스트 서술**을 앵커로 써서, 그림 속 인물이
게임 속 캐릭터와 딴사람으로 나왔다(벨포르 갈발·감청군복 → 백금발·판금갑옷 / 벨리안 적발 → 금발 /
리비아 성인 녹색드레스 → 10대 시골옷 / 레이먼 흑발 → 청회색 등).

**해결책은 확정·검증됐다**: `tools/cg-generate.mjs`가 실제 캐릭터 아트
(`public/char/<id>/soft.webp`)를 codex image_gen에 **레퍼런스 이미지로 전달**한다.
이 방식으로 **96컷 중 61컷을 이미 교정 완료**했고 결과물은 원본 캐릭터와 정확히 일치한다.

**남은 35컷은 Codex 사용량 한도(리셋 2026-08-02)에 막혀 중단됐다.**
⚠️ **24개 엔딩 CG가 전부 이 목록에 있다** — 가장 중요한 컷들이다.

그중 **어긋난 인물이 등장하는 31컷은 `art-backup/mismatched-cg/` 로 격리**했다
(삭제 아님 — 되돌릴 수 있다). 배포본에서 빠졌으므로 게임은 엔진의 `.cg-missing` 폴백이
캐릭터 초상 위에 CG 제목을 얹은 플레이스홀더를 띄운다 — 깨진 이미지가 아니라 의도된 화면이다.
"다른 사람이 그려진 CG"를 그대로 두는 것보다 낫다고 판단했다.
나머지 4컷(아젤 엔딩 3 + 인물이 없는 `cg_lvp_bad`)은 실제 아트와 어긋나지 않아 배포본에 남겼다.

**목록**: `story/CG-REGEN-TODO.md` (컷별 상태·등장인물·**레퍼런스 파일 경로**·장면 요약) /
기계 판독용 `story/CG-REGEN-TODO.json`. 목록은 `node tools/cg-regen-report.mjs --apply` 로 재생성된다.

재개 방법 (한도 회복 후):
```bash
node tools/cg-worklist.mjs --emit --all     # 작업지시서 재생성
node tools/cg-generate.mjs --route <id> --batch 2 --all
node tools/cg-place.mjs --force             # 배치(기존본 덮어쓰기)
node .tmp/dupcheck.mjs                      # 루트 간 중복 배치 점검
```
루트별 잔여: marion 7 · reimon 7 · belfor 4 · belian 4 · lilia 4 · azael 3 · livia 3 · lucienne 3

**우선순위**: 엔딩 24종(`cg_*_good/_bad/_true`)을 먼저 돌려라 — 각 루트의 절정이고,
외형 오차가 가장 크게 남은 캐릭터(벨포르·벨리안·리비아·레이먼)의 결말 컷이 여기 몰려 있다.
한도가 또 걸릴 수 있으니 한 번에 다 돌리지 말고 엔딩 → 본편 순으로 나눠 실행할 것.

### 그 외
- 게임 진행에는 지장 없음. 8루트 × 31화 전부 플레이 가능, 검증 전량 통과.
- 다음 단계 후보: 앱인토스 패키징(granite/ait) 연동 · BGM/SFX 확충 · 코스메틱 시스템 재개(`COSMETICS_ENABLED=false`로 홀딩 중)

## 완성 스프린트 결과 (2026-07-27)

### 서사 — 8루트 × (프롤로그+30화) 완성
- 기존: 8루트 각 프롤로그+10화만 존재 / 11~30화는 `story/skeleton-*.md` 비트시트만
- 이번: **160화 신규 집필**(루트별 전담 작가 8인 병렬) + 루트당 **GOOD/BAD/TRUE 3엔딩 = 24엔딩**
- 각 루트 31화(index 1~31), 화당 30~55스텝, 선택지 1개(2옵션)
- `node tools/audit-story.mjs` → **HIGH 0 / MED 0 / LOW 0**

### 엔진 — 분기·엔딩 도입 + God File 해체 + 최적화
- **결의(resolve) 단일 축**: `ChoiceOption.resolve`(2=옳은 개입/1=무난). 누적 시 `resolve`와
  `resolveMax`(옵션 최대값)를 함께 쌓아 **비율**로 판정 → 루트별 선택지 수·배점 분포에 둔감
- **Gate**: 15·25·30화에만 존재. `threshold 0.7`. 30화는 GOOD/BAD/TRUE 3분기
  (TRUE = 전 8루트 GOOD 보유 시 개방). 정본은 `ENGINE-CONTRACT.md`
- `ui.ts` 1,281줄 → `src/game/ui/**` **17모듈**. VN 전역 13개 → `VnSession` 1객체
- **루트 대본 동적 import 코드분할**: 초기 JS **422kB → 85.6kB**(gzip 42.5kB), 루트별 65~80kB 지연 청크
- 엔딩 도감 탭(8×3), 완주 뱃지, 루트 재도전(진행도 초기화·엔딩 보존)
- 구 캐스트 고아 루트 7파일(2,671줄) 삭제

### 에셋
- CG **96/96 생성 완료** — 엔딩 24종(`end_{good,bad,true}.webp`) + 본편 72컷.
  1086×1448 세로 3:4, PNG→WebP 약 -89%
- `cgs.ts` 15항목 → **111항목**, 파일 없음 **0건**. livia 표정 16종 정상 확인
- 배포 정리: backup 폴더·미참조 프리뷰 6장 → `art-backup/`, UI 패널 WebP화(2.0MB→224KB).
  `public/` 65M → 62M

## 작업 상태
- [x] 8루트 11~30화 집필 + 게이트 3 + 엔딩 3
- [x] 분기·엔딩 엔진 구현 + 엔딩 도감 + 재도전
- [x] ui.ts 모듈 분해 · 코드분할 · lazy 이미지 · 이벤트 위임 · paginate probe 재사용
- [x] 엔딩 CG 24장
- [x] `card.quote` 22건 정합화 (그 화 실제 대사로 교체)
- [x] 구 캐스트 이름 잔존·삭제파일 참조 주석 제거
- [x] CG 96장 생성·배선 (엔딩 24 + 본편 72)
- [x] 검증: `tsc` 0 · `vite build` 성공 · 감사 HIGH/MED/LOW 0 ·
      엔진 스모크 29/29 · TRUE 엔딩 6/6 · 8루트 전수 48/48 · 콘솔 에러 0
- [x] 통합 커밋 (`5b86fbe` → `f167740`)

## 신규 도구 (`tools/`)
| 도구 | 용도 |
|---|---|
| `audit-story.mjs` | 8루트 정합성 자동감사 — 화수/index/게이트/왕관의밤 6비트/금지어/회귀누설/card.quote/CG대조 |
| `cg-worklist.mjs` | 매니페스트 대비 미생성 CG 집계 → `.tmp/cg-todo.json` |
| `cg-generate.mjs` | codex image_gen 직접 구동(서브에이전트 없이) |
| `cg-place.mjs` | 스테이징 PNG → WebP 변환·배치(멱등) |
| `png2webp.mjs` | 단건 변환. 1086×1448 유지, 약 -89% |
| `serve-dist.mjs` | QA용 정적 서버 (아래 참고) |

## 참고 사항 (⚠️ 다음 작업자)
- **`vite preview`로는 헤드리스 QA가 안 된다.** `Sec-Fetch-Dest: script` 요청을 404로 막는
  미들웨어가 있어 브라우저에서 번들 로드가 실패한다(curl은 통과해서 오진하기 쉽다).
  QA는 `node tools/serve-dist.mjs` 로 띄워라 — 정적 호스팅과 동일 조건이다.
- **CG 스테이징 파일명은 반드시 `<route>__<file>.png`.** 서로 다른 루트가 같은 `file`명을
  쓰는 경우가 6종 있다(`seven_threads`·`the_seizure`·`sealed_gate`·`lost_script`·`three_hours`·
  `three_hours_to_midnight`). 평면 이름으로 두면 뒤 생성물이 앞 것을 덮어써 **엉뚱한 루트의
  그림이 배치된다** — 실제로 livia에 marion 그림이 들어간 사고가 있었다(`.tmp/dupcheck.mjs`로 검출·복구).
- **이미지 생성은 서브에이전트보다 `tools/cg-generate.mjs` 직접 구동이 안정적이다.**
  서브에이전트는 Anthropic API 529에 취약해 중간에 죽는다. codex는 OpenAI 경로라 영향이 없다.
- 기존 `public/cg/belian/` 의 구 CG 7장(`throne_night` 등)은 **벨리안이 적발로 잘못 그려진**
  개편 전 잔재다. 정본은 금발 — 배선하지 말 것.
- `routes.ts`의 `ENDING_INFO`는 엔딩 도감 표시용 제목/요약이다. 엔딩 프로즈를 고치면 함께 갱신할 것.

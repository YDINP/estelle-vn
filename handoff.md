# Handoff - EstelleVN
> 마지막 업데이트: 2026-07-27 (완성 스프린트)

## 현재 이슈
- 본편 CG 일부 미생성. `node tools/cg-worklist.mjs` 로 잔여 확인 → `node tools/cg-generate.mjs --route <id>` 로 생성 → `node tools/cg-place.mjs` 로 배치.
  엔진에 `.cg-missing` 폴백이 있어 **미생성 상태에서도 게임은 완주 가능**하다.
- 그 외 블로커 없음. 8루트 전 화 플레이 가능, 검증 전량 통과.

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
- 엔딩 CG **24/24** 생성 (`public/cg/<route>/end_{good,bad,true}.webp`)
- 본편 CG는 8루트 매니페스트(`story/cg-manifest-*.json`) 기준 생성 진행 중
- `cgs.ts` 15항목 → **111항목**. livia 표정 16종 정상 확인. backup 폴더는 `art-backup/`으로 이관

## 작업 상태
- [x] 8루트 11~30화 집필 + 게이트 3 + 엔딩 3
- [x] 분기·엔딩 엔진 구현 + 엔딩 도감 + 재도전
- [x] ui.ts 모듈 분해 · 코드분할 · lazy 이미지 · 이벤트 위임 · paginate probe 재사용
- [x] 엔딩 CG 24장
- [x] `card.quote` 22건 정합화 (그 화 실제 대사로 교체)
- [x] 구 캐스트 이름 잔존·삭제파일 참조 주석 제거
- [x] 검증: `tsc` 0 · `vite build` 성공 · 엔진 스모크 29/29 · TRUE 엔딩 6/6
- [ ] 본편 CG 잔여 생성
- [ ] 통합 커밋

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

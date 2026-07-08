# PRD — 6루트 스토리 게임 접목 계획

> 2026-07-08. story/ 마크다운 6루트(route-*.md)를 게임 데이터로 접목.
> 전제: story/ 집필 완료(39eef28), 정합성 SSOT = story/SHARED-TIMELINE.md.

## 1. 현황 진단 (조사 완료)

| 계층 | 현황 | 접목 작업 |
|---|---|---|
| **상태(state.ts)** | `routes: Record<id,{epCleared,nextEpFreeAt}>` + `ensureRoute()` 이미 루트-제네릭 | **수정 불필요** ✅ |
| **소비부(ui.ts)** | `ROUTES[]`의 episodes/daily/available만 참조 (홈·에피소드·일일·수집 전부) | **수정 불필요** ✅ |
| **루트 데이터** | estelle(season1.ts)·rozelin(rozelin_route.ts) 2종만 존재 | 6종 신규 TS 파일 |
| **배선(routes.ts)** | 6루트 `episodes:[], available:false` 스텁 | import 연결 + available:true |
| **CG 레지스트리(cgs.ts)** | estelle 12·rozelin 8·valen 6(스텁, unlockEp 없음) | 6루트 unlockEp 매핑 |
| **포트레이트/버스트** | 6캐릭터 전부 16종 완비 | **에셋 불필요** ✅ |
| **CG 이미지(public/cg)** | valen 6개만 존재. eden·isolde·adele·rayner·michael = **0개** | ⚠️ ~40개 신규 필요 (핵심 병목) |
| **일일 씬** | route-*.md는 에피소드만 집필, daily 미집필 | 루트당 3~5개 신규 or 공유 |
| **기존 카논** | SHARED-TIMELINE §4 수정안 미적용 | A1~4 채택분 적용 |

**결론:** 코드 배선은 가볍다(파일당 데이터 1 + 3줄 edit). 실제 병목은 ① 마크다운→TS 변환 물량 ② CG 이미지 에셋.

## 2. 선결 결정 사항 (사용자 확인 필요)

- **D1. CG 이미지 전략** — 5캐릭터 ~40장이 없다. 택1:
  - (a) **그레이스풀 폴백** — CG 없이 우선 접목(포트레이트로 진행), 이미지는 추후. → 가장 빠름, 플레이 가능. *(권장: 스토리 검증 우선)*
  - (b) 기존 CG 재사용 매핑(무드 유사 컷 차용) — 즉시 시각 채움, 정합성 낮음
  - (c) 이미지 생성 파이프라인으로 신규 제작 — 최고 품질, 최장 시간
- **D2. 일일 씬** — 루트당 daily 3~5개 (a)신규 집필 (b)에피소드에서 발췌 (c)에스텔 공유 폴백(현 코드 기본값)
- **D3. 공개 범위/순서** — 6루트 동시 open vs 단계 공개(관계망 밀도순: 이든→클로에→레이너→이졸데→발렌→미카엘)
- **D4. 기존 카논 수정** — SHARED-TIMELINE §4 채택분(A1~4) 적용 여부 + 선택분(B1~5, season1.ts/rozelin 본편 터치)

## 3. 접목 파이프라인 (멀티에이전트)

### Phase 0 — 변환 계약 확정 (선행, 단독)
- rozelin_route.ts를 템플릿으로 **변환 스펙** 확정: 마크다운 기법(`>` 나레이션 / `**화자** [감정]:` / `◆ 선택` / `【CG】`) → 빌더(N/E/R/… / CH / CG/CGX) 1:1 매핑 규칙 문서화.
- 감정 문자열 검증: route-*.md 사용 감정이 characters.ts Emotion 유니온에 전부 존재하는지 grep 대조.
- CG id 네이밍 규칙 확정(cg_{char머리글자}{n}) + 파일명 매핑.

### Phase 1 — 마크다운→TS 변환 (6에이전트 병렬)
- 각 에이전트: `story/route-{id}.md` → `src/data/{id}_route.ts` (rozelin_route.ts 구조 복제: EPISODES + DAILY export, 빌더, teaser/card/rewardCoins).
- 산출 검증: 에이전트가 `npx tsc --noEmit`로 자기 파일 타입 통과 확인.
- **파일 격리**(각자 다른 신규 파일) → worktree 불필요, 충돌 없음.

### Phase 2 — 배선 통합 (단독, 순차)
- `routes.ts`: 6루트 import 연결 + available:true (D3 따라 일부만).
- `cgs.ts`: 6루트 CG 엔트리 unlockEp 매핑(D1이 (a)면 파일 없어도 엔트리는 등록, 폴백 처리 확인).
- `daily.ts` or 루트 파일: D2 결정 반영.
- CG 그레이스풀 폴백 코드 확인/보강(이미지 404 시 포트레이트 유지).

### Phase 3 — 기존 카논 적용 (D4 채택 시, 단독)
- STORY-BIBLE §0/§2/§3: A1~4 반영.
- (선택) season1.ts/rozelin_route.ts: B1~5 additive 라인 삽입. **병행 세션 주의** — edit 직전 재-Read.

### Phase 4 — 빌드·QA 검증 (단독)
- `npm run build` (tsc+vite) 통과.
- dev 서버(5180) playwright: 루트 진입→1화 재생→선택지→CG 표시→클리어→수집 해금 스모크 테스트(루트당 1패스).
- 회귀 방지: 기존 estelle/rozelin 루트 정상 동작 확인.

## 4. 작업량 추정

| Phase | 병렬성 | 산출 |
|---|---|---|
| 0 변환 계약 | 단독 | 변환 스펙 문서 |
| 1 변환 | 6병렬 | src/data/*_route.ts 6종 (~2500줄) |
| 2 배선 | 단독 | routes.ts/cgs.ts/daily.ts edit |
| 3 카논 | 단독 | STORY-BIBLE + (선택)본편 edit |
| 4 QA | 단독 | 빌드 통과 + 스모크 6패스 |

## 5. 리스크

- **CG 부재**(D1): (a) 선택 시 플레이는 되나 연출 밋밋 → 스토리 검증 후 에셋 별도 스프린트 권장.
- **병행 세션 레이스**: routes.ts/cgs.ts/season1.ts는 공유 파일 → edit 직전 재-Read 필수, dist는 dev 서버로 검증.
- **감정 문자열 불일치**: 마크다운 자유 표기가 Emotion 유니온 밖일 수 있음 → Phase 0에서 사전 grep 대조로 차단.
- **teaser/card/rewardCoins**: 마크다운에 카드 quote는 있으나 teaser·보상 코인은 변환 시 생성 필요(에이전트가 화 훅에서 도출).

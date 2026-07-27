# ENGINE-CONTRACT — 분기·엔딩 엔진 계약서

> 확정: 2026-07-27 · 이 문서는 **엔진 구현팀**과 **8개 루트 집필팀**이 동시 병렬로
> 작업하기 위한 단일 계약이다. 양측 모두 이 문서를 정본으로 삼는다. 임의 변경 금지.

---

## 0. 왜 이 계약이 필요한가

현재 엔진은 **완전 수렴형**이다. `ChoiceOption.result`가 항상 본류로 합류하므로
선택이 결말을 가르지 못한다. `PRD-story-overhaul.md` §1이 요구하는
**엔딩 게이트 3곳(15화·25화·30화)** 을 구현하려면 최소한의 분기 개념이 필요하다.

설계 원칙: **최소 침습**. 기존 `Step` 4종(line/choice/cg/cgEnd)은 **그대로 둔다.**
분기는 `Episode` 레벨에서 단 하나의 개념(`Gate`)으로만 표현한다.

---

## 1. 결의(resolve) — 단일 누적 축

플레이어의 선택 품질을 **하나의 축**으로 누적한다. 플래그 다발을 만들지 않는다.

```ts
export interface ChoiceOption {
  label: string;
  affection?: number;
  resolve?: number;   // ★신규: 이 선택의 '결의' 점수. 관례 = 2(옳은 개입) / 1(무난)
  result: Line[];
}
```

**누적 규칙 (엔진 구현)**: 선택지를 고르는 순간
- `resolve   += (고른 옵션의 resolve ?? 0)`
- `resolveMax += (그 선택지 옵션들 중 최대 resolve)`

→ 판정은 **절대값이 아니라 비율** `resolve / resolveMax` 로 한다.
선택지 개수·배점 분포가 루트마다 달라도 게이트가 공정하게 동작한다.
다시보기(`grantRewards === false`)에서는 **누적하지 않는다**(기존 호감도 규칙과 동일).

---

## 2. Gate — 엔딩 게이트

```ts
export type EndingType = "good" | "bad" | "true";

/** 엔딩 게이트. 15·25·30화에만 존재한다. steps 재생이 끝난 직후 평가된다. */
export interface Gate {
  /** 통과 기준 비율 (resolve / resolveMax). 전 루트 0.7 고정 */
  threshold: number;
  /** 통과 분기 프로즈 */
  pass: Step[];
  /** 실패 분기 프로즈 (파멸/배드) */
  fail: Step[];
  /** 실패 시 확정되는 엔딩. 지정되면 루트는 여기서 종료된다 */
  failEnding?: EndingType;
  /** 통과 시 확정되는 엔딩. 30화에서만 "good" */
  passEnding?: EndingType;
  /** 전 8루트 good 보유 시 pass 대신 재생되는 진엔딩. 30화에서만 */
  trueSteps?: Step[];
}

export interface Episode {
  id: string; index: number; title: string; teaser: string;
  rewardCoins: number;
  card: { title: string; quote: string };
  steps: Step[];
  gate?: Gate;   // ★신규
}
```

### 재생 순서 (엔진 구현 명세)

```
steps 전부 재생
  → gate 없음: 평소대로 종료(에피소드 클리어 기록)
  → gate 있음:
       ratio = resolveMax > 0 ? resolve / resolveMax : 1
       통과(ratio >= threshold):
          trueSteps 있고 && 전 8루트 good 보유  → trueSteps 재생, 엔딩 "true" 기록
          아니면                                 → pass 재생, passEnding 있으면 기록
       실패(ratio < threshold):
          fail 재생, failEnding 기록
```

**엔딩이 기록되면**(`failEnding`/`passEnding`/true) 그 루트는 **완주 처리**된다.
플레이어는 루트를 다시 시작해 다른 엔딩을 볼 수 있어야 한다(재도전 = 진행도 초기화, 엔딩 기록은 누적 보존).

### 게이트 3종 배치 (전 루트 동일)

| 화 | index | gate | 의미 |
|---|---|---|---|
| 15화 | 16 | `threshold 0.7`, `failEnding: "bad"` | 배드 게이트① — 죄에 처음 굴복 |
| 25화 | 26 | `threshold 0.7`, `failEnding: "bad"` | 배드 게이트② — 프롤로그 반복 |
| 30화 | 31 | `threshold 0.7`, `passEnding: "good"`, `failEnding: "bad"`, `trueSteps` | 최종 3분기 |

15·25화의 `pass`는 **짧게**(3~6스텝) — 위기를 넘겼다는 안도 + 다음 막 훅.
15·25화의 `fail`은 **완결된 배드엔딩**(10~16스텝) — 그 죄에 삼켜지는 결말.

---

## 3. 세이브 확장 (엔진 구현)

```ts
export interface RouteProgress {
  epCleared: string[];      // 기존
  resolve: number;          // ★신규
  resolveMax: number;       // ★신규
  endings: EndingType[];    // ★신규 — 중복 없이 누적
}
```

- 구 세이브 호환: 없는 필드는 `0` / `[]` 로 채운다(기존 얕은 병합 마이그레이션 지점에서 처리).
- `state.routes[id]`가 문자열 배열 등 구형이면 `{ epCleared: 구값, resolve: 0, resolveMax: 0, endings: [] }` 로 승격.

---

## 4. 집필팀 계약 (8개 루트)

### 4-1. 담당 파일 — **자기 루트 파일 1개만 수정한다**

| 루트 | 파일 | id 프리픽스 | 현재 마지막 | 집필 범위 |
|---|---|---|---|---|
| lilia | `src/data/lilia_route.ts` | `lip` | lip10 (index 11) | lip11~lip30 (index 12~31) |
| marion | `src/data/marion_route.ts` | `map` | map10 | map11~map30 |
| belfor | `src/data/belfor_route.ts` | `bfp` | bfp10 | bfp11~bfp30 |
| belian | `src/data/belian_route.ts` | `blp` | blp10 | blp11~blp30 |
| lucienne | `src/data/lucienne_route.ts` | `lup` | lup10 | lup11~lup30 |
| livia | `src/data/livia_route.ts` | `lvp` | lvp10 | lvp11~lvp30 |
| reimon | `src/data/reimon_route.ts` | `rmp` | rmp10 | rmp11~rmp30 |
| azael | `src/data/azael_route.ts` | `azp` | azp10 | azp11~azp30 |

**절대 건드리지 않는 파일**: `routes.ts`, `cgs.ts`, `chapters.ts`, `season1.ts`,
`characters.ts`, `src/game/**`, 다른 루트의 `*_route.ts`. (동시에 다른 팀이 작업 중)

### 4-2. 소급 작업 — 기존 1~10화 선택지에 `resolve` 부여

이미 작성된 화들의 `ChoiceOption`에 `resolve` 필드를 추가한다.
**옳은 개입/통찰 = 2, 무난·안전 = 1.** 두 옵션이 대등하면 둘 다 2도 허용.
`affection` 필드는 그대로 둔다(제거 금지).

### 4-3. CG 배선 — 호출만 하고, 등록은 하지 않는다

`cgs.ts`는 다른 팀 소유다. 집필팀은 **`CG("cg_xxNN")` 호출만** 넣고,
자기 루트의 CG 명세를 **`story/cg-manifest-{루트id}.json`** 으로 산출한다.

```json
[
  { "id": "cg_lip11", "char": "lilia", "title": "인쇄소의 재",
    "file": "printing_ash", "unlockEp": "lip11",
    "scene": "11화 — 한발 늦게 도착한 인쇄소, 타다 만 전단 더미",
    "cast": "릴리아 + 당신 POV",
    "prompt": "a burnt-out backstreet printing workshop at dawn, ..." }
]
```

- `id` = `cg_{프리픽스}{화번호}` (엔딩은 `cg_{프리픽스}_good` / `_bad` / `_true`)
- `file` = 영문 스네이크케이스, 실제 경로는 `public/cg/{char}/{file}.webp`
- `prompt` = `ILLUST-CG-LIST.md` 공통 규약 [A] 화풍 앵커 **뒤에 붙일 영문 장면 서술만**
- **CG 편성 원칙**: 11~30화 중 **막의 절정 화에만** 배치(권장 8~10장/루트)
  + **엔딩 3종은 필수**(good/bad/true) → 루트당 **총 11~13장**
- 이미지 파일은 아직 없다. 엔진에 폴백(`.cg-missing` 플레이스홀더)이 있으므로 안전하다.

### 4-4. 집필 규격 (PRD-story-overhaul §1 페이싱 독트린 준수)

각 화 = `steps` 배열, 권장 30~55스텝.

1. **콜드오픈** — 직전 화 훅을 3스텝 안에 회수. 대화만으로 시작 금지.
2. **온스크린 사건 1개 이상** — 잠입·잠복·목격·대치·통보 중 하나가 실제로 벌어진다.
3. **내레이션 연속 2문장 제한.** 회귀 지식 재설명은 루트당 1회.
4. **선택지 1개**(2옵션, `resolve` 부여). 15/25/30화 외에는 **수렴형**
   — `result`가 다르지만 이후 스토리는 동일하게 흐른다.
5. **엔드 훅** — 새 정보 + 미해결로 끝낸다. `teaser`에 그 훅을 한 줄로.
6. **5의 배수 화(15·20·25·30)** 는 "암전 직전 한 컷"급 대반전.
7. **엔드 훅 유형 3연속 동일 금지**: 정체 폭로 / 오해의 씨앗 / 시한폭탄 / 편지·증거 한 줄 / 배신 예고 / 죄의 유혹.
8. `card.quote` 는 **그 화에 실제로 나온 대사**여야 한다. 창작 문구 금지.
9. `rewardCoins` 는 화가 진행될수록 완만히 증가(11화 ~56 → 30화 ~120 권장).

### 4-5. 불변 3축 (위반 시 전량 반려)

1. **회귀 비밀 누설 금지** — 어떤 캐릭터도 끝까지 회귀를 알지 못한다.
   허용 상한은 **'무귀속 서늘함'**(이유 모를 기시감)까지. 자각·추적·고백 금지.
2. **왕관의 밤 D-0 6비트 골격 불변** — 26~28화에 아래 순서 그대로 재현.
   시점(카메라)만 바꾸고 순서·표적·취지는 절대 변경 금지.
   1. **고발** — 자정 종, 메피안 "황실의 이름으로 — 하이델 공작영애를 반역 혐의로 고발합니다."
   2. **위증 거부(마리온)** — 증언대에서 "대본을 잃어버렸네요."
   3. **봉랍 증언(아젤)** — 재상부 예비 인장 / 검인청 대조 견본을 근거로 공식 증언.
   4. **확보(레이먼 명령 / 벨포르 집행)** — "근위대는 증거를 따른다. 저 둘을 확보하라"
      → **표적 = 약혼자·집사**(릴리아 아님, 불변).
   5. **벨리안 재가** — "재상, 짐의 검을 시험하는가."
   6. **메피안 실각** — 끌려가며 "봄은 한 번 꺾인 적이 있지요… 두 번이 없으리라 보십니까?"
   ⚠️ **어떤 루트도 "내가 그 밤의 유일 원인"이라 주장 금지.** 각 루트의 기여는
   서로 다른 장애물을 다루는 **병존 기제**로만 서술한다.
3. **'악녀' 직접 호칭 금지** — 가시/장미/배역/소문 등 은유로만.

### 4-6. 톤 규칙

- **GOOD/TRUE 엔딩 = 로맨스 불성립.** 관계 상한 = 은인·공범·벗.
  고백·연인 선언·커플 엔딩 금지.
- **BAD 엔딩에서만** 집착·타락·비극·파국(사망 포함)이 개방된다.
- **전체이용가 선 엄수** — 선정성·성적 대상화 절대 금지. 아젤의 '색욕'은
  로맨스가 아니라 **미혹**(거짓 성사·성물매매)으로 표현한다.
- **주인공 '당신'은 성별·외모 비묘사.** CG에도 얼굴로 등장하지 않는다
  (뒷모습 실루엣·손·어깨까지만).
- **30화 GOOD은 프롤로그 유언과 대구를 이루는 '에코 대사'로 닫는다**
  — 캐릭터는 자기가 무엇을 되풀이하는지 모른 채 말한다. 이것이 이 게임의 마지막 장치다.

### 4-7. 완료 검증 (집필팀 자체 수행)

```bash
npx tsc --noEmit          # 타입 통과 필수
```
+ 자기 루트 파일에서 `id`/`index` 연속성(갭·중복 없음), 게이트 3개 존재,
`story/cg-manifest-{id}.json` 유효 JSON 여부를 직접 확인하고 보고한다.

---

## 5. 엔진팀 계약

1. `chapters.ts`에 `ChoiceOption.resolve?: number` 추가.
2. `season1.ts`에 `EndingType` · `Gate` · `Episode.gate?` 추가.
3. `state.ts` — `RouteProgress` 승격 + 마이그레이션.
4. VN 엔진 — 선택 시 resolve/resolveMax 누적, 에피소드 종료 시 게이트 평가·분기 재생.
5. UI — 엔딩 도감(루트별 good/bad/true 획득 표시), 완주 루트 재도전 진입점.
6. `ui.ts` 분해 · 루트 데이터 동적 import 코드분할 · 이미지 lazy/decode 힌트 · paginate probe 재사용.

**엔진팀은 `src/data/*_route.ts` 8개 파일을 절대 수정하지 않는다** (집필팀이 동시 작업 중).

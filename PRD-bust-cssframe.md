# PRD — 흉상 bust_* 에셋 제거 · 전신 CSS 영역지정 통일

> 결정(2026-07-10, 사용자): "흉상/전신을 bust_* 로 따로 두지 말고 영역지정(CSS 크롭)만으로 구분."
> 범위 = 페이지 + 게임 + 파일 근본 정리. **기준 = marion** (머리~허리 반신 프레이밍).

## 배경 / 근거
- 아트 2세트: 전신 `{emotion}.png` + 상반신 `bust_{emotion}.png` (각 16표정).
- 실측 결과: **marion만 bust≠body(진짜 크롭, 928×1695→645×1031)**. 나머지 7종은 `bust_soft`가
  `soft`와 치수 동일 = **중복 파일**. 인게임 반신/VN 초상은 7종은 이미 body를 표시 중.
- lilia 등 body는 이미 머리~허리 반신 구도(옆여백 적음, 머리 상단). marion body만 발끝 전신.

## 방식 (최소침습·무회귀)
- 단일 세트(body = `{emotion}.png`)만 유지. `bust_*.png` 전량 삭제.
- "반신" = body를 CSS로 크롭. 캐릭터별 `bustZoom`(기본 1) — **marion만 ≈1.44**(928/645, top-center).
  7종은 zoom=1 → 렌더 무변경(회귀 0). marion만 전신→머리~허리로 확대.
- illust 뷰어 3모드 유지: 반신(bustZoom 크롭) / 흉상(기존 `.chest` 강크롭) / 전신(원본).
- extras(fiance·mephian: bust_soft만 보유) → `bust_soft.png`→`soft.png` 리네임, body:["soft"].

## 변경 파일
- `src/data/characters.ts`: `bust` 필드 제거 → `bustZoom?` 추가. `vnFile`/`resolveEmotion`/
  `isPlaceholderArt` body 기준. CHARACTERS 정리(marion bustZoom).
- `src/game/cheats.ts`, `src/game/ui.ts`: `c.bust` 참조 → `c.body`. setIllustMode = body + CSS 모드클래스.
- `src/style.css`: `--bz` 기반 반신 크롭(VN portrait·illust bust). 7종 identity.
- `public/char/*/bust_*.png`: git rm (extras는 soft로 리네임 후).
- `public/character-profiles.html`·`public/relationship-chart.html`: `bust_soft.png`→`soft.png`.

## 완료 기준 (검증)
- `npx tsc --noEmit` 통과 / `npm run build` 성공.
- playwright 스크린샷: VN 반신(marion=머리~허리, 타캐=기존과 동일) · illust 3모드 · 프로필 · 관계도 정상.
- 이미지 404 없음. git rm 은 되돌리기 가능(안전).

## 리스크
- 7종 bust=body 가정: 치수 동일 확인. 만약 내용 상이 시 스크린샷서 발견→git 복원.
- marion bustZoom 값은 스크린샷 보고 미세조정.

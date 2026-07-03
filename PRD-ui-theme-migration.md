# PRD — UI 테마 마이그레이션 (자수정 → 웜 브라운/골드)

> 2026-07-03 · Claude Design "EstelleVN UI" 디자인 시스템 기준

## 배경
대화패널 원화(`public/ui/panel.png` — 다크브라운 가죽 + 금장 로코코 + 핑크 로즈/보석)를
전체 UI의 주축 컨셉으로 확정. 기존 자수정/보라(심야 궁정) 톤과 패널이 이질적이므로
전 화면을 웜 브라운 톤으로 통일한다.

## 디자인 토큰 (Claude Design foundations/colors 정본)
| 토큰 | 기존 | 신규 |
|---|---|---|
| --bg0 | #1a1026 | #150a05 |
| --bg1 | #2a1836 | #26130a |
| --panel | rgba(56,32,74,.72) | rgba(74,41,23,.8) |
| --gold | #e9c46a | #d8a44a |
| --gold-soft | #f4e3b0 | #f3dfa4 |
| --rose | #e6a4c4 | #f0b3cb |
| --text | #f5eefb | #f6ead2 |
| --muted | #c9b6dd | #c9ac85 |
| --line | rgba(233,196,106,.35) | rgba(216,164,74,.4) |

## 원칙
- **CSS-only**: `src/style.css`만 수정, ui.ts/HTML 구조 무변경
- 골드 = 장식·테두리·제목 / 로즈 = 감정·보상·CTA 포인트 전용
- 패널 모티프 번안: 이중 금테 프레임(inset box-shadow), 핑크 보석 다이아(::before/::after),
  명조 디스플레이(타이틀·명판·시트 제목)
- 텍스트 앵커(.panel 내부 vn-name/vn-text 좌표)는 기존 값 유지 (이미 원화 기준 보정됨)

## 완료 기준
- 빌드(tsc + vite) 통과
- playwright 스크린샷: 타이틀/홈 화면에 보라 잔재 없음, 가독성 유지

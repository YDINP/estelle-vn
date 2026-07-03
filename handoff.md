# Handoff - EstelleVN
> 마지막 업데이트: 2026-07-03

## 현재 이슈
- 없음 (UI 테마 마이그레이션 완료)

## 작업 상태
- [x] 세드릭 bust_greet/bust_smirk 형광녹색 배경 제거 (크로마키+디스필, 원본 `backup-green/`)
- [x] 에스텔 전신 10종 흰 스티커 아웃라인 잔재 제거 (원본 `backup-outline/`)
      — 실루엣에 붙은 얇은 중성백색 조각(≤80px·경계접촉 40%↑) + 분리 섬 + 반투명 프린지만 제거.
      소매/신발 하이라이트 등 원화 보존 확인. 손가락 주변 웜톤 밝은 패치는 머리카락 원화로 판단해 보존.
- [x] Claude Design "EstelleVN UI" 디자인 시스템 구축 (foundations 3 + components 8 + screens 3 + assets 3)
- [x] `src/style.css` 웜 브라운/골드 테마 마이그레이션 (자수정 → panel.png 주축 컨셉)
- [x] 신규 UI 스타일 보완: `.vn-exit`(나가기), `.vn-cg`(CG 연출), `.toasts`/`.toast-item`(우상단 알림 스택)
- [x] 빌드 + playwright 비주얼 QA (타이틀/홈/VN/이야기 시트)

## 주요 변경 사항
- `src/style.css` 전면 재작성 — CSS-only, ui.ts/HTML 무변경. 상세: `PRD-ui-theme-migration.md`
- 디자인 규칙: 골드=장식·테두리·제목 / 로즈=감정·보상·CTA 전용 / 차가운 색 금지
- 디스플레이(제목·명판·시트헤드)는 명조 스택(Nanum Myeongjo) 적용

## 참고 사항 (⚠️ 다음 작업자)
- **다른 세션과 병행 주의**: 이번 세션 중 ui.ts에 `#vnExit`/`#vnCg`/`#toasts`가 추가된 것을 감지 —
  해당 요소의 CSS를 이 세션이 새로 작성함. 만약 다른 세션에 미저장 style.css 변경이 있다면
  현재 파일 기준으로 병합할 것 (구 `#toast` 단일 토스트 규칙은 제거됨, `.toast-item` 스택형으로 대체)
- 대사 패널 텍스트 앵커(.panel 내부 좌표)는 기존 값 유지 (원화 기준 이미 보정된 값)
- 디자인 정본은 Claude Design 프로젝트 "EstelleVN UI" (claude.ai/design)

# Handoff - EstelleVN
> 마지막 업데이트: 2026-07-07

## 현재 이슈
- 없음. 미커밋 상태였던 대사 시스템 v2 + 서브 캐릭터 7종 표정 재적용을 검증(빌드 통과) 후 커밋 완료
  (bc365e1, fa23256). 하네스 스캐폴딩(.claude/, shared/ 등)은 .gitignore 처리.

## 작업 상태
- [x] 잠금 루트 6캐릭터 스토리 집필 (2026-07-08, 멀티에이전트 워크플로우): story/ 폴더에 마크다운 전용
      (게임 미접목 — 사용자 지침). 파이프라인=러프 아웃라인 6종 병렬 → 정합성 통합 1 → 풀 스크립트 6종 병렬
      (13에이전트, Opus 4.8, 183만 토큰). 산출: outline-{id}.md 6 + SHARED-TIMELINE.md + route-{id}.md 6.
      각 루트 8화(클로에 9섹션), route는 화당 45~70줄 정본급(콜드오픈=1회차 결말→회귀→비트→수렴선택지→엔드훅,
      감정지정·dialogue.ts 보이스·CG앵커 연동). ⚠️ SHARED-TIMELINE이 정합성 SSOT — 왕관의 밤 동선표(시간대×8캐릭터),
      회귀=전루트 D-300 고정(레이너/미카엘 구 표기 수정), "저 둘을 확보하라"=약혼자·집사 확정, 교차매핑 13축.
      §4에 기존 카논 수정안 채택4(A1~4)/선택5(B1~5)/기각2 정리 — 루트 open 시 season1.ts/rozelin_route.ts/STORY-BIBLE에 적용
      (지금은 코드 무수정). 금지어(악녀/연인/고백) 스캔 0위반. PRD-story-6routes.md/TASKS-story-6routes.json
- [x] 잠금 루트 6캐릭터 보이스 집필 (2026-07-07): dialogue.ts VOICES에 eden(경어체 보고 말투)·
      valen(여유+칼날, '짐')·isolde(완결 문장만)·adele/클로에(반말 소녀, 직언)·rayner(최소 단문)·
      michael(이국적 격식, 기록/맹세/빛) 추가 — STORY-BIBLE §3 목소리 가이드 준수.
      각 인사 32(4시간대×4티어×2) + 대화 12(4티어×3) + 선물 3 + 혼잣말 6(각 3줄, 15🪙).
      ⚠️ 로맨스 불성립(벗·친구 상한)·회귀 뉘앙스 금지·'악녀' 호칭 금지 전부 준수.
      혼잣말은 각자 현재 시점 스토리(1회차 결말 언급 금지 — 그건 주인공만 아는 정보).
      tsc 통과. 이제 전 루트 캐릭터 보이스 완비 — 폴백 실사용 없음
- [x] docs/relationship-chart.html 인물관계도 재구성 (2026-07-07):
      ① STORY-BIBLE v3 반영 — 구원 서사/로맨스 불성립/회귀 비밀(§0-3) 명문화, 당신="회귀자 · 이름
      없는 은인", 엔딩 그리드를 "1회차 결말 → 구원" 포맷으로 전면 교체, 관계 라벨 갱신(민낯 친구·
      대본 밖의 사람·배역 강요 등) ② 겹침 해소 — 약혼자 (150,290) 이동, 레이너→발렌 직선을 좌측
      우회 커브(Q50,285)로, 장미vs백합 (905,400), 로젤린 캡션 3줄 고정(가시 돋친 배역 nowrap span —
      한글은 &nbsp;로 줄바꿈 못 막음, CJK는 글자 사이 어디서든 개행). playwright 렌더 검증 완료
      (qa-shots/chart-p1/p2.png). ⚠️ 차트 이미지가 localhost:5180 참조 — 열람 시 dev 서버 필요
- [x] 대사 로맨스 불성립 톤 재조정 (2026-07-07, 7b7a7f9): 에스텔/로젤린 인사·대화 상위 티어
      12라인 + 혼잣말 1건을 은인·공범·친구 프레임으로 재집필. 티어명 운명→은인.
      dialogue.ts 헤더에 원칙 명문화 — ⚠️ 신규 보이스(eden 등) 작성 시 이 가이드 준수
- [x] 대사 시스템 개편 v2 (2026-07-07 저녁, 사용자 피드백 반영):
      ① 대사읊기 원복 — 도감 닫고 홈 버블 재생 (playVoice 훅 병행, 에셋 public/voice/ 규약은 audio.ts)
      ② 캐릭터 클릭 대화 일일제한/호감도지급 제거 — 무제한, 인연 단계별 대사만
      (dailyTalkLeft/noTalkLeftLine은 코드에 잔존하나 미사용)
      ③ 혼잣말(monologue) 신설 — 캐릭터당 6개, 각 3줄 다행(개행 문자 + bubble/line-text
      pre-line 렌더). ⚠️회귀 언급/뉘앙스 금지 지침(2026-07-07), 도감에서 15🪙 구매 해금(buyLine,
      부족 시 openCoinShort 광고유도), CatalogLine.paid 플래그. 검증: 구매 100→85🪙·읊기 정상
- [x] 캐릭터 클릭 대화 + 대사 도감 + CG 세로 리스트 (2026-07-07):
      ① 홈 캐릭터 탭 → talkLine 발화, 회당 호감도 +1, 일일 DAILY_TALK_MAX(5)회 소진 시 noTalkLeftLine
      (레거시 dailyTalkLeft 필드 부활 — loadState 일일 리셋 기존 로직 재사용)
      ② 수집 시트 카테고리 탭 [🖼 일러스트|💬 대사] — 들은 대사만 해금(state.heardLines 신규),
      항목 탭 = 대사읊기(수집창 닫고 해당 캐릭터 홈 버블 재생). 🔈 사운드는 추후 —
      speak()/renderLines 클릭 핸들러에 TODO(playVoice) 훅 주석 있음
      ③ 스토리/스페셜 CG 썸네일 → 전폭 1열 세로 리스트(.cg-list)
      dialogue.ts: SpokenLine{id,text} + lineCatalog() (발화 id = 도감 id 규약)
- [x] 홈 화면 대사 캐릭터별 보이스 분리 (2026-07-07): dialogue.ts v3 — VOICES 레지스트리
      (estelle=기존 온화톤 유지 / rozelin=가시·장미·가면 모티프 악역영애톤 신규 60줄).
      greeting/talkLine/giftLine/noTalkLeftLine 전부 charId 인자화, ui.ts 호출부 반영.
      미등록 캐릭터는 estelle 폴백 — ⚠️ 신규 루트 open 시 VOICES에 보이스 추가 필수 (TODO 주석).
      브라우저 검증: 에스텔/로젤린 인사·선물 대사 분기 확인
- [x] 호감도 → 우측 세로 슬라이더 (2026-07-06): .affbox(가로) 제거 → .aff-slider(티어명/레일/수치,
      아래→위 로즈→골드 충전 + 보석 진행점). ui.ts 템플릿 + render() height 전환 + style.css.
      홈 캐릭터 상단 inset 8px→44px 하향. dev 서버 스크린샷 검증 완료.
      ⚠️ 빌드 base=/estelle-vn/ 됨 → preview 검증 시 URL에 base 필요, dist는 병행 세션과 레이스 주의
- [x] 루시안 상반신 11종 구축 (바탕화면/1/005 시트 2장 → bust_*.png, characters.ts bust 채움)
      — ⚠️ 시트의 체커보드가 투명이 아니라 "구워진 픽셀"이었음(캐릭터도 흰 갑옷이라 색 키잉 불가).
      격자 주기 모델링→구멍 복원→크럼/글리프 제거의 다단계 파이프라인으로 처리.
      정리된 마스터 시트 백업: `backup-lucian-sheets/`. tearful만 미보유(fallback→sad).
      잔여: bust_surprised 머리 좌측에 미세 흰 점 소량(게임 스케일 무시 가능 수준)
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

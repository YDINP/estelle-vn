// UI 매직넘버 상수 — 값의 의미를 이름으로 남긴다(튜닝 지점 한곳 모음).

// ── 타이핑 연출 (문자별 지연 ms) ──
export const TYPE_DELAY = {
  /** 문장 끝(.!?…) 뒤 — 한 호흡 */
  sentence: 250,
  /** 쉼표류(,、·:;) 뒤 — 짧은 호흡 */
  comma: 130,
  /** 여운(—, ~) */
  trail: 110,
  /** 닫는 따옴표·괄호 뒤 */
  closing: 90,
  /** 어절 사이 공백 */
  space: 30,
  /** 기본 글자 */
  base: 26,
} as const;

// ── 토스트 ──
export const TOAST_MAX = 5;       // 동시 표시 상한 (초과분은 오래된 것부터 제거)
export const TOAST_MS = 2600;     // 표시 유지 시간
export const TOAST_FADE_MS = 320; // .out 트랜지션 길이

// ── 목(mock) 광고 — 로컬 개발용 ──
export const MOCK_REWARDED_SECONDS = 3;   // 리워드 광고 카운트다운
export const MOCK_TICK_MS = 1000;
export const MOCK_INTERSTITIAL_MS = 2000; // 전면 광고 오버레이 유지

// ── 도감 ──
/** 대사 1개 해금 가격(🪙) — 혼잣말 48 + 선물 24 = 72개 × 25 = 1,800 */
export const LINE_PRICE = 25;

// ── 타이밍 ──
export const EP_TIMER_TICK_MS = 1000;     // '기다리면 무료' 카운트다운 갱신 주기
export const STREAK_TOAST_DELAY_MS = 700; // 부팅 직후 스트릭 보상 안내 지연
export const CG_TOAST_GAP_MS = 950;       // 클리어 후 CG 해금 토스트 간격

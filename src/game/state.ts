// 게임 상태 + localStorage 영속.
// 실 SDK 연동 시 저장 계층만 앱인토스 스토리지로 교체하면 됨(load/save seam).

import { DEFAULT_OWNED, DEFAULT_EQUIPPED, Slot } from "./cosmetics";
import type { EndingType } from "../data/season1";
import { ROUTES } from "../data/routes";

const SAVE_KEY = "estelle.save.v1";

/**
 * 루트별 진행 상태. 정본: ENGINE-CONTRACT.md §3
 * resolve/resolveMax는 루트 단위 누적축(에피소드별이 아님) — 게이트는 비율로 판정한다.
 */
export interface RouteProgress {
  epCleared: string[];      // 클리어한 에피소드 id (순차 해금 판정)
  nextEpFreeAt: number;     // 다음 화 무료 해금 시각(ms)
  resolve: number;          // 누적 결의
  resolveMax: number;       // 누적 결의 만점 (선택지별 최대 배점의 합)
  endings: EndingType[];    // 이 루트에서 본 엔딩 (중복 없이 누적, 재도전해도 보존)
}

export interface GameState {
  coins: number;
  affection: number;          // 0~100
  ownedCosmetics: string[];
  equipped: Record<Slot, string>;
  dailyTalkLeft: number;      // (레거시) 오늘 남은 무료 대화 횟수 — 하위호환용 잔존
  lastVisitDay: string;       // YYYY-MM-DD (일일 리셋 판정)
  attendanceClaimedDay: string; // (레거시) 출석 보상 수령일
  readChapters: string[];     // (레거시) 완독한 챕터 id
  // ── 웹툰형 '기다리면 무료' 리텐션 필드 ──
  epCleared: string[];        // 클리어한 에피소드 id (순차 해금 판정)
  nextEpFreeAt: number;       // 다음 화 무료 해금 시각(ms). 도달 or 광고 시 해금
  dailyDoneDay: string;       // '오늘의 일상' 완료일 (하루 1회 게이트)
  cards: string[];            // 획득한 명대사 카드 = 클리어한 에피소드 id
  streak: number;             // 연속 방문 일수
  lastStreakDay: string;      // 마지막 스트릭 갱신일
  illust: Record<string, string[]>; // 캐릭터별 수집 일러 (charId → 본 표정 목록)
  cgSeen: string[];           // 스토리 중 연출로 본 이벤트 CG id (그 순간 수집)
  heardLines: Record<string, string[]>; // 캐릭터별 들은 대사 id (대사 도감 수집)
  specialsOwned: string[];    // 코인으로 해금한 스페셜 CG id (구 호감도 게이트 대체)
  // ── 루트(캐릭터 시점) 시스템 ──
  routes: Record<string, RouteProgress>; // 루트별 진행
  affectionBy: Record<string, number>; // 캐릭터별 호감도
  currentRoute: string;       // "" = 메인(타이틀) 화면 / 그 외 = 진행 중 루트 id
  onboarded: boolean;
}

export const MAX_AFFECTION = 100;
export const DAILY_TALK_MAX = 5;
export const TALK_GAIN = 3;
export const GIFT_GAIN = 8;
export const GIFT_COST = 40;
export const AD_REWARD = 50;
export const ATTENDANCE_REWARD = 20;

// 에피소드 무료 대기 시간(기다리면 무료). 기본 24시간.
export const EP_WAIT_MS = 24 * 60 * 60 * 1000;

// ── 밸런스 플래그 ──
/**
 * 온보딩 무료 구간: index가 이 값 이하인 화는 클리어해도 대기 타이머를 걸지 않는다.
 * 3 = 프롤로그(1)·1화(2)·2화(3)까지 연속 플레이 → 훅이 걸린 뒤 3화부터 게이트 시작.
 */
export const FREE_EPISODE_INDEX_MAX = 3;
/**
 * 호감도 시스템 홀딩 — 스토리 톤과 맞지 않아 노출 중단(데이터/로직은 보존).
 * false면 호감도 게이지·티어·선물하기·일상 호감도 보상·도감 호감도 표기가 모두 비노출.
 */
export const AFFECTION_ENABLED = false;
/** 코스튬(옷장·악세서리) 홀딩 — false면 옷장 모달·악세서리 오버레이 비노출. */
export const COSMETICS_ENABLED = false;

// ── 호감도 홀딩 시의 보상 대체(코인) ──
// 선택지/일상이 주던 호감도를 코인으로 환산해 지급하고, 그 코인은 도감(대사·스페셜 CG) 해금에 쓴다.
/** 선택지 호감도 1당 지급 코인 (affection 2→10🪙, 3→15🪙 …). */
export const CHOICE_COIN_PER_AFF = 5;
/** '오늘의 일상' 완료 보상 코인 (기존 호감도 +3 대체). */
export const DAILY_COIN = 15;
/**
 * 스페셜 CG 가격 = 기존 호감도 조건 × 이 값 (20→100🪙, 50→250🪙, 80→400🪙).
 * 수급(에피소드 3,392 + 선택지 880 ≈ 4,272) 대비 총 소모처를 맞추기 위한 값:
 * 스페셜 7종 1,750 + 유료대사 72개×25 = 1,800 → 합 3,550. 전 루트 완주 즈음 도감이 완성된다.
 */
export const SPECIAL_COIN_PER_AFF = 5;

/** 무료 대기 ms. QA용으로 URL ?epwait=초 로 오버라이드 가능. */
export function epWaitMs(): number {
  try {
    const p = new URLSearchParams(location.search).get("epwait");
    if (p) {
      const sec = Number(p);
      if (Number.isFinite(sec) && sec > 0) return sec * 1000;
    }
  } catch {
    /* location 접근 불가 환경 무시 */
  }
  return EP_WAIT_MS;
}

/** 엔딩 3종 — 도감 그리드 열 순서의 정본. */
export const ENDING_TYPES: EndingType[] = ["good", "bad", "true"];

const TIER_BOUNDS = [0, 20, 50, 80];
// 로맨스 불성립(STORY-BIBLE §0) — 최상위 티어는 '운명'이 아니라 관계 상한 어휘 '은인'
export const TIER_NAMES = ["재회", "신뢰", "인연", "은인"];

export function tierOf(affection: number): number {
  let t = 0;
  for (let i = 0; i < TIER_BOUNDS.length; i++) {
    if (affection >= TIER_BOUNDS[i]) t = i;
  }
  return t;
}

function today(): string {
  return dayKeyOffset(0);
}

// 오늘 기준 deltaDays 만큼 이동한 날짜 키(YYYY-MM-DD, 로컬)
function dayKeyOffset(deltaDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 오늘 날짜 키(YYYY-MM-DD). 일일 게이트 판정용. */
export function todayKey(): string {
  return today();
}

function freshState(): GameState {
  return {
    coins: 100,
    affection: 0,
    ownedCosmetics: [...DEFAULT_OWNED],
    equipped: { ...DEFAULT_EQUIPPED },
    dailyTalkLeft: DAILY_TALK_MAX,
    lastVisitDay: today(),
    attendanceClaimedDay: "",
    readChapters: [],
    epCleared: [],
    nextEpFreeAt: 0,
    dailyDoneDay: "",
    cards: [],
    streak: 0,
    lastStreakDay: "",
    illust: {},
    cgSeen: [],
    heardLines: {},
    specialsOwned: [],
    routes: {},
    affectionBy: {},
    currentRoute: "",
    onboarded: false,
  };
}

export function loadState(): GameState {
  let s: GameState;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    s = raw ? { ...freshState(), ...JSON.parse(raw) } : freshState();
  } catch {
    s = freshState();
  }
  // 일일 리셋
  const t = today();
  if (s.lastVisitDay !== t) {
    s.dailyTalkLeft = DAILY_TALK_MAX;
    s.lastVisitDay = t;
  }
  // ── 루트 시스템 마이그레이션 (구필드 → estelle 루트로 1회 이전) ──
  // freshState 스프레드로 신필드가 {} 로 채워지므로, 구필드에 값이 있고
  // 신필드가 아직 비어 있을 때만 이전한다. 구필드(epCleared/nextEpFreeAt/affection)는 레거시로 남겨 둔다.
  if (!s.routes) s.routes = {};
  if (!s.affectionBy) s.affectionBy = {};
  // ── 개명 마이그레이션 (2026-07-10): 구 charId/routeId → 신명 1회 변환 ──
  // 신 키가 이미 있으면 기존 진행을 보존하고 구 키만 버린다(덮어쓰기 금지).
  const OLD2NEW: Record<string, string> = {
    estelle: "lilia", rozelin: "marion", valen: "belian", eden: "belfor",
    isolde: "lucienne", adele: "livia", rayner: "reimon", michael: "azael",
    chancellor: "mephian",
  };
  function remapKeys<T>(rec: Record<string, T>): void {
    for (const o of Object.keys(OLD2NEW)) {
      if (rec[o] !== undefined) {
        const n = OLD2NEW[o];
        if (rec[n] === undefined) rec[n] = rec[o];
        delete rec[o];
      }
    }
  }
  remapKeys(s.routes);
  remapKeys(s.affectionBy);
  if (s.illust) remapKeys(s.illust);
  if (s.heardLines) remapKeys(s.heardLines);
  if (OLD2NEW[s.currentRoute]) s.currentRoute = OLD2NEW[s.currentRoute];
  if (s.routes.lilia === undefined &&
      ((s.epCleared && s.epCleared.length > 0) || s.nextEpFreeAt > 0)) {
    s.routes.lilia = normalizeProgress({
      epCleared: [...(s.epCleared ?? [])],
      nextEpFreeAt: s.nextEpFreeAt ?? 0,
    });
  }
  if (s.affectionBy.lilia === undefined && s.affection > 0) {
    s.affectionBy.lilia = s.affection;
  }
  // ── RouteProgress 승격 마이그레이션 (2026-07-27, ENGINE-CONTRACT §3) ──
  // 구 세이브는 {epCleared, nextEpFreeAt}만 갖거나, 더 오래된 것은 문자열 배열이다.
  // 개명(remapKeys) 이후에 돌려야 구 키가 신 키로 옮겨간 값까지 함께 승격된다.
  for (const id of Object.keys(s.routes)) s.routes[id] = normalizeProgress(s.routes[id]);
  return s;
}

/** 어떤 형태의 구 진행값이든 RouteProgress로 승격. 없는 필드는 0/[]로 채운다. */
function normalizeProgress(v: unknown): RouteProgress {
  const fresh: RouteProgress = { epCleared: [], nextEpFreeAt: 0, resolve: 0, resolveMax: 0, endings: [] };
  if (!v) return fresh;
  if (Array.isArray(v)) return { ...fresh, epCleared: v.filter((x) => typeof x === "string") };
  if (typeof v !== "object") return fresh;
  const o = v as Partial<RouteProgress>;
  return {
    epCleared: Array.isArray(o.epCleared) ? o.epCleared : [],
    nextEpFreeAt: typeof o.nextEpFreeAt === "number" ? o.nextEpFreeAt : 0,
    resolve: typeof o.resolve === "number" ? o.resolve : 0,
    resolveMax: typeof o.resolveMax === "number" ? o.resolveMax : 0,
    endings: Array.isArray(o.endings)
      ? o.endings.filter((e): e is EndingType => ENDING_TYPES.includes(e))
      : [],
  };
}

export function saveState(s: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* 저장 실패는 조용히 무시 (프라이빗 모드 등) */
  }
}

export function canClaimAttendance(s: GameState): boolean {
  return s.attendanceClaimedDay !== today();
}

export function claimAttendance(s: GameState): boolean {
  if (!canClaimAttendance(s)) return false;
  s.coins += ATTENDANCE_REWARD;
  s.attendanceClaimedDay = today();
  return true;
}

export function addAffection(s: GameState, amount: number): void {
  s.affection = Math.min(MAX_AFFECTION, s.affection + amount);
}

// ── 루트/캐릭터 스코프 헬퍼 ──

/** 루트별 진행 상태를 반환(없으면 생성). */
export function ensureRoute(s: GameState, routeId: string): RouteProgress {
  return (s.routes[routeId] ??= normalizeProgress(null));
}

// ── 결의(resolve) / 엔딩 ──

/**
 * 선택지 확정 시 결의 누적. 판정은 절대값이 아니라 resolve/resolveMax 비율이다.
 * 다시보기(grantRewards=false)에서는 호출하지 않는다 — 호감도 규칙과 동일.
 */
export function addResolve(s: GameState, routeId: string, gained: number, max: number): void {
  const p = ensureRoute(s, routeId);
  p.resolve += gained;
  p.resolveMax += max;
}

/** 게이트 판정 비율. 선택지를 한 번도 지나지 않았으면(분모 0) 통과로 본다. */
export function resolveRatio(p: RouteProgress): number {
  return p.resolveMax > 0 ? p.resolve / p.resolveMax : 1;
}

/** 엔딩 기록(중복 없이 누적). 새로 추가됐으면 true. */
export function addEnding(s: GameState, routeId: string, ending: EndingType): boolean {
  const p = ensureRoute(s, routeId);
  if (p.endings.includes(ending)) return false;
  p.endings.push(ending);
  return true;
}

/** 엔딩을 하나라도 본 루트 = 완주 처리. */
export function routeCompleted(s: GameState, routeId: string): boolean {
  return (s.routes[routeId]?.endings.length ?? 0) > 0;
}

/**
 * TRUE 엔딩 조건 — 전 루트 good 보유.
 * 준비 중(available=false) 루트까지 요구하면 진엔딩이 영구 도달 불가가 되므로 공개된 루트만 본다.
 */
export function hasAllGoodEndings(s: GameState): boolean {
  const live = ROUTES.filter((r) => r.available);
  return live.length > 0 && live.every((r) => s.routes[r.id]?.endings.includes("good"));
}

/**
 * 루트 재도전 — 진행도(에피소드·결의)만 초기화하고 엔딩 기록은 보존한다.
 * 다른 엔딩을 보려면 선택을 다시 쌓아야 하므로 resolve/resolveMax도 함께 0으로 되돌린다.
 */
export function restartRoute(s: GameState, routeId: string): void {
  const p = ensureRoute(s, routeId);
  p.epCleared = [];
  p.nextEpFreeAt = 0;
  p.resolve = 0;
  p.resolveMax = 0;
}

/** 캐릭터별 호감도(기본 0). */
export function affectionOf(s: GameState, charId: string): number {
  return s.affectionBy[charId] ?? 0;
}

/** 캐릭터별 호감도 증가(0~MAX 클램프). */
export function addAffectionTo(s: GameState, charId: string, amount: number): void {
  s.affectionBy[charId] = Math.min(MAX_AFFECTION, affectionOf(s, charId) + amount);
}

/** 모든 루트의 클리어 에피소드 합집합 — CG 해금 판정(루트 교차 매핑)용. */
export function allClearedEpisodes(s: GameState): string[] {
  const set = new Set<string>();
  for (const k of Object.keys(s.routes))
    for (const id of s.routes[k].epCleared) set.add(id);
  return [...set];
}

/**
 * 연속 방문 스트릭 갱신. 하루 1회만 증가, 하루 건너뛰면 1로 리셋.
 * @returns reached7 = 7일 이상 연속 달성(한정 보상 지급 트리거)
 */
export function updateStreak(s: GameState): { reached7: boolean } {
  const t = today();
  if (s.lastStreakDay === t) return { reached7: s.streak >= 7 };
  const yesterday = dayKeyOffset(-1);
  s.streak = s.lastStreakDay === yesterday ? s.streak + 1 : 1;
  s.lastStreakDay = t;
  return { reached7: s.streak >= 7 };
}

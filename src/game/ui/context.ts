// UI 공유 컨텍스트 — 화면 모듈들이 나눠 쓰는 단 하나의 store.
// 분해 전 ui.ts는 모듈 스코프 전역 let이 난립했다. 상태를 여기 한 곳에 모아
// "어디서 바뀌는가"를 추적 가능하게 만든다. 화면 모듈은 이 파일만 의존한다.

import {
  GameState, RouteProgress, saveState, tierOf, ensureRoute, affectionOf,
} from "../state";
import { CharacterId } from "../../data/characters";
import { Episode } from "../../data/season1";
import { DailyScene, DAILY_SCENES } from "../../data/daily";
import { Route, RouteData, getRoute } from "../../data/routes";

interface UiContext {
  state: GameState;
  root: HTMLElement;
  /** 현재 루트의 대본(동적 로드분). 루트 밖(메인 화면)에서는 undefined. */
  routeData?: RouteData;
}

/** 부팅 전에는 비어 있다 — initContext() 이후에만 접근한다. */
export const ctx = {} as UiContext;

export function initContext(root: HTMLElement, state: GameState): void {
  ctx.root = root;
  ctx.state = state;
}

/** 현재 루트 대본 교체 (루트 진입/이탈 시에만 호출). */
export function setRouteData(data: RouteData | undefined): void {
  ctx.routeData = data;
}

// ── DOM 조회 ──
export function $(sel: string): HTMLElement {
  return ctx.root.querySelector(sel) as HTMLElement;
}

// ── 현재 루트 컨텍스트 ──
export function activeRoute(): Route | undefined {
  return getRoute(ctx.state.currentRoute);
}
export function activeCharId(): CharacterId {
  return activeRoute()?.charId ?? "lilia";
}
export function activeEpisodes(): Episode[] {
  return ctx.routeData?.episodes ?? [];
}
export function activeDaily(): DailyScene[] {
  return ctx.routeData?.daily ?? DAILY_SCENES;
}
/** 현재 루트의 진행 상태. 루트 밖에서도 안전하도록 기본은 lilia. */
export function prog(): RouteProgress {
  return ensureRoute(ctx.state, ctx.state.currentRoute || "lilia");
}
export function activeAff(): number {
  return affectionOf(ctx.state, activeCharId());
}
export function activeTier(): number {
  return tierOf(activeAff());
}
export function hasRouteProgress(): boolean {
  return Object.values(ctx.state.routes).some(
    (r) => r.epCleared.length > 0 || r.nextEpFreeAt > 0 || r.endings.length > 0
  );
}

/** 세이브만 (화면 갱신 없음). 화면까지 갱신하려면 screens/home.ts의 persist(). */
export function save(): void {
  saveState(ctx.state);
}

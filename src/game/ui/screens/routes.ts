// 타이틀(메인) 화면 — 루트 선택 카드 + 루트 진입.

import { $, ctx, save, prog, setRouteData } from "../context";
import { esc, delegate, LAZY_IMG } from "../dom";
import { toast, showLoading, hideLoading } from "../modals";
import { render, greetRoute } from "./home";
import { playEpisode } from "./story";
import { ensureRoute, routeCompleted } from "../../state";
import { playBgm } from "../../audio";
import { CHARACTERS, vnFile, isPlaceholderArt } from "../../../data/characters";
import { EndingType } from "../../../data/season1";
import { ROUTES, getRoute, loadRoute, loadedRoute, prefetchRoutes } from "../../../data/routes";

/** 엔딩 뱃지 아이콘 — 도감/루트카드 공통 표기. */
export const ENDING_ICON: Record<EndingType, string> = { good: "🏆", bad: "🥀", true: "✨" };
export const ENDING_NAME: Record<EndingType, string> = { good: "굿", bad: "배드", true: "트루" };

export function showMain(): void {
  ctx.state.currentRoute = "";
  setRouteData(undefined);
  save();
  renderMainScreen();
  $("#mainScreen").classList.remove("hidden");
  playBgm("title");
}

/** 카드 1장 안쪽(진행도·엔딩 뱃지)만 그린다 — 프리페치 완료 시 해당 셀만 갱신하기 위함. */
function cardBody(routeId: string): string {
  const r = getRoute(routeId)!;
  const p = ctx.state.routes[r.id];
  const cleared = p?.epCleared.length ?? 0;
  const endings = p?.endings ?? [];
  // 총 화수는 대본 청크가 있어야 알 수 있다. 아직이면 분모 없이 진행분만 표기.
  const total = loadedRoute(r.id)?.episodes.length;
  const badge = !r.available
    ? "🔒 이야기 준비 중"
    : total ? `📖 ${cleared}/${total}화` : `📖 ${cleared}화`;
  const marks = endings.length
    ? `<div class="rc-endings">${endings.map((e) => `${ENDING_ICON[e]} ${ENDING_NAME[e]}`).join(" · ")}</div>`
    : "";
  return `<div class="rc-prog">${badge}</div>${marks}`;
}

export function renderMainScreen(): void {
  $("#routeCards").innerHTML = ROUTES.map((r) => {
    const locked = !r.available;
    // 아트 미보유 캐릭터(시트 대기 중)는 이미지 대신 ? 실루엣
    const c = CHARACTERS[r.charId];
    const artless = !c.body.length;
    const art = artless
      ? `<div class="rc-unknown">?</div>`
      : `<img src="${vnFile(r.charId, "soft")}" alt="" ${LAZY_IMG} />${
          isPlaceholderArt(r.charId) ? `<div class="ph-badge">임시</div>` : ""}`;
    const done = routeCompleted(ctx.state, r.id);
    return `<button class="route-card ${locked ? "locked" : ""} ${done ? "done" : ""}" data-route="${esc(r.id)}" ${locked ? "disabled" : ""}>
      <div class="rc-art">${art}</div>
      <div class="rc-info">
        <div class="rc-title">${esc(r.title)}${done ? ` <span class="rc-done">완주</span>` : ""}</div>
        <div class="rc-desc">${esc(r.desc)}</div>
        <div class="rc-foot" data-rcfoot="${esc(r.id)}">${cardBody(r.id)}</div>
      </div>
    </button>`;
  }).join("");
}

/** 카드 1장의 진행도만 부분 갱신 (컨테이너 전체 innerHTML 재생성 금지). */
export function refreshRouteCell(routeId: string): void {
  const foot = ctx.root?.querySelector(`[data-rcfoot="${routeId}"]`) as HTMLElement | null;
  if (foot) foot.innerHTML = cardBody(routeId);
}

/**
 * 루트 진입 → 대본 청크를 받아 해당 캐릭터 시점의 홈 화면으로 전환.
 * @returns 진입 성공 여부. 대본 로드 실패 시 false — 호출부가 메인 화면으로 되돌린다.
 */
export async function enterRoute(routeId: string, autoPlayFirst = true): Promise<boolean> {
  const route = getRoute(routeId);
  if (!route || !route.available) return false;
  // 대본은 지연 로드 — 캐시 히트면 인디케이터 없이 즉시 진입한다.
  let data = loadedRoute(routeId);
  if (!data) {
    showLoading();
    data = await loadRoute(routeId);
    hideLoading();
    if (!data) { toast("이야기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요"); return false; }
  }
  ctx.state.currentRoute = routeId;
  setRouteData(data);
  ensureRoute(ctx.state, routeId);
  save();
  $("#mainScreen").classList.add("hidden");
  playBgm("story");
  greetRoute();
  render();

  // 최초 진입(해당 루트 진행 0)이면 1화 자동 재생 (구 프롤로그 자동재생 대체)
  const first = data.episodes[0];
  if (autoPlayFirst && first && !prog().epCleared.includes(first.id)) playEpisode(first);
  return true;
}

export function wireMain(): void {
  delegate($("#routeCards"), "[data-route]", "click", (el) => {
    void enterRoute(el.dataset.route!);
  });
  // 첫 화면이 그려진 뒤 남은 루트 청크를 유휴 시간에 당겨 둔다 → 이후 진입은 항상 즉시.
  prefetchRoutes((id) => refreshRouteCell(id));
}

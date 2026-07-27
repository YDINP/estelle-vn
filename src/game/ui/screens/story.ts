// 이야기(에피소드) 목록 — 순차 해금·기다리면 무료 게이팅, 에피소드 재생, 엔딩 게이트 배선.

import { $, ctx, save, prog, activeEpisodes } from "../context";
import { esc, delegate } from "../dom";
import { toast, openConfirm, playMockAd, playMockInterstitial } from "../modals";
import { render } from "./home";
import { ENDING_ICON, ENDING_NAME, refreshRouteCell } from "./routes";
import { playSteps } from "../vn/player";
import { evaluateGate } from "../vn/gate";
import {
  epWaitMs, FREE_EPISODE_INDEX_MAX, addEnding, restartRoute, routeCompleted,
} from "../../state";
import { showRewardedAd, showInterstitialAd } from "../../ads";
import { sfxReward } from "../../audio";
import { Episode, EndingType } from "../../../data/season1";
import { CGS } from "../../../data/cgs";
import { endingInfo } from "../../../data/routes";
import { EP_TIMER_TICK_MS, CG_TOAST_GAP_MS } from "../constants";

// ── 에피소드 게이팅 (순차 해금 + 기다리면 무료) ──
type EpStatus = "cleared" | "playable" | "timer" | "locked";

function prevCleared(ep: Episode): boolean {
  if (ep.index <= 1) return true;
  const prev = activeEpisodes().find((e) => e.index === ep.index - 1);
  return !!prev && prog().epCleared.includes(prev.id);
}

function epStatus(ep: Episode): EpStatus {
  if (prog().epCleared.includes(ep.id)) return "cleared";
  if (!prevCleared(ep)) return "locked";
  if (ep.index <= 1) return "playable";
  return Date.now() >= prog().nextEpFreeAt ? "playable" : "timer";
}

// ── 이야기 목록 모달 ──
let epTimerIv: number | undefined;

export function openStoryList(): void {
  renderStoryList();
  $("#storyList").classList.remove("hidden");
  if (epTimerIv) clearInterval(epTimerIv);
  epTimerIv = window.setInterval(updateEpCountdown, EP_TIMER_TICK_MS);
}

export function closeStoryList(): void {
  $("#storyList").classList.add("hidden");
  if (epTimerIv) { clearInterval(epTimerIv); epTimerIv = undefined; }
}

function fmtDur(ms: number): string {
  const s = Math.floor(Math.max(0, ms) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

function renderStoryList(): void {
  renderEndingBar();
  $("#storyItems").innerHTML = activeEpisodes().map((ep) => {
    const st = epStatus(ep);
    let right = "";
    let extra = "";
    if (st === "cleared") {
      right = `<button class="mini" data-play="${esc(ep.id)}">✓ 다시보기</button>`;
    } else if (st === "playable") {
      right = `<button class="mini play" data-play="${esc(ep.id)}">▶ 재생</button>`;
    } else if (st === "timer") {
      right = `<button class="mini play" data-adplay="${esc(ep.id)}">📺 광고 보고 지금 보기</button>`;
      extra = `<div class="ep-count" data-count>⏳ ${fmtDur(prog().nextEpFreeAt - Date.now())} 후 무료</div>`;
    } else {
      right = `<span class="s">🔒 잠김</span>`;
    }
    const cls = st === "locked" ? "locked" : st === "timer" ? "waiting" : "";
    // 엔딩 게이트가 걸린 화는 목록에서 미리 표시 — 선택의 무게를 알리는 장치.
    const gateMark = ep.gate ? `<span class="ep-gate" title="엔딩 분기">⚖</span>` : "";
    return `<div class="story-item ${cls}">
      <div class="ep-main">
        <div class="t">${esc(ep.title)}${gateMark}</div>
        <div class="s teaser">${esc(ep.teaser)}</div>
        ${extra}
      </div>${right}</div>`;
  }).join("");
}

/** 목록 상단 — 이 루트에서 본 엔딩 + 재도전 진입점(완주 루트에만). */
function renderEndingBar(): void {
  const routeId = ctx.state.currentRoute || "lilia";
  const bar = $("#routeEndingBar");
  if (!routeCompleted(ctx.state, routeId)) {
    bar.classList.add("hidden");
    bar.innerHTML = "";
    return;
  }
  const endings = ctx.state.routes[routeId]?.endings ?? [];
  bar.innerHTML = `
    <div class="reb-marks">${endings.map((e) =>
      `<span class="reb-mark">${ENDING_ICON[e]} ${esc(endingInfo(routeId, e)?.title ?? ENDING_NAME[e])}</span>`
    ).join("")}</div>
    <button class="mini" data-restart="${esc(routeId)}">↺ 처음부터 다시</button>`;
  bar.classList.remove("hidden");
}

/** 타이머 카운트다운 갱신(모달이 열린 동안 1초마다). 0 도달 시 목록 재렌더 → 재생 버튼으로 전환. */
function updateEpCountdown(): void {
  const el = ctx.root.querySelector("[data-count]") as HTMLElement | null;
  if (!el) return;
  const remain = prog().nextEpFreeAt - Date.now();
  if (remain <= 0) { renderStoryList(); return; }
  el.textContent = `⏳ ${fmtDur(remain)} 후 무료`;
}

// 광고 보고 지금 보기 → 리워드 광고 완료 시 즉시 해금
let adUnlockBusy = false; // 광고 재생 중 재탭 → SDK 동시호출/VN 리셋 방지
async function onAdUnlock(id: string): Promise<void> {
  const ep = activeEpisodes().find((e) => e.id === id);
  if (!ep || adUnlockBusy) return;
  adUnlockBusy = true;
  const result = await showRewardedAd(playMockAd);
  adUnlockBusy = false;
  if (result === "rewarded") {
    prog().nextEpFreeAt = 0; // 대기 해제(중도 이탈해도 해금 유지)
    save();
    closeStoryList();
    playEpisode(ep);
  } else if (result === "dismissed") {
    toast("끝까지 보면 지금 이어볼 수 있어요");
  } else {
    toast("광고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요");
  }
}

// ── 에피소드 재생 ──
/**
 * 에피소드 재생. 최초 클리어면 완료 시 보상 처리.
 * gate가 있으면 steps 재생이 끝난 뒤 분기 프로즈를 이어 재생하고,
 * 그 분기까지 다 본 뒤에야 엔딩 기록·클리어 처리를 한다(ENGINE-CONTRACT §2).
 */
export function playEpisode(ep: Episode): void {
  const routeId = ctx.state.currentRoute || "lilia";
  const firstClear = !prog().epCleared.includes(ep.id);
  // 게이트 판정 결과는 분기 재생이 끝난 뒤(onEnd)에 쓰이므로 홀더에 담아 넘긴다.
  const outcome: { ending: EndingType | null } = { ending: null };

  const gate = ep.gate;
  playSteps(
    ep.steps,
    () => {
      if (outcome.ending) recordEnding(routeId, outcome.ending);
      if (firstClear) onEpisodeCleared(ep);
    },
    firstClear, // 다시보기는 선택지 보상/결의 미지급
    gate
      ? () => {
          const result = evaluateGate(ctx.state, routeId, gate);
          outcome.ending = result.ending;
          return result.steps;
        }
      : null
  );
}

function recordEnding(routeId: string, type: EndingType): void {
  const isNew = addEnding(ctx.state, routeId, type);
  save();
  const info = endingInfo(routeId, type);
  toast(`${ENDING_ICON[type]} ${isNew ? "엔딩 획득" : "엔딩"} — ${info?.title ?? ENDING_NAME[type]}`);
  if (isNew) {
    setTimeout(() => toast("🗂 수집 › 엔딩 탭에서 다시 볼 수 있어요"), CG_TOAST_GAP_MS);
  }
  refreshRouteCell(routeId);
}

function onEpisodeCleared(ep: Episode): void {
  prog().epCleared.push(ep.id);
  ctx.state.coins += ep.rewardCoins;
  // 다음 화 '기다리면 무료' 타이머 설정 (다음 화가 있을 때만 — 시즌 마지막 화 잔여 타이머 방지)
  // 온보딩 구간은 대기 없이 연속 재생 → 훅이 걸린 뒤부터 게이트를 건다:
  // FREE=3 → 프롤로그(1)·1화(2)·2화(3)는 무료, 3화(4)부터 대기.
  if (ep.index >= FREE_EPISODE_INDEX_MAX &&
      activeEpisodes().some((e) => e.index === ep.index + 1)) {
    prog().nextEpFreeAt = Date.now() + epWaitMs();
  }
  save();
  render();
  sfxReward();
  toast(`📖 ${ep.title} 완료 +${ep.rewardCoins}🪙`);
  refreshRouteCell(ctx.state.currentRoute || "lilia");
  // 스토리 중 연출로 이미 수집된 CG는 재토스트 안 함
  CGS.filter((g) => g.unlockEp === ep.id && !ctx.state.cgSeen.includes(g.id)).forEach((cg, i) =>
    setTimeout(() => toast(`🖼 이벤트 일러 해금: ${cg.title}`), CG_TOAST_GAP_MS + i * CG_TOAST_GAP_MS)
  );

  // ⚠️ 앱인토스 정책: 전면 광고는 로딩/인트로/컷신 노출 금지 →
  //    '완료 결과(보상 지급)' 직후에만 배치. 단 최초 진입 시 자동재생되는 1화는
  //    온보딩/인트로 성격이라 스킵(정책 경계 + 첫인상 보호). 일일 씬 뒤에도 미노출.
  if (ep.index > 1) showInterstitialAd(playMockInterstitial);
}

// ── 루트 재도전 ──
// 파괴적 동작(진행도 삭제)이라 확인 모달을 거친다. 엔딩 기록은 보존한다.
function askRestart(routeId: string): void {
  openConfirm(
    "이 루트를 처음부터?",
    "클리어한 화와 결의가 모두 초기화됩니다. 지금까지 획득한 엔딩 기록은 그대로 남아요.",
    "↺ 처음부터",
    () => {
      restartRoute(ctx.state, routeId);
      save();
      render();
      renderStoryList();
      refreshRouteCell(routeId);
      toast("↺ 진행을 초기화했어요. 다른 결말을 향해.");
    }
  );
}

export function wireStory(): void {
  $("#btnStory").onclick = () => openStoryList();
  $("#storyX").onclick = () => closeStoryList();
  delegate($("#storyItems"), "[data-play]", "click", (el) => {
    const ep = activeEpisodes().find((e) => e.id === el.dataset.play);
    if (ep) { closeStoryList(); playEpisode(ep); }
  });
  delegate($("#storyItems"), "[data-adplay]", "click", (el) => {
    void onAdUnlock(el.dataset.adplay!);
  });
  delegate($("#routeEndingBar"), "[data-restart]", "click", (el) => {
    askRestart(el.dataset.restart!);
  });
}

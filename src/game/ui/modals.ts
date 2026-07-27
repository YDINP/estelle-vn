// 오버레이 모음 — 토스트 / 코인부족(리워드 광고 유도) / mock 광고 / 확인 / 로딩.

import { $, ctx } from "./context";
import { AD_REWARD } from "../state";
import { showRewardedAd } from "../ads";
import { sfxCoin } from "../audio";
import { persist } from "./screens/home";
import {
  TOAST_MAX, TOAST_MS, TOAST_FADE_MS,
  MOCK_REWARDED_SECONDS, MOCK_TICK_MS, MOCK_INTERSTITIAL_MS,
} from "./constants";

// ── 토스트 ──
// 우상단 알림 스택 — 여러 개가 겹치지 않고 세로로 쌓이며 각자 자동 소멸.
export function toast(msg: string): void {
  const box = $("#toasts");
  const t = document.createElement("div");
  t.className = "toast-item";
  t.textContent = msg;
  box.appendChild(t);
  // 초과분은 가장 오래된 것부터 즉시 제거
  while (box.children.length > TOAST_MAX) box.firstElementChild!.remove();
  window.setTimeout(() => {
    t.classList.add("out");
    window.setTimeout(() => t.remove(), TOAST_FADE_MS);
  }, TOAST_MS);
}

// ── 코인 부족 → 리워드 광고 유도 미니 모달 ──
// ⚠️ 앱인토스 문구 규칙: "광고 시청 후 지급" 형식만. "클릭 시 보상" 금지.
let coinShortRetry: (() => void) | null = null;

export function openCoinShort(retry?: () => void): void {
  coinShortRetry = retry ?? null;
  $("#coinShort").classList.remove("hidden");
}
export function closeCoinShort(): void {
  coinShortRetry = null;
  $("#coinShort").classList.add("hidden");
}
export async function onCoinShortWatch(): Promise<void> {
  const btn = $("#coinAdWatch") as HTMLButtonElement;
  btn.disabled = true;
  const result = await showRewardedAd(playMockAd);
  btn.disabled = false;
  if (result === "rewarded") {
    ctx.state.coins += AD_REWARD;
    sfxCoin();
    toast(`+${AD_REWARD}🪙 지급 완료!`);
    persist();
    const retry = coinShortRetry;
    closeCoinShort();
    if (retry) retry(); // 코인 확보 후 원래 시도(선물/구매) 재개
  } else if (result === "dismissed") {
    toast("끝까지 보면 코인을 받을 수 있어요");
  } else {
    toast("광고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요");
  }
}

// ── 확인 모달 (파괴적 동작 게이트) ──
let confirmAction: (() => void) | null = null;

export function openConfirm(title: string, body: string, okLabel: string, onOk: () => void): void {
  confirmAction = onOk;
  $("#confirmTitle").textContent = title;
  $("#confirmBody").textContent = body;
  $("#confirmOk").textContent = okLabel;
  $("#confirmModal").classList.remove("hidden");
}
export function closeConfirm(): void {
  confirmAction = null;
  $("#confirmModal").classList.add("hidden");
}
export function runConfirm(): void {
  const fn = confirmAction;
  closeConfirm();
  fn?.();
}

// ── 루트 대본 로딩 인디케이터 ──
export function showLoading(): void { $("#routeLoading").classList.remove("hidden"); }
export function hideLoading(): void { $("#routeLoading").classList.add("hidden"); }

// ── mock 광고 재생 (로컬 개발용) ──
export function playMockAd(): Promise<void> {
  return new Promise((resolve) => {
    const modal = $("#adModal");
    const count = $("#adCount");
    modal.classList.remove("hidden");
    let n = MOCK_REWARDED_SECONDS;
    count.textContent = String(n);
    const iv = setInterval(() => {
      n--;
      count.textContent = String(Math.max(n, 0));
      if (n <= 0) {
        clearInterval(iv);
        modal.classList.add("hidden");
        resolve();
      }
    }, MOCK_TICK_MS);
  });
}

/** mock 전면 광고: 짧은 오버레이 후 자동 닫힘 */
export function playMockInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    const modal = $("#interAd");
    modal.classList.remove("hidden");
    window.setTimeout(() => {
      modal.classList.add("hidden");
      resolve();
    }, MOCK_INTERSTITIAL_MS);
  });
}

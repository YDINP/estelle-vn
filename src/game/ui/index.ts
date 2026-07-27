// UI 조립·부팅 — 화면 모듈을 붙이고 진입점을 정한다. 렌더 로직은 각 screens/* 에 있다.
//
// 구조:
//   context.ts        공유 store($ · 현재 루트 · 세이브)
//   dom.ts            이스케이프 · 이벤트 위임 · 이미지 힌트
//   template.ts       정적 DOM 골격
//   modals.ts         토스트 · 코인부족 · 확인 · mock 광고 · 로딩
//   screens/home      홈(초상·말풍선·액션·HUD)
//   screens/routes    타이틀·루트 선택·루트 진입(대본 지연 로드)
//   screens/story     에피소드 목록·게이팅·재생·엔딩 게이트·재도전
//   screens/collect   도감(일러스트·대사·엔딩)
//   screens/closet    옷장(홀딩 중)
//   vn/*              재생 엔진(session·player·typewriter·portrait·gate)

import { loadState, updateStreak } from "../state";
import { setupCheats } from "../cheats";
import { initAudio } from "../audio";
import { PROLOGUE } from "../../data/chapters";
import { getRoute } from "../../data/routes";
import { $, ctx, initContext, save, activeCharId, hasRouteProgress } from "./context";
import { template } from "./template";
import { toast, closeCoinShort, onCoinShortWatch, closeConfirm, runConfirm } from "./modals";
import { render, persist, updateMuteUI, wireHome } from "./screens/home";
import { showMain, enterRoute, wireMain } from "./screens/routes";
import { wireStory } from "./screens/story";
import { wireCollect } from "./screens/collect";
import { wireCloset } from "./screens/closet";
import { playSteps, wireVn } from "./vn/player";
import { STREAK_TOAST_DELAY_MS } from "./constants";

export function mountGame(el: HTMLElement): void {
  const state = loadState();
  initContext(el, state);

  // 연속 방문 스트릭 갱신 → 7일 달성 시 한정 악세서리 지급
  const { reached7 } = updateStreak(state);
  if (reached7 && !state.ownedCosmetics.includes("acc_star")) {
    state.ownedCosmetics.push("acc_star");
    setTimeout(() => toast("⭐ 7일 연속 방문! '별의 머리핀' 지급"), STREAK_TOAST_DELAY_MS);
  }
  save();

  el.innerHTML = template();
  wire();
  initAudio(); // 첫 제스처에서 BGM 잠금 해제
  updateMuteUI();

  // 디버그/치트 패널 (DEV 또는 ?cheat=1 — Shift+Click/트리플탭으로 열기)
  setupCheats({
    state,
    refresh: () => { persist(); },
    toast,
    enterRoute: (id: string) => { void enterRoute(id); },
    showMain,
    activeCharId,
    activeRouteId: () => ctx.state.currentRoute,
  });

  // 진입점: 저장된 진행 중 루트가 있으면 그 홈으로, 없으면 메인(타이틀) 화면.
  if (!state.onboarded && !state.currentRoute && !hasRouteProgress()) {
    state.onboarded = true;
    save();
    void enterRoute("lilia");
    return;
  }
  if (state.currentRoute && getRoute(state.currentRoute)?.available) {
    void enterRoute(state.currentRoute, false);
  } else {
    showMain();
  }
}

function wire(): void {
  $("#btnMain").onclick = () => showMain();
  $("#coinAdClose").onclick = () => closeCoinShort();
  $("#coinAdWatch").onclick = () => { void onCoinShortWatch(); };
  $("#confirmCancel").onclick = () => closeConfirm();
  $("#confirmOk").onclick = () => runConfirm();
  // 메인 화면 — 전체 스토리 프롤로그 보기 (보상 없음, 언제든 다시보기)
  $("#btnPrologue").onclick = () => playSteps(PROLOGUE.steps, () => {}, false);
  wireHome();
  wireMain();
  wireStory();
  wireCollect();
  wireCloset();
  wireVn();
  render();
}

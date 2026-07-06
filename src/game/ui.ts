// UI 렌더 + 이벤트 배선 (DOM 기반, 프레임워크 無).
// 웹툰형 '기다리면 무료' 리텐션 모델: 에피소드 순차 해금 + 일일 씬 + 수집 + 스트릭.

import {
  GameState, loadState, saveState, tierOf,
  TIER_NAMES, MAX_AFFECTION, GIFT_GAIN, GIFT_COST, AD_REWARD,
  epWaitMs, updateStreak, todayKey,
  ensureRoute, affectionOf, addAffectionTo, allClearedEpisodes,
} from "./state";
import { COSMETICS, getCosmetic, Slot } from "./cosmetics";
import { greeting, giftLine } from "./dialogue";
import { showRewardedAd, showInterstitialAd } from "./ads";
import { Choice, Line, Emotion, Step, PROLOGUE } from "../data/chapters";
import {
  CHARACTERS, CharacterId, EMOTION_LABEL, portraitFile, vnFile, resolveEmotion,
  isPlaceholderArt,
} from "../data/characters";
import { EPISODES, Episode } from "../data/season1";
import { DAILY_SCENES, DAILY_AFFECTION } from "../data/daily";
import { CGS, cgFile, cgUnlocked, getCg } from "../data/cgs";
import { SPECIAL_ILLUSTS, specialIllustFile } from "../data/special_illust";
import { ROUTES, Route, getRoute } from "../data/routes";
import { setupCheats } from "./cheats";
import {
  initAudio, playBgm, toggleMuted, isMuted,
  sfxTap, sfxChoiceOpen, sfxSelect, sfxCoin, sfxReward, sfxCg,
} from "./audio";

let state: GameState;
let root: HTMLElement;

// ── 현재 루트 컨텍스트 (홈/게임 화면은 이 루트 기준으로 동작) ──
function activeRoute(): Route | undefined { return getRoute(state.currentRoute); }
function activeCharId(): CharacterId { return activeRoute()?.charId ?? "estelle"; }
function activeEpisodes(): Episode[] { return activeRoute()?.episodes ?? EPISODES; }
function prog(): { epCleared: string[]; nextEpFreeAt: number } {
  return ensureRoute(state, state.currentRoute || "estelle");
}
function activeAff(): number { return affectionOf(state, activeCharId()); }
function activeTier(): number { return tierOf(activeAff()); }
function hasRouteProgress(): boolean {
  return Object.values(state.routes).some((route) => route.epCleared.length > 0 || route.nextEpFreeAt > 0);
}

// 홈 화면 포트레이트 = 현재 루트의 주인공 (흉상 우선, 하단은 CSS 페이드)
function setEmotion(name: Emotion) {
  ($("#charImg") as HTMLImageElement).src = vnFile(activeCharId(), name);
}

// 일러 수집: 실제 표시된(폴백 해석된) 표정 기준. 새 일러면 저장+토스트.
function collectIllust(id: CharacterId, resolved: Emotion) {
  const list = (state.illust[id] ??= []);
  if (list.includes(resolved)) return;
  list.push(resolved);
  saveState(state);
  toast(`🖼 일러스트 수집: ${CHARACTERS[id].name} — ${EMOTION_LABEL[resolved]}`);
}

// VN 포트레이트 교체(상반신 우선) + 수집 기록. 임시 대체 아트면 우상단 배지.
function setVnPortrait(id: CharacterId, e?: Emotion) {
  const resolved = resolveEmotion(CHARACTERS[id], e);
  ($("#vnPortrait") as HTMLImageElement).src = vnFile(id, resolved);
  $("#vnPh").classList.toggle("hidden", !isPlaceholderArt(id, e));
  collectIllust(id, resolved);
}

export function mountGame(el: HTMLElement) {
  root = el;
  state = loadState();

  // 연속 방문 스트릭 갱신 → 7일 달성 시 한정 악세서리 지급
  const { reached7 } = updateStreak(state);
  if (reached7 && !state.ownedCosmetics.includes("acc_star")) {
    state.ownedCosmetics.push("acc_star");
    setTimeout(() => toast("⭐ 7일 연속 방문! '별의 머리핀' 지급"), 700);
  }
  saveState(state);

  root.innerHTML = template();
  wire();
  initAudio(); // 첫 제스처에서 BGM 잠금 해제
  updateMuteUI();

  // 디버그/치트 패널 (DEV 또는 ?cheat=1 — Shift+Click/트리플탭으로 열기)
  setupCheats({
    state,
    refresh: () => { saveState(state); render(); },
    toast,
    enterRoute,
    showMain,
    activeCharId,
    activeRouteId: () => state.currentRoute,
  });

  // 진입점: 저장된 진행 중 루트가 있으면 그 홈으로, 없으면 메인(타이틀) 화면.
  if (!state.onboarded && !state.currentRoute && !hasRouteProgress()) {
    state.onboarded = true;
    saveState(state);
    enterRoute("estelle");
    return;
  }

  if (state.currentRoute && getRoute(state.currentRoute)?.available) {
    enterRoute(state.currentRoute, false);
  } else {
    showMain();
  }
}

// ── 메인(타이틀) 화면 ──
function showMain() {
  state.currentRoute = "";
  saveState(state);
  renderMainScreen();
  $("#mainScreen").classList.remove("hidden");
  playBgm("title");
}

function renderMainScreen() {
  $("#routeCards").innerHTML = ROUTES.map((r) => {
    const cleared = state.routes[r.id]?.epCleared.length ?? 0;
    const total = r.episodes.length;
    const locked = !r.available;
    const badge = locked
      ? `🔒 이야기 준비 중`
      : `📖 ${cleared}/${total}화`;
    // 아트 미보유 캐릭터(시트 대기 중)는 이미지 대신 ? 실루엣
    const c = CHARACTERS[r.charId];
    const artless = !c.body.length && !c.bust.length;
    const art = artless
      ? `<div class="rc-unknown">?</div>`
      : `<img src="${vnFile(r.charId, "soft")}" alt="" />${
          isPlaceholderArt(r.charId) ? `<div class="ph-badge">임시</div>` : ""}`;
    return `<button class="route-card ${locked ? "locked" : ""}" data-route="${r.id}" ${locked ? "disabled" : ""}>
      <div class="rc-art">${art}</div>
      <div class="rc-info">
        <div class="rc-title">${r.title}</div>
        <div class="rc-desc">${r.desc}</div>
        <div class="rc-prog">${badge}</div>
      </div>
    </button>`;
  }).join("");
  $("#routeCards").querySelectorAll("[data-route]").forEach((b) =>
    b.addEventListener("click", () => enterRoute((b as HTMLElement).dataset.route!))
  );
}

// 루트 진입 → 해당 캐릭터 시점의 홈 화면으로 전환.
function enterRoute(routeId: string, autoPlayFirst = true) {
  const route = getRoute(routeId);
  if (!route || !route.available) return;
  state.currentRoute = routeId;
  ensureRoute(state, routeId);
  saveState(state);
  $("#mainScreen").classList.add("hidden");
  playBgm("story");
  setEmotion("greet");
  setBubble(greeting(activeTier()));
  render();

  // 최초 진입(해당 루트 진행 0)이면 1화 자동 재생 (구 프롤로그 자동재생 대체)
  const first = route.episodes[0];
  if (autoPlayFirst && first && !prog().epCleared.includes(first.id)) playEpisode(first);
}

function template(): string {
  return `
  <div class="stage">
    <div class="hud">
      <button class="home-btn" id="btnMain" aria-label="메인으로">🏰</button>
      <button class="home-btn" id="btnMute" aria-label="소리">🔊</button>
      <div class="coins">🪙 <span id="coinVal">0</span></div>
      <div class="affbox">
        <div class="afftop"><span id="tierName">낯가림</span><span id="affVal">0</span>/${MAX_AFFECTION}</div>
        <div class="affbar"><div id="affFill" class="afffill"></div></div>
      </div>
    </div>

    <div class="character" id="char">
      <img class="portrait" id="charImg" alt="에스텔" />
      <div class="acc" id="charAcc"></div>
    </div>

    <div class="bubble" id="bubble"></div>

    <div class="actions">
      <button class="btn" id="btnStory">📖 이야기</button>
      <button class="btn" id="btnDaily">🌸 오늘의 일상 <small id="dailyState"></small></button>
      <button class="btn" id="btnGift">🎁 선물하기 <small>(${GIFT_COST}🪙)</small></button>
      <button class="btn" id="btnCollect">🗂 수집</button>
      <button class="btn" id="btnCloset">👗 옷장</button>
    </div>
  </div>

  <div class="main-screen hidden" id="mainScreen">
    <button class="ms-mute" id="btnMuteMain" aria-label="소리">🔊</button>
    <div class="ms-inner">
      <div class="ms-crest">✧</div>
      <div class="ms-title">에스텔<br><span>— 스러진 봄의 약속 —</span></div>
      <div class="ms-sub">회귀한 당신이, 정해진 비극의 실을 하나씩 끊어낸다.<br>하나의 사건, 그러나 시점마다 다른 이야기.</div>
      <button class="btn ms-prologue" id="btnPrologue">✦ 프롤로그 — 스러진 봄</button>
      <div class="route-cards" id="routeCards"></div>
      <button class="btn ms-illust" id="btnMainCollect">🖼 일러스트 도감</button>
      <div class="ms-foot">캐릭터를 선택해 그 시점의 이야기를 시작하세요</div>
    </div>
  </div>

  <div class="modal hidden" id="closet">
    <div class="sheet">
      <div class="sheet-head">👗 옷장 <button class="x" id="closetX">✕</button></div>
      <div class="tabs">
        <button class="tab active" data-slot="outfit">의상</button>
        <button class="tab" data-slot="accessory">악세서리</button>
      </div>
      <div class="grid" id="closetGrid"></div>
    </div>
  </div>

  <div class="modal hidden" id="adModal">
    <div class="ad-card">
      <div class="ad-badge">광고</div>
      <div class="ad-spin"></div>
      <div class="ad-text">광고 재생 중… <span id="adCount">3</span>s</div>
      <div class="ad-note">시청 완료 후 코인이 지급됩니다</div>
    </div>
  </div>

  <div class="modal hidden" id="interAd">
    <div class="ad-card">
      <div class="ad-badge">광고</div>
      <div class="ad-spin"></div>
      <div class="ad-text">잠시 후 계속됩니다…</div>
      <div class="ad-note">전면 광고</div>
    </div>
  </div>

  <div class="modal hidden" id="coinShort">
    <div class="sheet mini-sheet">
      <div class="cs-msg">코인이 부족해요</div>
      <div class="cs-sub">📺 광고를 <b>끝까지 시청 후</b> +${AD_REWARD}🪙를 받을 수 있어요</div>
      <div class="cs-actions">
        <button class="btn ad" id="coinAdWatch">📺 광고 시청 후 +${AD_REWARD} 받기</button>
        <button class="btn ghost" id="coinAdClose">닫기</button>
      </div>
    </div>
  </div>

  <div class="modal hidden" id="storyList">
    <div class="sheet">
      <div class="sheet-head">📖 이야기 <button class="x" id="storyX">✕</button></div>
      <div class="story-items" id="storyItems"></div>
    </div>
  </div>

  <div class="modal hidden" id="collect">
    <div class="sheet">
      <div class="sheet-head">🖼 일러스트 <span id="collectCount" class="collect-count"></span>
        <button class="x" id="collectX">✕</button></div>
      <div class="tabs" id="collectTabs"></div>
      <div id="illustWrap"></div>
    </div>
  </div>

  <div class="modal hidden" id="illustView">
    <img id="illustViewImg" alt="" />
    <div class="illust-cap" id="illustViewCap"></div>
  </div>

  <div class="vn hidden" id="vn">
    <button class="vn-exit" id="vnExit" aria-label="나가기">✕</button>
    <button class="vn-log-btn" id="vnLogBtn" aria-label="대화 기록">📜</button>
    <div class="vn-portrait-wrap"><img class="vn-portrait" id="vnPortrait" alt="" />
      <div class="ph-badge hidden" id="vnPh">임시</div></div>
    <div class="vn-cg hidden" id="vnCg"><img id="vnCgImg" alt="" /></div>
    <div class="vn-box">
      <div class="panel">
        <div class="vn-name" id="vnName"></div>
        <div class="vn-text" id="vnText"></div>
        <div class="vn-hint" id="vnHint">▼</div>
      </div>
    </div>
    <div class="vn-choices hidden" id="vnChoices"></div>
    <div class="vn-backlog hidden" id="vnBacklog">
      <div class="vn-backlog-head">📜 대화 기록 <button class="x" id="vnBacklogX">✕</button></div>
      <div class="vn-backlog-list" id="vnBacklogList"></div>
    </div>
  </div>

  <div class="toasts" id="toasts"></div>`;
}

let closetSlot: Slot = "outfit";

function wire() {
  $("#btnMain").onclick = () => showMain();
  $("#btnGift").onclick = onGift;
  $("#btnDaily").onclick = onDaily;
  $("#btnCollect").onclick = openCollect;
  $("#btnCloset").onclick = () => openCloset();
  $("#closetX").onclick = () => $("#closet").classList.add("hidden");
  $("#collectX").onclick = () => $("#collect").classList.add("hidden");
  $("#illustView").onclick = () => $("#illustView").classList.add("hidden");
  $("#btnMainCollect").onclick = () => openCollect(); // 메인화면에서도 도감 열람
  $("#btnStory").onclick = () => openStoryList();
  $("#storyX").onclick = () => closeStoryList();
  $("#coinAdClose").onclick = () => closeCoinShort();
  $("#coinAdWatch").onclick = onCoinShortWatch;
  $("#vn").addEventListener("click", () => {
    if (vnChoosing) return;
    if (vnTyping) { finishVnType(); return; } // 타이핑 중 터치 → 즉시 완성
    sfxTap();
    showNext();
  });
  $("#vnExit").addEventListener("click", (e) => {
    e.stopPropagation(); // VN 진행 탭과 분리
    exitVn();
  });
  // 대화 기록(백로그) — 열람 중엔 VN 진행 탭 무시
  $("#vnLogBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    openBacklog();
  });
  $("#vnBacklog").addEventListener("click", (e) => {
    e.stopPropagation(); // 오버레이 탭이 VN 진행으로 새지 않게
    $("#vnBacklog").classList.add("hidden");
  });
  // 메인 화면 — 전체 스토리 프롤로그 보기 (보상 없음, 언제든 다시보기)
  $("#btnPrologue").onclick = () => playSteps(PROLOGUE.steps, () => {}, false);
  // 음소거 토글 (홈 HUD + 메인 화면)
  $("#btnMute").onclick = () => { toggleMuted(); updateMuteUI(); };
  $("#btnMuteMain").onclick = () => { toggleMuted(); updateMuteUI(); };
  // 옷장 탭 (수집 탭과 셀렉터 충돌 방지 위해 #closet 스코프 한정)
  root.querySelectorAll("#closet .tab").forEach((t) =>
    t.addEventListener("click", () => {
      closetSlot = (t as HTMLElement).dataset.slot as Slot;
      root.querySelectorAll("#closet .tab").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      renderCloset();
    })
  );
}

// 음소거 토글 버튼 아이콘 동기화 (홈 HUD + 메인 화면)
function updateMuteUI() {
  const icon = isMuted() ? "🔇" : "🔊";
  $("#btnMute").textContent = icon;
  $("#btnMuteMain").textContent = icon;
}

// 호감도 증가 → 현재 루트 캐릭터에 적립 (에피소드는 순차 해금 방식이라 별도 알림 없음)
function gainAffection(amount: number) {
  addAffectionTo(state, activeCharId(), amount);
  saveState(state); // 선택지 호감도도 즉시 영속 (저장 누락 방지)
}

// ── 선물 ──
function onGift() {
  if (state.coins < GIFT_COST) { openCoinShort(onGift); return; }
  state.coins -= GIFT_COST;
  gainAffection(GIFT_GAIN);
  sfxCoin();
  setBubble(giftLine());
  setEmotion("happy");
  persist();
}

// ── 코인 부족 → 리워드 광고 유도 미니 모달 ──
// ⚠️ 앱인토스 문구 규칙: "광고 시청 후 지급" 형식만. "클릭 시 보상" 금지.
let coinShortRetry: (() => void) | null = null;
function openCoinShort(retry?: () => void) {
  coinShortRetry = retry ?? null;
  $("#coinShort").classList.remove("hidden");
}
function closeCoinShort() {
  coinShortRetry = null;
  $("#coinShort").classList.add("hidden");
}
async function onCoinShortWatch() {
  const btn = $("#coinAdWatch") as HTMLButtonElement;
  btn.disabled = true;
  const result = await showRewardedAd(playMockAd);
  btn.disabled = false;
  if (result === "rewarded") {
    state.coins += AD_REWARD;
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

// ── 옷장 ──
function openCloset() {
  $("#closet").classList.remove("hidden");
  renderCloset();
}

function renderCloset() {
  const tier = activeTier();
  const items = COSMETICS.filter(
    (c) => c.slot === closetSlot && (!c.hidden || state.ownedCosmetics.includes(c.id))
  );
  $("#closetGrid").innerHTML = items
    .map((c) => {
      const owned = state.ownedCosmetics.includes(c.id);
      const equipped = state.equipped[c.slot] === c.id;
      const locked = tier < c.unlockTier;
      const swatch =
        c.slot === "outfit"
          ? `<span class="sw" style="background:${c.visual}"></span>`
          : `<span class="sw emoji">${c.visual || "∅"}</span>`;
      let action: string;
      if (locked) action = `<span class="lock">티어 ${c.unlockTier} 해금</span>`;
      else if (equipped) action = `<span class="badge on">착용 중</span>`;
      else if (owned) action = `<button class="mini" data-equip="${c.id}">착용</button>`;
      else action = `<button class="mini buy" data-buy="${c.id}">${c.price}🪙</button>`;
      return `<div class="cell ${locked ? "locked" : ""}">
        ${swatch}<div class="cname">${c.name}</div>${action}</div>`;
    })
    .join("");

  $("#closetGrid").querySelectorAll("[data-buy]").forEach((b) =>
    b.addEventListener("click", () => buy((b as HTMLElement).dataset.buy!))
  );
  $("#closetGrid").querySelectorAll("[data-equip]").forEach((b) =>
    b.addEventListener("click", () => equip((b as HTMLElement).dataset.equip!))
  );
}

function buy(id: string) {
  const c = getCosmetic(id);
  if (!c) return;
  if (state.coins < c.price) {
    openCoinShort(() => buy(id));
    return;
  }
  state.coins -= c.price;
  state.ownedCosmetics.push(id);
  equip(id);
  toast(`${c.name} 구매 완료!`);
}

function equip(id: string) {
  const c = getCosmetic(id);
  if (!c) return;
  state.equipped[c.slot] = id;
  persist();
  renderCloset();
}

// ── 렌더 ──
function render() {
  const aff = activeAff();
  const tier = tierOf(aff);
  $("#coinVal").textContent = String(state.coins);
  $("#affVal").textContent = String(aff);
  $("#tierName").textContent = TIER_NAMES[tier];
  ($("#affFill") as HTMLElement).style.width =
    `${(aff / MAX_AFFECTION) * 100}%`;

  // 오늘의 일상 완료 여부 반영
  const dailyDone = state.dailyDoneDay === todayKey();
  ($("#btnDaily") as HTMLButtonElement).disabled = dailyDone;
  $("#dailyState").textContent = dailyDone ? "(내일 다시)" : "";

  // 포즈 일러는 setEmotion이 담당. 여기선 악세서리 오버레이만 갱신.
  const acc = getCosmetic(state.equipped.accessory);
  $("#charAcc").textContent = acc?.visual ?? "";
}

function persist() {
  saveState(state);
  render();
}

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

function openStoryList() {
  renderStoryList();
  $("#storyList").classList.remove("hidden");
  if (epTimerIv) clearInterval(epTimerIv);
  epTimerIv = window.setInterval(updateEpCountdown, 1000);
}
function closeStoryList() {
  $("#storyList").classList.add("hidden");
  if (epTimerIv) { clearInterval(epTimerIv); epTimerIv = undefined; }
}

function fmtDur(ms: number): string {
  const s = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(sec)}`;
}

function renderStoryList() {
  $("#storyItems").innerHTML = activeEpisodes().map((ep) => {
    const st = epStatus(ep);
    let right = "";
    let extra = "";
    if (st === "cleared") {
      right = `<button class="mini" data-play="${ep.id}">✓ 다시보기</button>`;
    } else if (st === "playable") {
      right = `<button class="mini play" data-play="${ep.id}">▶ 재생</button>`;
    } else if (st === "timer") {
      const remain = prog().nextEpFreeAt - Date.now();
      right = `<button class="mini play" data-adplay="${ep.id}">📺 광고 보고 지금 보기</button>`;
      extra = `<div class="ep-count" data-count>⏳ ${fmtDur(remain)} 후 무료</div>`;
    } else {
      right = `<span class="s">🔒 잠김</span>`;
    }
    const cls = st === "locked" ? "locked" : st === "timer" ? "waiting" : "";
    return `<div class="story-item ${cls}">
      <div class="ep-main">
        <div class="t">${ep.title}</div>
        <div class="s teaser">${ep.teaser}</div>
        ${extra}
      </div>${right}</div>`;
  }).join("");

  $("#storyItems").querySelectorAll("[data-play]").forEach((b) =>
    b.addEventListener("click", () => {
      const ep = activeEpisodes().find((e) => e.id === (b as HTMLElement).dataset.play);
      if (ep) { closeStoryList(); playEpisode(ep); }
    })
  );
  $("#storyItems").querySelectorAll("[data-adplay]").forEach((b) =>
    b.addEventListener("click", () => onAdUnlock((b as HTMLElement).dataset.adplay!))
  );
}

// 타이머 카운트다운 갱신(모달 열려있는 동안 1초마다). 0 도달 시 목록 재렌더 → 재생 버튼으로 전환.
function updateEpCountdown() {
  const el = root.querySelector("[data-count]") as HTMLElement | null;
  if (!el) return;
  const remain = prog().nextEpFreeAt - Date.now();
  if (remain <= 0) { renderStoryList(); return; }
  el.textContent = `⏳ ${fmtDur(remain)} 후 무료`;
}

// 광고 보고 지금 보기 → 리워드 광고 완료 시 즉시 해금
let adUnlockBusy = false; // 광고 재생 중 재탭 → SDK 동시호출/VN 리셋 방지
async function onAdUnlock(id: string) {
  const ep = activeEpisodes().find((e) => e.id === id);
  if (!ep || adUnlockBusy) return;
  adUnlockBusy = true;
  const result = await showRewardedAd(playMockAd);
  adUnlockBusy = false;
  if (result === "rewarded") {
    prog().nextEpFreeAt = 0; // 대기 해제(중도 이탈해도 해금 유지)
    saveState(state);
    closeStoryList();
    playEpisode(ep);
  } else if (result === "dismissed") {
    toast("끝까지 보면 지금 이어볼 수 있어요");
  } else {
    toast("광고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요");
  }
}

// ── 오늘의 일상 (일일 미니 씬) ──
// 로컬 자정 기준 일수 (완료 게이트 todayKey와 동일 기준 — UTC 혼용 시 로테이션 어긋남)
function dayIndex(): number {
  return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
}
function onDaily() {
  if (state.dailyDoneDay === todayKey()) {
    toast("오늘의 일상은 이미 함께했어요. 내일 또 와요");
    return;
  }
  // 루트별 일일 씬 (루트 없으면 에스텔 기본)
  const pool = activeRoute()?.daily ?? DAILY_SCENES;
  const scene = pool[dayIndex() % pool.length];
  playSteps(scene.steps, () => {
    if (state.dailyDoneDay !== todayKey()) {
      addAffectionTo(state, activeCharId(), DAILY_AFFECTION);
      state.dailyDoneDay = todayKey();
      saveState(state);
      render();
      toast(`🌸 오늘의 일상 완료 +${DAILY_AFFECTION} 호감도`);
    }
    // 일일 씬 뒤에는 전면 광고 금지(과노출 방지)
  });
}

// ── 일러스트 도감 (캐릭터별 탭 — 긴 스크롤 방지) ──
let collectTab: CharacterId = "estelle";
function openCollect() {
  renderCollect();
  $("#collect").classList.remove("hidden");
}
function renderCollect() {
  // 일러 보유 캐릭터 + 아트 준비 중인 루트 캐릭터(placeholder 탭)
  const chars = (Object.keys(CHARACTERS) as CharacterId[])
    .filter((id) => CHARACTERS[id].hasPortrait || ROUTES.some((r) => r.charId === id));
  if (!chars.includes(collectTab)) collectTab = chars[0];
  $("#collectTabs").innerHTML = chars.map((id) =>
    `<button class="tab ${id === collectTab ? "active" : ""}" data-ctab="${id}">${CHARACTERS[id].name}</button>`
  ).join("");
  $("#collectTabs").querySelectorAll("[data-ctab]").forEach((t) =>
    t.addEventListener("click", () => {
      collectTab = (t as HTMLElement).dataset.ctab as CharacterId;
      renderCollect();
    })
  );
  renderIllust(collectTab);
}
function renderIllust(id: CharacterId) {
  // CG 해금은 모든 루트 진행의 합집합으로 판정 (루트 교차 매핑).
  const cleared = allClearedEpisodes(state);
  const c = CHARACTERS[id];
  // 아트 미보유(시트 준비 중) 캐릭터 — placeholder 도감
  if (!c.body.length && !c.bust.length) {
    $("#collectCount").textContent = `0/?`;
    $("#illustWrap").innerHTML = `
      <div class="isec-t">표정</div>
      <div class="igrid">${Array.from({ length: 4 }, () =>
        `<div class="icell locked unknown"><div class="iq">?</div>
          <div class="ilabel">🔒 준비 중</div></div>`).join("")}</div>
      <div class="collect-tease">🖼 ${c.name}의 일러스트는 준비 중이에요.<br>이야기가 열리면 함께 만나요.</div>`;
    return;
  }
  // 표정(상반신) — 스토리에서 본 표정 수집
  const emoSet = c.bust.length ? c.bust : c.body;
  const seen = state.illust[id] ?? [];
  const aff = affectionOf(state, id);
  const poseCells = emoSet.map((e) => {
    const owned = seen.includes(e);
    if (owned) {
      return `<div class="icell" data-ill="${id}:${e}">
        <img src="${vnFile(id, e)}" alt="" />
        <div class="ilabel">${EMOTION_LABEL[e]}</div></div>`;
    }
    return `<div class="icell locked">
      <img src="${vnFile(id, e)}" alt="" />
      <div class="ilabel">잠김</div></div>`;
  }).join("");
  const poseOwned = emoSet.filter((e) => seen.includes(e)).length;
  // 전신샷 — 같은 표정을 본 적 있으면 해금 (bust와 별개 세트일 때만 표시)
  const bodySet = c.bust.length ? c.body : [];
  const bodyOwned = bodySet.filter((e) => seen.includes(e)).length;
  const bodyCells = bodySet.map((e) => {
    const owned = seen.includes(e);
    if (owned) {
      return `<div class="icell" data-illb="${id}:${e}">
        <img src="${portraitFile(id, e)}" alt="" />
        <div class="ilabel">${EMOTION_LABEL[e]} · 전신</div></div>`;
    }
    return `<div class="icell locked">
      <img src="${portraitFile(id, e)}" alt="" />
      <div class="ilabel">잠김</div></div>`;
  }).join("");
  // 이벤트 CG — 에피소드 클리어로 해금
  const cgs = CGS.filter((g) => g.char === id);
  const cgOwned = cgs.filter((g) => cgUnlocked(g, cleared, state.cgSeen)).length;
  const cgCells = cgs.map((g) => {
    const owned = cgUnlocked(g, cleared, state.cgSeen);
    if (owned) {
      return `<div class="icell cg" data-cg="${g.id}">
        <img src="${cgFile(g)}" alt="" />
        <div class="ilabel">${g.title}</div></div>`;
    }
    return `<div class="icell cg locked">
      <img src="${cgFile(g)}" alt="" />
      <div class="ilabel">🔒 ???</div></div>`;
  }).join("");
  const specials = SPECIAL_ILLUSTS.filter((g) => g.char === id);
  const specialOwned = specials.filter((g) => aff >= g.affection).length;
  const specialCells = specials.map((g) => {
    if (aff >= g.affection) {
      return `<div class="icell cg special" data-special="${g.id}">
        <img src="${specialIllustFile(g)}" alt="" />
        <div class="ilabel">${g.title}${g.placeholder ? " · 임시" : ""}</div></div>`;
    }
    return `<div class="icell cg locked aff-locked">
      <img src="${specialIllustFile(g)}" alt="" />
      <div class="ilabel">호감도 ${g.affection}</div></div>`;
  }).join("");
  const ownedN = poseOwned + bodyOwned + cgOwned + specialOwned;
  const total = emoSet.length + bodySet.length + cgs.length + specials.length;
  $("#collectCount").textContent = `${ownedN}/${total} · 호감도 ${aff}`;
  $("#illustWrap").innerHTML = `
    <div class="isec-t">표정</div>
    <div class="igrid">${poseCells}</div>
    ${bodyCells ? `<div class="isec-t">전신</div><div class="igrid">${bodyCells}</div>` : ""}
    ${cgCells ? `<div class="isec-t">스토리 CG</div><div class="igrid cg2">${cgCells}</div>` : ""}
    ${specialCells ? `<div class="isec-t">스페셜 CG <small>호감도 전용</small></div><div class="igrid cg2">${specialCells}</div>` : ""}`;
  $("#illustWrap").querySelectorAll("[data-ill]").forEach((el) =>
    el.addEventListener("click", () => {
      const [id, e] = (el as HTMLElement).dataset.ill!.split(":") as [CharacterId, Emotion];
      ($("#illustViewImg") as HTMLImageElement).src = vnFile(id, e);
      $("#illustViewCap").textContent = `${CHARACTERS[id].name} — ${EMOTION_LABEL[e]}`;
      $("#illustView").classList.remove("hidden");
    })
  );
  $("#illustWrap").querySelectorAll("[data-illb]").forEach((el) =>
    el.addEventListener("click", () => {
      const [id, e] = (el as HTMLElement).dataset.illb!.split(":") as [CharacterId, Emotion];
      ($("#illustViewImg") as HTMLImageElement).src = portraitFile(id, e);
      $("#illustViewCap").textContent = `${CHARACTERS[id].name} — ${EMOTION_LABEL[e]} (전신)`;
      $("#illustView").classList.remove("hidden");
    })
  );
  $("#illustWrap").querySelectorAll("[data-cg]").forEach((el) =>
    el.addEventListener("click", () => {
      const g = CGS.find((x) => x.id === (el as HTMLElement).dataset.cg)!;
      ($("#illustViewImg") as HTMLImageElement).src = cgFile(g);
      $("#illustViewCap").textContent = `${CHARACTERS[g.char].name} — ${g.title}`;
      $("#illustView").classList.remove("hidden");
    })
  );
  $("#illustWrap").querySelectorAll("[data-special]").forEach((el) =>
    el.addEventListener("click", () => {
      const g = SPECIAL_ILLUSTS.find((x) => x.id === (el as HTMLElement).dataset.special)!;
      ($("#illustViewImg") as HTMLImageElement).src = specialIllustFile(g);
      $("#illustViewCap").textContent = `${CHARACTERS[g.char].name} — ${g.title}`;
      $("#illustView").classList.remove("hidden");
    })
  );
}

// ── VN 리더 (에피소드/일일 공용 스텝 플레이어) ──
let vnSteps: Step[] = [];
let vnIndex = 0;
let vnQueue: Line[] = [];
let vnChoosing = false;
let vnActive = false;
let vnOnEnd: (() => void) | null = null;
// 다시보기(replay)에서는 선택지 호감도 재지급 금지 (호감도 파밍 익스플로잇 방지)
let vnGrantRewards = true;
// 타이핑 연출 상태
let vnTyping = false;
let vnFull = "";
let vnTypeIv: number | undefined;
function stopVnType() { if (vnTypeIv) { clearInterval(vnTypeIv); vnTypeIv = undefined; } vnTyping = false; }
function finishVnType() {
  stopVnType();
  $("#vnText").textContent = vnFull;
  $("#vnHint").classList.remove("hidden");
}
function startVnType(text: string) {
  vnFull = text;
  const t = $("#vnText"); t.textContent = "";
  $("#vnHint").classList.add("hidden");
  vnTyping = true;
  let idx = 0;
  if (vnTypeIv) clearInterval(vnTypeIv);
  vnTypeIv = window.setInterval(() => {
    idx++; t.textContent = vnFull.slice(0, idx);
    if (idx >= vnFull.length) finishVnType();
  }, 24);
}

// ── 대화 기록(백로그) — 현재 VN 세션에서 표시된 대사 누적 ──
let vnLog: { name: string; text: string; narr: boolean; color?: string }[] = [];
function pushLog(name: string, text: string, narr = false, color?: string) {
  vnLog.push({ name, text, narr, color });
}
function openBacklog() {
  $("#vnBacklogList").innerHTML = vnLog.length
    ? vnLog.map((l) => `<div class="bl-item ${l.narr ? "narr" : ""}">
        ${l.name ? `<div class="bl-name"${l.color ? ` style="color:${l.color}"` : ""}>${l.name}</div>` : ""}
        <div class="bl-text"${l.color ? ` style="color:${l.color}"` : ""}>${l.text}</div></div>`).join("")
    : `<div class="bl-item narr"><div class="bl-text">아직 기록이 없어요.</div></div>`;
  $("#vnBacklog").classList.remove("hidden");
  const list = $("#vnBacklogList");
  list.scrollTop = list.scrollHeight; // 최신 대사가 보이게
}

// 스텝 배열을 재생. 완료 시 onEnd 콜백 호출.
function playSteps(steps: Step[], onEnd: () => void, grantRewards = true) {
  vnGrantRewards = grantRewards;
  vnSteps = steps;
  vnIndex = 0;
  vnQueue = [];
  vnChoosing = false;
  vnActive = true;
  vnLog = []; // 백로그는 세션 단위
  vnCgHold = false;
  $("#vnBacklog").classList.add("hidden");
  vnOnEnd = onEnd;
  setVnPortrait(activeCharId(), "soft"); // 기본 포트레이트 (수집 기록 포함)
  $("#vn").classList.remove("hidden");
  showNext();
}

// 에피소드 재생. 최초 클리어면 완료 시 보상 처리.
function playEpisode(ep: Episode) {
  const firstClear = !prog().epCleared.includes(ep.id);
  playSteps(ep.steps, () => {
    if (firstClear) onEpisodeCleared(ep);
  }, firstClear); // 다시보기는 선택지 호감도 미지급
}

function onEpisodeCleared(ep: Episode) {
  prog().epCleared.push(ep.id);
  state.coins += ep.rewardCoins;
  // 다음 화 '기다리면 무료' 타이머 설정 (다음 화가 있을 때만 — 시즌 마지막 화 잔여 타이머 방지)
  if (activeEpisodes().some((e) => e.index === ep.index + 1)) {
    prog().nextEpFreeAt = Date.now() + epWaitMs();
  }
  saveState(state);
  render();
  sfxReward();
  toast(`📖 ${ep.title} 완료 +${ep.rewardCoins}🪙`);
  // 스토리 중 연출로 이미 수집된 CG는 재토스트 안 함
  CGS.filter((g) => g.unlockEp === ep.id && !state.cgSeen.includes(g.id)).forEach((cg, i) =>
    setTimeout(() => toast(`🖼 이벤트 일러 해금: ${cg.title}`), 950 + i * 950)
  );

  // ⚠️ 앱인토스 정책: 전면 광고는 로딩/인트로/컷신 노출 금지 →
  //    '완료 결과(보상 지급)' 직후에만 배치. 단 최초 진입 시 자동재생되는 1화는
  //    온보딩/인트로 성격이라 스킵(정책 경계 + 첫인상 보호). 일일 씬 뒤에도 미노출.
  if (ep.index > 1) showInterstitialAd(playMockInterstitial);
}

function showNext() {
  if (!vnActive || vnChoosing) return;
  if (vnQueue.length) { displayLine(vnQueue.shift()!); return; }
  if (vnIndex >= vnSteps.length) { endVn(); return; }
  const step = vnSteps[vnIndex++];
  if (step.kind === "line") displayLine(step.line);
  else if (step.kind === "cg") displayCg(step.id, step.hold);
  else if (step.kind === "cgEnd") { vnCgHold = false; $("#vnCg").classList.add("hidden"); showNext(); }
  else renderChoice(step.choice);
}

// 이벤트 CG 연출 — 표시되는 그 순간 수집.
// hold=true면 이후 대사가 CG 위에서 계속 진행 (cgEnd/씬 종료까지).
let vnCgHold = false;
function displayCg(id: string, hold = false) {
  const cg = getCg(id);
  if (!cg) { showNext(); return; }
  vnCgHold = hold;
  sfxCg();
  ($("#vnCgImg") as HTMLImageElement).src = cgFile(cg);
  $("#vnCg").classList.remove("hidden");
  $("#vnName").textContent = "";
  $("#vnName").style.color = "";
  const t = $("#vnText");
  stopVnType();
  t.classList.add("narr");
  t.style.color = "";
  t.textContent = `— ${cg.title} —`;
  $("#vnHint").classList.remove("hidden");
  if (!state.cgSeen.includes(id)) {
    state.cgSeen.push(id);
    saveState(state);
    toast(`🖼 이벤트 일러 수집: ${cg.title}`);
  }
  pushLog("", `— ${cg.title} —`, true);
}

function displayLine(line: Line) {
  if (!vnCgHold) $("#vnCg").classList.add("hidden"); // CG 유지 연출 중엔 내리지 않음
  const spk = line.speaker;
  const nameEl = $("#vnName");
  const textEl = $("#vnText");
  if (spk === "narration") {
    nameEl.textContent = "";
    nameEl.style.color = "";
    textEl.classList.add("narr");
    textEl.style.color = ""; // 내레이션 = 기본 뮤트 톤 (.narr)
    pushLog("", line.text, true);
  } else {
    const c = CHARACTERS[spk];
    nameEl.textContent = c.name;
    nameEl.style.color = c.color; // 화자별 색 구분
    textEl.classList.remove("narr");
    textEl.style.color = c.color;
    // 일러 보유 캐릭터 + 표정 지정 시에만 포트레이트 교체 (미지정 시 이전 표정 유지)
    // (CG 유지 중엔 포트레이트가 CG 뒤에 있어 보이지 않지만 상태는 최신으로)
    if (c.hasPortrait && line.emotion) setVnPortrait(spk, line.emotion);
    pushLog(c.name, line.text, false, c.color);
  }
  $("#vnChoices").classList.add("hidden");
  startVnType(line.text); // 타이핑 연출
}

// 선택지 — 대사패널이 아닌 화면 중앙 검은 반투명 오버레이에 표시
// (CG 유지 중이면 CG 위에 그대로 뜸 — 오버레이 z5 > CG z3)
function renderChoice(choice: Choice) {
  if (!vnCgHold) $("#vnCg").classList.add("hidden");
  stopVnType();
  sfxChoiceOpen();
  vnChoosing = true;
  $("#vnHint").classList.add("hidden");
  const box = $("#vnChoices");
  box.innerHTML =
    (choice.prompt ? `<div class="vn-choice-prompt">${choice.prompt}</div>` : "") +
    choice.options
      .map((o, i) => `<button class="btn" data-opt="${i}">${o.label}</button>`)
      .join("");
  box.classList.remove("hidden");
  box.querySelectorAll("[data-opt]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const o = choice.options[Number((b as HTMLElement).dataset.opt)];
      if (o.affection && vnGrantRewards) gainAffection(o.affection);
      sfxSelect();
      pushLog("", `▷ ${o.label}`, true); // 선택도 기록에 남김
      vnQueue = o.result.slice();
      vnChoosing = false;
      showNext();
    })
  );
}

function endVn() {
  stopVnType();
  vnActive = false;
  vnCgHold = false;
  const cb = vnOnEnd;
  vnOnEnd = null;
  $("#vnCg").classList.add("hidden");
  $("#vnBacklog").classList.add("hidden");
  $("#vn").classList.add("hidden");
  setEmotion("soft");
  render();
  if (cb) cb();
}

// VN 나가기(✕) — 완료 처리 없이 즉시 중단 (다시보기 이탈용. 최초 플레이 중이탈 시 클리어/보상 없음)
function exitVn() {
  stopVnType();
  vnActive = false;
  vnOnEnd = null;
  vnChoosing = false;
  vnCgHold = false;
  $("#vnCg").classList.add("hidden");
  $("#vnChoices").classList.add("hidden");
  $("#vnBacklog").classList.add("hidden");
  $("#vn").classList.add("hidden");
  setEmotion("soft");
  render();
}

// ── mock 광고 재생 (로컬 개발용) ──
function playMockAd(): Promise<void> {
  return new Promise((resolve) => {
    const modal = $("#adModal");
    const count = $("#adCount");
    modal.classList.remove("hidden");
    let n = 3;
    count.textContent = String(n);
    const iv = setInterval(() => {
      n--;
      count.textContent = String(Math.max(n, 0));
      if (n <= 0) {
        clearInterval(iv);
        modal.classList.add("hidden");
        resolve();
      }
    }, 1000);
  });
}

// mock 전면 광고: 2초 오버레이 후 자동 닫힘
function playMockInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    const modal = $("#interAd");
    modal.classList.remove("hidden");
    window.setTimeout(() => {
      modal.classList.add("hidden");
      resolve();
    }, 2000);
  });
}

// ── 유틸 ──
function setBubble(text: string) {
  const b = $("#bubble");
  b.textContent = text;
  b.classList.remove("pop");
  void (b as HTMLElement).offsetWidth; // reflow → 애니 재시작
  b.classList.add("pop");
}

// 우상단 알림 스택 — 여러 개가 겹치지 않고 세로로 쌓이며 각자 자동 소멸.
const TOAST_MAX = 5;
const TOAST_MS = 2600;
function toast(msg: string) {
  const box = $("#toasts");
  const t = document.createElement("div");
  t.className = "toast-item";
  t.textContent = msg;
  box.appendChild(t);
  // 초과분은 가장 오래된 것부터 즉시 제거
  while (box.children.length > TOAST_MAX) box.firstElementChild!.remove();
  window.setTimeout(() => {
    t.classList.add("out");
    window.setTimeout(() => t.remove(), 320);
  }, TOAST_MS);
}

function $(sel: string): HTMLElement {
  return root.querySelector(sel) as HTMLElement;
}

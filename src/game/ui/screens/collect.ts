// 수집 도감 — [🖼 일러스트 | 💬 대사 | 🏆 엔딩] 3탭.

import { $, ctx } from "../context";
import { esc, delegate, LAZY_IMG } from "../dom";
import { toast, openCoinShort } from "../modals";
import { persist, setEmotion, setBubble } from "./home";
import { enterRoute, ENDING_ICON, ENDING_NAME } from "./routes";
import {
  AFFECTION_ENABLED, SPECIAL_COIN_PER_AFF, ENDING_TYPES,
  affectionOf, allClearedEpisodes,
} from "../../state";
import { lineCatalog, CatalogLine } from "../../dialogue";
import { sfxTap, sfxCoin, playVoice } from "../../audio";
import {
  CHARACTERS, CharacterId, EMOTION_LABEL, vnFile, portraitFile,
  bustZoomOf, chestZoomOf,
} from "../../../data/characters";
import { Emotion } from "../../../data/chapters";
import { EndingType } from "../../../data/season1";
import { CGS, cgFile, cgUnlocked } from "../../../data/cgs";
import { SPECIAL_ILLUSTS, SpecialIllust, specialIllustFile } from "../../../data/special_illust";
import { ROUTES, endingInfo } from "../../../data/routes";
import { LINE_PRICE } from "../constants";

type CollectCat = "illust" | "lines" | "endings";
let collectCat: CollectCat = "illust";
let collectTab: CharacterId = "lilia";

export function openCollect(): void {
  renderCollect();
  $("#collect").classList.remove("hidden");
}

function renderCollect(): void {
  // 카테고리 탭 활성 표시
  $("#collectCats").querySelectorAll<HTMLElement>("[data-cat]").forEach((t) =>
    t.classList.toggle("active", t.dataset.cat === collectCat)
  );
  // 엔딩 탭은 캐릭터별이 아니라 전 루트 한 판이라 캐릭터 탭을 숨긴다.
  const charTabs = $("#collectTabs");
  if (collectCat === "endings") {
    charTabs.innerHTML = "";
    charTabs.classList.add("hidden");
    renderEndings();
    return;
  }
  charTabs.classList.remove("hidden");
  // 일러 보유 캐릭터 + 아트 준비 중인 루트 캐릭터(placeholder 탭). 엑스트라는 제외.
  const chars = (Object.keys(CHARACTERS) as CharacterId[])
    .filter((id) => !CHARACTERS[id].extra &&
      (CHARACTERS[id].hasPortrait || ROUTES.some((r) => r.charId === id)));
  if (!chars.includes(collectTab)) collectTab = chars[0];
  charTabs.innerHTML = chars.map((id) =>
    `<button class="tab ${id === collectTab ? "active" : ""}" data-ctab="${esc(id)}">${esc(CHARACTERS[id].name)}</button>`
  ).join("");
  if (collectCat === "lines") renderLines(collectTab);
  else renderIllust(collectTab);
}

function setCount(text: string): void {
  $("#collectCount").textContent = text;
}

// ── 대사 도감: 들은 대사만 해금, 탭하면 캐릭터가 홈에서 읊는다 ──
function lineItemHtml(L: CatalogLine, heard: boolean): string {
  if (heard)
    return `<button class="line-item" data-line="${esc(L.id)}">
      <span class="line-cat">${esc(L.cat)}</span><span class="line-text">${esc(L.text)}</span>
      <span class="line-play">▶</span></button>`;
  if (L.paid) // 혼잣말 — 코인 구매로 해금
    return `<button class="line-item buy" data-buy="${esc(L.id)}">
      <span class="line-cat">${esc(L.cat)}</span><span class="line-text">???</span>
      <span class="line-price">${LINE_PRICE}🪙</span></button>`;
  return `<div class="line-item locked">
    <span class="line-cat">${esc(L.cat)}</span><span class="line-text">???</span></div>`;
}

function lineCount(id: CharacterId): void {
  const catalog = lineCatalog(id);
  const heard = ctx.state.heardLines[id] ?? [];
  setCount(`${heard.filter((h) => catalog.some((L) => L.id === h)).length}/${catalog.length}`);
}

function renderLines(id: CharacterId): void {
  const catalog = lineCatalog(id);
  if (!catalog.length) { // 보이스 미등록(루트 준비 중)
    setCount("0/?");
    $("#illustWrap").innerHTML =
      `<div class="collect-tease">💬 ${esc(CHARACTERS[id].name)}의 대사는 준비 중이에요.<br>이야기가 열리면 함께 만나요.</div>`;
    return;
  }
  const heard = ctx.state.heardLines[id] ?? [];
  lineCount(id);
  $("#illustWrap").innerHTML =
    `<div class="line-list">${catalog.map((L) => lineItemHtml(L, heard.includes(L.id))).join("")}</div>`;
}

function playLine(id: CharacterId, lineId: string): void {
  const line = lineCatalog(id).find((L) => L.id === lineId);
  if (!line) return;
  const route = ROUTES.find((r) => r.charId === id);
  if (!route?.available) { toast("이야기가 열리면 들을 수 있어요"); return; }
  $("#collect").classList.add("hidden");
  // 대사읊기: 도감 닫고 해당 캐릭터 홈 버블로 재생 (+보이스 훅)
  const show = () => {
    sfxTap();
    playVoice(id, line.id); // 보이스 에셋(public/voice/ 규약) 도입 시 자동 재생
    setEmotion("soft");
    setBubble(line.text);
  };
  if (ctx.state.currentRoute !== route.id) void enterRoute(route.id, false).then(show);
  else show();
}

/** 혼잣말 구매 — 성공 시 그 셀만 교체(목록 전체 재생성 금지). */
function buyLine(charId: CharacterId, lineId: string, cell: HTMLElement): void {
  if (ctx.state.coins < LINE_PRICE) {
    openCoinShort(() => {
      // 광고로 코인 확보 후 재시도 — 그 사이 목록이 다시 그려졌을 수 있어 셀을 다시 찾는다.
      const again = ctx.root.querySelector(`[data-buy="${lineId}"]`) as HTMLElement | null;
      if (again) buyLine(charId, lineId, again);
    });
    return;
  }
  ctx.state.coins -= LINE_PRICE;
  const heard = (ctx.state.heardLines[charId] ??= []);
  if (!heard.includes(lineId)) heard.push(lineId);
  sfxCoin();
  toast("💬 혼잣말 해금! 탭해서 들어보세요");
  persist();
  const L = lineCatalog(charId).find((x) => x.id === lineId);
  if (L) cell.outerHTML = lineItemHtml(L, true);
  lineCount(charId);
}

// ── 일러스트/CG 도감 ──
/** 스페셜 CG 가격 — 구 호감도 조건(20/50/80)을 코인으로 환산. */
function specialPrice(g: { affection: number }): number {
  return g.affection * SPECIAL_COIN_PER_AFF;
}

function hasSpecial(g: SpecialIllust, aff: number): boolean {
  return AFFECTION_ENABLED ? aff >= g.affection : ctx.state.specialsOwned.includes(g.id);
}

function specialCellHtml(g: SpecialIllust, aff: number): string {
  if (hasSpecial(g, aff)) {
    return `<div class="icell cg special" data-special="${esc(g.id)}">
      <img src="${specialIllustFile(g)}" alt="" ${LAZY_IMG} />
      <div class="ilabel">${esc(g.title)}${g.placeholder ? " · 임시" : ""}</div></div>`;
  }
  if (!AFFECTION_ENABLED) {
    return `<div class="icell cg locked buy" data-buyspecial="${esc(g.id)}">
      <img src="${specialIllustFile(g)}" alt="" ${LAZY_IMG} />
      <div class="ilabel">${specialPrice(g)}🪙 해금</div></div>`;
  }
  return `<div class="icell cg locked aff-locked">
    <img src="${specialIllustFile(g)}" alt="" ${LAZY_IMG} />
    <div class="ilabel">호감도 ${g.affection}</div></div>`;
}

function illustCount(id: CharacterId): void {
  const c = CHARACTERS[id];
  const cleared = allClearedEpisodes(ctx.state);
  const seen = ctx.state.illust[id] ?? [];
  const aff = affectionOf(ctx.state, id);
  const cgs = CGS.filter((g) => g.char === id);
  const specials = SPECIAL_ILLUSTS.filter((g) => g.char === id);
  const ownedN = c.body.filter((e) => seen.includes(e)).length
    + cgs.filter((g) => cgUnlocked(g, cleared, ctx.state.cgSeen)).length
    + specials.filter((g) => hasSpecial(g, aff)).length;
  const total = c.body.length + cgs.length + specials.length;
  setCount(AFFECTION_ENABLED ? `${ownedN}/${total} · 호감도 ${aff}` : `${ownedN}/${total}`);
}

function renderIllust(id: CharacterId): void {
  // CG 해금은 모든 루트 진행의 합집합으로 판정 (루트 교차 매핑).
  const cleared = allClearedEpisodes(ctx.state);
  const c = CHARACTERS[id];
  // 아트 미보유(시트 준비 중) 캐릭터 — placeholder 도감
  if (!c.body.length) {
    setCount("0/?");
    $("#illustWrap").innerHTML = `
      <div class="isec-t">표정</div>
      <div class="igrid">${Array.from({ length: 4 }, () =>
        `<div class="icell locked unknown"><div class="iq">?</div>
          <div class="ilabel">🔒 준비 중</div></div>`).join("")}</div>
      <div class="collect-tease">🖼 ${esc(c.name)}의 일러스트는 준비 중이에요.<br>이야기가 열리면 함께 만나요.</div>`;
    return;
  }
  // 표정(반신) — 스토리에서 본 표정 수집
  const seen = ctx.state.illust[id] ?? [];
  const aff = affectionOf(ctx.state, id);
  const poseCells = c.body.map((e) => {
    const owned = seen.includes(e);
    return `<div class="icell ${owned ? "" : "locked"}" ${owned ? `data-ill="${esc(id)}:${esc(e)}"` : ""}>
      <img src="${vnFile(id, e)}" alt="" ${LAZY_IMG} />
      <div class="ilabel">${owned ? esc(EMOTION_LABEL[e]) : "잠김"}</div></div>`;
  }).join("");
  // 이벤트 CG — 에피소드 클리어로 해금.
  // 그레이스풀 폴백: CG 이미지 미존재 시 onerror로 셀에 cg-missing 클래스 → 플레이스홀더 표시.
  const fb = `onerror="this.closest('.icell').classList.add('cg-missing');this.removeAttribute('src')"`;
  const cgs = CGS.filter((g) => g.char === id);
  const cgCells = cgs.map((g) => {
    const owned = cgUnlocked(g, cleared, ctx.state.cgSeen);
    return `<div class="icell cg ${owned ? "" : "locked"}" ${owned ? `data-cg="${esc(g.id)}"` : ""}>
      <img src="${cgFile(g)}" alt="" ${LAZY_IMG} ${fb} />
      <div class="ilabel">${owned ? esc(g.title) : "🔒 ???"}</div></div>`;
  }).join("");
  // 스페셜 CG: 호감도 홀딩 중에는 코인 구매로 해금.
  const specialCells = SPECIAL_ILLUSTS.filter((g) => g.char === id)
    .map((g) => specialCellHtml(g, aff)).join("");

  illustCount(id);
  $("#illustWrap").innerHTML = `
    <div class="isec-t">표정</div>
    <div class="igrid">${poseCells}</div>
    ${cgCells ? `<div class="isec-t">스토리 CG</div><div class="cg-list">${cgCells}</div>` : ""}
    ${specialCells ? `<div class="isec-t">스페셜 CG <small>${AFFECTION_ENABLED ? "호감도 전용" : "코인 해금"}</small></div><div class="cg-list">${specialCells}</div>` : ""}`;
}

/** 스페셜 CG 구매 — 성공 시 그 셀만 교체. */
function buySpecial(spId: string, cell: HTMLElement): void {
  const g = SPECIAL_ILLUSTS.find((s) => s.id === spId);
  if (!g) return;
  const price = specialPrice(g);
  if (ctx.state.coins < price) {
    openCoinShort(() => {
      const again = ctx.root.querySelector(`[data-buyspecial="${spId}"]`) as HTMLElement | null;
      if (again) buySpecial(spId, again);
    });
    return;
  }
  ctx.state.coins -= price;
  if (!ctx.state.specialsOwned.includes(spId)) ctx.state.specialsOwned.push(spId);
  sfxCoin();
  toast("🖼 스페셜 CG 해금!");
  persist();
  cell.outerHTML = specialCellHtml(g, affectionOf(ctx.state, g.char));
  illustCount(g.char);
}

// ── 엔딩 도감 ──
// 8루트 × 3엔딩. 미획득은 자물쇠 실루엣, 획득분은 제목 + 한 줄 요약.
function renderEndings(): void {
  const rows = ROUTES.map((r) => {
    const owned = ctx.state.routes[r.id]?.endings ?? [];
    const cells = ENDING_TYPES.map((type) => {
      const has = owned.includes(type);
      const info = endingInfo(r.id, type);
      if (!has) {
        return `<div class="ecell locked">
          <div class="e-icon">🔒</div>
          <div class="e-type">${ENDING_NAME[type]}</div>
          <div class="e-title">???</div></div>`;
      }
      return `<div class="ecell ${type}" data-ending="${esc(r.id)}:${type}">
        <div class="e-icon">${ENDING_ICON[type]}</div>
        <div class="e-type">${ENDING_NAME[type]}</div>
        <div class="e-title">${esc(info?.title ?? "")}</div>
        <div class="e-sum">${esc(info?.summary ?? "")}</div></div>`;
    }).join("");
    return `<div class="erow">
      <div class="isec-t">${esc(r.title)}${owned.length === ENDING_TYPES.length ? " <small>· 전 엔딩</small>" : ""}</div>
      <div class="egrid">${cells}</div></div>`;
  }).join("");

  const ownedTotal = ROUTES.reduce((n, r) => n + (ctx.state.routes[r.id]?.endings.length ?? 0), 0);
  setCount(`${ownedTotal}/${ROUTES.length * ENDING_TYPES.length}`);
  $("#illustWrap").innerHTML = `<div class="ending-book">
    <div class="collect-tease eb-hint">⚖ 표시가 붙은 화에서 그동안의 선택(결의)이 결말을 가른다.<br>전 루트 굿엔딩을 모으면 진엔딩이 열린다.</div>
    ${rows}</div>`;
}

// ── 일러 팝업 (표정 일러에서만 모드 전환) — 반신/흉상(전신 상단 크롭)/전신 ──
type IllustMode = "bust" | "chest" | "body";
let illustViewState: { id: CharacterId; e: Emotion } | null = null;

function setIllustMode(mode: IllustMode): void {
  if (!illustViewState) return;
  const { id, e } = illustViewState;
  const img = $("#illustViewImg") as HTMLImageElement;
  // 단일 세트(body 아트) — 반신/흉상은 캐릭터별 확대율로 CSS 크롭. 전신은 원본 그대로.
  img.src = portraitFile(id, e);
  img.style.setProperty("--bz",
    mode === "bust" ? String(bustZoomOf(id)) :
    mode === "chest" ? String(chestZoomOf(id)) : "1");
  $("#illustFig").classList.toggle("bust", mode === "bust");
  $("#illustFig").classList.toggle("chest", mode === "chest");
  $("#illustViewModes").querySelectorAll("button").forEach((b) =>
    b.classList.toggle("on", (b as HTMLElement).dataset.mode === mode));
}

function openImageView(src: string, caption: string): void {
  ($("#illustViewImg") as HTMLImageElement).src = src;
  $("#illustFig").classList.remove("chest", "bust");
  $("#illustViewCap").textContent = caption;
  illustViewState = null;
  $("#illustViewModes").classList.add("hidden");
  $("#illustView").classList.remove("hidden");
}

/** 엔딩 카드 탭 — 제목+요약을 팝업 캡션으로. (엔딩 전용 CG는 아트 반입 후 연결) */
function openEndingView(routeId: string, type: EndingType): void {
  const info = endingInfo(routeId, type);
  if (!info) return;
  toast(`${ENDING_ICON[type]} ${info.title} — ${info.summary}`);
}

export function wireCollect(): void {
  $("#btnCollect").onclick = () => openCollect();
  $("#btnMainCollect").onclick = () => openCollect(); // 메인화면에서도 도감 열람
  $("#collectX").onclick = () => $("#collect").classList.add("hidden");
  $("#illustView").onclick = () => $("#illustView").classList.add("hidden");

  delegate($("#collectCats"), "[data-cat]", "click", (el) => {
    collectCat = el.dataset.cat as CollectCat;
    renderCollect();
  });
  delegate($("#collectTabs"), "[data-ctab]", "click", (el) => {
    collectTab = el.dataset.ctab as CharacterId;
    renderCollect();
  });

  // 도감 본문은 컨테이너 1회 위임 — 매 렌더 재바인딩 없음.
  const wrap = $("#illustWrap");
  delegate(wrap, "[data-line]", "click", (el) => playLine(collectTab, el.dataset.line!));
  delegate(wrap, "[data-buy]", "click", (el) => buyLine(collectTab, el.dataset.buy!, el));
  delegate(wrap, "[data-buyspecial]", "click", (el) => buySpecial(el.dataset.buyspecial!, el));
  delegate(wrap, "[data-ill]", "click", (el) => {
    const [id, e] = el.dataset.ill!.split(":") as [CharacterId, Emotion];
    $("#illustViewCap").textContent = `${CHARACTERS[id].name} — ${EMOTION_LABEL[e]}`;
    // 전신 아트 보유 시 모드 컨트롤 노출 (반신 기준으로 초기화)
    illustViewState = { id, e };
    setIllustMode("bust");
    $("#illustViewModes").classList.toggle("hidden", !CHARACTERS[id].body.length);
    $("#illustView").classList.remove("hidden");
  });
  delegate(wrap, "[data-cg]", "click", (el) => {
    const g = CGS.find((x) => x.id === el.dataset.cg);
    if (g) openImageView(cgFile(g), `${CHARACTERS[g.char].name} — ${g.title}`);
  });
  delegate(wrap, "[data-special]", "click", (el) => {
    const g = SPECIAL_ILLUSTS.find((x) => x.id === el.dataset.special);
    if (g) openImageView(specialIllustFile(g), `${CHARACTERS[g.char].name} — ${g.title}`);
  });
  delegate(wrap, "[data-ending]", "click", (el) => {
    const [routeId, type] = el.dataset.ending!.split(":") as [string, EndingType];
    openEndingView(routeId, type);
  });

  // 표정 일러 팝업 — 반신/흉상/전신 모드 전환 (CG/스페셜/엔딩은 컨트롤 숨김)
  delegate($("#illustViewModes"), "[data-mode]", "click", (el, ev) => {
    ev.stopPropagation();
    setIllustMode(el.dataset.mode as IllustMode);
  });
}

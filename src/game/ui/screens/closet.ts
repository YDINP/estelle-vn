// 옷장 — 코스튬 구매/착용. state.ts의 COSMETICS_ENABLED로 홀딩 중(진입 버튼 없음)이라
// 현재는 호출되지 않지만, 재활성화를 위해 로직·모달은 보존한다.

import { $, ctx, activeTier } from "../context";
import { esc, delegate } from "../dom";
import { toast, openCoinShort } from "../modals";
import { persist } from "./home";
import { COSMETICS, getCosmetic, Slot } from "../../cosmetics";

let closetSlot: Slot = "outfit";

export function openCloset(): void {
  $("#closet").classList.remove("hidden");
  renderCloset();
}

function renderCloset(): void {
  const tier = activeTier();
  const items = COSMETICS.filter(
    (c) => c.slot === closetSlot && (!c.hidden || ctx.state.ownedCosmetics.includes(c.id))
  );
  $("#closetGrid").innerHTML = items.map((c) => {
    const owned = ctx.state.ownedCosmetics.includes(c.id);
    const equipped = ctx.state.equipped[c.slot] === c.id;
    const locked = tier < c.unlockTier;
    const swatch = c.slot === "outfit"
      ? `<span class="sw" style="background:${esc(c.visual)}"></span>`
      : `<span class="sw emoji">${esc(c.visual || "∅")}</span>`;
    let action: string;
    if (locked) action = `<span class="lock">티어 ${c.unlockTier} 해금</span>`;
    else if (equipped) action = `<span class="badge on">착용 중</span>`;
    else if (owned) action = `<button class="mini" data-equip="${esc(c.id)}">착용</button>`;
    else action = `<button class="mini buy" data-buy="${esc(c.id)}">${c.price}🪙</button>`;
    return `<div class="cell ${locked ? "locked" : ""}">
      ${swatch}<div class="cname">${esc(c.name)}</div>${action}</div>`;
  }).join("");
}

function buy(id: string): void {
  const c = getCosmetic(id);
  if (!c) return;
  if (ctx.state.coins < c.price) { openCoinShort(() => buy(id)); return; }
  ctx.state.coins -= c.price;
  ctx.state.ownedCosmetics.push(id);
  equip(id);
  toast(`${c.name} 구매 완료!`);
}

function equip(id: string): void {
  const c = getCosmetic(id);
  if (!c) return;
  ctx.state.equipped[c.slot] = id;
  persist();
  renderCloset();
}

export function wireCloset(): void {
  $("#closetX").onclick = () => $("#closet").classList.add("hidden");
  delegate($("#closetGrid"), "[data-buy]", "click", (el) => buy(el.dataset.buy!));
  delegate($("#closetGrid"), "[data-equip]", "click", (el) => equip(el.dataset.equip!));
  // 옷장 탭 (수집 탭과 셀렉터 충돌 방지 위해 #closet 스코프 한정)
  delegate($("#closet"), ".tab[data-slot]", "click", (el) => {
    closetSlot = el.dataset.slot as Slot;
    ctx.root.querySelectorAll("#closet .tab").forEach((x) => x.classList.remove("active"));
    el.classList.add("active");
    renderCloset();
  });
}

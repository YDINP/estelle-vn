// 대사 타이핑 연출 + 자동 페이지 분할.
// 글상자는 3~4줄뿐인데 내레이션은 240자를 넘는다. 들어갈 만큼만 끊어 여러 장으로 넘긴다(VN 표준).

import { $ } from "../context";
import { vn } from "./session";
import { TYPE_DELAY } from "../constants";

export function stopVnType(): void {
  if (vn.typeIv) { clearTimeout(vn.typeIv); vn.typeIv = undefined; }
  vn.typing = false;
}

export function finishVnType(): void {
  stopVnType();
  $("#vnText").textContent = vn.full;
  $("#vnHint").classList.remove("hidden");
}

/** 문자별 타이핑 지연(ms) — 문장부호에서 호흡을 준다. */
function typeDelay(cur: string, next: string): number {
  // 문장 끝(.!?…)이 연속이면 마지막 부호에서만 길게 쉰다.
  if (/[.!?…]/.test(cur) && !/[.!?…]/.test(next)) return TYPE_DELAY.sentence;
  if (/[,、·:;]/.test(cur)) return TYPE_DELAY.comma;
  if (cur === "—" || cur === "~") return TYPE_DELAY.trail;
  if (/[」』"')\]]/.test(cur)) return TYPE_DELAY.closing;
  if (cur === " ") return TYPE_DELAY.space;
  return TYPE_DELAY.base;
}

// ── 페이지 분할 계측용 probe ──
// 대사마다 만들어 body에 append/remove 하면 매 줄 레이아웃 스래싱이 난다.
// 화면 밖에 고정된 hidden 엘리먼트 하나를 만들어 계속 재사용한다.
let probe: HTMLDivElement | null = null;
function getProbe(): HTMLDivElement {
  if (probe?.isConnected) return probe;
  probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.left = "-9999px";
  probe.style.top = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  return probe;
}

/** 글상자 높이에 맞춰 text를 페이지들로 분할. 어절 단위로 채우고, 넘치면 새 페이지. */
export function paginate(text: string): string[] {
  const t = $("#vnText");
  const max = t.clientHeight;
  if (!max) return [text];
  const p = getProbe();
  const cs = getComputedStyle(t);
  // 글상자 폭·타이포는 회전/폰트로드로 바뀔 수 있어 계측 직전에만 동기화한다.
  p.style.width = `${t.clientWidth}px`;
  p.style.font = cs.font;
  p.style.lineHeight = cs.lineHeight;
  p.style.whiteSpace = cs.whiteSpace;
  p.style.wordBreak = cs.wordBreak;
  p.style.overflowWrap = cs.overflowWrap;

  const pages: string[] = [];
  const words = text.split(" ");
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    p.textContent = next;
    if (p.scrollHeight > max && cur) { pages.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) pages.push(cur);
  p.textContent = "";
  return pages.length ? pages : [text];
}

/** 다음 페이지가 남아 있으면 이어서 타이핑하고 true. 없으면 false(=스텝 진행). */
export function typeNextPage(): boolean {
  if (vn.pageIdx >= vn.pages.length - 1) return false;
  vn.pageIdx++;
  typePage(vn.pages[vn.pageIdx]);
  return true;
}

export function typePage(text: string): void {
  vn.full = text;
  const t = $("#vnText");
  t.textContent = "";
  $("#vnHint").classList.add("hidden");
  stopVnType();
  vn.typing = true;
  let idx = 0;
  const step = () => {
    idx++;
    t.textContent = vn.full.slice(0, idx);
    if (idx >= vn.full.length) { finishVnType(); return; }
    vn.typeIv = window.setTimeout(step, typeDelay(vn.full[idx - 1], vn.full[idx] ?? ""));
  };
  vn.typeIv = window.setTimeout(step, TYPE_DELAY.base);
}

export function startVnType(text: string): void {
  vn.pages = paginate(text);
  vn.pageIdx = 0;
  typePage(vn.pages[0]);
}

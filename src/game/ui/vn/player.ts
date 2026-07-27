// VN 재생 엔진 — 스텝 루프(대사/선택/CG) + 게이트 분기 이어붙이기.
// 에피소드·일일 씬·프롤로그가 모두 이 플레이어를 공유한다.

import { $, ctx, activeCharId, save } from "../context";
import { esc } from "../dom";
import { toast } from "../modals";
import { setEmotion, render, gainAffection } from "../screens/home";
import { AFFECTION_ENABLED, CHOICE_COIN_PER_AFF, addResolve } from "../../state";
import { sfxTap, sfxChoiceOpen, sfxSelect } from "../../audio";
import { Step, Line, Choice } from "../../../data/chapters";
import { CHARACTERS } from "../../../data/characters";
import { vn, resetSession, pushLog } from "./session";
import { setVnPortrait, showCg, hideCg } from "./portrait";
import { stopVnType, startVnType, finishVnType, typeNextPage } from "./typewriter";

/**
 * 스텝 배열을 재생. 완료 시 onEnd 콜백 호출.
 * @param nextSection steps 소진 시 이어붙일 구간(엔딩 게이트). null이면 종료.
 */
export function playSteps(
  steps: Step[],
  onEnd: () => void,
  grantRewards = true,
  nextSection: (() => Step[] | null) | null = null
): void {
  resetSession(steps, grantRewards);
  vn.nextSection = nextSection;
  vn.onEnd = onEnd;
  $("#vnBacklog").classList.add("hidden");
  setVnPortrait(activeCharId(), "soft"); // 기본 포트레이트 (수집 기록 포함)
  $("#vn").classList.remove("hidden");
  showNext();
}

export function showNext(): void {
  if (!vn.active || vn.choosing) return;
  if (vn.queue.length) { displayLine(vn.queue.shift()!); return; }
  if (vn.index >= vn.steps.length) {
    // 게이트 분기: 같은 세션을 유지한 채 구간만 갈아 끼운다(백로그·CG 연속성 보존).
    const next = vn.nextSection;
    vn.nextSection = null; // 1회성 — 재진입 루프 방지
    const more = next?.();
    if (more && more.length) {
      vn.steps = more;
      vn.index = 0;
      showNext();
      return;
    }
    endVn();
    return;
  }
  const step = vn.steps[vn.index++];
  if (step.kind === "line") displayLine(step.line);
  else if (step.kind === "cg") { if (!showCg(step.id, step.hold)) showNext(); }
  else if (step.kind === "cgEnd") { hideCg(); showNext(); }
  else renderChoice(step.choice);
}

function displayLine(line: Line): void {
  if (!vn.cgHold) $("#vnCg").classList.add("hidden"); // CG 유지 연출 중엔 내리지 않음
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
    // 포트레이트 교체: 표정 지정 시, 또는 화자가 바뀐 경우(엑스트라 실루엣 포함).
    // 같은 화자 + 표정 미지정이면 이전 표정 유지. (CG 유지 중엔 상태만 최신화)
    if (c.hasPortrait && (line.emotion || spk !== vn.portraitSpk)) setVnPortrait(spk, line.emotion);
    pushLog(c.name, line.text, false, c.color);
  }
  $("#vnChoices").classList.add("hidden");
  startVnType(line.text); // 타이핑 연출
}

// 선택지 — 대사패널이 아닌 화면 중앙 검은 반투명 오버레이에 표시
// (CG 유지 중이면 CG 위에 그대로 뜸 — 오버레이 z5 > CG z3)
let currentChoice: Choice | null = null;

function renderChoice(choice: Choice): void {
  if (!vn.cgHold) $("#vnCg").classList.add("hidden");
  stopVnType();
  sfxChoiceOpen();
  vn.choosing = true;
  currentChoice = choice;
  $("#vnHint").classList.add("hidden");
  const box = $("#vnChoices");
  box.innerHTML =
    (choice.prompt ? `<div class="vn-choice-prompt">${esc(choice.prompt)}</div>` : "") +
    choice.options.map((o, i) => `<button class="btn" data-opt="${i}">${esc(o.label)}</button>`).join("");
  box.classList.remove("hidden");
}

/** 선택 확정 — 보상 지급 + 결의 누적 후 결과 라인을 큐에 넣는다. */
function chooseOption(idx: number): void {
  const choice = currentChoice;
  if (!choice || !vn.choosing) return;
  const o = choice.options[idx];
  if (!o) return;
  if (vn.grantRewards) {
    // 호감도 홀딩 중에는 선택지 보상을 코인으로 환산 지급(도감 해금 재화로 순환).
    if (o.affection) {
      if (AFFECTION_ENABLED) gainAffection(o.affection);
      else {
        const coins = o.affection * CHOICE_COIN_PER_AFF;
        ctx.state.coins += coins;
        save();
        toast(`+${coins}🪙`);
      }
    }
    // 결의 누적 — 판정은 절대값이 아니라 resolve/resolveMax 비율(ENGINE-CONTRACT §1).
    // 다시보기에서는 누적하지 않는다(호감도 규칙과 동일).
    const max = Math.max(0, ...choice.options.map((x) => x.resolve ?? 0));
    if (max > 0 || o.resolve) {
      addResolve(ctx.state, ctx.state.currentRoute || "lilia", o.resolve ?? 0, max);
      save();
    }
  }
  sfxSelect();
  pushLog("", `▷ ${o.label}`, true); // 선택도 기록에 남김
  vn.queue = o.result.slice();
  vn.choosing = false;
  currentChoice = null;
  showNext();
}

// ── 대화 기록(백로그) ──
export function openBacklog(): void {
  $("#vnBacklogList").innerHTML = vn.log.length
    ? vn.log.map((l) => `<div class="bl-item ${l.narr ? "narr" : ""}">
        ${l.name ? `<div class="bl-name"${l.color ? ` style="color:${esc(l.color)}"` : ""}>${esc(l.name)}</div>` : ""}
        <div class="bl-text"${l.color ? ` style="color:${esc(l.color)}"` : ""}>${esc(l.text)}</div></div>`).join("")
    : `<div class="bl-item narr"><div class="bl-text">아직 기록이 없어요.</div></div>`;
  $("#vnBacklog").classList.remove("hidden");
  const list = $("#vnBacklogList");
  list.scrollTop = list.scrollHeight; // 최신 대사가 보이게
}

export function endVn(): void {
  stopVnType();
  vn.active = false;
  vn.cgHold = false;
  const cb = vn.onEnd;
  vn.onEnd = null;
  $("#vnCg").classList.add("hidden");
  $("#vnBacklog").classList.add("hidden");
  $("#vn").classList.add("hidden");
  setEmotion("soft");
  render();
  if (cb) cb();
}

/** VN 나가기(✕) — 완료 처리 없이 즉시 중단 (최초 플레이 중이탈 시 클리어/보상 없음) */
export function exitVn(): void {
  stopVnType();
  vn.active = false;
  vn.onEnd = null;
  vn.nextSection = null;
  vn.choosing = false;
  vn.cgHold = false;
  currentChoice = null;
  $("#vnCg").classList.add("hidden");
  $("#vnChoices").classList.add("hidden");
  $("#vnBacklog").classList.add("hidden");
  $("#vn").classList.add("hidden");
  setEmotion("soft");
  render();
}

/** VN 화면 이벤트 배선 — 부팅 시 1회. 선택지는 컨테이너 위임(매 선택마다 재바인딩 없음). */
export function wireVn(): void {
  $("#vn").addEventListener("click", () => {
    if (vn.choosing) return;
    if (vn.typing) { finishVnType(); return; }   // 타이핑 중 터치 → 즉시 완성
    if (typeNextPage()) { sfxTap(); return; }    // 긴 대사의 다음 페이지가 남았으면 이어서
    sfxTap();
    showNext();
  });
  $("#vnChoices").addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement)?.closest("[data-opt]") as HTMLElement | null;
    if (!btn) return;
    e.stopPropagation(); // VN 진행 탭과 분리
    chooseOption(Number(btn.dataset.opt));
  });
  $("#vnExit").addEventListener("click", (e) => {
    e.stopPropagation();
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
}

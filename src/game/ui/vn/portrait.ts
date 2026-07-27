// VN 초상 교체 / 이벤트 CG 표시 / 일러 수집 기록.

import { $, ctx, save } from "../context";
import { toast } from "../modals";
import { sfxCg } from "../../audio";
import {
  CHARACTERS, CharacterId, EMOTION_LABEL, vnFile, resolveEmotion,
  isPlaceholderArt, vnZoomOf,
} from "../../../data/characters";
import { Emotion } from "../../../data/chapters";
import { cgFile, getCg } from "../../../data/cgs";
import { vn, pushLog } from "./session";
import { stopVnType } from "./typewriter";

/** 일러 수집: 실제 표시된(폴백 해석된) 표정 기준. 새 일러면 저장+토스트. */
export function collectIllust(id: CharacterId, resolved: Emotion): void {
  if (CHARACTERS[id].extra) return; // 엑스트라 실루엣은 수집 대상 아님
  const list = (ctx.state.illust[id] ??= []);
  if (list.includes(resolved)) return;
  list.push(resolved);
  save();
  toast(`🖼 일러스트 수집: ${CHARACTERS[id].name} — ${EMOTION_LABEL[resolved]}`);
}

/** VN 포트레이트 교체(상반신 우선) + 수집 기록. 임시 대체 아트면 우상단 배지. */
export function setVnPortrait(id: CharacterId, e?: Emotion): void {
  const c = CHARACTERS[id];
  const resolved = resolveEmotion(c, e);
  vn.portraitSpk = id;
  const img = $("#vnPortrait") as HTMLImageElement;
  img.src = vnFile(id, resolved);
  // 반신 프레이밍 — 전신 아트를 크롭해 얼굴 크기를 캐릭터 간 통일
  img.style.setProperty("--bz", String(vnZoomOf(id)));
  img.classList.toggle("is-extra", !!c.extra); // 실루엣은 상반신 배율로 표시
  // 엑스트라 실루엣은 '임시' 배지 대상 아님
  $("#vnPh").classList.toggle("hidden", !!c.extra || !isPlaceholderArt(id, e));
  collectIllust(id, resolved);
}

/**
 * 이벤트 CG 연출 — 표시되는 그 순간 수집.
 * hold=true면 이후 대사가 CG 위에서 계속 진행된다(cgEnd/씬 종료까지).
 * @returns 표시 성공 여부. false면 호출부가 다음 스텝으로 넘어간다(미등록 CG 무시).
 */
export function showCg(id: string, hold = false): boolean {
  const cg = getCg(id);
  if (!cg) return false;
  vn.cgHold = hold;
  sfxCg();
  const cgImg = $("#vnCgImg") as HTMLImageElement;
  // 그레이스풀 폴백: 이미지 미존재(신규 루트 CG 제작 전) 시 깨진 아이콘 대신
  // 플레이스홀더 배경 + 제목만 표시.
  const wrap = $("#vnCg");
  wrap.classList.remove("cg-missing");
  wrap.setAttribute("data-cg-title", cg.title);
  cgImg.onerror = () => { wrap.classList.add("cg-missing"); cgImg.removeAttribute("src"); };
  cgImg.src = cgFile(cg);
  wrap.classList.remove("hidden");
  $("#vnName").textContent = "";
  $("#vnName").style.color = "";
  const t = $("#vnText");
  stopVnType();
  t.classList.add("narr");
  t.style.color = "";
  t.textContent = `— ${cg.title} —`;
  $("#vnHint").classList.remove("hidden");
  if (!ctx.state.cgSeen.includes(id)) {
    ctx.state.cgSeen.push(id);
    save();
    toast(`🖼 이벤트 일러 수집: ${cg.title}`);
  }
  pushLog("", `— ${cg.title} —`, true);
  return true;
}

export function hideCg(): void {
  vn.cgHold = false;
  $("#vnCg").classList.add("hidden");
}

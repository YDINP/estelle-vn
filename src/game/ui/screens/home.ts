// 홈 화면 — 캐릭터 초상 / 말풍선 / 액션 버튼 / HUD.

import { $, ctx, save, activeCharId, activeTier, activeAff, activeDaily } from "../context";
import { toast, openCoinShort } from "../modals";
import { playSteps } from "../vn/player";
import {
  tierOf, TIER_NAMES, MAX_AFFECTION, GIFT_GAIN, GIFT_COST,
  AFFECTION_ENABLED, COSMETICS_ENABLED, DAILY_COIN,
  addAffectionTo, todayKey,
} from "../../state";
import { getCosmetic } from "../../cosmetics";
import { greeting, giftLine, talkLine, SpokenLine } from "../../dialogue";
import { sfxTap, sfxCoin, isMuted, toggleMuted } from "../../audio";
import { CharacterId, vnFile, portraitZoomOf } from "../../../data/characters";
import { Emotion } from "../../../data/chapters";
import { DAILY_AFFECTION } from "../../../data/daily";

/**
 * 홈 화면 포트레이트 = 현재 루트의 주인공.
 * 폭맞춤+하단 그라데이션(.portrait) 위에 캐릭터별 --pz(반신 확대율)를 얹는다.
 */
export function setEmotion(name: Emotion): void {
  const id = activeCharId();
  const img = $("#charImg") as HTMLImageElement;
  img.src = vnFile(id, name);
  img.style.setProperty("--pz", String(portraitZoomOf(id)));
}

export function setBubble(text: string): void {
  const b = $("#bubble");
  b.textContent = text;
  b.classList.remove("pop");
  void b.offsetWidth; // reflow → 애니 재시작
  b.classList.add("pop");
}

/** 홈 발화 공통: 버블 표시 + '들은 대사' 도감 수집 기록 */
// TODO(사운드): 보이스 도입 시 여기서 playVoice(charId, line.id) 재생
export function speak(charId: CharacterId, line: SpokenLine): void {
  setBubble(line.text);
  const heard = (ctx.state.heardLines[charId] ??= []);
  if (!heard.includes(line.id)) {
    heard.push(line.id);
    save();
  }
}

/** 루트 진입 인사 — 밝은 표정 + 인사 대사. */
export function greetRoute(): void {
  setEmotion("happy"); // greet 표정은 16종 체계에서 제거됨
  speak(activeCharId(), greeting(activeCharId(), activeTier()));
}

/** 캐릭터 탭 → 대화 (횟수 제한 없음 — 호감도(인연 단계)별 대사) */
function onTalk(): void {
  if (!ctx.state.currentRoute) return; // 홈(루트) 화면에서만
  sfxTap();
  const emos: Emotion[] = ["soft", "happy", "shy"];
  setEmotion(emos[Math.floor(Math.random() * emos.length)]);
  speak(activeCharId(), talkLine(activeCharId(), activeTier()));
}

/** 호감도 증가 → 현재 루트 캐릭터에 적립 (에피소드는 순차 해금이라 별도 알림 없음) */
export function gainAffection(amount: number): void {
  addAffectionTo(ctx.state, activeCharId(), amount);
  save(); // 선택지 호감도도 즉시 영속 (저장 누락 방지)
}

// ── 선물 ──
function onGift(): void {
  if (ctx.state.coins < GIFT_COST) { openCoinShort(onGift); return; }
  ctx.state.coins -= GIFT_COST;
  gainAffection(GIFT_GAIN);
  sfxCoin();
  speak(activeCharId(), giftLine(activeCharId()));
  setEmotion("happy");
  persist();
}

// ── 오늘의 일상 (일일 미니 씬) ──
// 로컬 자정 기준 일수 (완료 게이트 todayKey와 동일 기준 — UTC 혼용 시 로테이션 어긋남)
function dayIndex(): number {
  return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
}

function onDaily(): void {
  if (ctx.state.dailyDoneDay === todayKey()) {
    toast("오늘의 일상은 이미 함께했어요. 내일 또 와요");
    return;
  }
  const pool = activeDaily(); // 루트별 일일 씬 (루트 대본 미로드면 기본 씬)
  if (!pool.length) return;
  const scene = pool[dayIndex() % pool.length];
  playSteps(scene.steps, () => {
    if (ctx.state.dailyDoneDay !== todayKey()) {
      if (AFFECTION_ENABLED) addAffectionTo(ctx.state, activeCharId(), DAILY_AFFECTION);
      else ctx.state.coins += DAILY_COIN; // 호감도 홀딩 → 코인 보상으로 대체
      ctx.state.dailyDoneDay = todayKey();
      save();
      render();
      toast(AFFECTION_ENABLED
        ? `🌸 오늘의 일상 완료 +${DAILY_AFFECTION} 호감도`
        : `🌸 오늘의 일상 완료 +${DAILY_COIN}🪙`);
    }
    // 일일 씬 뒤에는 전면 광고 금지(과노출 방지)
  });
}

// ── 렌더 ──
export function render(): void {
  $("#coinVal").textContent = String(ctx.state.coins);

  if (AFFECTION_ENABLED) {
    const aff = activeAff();
    $("#affVal").textContent = String(aff);
    $("#tierName").textContent = TIER_NAMES[tierOf(aff)];
    // 세로 슬라이더: 아래→위 충전
    ($("#affFill") as HTMLElement).style.height = `${(aff / MAX_AFFECTION) * 100}%`;
  }

  // 오늘의 일상 완료 여부 반영
  const dailyDone = ctx.state.dailyDoneDay === todayKey();
  ($("#btnDaily") as HTMLButtonElement).disabled = dailyDone;
  $("#dailyState").textContent = dailyDone ? "(내일 다시)" : "";

  // 포즈 일러는 setEmotion이 담당. 여기선 악세서리 오버레이만 갱신.
  if (COSMETICS_ENABLED) {
    const acc = getCosmetic(ctx.state.equipped.accessory);
    $("#charAcc").textContent = acc?.visual ?? "";
  }
}

export function persist(): void {
  save();
  render();
}

/** 음소거 토글 버튼 아이콘 동기화 (홈 HUD + 메인 화면) */
export function updateMuteUI(): void {
  const icon = isMuted() ? "🔇" : "🔊";
  $("#btnMute").textContent = icon;
  $("#btnMuteMain").textContent = icon;
}

export function wireHome(): void {
  $("#char").addEventListener("click", onTalk); // 캐릭터 탭 → 대화
  if (AFFECTION_ENABLED) $("#btnGift").onclick = onGift; // 홀딩 시 버튼 자체가 없음
  $("#btnDaily").onclick = onDaily;
  $("#btnMute").onclick = () => { toggleMuted(); updateMuteUI(); };
  $("#btnMuteMain").onclick = () => { toggleMuted(); updateMuteUI(); };
}

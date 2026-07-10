/// <reference types="vite/client" />
// 디버그/치트 패널 (cheatjs 바텀시트) — DEV 또는 ?cheat=1 에서만 동적 로드.
// 열기: PC = Shift+Click / 모바일 = 같은 위치 트리플탭.
// ⚠️ 배포(ait) 전: ?cheat 게이트 유지 여부 결정 필요(카카오 사례처럼 Live 도메인 차단 권장).

import { GameState, MAX_AFFECTION, ensureRoute, todayKey } from "./state";
import { CHARACTERS, CharacterId } from "../data/characters";
import { ROUTES } from "../data/routes";
import { CGS } from "../data/cgs";

export interface CheatCtx {
  state: GameState;
  refresh: () => void;              // 저장 + 홈 렌더
  toast: (m: string) => void;
  enterRoute: (id: string) => void;
  showMain: () => void;
  activeCharId: () => CharacterId;  // 현재 루트 주인공
  activeRouteId: () => string;      // "" = 메인
}

export function setupCheats(ctx: CheatCtx): void {
  // 테스트 배포 단계 — 항상 활성 (모바일 트리플탭으로 열기).
  // ⚠️ ait 정식 배포 전 게이트 복원: DEV || ?cheat=1 (?nocheat 로 임시 비활성 가능)
  const enabled = !new URLSearchParams(location.search).has("nocheat");
  if (!enabled) return;
  const s = document.createElement("script");
  s.src = import.meta.env.BASE_URL + "cheat.js"; // 배포 하위경로 대응
  s.onload = () => register(ctx);
  document.head.appendChild(s);
}

function register(ctx: CheatCtx): void {
  const st = () => ctx.state;
  const routeId = () => ctx.activeRouteId() || "lilia";

  cheat.addGroup("재화·호감", {
    "코인 +1000": [() => { st().coins += 1000; ctx.refresh(); }, "코인 1000 지급"],
    "호감도 +10": [() => {
      const c = ctx.activeCharId();
      st().affectionBy[c] = Math.min(MAX_AFFECTION, (st().affectionBy[c] ?? 0) + 10);
      ctx.refresh();
    }, "현재 루트 캐릭터 호감도 +10"],
    "호감도 MAX": [() => {
      st().affectionBy[ctx.activeCharId()] = MAX_AFFECTION;
      ctx.refresh();
    }, "현재 루트 캐릭터 호감도 최대"],
  });

  cheat.addGroup("에피소드", {
    "전 화 클리어": [() => {
      const r = ROUTES.find((x) => x.id === routeId());
      if (!r) return;
      const p = ensureRoute(st(), r.id);
      p.epCleared = r.episodes.map((e) => e.id);
      p.nextEpFreeAt = 0;
      for (const e of r.episodes)
        if (!st().cards.includes(e.id)) st().cards.push(e.id);
      ctx.refresh();
      ctx.toast(`📖 ${r.title} 전 화 클리어 처리`);
    }, "현재 루트 전 에피소드 클리어+카드 지급"],
    "타이머 해제": [() => {
      ensureRoute(st(), routeId()).nextEpFreeAt = 0;
      ctx.refresh();
    }, "기다리면 무료 타이머 즉시 해제"],
    "진행 초기화": [() => {
      st().routes[routeId()] = { epCleared: [], nextEpFreeAt: 0 };
      ctx.refresh();
      ctx.toast("현재 루트 진행 초기화");
    }, "현재 루트 에피소드 진행만 리셋"],
  });

  cheat.addGroup("일일·수집", {
    "일일씬 리셋": [() => { st().dailyDoneDay = ""; ctx.refresh(); }, "오늘의 일상 다시 가능"],
    "스트릭 7일": [() => {
      st().streak = 7; st().lastStreakDay = todayKey();
      if (!st().ownedCosmetics.includes("acc_star")) st().ownedCosmetics.push("acc_star");
      ctx.refresh();
      ctx.toast("⭐ 스트릭 7일 + 별의 머리핀");
    }, "연속 방문 7일 달성 처리"],
    "일러/CG 전부 해금": [() => {
      // 표정 일러: 캐릭터별 보유 표정 전부 수집 처리
      for (const id of Object.keys(CHARACTERS) as CharacterId[]) {
        const c = CHARACTERS[id];
        if (!c.hasPortrait) continue;
        st().illust[id] = [...(c.bust.length ? c.bust : c.body)];
      }
      // 스토리 연출 CG도 전부 수집 처리
      st().cgSeen = CGS.map((g) => g.id);
      // CG: 전 루트 에피소드 클리어 합집합으로 해금되므로 전부 클리어 처리
      for (const r of ROUTES) {
        const p = ensureRoute(st(), r.id);
        p.epCleared = r.episodes.map((e) => e.id);
        for (const e of r.episodes)
          if (!st().cards.includes(e.id)) st().cards.push(e.id);
      }
      ctx.refresh();
      ctx.toast("🖼 일러·CG·카드 전부 해금");
    }, "도감 전체 해금 (전 루트 클리어 처리 포함)"],
    "수집 초기화": [() => {
      st().illust = {}; st().cards = []; st().cgSeen = [];
      ctx.refresh();
    }, "일러/CG 수집만 리셋"],
  });

  cheat.addGroup("시스템", {
    "루트 전환": {
      type: "select",
      options: ["메인 화면", ...ROUTES.map((r) => r.title)],
      default: "메인 화면",
      onChange: (v: string) => {
        if (v === "메인 화면") { ctx.showMain(); return "close"; }
        const r = ROUTES.find((x) => x.title === v);
        if (!r) return;
        if (!r.available) { ctx.toast("🔒 준비 중인 루트예요"); return; }
        ctx.enterRoute(r.id);
        return "close";
      },
      desc: "메인/루트 화면 전환",
    },
    "대기시간(epwait)": {
      type: "select",
      options: ["기본(24h)", "60초", "5초"],
      default: "기본(24h)",
      onChange: (v: string) => {
        const url = new URL(location.href);
        if (v === "기본(24h)") url.searchParams.delete("epwait");
        else url.searchParams.set("epwait", v === "60초" ? "60" : "5");
        url.searchParams.set("cheat", "1"); // 리로드 후에도 치트 유지
        location.href = url.toString();
        return "close";
      },
      desc: "기다리면 무료 대기시간 변경(리로드)",
    },
    "세이브 초기화": [() => {
      localStorage.removeItem("estelle.save.v1");
      location.reload();
      return "close";
    }, "⚠️ 전체 세이브 삭제 후 재시작"],
  });

  cheat.statusline(() => [
    "estelle-vn v0.0.1",
    import.meta.env.DEV ? "dev" : "prod",
    `route=${ctx.activeRouteId() || "(메인)"}`,
  ]);
}

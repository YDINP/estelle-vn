// VN 재생 세션 상태 — 분해 전 ui.ts에 흩어져 있던 전역 let 13개를 객체 하나로 묶은 것.
// "지금 재생 중인 씬"에 대한 모든 가변 상태는 여기에만 있다.

import { Step, Line } from "../../../data/chapters";
import { CharacterId } from "../../../data/characters";

export interface BacklogEntry {
  name: string;
  text: string;
  narr: boolean;
  color?: string;
}

export interface VnSession {
  // ── 재생 커서 ──
  steps: Step[];
  index: number;
  /** 선택 결과 라인 큐 (steps보다 우선 소비) */
  queue: Line[];
  choosing: boolean;
  active: boolean;
  /** 다시보기(replay)에서는 선택지 보상·결의를 재지급하지 않는다 */
  grantRewards: boolean;
  /** CG 유지 연출 중 — 이후 대사가 CG 위에서 진행된다 */
  cgHold: boolean;
  onEnd: (() => void) | null;
  /**
   * steps를 다 소비했을 때 이어붙일 다음 구간을 돌려주는 훅(엔딩 게이트 분기용).
   * null을 돌려주면 그대로 종료된다. 같은 세션을 유지하므로 백로그·CG가 끊기지 않는다.
   */
  nextSection: (() => Step[] | null) | null;

  // ── 표시 상태 ──
  /** 현재 포트레이트의 주인 (화자 전환 감지용) */
  portraitSpk: CharacterId | null;
  log: BacklogEntry[];

  // ── 타이핑/페이지네이션 ──
  typing: boolean;
  full: string;
  typeIv?: number;
  pages: string[];
  pageIdx: number;
}

export const vn: VnSession = {
  steps: [], index: 0, queue: [], choosing: false, active: false,
  grantRewards: true, cgHold: false, onEnd: null, nextSection: null,
  portraitSpk: null, log: [],
  typing: false, full: "", typeIv: undefined, pages: [], pageIdx: 0,
};

/** 백로그 기록 — 표시된 대사/선택/CG 자막을 현재 세션에 누적. */
export function pushLog(name: string, text: string, narr = false, color?: string): void {
  vn.log.push({ name, text, narr, color });
}

/** 새 씬 재생 준비 — 커서·백로그·연출 상태를 초기화한다. */
export function resetSession(steps: Step[], grantRewards: boolean): void {
  vn.steps = steps;
  vn.index = 0;
  vn.queue = [];
  vn.choosing = false;
  vn.active = true;
  vn.grantRewards = grantRewards;
  vn.cgHold = false;
  vn.nextSection = null;
  vn.log = []; // 백로그는 세션 단위
  vn.pages = [];
  vn.pageIdx = 0;
}

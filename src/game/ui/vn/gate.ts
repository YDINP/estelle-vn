// 엔딩 게이트 판정 — 정본: ENGINE-CONTRACT.md §2
//
//   steps 전부 재생
//     → gate 없음: 평소대로 종료
//     → gate 있음: ratio = resolveMax > 0 ? resolve / resolveMax : 1
//          통과(ratio >= threshold)
//              trueSteps 있고 && 전 8루트 good 보유 → trueSteps 재생, "true" 기록
//              아니면                              → pass 재생, passEnding 있으면 기록
//          실패(ratio < threshold)                 → fail 재생, failEnding 기록

import { Step } from "../../../data/chapters";
import { Gate, EndingType } from "../../../data/season1";
import { GameState, ensureRoute, resolveRatio, hasAllGoodEndings } from "../../state";

export interface GateResult {
  branch: "true" | "pass" | "fail";
  steps: Step[];
  /** 이 분기로 확정되는 엔딩. null이면 엔딩 없이 이야기가 이어진다(15·25화 pass). */
  ending: EndingType | null;
  ratio: number;
}

export function evaluateGate(s: GameState, routeId: string, gate: Gate): GateResult {
  const ratio = resolveRatio(ensureRoute(s, routeId));
  if (ratio >= gate.threshold) {
    // 진엔딩은 30화(trueSteps 보유)에서, 전 루트 good을 모은 회차에만 열린다.
    if (gate.trueSteps?.length && hasAllGoodEndings(s)) {
      return { branch: "true", steps: gate.trueSteps, ending: "true", ratio };
    }
    return { branch: "pass", steps: gate.pass, ending: gate.passEnding ?? null, ratio };
  }
  return { branch: "fail", steps: gate.fail, ending: gate.failEnding ?? null, ratio };
}

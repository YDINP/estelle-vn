// 스토리 공통 타입 + 전체 프롤로그. 정본: STORY-BIBLE.md (2026-07-06 리디자인)
// ⚠️ 타입 export는 전 데이터 파일과의 계약 — 변경 금지.
// (구 v3 호감도 게이트 챕터(CHAPTERS)는 에피소드 체계로 대체되어 제거 — 게임 코드는 PROLOGUE.steps만 사용)

import { CharacterId, Emotion } from "./characters";

// 화자 = "narration" 또는 캐릭터 레지스트리 id (캐릭터 추가 시 characters.ts만 수정)
export type Speaker = "narration" | CharacterId;
export type { Emotion }; // season1/daily 등 기존 import 호환용 re-export

export interface Line {
  speaker: Speaker;
  text: string;
  emotion?: Emotion; // 화자 표정 (없으면 이전 표정 유지)
}

export interface ChoiceOption {
  label: string;
  affection?: number; // 선택 시 호감도 증가
  result: Line[];     // 선택 후 이어지는 대사 (수렴형)
}

export interface Choice {
  prompt?: string;
  options: ChoiceOption[];
}

export type Step =
  | { kind: "line"; line: Line }
  | { kind: "choice"; choice: Choice }
  // 이벤트 CG 연출 — 표시 순간 수집됨 (cgs.ts id).
  // hold=true면 이후 대사가 CG 위에서 진행되고, cgEnd(또는 씬 종료)에서 내려감.
  | { kind: "cg"; id: string; hold?: boolean }
  | { kind: "cgEnd" };

// ── 빌더 ──
const N = (text: string): Step => ({ kind: "line", line: { speaker: "narration", text } });
const E = (text: string, emotion?: Emotion): Step => ({ kind: "line", line: { speaker: "estelle", text, emotion } });
const K = (text: string): Step => ({ kind: "line", line: { speaker: "chancellor", text } });

/** 전체 스토리 프롤로그 — 메인 화면 '프롤로그 보기'용.
 *  왕관의 밤(시즌1 공통 사건)의 개관 + 회귀 도입. 특정 루트에 종속되지 않는 관점. */
export const PROLOGUE = {
  id: "prologue",
  title: "프롤로그 — 왕관의 밤",
  steps: [
    N("아르덴 제국력 317년, 봄. 병약한 황제를 대신해 재상이 옥새를 쥐었고, 제국의 봄은 그 손안에서 시들어 갔다."),
    K("경사스러운 밤, 무거운 소식을 전하게 되어 유감입니다. — 황실의 이름으로, 하이델 공작영애를 반역 혐의로 고발합니다."),
    N("대관 기념 무도회, '왕관의 밤'. 천 개의 샹들리에 불빛 아래에서 한 사람의 봄이 꺾였다."),
    N("세 번의 누명. 닫힌 저택. 그리고 겨울의 탑. — 당신은 그 모든 것을, 끝까지 지켜본 단 한 사람이었다."),
    E("……원망 안 해요. 당신마저 없었다면, 저는 정말 혼자였을 테니까.", "sad"),
    E("다시… 만날 수 있다면. 그때는, 웃으면서 인사해요.", "tearful"),
    N("탑의 마지막 면회에서, 그녀는 별을 닮은 낡은 펜던트를 당신 손에 쥐여주었다. 그리고 — 펜던트가 빛을 삼켰다."),
    N("눈을 떴을 때, 계절은 일 년 전 봄이었다. 아직 아무것도 시작되지 않은 봄. 모든 비극이 예고편에 불과한 봄."),
    N("왕관의 밤은 다시 온다. 그러나 그 밤으로 가는 길은 하나가 아니다."),
    N("표적이 된 공작영애의 문. 가시 돋친 배역을 강요당한 후작영애의 문. 검에 두 맹세를 진 자, 왕관을 쓴 자, 그늘의 서녀와 국경을 넘어온 빛 — 저마다의 문이, 같은 밤을 향해 열려 있다."),
    N("어느 문을 먼저 열어도 좋다. — 이번 봄의 이야기는, 당신이 고른 문에서 시작된다."),
  ] as Step[],
};

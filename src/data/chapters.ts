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
 *  왕관의 밤이 만든 여덟 개의 결말(1회차 배드/새드 엔딩 파노라마) + 회귀 도입.
 *  v3 대원칙: 주인공 = 모든 결말의 목격자이자 유일한 개입자. 회귀는 비밀, 로맨스 불성립. */
export const PROLOGUE = {
  id: "prologue",
  title: "프롤로그 — 여덟 개의 겨울",
  steps: [
    N("아르덴 제국력 317년, 봄. 병약한 황제를 대신해 재상이 옥새를 쥐었고, 제국의 봄은 그 손안에서 시들어 갔다."),
    K("경사스러운 밤, 무거운 소식을 전하게 되어 유감입니다. — 황실의 이름으로, 하이델 공작영애를 반역 혐의로 고발합니다."),
    N("대관 기념 무도회, '왕관의 밤'. 천 개의 샹들리에 아래에서 시작된 그 하나의 밤이 — 여덟 개의 삶을 저마다의 겨울로 끌고 갔다."),
    N("표적이 된 공작영애는 탑에 유폐되어 봄을 빼앗겼고, 배역을 강요당한 붉은 장미는 모든 죄를 뒤집어쓴 채 배웅 없는 마차로 국경을 넘었다."),
    N("부당한 명령을 집행한 부단장은 스스로 검을 꺾었고, 두 맹세의 기사단장은 반역자의 오명 속에 고립되었다. 황태자의 대관 축배엔 독이 들었고 — 그는 살아남아, 웃는 법을 잊은 꼭두각시가 되었다."),
    N("완벽하던 흰 백합은 단 한 번의 실수로 무너져 스스로를 가뒀고, 그늘의 서녀는 이름 한 번 불리지 못한 채 기록에서 지워졌으며, 진실을 증언한 성기사는 그 죄로 맹세를 잃고 국경을 떠돌았다."),
    N("— 당신은 그 여덟 개의 결말을, 곁에서 전부 지켜본 단 한 사람이었다."),
    E("……원망 안 해요. 당신마저 없었다면, 저는 정말 혼자였을 테니까.", "sad"),
    E("다시… 만날 수 있다면. 그때는, 웃으면서 인사해요.", "tearful"),
    N("탑의 마지막 면회에서, 그녀는 별을 닮은 낡은 펜던트를 당신 손에 쥐여주었다. 그리고 — 펜던트가 빛을 삼켰다."),
    N("눈을 떴을 때, 계절은 일 년 전 봄이었다. 아직 아무것도 시작되지 않은 봄. 모든 겨울이 예고편에 불과한 봄."),
    N("이 회귀를 아는 사람은 없다. 알게 해서도 안 된다. 당신에게 있는 것은 오직 — 결말들에 대한 기억과, 개입할 수 있는 시간뿐."),
    N("어느 문을 먼저 열어도 좋다. 문 너머의 겨울을 봄으로 바꾸는 것은, 당신의 개입이다."),
  ] as Step[],
};

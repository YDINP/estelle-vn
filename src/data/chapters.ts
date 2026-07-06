// 챕터 스토리 데이터 (v3: VN 대본 + 선택지) — 호감도 게이트로 해금.
// SCENARIO-Estelle.md 정본을 구조화. 성별 무관 2인칭 '당신', 유대/헌신 톤.

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

export interface Chapter {
  id: string;
  unlockAffection: number; // 이 호감도 이상에서 해금
  tier: number;            // 대응 인연 단계(0~3), 프롤로그 -1
  title: string;
  rewardCoins: number;     // 최초 완독 시 보너스 코인
  steps: Step[];
}

// ── 빌더 (대본 가독성용) ──
const N = (text: string): Step => ({ kind: "line", line: { speaker: "narration", text } });
const E = (text: string, emotion?: Emotion): Step => ({ kind: "line", line: { speaker: "estelle", text, emotion } });
const S = (text: string): Step => ({ kind: "line", line: { speaker: "fiance", text } });
const K = (text: string): Step => ({ kind: "line", line: { speaker: "chancellor", text } });
const CH = (prompt: string, options: ChoiceOption[]): Step => ({ kind: "choice", choice: { prompt, options } });
// 선택 결과 라인 빌더
const rn = (text: string): Line => ({ speaker: "narration", text });
const re = (text: string, emotion?: Emotion): Line => ({ speaker: "estelle", text, emotion });

export const CHAPTERS: Chapter[] = [
  {
    id: "prologue", unlockAffection: 0, tier: -1, rewardCoins: 0,
    title: "프롤로그 — 스러진 봄",
    steps: [
      N("차가운 봄이었다. 세 번의 누명이 그녀를 삼켰고, 아무도 그녀의 편이 아니었다. 당신을 제외하고는."),
      N("탑의 창으로 마지막 햇살이 들었다. 그녀는 여윈 손으로 당신의 소매를 붙들었다."),
      E("……원망 안 해요. 당신마저 없었다면, 정말 혼자였을 테니까.", "sad"),
      E("이상하죠. 이렇게 될 걸 알았던 사람처럼… 당신은 늘 저를 지키려 했어요.", "tearful"),
      N("그녀가 당신의 손에 무언가를 쥐여주었다. 별을 닮은 낡은 펜던트."),
      E("다시… 만날 수 있다면. 그때는, 웃으면서 인사해요.", "soft"),
      N("펜던트가 빛을 삼켰다. 눈을 떴을 때 — 창밖은 탑이 아니라, 1년 전 봄의 정원이었다."),
      N("아직 아무것도 시작되지 않았다. 당신은 이제, 다가올 모든 비극을 아는 유일한 사람이다."),
    ],
  },
  {
    id: "ch1_again", unlockAffection: 0, tier: 0, rewardCoins: 0,
    title: "1장 — 다시, 그날",
    steps: [
      N("약혼 발표가 있던 그 봄. 정원엔 아직 웃을 수 있는 그녀가 있었다."),
      E("……저를 보러 온 건가요? 그렇게 멀거니 서 있는 걸 보면.", "shy"),
      E("이상한 사람이네요. 처음 보는데 왜 이렇게… 낯설지가 않을까요.", "soft"),
      N("당신은 안다. 오늘로부터 정확히 사흘 뒤, 첫 번째 덫이 놓인다는 것을."),
      CH("그녀에게 어떻게 다가갈까", [
        { label: "\"당신을 지키러 왔습니다.\"", affection: 3,
          result: [re("…지킨다니. 농담도 진지하게 하는 분이네요.", "surprised")] },
        { label: "조용히 곁에 선다", affection: 3,
          result: [re("말이 없네요. …그런데 그 침묵이, 왠지 편해요.", "soft")] },
      ]),
      N("이번엔 다르게 하겠다고, 당신은 다짐한다. 이 봄을, 그리고 그녀를 반드시 지켜내겠다고."),
      E("이름도 모르는 사람. 그래도… 내일 또 와줄래요? 왠지, 당신은 올 것 같아서.", "greet"),
    ],
  },
  {
    id: "ch2_engagement", unlockAffection: 20, tier: 1, rewardCoins: 60,
    title: "2장 — 어긋난 약혼",
    steps: [
      E("요즘, 당신이 오는 시간이 기다려져요. …이런 말, 처음 해봐요.", "soft"),
      N("그때, 약혼자가 들어선다. 정략으로 맺어진 상대. 그러나 그의 눈은 그녀를 보지 않는다."),
      S("에스텔 양. 약혼은 가문의 결정이오. 사사로운 정은… 서로 접어둡시다."),
      E("…알아요. 마음 같은 건, 중요하지 않다는 거.", "sad"),
      N("당신은 안다. 오늘 밤, 저 서재에 밀서가 심어진다. 첫 번째 덫이."),
      CH("밀서를 어떻게 막을까", [
        { label: "밤새 서재를 지킨다", affection: 4,
          result: [rn("침입자를 직접 목격하고 차단했다."), re("당신, 어떻게 알고…?", "surprised")] },
        { label: "에스텔에게 미리 귀띔한다", affection: 4,
          result: [rn("그녀는 스스로 함정을 뒤집었다."), re("당신 말이라면… 믿을게요.", "serious")] },
      ]),
      N("덫은 놓이기도 전에 무너졌다. 첫 번째 미래가, 처음으로 어긋났다."),
      E("당신은 왜 그렇게까지… 제 일을 진심으로 걱정하죠? 약혼자도 아니면서.", "soft"),
      E("……아뇨. 대답 안 해도 돼요. 그냥, 곁에 있어 줘서 고마워요.", "shy"),
    ],
  },
  {
    id: "ch3_changing_future", unlockAffection: 50, tier: 2, rewardCoins: 120,
    title: "3장 — 바뀌는 미래",
    steps: [
      N("황실 무도회장. 원래대로라면 오늘, 그녀는 만인 앞에서 반역자로 지목당했어야 했다."),
      K("공작영애께서 적국과 내통했다는 증언이 있소. 증인을 부르시오."),
      E("…근거 없는 모함입니다. 저는 결백해요.", "serious"),
      N("당신은 안다. 저 증인이 사흘 전 어디서 매수됐는지, 그 대가가 무엇이었는지를."),
      CH("위증을 어떻게 깰까", [
        { label: "증인의 거짓 알리바이를 공개한다", affection: 4,
          result: [rn("좌중이 술렁인다. 카닐이 처음으로 당황한다.")] },
        { label: "약혼자를 움직여 증언을 뒤집게 한다", affection: 4,
          result: [rn("방관자였던 약혼자가 처음으로 그녀 편에 선다.")] },
      ]),
      E("당신이 아니었다면… 오늘 저는 끝이었어요. 어떻게 미리 알았죠?", "surprised"),
      E("설명 안 해도 돼요. 그냥… 당신을 믿을래요. 이런 확신, 처음이에요.", "soft"),
      E("정해진 대로만 살아온 저한테, 당신은 자꾸 '다른 길'을 보여줘요.", "happy"),
    ],
  },
  {
    id: "ch4_same_fate", unlockAffection: 80, tier: 3, rewardCoins: 200,
    title: "4장 — 같은 운명",
    steps: [
      N("그날의 비극이 다시 다가온다. 그러나 이번엔, 당신이 곁에 있다."),
      E("무섭지 않아요. 당신이 있으니까. …당신, 꼭 지난 생을 기억하는 사람 같아요.", "serious"),
      E("이유는 안 물을게요. 대신 약속해요. 이번엔… 끝까지 함께 있겠다고.", "soft"),
      N("당신은 그동안 쌓은 모든 것을 건다. 미래의 지식과, 그리고 그녀와의 인연을."),
      CH("마지막, 카닐을 어떻게 무너뜨릴까", [
        { label: "진실을 만천하에 밝힌다 [엔딩: 바뀐 운명]",
          result: [
            rn("정해졌던 파멸이 무너졌다. 반역의 오명은 카닐에게로 돌아갔고, 봄은 다시 눈부셨다."),
            re("이제 정해진 미래 같은 건 없어요. 당신이 다 바꿔놨으니까.", "happy"),
            re("그러니까 이번엔 제가 물을게요. …앞으로도, 제 곁에 있어 줄래요?", "soft"),
          ] },
        { label: "에스텔이 직접 맞서게 곁에서 돕는다 [엔딩: 별의 약속]",
          result: [
            rn("그녀는 더 이상 굴레에 갇힌 영애가 아니었다. 스스로의 이름으로 서 있었다."),
            re("당신이 준 이 펜던트… 별의 눈물이라고 했죠. 이번엔 제가 당신께 걸어줄게요.", "soft"),
            re("다시 만나면 웃으면서 인사하자고 했잖아요. 봐요, 저 지금 웃고 있어요.", "happy"),
          ] },
      ]),
    ],
  },
];

/** 전체 스토리 프롤로그(회귀 전 비극 → 회귀) — 메인 화면 '프롤로그 보기'용 */
export const PROLOGUE = CHAPTERS[0];

/** 현재 호감도로 열람 가능한 챕터들 */
export function unlockedChapters(affection: number): Chapter[] {
  return CHAPTERS.filter((c) => affection >= c.unlockAffection);
}

/** 방금 해금된(직전 값에선 잠겨있던) 챕터 — 신규 해금 알림용 */
export function newlyUnlocked(prev: number, next: number): Chapter | undefined {
  return CHAPTERS.find((c) => prev < c.unlockAffection && next >= c.unlockAffection);
}

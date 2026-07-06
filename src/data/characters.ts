// 캐릭터 레지스트리 (SSOT) — 캐릭터 추가 = 여기 1항목 + public/char/{id}/ 폴더.
// 아트 2세트: 전신(body) = {emotion}.png / 상반신(bust) = bust_{emotion}.png
// VN 대사창은 bust 우선(감정 전달↑), 홈/일부 연출은 body.

export type Emotion =
  | "greet" | "soft" | "happy" | "shy"
  | "serious" | "surprised" | "sad" | "tearful"
  | "smirk" | "laugh" | "angry" | "scheme"; // 악역/감정 확장

export const EMOTION_LABEL: Record<Emotion, string> = {
  greet: "인사", soft: "미소", happy: "활짝", shy: "수줍음",
  serious: "결의", surprised: "놀람", sad: "슬픔", tearful: "눈물",
  smirk: "조소", laugh: "폭소", angry: "분노", scheme: "획책",
};

export interface Character {
  id: string;
  name: string;              // 이름판 표시명
  hasPortrait: boolean;      // false = 이름판+대사만 (일러 없는 조연)
  color: string;             // 화자 텍스트/이름판 색 (다크브라운 배경에서 가독한 파스텔)
  body: Emotion[];           // 전신 일러 보유 표정 ({emotion}.png)
  bust: Emotion[];           // 상반신 일러 보유 표정 (bust_{emotion}.png)
  fallback: Partial<Record<Emotion, Emotion>>; // 미보유 표정 → 보유 표정 폴백
}

export type CharacterId =
  | "estelle" | "rozelin" | "sedric" | "chancellor"
  | "lucian" | "valen" | "isolde" | "adele";

export const CHARACTERS: Record<CharacterId, Character> = {
  estelle: {
    id: "estelle", name: "에스텔", hasPortrait: true, color: "#ffdf9e", // 금발 — 웜골드
    body: ["soft", "happy", "greet", "surprised", "sad", "shy",
      "tearful", "serious", "angry", "laugh"], // 10종 (001/sheet2 확장)
    bust: ["greet", "soft", "happy", "shy", "serious", "surprised", "sad", "tearful",
      "smirk", "laugh", "angry", "scheme"], // 12종 완비 (ill_sheet_0 확장)
    fallback: { smirk: "soft", scheme: "soft" },
  },
  // 악덕영애 (적발·와인 드레스). ⚠️ '로젤린'은 임시명 — 확정 시 name만 교체.
  rozelin: {
    id: "rozelin", name: "로젤린", hasPortrait: true, color: "#ff96a6", // 적발 — 로즈레드
    body: ["serious", "happy", "surprised", "soft"],
    bust: ["greet", "soft", "happy", "shy", "serious", "surprised", "sad", "tearful",
      "smirk", "laugh", "angry", "scheme"],
    fallback: { greet: "surprised", shy: "soft", sad: "soft", tearful: "soft",
      smirk: "happy", laugh: "happy", angry: "serious", scheme: "serious" },
  },
  // 약혼자 세드릭 (흑발·모피 망토 제복) — 비주얼 확정, 두 루트 조연
  sedric: {
    id: "sedric", name: "세드릭", hasPortrait: true, color: "#9db8e8", // 흑발 제복 — 스틸블루
    body: ["soft", "serious", "greet", "smirk", "scheme", "angry",
      "happy", "sad", "shy", "surprised", "tearful", "laugh"], // 12종 완비 (003 신규 8시트)
    bust: ["serious", "soft", "angry", "sad", "greet", "surprised", "smirk", "shy"],
    fallback: { happy: "soft", tearful: "sad", laugh: "smirk",
      scheme: "smirk" }, // bust 미보유 4종 폴백 (body는 완비)
  },
  chancellor: { id: "chancellor", name: "재상 카닐", hasPortrait: false, color: "#b8b09b",
    body: [], bust: [], fallback: {} },
  // ⚠️ 신규 남캐 2종 — 임시명. 플레이는 추후(잠금 루트), 현재는 카메오 등장만.
  //    채택 확정 시 상반신 시트 추가 예정 (bust는 그때 채움).
  lucian: {
    id: "lucian", name: "루시안", hasPortrait: true, color: "#cfe0f5", // 백금발 — 플래티넘
    body: ["soft", "serious", "happy", "greet", "smirk", "scheme", "sad", "angry"],
    bust: ["greet", "soft", "happy", "laugh", "shy", "serious", "surprised",
      "sad", "smirk", "angry", "scheme"], // 11종 (005 시트 2장, tearful만 미보유)
    fallback: { tearful: "sad" },
  },
  valen: {
    id: "valen", name: "발렌", hasPortrait: true, color: "#e8a06d", // 제국 제1황태자 (적발·와인 망토) — 임시명, 앰버
    // 007 시트 기반 (흉상 포함). 구 '다크 귀족' 콘셉트에서 제1황태자로 재설정.
    body: ["soft", "greet", "smirk", "scheme", "laugh", "happy", "serious", "angry"],
    bust: ["soft", "greet", "smirk", "scheme", "happy", "shy", "sad", "serious"],
    fallback: { surprised: "serious", angry: "serious", laugh: "happy",
      tearful: "sad", sad: "serious", shy: "soft" },
  },
  // ⚠️ 신규 여캐 2종 — 임시명. 아트 미보유(시트 도착 시 body/bust 채우고 hasPortrait:true).
  isolde: {
    id: "isolde", name: "이졸데", hasPortrait: false, color: "#bfe3ea", // 백발 — 아이스 시안
    body: [], bust: [], fallback: {}, // 북부 대공가의 공녀. 도도하고 차가운 '얼음 백합'
  },
  adele: {
    id: "adele", name: "아델", hasPortrait: false, color: "#f2cfa6", // 갈색머리 — 웜 베이지
    body: [], bust: [], fallback: {}, // 백작가의 서녀. 그늘에서 숨죽여 피는 들꽃
  },
  // ── 캐릭터 추가 템플릿 ──
  // 1) CharacterId 유니온에 id 추가  2) 아래 형태로 항목 추가
  // 3) public/char/{id}/에 {emotion}.png(전신), bust_{emotion}.png(상반신) 배치
  //    (그린스크린 시트: 전신=split_sheet.py, 상반신=cut_bust.py)
  // {id}: { id:"{id}", name:"표시명", hasPortrait:true,
  //   body:[...], bust:[...], fallback:{ 미보유:보유 } },
};

/** 요청 표정 → 지정 세트에서 실제 보유 표정으로 해석 */
function resolveIn(set: Emotion[], c: Character, e: Emotion = "soft"): Emotion {
  if (set.includes(e)) return e;
  const fb = c.fallback[e];
  if (fb && set.includes(fb)) return fb;
  return set[0] ?? "soft";
}

export function resolveEmotion(c: Character, e: Emotion = "soft"): Emotion {
  // VN/도감 기준 세트(bust 우선)에서 해석
  return resolveIn(c.bust.length ? c.bust : c.body, c, e);
}

// 배포 하위경로(GitHub Pages 등) 대응 — dev에선 "/"
const BASE = import.meta.env.BASE_URL;

/** 전신 일러 (홈 화면 등) */
export function portraitFile(id: CharacterId, e?: Emotion): string {
  const c = CHARACTERS[id];
  return `${BASE}char/${c.id}/${resolveIn(c.body, c, e)}.png`;
}

/** VN 대사창/도감용 일러 — 상반신 우선, 없으면 전신 */
export function vnFile(id: CharacterId, e?: Emotion): string {
  const c = CHARACTERS[id];
  if (c.bust.length) return `${BASE}char/${c.id}/bust_${resolveIn(c.bust, c, e)}.png`;
  return portraitFile(id, e);
}

/** 표시 아트가 임시 대체(placeholder)인지 —
 *  상반신 부재로 전신을 대신 표시 or 요청 표정 미보유로 폴백 표정 표시 */
export function isPlaceholderArt(id: CharacterId, e?: Emotion): boolean {
  const c = CHARACTERS[id];
  if (!c.bust.length) return true;
  return !!e && !c.bust.includes(e);
}

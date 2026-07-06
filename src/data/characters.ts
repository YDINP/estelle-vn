// 캐릭터 레지스트리 (SSOT) — 캐릭터 추가 = 여기 1항목 + public/char/{id}/ 폴더.
// 아트 2세트: 전신(body) = {emotion}.png / 상반신(bust) = bust_{emotion}.png
// VN 대사창은 bust 우선(감정 전달↑), 홈/일부 연출은 body.

// 표정 체계 16종 (4×4 시트 그리드와 1:1). '인사(greet)'는 감정이 아닌 동작 포즈라
// 구 12표정 체계의 잔재였음 — 제거(2026-07-06).
export type Emotion =
  | "neutral" | "soft" | "happy" | "laugh"
  | "shy" | "serious" | "determined" | "surprised"
  | "sad" | "distressed" | "tearful" | "angry"
  | "smirk" | "scheme" | "embarrassed" | "cold";

export const EMOTION_LABEL: Record<Emotion, string> = {
  neutral: "무표정", soft: "온화한 미소", happy: "기쁨", laugh: "웃음",
  shy: "수줍음", serious: "진지함", determined: "결의", surprised: "놀람",
  sad: "슬픔", distressed: "괴로움", tearful: "눈물", angry: "분노",
  smirk: "조소", scheme: "계략", embarrassed: "당황", cold: "냉담",
};

const GRID_EMOTIONS: Emotion[] = [
  "neutral", "soft", "happy", "laugh",
  "shy", "serious", "determined", "surprised",
  "sad", "distressed", "tearful", "angry",
  "smirk", "scheme", "embarrassed", "cold",
];

export interface Character {
  id: string;
  name: string;              // 이름판 표시명
  hasPortrait: boolean;      // false = 이름판+대사만 (일러 없는 조연)
  color: string;             // 화자 텍스트/이름판 색 (다크브라운 배경에서 가독한 파스텔)
  extra?: boolean;           // true = 엑스트라(실루엣 초상) — 도감/일러 수집 제외
  body: Emotion[];           // 전신 일러 보유 표정 ({emotion}.png)
  bust: Emotion[];           // 상반신 일러 보유 표정 (bust_{emotion}.png)
  fallback: Partial<Record<Emotion, Emotion>>; // 미보유 표정 → 보유 표정 폴백
}

export type CharacterId =
  | "estelle" | "rozelin" | "fiance" | "chancellor"
  | "eden" | "valen" | "isolde" | "adele" | "rayner" | "michael";

export const CHARACTERS: Record<CharacterId, Character> = {
  estelle: {
    id: "estelle", name: "에스텔", hasPortrait: true, color: "#ffdf9e", // 금발 — 웜골드
    body: GRID_EMOTIONS,
    bust: GRID_EMOTIONS,
    fallback: {},
  },
  // 악덕영애 (적발·와인 드레스). ⚠️ '로젤린'은 임시명 — 확정 시 name만 교체.
  rozelin: {
    id: "rozelin", name: "로젤린", hasPortrait: true, color: "#ff96a6", // 적발 — 로즈레드
    body: GRID_EMOTIONS,
    bust: GRID_EMOTIONS,
    fallback: {},
  },
  // 에스텔의 정략 약혼자 — 엑스트라(실루엣 초상, Desktop/1/extra 시트). 구 '세드릭' 삭제 후 서사 역할만 유지.
  fiance: { id: "fiance", name: "약혼자", hasPortrait: true, color: "#9db8e8",
    extra: true, body: [], bust: ["soft"], fallback: {} },
  chancellor: { id: "chancellor", name: "재상 카닐", hasPortrait: true, color: "#b8b09b",
    extra: true, body: [], bust: ["soft"], fallback: {} }, // 엑스트라(실루엣 초상)
  // ⚠️ 신규 남캐 2종 — 임시명. 플레이는 추후(잠금 루트), 현재는 카메오 등장만.
  //    채택 확정 시 상반신 시트 추가 예정 (bust는 그때 채움).
  // 구 '루시안(근위기사단장)' → '이든(근위대 부단장)'으로 재설정. 구 일러 전량 폐기,
  // 신규 시트 도착 시 body/bust 채우고 hasPortrait:true.
  eden: {
    id: "eden", name: "이든", hasPortrait: true, color: "#cfe0f5", // 백금발 — 플래티넘
    body: GRID_EMOTIONS, bust: GRID_EMOTIONS, fallback: {},
  },
  valen: {
    id: "valen", name: "발렌", hasPortrait: true, color: "#e8a06d", // 제국 제1황태자 (적발·와인 망토) — 임시명, 앰버
    body: GRID_EMOTIONS,
    bust: GRID_EMOTIONS,
    fallback: {},
  },
  // ⚠️ 신규 여캐 2종 — 임시명. 아트 미보유(시트 도착 시 body/bust 채우고 hasPortrait:true).
  isolde: {
    id: "isolde", name: "이졸데", hasPortrait: true, color: "#bfe3ea", // 백발 — 아이스 시안
    body: GRID_EMOTIONS, bust: GRID_EMOTIONS, fallback: {}, // 북부 대공가의 공녀. 도도하고 차가운 '얼음 백합'
  },
  adele: {
    id: "adele", name: "아델", hasPortrait: true, color: "#f2cfa6", // 갈색머리 — 웜 베이지
    body: GRID_EMOTIONS, bust: GRID_EMOTIONS, fallback: {}, // 백작가의 서녀. 그늘에서 숨죽여 피는 들꽃
  },
  // ⚠️ 신규 남캐 2종 — 임시명. 아트 미보유(시트 도착 시 채움).
  rayner: {
    id: "rayner", name: "레이너", hasPortrait: true, color: "#b9c9dd", // 북부대공 — 스틸 블루그레이
    body: GRID_EMOTIONS, bust: GRID_EMOTIONS, fallback: {}, // 북부의 서리 대공. 검보다 차가운 침묵
  },
  michael: {
    id: "michael", name: "미카엘", hasPortrait: true, color: "#ece5cf", // 성기사 — 아이보리 실버
    body: GRID_EMOTIONS, bust: GRID_EMOTIONS, fallback: {}, // 신전의 성기사. 빛의 맹세를 검에 새긴 자
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

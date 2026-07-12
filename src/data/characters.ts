// 캐릭터 레지스트리 (SSOT) — 캐릭터 추가 = 여기 1항목 + public/char/{id}/ 폴더.
// 아트 1세트: {emotion}.png (전신/반신 겸용). 반신(머리~허리)은 별도 에셋 없이 CSS 크롭(bustZoom)으로 표현.
// 대부분 캐릭터의 body는 이미 머리~허리 구도라 zoom=1. marion만 전신(발끝)이라 zoom≈1.44로 반신 프레이밍.

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
  body: Emotion[];           // 일러 보유 표정 ({emotion}.png) — 단일 세트
  // ── 프레이밍 확대율 (아트 1세트를 CSS 크롭으로 흉상/반신/전신에 재사용) ──
  // 아트가 두 종류다: 전신형(발끝까지, ~904x1740)과 반신형(허리까지, ~419x835).
  // 도감 카드는 3:4·폭맞춤 → zoom = 4W / (3 × 목표Y)
  // VN 대사창은 세로 꽉참·높이맞춤 → zoom = H / 목표Y   (같은 프레이밍이라도 값이 다름)
  bustZoom?: number;         // 도감 '반신'(머리~허리). 기본 1
  chestZoom?: number;        // 도감 '흉상'(머리~가슴). 기본 1
  vnZoom?: number;           // VN 대사창 반신 프레이밍. 기본 1(=반신형 아트는 원본 그대로)
  fallback: Partial<Record<Emotion, Emotion>>; // 미보유 표정 → 보유 표정 폴백
}

export type CharacterId =
  | "lilia" | "marion" | "fiance" | "mephian"
  | "belfor" | "belian" | "lucienne" | "livia" | "reimon" | "azael";

export const CHARACTERS: Record<CharacterId, Character> = {
  // 전신 아트(904x1740) — 흉상/반신은 CSS 크롭으로 파생.
  lilia: {
    id: "lilia", name: "릴리아", hasPortrait: true, color: "#ffdf9e", // 금발 — 웜골드
    body: GRID_EMOTIONS,
    bustZoom: 1.36, chestZoom: 2.20, vnZoom: 1.96,
    fallback: {},
  },
  // 가시 돋친 장미 영애 (적발·와인 드레스). 전신 아트(928x1695).
  marion: {
    id: "marion", name: "마리온", hasPortrait: true, color: "#ff96a6", // 적발 — 로즈레드
    body: GRID_EMOTIONS,
    bustZoom: 1.46, chestZoom: 2.58, vnZoom: 2.00,
    fallback: {},
  },
  // 릴리아의 정략 약혼자 — 엑스트라(실루엣 초상, Desktop/1/extra 시트). 구 '세드릭' 삭제 후 서사 역할만 유지.
  fiance: { id: "fiance", name: "약혼자", hasPortrait: true, color: "#9db8e8",
    extra: true, body: ["soft"], fallback: {} },
  mephian: { id: "mephian", name: "재상 메피안", hasPortrait: true, color: "#b8b09b",
    extra: true, body: ["soft"], fallback: {} }, // 엑스트라(실루엣 초상)
  // ⚠️ 신규 남캐 2종 — 임시명. 플레이는 추후(잠금 루트), 현재는 카메오 등장만.
  // 구 '루시안(근위기사단장)' → '벨포르(근위대 부단장)'으로 재설정. 구 일러 전량 폐기,
  // 신규 시트 도착 시 body 채우고 hasPortrait:true.
  // ⏳ 반신 아트(419x835 — 허리까지). 전신 아트 교체 시 zoom 값 재산출 필요.
  belfor: {
    id: "belfor", name: "벨포르", hasPortrait: true, color: "#cfe0f5", // 백금발 — 플래티넘
    body: GRID_EMOTIONS, bustZoom: 0.67, chestZoom: 1.49, // vnZoom 없음 = 원본이 곧 반신
    fallback: {},
  },
  // 전신 아트(904x1740).
  belian: {
    id: "belian", name: "벨리안", hasPortrait: true, color: "#e8a06d", // 제국 제1황태자 (적발·와인 망토) — 임시명, 앰버
    body: GRID_EMOTIONS,
    bustZoom: 1.36, chestZoom: 2.20, vnZoom: 1.96,
    fallback: {},
  },
  // 설정 정본: STORY-BIBLE.md (2026-07-07 캐릭터 관계망 개편)
  // ⏳ 반신 아트(419x825).
  lucienne: {
    id: "lucienne", name: "루시엔", hasPortrait: true, color: "#bfe3ea", // 백발 — 아이스 시안
    body: GRID_EMOTIONS, bustZoom: 0.68, chestZoom: 1.51,
    fallback: {}, // 후작영애. 얼음처럼 완전한, 금 간 완벽주의
  },
  // id 'livia'는 아트 폴더/세이브 호환용 — 표시명 '리비아'(공작가의 서녀). ⏳ 반신 아트(394x889).
  livia: {
    id: "livia", name: "리비아", hasPortrait: true, color: "#f2cfa6", // 갈색머리 — 웜 베이지
    body: GRID_EMOTIONS, bustZoom: 0.59, chestZoom: 1.31,
    fallback: {}, // 하이델 공작가의 서녀. 그늘에서 숨죽여 피는 들꽃
  },
  // ⏳ 반신 아트(419x836).
  reimon: {
    id: "reimon", name: "레이먼", hasPortrait: true, color: "#b9c9dd", // 스틸 블루그레이
    body: GRID_EMOTIONS, bustZoom: 0.67, chestZoom: 1.49,
    fallback: {}, // 근위대 기사단장이자 북부대공. 검보다 차가운 침묵
  },
  // 전신 아트(904x1740).
  azael: {
    id: "azael", name: "아젤", hasPortrait: true, color: "#ece5cf", // 아이보리 실버
    body: GRID_EMOTIONS,
    bustZoom: 1.39, chestZoom: 2.33, vnZoom: 2.00,
    fallback: {}, // 신성왕국의 성기사. 빛의 맹세를 검에 새긴 자
  },
  // ── 캐릭터 추가 템플릿 ──
  // 1) CharacterId 유니온에 id 추가  2) 아래 형태로 항목 추가
  // 3) public/char/{id}/에 {emotion}.png(단일 세트) 배치 — 반신은 bustZoom(전신형이면 ~1.44)
  // {id}: { id:"{id}", name:"표시명", hasPortrait:true, body:[...], fallback:{ 미보유:보유 } },
};

/** 요청 표정 → 지정 세트에서 실제 보유 표정으로 해석 */
function resolveIn(set: Emotion[], c: Character, e: Emotion = "soft"): Emotion {
  if (set.includes(e)) return e;
  const fb = c.fallback[e];
  if (fb && set.includes(fb)) return fb;
  return set[0] ?? "soft";
}

export function resolveEmotion(c: Character, e: Emotion = "soft"): Emotion {
  return resolveIn(c.body, c, e);
}

// 배포 하위경로(GitHub Pages 등) 대응 — dev에선 "/"
const BASE = import.meta.env.BASE_URL;

/** 전신 일러 (홈 화면 등) */
export function portraitFile(id: CharacterId, e?: Emotion): string {
  const c = CHARACTERS[id];
  return `${BASE}char/${c.id}/${resolveIn(c.body, c, e)}.png`;
}

/** VN 대사창/도감용 일러 — 단일 세트(body). 반신 프레이밍은 CSS 크롭(bustZoom)으로 처리 */
export function vnFile(id: CharacterId, e?: Emotion): string {
  return portraitFile(id, e);
}

/** 도감 '반신'(머리~허리) 확대율 — 3:4 카드·폭맞춤 기준 */
export function bustZoomOf(id: CharacterId): number {
  return CHARACTERS[id].bustZoom ?? 1;
}

/** 도감 '흉상'(머리~가슴) 확대율 — 3:4 카드·폭맞춤 기준 */
export function chestZoomOf(id: CharacterId): number {
  return CHARACTERS[id].chestZoom ?? 1;
}

/** VN 대사창 확대율 — 높이맞춤 기준. 전신 아트를 반신으로 잡아 캐릭터 간 얼굴 크기를 통일 */
export function vnZoomOf(id: CharacterId): number {
  return CHARACTERS[id].vnZoom ?? 1;
}

/** 표시 아트가 임시 대체(placeholder)인지 — 요청 표정 미보유로 폴백 표정 표시 */
export function isPlaceholderArt(id: CharacterId, e?: Emotion): boolean {
  const c = CHARACTERS[id];
  if (!c.body.length) return true;
  return !!e && !c.body.includes(e);
}

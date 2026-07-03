// 이벤트 일러(CG) 레지스트리 — public/cg/{char}/{file}.jpg
// unlockEp가 있으면 해당 에피소드 클리어 시 해금(상태 불필요 — epCleared에서 파생).
// unlockEp가 없으면 잠금 티저(??? 표시) — 해당 캐릭터 스토리 확장 시 매핑.
import { CharacterId } from "./characters";

export interface Cg {
  id: string;
  char: CharacterId;
  title: string;      // 도감 표시명
  file: string;       // public/cg/{char}/{file}.jpg
  unlockEp?: string;  // 해금 에피소드 id
}

export const CGS: Cg[] = [
  // ── 에스텔: 시즌1 12화 1:1 ──
  { id: "cg_e1",  char: "estelle", title: "스러진 봄",       file: "tears_rain",    unlockEp: "ep1" },
  { id: "cg_e2",  char: "estelle", title: "온실의 장미",     file: "garden_rose",   unlockEp: "ep2" },
  { id: "cg_e3",  char: "estelle", title: "함께하는 티타임", file: "teatime",       unlockEp: "ep3" },
  { id: "cg_e4",  char: "estelle", title: "노을의 서재",     file: "study_dusk",    unlockEp: "ep4" },
  { id: "cg_e5",  char: "estelle", title: "내미는 손",       file: "reaching_hand", unlockEp: "ep5" },
  { id: "cg_e6",  char: "estelle", title: "밤의 운하",       file: "night_canal",   unlockEp: "ep6" },
  { id: "cg_e7",  char: "estelle", title: "피아노 선율",     file: "piano",         unlockEp: "ep7" },
  { id: "cg_e8",  char: "estelle", title: "무도회의 밤",     file: "ball_night",    unlockEp: "ep8" },
  { id: "cg_e9",  char: "estelle", title: "맞잡은 약속",     file: "promise_hand",  unlockEp: "ep9" },
  { id: "cg_e10", char: "estelle", title: "빗속의 온정",     file: "rain_kindness", unlockEp: "ep10" },
  { id: "cg_e11", char: "estelle", title: "가꾸는 봄",       file: "garden_care",   unlockEp: "ep11" },
  { id: "cg_e12", char: "estelle", title: "다시 피는 봄",    file: "white_rose",    unlockEp: "ep12" },

  // ── 세드릭: 에스텔 루트 등장 화와 매칭 (에스텔 CG와 테마 짝: 서재/무도회/비/온실) ──
  { id: "cg_s1", char: "sedric", title: "달빛의 방문",     file: "moon_visit",      unlockEp: "ep9" },
  { id: "cg_s2", char: "sedric", title: "밤의 서신",       file: "night_letter",    unlockEp: "ep6" },
  { id: "cg_s3", char: "sedric", title: "노을의 답신",     file: "dusk_reply",      unlockEp: "ep11" },
  { id: "cg_s4", char: "sedric", title: "서재의 사색",     file: "study_read",      unlockEp: "ep4" },
  { id: "cg_s5", char: "sedric", title: "푸른 장미의 밤",  file: "blue_rose_night", unlockEp: "ep8" },
  { id: "cg_s6", char: "sedric", title: "빗속의 파수",     file: "rain_vigil",      unlockEp: "ep10" },
  { id: "cg_s7", char: "sedric", title: "유리온실의 독서", file: "glasshouse_read", unlockEp: "ep12" },

  // ── 로젤린: 시즌1 등장 화(4·8·9·10)와 매칭. 나머지는 시즌2 잠금 티저 ──
  { id: "cg_r1", char: "rozelin", title: "장미의 홀",     file: "rose_hall",  unlockEp: "ep4" },
  { id: "cg_r4", char: "rozelin", title: "가면무도회",    file: "masquerade", unlockEp: "ep8" },
  { id: "cg_r6", char: "rozelin", title: "밀담",          file: "conspiracy", unlockEp: "ep9" },
  { id: "cg_r5", char: "rozelin", title: "부치지 못한 편지", file: "letters", unlockEp: "ep10" },
  // 로젤린 루트(rep*) 해금분
  { id: "cg_r2", char: "rozelin", title: "달밤의 부채",   file: "moon_fan",   unlockEp: "rep2" },
  { id: "cg_r3", char: "rozelin", title: "붉은 티타임",   file: "tea_hand",   unlockEp: "rep4" },
  { id: "cg_r8", char: "rozelin", title: "비에 젖은 밤",  file: "tears_rain", unlockEp: "rep8" },
  { id: "cg_r7", char: "rozelin", title: "폐허의 장미",   file: "ruins_rose", unlockEp: "rep10" },

  // ── 발렌: 루트 준비 중 — 전부 잠금 티저(???). 루트 공개 시 unlockEp 매핑 ──
  { id: "cg_v1", char: "valen", title: "붉은 옥좌",       file: "throne_night" },
  { id: "cg_v2", char: "valen", title: "가면 뒤의 미소",  file: "masquerade" },
  { id: "cg_v3", char: "valen", title: "장미의 서신",     file: "rose_letter" },
  { id: "cg_v4", char: "valen", title: "노을의 축배",     file: "dusk_toast" },
  { id: "cg_v5", char: "valen", title: "창가의 밀서",     file: "window_letter" },
  { id: "cg_v6", char: "valen", title: "달밤의 연회",     file: "moon_feast" },
];

export function cgFile(cg: Cg): string {
  return `${import.meta.env.BASE_URL}cg/${cg.char}/${cg.file}.jpg`;
}

/** 해금 판정: 스토리 중 연출로 봤거나(cgSeen), 매핑된 에피소드를 클리어했거나 */
export function cgUnlocked(cg: Cg, epCleared: string[], cgSeen: string[] = []): boolean {
  if (cgSeen.includes(cg.id)) return true;
  return !!cg.unlockEp && epCleared.includes(cg.unlockEp);
}

export function getCg(id: string): Cg | undefined {
  return CGS.find((c) => c.id === id);
}

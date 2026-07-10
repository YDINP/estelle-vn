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
  { id: "cg_e1",  char: "lilia", title: "스러진 봄",       file: "tears_rain",    unlockEp: "ep1" },
  { id: "cg_e2",  char: "lilia", title: "온실의 장미",     file: "garden_rose",   unlockEp: "ep2" },
  { id: "cg_e3",  char: "lilia", title: "함께하는 티타임", file: "teatime",       unlockEp: "ep3" },
  { id: "cg_e4",  char: "lilia", title: "노을의 서재",     file: "study_dusk",    unlockEp: "ep4" },
  { id: "cg_e5",  char: "lilia", title: "내미는 손",       file: "reaching_hand", unlockEp: "ep5" },
  { id: "cg_e6",  char: "lilia", title: "밤의 운하",       file: "night_canal",   unlockEp: "ep6" },
  { id: "cg_e7",  char: "lilia", title: "피아노 선율",     file: "piano",         unlockEp: "ep7" },
  { id: "cg_e8",  char: "lilia", title: "무도회의 밤",     file: "ball_night",    unlockEp: "ep8" },
  { id: "cg_e9",  char: "lilia", title: "맞잡은 약속",     file: "promise_hand",  unlockEp: "ep9" },
  { id: "cg_e10", char: "lilia", title: "빗속의 온정",     file: "rain_kindness", unlockEp: "ep10" },
  { id: "cg_e11", char: "lilia", title: "가꾸는 봄",       file: "garden_care",   unlockEp: "ep11" },
  { id: "cg_e12", char: "lilia", title: "다시 피는 봄",    file: "white_rose",    unlockEp: "ep12" },

  // ── 로젤린: 루트(rep*) 10화 연출 순서와 매칭 (STORY-BIBLE §5) ──
  { id: "cg_r2", char: "marion", title: "달빛 아래 부채", file: "moon_fan",   unlockEp: "rep2" },
  { id: "cg_r1", char: "marion", title: "장미의 홀",      file: "rose_hall",  unlockEp: "rep3" },
  { id: "cg_r3", char: "marion", title: "붉은 티타임",    file: "tea_hand",   unlockEp: "rep4" },
  { id: "cg_r6", char: "marion", title: "밀담",           file: "conspiracy", unlockEp: "rep6" },
  { id: "cg_r4", char: "marion", title: "가면무도회",     file: "masquerade", unlockEp: "rep7" },
  { id: "cg_r8", char: "marion", title: "비에 젖은 밤",   file: "tears_rain", unlockEp: "rep8" },
  { id: "cg_r5", char: "marion", title: "부치지 못한 편지", file: "letters",  unlockEp: "rep9" },
  { id: "cg_r7", char: "marion", title: "폐허의 장미",    file: "ruins_rose", unlockEp: "rep10" },

  // ── 이든: eden_route.ts 8화 (⚠️ id는 cg_ed* — estelle cg_e* 충돌 회피) ──
  { id: "cg_ed1", char: "belfor", title: "빗속의 꺾인 검",       file: "broken_sword_rain",    unlockEp: "eep1" },
  { id: "cg_ed2", char: "belfor", title: "새벽 훈련장의 이든",   file: "dawn_training_ground", unlockEp: "eep1" },
  { id: "cg_ed3", char: "belfor", title: "훈련장의 목검",        file: "cracked_wooden_sword", unlockEp: "eep2" },
  { id: "cg_ed4", char: "belfor", title: "노을의 성벽",          file: "sunset_rampart",       unlockEp: "eep3" },
  { id: "cg_ed5", char: "belfor", title: "책상 위의 봉인 명령서", file: "sealed_order_on_desk", unlockEp: "eep4" },
  { id: "cg_ed6", char: "belfor", title: "봉쇄로 향하는 횃불 행렬", file: "torch_procession",   unlockEp: "eep5" },
  { id: "cg_ed7", char: "belfor", title: "왕관의 밤 경비",       file: "crown_night_guard",    unlockEp: "eep7" },
  { id: "cg_ed8", char: "belfor", title: "스스로 고른 검",       file: "chosen_sword",         unlockEp: "eep8" },

  // ── 발렌: valen_route.ts 8화 (구 스텁 6종 → 스토리 매칭 8종으로 교체) ──
  { id: "cg_v1", char: "belian", title: "독이 든 축배",   file: "poisoned_chalice",   unlockEp: "vep1" },
  { id: "cg_v2", char: "belian", title: "궁정의 체스판",  file: "moonlit_chessboard", unlockEp: "vep2" },
  { id: "cg_v3", char: "belian", title: "옥좌의 그림자",  file: "throne_shadow",      unlockEp: "vep3" },
  { id: "cg_v4", char: "belian", title: "세 번 바뀐 잔",  file: "thrice_changed_cup", unlockEp: "vep4" },
  { id: "cg_v5", char: "belian", title: "좁아진 새장",    file: "narrowing_cage",     unlockEp: "vep5" },
  { id: "cg_v6", char: "belian", title: "왕관의 밤",      file: "crown_night",        unlockEp: "vep6" },
  { id: "cg_v7", char: "belian", title: "웃으며 쓰는 왕관", file: "smiling_coronation", unlockEp: "vep7" },
  { id: "cg_v8", char: "belian", title: "새장의 열린 문",  file: "open_cage_door",     unlockEp: "vep8" },

  // ── 이졸데: isolde_route.ts ──
  { id: "cg_i1", char: "lucienne", title: "얼음의 살롱",     file: "frozen_salon",   unlockEp: "iep1" },
  { id: "cg_i2", char: "lucienne", title: "얼음과 서리",     file: "ice_and_frost",  unlockEp: "iep3" },
  { id: "cg_i3", char: "lucienne", title: "비뚤어진 한 땀",  file: "crooked_stitch", unlockEp: "iep4" },
  { id: "cg_i4", char: "lucienne", title: "사절석의 백합",   file: "envoy_lily",     unlockEp: "iep6" },
  { id: "cg_i5", char: "lucienne", title: "흐트러진 백합",   file: "undone_lily",    unlockEp: "iep8" },

  // ── 클로에(adele): adele_route.ts ──
  { id: "cg_a1", char: "livia", title: "지워진 이름",   file: "erased_name",         unlockEp: "ad1" },
  { id: "cg_a2", char: "livia", title: "별채의 들꽃",   file: "cottage_wildflowers", unlockEp: "ad2" },
  { id: "cg_a3", char: "livia", title: "저울 위의 등불", file: "lantern_on_scale",   unlockEp: "ad4" },
  { id: "cg_a4", char: "livia", title: "그늘과 볕",     file: "shade_and_sunlight",  unlockEp: "ad6" },
  { id: "cg_a5", char: "livia", title: "불리는 이름",   file: "spoken_name",         unlockEp: "ad8" },

  // ── 레이너: rayner_route.ts (⚠️ id는 cg_ry* — rozelin cg_r* 충돌 회피) ──
  { id: "cg_ry1", char: "reimon", title: "얼어붙은 맹세",       file: "frozen_oath",          unlockEp: "ryep1" },
  { id: "cg_ry2", char: "reimon", title: "연무장의 새벽",       file: "training_ground_dawn", unlockEp: "ryep1" },
  { id: "cg_ry3", char: "reimon", title: "연무장의 서리",       file: "frosted_drill_yard",   unlockEp: "ryep2" },
  { id: "cg_ry4", char: "reimon", title: "두 개의 문장",        file: "two_crests",           unlockEp: "ryep3" },
  { id: "cg_ry5", char: "reimon", title: "압류된 서신",         file: "seized_letter",        unlockEp: "ryep4" },
  { id: "cg_ry6", char: "reimon", title: "닫히는 문",           file: "closing_door",         unlockEp: "ryep5" },
  { id: "cg_ry7", char: "reimon", title: "왕관의 밤, 은빛 경비", file: "silver_guard",         unlockEp: "ryep6" },
  { id: "cg_ry8", char: "reimon", title: "증거를 따르는 검",     file: "sword_of_evidence",    unlockEp: "ryep7" },
  { id: "cg_ry9", char: "reimon", title: "북으로 난 길",        file: "road_north",           unlockEp: "ryep8" },

  // ── 미카엘: michael_route.ts ──
  { id: "cg_m1", char: "azael", title: "빛을 잃은 새벽",     file: "dawn_without_light",     unlockEp: "mep1" },
  { id: "cg_m2", char: "azael", title: "사절관의 촛불",      file: "envoy_candlelight",      unlockEp: "mep2" },
  { id: "cg_m3", char: "azael", title: "예배당의 맹세",      file: "chapel_oath",            unlockEp: "mep3" },
  { id: "cg_m4", char: "azael", title: "뜯긴 봉랍",          file: "broken_seal",            unlockEp: "mep4" },
  { id: "cg_m5", char: "azael", title: "촛불의 무게",        file: "weight_of_candle",       unlockEp: "mep5" },
  { id: "cg_m6", char: "azael", title: "왕관의 밤, 사절석",   file: "crown_night_envoy_seat", unlockEp: "mep6" },
  { id: "cg_m7", char: "azael", title: "국경을 넘는 봉랍",    file: "seal_across_border",     unlockEp: "mep7" },
  { id: "cg_m8", char: "azael", title: "국경을 넘는 빛",      file: "light_across_border",    unlockEp: "mep8" },
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

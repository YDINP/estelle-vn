// 이벤트 일러(CG) 레지스트리 — public/cg/{char}/{file}.webp
// unlockEp가 있으면 해당 에피소드 클리어 시 해금(상태 불필요 — epCleared에서 파생).
// unlockEp가 없으면 잠금 티저(??? 표시) — 해당 캐릭터 스토리 확장 시 매핑.
import { CharacterId } from "./characters";

export interface Cg {
  id: string;
  char: CharacterId;
  title: string;      // 도감 표시명
  file: string;       // public/cg/{char}/{file}.webp
  unlockEp?: string;  // 해금 에피소드 id
  // 엔딩 CG(good/bad/true) 전용 표기. unlockEp 대신 이걸로 구분 — 한 화(예: map30)에
  // 분기 3종이 동시에 열리면 안 되므로, 실제 해금 판정은 RouteProgress.endings(엔진팀,
  // src/game/state.ts 작업 중)를 참조해 cgUnlocked를 확장해야 한다. ⚠️ 이 파일 소유자는
  // 데이터만 등재, 엔진 로직 연결은 엔진팀 몫(src/game/** 소유 경계).
  ending?: "good" | "bad" | "true";
}

export const CGS: Cg[] = [
  // ── 릴리아: 대개편 신 스토리 1막 (프롤로그~5화). 아트 반입 완료분만 등재.
  //    6~10화(two_seals·rose_lily_tea·annex_child·printing_raid·faceless_portrait)는 아트 도착 시 추가.
  { id: "cg_lip0", char: "lilia", title: "봄을 빼앗긴 탑",   file: "prologue_tower",      unlockEp: "lip0" },
  { id: "cg_lip1", char: "lilia", title: "다시, 정원의 봄",  file: "spring_garden",       unlockEp: "lip1" },
  { id: "cg_lip2", char: "lilia", title: "서재의 그림자",    file: "study_shadow",        unlockEp: "lip2" },
  { id: "cg_lip3", char: "lilia", title: "붉은 장미의 값",   file: "red_rose_tea",        unlockEp: "lip3" },
  { id: "cg_lip4", char: "lilia", title: "약혼의 그늘",      file: "fiance_drawer",       unlockEp: "lip4" },
  { id: "cg_lip5", char: "lilia", title: "아는 얼굴, 모르는 눈", file: "corridor_chancellor", unlockEp: "lip5" },

  // ── 릴리아: 2막 이후(30화 체계) — story/cg-manifest-lilia.json 병합(2026-07-27).
  //    ⚠️ file 아트 미생성. `public/cg/lilia/end_good.webp` 등 구스펙(ILLUST-CG-LIST.md §9) 기준
  //    generic 엔딩 아트가 이미 존재하지만 장면이 이 매니페스트와 근접해 보일 뿐 세부 불일치
  //    (배경 인물 마리온·리비아 미확인 등) — 매니페스트 지정 file명 그대로 등재, 재생성 필요.
  { id: "cg_lip15", char: "lilia", title: "동시에 잠긴 세 개의 문", file: "sealed_gate",           unlockEp: "lip15" },
  { id: "cg_lip18", char: "lilia", title: "빈 기록함",           file: "empty_reliquary",         unlockEp: "lip18" },
  { id: "cg_lip20", char: "lilia", title: "말과 기수",           file: "chancellor_confesses",    unlockEp: "lip20" },
  { id: "cg_lip23", char: "lilia", title: "일곱 개의 실",         file: "seven_threads",           unlockEp: "lip23" },
  { id: "cg_lip25", char: "lilia", title: "자정 세 시간 전",       file: "three_messengers",        unlockEp: "lip25" },
  { id: "cg_lip26", char: "lilia", title: "황실의 이름으로",       file: "crown_night_accusation",  unlockEp: "lip26" },
  { id: "cg_lip27", char: "lilia", title: "잃어버린 대본",         file: "lost_script",             unlockEp: "lip27" },
  { id: "cg_lip28", char: "lilia", title: "증거를 따른다",         file: "evidence_verdict",        unlockEp: "lip28" },
  { id: "cg_lip29", char: "lilia", title: "두 번은 없다",         file: "chancellor_turns",        unlockEp: "lip29" },
  { id: "cg_lip_good", char: "lilia", title: "되찾은 봄",         file: "end_good", ending: "good" },
  { id: "cg_lip_bad",  char: "lilia", title: "창밖의 봄",         file: "end_bad",   ending: "bad" },
  { id: "cg_lip_true", char: "lilia", title: "두 번째 봄을 여는 손", file: "end_true",   ending: "true" },

  // ── 마리온: 신 스토리 1막. 프롤로그는 신규 아트, 2·3화는 구 아트가 신 장면과 일치해 재활용.
  { id: "cg_map0", char: "marion", title: "커튼콜 없는 퇴장", file: "prologue_exile", unlockEp: "map0" },
  { id: "cg_map2", char: "marion", title: "달빛 아래 부채",   file: "moon_fan",       unlockEp: "map2" },
  { id: "cg_map3", char: "marion", title: "무대 위의 미소",   file: "rose_hall",      unlockEp: "map3" },

  // ── 마리온: 2막 이후(30화 체계) — story/cg-manifest-marion.json 병합(2026-07-27).
  //    ⚠️ file 아트 미생성(다음 단계 이미지 생성 대상). unlockEp는 작가 산출 화 id 그대로.
  { id: "cg_map12", char: "marion", title: "얼굴 없는 초상",         file: "faceless_portrait_ring", unlockEp: "map12" },
  { id: "cg_map15", char: "marion", title: "짧은 초 한 자루",         file: "debt_notice_candle",     unlockEp: "map15" },
  { id: "cg_map18", char: "marion", title: "위조된 죄",             file: "forged_ledger",          unlockEp: "map18" },
  { id: "cg_map20", char: "marion", title: "제3의 손",              file: "third_hand_drawer",      unlockEp: "map20" },
  { id: "cg_map21", char: "marion", title: "목줄",                 file: "leash_rehearsal",        unlockEp: "map21" },
  { id: "cg_map23", char: "marion", title: "일곱 개의 실",           file: "seven_threads",          unlockEp: "map23" },
  { id: "cg_map25", char: "marion", title: "자정 세 시간 전",         file: "three_hours_before",     unlockEp: "map25" },
  { id: "cg_map26", char: "marion", title: "왕관의 밤, 자정 종",       file: "midnight_accusation",    unlockEp: "map26" },
  { id: "cg_map27", char: "marion", title: "대본을 잃어버렸네요",       file: "lost_script",            unlockEp: "map27" },
  { id: "cg_map28", char: "marion", title: "저 둘을 확보하라",         file: "the_seizure",            unlockEp: "map28" },
  // 엔딩 3종(30화) — unlockEp 대신 ending 필드로 분기 구분(map30 하나로 3종이 동시 해금되면 안 됨).
  { id: "cg_map_good", char: "marion", title: "폐허의 장미 (굿 엔딩)",     file: "end_good",     ending: "good" },
  { id: "cg_map_bad",  char: "marion", title: "배웅 없는 겨울 (배드 엔딩)", file: "end_bad", ending: "bad" },
  { id: "cg_map_true", char: "marion", title: "지워진 이름 (트루 엔딩)",   file: "end_true",            ending: "true" },

  // ── 나머지 6루트 프롤로그(1회차 배드엔딩) — 아트 반입 완료분.
  { id: "cg_blp0", char: "belian",   title: "삼켜진 태양",           file: "prologue_swallowed",    unlockEp: "blp0" },

  // ── 벨리안: 2막 이후(30화 체계) — story/cg-manifest-belian.json 병합(2026-07-27).
  //    ⚠️ file 아트 미생성. public/cg/belian/end_good.webp 등 기존 generic 엔딩 아트가 있으나
  //    장면 불일치 확인(이 나간 낡은 잔·주교 대관 vs 실제=황금 잔·환호하는 군중) — 미채택, 재생성 필요.
  { id: "cg_blp12", char: "belian", title: "지우지 않은 손",       file: "faceless_ring",     unlockEp: "blp12" },
  { id: "cg_blp14", char: "belian", title: "닫히는 방패의 문",     file: "sealed_gate",       unlockEp: "blp14" },
  { id: "cg_blp15", char: "belian", title: "검자루에 닿은 손",     file: "hand_to_sword",     unlockEp: "blp15" },
  { id: "cg_blp18", char: "belian", title: "국경 위의 증인",       file: "border_paladin",    unlockEp: "blp18" },
  { id: "cg_blp20", char: "belian", title: "제3의 손",           file: "third_hand",        unlockEp: "blp20" },
  { id: "cg_blp23", char: "belian", title: "일곱 개의 실",         file: "seven_threads",     unlockEp: "blp23" },
  { id: "cg_blp25", char: "belian", title: "축배로 뻗는 손",       file: "reaching_chalice",  unlockEp: "blp25" },
  { id: "cg_blp26", char: "belian", title: "왕관의 밤",           file: "crown_night_hall",  unlockEp: "blp26" },
  { id: "cg_blp28", char: "belian", title: "세 살 적부터 채워 온 잔", file: "swapped_chalice",   unlockEp: "blp28" },
  { id: "cg_blp_good", char: "belian", title: "웃으며 쓰는 왕관",     file: "end_good", ending: "good" },
  { id: "cg_blp_bad",  char: "belian", title: "삼키는 태양",         file: "end_bad",  ending: "bad" },
  { id: "cg_blp_true", char: "belian", title: "두 번은 없다",        file: "end_true", ending: "true" },

  { id: "cg_bfp0", char: "belfor",   title: "스스로 꺾은 검",         file: "prologue_broken_sword", unlockEp: "bfp0" },

  // ── 벨포르: 2막 이후(30화 체계) — story/cg-manifest-belfor.json 병합(2026-07-27).
  //    ⚠️ file 아트 미생성. 기존 generic 엔딩 art(end_good/bad/true)와 파일명·장면 불일치 확인.
  { id: "cg_bfp12", char: "belfor", title: "뜯지 못한 봉인",       file: "halted_pen",        unlockEp: "bfp12" },
  { id: "cg_bfp15", char: "belfor", title: "봉쇄로 향하는 횃불",     file: "torch_march",       unlockEp: "bfp15" },
  { id: "cg_bfp16", char: "belfor", title: "가라앉는 배의 문지기",    file: "canal_gate",        unlockEp: "bfp16" },
  { id: "cg_bfp19", char: "belfor", title: "훔친 각본",           file: "stolen_script",     unlockEp: "bfp19" },
  { id: "cg_bfp20", char: "belfor", title: "죽은 손의 서명",        file: "dead_mans_signature", unlockEp: "bfp20" },
  { id: "cg_bfp22", char: "belfor", title: "두 개의 명령서",        file: "two_orders",        unlockEp: "bfp22" },
  { id: "cg_bfp25", char: "belfor", title: "자정 세 시간 전",        file: "three_hours",       unlockEp: "bfp25" },
  { id: "cg_bfp26", char: "belfor", title: "한 걸음도 떼지 않는다",   file: "hilt_unmoved",      unlockEp: "bfp26" },
  { id: "cg_bfp28", char: "belfor", title: "검이 고른 방향",        file: "he_chose",          unlockEp: "bfp28" },
  { id: "cg_bfp_good", char: "belfor", title: "꽂은 검, 새 맹세",    file: "end_good",     ending: "good" },
  { id: "cg_bfp_bad",  char: "belfor", title: "다시, 스스로 꺾은 검", file: "end_bad",     ending: "bad" },
  { id: "cg_bfp_true", char: "belfor", title: "두 번째 물음",        file: "end_true",  ending: "true" },

  { id: "cg_rmp0", char: "reimon",   title: "두 맹세에 버림받은 검",   file: "prologue_snow_oath",    unlockEp: "rmp0" },

  // ── 레이먼: 2막 이후(30화 체계) — story/cg-manifest-reimon.json 병합(2026-07-27).
  //    ⚠️ file 아트 미생성. 기존 generic 엔딩 art(end_good/bad/true)와 파일명·장면 불일치 확인.
  { id: "cg_rmp12", char: "reimon", title: "반쯤 뽑힌 검",         file: "barracks_halfdrawn",  unlockEp: "rmp12" },
  { id: "cg_rmp14", char: "reimon", title: "두 맹세의 정면충돌",     file: "two_oaths_collide",   unlockEp: "rmp14" },
  { id: "cg_rmp15", char: "reimon", title: "닫히는 문",           file: "gate_closing",        unlockEp: "rmp15" },
  { id: "cg_rmp17", char: "reimon", title: "폐수도원의 왼손",       file: "ruined_abbey",        unlockEp: "rmp17" },
  { id: "cg_rmp19", char: "reimon", title: "창 너머의 각본",        file: "the_script",          unlockEp: "rmp19" },
  { id: "cg_rmp20", char: "reimon", title: "문장이 없는 인장",       file: "blank_seal",          unlockEp: "rmp20" },
  { id: "cg_rmp23", char: "reimon", title: "일곱 개의 실",          file: "seven_threads",       unlockEp: "rmp23" },
  { id: "cg_rmp25", char: "reimon", title: "자정 세 시간 전",        file: "three_hours",         unlockEp: "rmp25" },
  { id: "cg_rmp26", char: "reimon", title: "은빛 경비",           file: "upper_gallery",       unlockEp: "rmp26" },
  { id: "cg_rmp28", char: "reimon", title: "증거를 따르는 검",       file: "evidence_command",    unlockEp: "rmp28" },
  { id: "cg_rmp_good", char: "reimon", title: "북으로 난 길",        file: "end_good",     ending: "good" },
  { id: "cg_rmp_bad",  char: "reimon", title: "눈밭의 두 사람",       file: "end_bad",      ending: "bad" },
  { id: "cg_rmp_true", char: "reimon", title: "봄을 세는 손",        file: "end_true", ending: "true" },

  { id: "cg_lup0", char: "lucienne", title: "완벽의 감옥",           file: "prologue_broken_vow",   unlockEp: "lup0" },

  // ── 루시엔: 2막 이후(30화 체계) — story/cg-manifest-lucienne.json 병합(2026-07-27).
  //    ⚠️ 1~9화 file 아트 미생성. 단 엔딩 3종은 매니페스트가 end_good/bad/true를 그대로 지정 —
  //    §11(아래 나머지 루트 엔딩 블록)에 이미 등록된 것과 완전히 일치, 재등록 불필요.
  { id: "cg_lup13", char: "lucienne", title: "어떻게 알았죠",      file: "how_did_you_know",     unlockEp: "lup13" },
  { id: "cg_lup15", char: "lucienne", title: "끊긴 문장",         file: "broken_sentence_hall", unlockEp: "lup15" },
  { id: "cg_lup16", char: "lucienne", title: "떠나지 않은 사람",    file: "unvacated_seat",       unlockEp: "lup16" },
  { id: "cg_lup18", char: "lucienne", title: "그림자에서 온 봉랍",   file: "seal_from_exile",      unlockEp: "lup18" },
  { id: "cg_lup20", char: "lucienne", title: "제3의 손",          file: "nameless_seal_archive", unlockEp: "lup20" },
  { id: "cg_lup25", char: "lucienne", title: "자정 세 시간 전",      file: "three_hours_to_midnight", unlockEp: "lup25" },
  { id: "cg_lup26", char: "lucienne", title: "사절석의 백합",       file: "envoy_seat_lily",      unlockEp: "lup26" },
  { id: "cg_lup28", char: "lucienne", title: "끊긴 배석",          file: "broken_attendance",    unlockEp: "lup28" },
  { id: "cg_lvp0", char: "livia",    title: "지워진 이름",           file: "prologue_erased",       unlockEp: "lvp0" },

  // ── 리비아: 2막 이후(30화 체계) — story/cg-manifest-livia.json 병합(2026-07-27).
  //    ⚠️ file 아트 미생성. 기존 generic 엔딩 art(end_good/bad/true)와 파일명·장면 불일치 확인.
  { id: "cg_lvp14", char: "livia", title: "빗물에 번진 이름",     file: "rain_smeared_name",   unlockEp: "lvp14" },
  { id: "cg_lvp15", char: "livia", title: "유혹의 문",           file: "door_of_temptation",  unlockEp: "lvp15" },
  { id: "cg_lvp17", char: "livia", title: "그늘과 볕",           file: "shade_and_sun",       unlockEp: "lvp17" },
  { id: "cg_lvp19", char: "livia", title: "진짜 각본",           file: "the_real_script",     unlockEp: "lvp19" },
  { id: "cg_lvp20", char: "livia", title: "제3의 손",           file: "the_third_hand",      unlockEp: "lvp20" },
  { id: "cg_lvp21", char: "livia", title: "두 사람 몫의 불",       file: "two_lamps",           unlockEp: "lvp21" },
  { id: "cg_lvp25", char: "livia", title: "자정 세 시간 전",       file: "three_hours_to_midnight", unlockEp: "lvp25" },
  { id: "cg_lvp27", char: "livia", title: "걸어 나온 이름",        file: "step_into_the_light", unlockEp: "lvp27" },
  { id: "cg_lvp28", char: "livia", title: "저 둘을 확보하라",       file: "the_seizure",         unlockEp: "lvp28" },
  { id: "cg_lvp_good", char: "livia", title: "불리는 이름 (굿엔딩)",       file: "end_good",   ending: "good" },
  { id: "cg_lvp_bad",  char: "livia", title: "지워진 이름, 두 번째 (배드엔딩)", file: "end_bad",  ending: "bad" },
  { id: "cg_lvp_true", char: "livia", title: "두 번째 봄 (트루엔딩)",       file: "end_true", ending: "true" },

  { id: "cg_azp0", char: "azael",    title: "빛을 판 새벽",           file: "prologue_sold_light",   unlockEp: "azp0" },

  // ── 루시엔 엔딩 3종 — story/cg-manifest-lucienne.json이 end_good/bad/true를 그대로 지정,
  //    §9(기존 스펙)와 title까지 완전 일치 확인(2026-07-27) — 재검증 불필요, art 그대로 유효.
  { id: "cg_lup_good", char: "lucienne", title: "흐트러진 자유",        file: "end_good", ending: "good" },
  { id: "cg_lup_bad",  char: "lucienne", title: "완벽의 붕괴 (재현)",    file: "end_bad",  ending: "bad" },
  { id: "cg_lup_true", char: "lucienne", title: "완벽의 감옥, 설계자의 잔영", file: "end_true", ending: "true" },

  // ── 아젤: 2막 이후(30화 체계) — story/cg-manifest-azael.json 병합(2026-07-27).
  //    ⚠️ 1~9화 file 아트 미생성. GOOD/BAD는 매니페스트가 end_good/end_bad를 그대로 지정
  //    (title도 일치) — 단 실제 art 장면은 §9 구스펙(대성당 문 앞) 기준이라 매니페스트의
  //    신규 장면(재심정 내부/국경 이정표)과는 다름, 재생성 필요할 수 있음. TRUE는 신규
  //    file(ending_next_spring)·title 지정 — 미생성, 그대로 등재.
  { id: "cg_azp12", char: "azael", title: "제 얼굴을 한 거짓",     file: "twin_seals",             unlockEp: "azp12" },
  { id: "cg_azp15", char: "azael", title: "식어 가는 밀랍",        file: "cooling_wax",            unlockEp: "azp15" },
  { id: "cg_azp17", char: "azael", title: "격자 너머의 파문자",     file: "lattice_excommunicate",  unlockEp: "azp17" },
  { id: "cg_azp18", char: "azael", title: "국경을 넘는 봉랍",       file: "seal_crossing_border",   unlockEp: "azp18" },
  { id: "cg_azp20", char: "azael", title: "향을 받쳐 든 손",       file: "hand_above_chancellor",  unlockEp: "azp20" },
  { id: "cg_azp22", char: "azael", title: "가장 밝은 자리",        file: "envoy_seat_invitation",  unlockEp: "azp22" },
  { id: "cg_azp25", char: "azael", title: "세 개의 값",           file: "three_prices",           unlockEp: "azp25" },
  { id: "cg_azp27", char: "azael", title: "봉랍 증언",            file: "the_sealed_testimony",   unlockEp: "azp27" },
  { id: "cg_azp_good", char: "azael", title: "되찾은 세 맹세",       file: "end_good", ending: "good" },
  { id: "cg_azp_bad",  char: "azael", title: "빛을 판 타락 (재현)",   file: "end_bad",  ending: "bad" },
  { id: "cg_azp_true", char: "azael", title: "다음 봄의 증인",       file: "end_true", ending: "true" },

  // ⚠️ 구 스토리(ep*/rep*/vep*/eep*/iep*/ad*/ryep*/mep*) CG 항목은 전량 제거했다.
  //    개편으로 에피소드 id가 lip*/map*/blp*… 로 바뀌어 unlockEp가 어디에도 매칭되지 않았고,
  //    belfor·reimon·lucienne·livia·azael은 아트 파일 자체가 없어 영구 잠금 슬롯으로만 남아 있었다.
  //    미사용 구 아트(릴리아 12·마리온 5·벨리안 6장)는 public/cg에 보존 — 스페셜 CG 등으로 재활용됨
  //    (src/data/special_illust.ts).
  //
  // ✅ 8루트 cg-manifest-*.json 전량 병합 완료(2026-07-27, story/cg-manifest-{lilia,marion,
  //    belian,reimon,livia,belfor,lucienne,azael}.json). 1막(프롤로그~5/10화) 아트는 기존 반입분
  //    그대로, 2막 이후(11~30화)는 전부 id/file/unlockEp만 등재된 상태 — art 생성은 다음 단계.
  //    file 존재 여부는 tools/audit-cg(스크립트)로 대조: 미존재 목록 = 다음 이미지 생성 대상.
];

export function cgFile(cg: Cg): string {
  return `${import.meta.env.BASE_URL}cg/${cg.char}/${cg.file}.webp`;
}

/** 해금 판정: 스토리 중 연출로 봤거나(cgSeen), 매핑된 에피소드를 클리어했거나 */
export function cgUnlocked(cg: Cg, epCleared: string[], cgSeen: string[] = []): boolean {
  if (cgSeen.includes(cg.id)) return true;
  return !!cg.unlockEp && epCleared.includes(cg.unlockEp);
}

export function getCg(id: string): Cg | undefined {
  return CGS.find((c) => c.id === id);
}

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
  // ── 릴리아: 대개편 신 스토리 1막 (프롤로그~5화). 아트 반입 완료분만 등재.
  //    6~10화(two_seals·rose_lily_tea·annex_child·printing_raid·faceless_portrait)는 아트 도착 시 추가.
  { id: "cg_lip0", char: "lilia", title: "봄을 빼앗긴 탑",   file: "prologue_tower",      unlockEp: "lip0" },
  { id: "cg_lip1", char: "lilia", title: "다시, 정원의 봄",  file: "spring_garden",       unlockEp: "lip1" },
  { id: "cg_lip2", char: "lilia", title: "서재의 그림자",    file: "study_shadow",        unlockEp: "lip2" },
  { id: "cg_lip3", char: "lilia", title: "붉은 장미의 값",   file: "red_rose_tea",        unlockEp: "lip3" },
  { id: "cg_lip4", char: "lilia", title: "약혼의 그늘",      file: "fiance_drawer",       unlockEp: "lip4" },
  { id: "cg_lip5", char: "lilia", title: "아는 얼굴, 모르는 눈", file: "corridor_chancellor", unlockEp: "lip5" },

  // ── 마리온: 신 스토리 1막. 프롤로그는 신규 아트, 2·3화는 구 아트가 신 장면과 일치해 재활용.
  { id: "cg_map0", char: "marion", title: "커튼콜 없는 퇴장", file: "prologue_exile", unlockEp: "map0" },
  { id: "cg_map2", char: "marion", title: "달빛 아래 부채",   file: "moon_fan",       unlockEp: "map2" },
  { id: "cg_map3", char: "marion", title: "무대 위의 미소",   file: "rose_hall",      unlockEp: "map3" },

  // ⚠️ 구 스토리(ep*/rep*/vep*/eep*/iep*/ad*/ryep*/mep*) CG 항목은 전량 제거했다.
  //    개편으로 에피소드 id가 lip*/map*/blp*… 로 바뀌어 unlockEp가 어디에도 매칭되지 않았고,
  //    belfor·reimon·lucienne·livia·azael은 아트 파일 자체가 없어 영구 잠금 슬롯으로만 남아 있었다.
  //    남은 계획분(릴리아 6~10화, 마리온 1·4·5화, 벨리안~아젤 전량)은 아트 반입 시 여기에 추가한다.
  //    미사용 구 아트(릴리아 12·마리온 5·벨리안 6장)는 public/cg에 보존 — 스페셜 CG 등으로 재활용 가능.
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

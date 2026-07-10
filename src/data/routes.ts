// 루트(캐릭터 시점) 레지스트리 — 하나의 사건(하이델 음모)을 캐릭터별 시점으로 진행.
// 전체 줄기는 동일하지만, 루트별로 화 구성·일상 씬이 달라진다.
// ⚠️ episodes/daily는 데이터 파일을 import만 (데이터 파일 무수정 원칙).
import { CharacterId } from "./characters";
import { Episode } from "./season1";
import { DailyScene } from "./daily";
import { LILIA_EPISODES, LILIA_DAILY } from "./lilia_route";
import { MARION_EPISODES, MARION_DAILY } from "./marion_route";
import { BELFOR_EPISODES, BELFOR_DAILY } from "./belfor_route";
import { BELIAN_EPISODES, BELIAN_DAILY } from "./belian_route";
import { LUCIENNE_EPISODES, LUCIENNE_DAILY } from "./lucienne_route";
import { LIVIA_EPISODES, LIVIA_DAILY } from "./livia_route";
import { REIMON_EPISODES, REIMON_DAILY } from "./reimon_route";
import { AZAEL_EPISODES, AZAEL_DAILY } from "./azael_route";

export interface Route {
  id: string;              // "lilia" 등 (charId와 동일 규약)
  charId: CharacterId;     // 이 루트의 주인공 캐릭터
  title: string;           // 선택 카드 제목
  desc: string;            // 선택 카드 한 줄 소개
  episodes: Episode[];     // 이 루트의 에피소드 (빈 배열 = 준비 중)
  daily: DailyScene[];     // 이 루트의 일일 미니 씬
  available: boolean;      // false = 준비 중(잠금 티저)
}

export const ROUTES: Route[] = [
  {
    id: "lilia", charId: "lilia",
    title: "릴리아 루트 — 스러진 봄 (개편)",
    desc: "정해진 파멸을 아는 당신이, 일곱 죄가 탐하는 그녀의 봄을 다시 쓴다. [프롤로그+1막 배선]",
    episodes: LILIA_EPISODES,
    daily: LILIA_DAILY,
    available: true,
  },
  {
    id: "marion", charId: "marion",
    title: "마리온 루트 — 값 없는 유대 (개편)",
    desc: "빚에 목이 잡혀 남을 파는 값으로 살아온 붉은 장미. 배역이 아닌 제 이름의 대본을 함께 되찾는다. [프롤로그+1막]",
    episodes: MARION_EPISODES,
    daily: MARION_DAILY,
    available: true,
  },
  // ── 잠금 루트 6종 개방 (story/ 집필 → *_route.ts 데이터화, 2026-07-08) ──
  {
    id: "belfor", charId: "belfor",
    title: "벨포르 루트 — 스스로 고른 검 (개편)",
    desc: "묻지 않고 복종한 검이 끝내 아무도 지키지 못했다. 이번엔, 그 검이 무엇을 지킬지 스스로 묻고 고른다. [프롤로그+1막]",
    episodes: BELFOR_EPISODES, daily: BELFOR_DAILY, available: true,
  },
  {
    id: "belian", charId: "belian",
    title: "벨리안 루트 — 웃으며 쓰는 왕관 (개편)",
    desc: "먼저 삼키지 않으면 삼켜진다 믿어 온 태양. 왕관에 삼켜지지 않고 웃으며 왕관을 쓰도록, 새장의 문을 함께 연다. [프롤로그+1막]",
    episodes: BELIAN_EPISODES, daily: BELIAN_DAILY, available: true,
  },
  {
    id: "lucienne", charId: "lucienne",
    title: "루시엔 루트 — 실패할 자유 (개편)",
    desc: "완벽만이 존재를 증명한다 믿어 온 흰 백합에게, 완결되지 않은 문장으로도 살아갈 수 있다는 한 마디를. [프롤로그+1막]",
    episodes: LUCIENNE_EPISODES, daily: LUCIENNE_DAILY, available: true,
  },
  {
    id: "livia", charId: "livia",
    title: "리비아 루트 — 불리는 이름 (개편)",
    desc: "이름 한 번 불리지 못한 채 지워졌던 서녀. 이번엔 당신이 먼저, 그 이름을 부른다. [프롤로그+1막]",
    episodes: LIVIA_EPISODES, daily: LIVIA_DAILY, available: true,
  },
  {
    id: "reimon", charId: "reimon",
    title: "레이먼 루트 — 두 맹세의 화해 (개편)",
    desc: "북부와 황실, 두 개의 맹세를 한 자루 검에 진 기사. 반역자의 오명 속 고립을, 두 맹세가 한 방향을 가리키게. [프롤로그+1막]",
    episodes: REIMON_EPISODES, daily: REIMON_DAILY, available: true,
  },
  {
    id: "azael", charId: "azael",
    title: "아젤 루트 — 국경을 넘는 빛 (개편)",
    desc: "미혹에 성의를 팔아 타락했던 증인. 빛의 세 맹세를 되찾아, 맹세와 마음이 양립할 수 있음을 함께 증명한다. [프롤로그+1막]",
    episodes: AZAEL_EPISODES, daily: AZAEL_DAILY, available: true,
  },
];

export function getRoute(id: string): Route | undefined {
  return ROUTES.find((r) => r.id === id);
}

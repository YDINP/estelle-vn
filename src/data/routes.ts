// 루트(캐릭터 시점) 레지스트리 — 하나의 사건(하이델 음모)을 캐릭터별 시점으로 진행.
// 전체 줄기는 동일하지만, 루트별로 화 구성·일상 씬이 달라진다.
// ⚠️ episodes/daily는 데이터 파일을 import만 (데이터 파일 무수정 원칙).
import { CharacterId } from "./characters";
import { Episode } from "./season1";
import { DailyScene } from "./daily";
import { LILIA_EPISODES, LILIA_DAILY } from "./lilia_route";
import { ROZELIN_EPISODES, ROZELIN_DAILY } from "./rozelin_route";
import { EDEN_EPISODES, EDEN_DAILY } from "./eden_route";
import { VALEN_EPISODES, VALEN_DAILY } from "./valen_route";
import { ISOLDE_EPISODES, ISOLDE_DAILY } from "./isolde_route";
import { ADELE_EPISODES, ADELE_DAILY } from "./adele_route";
import { RAYNER_EPISODES, RAYNER_DAILY } from "./rayner_route";
import { MICHAEL_EPISODES, MICHAEL_DAILY } from "./michael_route";

export interface Route {
  id: string;              // "estelle" 등 (charId와 동일 규약)
  charId: CharacterId;     // 이 루트의 주인공 캐릭터
  title: string;           // 선택 카드 제목
  desc: string;            // 선택 카드 한 줄 소개
  episodes: Episode[];     // 이 루트의 에피소드 (빈 배열 = 준비 중)
  daily: DailyScene[];     // 이 루트의 일일 미니 씬
  available: boolean;      // false = 준비 중(잠금 티저)
}

export const ROUTES: Route[] = [
  {
    id: "estelle", charId: "estelle",
    title: "릴리아 루트 — 스러진 봄 (개편)",
    desc: "정해진 파멸을 아는 당신이, 일곱 죄가 탐하는 그녀의 봄을 다시 쓴다. [프롤로그+1막 배선]",
    episodes: LILIA_EPISODES,
    daily: LILIA_DAILY,
    available: true,
  },
  {
    id: "rozelin", charId: "rozelin",
    title: "로젤린 루트 — 가시의 값",
    desc: "가시 돋친 가면 뒤, 그녀가 감춰야 했던 진심.",
    episodes: ROZELIN_EPISODES,
    daily: ROZELIN_DAILY,
    available: true,
  },
  // ── 잠금 루트 6종 개방 (story/ 집필 → *_route.ts 데이터화, 2026-07-08) ──
  {
    id: "eden", charId: "eden",
    title: "이든 루트 — 스스로 고른 검",
    desc: "명령이라서 휘두른 검이 끝내 아무도 지키지 못했다. 이번엔, 그 검이 무엇을 지킬지 스스로 고른다.",
    episodes: EDEN_EPISODES, daily: EDEN_DAILY, available: true,
  },
  {
    id: "valen", charId: "valen",
    title: "발렌 루트 — 웃으며 쓰는 왕관",
    desc: "가장 위험한 태양은 왕관을 쓰는 순간 독배를 받는다. 그가 웃으며 왕관을 쓰도록, 새장의 문을 함께 연다.",
    episodes: VALEN_EPISODES, daily: VALEN_DAILY, available: true,
  },
  {
    id: "isolde", charId: "isolde",
    title: "이졸데 루트 — 실패할 자유",
    desc: "완벽만이 존재를 증명한다 믿어 온 흰 백합에게, 완결되지 않은 문장으로도 살아갈 수 있다는 한 마디를.",
    episodes: ISOLDE_EPISODES, daily: ISOLDE_DAILY, available: true,
  },
  {
    id: "adele", charId: "adele",
    title: "클로에 루트 — 불리는 이름",
    desc: "이름 한 번 불리지 못한 채 지워졌던 서녀. 이번엔 당신이 먼저, 그 이름을 부른다.",
    episodes: ADELE_EPISODES, daily: ADELE_DAILY, available: true,
  },
  {
    id: "rayner", charId: "rayner",
    title: "레이너 루트 — 두 맹세의 화해",
    desc: "북부와 황실, 두 개의 맹세를 한 자루 검에 진 기사. 반역자의 오명 속 고립을, 두 맹세가 한 방향을 가리키게.",
    episodes: RAYNER_EPISODES, daily: RAYNER_DAILY, available: true,
  },
  {
    id: "michael", charId: "michael",
    title: "미카엘 루트 — 국경을 넘는 빛",
    desc: "진실을 증언한 죄로 파문당해 국경을 떠돌던 성기사. 맹세와 마음이 양립할 수 있음을 함께 증명한다.",
    episodes: MICHAEL_EPISODES, daily: MICHAEL_DAILY, available: true,
  },
];

export function getRoute(id: string): Route | undefined {
  return ROUTES.find((r) => r.id === id);
}

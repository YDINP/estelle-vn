// 루트(캐릭터 시점) 레지스트리 — 하나의 사건(하이델 음모)을 캐릭터별 시점으로 진행.
// 전체 줄기는 동일하지만, 루트별로 화 구성·일상 씬이 달라진다.
// ⚠️ episodes/daily는 데이터 파일을 import만 (데이터 파일 무수정 원칙).
import { CharacterId } from "./characters";
import { Episode, EPISODES } from "./season1";
import { DailyScene, DAILY_SCENES } from "./daily";
import { ROZELIN_EPISODES, ROZELIN_DAILY } from "./rozelin_route";

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
    title: "에스텔 루트 — 스러진 봄",
    desc: "정해진 파멸을 아는 당신이, 그녀의 봄을 다시 쓴다.",
    episodes: EPISODES,
    daily: DAILY_SCENES,
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
  // ── 남성 캐릭터 루트 (플레이는 추후 — 현재 잠금 티저, 본편엔 카메오 등장) ──
  {
    id: "eden", charId: "eden",
    title: "이든 루트 — ???",
    desc: "황실 근위대 부단장. 검이 지키는 것은 누구인가. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
  {
    id: "valen", charId: "valen",
    title: "발렌 루트 — ???",
    desc: "제국의 제1황태자. 옥좌 곁에서 웃는, 가장 위험한 태양. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
  // ── 신규 캐릭터 루트 (스토리 준비 중 — 잠금 티저). 설정 정본: STORY-BIBLE.md ──
  {
    id: "isolde", charId: "isolde",
    title: "이졸데 루트 — ???",
    desc: "얼음처럼 완전한 후작영애. 완벽이라는 이름의 감옥. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
  {
    id: "adele", charId: "adele",
    title: "클로에 루트 — ???",
    desc: "공작가의 그늘에 핀 서녀. 이름을 불러주는 사람이 없었다. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
  {
    id: "rayner", charId: "rayner",
    title: "레이너 루트 — ???",
    desc: "근위대 기사단장이자 북부대공. 두 개의 맹세, 하나의 검. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
  {
    id: "michael", charId: "michael",
    title: "미카엘 루트 — ???",
    desc: "신성왕국의 성기사. 빛의 맹세는 국경을 넘는가. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
];

export function getRoute(id: string): Route | undefined {
  return ROUTES.find((r) => r.id === id);
}

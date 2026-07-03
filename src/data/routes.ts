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
    desc: "악녀의 가면 뒤, 그녀가 감춰야 했던 진심.",
    episodes: ROZELIN_EPISODES,
    daily: ROZELIN_DAILY,
    available: true,
  },
  // ── 남성 캐릭터 루트 (플레이는 추후 — 현재 잠금 티저, 본편엔 카메오 등장) ──
  {
    id: "lucian", charId: "lucian",
    title: "루시안 루트 — ???",
    desc: "황실 근위기사단장. 검이 지키는 것은 누구인가. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
  {
    id: "noah", charId: "noah",
    title: "노아 루트 — ???",
    desc: "별을 읽는 궁정 점성술사. 어긋난 운명의 관측자. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
  {
    id: "valen", charId: "valen",
    title: "발렌 루트 — ???",
    desc: "붉은 장막 뒤의 위험한 귀족. 적인가, 아군인가. (이야기 준비 중)",
    episodes: [], daily: [], available: false,
  },
];

export function getRoute(id: string): Route | undefined {
  return ROUTES.find((r) => r.id === id);
}

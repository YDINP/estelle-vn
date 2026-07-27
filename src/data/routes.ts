// 루트(캐릭터 시점) 레지스트리 — 하나의 사건(하이델 음모)을 캐릭터별 시점으로 진행.
// 전체 줄기는 동일하지만, 루트별로 화 구성·일상 씬이 달라진다.
//
// ⚠️ 대본은 정적 import 하지 않는다. 8루트 × 30화는 집필 완료 시 만 줄을 넘고,
//    전량을 초기 번들에 넣으면 첫 화면이 그만큼 늦어진다. 여기엔 메타데이터만 두고
//    실제 episodes/daily는 loadRoute()의 동적 import()로 루트별 청크에서 받아온다.
//    (데이터 파일 자체는 무수정 — import 방식만 바꾼다)
import { CharacterId } from "./characters";
import { Episode, EndingType } from "./season1";
import { DailyScene } from "./daily";

/** 루트 1개분 대본 — 동적 로드 결과. */
export interface RouteData {
  episodes: Episode[];
  daily: DailyScene[];
}

export interface Route {
  id: string;              // "lilia" 등 (charId와 동일 규약)
  charId: CharacterId;     // 이 루트의 주인공 캐릭터
  title: string;           // 선택 카드 제목
  desc: string;            // 선택 카드 한 줄 소개
  available: boolean;      // false = 준비 중(잠금 티저)
  /** 대본 청크 로더. 직접 호출하지 말고 loadRoute()를 쓴다(캐시·중복요청 병합). */
  load: () => Promise<RouteData>;
}

export const ROUTES: Route[] = [
  {
    id: "lilia", charId: "lilia",
    title: "릴리아 루트 — 스러진 봄 (개편)",
    desc: "정해진 파멸을 아는 당신이, 일곱 죄가 탐하는 그녀의 봄을 다시 쓴다. [프롤로그+1막 배선]",
    available: true,
    load: () => import("./lilia_route").then((m) => ({ episodes: m.LILIA_EPISODES, daily: m.LILIA_DAILY })),
  },
  {
    id: "marion", charId: "marion",
    title: "마리온 루트 — 값 없는 유대 (개편)",
    desc: "빚에 목이 잡혀 남을 파는 값으로 살아온 붉은 장미. 배역이 아닌 제 이름의 대본을 함께 되찾는다. [프롤로그+1막]",
    available: true,
    load: () => import("./marion_route").then((m) => ({ episodes: m.MARION_EPISODES, daily: m.MARION_DAILY })),
  },
  // ── 잠금 루트 6종 개방 (story/ 집필 → *_route.ts 데이터화, 2026-07-08) ──
  {
    id: "belfor", charId: "belfor",
    title: "벨포르 루트 — 스스로 고른 검 (개편)",
    desc: "묻지 않고 복종한 검이 끝내 아무도 지키지 못했다. 이번엔, 그 검이 무엇을 지킬지 스스로 묻고 고른다. [프롤로그+1막]",
    available: true,
    load: () => import("./belfor_route").then((m) => ({ episodes: m.BELFOR_EPISODES, daily: m.BELFOR_DAILY })),
  },
  {
    id: "belian", charId: "belian",
    title: "벨리안 루트 — 웃으며 쓰는 왕관 (개편)",
    desc: "먼저 삼키지 않으면 삼켜진다 믿어 온 태양. 왕관에 삼켜지지 않고 웃으며 왕관을 쓰도록, 새장의 문을 함께 연다. [프롤로그+1막]",
    available: true,
    load: () => import("./belian_route").then((m) => ({ episodes: m.BELIAN_EPISODES, daily: m.BELIAN_DAILY })),
  },
  {
    id: "lucienne", charId: "lucienne",
    title: "루시엔 루트 — 실패할 자유 (개편)",
    desc: "완벽만이 존재를 증명한다 믿어 온 흰 백합에게, 완결되지 않은 문장으로도 살아갈 수 있다는 한 마디를. [프롤로그+1막]",
    available: true,
    load: () => import("./lucienne_route").then((m) => ({ episodes: m.LUCIENNE_EPISODES, daily: m.LUCIENNE_DAILY })),
  },
  {
    id: "livia", charId: "livia",
    title: "리비아 루트 — 불리는 이름 (개편)",
    desc: "이름 한 번 불리지 못한 채 지워졌던 서녀. 이번엔 당신이 먼저, 그 이름을 부른다. [프롤로그+1막]",
    available: true,
    load: () => import("./livia_route").then((m) => ({ episodes: m.LIVIA_EPISODES, daily: m.LIVIA_DAILY })),
  },
  {
    id: "reimon", charId: "reimon",
    title: "레이먼 루트 — 두 맹세의 화해 (개편)",
    desc: "북부와 황실, 두 개의 맹세를 한 자루 검에 진 기사. 반역자의 오명 속 고립을, 두 맹세가 한 방향을 가리키게. [프롤로그+1막]",
    available: true,
    load: () => import("./reimon_route").then((m) => ({ episodes: m.REIMON_EPISODES, daily: m.REIMON_DAILY })),
  },
  {
    id: "azael", charId: "azael",
    title: "아젤 루트 — 국경을 넘는 빛 (개편)",
    desc: "미혹에 성의를 팔아 타락했던 증인. 빛의 세 맹세를 되찾아, 맹세와 마음이 양립할 수 있음을 함께 증명한다. [프롤로그+1막]",
    available: true,
    load: () => import("./azael_route").then((m) => ({ episodes: m.AZAEL_EPISODES, daily: m.AZAEL_DAILY })),
  },
];

export function getRoute(id: string): Route | undefined {
  return ROUTES.find((r) => r.id === id);
}

// ── 대본 지연 로드 ──
const dataCache = new Map<string, RouteData>();
const inflight = new Map<string, Promise<RouteData | undefined>>();

/** 이미 받아 둔 대본(동기 조회). 없으면 undefined — 로딩 인디케이터 판정용. */
export function loadedRoute(id: string): RouteData | undefined {
  return dataCache.get(id);
}

/** 루트 대본을 받아온다. 캐시 히트면 즉시, 동시 호출은 하나로 병합된다. */
export function loadRoute(id: string): Promise<RouteData | undefined> {
  const hit = dataCache.get(id);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(id);
  if (pending) return pending;
  const route = getRoute(id);
  if (!route) return Promise.resolve(undefined);
  const p = route.load()
    .then((data) => { dataCache.set(id, data); return data; })
    .catch(() => undefined) // 네트워크 실패 → 호출부가 안내 토스트로 처리
    .finally(() => inflight.delete(id));
  inflight.set(id, p);
  return p;
}

/**
 * 유휴 시간에 아직 안 받은 루트 청크를 미리 받아 둔다.
 * 초기 번들에서 빼는 것이 목적이지 네트워크를 아끼는 게 아니므로,
 * 첫 화면이 그려진 뒤 한가할 때 순차로 당겨 두면 진입이 항상 즉시가 된다.
 */
export function prefetchRoutes(onEach?: (id: string) => void): void {
  const queue = ROUTES.filter((r) => r.available && !dataCache.has(r.id)).map((r) => r.id);
  const idle: (cb: () => void) => void =
    typeof requestIdleCallback === "function"
      ? (cb) => requestIdleCallback(() => cb(), { timeout: 2000 })
      : (cb) => setTimeout(cb, 200);
  const step = () => {
    const id = queue.shift();
    if (!id) return;
    loadRoute(id).then(() => { onEach?.(id); idle(step); });
  };
  idle(step);
}

// ── 엔딩 도감 메타데이터 ──
// 엔딩 대본 자체는 각 루트 파일의 Gate(pass/fail/trueSteps)에 있고, 도감에 쓸
// 제목·한 줄 요약은 대본에서 뽑아낼 수 없어(= Step 배열엔 제목 개념이 없다) 여기에 둔다.
// ⚠️ 루트 파일은 집필팀 소유라 이 표는 엔진팀이 관리한다. 문구는 집필 확정본으로 갱신할 것.
export interface EndingInfo {
  title: string;
  summary: string; // 도감 한 줄 요약 (획득 후에만 노출)
}

const E = (title: string, summary: string): EndingInfo => ({ title, summary });

export const ENDING_INFO: Record<string, Record<EndingType, EndingInfo>> = {
  lilia: {
    good: E("다시 피는 봄", "탑에 갇히지 않은 봄. 그녀는 제 정원을 제 손으로 가꾼다."),
    bad: E("두 번째 겨울", "덫을 하나 놓쳤다. 봄은 같은 자리에서 한 번 더 꺾인다."),
    true: E("웃으면서 인사하기", "여덟 개의 겨울이 모두 봄이 된 뒤에야 닿는, 약속의 대구."),
  },
  marion: {
    good: E("제 이름의 대본", "배역을 벗은 붉은 장미가, 처음으로 자기 대사를 쓴다."),
    bad: E("커튼콜 없는 퇴장", "값이 매겨진 이름은 끝내 팔려 나가고, 배웅하는 이는 없다."),
    true: E("무대를 넘어", "모든 배역이 제 이름을 되찾은 밤, 막은 스스로 오른다."),
  },
  belfor: {
    good: E("스스로 고른 검", "묻지 않던 검이 처음으로 묻는다 — 무엇을 지킬 것인가."),
    bad: E("꺾인 검", "명령을 집행한 손이 끝내 제 검을 부러뜨린다."),
    true: E("맹세의 주인", "여덟 개의 결말을 본 자만이 아는, 복종이 아닌 충성."),
  },
  belian: {
    good: E("웃으며 쓰는 왕관", "삼키지 않고도 쥘 수 있는 왕관. 태양은 새장을 나온다."),
    bad: E("삼켜진 태양", "독배를 비운 황태자는 살아남아, 웃는 법을 잊는다."),
    true: E("빈 옥좌의 봄", "여덟 겨울의 기억이 옥좌보다 무거워지는 밤."),
  },
  lucienne: {
    good: E("실패할 자유", "완결되지 않은 문장으로도 살아갈 수 있다는 한 마디."),
    bad: E("완벽의 감옥", "단 한 번의 실수가 흰 백합을 스스로 가둔다."),
    true: E("금 간 자리의 빛", "모든 결말을 본 뒤에야 보이는, 금 사이로 드는 빛."),
  },
  livia: {
    good: E("불리는 이름", "그늘의 서녀가 제 이름으로 불리며 기록에 남는다."),
    bad: E("지워진 이름", "이름 한 번 불리지 못한 채, 그녀는 기록에서 사라진다."),
    true: E("이름을 부르는 밤", "여덟 개의 이름을 모두 부른 자에게만 열리는 결말."),
  },
  reimon: {
    good: E("두 맹세의 화해", "북부와 황실, 두 맹세가 처음으로 한 방향을 가리킨다."),
    bad: E("눈 속의 맹세", "반역자의 오명 속에서, 검은 홀로 얼어붙는다."),
    true: E("한 자루의 답", "모든 겨울을 본 검이 마침내 제 답을 말한다."),
  },
  azael: {
    good: E("국경을 넘는 빛", "맹세와 마음이 양립할 수 있음을 스스로 증명한다."),
    bad: E("빛을 판 새벽", "미혹에 성의를 팔고, 증인은 맹세를 잃은 채 떠돈다."),
    true: E("세 번째 맹세", "여덟 결말의 증인이 되어서야 되찾는, 빛의 마지막 맹세."),
  },
};

export function endingInfo(routeId: string, type: EndingType): EndingInfo | undefined {
  return ENDING_INFO[routeId]?.[type];
}

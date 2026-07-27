import { CharacterId } from "./characters";

export interface SpecialIllust {
  id: string;
  char: CharacterId;
  title: string;
  image: string;
  affection: number;
  placeholder: boolean;
}

const P = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const SPECIAL_ILLUSTS: SpecialIllust[] = [
  // ── 릴리아: 구 스토리 잔재 CG(public/cg/lilia) 재활용. 미분류 orphan 정리(2026-07-27).
  {
    id: "sp_lilia_10",
    char: "lilia",
    title: "무도회의 밤",
    image: P("cg/lilia/ball_night.webp"),
    affection: 10,
    placeholder: true,
  },
  {
    id: "sp_estelle_20",
    char: "lilia",
    title: "온실의 봄빛",
    image: P("cg/lilia/teatime.webp"),
    affection: 20,
    placeholder: true,
  },
  {
    id: "sp_lilia_30",
    char: "lilia",
    title: "장미 정원의 고백",
    image: P("cg/lilia/garden_rose.webp"),
    affection: 30,
    placeholder: true,
  },
  {
    id: "sp_lilia_40",
    char: "lilia",
    title: "빗속의 다정함",
    image: P("cg/lilia/rain_kindness.webp"),
    affection: 40,
    placeholder: true,
  },
  {
    id: "sp_estelle_50",
    char: "lilia",
    title: "비밀 정원의 약속",
    image: P("cg/lilia/garden_care.webp"),
    affection: 50,
    placeholder: true,
  },
  {
    id: "sp_lilia_60",
    char: "lilia",
    title: "피아노 선율의 오후",
    image: P("cg/lilia/piano.webp"),
    affection: 60,
    placeholder: true,
  },
  {
    id: "sp_lilia_70",
    char: "lilia",
    title: "서재의 노을",
    image: P("cg/lilia/study_dusk.webp"),
    affection: 70,
    placeholder: true,
  },
  {
    id: "sp_estelle_80",
    char: "lilia",
    title: "별빛 아래의 재회",
    image: P("cg/lilia/white_rose.webp"),
    affection: 80,
    placeholder: true,
  },
  {
    id: "sp_lilia_90",
    char: "lilia",
    title: "달빛 발코니",
    image: P("cg/lilia/night_canal.webp"),
    affection: 90,
    placeholder: true,
  },
  {
    id: "sp_lilia_95",
    char: "lilia",
    title: "철창 너머의 눈물",
    image: P("cg/lilia/tears_rain.webp"),
    affection: 95,
    placeholder: true,
  },
  {
    id: "sp_lilia_100",
    char: "lilia",
    title: "다시 잡은 손, 약속",
    image: P("cg/lilia/promise_hand.webp"),
    affection: 100,
    placeholder: true,
  },
  // ⚠️ cg/lilia/reaching_hand.webp는 promise_hand와 구도가 거의 동일한 중복본이라
  //    보류(등재 안 함) — 신규 루트 확장 시 별도 장면으로 교체 검토.
  // ⚠️ cg/lilia/title_hero.webp는 타이틀 화면 히어로 이미지 후보 — 도감이 아닌
  //    타이틀 배경 용도로 별도 제안(ILLUST-CG-LIST.md 참고). 여기 등재 안 함.

  // ── 마리온: 구 스토리 잔재 CG(public/cg/marion) 재활용.
  {
    id: "sp_marion_10",
    char: "marion",
    title: "은밀한 서신",
    image: P("cg/marion/letters.webp"),
    affection: 10,
    placeholder: true,
  },
  {
    id: "sp_rozelin_20",
    char: "marion",
    title: "가면 아래의 미소",
    image: P("cg/marion/masquerade.webp"),
    affection: 20,
    placeholder: true,
  },
  {
    id: "sp_marion_30",
    char: "marion",
    title: "음모의 서재",
    image: P("cg/marion/conspiracy.webp"),
    affection: 30,
    placeholder: true,
  },
  {
    id: "sp_rozelin_50",
    char: "marion",
    title: "붉은 정원의 진심",
    image: P("cg/marion/tea_hand.webp"),
    affection: 50,
    placeholder: true,
  },
  {
    id: "sp_rozelin_80",
    char: "marion",
    title: "버려진 왕관의 꽃",
    image: P("cg/marion/ruins_rose.webp"),
    affection: 80,
    placeholder: true,
  },
  {
    id: "sp_marion_100",
    char: "marion",
    title: "빗속에 젖은 눈물",
    image: P("cg/marion/tears_rain.webp"),
    affection: 100,
    placeholder: true,
  },

  // ── 벨리안: 구 스토리 잔재 CG(public/cg/belian) 재활용. 기존 1개뿐이던 티어 보강.
  {
    id: "sp_belian_10",
    char: "belian",
    title: "노을의 건배",
    image: P("cg/belian/dusk_toast.webp"),
    affection: 10,
    placeholder: true,
  },
  {
    id: "sp_belian_20",
    char: "belian",
    title: "창가의 서신",
    image: P("cg/belian/window_letter.webp"),
    affection: 20,
    placeholder: true,
  },
  {
    id: "sp_belian_30",
    char: "belian",
    title: "장미와 편지",
    image: P("cg/belian/rose_letter.webp"),
    affection: 30,
    placeholder: true,
  },
  {
    id: "sp_valen_50",
    char: "belian",
    title: "달빛 연회의 초대",
    image: P("cg/belian/moon_feast.webp"),
    affection: 50,
    placeholder: true,
  },
  {
    id: "sp_belian_70",
    char: "belian",
    title: "가면 아래 미소",
    image: P("cg/belian/masquerade.webp"),
    affection: 70,
    placeholder: true,
  },
  {
    id: "sp_belian_100",
    char: "belian",
    title: "밤의 옥좌",
    image: P("cg/belian/throne_night.webp"),
    affection: 100,
    placeholder: true,
  },
];

export function specialIllustFile(illust: SpecialIllust): string {
  return illust.image;
}

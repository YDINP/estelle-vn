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
  {
    id: "sp_estelle_20",
    char: "lilia",
    title: "온실의 봄빛",
    image: P("cg/lilia/teatime.webp"),
    affection: 20,
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
    id: "sp_estelle_80",
    char: "lilia",
    title: "별빛 아래의 재회",
    image: P("cg/lilia/white_rose.webp"),
    affection: 80,
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
    id: "sp_valen_50",
    char: "belian",
    title: "달빛 연회의 초대",
    image: P("cg/belian/moon_feast.webp"),
    affection: 50,
    placeholder: true,
  },
];

export function specialIllustFile(illust: SpecialIllust): string {
  return illust.image;
}

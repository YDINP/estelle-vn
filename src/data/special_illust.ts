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
    char: "estelle",
    title: "둘만의 봄빛",
    image: P("cg/estelle/teatime.jpg"),
    affection: 20,
    placeholder: true,
  },
  {
    id: "sp_estelle_50",
    char: "estelle",
    title: "비밀 정원의 약속",
    image: P("cg/estelle/garden_care.jpg"),
    affection: 50,
    placeholder: true,
  },
  {
    id: "sp_estelle_80",
    char: "estelle",
    title: "별빛 아래의 재회",
    image: P("cg/estelle/white_rose.jpg"),
    affection: 80,
    placeholder: true,
  },
  {
    id: "sp_rozelin_20",
    char: "rozelin",
    title: "가면 아래의 미소",
    image: P("cg/rozelin/masquerade.jpg"),
    affection: 20,
    placeholder: true,
  },
  {
    id: "sp_rozelin_50",
    char: "rozelin",
    title: "붉은 정원의 진심",
    image: P("cg/rozelin/tea_hand.jpg"),
    affection: 50,
    placeholder: true,
  },
  {
    id: "sp_rozelin_80",
    char: "rozelin",
    title: "버려진 왕관의 꽃",
    image: P("cg/rozelin/ruins_rose.jpg"),
    affection: 80,
    placeholder: true,
  },
  {
    id: "sp_valen_50",
    char: "valen",
    title: "달빛 연회의 초대",
    image: P("cg/valen/moon_feast.jpg"),
    affection: 50,
    placeholder: true,
  },
];

export function specialIllustFile(illust: SpecialIllust): string {
  return illust.image;
}

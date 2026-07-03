// 코스메틱 카탈로그 — 슬롯 기반 직구매(가챠 아님).
// 구매 시 코인 소모, 소유 후 교체는 무료.

export type Slot = "outfit" | "accessory";

export interface Cosmetic {
  id: string;
  name: string;
  slot: Slot;
  price: number;      // 코인. 0 = 기본 제공(무료 소유)
  unlockTier: number; // 이 호감도 티어 이상에서 상점에 노출
  /** outfit: 옷 색상 / accessory: 이모지 */
  visual: string;
  /** true면 소유 전까지 상점 목록에서 숨김(한정/이벤트 지급 전용) */
  hidden?: boolean;
}

export const COSMETICS: Cosmetic[] = [
  // 의상 (색상 레이어)
  { id: "outfit_basic",  name: "평상 드레스", slot: "outfit", price: 0,   unlockTier: 0, visual: "#b8aec6" },
  { id: "outfit_casual", name: "산책 드레스", slot: "outfit", price: 120, unlockTier: 0, visual: "#c98ea6" },
  { id: "outfit_dress",  name: "무도회 가운", slot: "outfit", price: 260, unlockTier: 1, visual: "#9b6ec8" },
  { id: "outfit_party",  name: "대관식 예복", slot: "outfit", price: 500, unlockTier: 2, visual: "#e9c46a" },

  // 악세서리 (이모지 레이어)
  { id: "acc_none",   name: "없음",     slot: "accessory", price: 0,   unlockTier: 0, visual: "" },
  { id: "acc_ribbon", name: "리본핀",   slot: "accessory", price: 80,  unlockTier: 0, visual: "🎀" },
  { id: "acc_rose",   name: "장미 장식", slot: "accessory", price: 150, unlockTier: 1, visual: "🌹" },
  { id: "acc_tiara",  name: "티아라",   slot: "accessory", price: 320, unlockTier: 2, visual: "👑" },

  // 한정 지급(7일 연속 방문) — 소유 전까지 상점에 숨김
  { id: "acc_star",   name: "별의 머리핀", slot: "accessory", price: 0, unlockTier: 0, visual: "⭐", hidden: true },
];

export const DEFAULT_OWNED = ["outfit_basic", "acc_none"];
export const DEFAULT_EQUIPPED = { outfit: "outfit_basic", accessory: "acc_none" };

export function getCosmetic(id: string): Cosmetic | undefined {
  return COSMETICS.find((c) => c.id === id);
}

// 리워드 광고 어댑터.
//
// ⚠️ 앱인토스 정책: AdMob 등 서드파티 광고 SDK 직접 연동 불가.
//    반드시 앱인토스 "인앱광고 2.0" 통합 SDK를 통해서만 노출.
//    문서: https://developers-apps-in-toss.toss.im/ads/develop.html
//    UI 문구 규칙: "클릭 시 보상" 금지 → "광고 시청 후 코인 지급" 포맷만.
//
// 이 모듈은 seam(교체점)이다. 로컬 개발에선 mock으로 동작하고,
// 실제 앱인토스 SDK가 감지되면 그쪽으로 위임한다.

export type AdResult = "rewarded" | "dismissed" | "failed";

// 실제 SDK 전역 인터페이스 (연동 시 확정. 현재는 존재 여부만 추정)
interface AitAds {
  showRewardedAd?: (opts?: { unitId?: string }) => Promise<{ isRewarded: boolean }>;
  showInterstitialAd?: (opts?: { unitId?: string }) => Promise<void>;
}
declare global {
  interface Window {
    __aitAds?: AitAds;
  }
}

function realSdk(): AitAds | undefined {
  const a = window.__aitAds;
  if (!a) return undefined;
  return typeof a.showRewardedAd === "function" ||
    typeof a.showInterstitialAd === "function"
    ? a
    : undefined;
}

/**
 * 리워드 광고 노출. 시청 완료 시 "rewarded".
 * @param onReadyToShow mock UI를 띄우기 위한 콜백(실 SDK에선 무시됨)
 */
export async function showRewardedAd(
  onReadyToShow?: () => Promise<void>
): Promise<AdResult> {
  const sdk = realSdk();
  if (sdk?.showRewardedAd) {
    try {
      const r = await sdk.showRewardedAd({ unitId: "REWARDED_DEFAULT" });
      return r.isRewarded ? "rewarded" : "dismissed";
    } catch {
      return "failed";
    }
  }
  // ── mock: 로컬 개발용 가짜 광고 ──
  if (onReadyToShow) await onReadyToShow();
  return "rewarded";
}

/**
 * 전면(Interstitial) 광고 노출.
 *
 * ⚠️ 앱인토스 정책: 전면 광고는 로딩/인트로/컷신 등 '진행 중' 화면에 노출 금지.
 *    → 반드시 콘텐츠 '완료 결과'가 표시된 이후(예: 에피소드 완료·보상 지급 후)에만 호출한다.
 *    보상형과 달리 결과값이 없으므로 성공/실패와 무관하게 진행을 막지 않는다.
 *
 * @param onReadyToShow mock UI를 띄우기 위한 콜백(실 SDK에선 무시됨)
 */
export async function showInterstitialAd(
  onReadyToShow?: () => Promise<void>
): Promise<void> {
  const sdk = realSdk();
  if (sdk?.showInterstitialAd) {
    try {
      await sdk.showInterstitialAd({ unitId: "INTERSTITIAL_DEFAULT" });
    } catch {
      /* 전면 광고 노출 실패는 조용히 무시 (진행 차단 금지) */
    }
    return;
  }
  // ── mock: 로컬 개발용 가짜 전면 광고 ──
  if (onReadyToShow) await onReadyToShow();
}

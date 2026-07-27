// DOM 유틸 — 조회·이벤트 위임·문자열 이스케이프.
// 이 프로젝트는 프레임워크 없이 템플릿 문자열로 렌더하므로,
// (1) 사용자/데이터 문자열은 반드시 esc()로 감싸고
// (2) 동적 리스트는 매 렌더 재바인딩 대신 컨테이너 1회 위임으로 처리한다.

export { $ } from "./context";

/** 템플릿 문자열에 값을 끼워 넣을 때의 HTML 이스케이프. */
export function esc(v: unknown): string {
  return String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

/**
 * 이벤트 위임 — 컨테이너에 리스너 1개만 붙이고, 내부 항목은 selector로 매칭한다.
 * 리스트를 다시 그려도 재바인딩이 필요 없다(리렌더 비용·리스너 누수 제거).
 */
export function delegate(
  container: HTMLElement,
  selector: string,
  type: string,
  handler: (el: HTMLElement, ev: Event) => void
): void {
  container.addEventListener(type, (ev) => {
    const target = ev.target as HTMLElement | null;
    const el = target?.closest(selector) as HTMLElement | null;
    if (el && container.contains(el)) handler(el, ev);
  });
}

/** 이미지 태그 공통 힌트 — 도감 그리드처럼 화면 밖 항목이 많은 리스트용. */
export const LAZY_IMG = `loading="lazy" decoding="async"`;
/** 즉시 필요한 이미지(VN 초상·CG) — 지연 로드는 하지 않되 디코드는 비동기로. */
export const EAGER_IMG = `decoding="async"`;

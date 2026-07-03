// GitHub Pages 하위경로(/estelle-vn/) 빌드 검증 — preview 서버 대상
// VN 부팅 + 포트레이트/CSS 배경 로드에 404 없는지 확인
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL || "http://localhost:5181/estelle-vn/";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
const failed = [];
p.on("pageerror", (e) => errors.push(String(e)));
p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

await p.goto(BASE + "?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
await p.waitForTimeout(800);
const portrait = await p.$eval("#vnPortrait", (el) => ({ src: el.src, ok: el.complete && el.naturalWidth > 0 }));
console.log("VN 포트레이트:", portrait.src);
console.log(`[${portrait.ok ? "PASS" : "FAIL"}] 포트레이트 이미지 로드 (하위경로)`);
console.log(`[${portrait.src.includes("/estelle-vn/char/") ? "PASS" : "FAIL"}] 경로에 base 반영`);
// 대사 패널 배경(--u-panel) 적용 확인
const panelBg = await p.$eval(".panel", (el) => getComputedStyle(el).backgroundImage);
console.log(`[${panelBg.includes("/estelle-vn/ui/panel.png") ? "PASS" : "FAIL"}] 패널 배경 base 반영 (${panelBg.slice(0, 80)})`);
await p.screenshot({ path: "qa-shots/subpath-vn.png" });
console.log(`[${failed.length === 0 ? "PASS" : "FAIL"}] 4xx/5xx 없음`, failed.length ? failed : "");
console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(portrait.ok && !failed.length && !errors.length ? 0 : 1);

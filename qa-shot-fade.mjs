// 홈(흉상+페이드) / VN(하단 페이드) 시각 확인 샷
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:5180/?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.waitForSelector(".route-card");
await p.click('[data-route="estelle"]');
await p.waitForSelector("#vn:not(.hidden)", { timeout: 4000 });
await p.waitForTimeout(600);
await p.screenshot({ path: "qa-shots/fade-vn.png" }); // VN 포트레이트 페이드
// VN 나가기 → 홈 (흉상 포트레이트)
await p.click("#vnExit");
await p.waitForTimeout(200);
const confirm = await p.$("#confirmYes");
if (confirm) await confirm.click();
await p.waitForTimeout(600);
await p.screenshot({ path: "qa-shots/fade-home.png" });
const src = await p.$eval("#charImg", (el) => el.src);
console.log("홈 포트레이트:", src, "(bust 기대)");
await b.close();

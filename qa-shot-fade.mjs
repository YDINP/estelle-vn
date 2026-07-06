// 배치 프레이밍 시각 확인 — VN(허리 위 150%)/홈(150%)/메인 루트카드(230%)
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:5180/?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
// 온보딩: 에스텔 루트 자동 진입 + 1화 자동재생
await p.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
await p.waitForTimeout(600);
// 대사 몇 개 진행해 포트레이트 노출
for (let i = 0; i < 4; i++) {
  await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
  await p.waitForTimeout(160);
}
await p.screenshot({ path: "qa-shots/fade-vn.png" });
// VN 나가기 → 홈
await p.click("#vnExit");
await p.waitForTimeout(200);
const confirm = await p.$("#confirmYes");
if (confirm) await confirm.click();
await p.waitForTimeout(600);
await p.screenshot({ path: "qa-shots/fade-home.png" });
// 메인 화면 루트카드
await p.click("#btnMain");
await p.waitForSelector(".route-card", { timeout: 5000 });
await p.waitForTimeout(400);
await p.$eval(".route-card", (el) => el.scrollIntoView({ block: "start" }));
await p.waitForTimeout(200);
await p.screenshot({ path: "qa-shots/fade-cards.png" });
console.log("ok");
await b.close();

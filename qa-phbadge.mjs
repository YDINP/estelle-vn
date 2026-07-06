// 플레이스홀더 배지 QA
// ① VN: 에스텔(bust 완비) 포트레이트에선 배지 숨김
// ② 메인 루트카드: bust 없는 남캐 2종(루시안/노아)만 '임시' 배지 (발렌은 흉상 구축됨)
import { chromium } from "playwright";

const BASE = "http://localhost:5180/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(BASE + "?epwait=5");
await page.evaluate(() => localStorage.clear());
await page.reload();
// 온보딩: 첫 실행은 메인 없이 에스텔 루트 자동 진입(1화 자동재생)
await page.waitForSelector("#vn:not(.hidden)", { timeout: 5000 });
await page.waitForTimeout(300);
const hiddenOnEstelle = await page.$eval("#vnPh", (el) => el.classList.contains("hidden"));
console.log(`[${hiddenOnEstelle ? "PASS" : "FAIL"}] 에스텔 VN 포트레이트 — 배지 숨김`);
await page.screenshot({ path: "qa-shots/ph-vn.png" });

// VN 나가기 → 홈 → 🏰 메인 화면에서 루트카드 배지 확인
await page.click("#vnExit");
await page.waitForTimeout(200);
{ const c = await page.$("#confirmYes"); if (c) await c.click(); }
await page.waitForTimeout(400);
await page.click("#btnMain");
await page.waitForSelector(".route-card", { timeout: 5000 });
const cards = await page.$$eval(".route-card", (els) =>
  els.map((el) => ({
    title: el.querySelector(".rc-title")?.textContent?.trim(),
    ph: !!el.querySelector(".ph-badge"),
  }))
);
console.log("루트카드:", JSON.stringify(cards));
// 임시 배지 = bust 미보유(노아뿐 — 루시안은 bust 11종 구축됨).
// 아트 자체가 없는 이졸데/아델은 ? 실루엣이라 배지 없음.
const okCards = cards.length === 7 && cards.filter((c) => c.ph).length === 1 &&
  cards[3].ph === true; // 노아
console.log(`[${okCards ? "PASS" : "FAIL"}] 카드 7장 / 배지 1(노아)`);
await page.screenshot({ path: "qa-shots/ph-main.png" });
console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await browser.close();
process.exit(okCards && hiddenOnEstelle && !errors.length ? 0 : 1);

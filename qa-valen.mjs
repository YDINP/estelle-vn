// 발렌 에셋 QA (구 qa-sedric 대체 — 세드릭 캐릭터 삭제됨)
// 발렌 탭: 표정8(bust) + 전신8 + CG6(잠금 티저) / 세드릭 탭 부재 확인
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));

await p.goto("http://localhost:5180/?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.waitForSelector("#vn:not(.hidden)");
await p.click("#vnExit");
await p.waitForTimeout(200);
const c = await p.$("#confirmYes");
if (c) await c.click();
await p.waitForTimeout(400);
await p.click("#btnCollect");
await p.waitForSelector("#collect:not(.hidden)");
await p.waitForTimeout(500);

const tabs = await p.$$eval("#collectTabs .tab", (els) => els.map((e) => e.textContent.trim()));
console.log("탭:", JSON.stringify(tabs));
console.log(`[${!tabs.includes("세드릭") ? "PASS" : "FAIL"}] 세드릭 탭 부재`);

await p.click('[data-ctab="valen"]');
await p.waitForTimeout(400);
const val = await p.evaluate(() => ({
  grids: [...document.querySelectorAll("#illustWrap .igrid")].map((g) => g.children.length),
  lockedCg: document.querySelectorAll("#illustWrap .icell.cg.locked").length,
}));
console.log("발렌 탭:", JSON.stringify(val));
const okVal = val.grids[0] === 8 && val.grids[1] === 8 && val.grids[2] === 6 && val.lockedCg >= 6;
console.log(`[${okVal ? "PASS" : "FAIL"}] 발렌 표정 8 / 전신 8 / CG 6(전부 잠금)`);

const files = [
  "/char/valen/soft.png", "/char/valen/bust_soft.png",
  "/cg/valen/throne_night.jpg", "/cg/valen/moon_feast.jpg",
];
let okFiles = true;
for (const f of files) {
  const r = await p.request.get("http://localhost:5180" + f);
  if (!r.ok()) okFiles = false;
  console.log(`[${r.ok() ? "PASS" : "FAIL"}] ${f} → ${r.status()}`);
}
console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(!tabs.includes("세드릭") && okVal && okFiles && !errors.length ? 0 : 1);

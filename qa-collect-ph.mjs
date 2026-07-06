// 도감 placeholder QA — 이졸데/아델 탭 존재 + 준비 중 placeholder 렌더
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
{ const c = await p.$("#confirmYes"); if (c) await c.click(); }
await p.waitForTimeout(400);
await p.click("#btnCollect");
await p.waitForSelector("#collect:not(.hidden)");
await p.waitForTimeout(500);

const tabs = await p.$$eval("#collectTabs .tab", (els) => els.map((e) => e.textContent.trim()));
console.log("탭:", JSON.stringify(tabs));
const okTabs = tabs.includes("이졸데") && tabs.includes("아델");
console.log(`[${okTabs ? "PASS" : "FAIL"}] 이졸데/아델 탭 존재`);

await p.click('[data-ctab="isolde"]');
await p.waitForTimeout(300);
const iso = await p.evaluate(() => ({
  count: document.querySelector("#collectCount").textContent,
  qcells: document.querySelectorAll("#illustWrap .icell.unknown").length,
  tease: document.querySelector("#illustWrap .collect-tease")?.textContent ?? "",
  imgs: document.querySelectorAll("#illustWrap img").length,
}));
console.log("이졸데 탭:", JSON.stringify(iso));
const okIso = iso.count === "0/?" && iso.qcells === 4 && iso.tease.includes("준비 중") && iso.imgs === 0;
console.log(`[${okIso ? "PASS" : "FAIL"}] placeholder 렌더 (0/? · ?셀 4 · 문구 · img 0=404 없음)`);
await p.screenshot({ path: "qa-shots/collect-ph.png" });

await p.click('[data-ctab="adele"]');
await p.waitForTimeout(300);
const ade = await p.evaluate(() => document.querySelectorAll("#illustWrap .icell.unknown").length);
console.log(`[${ade === 4 ? "PASS" : "FAIL"}] 아델 탭 placeholder`);
// 기존 탭 정상 (에스텔)
await p.click('[data-ctab="estelle"]');
await p.waitForTimeout(300);
const est = await p.evaluate(() => document.querySelectorAll("#illustWrap .icell").length);
console.log(`[${est > 20 ? "PASS" : "FAIL"}] 에스텔 탭 기존 도감 정상 (${est}칸)`);
console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(okTabs && okIso && ade === 4 && est > 20 && !errors.length ? 0 : 1);

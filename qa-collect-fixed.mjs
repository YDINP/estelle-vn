// 도감 시트 고정 높이 QA — 내용량이 다른 두 탭(에스텔 34칸 vs 노아 2칸)에서
// 시트 rect 동일 + 헤더/탭 위치 고정 + 스크롤은 #illustWrap만
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));

await p.goto("http://localhost:5180/?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
// 온보딩: 첫 실행은 에스텔 루트 자동 진입 + 1화 자동재생
await p.waitForSelector("#vn:not(.hidden)");
await p.click("#vnExit");
await p.waitForTimeout(200);
const confirm = await p.$("#confirmYes");
if (confirm) await confirm.click();
await p.waitForTimeout(400);
await p.click("#btnCollect");
await p.waitForSelector("#collect:not(.hidden)");
await p.waitForTimeout(500); // 시트 열림 애니메이션(up .25s) 종료 대기

async function metrics() {
  return p.evaluate(() => {
    const sheet = document.querySelector("#collect .sheet").getBoundingClientRect();
    const head = document.querySelector("#collect .sheet-head").getBoundingClientRect();
    const tabs = document.querySelector("#collect .tabs").getBoundingClientRect();
    const wrap = document.querySelector("#illustWrap");
    return {
      sheetTop: Math.round(sheet.top), sheetH: Math.round(sheet.height),
      headTop: Math.round(head.top), tabsTop: Math.round(tabs.top),
      scrollable: wrap.scrollHeight > wrap.clientHeight,
      wrapOverflowY: getComputedStyle(wrap).overflowY,
    };
  });
}

const est = await metrics();
await p.screenshot({ path: "qa-shots/collect-estelle.png" });
// 노아 탭 (내용 최소)
await p.click('[data-ctab="noah"]');
await p.waitForTimeout(300);
const noah = await metrics();
await p.screenshot({ path: "qa-shots/collect-noah.png" });

console.log("에스텔:", JSON.stringify(est));
console.log("노아  :", JSON.stringify(noah));
const sameRect = est.sheetTop === noah.sheetTop && est.sheetH === noah.sheetH &&
  est.headTop === noah.headTop && est.tabsTop === noah.tabsTop;
console.log(`[${sameRect ? "PASS" : "FAIL"}] 시트 높이/헤더/탭 위치 캐릭터 무관 동일`);
console.log(`[${est.wrapOverflowY === "auto" ? "PASS" : "FAIL"}] 스크롤 = #illustWrap (overflow-y:auto)`);
console.log(`[${est.scrollable ? "PASS" : "FAIL"}] 에스텔 탭 내용 스크롤 가능`);
// 에스텔 탭에서 스크롤해도 헤더 고정 확인
await p.click('[data-ctab="estelle"]');
await p.waitForTimeout(300);
await p.evaluate(() => { document.querySelector("#illustWrap").scrollTop = 400; });
await p.waitForTimeout(200);
const after = await metrics();
console.log(`[${after.headTop === est.headTop ? "PASS" : "FAIL"}] 스크롤 후에도 헤더 위치 고정`);
await p.screenshot({ path: "qa-shots/collect-scrolled.png" });
console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();

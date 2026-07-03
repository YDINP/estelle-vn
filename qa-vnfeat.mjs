// VN 신기능 QA — ① 메인 프롤로그 보기 ② 선택지 중앙 오버레이 ③ 대화 기록(백로그)
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL || "http://localhost:5180/";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
const results = [];
const ok = (name, pass, detail = "") => {
  results.push(pass);
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? " — " + detail : ""}`);
};

await p.goto(BASE + "?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
// 온보딩: 에스텔 1화 자동재생
await p.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
await p.waitForTimeout(500);

// ── ③ 백로그: 대사 3줄 진행 후 기록 확인 ──
for (let i = 0; i < 3; i++) {
  await p.click("#vn", { position: { x: 195, y: 250 }, force: true }); // 타이핑 완성
  await p.waitForTimeout(150);
  await p.click("#vn", { position: { x: 195, y: 250 }, force: true }); // 다음 대사
  await p.waitForTimeout(250);
}
const lastShown = await p.$eval("#vnText", (el) => el.textContent.trim());
await p.click("#vnLogBtn");
await p.waitForTimeout(300);
const blOpen = await p.$eval("#vnBacklog", (el) => !el.classList.contains("hidden"));
const blItems = await p.$$eval("#vnBacklog .bl-item", (els) =>
  els.map((el) => el.querySelector(".bl-text").textContent.trim()));
ok("백로그 열림 + 기록 존재", blOpen && blItems.length >= 3, `${blItems.length}건`);
// 백로그는 전체 문장 저장 — 화면은 타이핑 중일 수 있으므로 접두사 비교
ok("백로그 마지막 항목 = 현재 대사", blItems[blItems.length - 1].startsWith(lastShown),
  JSON.stringify(blItems[blItems.length - 1]).slice(0, 40));
await p.screenshot({ path: "qa-shots/vnfeat-backlog.png" });
await p.click("#vnBacklog"); // 탭으로 닫기
await p.waitForTimeout(200);
const blClosed = await p.$eval("#vnBacklog", (el) => el.classList.contains("hidden"));
ok("백로그 탭으로 닫힘", blClosed);
// 닫힌 뒤 VN 진행 정상
const before = await p.$eval("#vnText", (el) => el.textContent);
await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
await p.waitForTimeout(400);
await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
await p.waitForTimeout(400);
const after = await p.$eval("#vnText", (el) => el.textContent);
ok("백로그 닫은 뒤 진행 정상", after !== before);

// ── ② 선택지 중앙 오버레이: 선택지 나올 때까지 진행 ──
let choiceSeen = false;
for (let i = 0; i < 60 && !choiceSeen; i++) {
  const open = await p.$eval("#vnChoices", (el) => !el.classList.contains("hidden"));
  if (open) { choiceSeen = true; break; }
  await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
  await p.waitForTimeout(140);
}
ok("선택지 등장", choiceSeen);
if (choiceSeen) {
  const geo = await p.$eval("#vnChoices", (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { w: r.width, h: r.height, bg: cs.backgroundColor, pos: cs.position,
      prompt: !!el.querySelector(".vn-choice-prompt"), btns: el.querySelectorAll("[data-opt]").length };
  });
  ok("풀스크린 오버레이(검은 반투명)", geo.pos === "absolute" && geo.w >= 380 && geo.h >= 800 &&
    geo.bg.includes("rgba(0, 0, 0"), `${geo.w}x${geo.h} ${geo.bg}`);
  ok("프롬프트+선택 버튼 표시", geo.prompt && geo.btns >= 2, `버튼 ${geo.btns}`);
  await p.screenshot({ path: "qa-shots/vnfeat-choice.png" });
  await p.click("#vnChoices [data-opt='0']");
  await p.waitForTimeout(300);
  const closed = await p.$eval("#vnChoices", (el) => el.classList.contains("hidden"));
  ok("선택 후 오버레이 닫힘+진행", closed);
}

// ── ① 프롤로그 보기: VN 나가기 → 메인 → 프롤로그 재생 ──
await p.click("#vnExit");
await p.waitForTimeout(200);
{ const c = await p.$("#confirmYes"); if (c) await c.click(); }
await p.waitForTimeout(400);
await p.click("#btnMain");
await p.waitForSelector("#btnPrologue", { timeout: 5000 });
await p.click("#btnPrologue");
await p.waitForSelector("#vn:not(.hidden)", { timeout: 5000 });
await p.waitForTimeout(500);
const proText = await p.$eval("#vnText", (el) => el.textContent.trim());
ok("프롤로그 재생 시작", proText.length > 0, JSON.stringify(proText.slice(0, 24)));
await p.screenshot({ path: "qa-shots/vnfeat-prologue.png" });
// 완주 (8스텝)
for (let i = 0; i < 24; i++) {
  const done = await p.$eval("#vn", (el) => el.classList.contains("hidden"));
  if (done) break;
  await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
  await p.waitForTimeout(140);
}
const backToMain = await p.$eval("#mainScreen", (el) => !el.classList.contains("hidden"));
const vnClosed = await p.$eval("#vn", (el) => el.classList.contains("hidden"));
ok("프롤로그 완주 → 메인 화면 복귀", backToMain && vnClosed);

console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(results.every(Boolean) && !errors.length ? 0 : 1);

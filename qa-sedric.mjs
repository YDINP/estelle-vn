// 세드릭/발렌 신규 에셋 QA
// 세드릭 탭: 표정8 + 전신12 + CG3 / 발렌 탭: 표정8(bust) + 전신8 + CG6(잠금 티저)
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
const c = await p.$("#confirmYes");
if (c) await c.click();
await p.waitForTimeout(400);
await p.click("#btnCollect");
await p.waitForSelector("#collect:not(.hidden)");
await p.waitForTimeout(500);

async function tabCounts(id) {
  await p.click(`[data-ctab="${id}"]`);
  await p.waitForTimeout(400);
  return p.evaluate(() => {
    const grids = [...document.querySelectorAll("#illustWrap .igrid")].map((g) => g.children.length);
    const lockedCg = document.querySelectorAll("#illustWrap .icell.cg.locked").length;
    return { grids, lockedCg };
  });
}

const sed = await tabCounts("sedric");
console.log("세드릭 탭:", JSON.stringify(sed));
const okSed = sed.grids.length === 3 && sed.grids[0] === 8 && sed.grids[1] === 12 && sed.grids[2] === 7;
console.log(`[${okSed ? "PASS" : "FAIL"}] 세드릭 표정 8 / 전신 12 / CG 7`);
await p.screenshot({ path: "qa-shots/sedric-collect.png" });

const val = await tabCounts("valen");
console.log("발렌 탭:", JSON.stringify(val));
const okVal = val.grids.length === 3 && val.grids[0] === 8 && val.grids[1] === 8 &&
  val.grids[2] === 6 && val.lockedCg === 6; // 발렌 CG는 전부 잠금 티저
console.log(`[${okVal ? "PASS" : "FAIL"}] 발렌 표정 8 / 전신 8 / CG 6(전부 잠금)`);
await p.screenshot({ path: "qa-shots/valen-collect.png" });

// 신규 파일 실로드 (404 검사)
const files = [
  "/char/sedric/surprised.png", "/char/sedric/tearful.png", "/char/sedric/laugh.png",
  "/char/valen/soft.png", "/char/valen/angry.png",
  "/char/valen/bust_soft.png", "/char/valen/bust_sad.png",
  "/cg/valen/throne_night.jpg", "/cg/valen/moon_feast.jpg", "/cg/sedric/dusk_reply.jpg",
  "/cg/sedric/blue_rose_night.jpg", "/cg/sedric/study_read.jpg",
  "/cg/sedric/rain_vigil.jpg", "/cg/sedric/glasshouse_read.jpg",
];
let okFiles = true;
for (const f of files) {
  const r = await p.request.get("http://localhost:5180" + f);
  if (!r.ok()) okFiles = false;
  console.log(`[${r.ok() ? "PASS" : "FAIL"}] ${f} → ${r.status()}`);
}
console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(okSed && okVal && okFiles && !errors.length ? 0 : 1);

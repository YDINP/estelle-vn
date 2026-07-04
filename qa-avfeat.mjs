// 오디오/화자색/CG유지 QA
// ① BGM 파일 서빙 + 음소거 토글 ② 화자별 텍스트 색 ③ CG hold (다음 대사에서 유지 → CGX에서 해제)
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
const tap = async () => { await p.click("#vn", { position: { x: 195, y: 250 }, force: true }); await p.waitForTimeout(120); };

// ① BGM 파일
for (const f of ["bgm/title.mp3", "bgm/story.mp3"]) {
  const r = await p.request.get(BASE + f);
  ok(`BGM ${f}`, r.ok(), String(r.status()));
}

await p.goto(BASE + "?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
await p.waitForTimeout(400);

// ② 화자 색 — 진행하며 내레이션/에스텔 대사 각각 색 확인
let sawNarr = false, sawEstelle = false;
for (let i = 0; i < 14 && !(sawNarr && sawEstelle); i++) {
  await tap(); await tap();
  const s = await p.evaluate(() => ({
    name: document.querySelector("#vnName").textContent,
    nameColor: document.querySelector("#vnName").style.color,
    textColor: document.querySelector("#vnText").style.color,
    narr: document.querySelector("#vnText").classList.contains("narr"),
  }));
  if (s.narr && !s.textColor) sawNarr = true;
  if (s.name === "에스텔" && s.nameColor === "rgb(255, 223, 158)" &&
      s.textColor === "rgb(255, 223, 158)") sawEstelle = true;
}
ok("내레이션 = 기본 뮤트톤(인라인색 없음)", sawNarr);
ok("에스텔 대사 = 웜골드(#ffdf9e) 이름+본문", sawEstelle);

// ③ CG hold — 1화 cg_e1: CG 표시 후 다음 대사에서도 CG 유지, CGX(회귀 시점)에서 해제
let cgShown = false, heldDuringLine = false, released = false;
for (let i = 0; i < 80; i++) {
  await tap();
  const s = await p.evaluate(() => ({
    cg: !document.querySelector("#vnCg").classList.contains("hidden"),
    text: document.querySelector("#vnText").textContent,
    choosing: !document.querySelector("#vnChoices").classList.contains("hidden"),
  }));
  if (s.choosing) { await p.click("#vnChoices [data-opt='0']"); await p.waitForTimeout(200); continue; }
  if (s.cg && s.text.startsWith("—")) cgShown = true;           // CG 캡션 표시
  if (cgShown && s.cg && !s.text.startsWith("—")) heldDuringLine = true; // 대사가 CG 위에서
  if (heldDuringLine && !s.cg) { released = true; break; }       // CGX로 해제
  const done = await p.$eval("#vn", (el) => el.classList.contains("hidden"));
  if (done) break;
}
ok("CG 표시", cgShown);
ok("CG 유지 중 대사 진행 (hold)", heldDuringLine);
ok("CGX에서 CG 해제 → 포트레이트 복귀", released);
if (heldDuringLine) await p.screenshot({ path: "qa-shots/av-cghold.png" });

// ① 음소거 토글 (홈에서)
await p.click("#vnExit");
await p.waitForTimeout(200);
{ const c = await p.$("#confirmYes"); if (c) await c.click(); }
await p.waitForTimeout(400);
const icon0 = await p.$eval("#btnMute", (el) => el.textContent);
await p.click("#btnMute");
const icon1 = await p.$eval("#btnMute", (el) => el.textContent);
const stored = await p.evaluate(() => localStorage.getItem("estelle.mute"));
ok("음소거 토글 + 저장", icon0 !== icon1 && stored === "1", `${icon0}→${icon1} mute=${stored}`);
await p.click("#btnMute"); // 원복

console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(results.every(Boolean) && !errors.length ? 0 : 1);

// 엑스트라 실루엣 QA — 에스텔 4화에서 '약혼자' 대사 시:
// ① 실루엣 초상(char/fiance/bust_soft.png)으로 교체 ② 수집 토스트 없음
// ③ '임시' 배지 없음 ④ 에스텔 복귀 시 초상 원복 ⑤ 도감에 약혼자/재상 탭 없음
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

// ep1~3 클리어 상태 시드 → 4화 바로 재생 가능
await p.goto(BASE + "?epwait=5");
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("estelle.save.v1", JSON.stringify({
    coins: 500, affection: 0, ownedCosmetics: ["dress_basic"],
    equipped: { outfit: "dress_basic", accessory: "" },
    dailyTalkLeft: 3, epCleared: [], nextEpFreeAt: 0, dailyDoneDay: "",
    cards: [], streak: 1, lastStreakDay: "", illust: {}, cgSeen: [],
    routes: { estelle: { epCleared: ["ep1", "ep2", "ep3"], nextEpFreeAt: 0 } },
    affectionBy: { estelle: 10 }, currentRoute: "estelle", onboarded: true,
  }));
});
await p.reload();
await p.waitForSelector("#btnStory", { timeout: 8000 });
await p.waitForTimeout(400);
await p.click("#btnStory");
await p.waitForSelector(".story-item", { timeout: 4000 });
// 4화 재생 버튼 (data 속성 탐색: 목록에서 '4화' 항목의 ▶)
const played = await p.evaluate(() => {
  const items = [...document.querySelectorAll(".story-item")];
  const it = items.find((el) => el.textContent.includes("4화"));
  const btn = it?.querySelector("button");
  if (btn) { btn.click(); return true; }
  return false;
});
ok("4화 재생 진입", played);
await p.waitForSelector("#vn:not(.hidden)", { timeout: 5000 });

let sawFiance = false, silhouetteOk = false, badgeHidden = true, toastLeak = false, restored = false;
for (let i = 0; i < 80; i++) {
  await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
  await p.waitForTimeout(130);
  const s = await p.evaluate(() => ({
    name: document.querySelector("#vnName").textContent,
    src: document.querySelector("#vnPortrait").src,
    ph: document.querySelector("#vnPh").classList.contains("hidden"),
    choosing: !document.querySelector("#vnChoices").classList.contains("hidden"),
    toasts: [...document.querySelectorAll("#toasts .toast-item")].map((t) => t.textContent),
    done: document.querySelector("#vn").classList.contains("hidden"),
  }));
  if (s.choosing) { await p.click("#vnChoices [data-opt='0']"); await p.waitForTimeout(200); continue; }
  if (s.name === "약혼자") {
    sawFiance = true;
    if (s.src.includes("/char/fiance/bust_soft.png")) silhouetteOk = true;
    if (!s.ph) badgeHidden = false;
    await p.screenshot({ path: "qa-shots/extra-fiance.png" });
  }
  if (s.toasts.some((t) => t.includes("약혼자") || t.includes("재상"))) toastLeak = true;
  if (sawFiance && s.name === "에스텔" && s.src.includes("/char/estelle/")) restored = true;
  if (s.done) break;
}
ok("약혼자 대사 등장", sawFiance);
ok("실루엣 초상 표시", silhouetteOk);
ok("임시 배지 미표시", badgeHidden);
ok("수집 토스트 없음(엑스트라 제외)", !toastLeak);
ok("에스텔 복귀 시 초상 원복", restored);

// 도감에 엑스트라 탭 없음
await p.evaluate(() => document.querySelector("#vnExit")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await p.waitForTimeout(300);
{ const c = await p.$("#confirmYes"); if (c) await c.click(); }
await p.waitForTimeout(400);
await p.click("#btnCollect");
await p.waitForSelector("#collect:not(.hidden)");
const tabs = await p.$$eval("#collectTabs .tab", (els) => els.map((e) => e.textContent.trim()));
ok("도감에 약혼자/재상 탭 없음", !tabs.includes("약혼자") && !tabs.some((t) => t.includes("재상")), JSON.stringify(tabs));

console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(results.every(Boolean) && !errors.length ? 0 : 1);

import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 300)));
p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("CONSOLE:", m.type(), m.text().slice(0, 200)); });
p.on("response", (r) => { if (r.status() >= 400) console.log("HTTP", r.status(), r.url()); });
await p.goto("http://localhost:5181/estelle-vn/?epwait=5");
await p.waitForTimeout(2500);
const state = await p.evaluate(() => ({
  vnHidden: document.querySelector("#vn")?.className,
  mainHidden: document.querySelector("#mainScreen")?.className,
  app: document.getElementById("app")?.children.length,
  ls: Object.keys(localStorage),
}));
console.log(JSON.stringify(state));
await p.screenshot({ path: "qa-shots/subpath-dbg.png" });
await b.close();

import { chromium } from "playwright";
import { readFileSync } from "fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 760 } });
const s1 = "data:image/png;base64," + readFileSync(".tmp-lucian/s1-clean2.png").toString("base64");
const s2 = "data:image/png;base64," + readFileSync(".tmp-lucian/s2-clean2.png").toString("base64");
await p.setContent(`<body style="margin:0;background:#26130a;display:flex;gap:8px;padding:6px">
  <img src="${s1}" style="height:740px"><img src="${s2}" style="height:740px"></body>`);
await p.waitForTimeout(800);
await p.screenshot({ path: "qa-shots/lucian-sheets.png" });
await b.close();
console.log("ok");

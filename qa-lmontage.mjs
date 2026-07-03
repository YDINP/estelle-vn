import { chromium } from "playwright";
import { readFileSync } from "fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 860 } });
const names = [];
for (const t of ["s1","s2"]) for (let i = 1; i <= 8; i++) names.push(`${t}c${i}`);
const imgs = names.map(n => ({ n, s: "data:image/png;base64," + readFileSync(`.tmp-lucian/${n}.png`).toString("base64") }));
await p.setContent(`<body style="margin:0;background:#26130a;display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:8px">
  ${imgs.map(({n,s}) => `<div style="text-align:center;color:#f3dfa4;font:12px sans-serif">${n}<br><img src="${s}" style="width:100%"></div>`).join("")}
</body>`);
await p.waitForTimeout(700);
await p.screenshot({ path: "qa-shots/lucian-clean.png", fullPage: true });
await b.close();
console.log("ok");

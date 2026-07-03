import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
const b = await chromium.launch();
const p = await b.newPage();
const names = [];
for (const t of ["s1","s2"]) for (let i = 1; i <= 8; i++) names.push(`${t}c${i}`);
for (const n of names) {
  const data = readFileSync(`.tmp-lucian/${n}.png`).toString("base64");
  const res = await p.evaluate(async (src) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = src; });
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, c.width, c.height);
    const d = id.data;
    const W = c.width, H = c.height, N = W * H;
    // 체커 후보: 엄격 중성(채널차 ≤3) & 밝기 231~255
    const neutral = new Uint8Array(N);   // 1=A(어두운 사각 231~243) 2=경계 3=B(밝은 사각 248+)
    for (let i = 0; i < N; i++) {
      const r = d[i*4], g = d[i*4+1], bb = d[i*4+2];
      if (Math.abs(r-g) > 3 || Math.abs(g-bb) > 3 || Math.abs(r-bb) > 3) continue;
      const v = (r+g+bb)/3;
      if (v >= 231 && v < 244) neutral[i] = 1;
      else if (v >= 244 && v < 248) neutral[i] = 2;
      else if (v >= 248) neutral[i] = 3;
    }
    const nbr = (i, fn) => {
      const xx = i % W, y = (i / W) | 0;
      if (xx > 0) fn(i-1); if (xx < W-1) fn(i+1);
      if (y > 0) fn(i-W); if (y < H-1) fn(i+W);
    };
    const remove = new Uint8Array(N);
    // 1) 테두리에서 플러드필
    const stack = [];
    for (let xx = 0; xx < W; xx++) { stack.push(xx, (H-1)*W+xx); }
    for (let y = 0; y < H; y++) { stack.push(y*W, y*W+W-1); }
    for (const s of stack) if (neutral[s] && !remove[s]) {
      const q = [s]; remove[s] = 1;
      for (let qi = 0; qi < q.length; qi++)
        nbr(q[qi], j => { if (neutral[j] && !remove[j]) { remove[j] = 1; q.push(j); } });
    }
    // 2) 고립 포켓: 중성 컴포넌트 중 A/B 양쪽 톤 ≥10px 공존 & 크기 ≥49
    const visited = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      if (!neutral[i] || remove[i] || visited[i]) continue;
      const comp = [i]; visited[i] = 1;
      for (let qi = 0; qi < comp.length; qi++)
        nbr(comp[qi], j => { if (neutral[j] && !remove[j] && !visited[j]) { visited[j] = 1; comp.push(j); } });
      let a = 0, bcnt = 0;
      for (const j of comp) { if (neutral[j] === 1) a++; else if (neutral[j] === 3) bcnt++; }
      if (comp.length >= 49 && a >= 10 && bcnt >= 10)
        for (const j of comp) remove[j] = 1;
    }
    let removed = 0;
    for (let i = 0; i < N; i++) if (remove[i]) { d[i*4+3] = 0; removed++; }
    // 3) 경계 1px 페더 (제거영역에 접한 픽셀 알파 60%)
    for (let i = 0; i < N; i++) {
      if (d[i*4+3] === 0) continue;
      let e = false; nbr(i, j => { if (remove[j]) e = true; });
      if (e) d[i*4+3] = Math.round(d[i*4+3] * 0.6);
    }
    x.putImageData(id, 0, 0);
    return { removed, pct: (removed/N*100).toFixed(1), url: c.toDataURL("image/png") };
  }, "data:image/png;base64," + data);
  writeFileSync(`.tmp-lucian/${n}.png`, Buffer.from(res.url.split(",")[1], "base64"));
  console.log(`${n}: removed ${res.pct}%`);
}
await b.close();

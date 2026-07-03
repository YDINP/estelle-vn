import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
const sheets = [
  ["C:/Users/a/Desktop/1/005/ChatGPT Image 2026년 7월 3일 오후 06_22_09.png", "s1"],
  ["C:/Users/a/Desktop/1/005/ChatGPT Image 2026년 7월 3일 오후 06_28_11.png", "s2"],
];
const b = await chromium.launch();
const p = await b.newPage();
for (const [path, tag] of sheets) {
  const data = readFileSync(path).toString("base64");
  const res = await p.evaluate(async (src) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = src; });
    const W = img.width, H = img.height;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, W, H);
    const d = id.data;
    const N = W * H;
    const lum = i => (d[i*4]+d[i*4+1]+d[i*4+2])/3;
    const isNeutral = i => {
      const r=d[i*4],g=d[i*4+1],bb=d[i*4+2];
      return Math.abs(r-g)<=3 && Math.abs(g-bb)<=3 && Math.abs(r-bb)<=3;
    };
    // ── 격자 피팅: 상단 프레임 안쪽 순수 체커 지역(x 6..W-6, y 8..40)으로 P/x0 탐색 ──
    const fit = (horizontal) => {
      let best = { score: -1, P: 12.75, o: 0 };
      for (let P = 12.4; P <= 13.4; P += 0.02) {
        for (let o = 0; o < P; o += 0.25) {
          let ok = 0, tot = 0;
          for (let a = 8; a < 40; a++) for (let bb = 10; bb < 300; bb += 2) {
            const xx = horizontal ? bb : a, y = horizontal ? a : bb;
            const i = y*W+xx;
            if (!isNeutral(i)) continue;
            const v = lum(i);
            if (v < 231 || v > 258) continue;
            const coord = horizontal ? xx : y;
            const cellIdx = Math.floor((coord - o) / P);
            const frac = (coord - o) / P - cellIdx;
            if (frac < 0.12 || frac > 0.88) continue; // 경계 근처 제외
            tot++;
            // 다른 축 위상은 아직 모름 → 페어만 채점: 같은 축에서 한 주기 옆 픽셀과 톤 반전 확인
            const coord2 = coord + P;
            const xx2 = horizontal ? Math.round(coord2) : xx;
            const y2 = horizontal ? y : Math.round(coord2);
            if (xx2 >= W || y2 >= H) continue;
            const i2 = y2*W+xx2;
            if (!isNeutral(i2)) continue;
            const v2 = lum(i2);
            if (v2 < 231 || v2 > 258) continue;
            const t1 = v >= 244, t2 = v2 >= 244;
            if (t1 !== t2) ok++;
          }
          const score = tot ? ok / tot : 0;
          if (score > best.score) best = { score, P, o };
        }
      }
      return best;
    };
    const fx = fit(true), fy = fit(false);
    // 위상(어느 칸이 다크인지): (0,0) 근처 칸 톤 샘플로 결정
    const P_x = fx.P, ox = fx.o, P_y = fy.P, oy = fy.o;
    const cellTone = (xx, y) => (Math.floor((xx-ox)/P_x) + Math.floor((y-oy)/P_y)) % 2;
    // 기준: x=20,y=20 부근 순수체커 픽셀의 실제 톤으로 패리티 캘리브레이션
    let parityDark = 0, cnt0 = 0, cnt1 = 0;
    for (let y = 8; y < 60; y++) for (let xx = 8; xx < 60; xx++) {
      const i = y*W+xx;
      if (!isNeutral(i)) continue;
      const v = lum(i);
      if (v >= 231 && v < 244) { (cellTone(xx,y) === 0 ? cnt0++ : cnt1++); }
    }
    parityDark = cnt1 > cnt0 ? 1 : 0; // 다크 톤이 나오는 패리티
    // ── 매치 마스크 ──
    const match = new Uint8Array(N); // 1=다크매치 2=라이트매치 3=경계
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
      const i = y*W+xx;
      if (!isNeutral(i)) continue;
      const v = lum(i);
      if (v < 228 || v > 259) continue;
      const fxr = (xx-ox)/P_x, fyr = (y-oy)/P_y;
      const bx = Math.abs(fxr - Math.round(fxr)) * P_x, by = Math.abs(fyr - Math.round(fyr)) * P_y;
      if (bx < 1.4 || by < 1.4) { match[i] = 3; continue; } // 격자선 경계 → AA 허용
      const expDark = (cellTone(xx,y) === parityDark);
      if (expDark && v >= 231 && v < 245) match[i] = 1;
      else if (!expDark && v >= 246 && v <= 259) match[i] = 2;
    }
    // ── 컴포넌트: 크기≥300 & 두 톤 공존 → 제거 ──
    const nbr = (i, fn) => {
      const xx = i % W, y = (i / W) | 0;
      if (xx > 0) fn(i-1); if (xx < W-1) fn(i+1);
      if (y > 0) fn(i-W); if (y < H-1) fn(i+W);
    };
    const visited = new Uint8Array(N);
    const remove = new Uint8Array(N);
    let removed = 0;
    for (let i = 0; i < N; i++) {
      if (!match[i] || visited[i]) continue;
      const comp = [i]; visited[i] = 1;
      for (let q = 0; q < comp.length; q++)
        nbr(comp[q], j => { if (match[j] && !visited[j]) { visited[j] = 1; comp.push(j); } });
      let dark = 0, light = 0;
      for (const j of comp) { if (match[j] === 1) dark++; else if (match[j] === 2) light++; }
      if (comp.length >= 300 && dark >= 40 && light >= 40) {
        for (const j of comp) remove[j] = 1;
        removed += comp.length;
      }
    }
    // 검은 프레임(구분선)도 제거: 순수 저휘도 중성 & 프레임 위치(가장자리/셀경계 ±6px)
    const cellW = W/4, cellH = H/2;
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
      const i = y*W+xx;
      if (lum(i) > 40 || !isNeutral(i)) continue;
      const nearVX = Math.min(xx % cellW, cellW - (xx % cellW)) < 7 || xx < 7 || xx > W-8;
      const nearVY = Math.min(y % cellH, cellH - (y % cellH)) < 7 || y < 7 || y > H-8;
      if (nearVX || nearVY) remove[i] = 1;
    }
    for (let i = 0; i < N; i++) if (remove[i]) d[i*4+3] = 0;
    // 페더: 제거영역 인접 중성 밝은 픽셀 알파 다운
    for (let i = 0; i < N; i++) {
      if (!d[i*4+3]) continue;
      let e = false; nbr(i, j => { if (remove[j]) e = true; });
      if (e && isNeutral(i) && lum(i) >= 228) d[i*4+3] = 100;
    }
    x.putImageData(id, 0, 0);
    return { fx, fy, parityDark, removedPct: (removed/N*100).toFixed(1), url: c.toDataURL("image/png") };
  }, "data:image/png;base64," + data);
  writeFileSync(`.tmp-lucian/${tag}-clean.png`, Buffer.from(res.url.split(",")[1], "base64"));
  console.log(tag, "P_x=" + res.fx.P.toFixed(2), "ox=" + res.fx.o.toFixed(2), "score=" + res.fx.score.toFixed(2),
    "| P_y=" + res.fy.P.toFixed(2), "oy=" + res.fy.o.toFixed(2), "score=" + res.fy.score.toFixed(2),
    "| removed", res.removedPct + "%");
}
await b.close();

import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
const cfgs = [
  { f: ".tmp-lucian/s1-clean.png", tag: "s1", Px: 13.10, ox: 10.75, Py: 13.08, oy: 1.00 },
  { f: ".tmp-lucian/s2-clean.png", tag: "s2", Px: 12.58, ox: 8.00, Py: 12.96, oy: 12.25 },
];
const b = await chromium.launch();
const p = await b.newPage();
for (const cfg of cfgs) {
  const data = readFileSync(cfg.f).toString("base64");
  const res = await p.evaluate(async ({ src, Px, ox, Py, oy }) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = src; });
    const W = img.width, H = img.height, N = W * H;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, W, H);
    const d = id.data;
    const A = i => d[i*4+3];
    const lum = i => (d[i*4]+d[i*4+1]+d[i*4+2])/3;
    const isNeutral = i => {
      const r=d[i*4],g=d[i*4+1],bb=d[i*4+2];
      return Math.abs(r-g)<=4 && Math.abs(g-bb)<=4 && Math.abs(r-bb)<=4;
    };
    const nbr4 = (i, fn) => {
      const xx = i % W, y = (i / W) | 0;
      if (xx > 0) fn(i-1); if (xx < W-1) fn(i+1);
      if (y > 0) fn(i-W); if (y < H-1) fn(i+W);
    };
    const nbr8 = (i, fn) => {
      const xx = i % W, y = (i / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = xx+dx, ny = y+dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) fn(ny*W+nx);
      }
    };
    // 격자 기대 톤 매치 판정 (파리티 캘리브레이션: 좌상단 순수체커)
    const cellTone = (xx, y) => ((Math.floor((xx-ox)/Px) + Math.floor((y-oy)/Py)) % 2 + 2) % 2;
    const gridMatch = i => {
      const xx = i % W, y = (i / W) | 0;
      if (!isNeutral(i)) return false;
      const v = lum(i);
      if (v < 228 || v > 259) return false;
      return true; // 톤 위치까지 안 따짐 — 복원판정엔 "중성밝음"만으로 충분
    };
    // ── (a) 갑옷 구멍 복원: 테두리 비연결 투명 컴포넌트 ≤600px 중 체커답지 않은 것 ──
    // 테두리 연결 투명 영역 마킹
    const bgSea = new Uint8Array(N);
    { const q = [];
      for (let xx = 0; xx < W; xx++) { q.push(xx, (H-1)*W+xx); }
      for (let y = 0; y < H; y++) { q.push(y*W, y*W+W-1); }
      for (const s of q) if (A(s) < 40 && !bgSea[s]) {
        const st = [s]; bgSea[s] = 1;
        for (let qi = 0; qi < st.length; qi++)
          nbr4(st[qi], j => { if (A(j) < 40 && !bgSea[j]) { bgSea[j] = 1; st.push(j); } });
      }
    }
    let restored = 0;
    { const seen = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        if (A(i) >= 40 || bgSea[i] || seen[i]) continue;
        const comp = [i]; seen[i] = 1;
        for (let qi = 0; qi < comp.length; qi++)
          nbr4(comp[qi], j => { if (A(j) < 40 && !bgSea[j] && !seen[j]) { seen[j] = 1; comp.push(j); } });
        if (comp.length <= 600) {
          // 체커 점수: 원본색이 격자 기대톤과 일치하는 비율
          let m = 0;
          for (const j of comp) {
            const xx = j % W, y = (j / W) | 0;
            const v = lum(j);
            const expDark = cellTone(xx, y);
            // 파리티 모호 → 양쪽 다 허용해 톤 클래스 일치만 체크
            if (isNeutral(j) && ((v >= 231 && v < 245) || (v >= 246 && v <= 259))) m++;
          }
          if (m / comp.length < 0.75) { for (const j of comp) d[j*4+3] = 255; restored += comp.length; }
        }
      }
    }
    // ── (b) 배경 점격자 잔여 제거: 소형 불투명 컴포넌트 중 92%+ 중성밝음 ──
    let junk = 0;
    { const seen = new Uint8Array(N);
      const comps = [];
      for (let i = 0; i < N; i++) {
        if (A(i) < 40 || seen[i]) continue;
        const comp = [i]; seen[i] = 1;
        for (let qi = 0; qi < comp.length; qi++)
          nbr4(comp[qi], j => { if (A(j) >= 40 && !seen[j]) { seen[j] = 1; comp.push(j); } });
        comps.push(comp);
      }
      comps.sort((a, b2) => b2.length - a.length);
      // 셀별 메인(캐릭터)들은 큼 — 상위 8개(셀 수) 보호, 나머지 판정
      for (let k = 0; k < comps.length; k++) {
        const comp = comps[k];
        if (comp.length > 3000) continue; // 캐릭터/대형 보호
        let nb = 0, dark = 0;
        for (const j of comp) {
          if (isNeutral(j) && lum(j) >= 228 && lum(j) <= 259) nb++;
          if (lum(j) < 190) dark++;
        }
        // 라인아트(어두운 픽셀 5%+) 포함 → 효과 도형으로 보존
        if (nb / comp.length >= 0.9 && dark / comp.length < 0.03) {
          for (const j of comp) d[j*4+3] = 0;
          junk += comp.length;
        }
      }
    }
    // ── (c) 실루엣 주변 부스러기: 중성밝음 & 8이웃 중 5+ 투명 → 제거 (2회) ──
    for (let it = 0; it < 2; it++) {
      const kill = [];
      for (let i = 0; i < N; i++) {
        if (A(i) < 40 || !isNeutral(i)) continue;
        const v = lum(i);
        if (v < 228 || v > 259) continue;
        let t = 0; nbr8(i, j => { if (A(j) < 40) t++; });
        if (t >= 5) kill.push(i);
      }
      for (const i of kill) d[i*4+3] = 0;
    }
    x.putImageData(id, 0, 0);
    return { restored, junk, url: c.toDataURL("image/png") };
  }, { src: "data:image/png;base64," + data, Px: cfg.Px, ox: cfg.ox, Py: cfg.Py, oy: cfg.oy });
  writeFileSync(`.tmp-lucian/${cfg.tag}-clean2.png`, Buffer.from(res.url.split(",")[1], "base64"));
  console.log(cfg.tag, "restored=" + res.restored, "junk=" + res.junk);
}
await b.close();

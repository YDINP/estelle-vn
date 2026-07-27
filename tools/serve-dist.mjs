#!/usr/bin/env node
/* serve-dist.mjs — dist/ 를 배포와 동일한 조건(순수 정적)으로 서빙한다.
 *
 * `vite preview`는 `Sec-Fetch-Dest: script` 요청을 404로 막는 보안 미들웨어가 있어
 * (curl은 통과, 실제 브라우저는 차단) 헤드리스 QA가 부팅조차 못 한다.
 * GitHub Pages 같은 정적 호스팅에는 그런 검사가 없으므로, QA는 이 서버로 돌린다.
 *
 *   node tools/serve-dist.mjs [--port 5180] [--base /estelle-vn/]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n, d) => {
  const i = process.argv.indexOf("--" + n);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const PORT = parseInt(arg("port", "5180"), 10);
const BASE = arg("base", "/estelle-vn/");
const DIST = path.join(ROOT, "dist");

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.startsWith(BASE)) p = p.slice(BASE.length - 1);   // base 접두 제거
    if (p === "/" || p === "") p = "/index.html";
    const file = path.join(DIST, p);
    // dist 밖 경로 접근 차단
    if (!file.startsWith(DIST)) { res.writeHead(403).end("forbidden"); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404, { "content-type": "text/plain" }).end("404 " + p); return; }
      res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
      res.end(buf);
    });
  })
  .listen(PORT, () => console.log(`static dist → http://localhost:${PORT}${BASE}`));

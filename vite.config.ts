import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // GitHub Pages는 https://{user}.github.io/estelle-vn/ 하위경로로 서빙 →
  // 빌드에만 base 적용 (dev는 "/" 유지 — qa-*.mjs가 localhost:5180/ 기준).
  base: command === "build" ? "/estelle-vn/" : "/",
  // 외부(같은 네트워크의 폰 등) 접속 허용 — 0.0.0.0 바인딩.
  server: { host: true, port: 5180 },
  preview: { host: true, port: 5180 },
}));

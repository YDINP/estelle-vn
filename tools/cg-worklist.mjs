#!/usr/bin/env node
/* cg-worklist.mjs — 집필팀 CG 매니페스트에서 "아직 그려지지 않은 컷"만 추려 생성 작업지시서를 만든다.
 *
 * 엔딩 3종은 파일명을 end_{good,bad,true} 로 통일한다 — 작가마다 서술적 파일명을
 * 따로 지었지만 실제 생성물은 전 루트 동일 규약으로 뽑혔고, 엔딩 도감이 이 규약에 의존한다.
 *
 *   node tools/cg-worklist.mjs            # 요약
 *   node tools/cg-worklist.mjs --emit     # .tmp/cg-todo.json 으로 배치 산출
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMIT = process.argv.includes("--emit");

/** 엔딩 CG는 id 접미사로 판별한다 */
const endingSuffix = (id) => (/_good$/.test(id) ? "end_good" : /_bad$/.test(id) ? "end_bad" : /_true$/.test(id) ? "end_true" : null);

const todo = [];
const have = [];
const manifests = fs.readdirSync(path.join(ROOT, "story")).filter((f) => /^cg-manifest-.+\.json$/.test(f));

for (const m of manifests) {
  const route = m.replace(/^cg-manifest-|\.json$/g, "");
  let items;
  try {
    items = JSON.parse(fs.readFileSync(path.join(ROOT, "story", m), "utf8"));
  } catch (e) {
    console.error(`⚠ ${m} 파싱 실패: ${e.message}`);
    continue;
  }
  for (const it of items) {
    const file = endingSuffix(it.id) ?? it.file;   // 엔딩은 규약 파일명으로 정규화
    const rel = path.join("public", "cg", it.char, `${file}.webp`);
    const rec = { route, id: it.id, char: it.char, file, rel, title: it.title, scene: it.scene, cast: it.cast, prompt: it.prompt, unlockEp: it.unlockEp };
    (fs.existsSync(path.join(ROOT, rel)) ? have : todo).push(rec);
  }
}

console.log(`매니페스트 ${manifests.length}개 · 총 ${have.length + todo.length}컷 · 보유 ${have.length} · 생성필요 ${todo.length}\n`);
const byRoute = {};
for (const t of todo) (byRoute[t.route] ??= []).push(t.id);
for (const [r, ids] of Object.entries(byRoute)) console.log(`  ${r.padEnd(10)} ${String(ids.length).padStart(2)}컷  ${ids.join(" ")}`);

if (EMIT) {
  const out = path.join(ROOT, ".tmp", "cg-todo.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(todo, null, 2));
  console.log(`\n→ ${out}`);
}

// Plays the built game with strategies a seven-year-old could actually use, to
// find out whether any of them pays without spelling. Green tests only say the
// buttons work; Tier-Blitz passed every assertion for weeks while teaching him
// to guess from the first letter.
//
// Strategies:
//   perfect     types the word           — control, must be 100%
//   random      random length, random keys from the board
//   initial     remembers first letter + length, guesses the rest
//   frame       remembers every consonant and the length, guesses the vowel
//               from the board — this is his actual profile, 42% of his wrong
//               answers are one vowel put in place of another
//   himself     types the word but drops each letter to a board confusable at
//               his measured error rate for that word — what he will score
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
const VOW = new Set("aeiouy");

// his real book, straight off the export
const REAL = {};
for (const line of readFileSync("/home/claude/bw/en.tsv", "utf8").trim().split("\n")) {
  const [w, r, wr, mx] = line.split("\t");
  REAL[w] = { r: +r, wr: +wr, mx: JSON.parse(mx) };
}
const src = readFileSync("./src/App.jsx", "utf8");
const EN = eval(src.slice(src.indexOf("const EN = [") + 11, src.indexOf("\n];", src.indexOf("const EN = [")) + 2));

const payload = () => {
  const words = {};
  const base = () => ({ s: 2, cc: 4, d: [ago(4), ago(3)], iv: 2, due: ago(-9),
    r: 9, wr: 0, tn: [9, 8, 0], h: [1,1,1,1,1,1,1,1,1,1], everMastered: true });
  EN.slice(0, 5).forEach((lvl) => lvl.forEach((e) => { words[e[0]] = base(); }));
  for (const [w, v] of Object.entries(REAL)) {
    if (!words[w]) words[w] = base();
    words[w] = { ...words[w], r: v.r, wr: v.wr, mx: v.mx, due: ago(1),
      h: [1,0,1,1,0,1,1,0,1,1] };
  }
  const days = {};
  for (let i = 1; i <= 6; i++) days[ago(i)] = { s: 700, b1: 0, b2: 0 };
  days[iso()] = { s: 0, b1: 0, b2: 0 };
  return { de: { v: 3, words: {}, coins: 0, days: {} },
           en: { v: 3, words, coins: 0, days },
           meta: { lang: "en", speed: 9, snd: false } };
};

const html = readFileSync("./index.html", "utf8");
async function boot() {
  const url = "https://x.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload()), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  await sleep(400);
  const doc = window.document;
  const q = (s) => doc.querySelector(s);
  const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  return { window, doc, q, tap,
    target: () => { const e = q("[data-type-target]"); return e ? e.textContent.trim() : null; },
    keys: () => [...doc.querySelectorAll("[data-type-key]")]
      .map((b) => b.getAttribute("data-type-key")).filter((k) => k !== "del"),
    tile: () => q("[data-type-tile]"),
    press: (c) => tap(q(`[data-type-key="${c}"]`)),
    commit: () => tap(q("[data-type-commit]")),
    cont: () => tap([...doc.querySelectorAll("button")].find((b) => /Go on|Weiter/.test(b.textContent))) };
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];

function attempt(strategy, word, keys) {
  const kv = keys.filter((k) => VOW.has(k)), kc = keys.filter((k) => !VOW.has(k));
  if (strategy === "perfect") return word;
  if (strategy === "random") {
    const n = 3 + Math.floor(Math.random() * 3);
    return Array.from({ length: n }, () => pick(keys)).join("");
  }
  if (strategy === "initial")
    return word[0] + Array.from({ length: word.length - 1 }, () => pick(keys)).join("");
  if (strategy === "frame")
    return word.split("").map((c) => (VOW.has(c) ? pick(kv.length ? kv : keys) : c)).join("");
  if (strategy === "himself") {
    const rec = REAL[word];
    // per-letter slip rate that reproduces his whole-word accuracy on this word
    const acc = rec ? rec.r / (rec.r + rec.wr) : 0.75;
    const p = 1 - Math.pow(acc, 1 / word.length);
    return word.split("").map((c) => {
      if (Math.random() > p) return c;
      const pool = (VOW.has(c) ? kv : kc).filter((k) => k !== c);
      return pool.length ? pick(pool) : c;
    }).join("");
  }
  return word;
}

const ROUNDS = Number(process.env.ROUNDS || 3);
const results = {};
const drawn = [];
for (const strategy of (process.env.STRATS || "perfect,random,initial,frame,himself").split(",")) {
  let hit = 0, n = 0;
  for (let r = 0; r < ROUNDS; r++) {
    const a = await boot();
    a.tap(a.tile());
    await sleep(120);
    for (let i = 0; i < 8; i++) {
      const w = a.target();
      if (!w) break;
      if (strategy === "perfect") drawn.push(w);
      await sleep(1700);                       // speed 9 -> the 1500 ms exposure floor
      const keys = a.keys();
      if (!keys.length) break;
      const ans = attempt(strategy, w, keys);
      for (const c of ans) a.press(c);
      await sleep(20);
      a.commit();
      await sleep(150);
      const ok = a.target() === w && !a.q("[data-type-commit]");
      // a correct answer auto-advances; a miss waits on the continue button
      const missed = !!a.q("[data-type-commit]") === false && !!a.target();
      if (ans === w) hit++;
      n++;
      a.cont();
      await sleep(250);
    }
    a.window.close();
  }
  results[strategy] = { hit, n };
  console.log(`  ${strategy.padEnd(9)} ${hit}/${n} = ${n ? Math.round(100*hit/n) : 0}%`);
}

console.log("\n--- what the queue actually serves him ---");
const seen = {};
drawn.forEach((w) => { seen[w] = (seen[w] || 0) + 1; });
const acc = (w) => (REAL[w] ? REAL[w].r / (REAL[w].r + REAL[w].wr) : null);
const known = drawn.filter((w) => acc(w) !== null);
const meanDrawn = known.reduce((s, w) => s + acc(w), 0) / known.length;
const pool = Object.keys(REAL).filter((w) => w.length >= 3 && w.length <= 5 && REAL[w].r + REAL[w].wr >= 8);
const meanPool = pool.reduce((s, w) => s + acc(w), 0) / pool.length;
console.log(`  distinct words served: ${Object.keys(seen).length}`);
console.log(`  mean reading accuracy of what he is served: ${Math.round(100*meanDrawn)}%`);
console.log(`  mean reading accuracy of the eligible pool:  ${Math.round(100*meanPool)}%`);
console.log("  length mix: " + JSON.stringify(drawn.reduce((m, w) => ((m[w.length] = (m[w.length] || 0) + 1), m), {})));
console.log("  most served: " + Object.entries(seen).sort((a, b) => b[1] - a[1]).slice(0, 8)
  .map(([w, c]) => `${w}\u00d7${c}`).join(" "));

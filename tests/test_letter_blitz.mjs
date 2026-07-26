// Buchstaben-Blitz: the letterform discrimination drill.
//
// b and d are the same shape mirrored, m and n the same arch once or twice.
// That is a looking problem, and the main loop is a bad place to fix it — a
// b/d contrast turns up in about one question in six, so 50 reps would cost
// ~300 questions. A real export had 36 errors across those two pairs, 21 of
// them b/d.
//
// What must hold:
//   1. the mode is *temporary* — it appears only while a shape pair is above
//      threshold, and is absent otherwise. A permanent extra button on the
//      start screen is a cost paid by every child who doesn't need it;
//   2. it flashes and masks like the main loop. A side-by-side matching task
//      would be solvable by comparing shapes without identifying a letter;
//   3. scoring lands in L.lp and leaves the reading record alone.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
const READING_FIELDS = ["s", "cc", "iv", "due", "h", "r", "wr", "mx"];

// `der -> ber` is a single b/d substitution, so it lands on the b↔d tally.
const payload = (bdErrors) => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: 9, wr: 1, tn: [4, 4, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], everMastered: true
    };
  }
  words["der"].mx = { ber: bdErrors };
  return {
    de: { v: 2, words, coins: 0, days: {} },
    en: { v: 2, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 5, snd: false }
  };
};

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(bdErrors) {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload(bdErrors)), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  await sleep(400);
  return { dom, window, errs };
}
const btns = (w) => [...w.document.querySelectorAll("button")];
const tiles = (w) => btns(w).filter((b) => b.className.includes("tile"));
const tap = (w, el) => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
const body = (w) => w.document.getElementById("root").textContent;

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

// --- below threshold: the button must not be there --------------------------
const below = await boot(3);
const quietLauncher = btns(below.window).find((b) => b.textContent.trim() === "b d");
console.log("b/d errors = 3, launcher present:", !!quietLauncher);
below.window.close();

// --- above threshold: full round --------------------------------------------
const { window, errs } = await boot(9);
const before = JSON.parse(window.localStorage.getItem("sr.de")).words;
const launcher = btns(window).find((b) => b.textContent.trim() === "b d");
console.log("b/d errors = 9, launcher present:", !!launcher);
tap(window, launcher);
await sleep(200);

// the Bett anchor comes first for b/d, and only for b/d
const anchor = /Bett/.test(body(window));
console.log("Bett anchor shown:", anchor);
if (anchor) { tap(window, btns(window).find((b) => b.textContent.trim() === "\u25B6")); await sleep(150); }

// the item must be masked by the time the tiles are tappable
let sawShow = false, sawMask = false, answers = 0, seen = new Set();
for (let q = 0; q < 15; q++) {
  for (let k = 0; k < 130; k++) {
    const t = tiles(window);
    const armed = t.length === 2 && t[0].parentElement.style.pointerEvents === "auto";
    const txt = body(window);
    if (!armed && t.length === 2 && /[a-zäöü]/.test(txt.replace(/[^a-zäöüß]/g, ""))) sawShow = true;
    if (armed) { sawMask = sawMask || txt.includes("\u25AE"); break; }
    await sleep(15);
  }
  const t = tiles(window);
  if (t.length !== 2) break;
  t.forEach((b) => seen.add(b.textContent.trim()));
  tap(window, t[0]); answers++;
  await sleep(1800);
  if (/\d+ \/ \d+/.test(body(window))) break;
}
console.log("answers given:", answers, "| two tiles every time:", true);
console.log("item was masked before the tiles armed:", sawMask);
const opts = [...seen];
const singles = opts.filter((o) => o.length === 1).length;
const longer = opts.filter((o) => o.length > 2).length;
console.log("option variety — single letters:", singles, "| words:", longer, "| sample:", JSON.stringify(opts.slice(0, 8)));

await sleep(500);
const stored = JSON.parse(window.localStorage.getItem("sr.de"));
const lp = stored.lp || {};
console.log("letter-pair record:", JSON.stringify(lp));

const drifted = [];
for (const w of LVL1) for (const f of READING_FIELDS) {
  if (JSON.stringify(before[w][f]) !== JSON.stringify(stored.words[w][f])) drifted.push(`${w}.${f}`);
}
console.log("reading fields changed by the letter round:", drifted.length, JSON.stringify(drifted.slice(0, 8)));
console.log("uncaught errors:", errs.length);

check("no launcher while the pair is below threshold", !quietLauncher);
check("launcher appears, labelled with the pair, once above it", !!launcher);
check("Bett anchor precedes a b/d round", anchor);
check("round accepts answers", answers >= 4);
check("the item is masked before the tiles arm", sawMask);
check("round covers bare letters and whole words", singles >= 1 && longer >= 1);
check("scored into L.lp under the pair key", !!(lp.bd && lp.bd.r + lp.bd.wr >= 4));
check("reading record untouched", drifted.length === 0);
check("no uncaught errors", errs.length === 0);

window.close();
process.exit(fail);

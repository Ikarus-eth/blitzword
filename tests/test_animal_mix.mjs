// Tier-Blitz — the Krogufant mode.
//
// Three strips, and the name is cut with them: Kro(kodil) + (Ja)gu(ar) +
// (Ele)fant reads "Krogufant". The point of the made-up name is that it has
// never been seen before, so there is no stored whole-word form to match and
// the syllables have to be read. That is the one thing the main loop cannot
// check on its own, and it is why the flash and the mask are here too — a
// side-by-side matching task would be solvable without identifying a letter.
//
// What this pins down:
//
//   1. the launcher is on the home screen and opens a round
//   2. the hybrid name flashes, and the creature and the tiles are NOT on
//      screen while it does — shown early they turn the item into a matching
//      task he can solve without reading
//   3. it is then masked
//   4. four tiles, four different printed fragments. The strips are all
//      plausible animals, so the picture is the reward and never the cue
//   5. results land in L.tm and nowhere else
//   6. NOTHING in L.words moves: not s/cc/iv/due/h/r/wr/tn/d, and no word
//      record is created. A placed strip is not a claim about having read a
//      curriculum word, so it must not touch the repetition schedule or feed
//      either accuracy gate
//   7. a miss holds the screen — four seconds later it is still the same item
//   8. the day record is credited, like the other two games
//   9. m1 (hand-written) and m3 (remapped off the ladder factory) both unlock
//      and are distinct. Their id ranges overlap by construction, and a
//      collision would put two badges in one slot and leave one unreachable
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const SCHEDULE_FIELDS = ["s", "cc", "iv", "due", "h", "r", "wr", "tn", "d"];
const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const words = {};
for (const w of LVL1) {
  words[w] = {
    s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
    r: 9, wr: 1, tn: [4, 4, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], everMastered: true
  };
}
/* 24 Tier-Blitz answers already banked, so the 25th unlocks m3 in the same run
   that the very first one would unlock m1. krogu is set so the one-off
   Krogufant celebration does not interrupt the round mid-way and make the
   item count non-deterministic. */
const payload = {
  de: {
    v: 2, words, coins: 0, days: {},
    tm: { r: 24, wr: 0, seen: { krokodil: 4, elefant: 4, jaguar: 4, giraffe: 4, flamingo: 4, gorilla: 4 }, krogu: true }
  },
  en: { v: 2, words: {}, coins: 0, days: {} },
  meta: { lang: "de", speed: 7, snd: false }      // speed 7 keeps the flash short
};

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const url = "https://example.github.io/blitzword/?import=" +
  encodeURIComponent(Buffer.from(JSON.stringify(payload), "utf8").toString("base64"));
const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
window.speechSynthesis = {
  cancel: () => {}, getVoices: () => [], speak: () => {},
  addEventListener: () => {}, removeEventListener: () => {}
};
window.SpeechSynthesisUtterance = function (t) { this.text = t; };
const errs = [];
window.addEventListener("error", (e) => errs.push(e.error || e.message));

const D = () => window.document;
const btns = () => [...D().querySelectorAll("button")];
const tiles = () => btns().filter((b) => b.className.includes("tile"));
const frags = () => [...D().querySelectorAll("[data-frag]")].map((e) => e.textContent.trim());
const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const flashSpan = () => D().querySelector('[data-mix="flash"]');
const fbSpan = () => D().querySelector('[data-mix="fb"]');
const cont = () => btns().find((b) => b.textContent.trim() === "\u25B6");
const body = () => D().getElementById("root").textContent;
const saved = () => JSON.parse(window.localStorage.getItem("sr.de"));
const daySec = () => (saved().days[iso()] || { s: 0 }).s;

let fail = 0;
const check = (name, cond, detail) => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${detail ? "   " + detail : ""}`);
  if (!cond) fail = 1;
};

await sleep(500);
const before = saved();
const wordsBefore = JSON.stringify(before.words);

// --- 1. launcher -----------------------------------------------------------
const launcher = btns().find((b) => b.getAttribute("aria-label") === "Tier-Blitz");
check("Tier-Blitz launcher on the home screen", !!launcher);
/* three bands and no letters. Counts img OR svg: the strips were vector
   drawings before the illustrations were generated, and either way the point
   of the assertion is that the button is labelled with the exercise itself,
   the way "a e i" and "b d" are, and carries no word to decode. */
check("launcher is labelled with a creature, not a word",
  !!launcher && launcher.querySelectorAll("img, svg").length === 3
  && !/[A-Za-z]/.test(launcher.textContent));
tap(launcher);

// --- 2, 3, 4, 7. play the round -------------------------------------------
let items = 0, sawFlash = "", sawMask = false, tilesDuringFlash = false;
let uniqueFrags = 0, tileCount = 0, heldOnMiss = null;

for (let q = 0; q < 12; q++) {
  // the flash: catch the name, and check nothing answerable is on screen yet
  let name = "";
  for (let k = 0; k < 500; k++) {
    const f = flashSpan();
    if (f) {
      name = f.textContent.trim();
      if (tiles().length) tilesDuringFlash = true;
    }
    if (/\u25AE\u25AE\u25AE\u25AE/.test(body()) && !f) sawMask = true;
    if (tiles().length) break;
    await sleep(10);
  }
  if (!tiles().length) break;
  if (name) sawFlash = name;
  items++;

  if (items === 1) {
    tileCount = tiles().length;
    uniqueFrags = new Set(frags()).size;
  }

  tap(tiles()[0]);
  await sleep(320);

  if (cont() && heldOnMiss === null) {
    // a miss: the screen must not move on its own. The old feedback timer was
    // 1900 ms, so sit here well past that.
    const shown = (fbSpan() || {}).textContent;
    await sleep(4200);
    const still = (fbSpan() || {}).textContent;
    heldOnMiss = !!shown && still === shown && !!cont();
    console.log(`miss on item ${items}: still showing ${JSON.stringify(still)} after 4.2 s`);
  }
  if (cont()) { tap(cont()); await sleep(200); }
  await sleep(500);
  if (!tiles().length && !flashSpan()) break;     // round finished
}

console.log(`\nplayed ${items} items | last flashed name ${JSON.stringify(sawFlash)}`);
check("the hybrid name flashes", /^[A-Za-zÄÖÜäöüß]{5,}$/.test(sawFlash), sawFlash);
check("the creature and tiles stay hidden during the flash", !tilesDuringFlash);
check("the name is masked before the tiles appear", sawMask);
check("four answer tiles", tileCount === 4, `got ${tileCount}`);
check("four different printed fragments", uniqueFrags === 4, `got ${uniqueFrags}`);
check("a miss holds the screen, no auto-advance", heldOnMiss === true,
  heldOnMiss === null ? "no miss occurred in the round" : "");

// --- 5, 6, 8. where the results went ---------------------------------------
await sleep(1500);                                 // outsit the 1200 ms save debounce
const after = saved();
const tm = after.tm || {};
const answered = (tm.r || 0) + (tm.wr || 0) - 24;
console.log(`L.tm: ${JSON.stringify({ r: tm.r, wr: tm.wr, krogu: tm.krogu })} | new answers ${answered}`);
check("results land in L.tm", answered >= 5, `${answered} recorded`);
check("L.tm keeps a per-animal tally", Object.keys(tm.seen || {}).length >= 6);
check("the day record is credited", daySec() > 0, `${daySec().toFixed(1)}s`);

// --- 6. isolation ----------------------------------------------------------
const wordsAfter = JSON.stringify(after.words);
check("no word record was created or removed",
  Object.keys(after.words).length === Object.keys(before.words).length,
  `${Object.keys(before.words).length} -> ${Object.keys(after.words).length}`);
const drifted = [];
for (const w of Object.keys(before.words)) {
  const a = before.words[w], b = after.words[w] || {};
  for (const f of SCHEDULE_FIELDS) {
    if (JSON.stringify(a[f]) !== JSON.stringify(b[f])) drifted.push(`${w}.${f}`);
  }
}
check("no scheduling or accuracy field moved", drifted.length === 0, drifted.slice(0, 6).join(", "));
check("L.words is untouched in full", wordsAfter === wordsBefore);

// --- 9. badge ids ----------------------------------------------------------
const ach = (JSON.parse(window.localStorage.getItem("sr.ach") || "{}").de || {}).unlocked || {};
const mIds = Object.keys(ach).filter((k) => /^m\d/.test(k)).sort();
console.log("Tier-Blitz badges unlocked:", JSON.stringify(mIds));
check("m1 (hand-written) unlocked on the first answer", !!ach.m1);
check("m3 (remapped ladder, 25 answers) unlocked", !!ach.m3);
check("m4 (100 answers) correctly still locked", !ach.m4);
check("m1 and m3 are distinct slots, no id collision",
  !!ach.m1 && !!ach.m3 && new Set(mIds).size === mIds.length);

check("no uncaught errors", errs.length === 0, errs.map(String).slice(0, 3).join(" | "));
window.close();
process.exit(fail);

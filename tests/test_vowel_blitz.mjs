// Vokal-Blitz: the vowel-identity exercise.
//
// Exists because 28% of all wrong tiles in a real export were vowel-only swaps
// with the consonant frame intact (nicht->necht, von->vun, Buch->Boch). German
// vowels carry full information and cannot be inferred from the frame.
//
// Three things must hold, and the third is the one that will quietly break:
//   1. the round runs and shows a blank, not a coloured vowel — a colour cue
//      would make the tile choice solvable without reading the letter;
//   2. results are recorded, in `ws.vk`;
//   3. it does NOT touch the reading record. s / cc / iv / due / h drive the
//      spaced-repetition schedule and the two accuracy gates. A different skill
//      writing into them would silently corrupt both.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];

const HIST = [1, 1, 1, 1, 1, 1, 1, 1, 0, 1];
const READING_FIELDS = ["s", "cc", "iv", "due", "h", "r", "wr"];

const payload = () => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: 9, wr: 1, tn: [4, 4, 0], h: HIST.slice(), everMastered: true,
      mx: { [w.replace(/[aeiouäöü]/, "o")]: 3 }      // a vowel miss, so the queue prefers it
    };
  }
  return {
    de: { v: 2, words, coins: 0, days: {} },
    en: { v: 2, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 5, snd: false }
  };
};

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const url = "https://example.github.io/blitzword/?import=" +
  encodeURIComponent(Buffer.from(JSON.stringify(payload()), "utf8").toString("base64"));
const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
const errs = [];
window.addEventListener("error", (e) => errs.push(e.error || e.message));

const buttons = () => [...window.document.querySelectorAll("button")];
const tiles = () => buttons().filter((b) => b.className.includes("tile"));
const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const body = () => window.document.getElementById("root").textContent;

await sleep(400);
const before = JSON.parse(window.localStorage.getItem("sr.de")).words;

const launcher = buttons().find((b) => b.textContent.trim() === "a e i");
console.log("launcher on the start screen:", !!launcher);
tap(launcher);
await sleep(300);

const blankShown = body().includes("\u25AE");
const optionTexts = tiles().map((b) => b.textContent.trim());
const vowelish = optionTexts.length >= 2 && optionTexts.every((t) => /^[aeiouäöüh]{1,2}$/.test(t));
console.log("blank placeholder shown before answering:", blankShown);
console.log("answer tiles are vowel units:", vowelish, JSON.stringify(optionTexts));

// Tap through a round; correctness does not matter here, coverage does.
// A miss holds until continue is pressed, so the driver presses it — otherwise
// this loop stalls on the first wrong answer and stops testing anything.
let taps = 0, held = 0;
for (let i = 0; i < 16; i++) {
  const t = tiles();
  if (!t.length) break;
  tap(t[0]); taps++;
  await sleep(350);
  const cont = buttons().find((b) => b.textContent.trim() === "\u25B6");
  if (cont) { held++; tap(cont); }
  await sleep(450);
  if (/\d+ \/ \d+/.test(body())) break;   // round summary reached
}
console.log("answers given:", taps, "| misses that held for a tap:", held);
const summary = /\d+ \/ \d+/.test(body());
console.log("round summary shown:", summary);

await sleep(600);
const after = JSON.parse(window.localStorage.getItem("sr.de")).words;

const withVk = Object.entries(after).filter(([, w]) => w.vk && (w.vk.r || w.vk.wr));
console.log("words carrying a vk record:", withVk.length, JSON.stringify(withVk.map(([k]) => k)));

const drifted = [];
for (const w of LVL1) {
  for (const f of READING_FIELDS) {
    if (JSON.stringify(before[w][f]) !== JSON.stringify(after[w][f])) drifted.push(`${w}.${f}`);
  }
}
console.log("reading fields changed by the vowel round:", drifted.length, JSON.stringify(drifted.slice(0, 8)));
console.log("uncaught errors:", errs.length);

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

check("Vokal-Blitz reachable from the start screen", !!launcher);
check("the vowel is blanked, not coloured, while the question is open", blankShown);
check("answer tiles are vowel units", vowelish);
check("the round runs to the end", taps >= 10);
check("a miss held the round until continue was pressed", held >= 1);
check("results recorded in vk across the round", withVk.length >= 6);
check("reading record untouched — s/cc/iv/due/h/r/wr all unchanged", drifted.length === 0);
check("no uncaught errors", errs.length === 0);

process.exit(fail);

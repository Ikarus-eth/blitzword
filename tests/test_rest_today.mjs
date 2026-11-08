// An unfinished word he has read right twice in a row today, with its recent
// window at 80% or better, rests until tomorrow.
//
// Before this, the queue rebuilt about a dozen times in an 11-minute session
// and served every unfinished word in each build, so a word he already had was
// shown all day. Simulated: about a fifth of the reading answers went to words
// already right twice that day.
//
// Asserted here, on a state where level 1 is mostly finished (so level 2 is in
// reach) and four level-1 words are unfinished, answering everything right:
//   1. no word on track is served a third time today (fails on the old build:
//      each queue build served it again)
//   2. a word under the accuracy floor keeps its same-day practice — two right
//      answers cannot lift a window of ten to 80%, so it is not rested (control)
//   3. the freed slots go to new words: more distinct words are met than the
//      four that were open at the start
//   4. no uncaught errors
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const L1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
const ON_TRACK = ["die", "das", "und"];
const WEAK = "der";
const ANSWERS = 40;

const words = () => {
  const w = {};
  /* on track: every recent answer right, never practised on a calendar day
     yet, so two right answers today cannot finish them (mastery needs two days) */
  ON_TRACK.forEach((word) => {
    w[word] = { s: 1, cc: 0, d: [], iv: 0, due: null, r: 5, wr: 0, tn: [5, 0, 0], h: [1, 1, 1, 1, 1], everMastered: false };
  });
  /* under the floor: 2 of 10 right; two more right answers make 4 of 10 */
  w[WEAK] = { s: 1, cc: 0, d: [], iv: 0, due: null, r: 2, wr: 8, tn: [2, 0, 0], h: [0, 0, 0, 0, 0, 0, 0, 0], everMastered: false };
  /* the rest of level 1: finished and not due, which puts level 2 in reach */
  L1.filter((x) => !w[x]).forEach((word) => {
    w[word] = { s: 2, cc: 3, d: ["2026-09-01", "2026-09-02"], iv: 3, due: iso(30), r: 10, wr: 0,
      tn: [10, 5, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], everMastered: true };
  });
  return w;
};
const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let fail = 0;
const check = (name, cond, detail = "") => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${detail ? "   " + detail : ""}`);
  if (!cond) fail = 1;
};

const payload = {
  de: { v: 3, words: words(), coins: 0, days: {} },
  en: { v: 3, words: {}, coins: 0, days: {} },
  meta: { lang: "de", speed: 7, snd: false }
};
const url = "https://example.github.io/blitzword/?import=" +
  encodeURIComponent(Buffer.from(JSON.stringify(payload), "utf8").toString("base64"));
const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom; const doc = window.document;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
window.speechSynthesis = { cancel() {}, getVoices: () => [], speak() {}, addEventListener() {}, removeEventListener() {} };
window.SpeechSynthesisUtterance = function (t) { this.text = t; };
const errs = [];
window.addEventListener("error", (e) => errs.push(e.error || e.message));
const btns = () => [...doc.querySelectorAll("button")];
const tiles = () => btns().filter((b) => b.className.includes("tile"));
const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const find = (t) => btns().find((b) => b.textContent.trim() === t);
const armed = () => tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto";
const wordSpan = () => [...doc.querySelectorAll("span")]
  .find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && !s.closest("button"));

await sleep(550);
tap(find("▶"));
for (let k = 0; k < 800 && tiles().length < 4; k++) await sleep(10);
const order = [];
for (let i = 0; i < ANSWERS; i++) {
  let target = "";
  for (let k = 0; k < 800 && !target; k++) { const w = wordSpan(); if (!armed() && w) target = w.textContent.trim(); await sleep(8); }
  for (let k = 0; k < 800 && !armed(); k++) await sleep(8);
  if (!target) break;
  order.push(target);
  /* always right: a miss would re-queue the word and reset its run */
  tap(tiles().find((b) => b.textContent.trim() === target));
  /* wait for the next word to replace this one, rather than a flat sleep —
     a tap that lands in the feedback stage is silently lost */
  for (let k = 0; k < 600 && armed(); k++) await sleep(8);
}
window.close();

const count = {};
order.forEach((w) => { count[w] = (count[w] || 0) + 1; });
console.log(`${order.length} answers:`, order.join(" "));
check("all answers were given", order.length === ANSWERS, `${order.length}/${ANSWERS}`);
const over = Object.entries(count).filter(([w, n]) => w !== WEAK && n > 2);
check("no word on track is served a third time today", over.length === 0,
  over.map(([w, n]) => `${w}×${n}`).join(" ") || "none");
check("the three on-track words were each met", ON_TRACK.every((w) => count[w] >= 1),
  ON_TRACK.map((w) => `${w}×${count[w] || 0}`).join(" "));
check("a word under the accuracy floor keeps its same-day practice", (count[WEAK] || 0) >= 3,
  `${WEAK}×${count[WEAK] || 0}`);
check("freed slots go to new words", Object.keys(count).length > 4, `${Object.keys(count).length} distinct words`);
check("no uncaught errors", errs.length === 0, errs.map(String).join(" | "));
process.exit(fail);

// Ten minutes on the ring must be ten minutes at the iPad.
//
// The ⏱ ring fills at days[today].s = 600 and the flame needs the same number,
// so that figure is the app's answer to "has he practised today". It used to be
// assembled from `DUR[speed] + response`, which is a proxy for time on task and
// a leaky one: it counted the flash and his answer and dropped the 500 ms
// fixation dot, the 950 ms feedback on a correct answer, and the whole
// hold-on-miss dwell, which has no timer on it by design.
//
// Measured here against the old build: 16.8 s credited for 28.1 s of play, so
// the ring closed after about 17 real minutes instead of 10. It also got worse
// as accuracy fell, because the stages it dropped are the ones a miss is made
// of — a bad session was charged a longer sit than a good one.
//
// Active time is now the span between consecutive answers, capped at IDLE_MAX
// (30 s). Every millisecond of the loop lands in exactly one span and none in
// two, and an abandoned screen earns the cap once and nothing after.
//
//   1. credited time tracks the loop's wall clock. This is the assertion that
//      fails against the old build — it credited 60% of it.
//   2. and never exceeds it: no stretch is billed twice.
//   3. a 34 s stall credits IDLE_MAX, not 34 s. Idle still earns nothing, which
//      was the whole point of the original rule and is what the cap preserves.
//   4. the badge gallery earns nothing, and the visit is not billed to the
//      first answer after coming back.
//   5. chunk pacing is untouched. A chunk is CHUNK_SEC of *work*, not of wall
//      clock; pacing it by the clock would shrink it from ~50 questions to ~27.
//
// Note the 1200 ms save debounce: days[today].s is read back out of
// localStorage, so every read has to sit out SETTLE first or it reports the
// figure from one answer ago. Assertion 3 also costs ~35 s of real sleeping —
// unavoidable, the cap is 30 s and the test has to outsit it.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const DUR = [7500, 5000, 3500, 2500, 1500, 850, 700, 500, 350, 250];
const SPEED = 5;                        // DUR[5] = 850 ms
const CHUNK_SEC = 150, CHUNK_Q = 50;
const IDLE_MAX = 30;
const SETTLE = 1500;                    // > the 1200 ms scheduleSave debounce

const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const payload = {
  de: { v: 2, words: {}, coins: 0, days: {} },
  en: { v: 2, words: {}, coins: 0, days: {} },
  meta: { lang: "de", speed: SPEED, snd: false }
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

const btns = () => [...window.document.querySelectorAll("button")];
const tiles = () => btns().filter((b) => b.className.includes("tile"));
const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const find = (t) => btns().find((b) => b.textContent.trim() === t);
const armed = () => tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto";
const wordSpan = () => [...window.document.querySelectorAll("span")]
  .find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && !s.closest("button"));
const chunkFrac = () => {
  const el = window.document.querySelector("[data-chunk]");
  return el ? Number(el.getAttribute("data-chunk")) : null;
};
const daySec = () => {
  const raw = window.localStorage.getItem("sr.de");
  if (!raw) return 0;
  return (JSON.parse(raw).days[iso()] || { s: 0 }).s;
};
const settled = async () => { await sleep(SETTLE); return daySec(); };

let fail = 0;
const check = (name, cond, detail) => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${detail ? "   " + detail : ""}`);
  if (!cond) fail = 1;
};

/* Waits out feedback, fixation and flash, catching the target on the way past
   so the answer can be deliberately correct. A correct answer has a fixed
   950 ms feedback stage, which is what makes the arithmetic below predictable.
   The tiles stay mounted and live through feedback, so `armed` is true then —
   the capture only fires during the flash, when it is false and a word is up. */
async function nextTarget() {
  let target = "";
  for (let k = 0; k < 800 && !target; k++) {
    const w = wordSpan();
    if (!armed() && w) target = w.textContent.trim();
    await sleep(10);
  }
  for (let k = 0; k < 800 && !armed(); k++) await sleep(10);
  return target;
}

await sleep(400);
check("start button on home", !!find("\u25B6"));
const t0 = Date.now();
tap(find("\u25B6"));
for (let k = 0; k < 800 && tiles().length < 4; k++) await sleep(15);
check("reading loop reached", tiles().length >= 4);

// --- 1, 2, 5. credited time vs the loop's wall clock, and chunk pacing -----
// Deliberately slow and deliberately correct: 6 items, 2.5 s on the tiles. Per
// item the loop really spends 0.5 (fixation) + 0.85 (flash) + 2.5 (his answer)
// + 0.95 (feedback) = 4.8 s, of which the old proxy credited 3.35.
const DWELL = 2500, N = 6;
let answered = 0, tEnd = t0;
for (let q = 0; q < N; q++) {
  const target = await nextTarget();
  if (!target) break;
  await sleep(DWELL);
  const right = tiles().find((b) => b.textContent.trim() === target);
  if (!right) break;
  tap(right); answered++; tEnd = Date.now();
  await sleep(150);
  if (find("\u25B6")) { tap(find("\u25B6")); await sleep(150); }   // a miss slipped through
}
const wall = (tEnd - t0) / 1000;
const credited = await settled();
console.log(`\nplayed ${answered} items | wall ${wall.toFixed(1)}s | credited ${credited.toFixed(1)}s` +
  ` | ${Math.round(100 * credited / wall)}% of the clock`);

check("six items answered", answered === N, `got ${answered}`);
check("credited time tracks the loop's wall clock",
  credited >= wall * 0.8,
  `${credited.toFixed(1)}s of ${wall.toFixed(1)}s = ${Math.round(100 * credited / wall)}%`);
check("and never exceeds it — no stretch billed twice",
  credited <= wall + 1, `${credited.toFixed(1)}s vs ${wall.toFixed(1)}s`);

const workSec = answered * (DUR[SPEED] / 1000 + DWELL / 1000);
const expected = Math.min(1, Math.max(workSec / CHUNK_SEC, answered / CHUNK_Q));
const gotFrac = chunkFrac();
console.log(`chunk bar ${gotFrac} | work-based expectation ${expected.toFixed(4)}` +
  ` | wall-based would be ${(credited / CHUNK_SEC).toFixed(4)}`);
check("chunk still paced by work done, not by time on the iPad",
  gotFrac !== null && Math.abs(gotFrac - expected) < 0.025,
  `got ${gotFrac}, expected ~${expected.toFixed(4)}`);

// --- 3. a long stall credits the cap, not the stall ------------------------
const beforeStall = credited;
const target2 = await nextTarget();
check("next item presented for the stall probe", !!target2);
console.log(`\nstalling ${IDLE_MAX + 4}s on one item…`);
await sleep((IDLE_MAX + 4) * 1000);
const right2 = tiles().find((b) => b.textContent.trim() === target2);
check("the stalled item is still on screen", !!right2);
tap(right2);
const stallCredit = (await settled()) - beforeStall;
console.log(`a ${IDLE_MAX + 4}s stall credited ${stallCredit.toFixed(1)}s`);
check("an abandoned screen is capped at IDLE_MAX",
  stallCredit <= IDLE_MAX + 1.5, `credited ${stallCredit.toFixed(1)}s`);
check("and the capped span still pays that much",
  stallCredit >= IDLE_MAX - 1.5, `credited ${stallCredit.toFixed(1)}s`);

// --- 4. the trophy gallery is not practice --------------------------------
if (find("\u25B6")) { tap(find("\u25B6")); await sleep(200); }   // clear a pending miss
tap(find("🏠"));
await sleep(400);
const beforeGallery = await settled();
const trophy = btns().find((b) => b.textContent.includes("🏆"));
check("trophy button reachable from home", !!trophy);
tap(trophy);
await sleep(3000);                                  // three seconds of browsing
check("browsing the gallery credits nothing",
  daySec() === beforeGallery, `${beforeGallery.toFixed(1)} -> ${daySec().toFixed(1)}`);
tap(find("\u2B05"));                                // ⬅ back to home
await sleep(400);

// The first answer after coming back must be billed from re-entry, not from
// whenever he last answered before wandering off to the trophies.
tap(find("\u25B6"));
for (let k = 0; k < 800 && tiles().length < 4; k++) await sleep(15);
check("returned to the reading loop", tiles().length >= 4);
const target3 = await nextTarget();
await sleep(400);
tap(tiles().find((b) => b.textContent.trim() === target3) || tiles()[0]);
const resumeCredit = (await settled()) - beforeGallery;
console.log(`first answer after the gallery credited ${resumeCredit.toFixed(1)}s`);
check("the gallery visit is not billed to the next answer",
  resumeCredit > 0 && resumeCredit < 4.5, `credited ${resumeCredit.toFixed(1)}s`);

check("no uncaught errors", errs.length === 0, errs.map(String).join(" | "));
window.close();
process.exit(fail);

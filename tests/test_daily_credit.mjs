// A minute is worth the same wherever he spent it.
//
// The ⏱ ring on the start screen and the 🔥 flame both read days[today].s, and
// both mini-games have always added to it. Two things did not follow:
//
//   1. the b/d drill credited only the response window, not the flash, while
//      the reading loop credits DUR + response. At turtle speed the flash is
//      most of the item, so the drill he is sent to when reading is going badly
//      paid a fraction of what reading paid for the same time on the iPad;
//   2. the 15-minute (+10) and 25-minute (+25) coin milestones were checked
//      only inside the reading loop's answer handler. Time spent in a mini-game
//      moved the ring past the mark without paying, and a day that ended inside
//      a mini-game lost the bonus for good.
//
// All three games now go through creditDay(). If someone inlines the day record
// back into one handler, the milestone assertions below fail.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// speed 4 => the b/d ramp runs DUR[4]/DUR[5]/DUR[6] = 1500/850/700 ms, so every
// answered item carries at least 0.7 s of flash the old code threw away.
const MIN_EXPOSURE = 0.7;

const payload = (day) => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: 9, wr: 1, tn: [4, 4, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], everMastered: true,
      mx: { [w.replace(/[aeiouäöü]/, "o")]: 3 }        // vowel misses feed the Vokal-Blitz queue
    };
  }
  words["der"].mx = { ber: 9, dor: 3 };                // a b↔d substitution, above the drill threshold
  return {
    de: { v: 2, words, coins: 0, days: day ? { [iso()]: day } : {} },
    en: { v: 2, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 4, snd: false }
  };
};

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(day) {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload(day)), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  await sleep(400);
  const btns = () => [...window.document.querySelectorAll("button")];
  const tiles = () => btns().filter((b) => b.className.includes("tile"));
  const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const body = () => window.document.getElementById("root").textContent;
  const stored = () => JSON.parse(window.localStorage.getItem("sr.de"));
  const today = () => stored().days[iso()] || { s: 0, b1: 0, b2: 0 };
  return { window, errs, btns, tiles, tap, body, stored, today };
}

// Plays up to `n` answers of a b/d round. Wrong answers hold the screen, so the
// continue button is pressed; without that the loop stalls on the first miss.
async function playLetters(h, n) {
  const launcher = h.btns().find((b) => b.textContent.trim() === "b d");
  if (!launcher) return { launcher: false, answers: 0 };
  h.tap(launcher);
  await sleep(200);
  if (/Bett/.test(h.body())) { h.tap(h.btns().find((b) => b.textContent.trim() === "\u25B6")); await sleep(150); }
  let answers = 0;
  for (let q = 0; q < n; q++) {
    for (let k = 0; k < 250; k++) {
      const t = h.tiles();
      if (t.length === 2 && t[0].parentElement.style.pointerEvents === "auto") break;
      await sleep(15);
    }
    const t = h.tiles();
    if (t.length !== 2) break;
    h.tap(t[0]); answers++;                            // answer at once: response window ~0
    await sleep(350);
    const cont = h.btns().find((b) => b.textContent.trim() === "\u25B6");
    if (cont) h.tap(cont);
    await sleep(250);
    if (/\d+ \/ \d+/.test(h.body())) break;
  }
  await sleep(400);
  return { launcher: true, answers };
}

async function playVowel(h, n, dwell) {
  const launcher = h.btns().find((b) => b.textContent.trim() === "a e i");
  if (!launcher) return { launcher: false, answers: 0 };
  h.tap(launcher);
  await sleep(300);
  let answers = 0;
  for (let q = 0; q < n; q++) {
    const t = h.tiles();
    if (!t.length) break;
    await sleep(dwell);                                 // a response window worth counting
    h.tap(t[0]); answers++;
    await sleep(350);
    const cont = h.btns().find((b) => b.textContent.trim() === "\u25B6");
    if (cont) h.tap(cont);
    await sleep(400);
    if (/\d+ \/ \d+/.test(h.body())) break;
  }
  await sleep(400);
  return { launcher: true, answers };
}

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

// --- 1. the b/d drill credits the flash, not just the response --------------
const a = await boot(null);
const aBefore = a.today().s;
const aRound = await playLetters(a, 8);
const aAfter = a.today().s;
console.log("b/d answers:", aRound.answers, "| day.s", aBefore, "->", aAfter.toFixed(2),
  "| exposure floor:", (aRound.answers * MIN_EXPOSURE).toFixed(2));
check("b/d launcher present above threshold", aRound.launcher);
check("b/d round answered", aRound.answers >= 5);
check("b/d practice moves the daily total", aAfter > aBefore);
check("b/d credits the flash, not only the response window",
  aAfter - aBefore >= aRound.answers * MIN_EXPOSURE);
check("no uncaught errors (b/d)", a.errs.length === 0);
a.window.close();

// --- 2. the 15-minute milestone pays from inside the b/d drill --------------
const b = await boot({ s: 893, b1: 0, b2: 0 });
const bRound = await playLetters(b, 8);
const bDay = b.today();
console.log("seeded 893 s -> day.s", bDay.s.toFixed(2), "| b1:", bDay.b1, "| coins:", b.stored().coins);
check("crossed the 15-minute mark inside the drill", bDay.s >= 900);
check("b1 milestone flagged from a mini-game answer", bDay.b1 === 1);
check("the +10 coins were actually paid", b.stored().coins >= 10);
check("no uncaught errors (b/d milestone)", b.errs.length === 0);
b.window.close();

// --- 3. the 25-minute milestone pays from inside Vokal-Blitz ----------------
const c = await boot({ s: 1497, b1: 1, b2: 0 });
const cRound = await playVowel(c, 10, 600);
const cDay = c.today();
console.log("vowel answers:", cRound.answers, "| seeded 1497 s -> day.s", cDay.s.toFixed(2),
  "| b2:", cDay.b2, "| coins:", c.stored().coins);
check("Vokal-Blitz round answered", cRound.answers >= 3);
check("Vokal-Blitz practice moves the daily total", cDay.s > 1497);
check("crossed the 25-minute mark inside Vokal-Blitz", cDay.s >= 1500);
check("b2 milestone flagged from a mini-game answer", cDay.b2 === 1);
check("the +25 coins were actually paid", c.stored().coins >= 25);
check("b1 was not re-paid", cDay.b1 === 1);
check("no uncaught errors (vowel milestone)", c.errs.length === 0);
c.window.close();

process.exit(fail);

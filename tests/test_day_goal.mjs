// The ⏱ ring and the day's credit must be the same test.
//
// The ring printed Math.round(sec / 6) clamped at 100; calcStreak and the flame
// tested sec >= 600. Everything in [597, 600) therefore displayed 100% and
// counted for nothing. He stops the moment the ring reads full, so the dead
// window is where real sessions land: in the reference export half of all full
// sessions ended within six seconds of the goal, and two of twelve fell inside
// it — 599.715 s and 598.076 s. The second cost a five-day streak he had done
// the work for, and the day-streak badge that went with it.
//
// Two things are asserted here:
//   1. equivalence — across a sweep of day totals, "the ring says 100%" and
//      "today counts towards the streak" agree on every value. Against the old
//      build 598.076 shows 100% with a streak of 0, and the sweep fails.
//   2. the v3 migration pays out the days the old display promised, once, and
//      writes the repair to storage rather than re-deriving it every load.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];

const words = () => {
  const w = {};
  for (const x of LVL1) {
    w[x] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: 9, wr: 1, tn: [4, 4, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], everMastered: true
    };
  }
  return w;
};

// `v` is the saved-format version the payload claims — v2 is a pre-repair save.
const payload = (days, v = 2) => ({
  de: { v, words: words(), coins: 0, days },
  en: { v, words: {}, coins: 0, days: {} },
  meta: { lang: "de", speed: 4, snd: false }
});

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(days, v) {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload(days, v)), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  await sleep(450);
  const body = () => window.document.getElementById("root").textContent;
  const stored = () => JSON.parse(window.localStorage.getItem("sr.de"));
  return { window, errs, body, stored };
}

// The German language card carries "🔥<streak>" and "⏱<pct>% <today>".
const readCard = (text) => {
  const m = /🔥(\d+)⏱(\d+)%/.exec(text.replace(/\s+/g, ""));
  return m ? { streak: Number(m[1]), pct: Number(m[2]) } : null;
};

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

// --- 1. equivalence sweep ---------------------------------------------------
// Yesterday is well over the goal, so the streak is 1 + (today counts or not).
// "ring reads 100%" and "today counts" must agree at every point.
const SWEEP = [0, 300, 596.9, 598.076, 599.715, 599.999, 600, 640, 1200];
const rows = [];
for (const s of SWEEP) {
  const h = await boot({ [iso(-1)]: { s: 800, b1: 0, b2: 0 }, [iso()]: { s, b1: 0, b2: 0 } }, 3);
  const card = readCard(h.body());
  rows.push({ s, ...card, errs: h.errs.length });
  h.window.close();
}
console.log("  sec      ring%   streak   today counted");
for (const r of rows) {
  console.log(`  ${String(r.s).padEnd(8)} ${String(r.pct).padStart(4)}%   ${r.streak}        ${r.streak === 2 ? "yes" : "no"}`);
}
check("every sweep point rendered", rows.every((r) => r && typeof r.pct === "number"));
check("no uncaught errors in sweep", rows.every((r) => r.errs === 0));
check("ring shows 100% exactly when the day counts",
  rows.every((r) => (r.pct === 100) === (r.streak === 2)));
check("598.076 s does not read as a finished day", (rows.find((r) => r.s === 598.076) || {}).pct === 99);
check("600 s does read as a finished day", (rows.find((r) => r.s === 600) || {}).pct === 100);

// --- 1b. the goal moved to 660 and history has to survive it -----------------
// Raising the constant alone would have been silently destructive. His whole
// English run sits between 601 and 659 seconds — seventeen days for seventeen,
// every one of them under 660 — and because the streak is derived rather than
// stored it would have recomputed from 16 to 0 the next time he opened the app.
// A day is measured against the goal that was in force when he practised it.
const oldDays = {};
for (let i = 1; i <= 16; i++) oldDays[iso(-i)] = { s: 601 + (i % 50), b1: 0, b2: 0 };
const legacy = await boot({ ...oldDays, [iso()]: { s: 0, b1: 0, b2: 0 } }, 3);
const legacyCard = readCard(legacy.body());
check("sixteen days between 601 and 659 s still count after the goal rose to 660",
  legacyCard.streak === 16);
legacy.window.close();

// and a day stamped with the new goal is measured against the new goal
const SWEEP2 = [640, 659.9, 660, 700];
const rows2 = [];
for (const s of SWEEP2) {
  const h = await boot({ [iso(-1)]: { s: 800, b1: 0, b2: 0, g: 660 },
                         [iso()]: { s, b1: 0, b2: 0, g: 660 } }, 3);
  rows2.push({ s, ...readCard(h.body()), errs: h.errs.length });
  h.window.close();
}
console.log("  sec      ring%   streak   (goal 660)");
for (const r of rows2) console.log(`  ${String(r.s).padEnd(8)} ${String(r.pct).padStart(4)}%   ${r.streak}`);
check("at goal 660 the ring still reads 100% exactly when the day counts",
  rows2.every((r) => (r.pct === 100) === (r.streak === 2)));
check("659.9 s is not a finished 11-minute day", (rows2.find((r) => r.s === 659.9) || {}).pct === 99);
check("660 s is", (rows2.find((r) => r.s === 660) || {}).pct === 100);
check("640 s would have finished a 10-minute day but does not finish an 11-minute one",
  (rows2.find((r) => r.s === 640) || {}).streak === 1);
check("no uncaught errors at the new goal", rows2.every((r) => r.errs === 0));

// --- 2. the v3 repair pays out the lost days --------------------------------
// The shape of the real export: four clear days, then 598.076 s, then today.
// Correct answer is a six-day streak; the unrepaired save gives one.
const days = {
  [iso(-5)]: { s: 627.578, b1: 0, b2: 0 },
  [iso(-4)]: { s: 604.895, b1: 0, b2: 0 },
  [iso(-3)]: { s: 603.321, b1: 0, b2: 0 },
  [iso(-2)]: { s: 782.782, b1: 0, b2: 0 },
  [iso(-1)]: { s: 598.076, b1: 0, b2: 0 },
  [iso()]: { s: 646.428, b1: 0, b2: 0 }
};
const m = await boot(days, 2);
const mCard = readCard(m.body());
const mStored = m.stored();
console.log("after migration: streak", mCard && mCard.streak, "| v", mStored.v,
  "| yesterday", mStored.days[iso(-1)].s);
check("a save that displayed 100% yesterday keeps the streak alive",
  mCard && mCard.streak === 6);
check("the repaired day is written to storage, not just held in memory",
  mStored.days[iso(-1)].s >= 600 && mStored.v === 3);
check("a day he really did stop short of is left alone",
  mStored.days[iso(-5)].s === 627.578 && mStored.days[iso(-2)].s === 782.782);
check("no uncaught errors (migration)", m.errs.length === 0);
m.window.close();

// --- 3. the repair does not invent days -------------------------------------
// 540 s never displayed 100% under the old rule either, so it stays uncredited.
const n = await boot({ [iso(-1)]: { s: 540, b1: 0, b2: 0 }, [iso()]: { s: 700, b1: 0, b2: 0 } }, 2);
const nCard = readCard(n.body());
console.log("540 s yesterday -> streak", nCard && nCard.streak);
check("a genuinely short day is not credited by the repair", nCard && nCard.streak === 1);
check("no uncaught errors (short day)", n.errs.length === 0);
n.window.close();

console.log(fail ? "SOME CHECKS FAILED" : "all checks passed");
process.exit(fail);

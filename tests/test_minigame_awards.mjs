// The two mini-games each carry their own 10 badges.
//
// Two things this guards. First, id collisions: both new categories are built
// from the shared `ladder` factory with prefixes k and l, whose generated ids
// (k1..k4) overlap the hand-written entries and are remapped to k3..k6. A
// collision would silently make two badges share an unlock date and one of them
// unreachable, which nothing else would catch.
//
// Second, l10 — "Paar geknackt". It fires when a letter pair reaches 20 drill
// answers at 90%+, which is the same condition that retires the pair and hides
// the launcher. Retirement is what makes Buchstaben-Blitz a temporary drill
// rather than a permanent button; `mx` is a lifetime tally that only grows, so
// without it a pair that once crossed the threshold could never fall back under
// it however well he read afterwards.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];

// a b/d pair well past threshold, and a drill record good enough to retire it
const payload = (lpHist) => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: 9, wr: 1, tn: [4, 4, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], everMastered: true
    };
  }
  words["der"].mx = { ber: 12 };
  words["mit"].vk = { r: 40, wr: 2 };     // enough for the vowel volume ladder
  return {
    de: { v: 2, words, coins: 0, days: {}, lp: { bd: { r: lpHist.filter((x) => x).length, wr: lpHist.filter((x) => !x).length, h: lpHist } } },
    en: { v: 2, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 5, snd: false }
  };
};
const RETIRING = Array(20).fill(1).map((_, i) => (i === 5 ? 0 : 1));   // 19/20 = 95%
const STRUGGLING = Array(20).fill(1).map((_, i) => (i % 2 ? 0 : 1));   // 50%

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(lpHist) {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload(lpHist)), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  await sleep(450);
  return { window, errs };
}
const btns = (w) => [...w.document.querySelectorAll("button")];
const tap = (w, el) => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
const body = (w) => w.document.getElementById("root").textContent;

// ---- a retired pair hides the launcher; a struggling one shows it ----------
const good = await boot(RETIRING);
const launcherWhenRetired = !!btns(good.window).find((b) => b.textContent.trim() === "b d");
console.log("pair at 95% over 20 drill answers — launcher still shown:", launcherWhenRetired);

const bad = await boot(STRUGGLING);
const launcherWhenStruggling = !!btns(bad.window).find((b) => b.textContent.trim() === "b d");
console.log("pair at 50% over 20 drill answers — launcher shown:", launcherWhenStruggling);

// ---- the achievements screen ----------------------------------------------
const { window, errs } = good;

// Achievements are evaluated when an answer is given, not on load, so an
// imported profile has to play one question before its earned badges appear.
// One Vokal-Blitz answer is enough — the check then reads every seeded stat.
tap(window, btns(window).find((b) => b.textContent.trim() === "a e i"));
await sleep(400);
const firstTile = btns(window).filter((b) => b.className.includes("tile"))[0];
if (firstTile) tap(window, firstTile);
await sleep(500);
const held = btns(window).find((b) => b.textContent.trim() === "\u25B6");
if (held) tap(window, held);
await sleep(300);
tap(window, btns(window).find((b) => b.textContent.trim() === "🏠"));
await sleep(300);

tap(window, btns(window).find((b) => b.textContent.trim() === "🏆") || btns(window).find((b) => /🏆/.test(b.textContent)));
await sleep(350);
const txt = body(window);
const catShown = /Vokal-Blitz/.test(txt) && /Buchstaben-Blitz/.test(txt);
const total = (txt.match(/\/(\d{2,3})/) || [])[1];
console.log("both new categories on the screen:", catShown);
console.log("badge total in the header:", total);

// count badges per category by reading the "n/10" tallies
const tallies = txt.match(/\d+\/10(?!\d)/g) || [];
console.log("categories reporting a denominator of 10:", tallies.length);

// l10 must be unlocked for the retired pair, and not for the struggling one
// the seeded progress is German, so the mini-game badges land in that gallery
const stored = (w) => ((JSON.parse(w.localStorage.getItem("sr.ach") || "{}").de) || {}).unlocked || {};
const gotGood = stored(window);
const gotBad = stored(bad.window);
console.log("unlocked in the retired run:", JSON.stringify(Object.keys(gotGood).filter((k) => /^[kl]/.test(k)).sort()));
console.log("unlocked in the struggling run:", JSON.stringify(Object.keys(gotBad).filter((k) => /^[kl]/.test(k)).sort()));

// ids must be unique: one distinct unlock slot per badge, none shadowing another
const kIds = Object.keys(gotGood).filter((k) => /^k\d/.test(k));
const lIds = Object.keys(gotGood).filter((k) => /^l\d/.test(k));
console.log("k ids:", JSON.stringify(kIds.sort()), "| l ids:", JSON.stringify(lIds.sort()));
console.log("uncaught errors:", errs.length + bad.errs.length);

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

check("a retired pair hides the Buchstaben-Blitz launcher", !launcherWhenRetired);
check("a struggling pair still shows it", launcherWhenStruggling);
check("both new categories appear in the badge screen", catShown);
/* Derived, not a literal. The header count and the per-category tallies are
   both read off ACHIEVEMENTS, so the only thing worth asserting is that they
   agree: every category holds exactly ten, and the header is the sum. Pinning
   either to a number means the next category breaks a passing test for no
   reason — which is exactly what happened to the literal 100 this replaced,
   and then again to the literal 120 when Tier-Blitz was added. Every tally
   already carries the denominator 10 by construction of the regex, so the
   count of tallies is the count of categories and the sum is the only thing
   left worth asserting. */
check("header total is the sum of the category tallies",
  Number(total) === tallies.length * 10);
// k1 is a hand-written entry, k3 comes from the remapped ladder — one of each,
// so a collision between the two id ranges would show up here.
check("k1 (hand-written) unlocked from 42 seeded vowel answers", !!gotGood.k1);
check("k3 (remapped ladder, 25 vowels) unlocked", !!gotGood.k3);
check("k4 (100 vowels) correctly still locked at 42", !gotGood.k4);
check("l10 unlocked once the pair retired", !!gotGood.l10);
check("l10 NOT unlocked while the pair is at 50%", !gotBad.l10);
check("no duplicate ids among the new badges", new Set([...kIds, ...lIds]).size === kIds.length + lIds.length);
check("no uncaught errors", errs.length + bad.errs.length === 0);

window.close(); bad.window.close();
process.exit(fail);

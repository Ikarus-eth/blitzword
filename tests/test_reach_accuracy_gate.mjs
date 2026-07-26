// The practice pool must not grow while the current level is being read badly.
//
// The reach gate was "70% of the level mastered or hot". Words qualify as hot on
// a streak, so in a real export three levels opened in four days while accuracy
// fell from 75% to 59%: the pool kept growing and nothing consolidated. The gate
// now also needs the level's pooled recent accuracy to clear REACH_ACC (70%),
// and only once REACH_MIN_N (15) answers exist — so day 1 can still unlock,
// which DESIGN.md requires.
//
// Differential test: identical word states, different histories. The stack
// screen renders exactly `reach` level cards, so counting them reads the gate
// directly.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];

const LOW = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];    // 50% — under the floor
const HIGH = [1, 1, 1, 1, 1, 1, 1, 1, 0, 1];   // 90% — over it

// All 20 words fully Flüssig, so the *count* half of the gate passes outright
// in both runs. Only accuracy differs.
const payload = (hist) => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: hist.filter((x) => x).length, wr: hist.filter((x) => !x).length,
      tn: [4, 4, 0], h: hist.slice(), everMastered: true
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

async function run(label, hist) {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload(hist)), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));

  const buttons = () => [...window.document.querySelectorAll("button")];
  const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const body = () => window.document.getElementById("root").textContent;

  await sleep(400);

  // parent dashboard: does it explain the hold?
  tap(buttons().find((b) => b.textContent.trim() === "\u2699"));
  await sleep(250);
  const explained = /Stufe 2 wartet/.test(body());

  // back home, then the stack screen — one card per reached level
  tap(buttons().find((b) => b.textContent.trim() === "\u2B05" || b.textContent.trim() === "\u2190")
    || buttons()[0]);
  await sleep(200);
  if (!/\u25B6/.test(body())) { tap(buttons()[0]); await sleep(200); }
  tap(buttons().find((b) => b.textContent.trim() === "\uD83D\uDCCA"));
  await sleep(250);
  const cards = (body().match(/Stufe \d+/g) || []).length;

  console.log(`${label}: level cards on the stack screen: ${cards}, dashboard explains the hold: ${explained}, errors: ${errs.length}`);
  window.close();
  return { cards, explained, errs: errs.length };
}

const low = await run("50% accuracy", LOW);
const high = await run("90% accuracy", HIGH);

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

check("50% accuracy: pool held at one level despite 20/20 Flüssig", low.cards === 1);
check("90% accuracy: next level unlocked", high.cards === 2);
check("a held level is explained in the parent dashboard", low.explained);
check("an unheld level shows no hold notice", !high.explained);
check("no uncaught errors", low.errs === 0 && high.errs === 0);

process.exit(fail);

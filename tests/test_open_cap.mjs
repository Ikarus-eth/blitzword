// How many unfinished words may be in play at once.
//
// On the 18 Sep export he was carrying 21 unfinished words and getting two
// answers in three right. Simulated against that state, capping the open set
// and serving the words nearest to finishing lifts the hit rate from 57% to
// 62% and pulls the finishes forward; capping only the pool did nothing,
// because most unfinished words arrive through `due`; serving the weakest
// first finishes almost nothing.
//
// Asserted here, on a state with 12 unfinished words and 2 reviews due:
//   1. at most OPEN_CAP (8) of the unfinished words are served, plus exactly
//      one parked word — the one he has gone longest without
//   2. the parked one is the longest-unseen of those held back, not the next
//      in rank
//   3. the words held back do not appear at all
//   4. reviews of finished words are never held back
//   5. under the cap nothing is held back (control)
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const CAP = 8;
/* level 1 German, in curriculum order */
const L1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
/* twelve unfinished words, recent accuracy falling down the list. Ranked by
   recent accuracy the first eight are kept; sie/es/ein are held back; `wir` is
   held back too but has the oldest last-practice date, so it is the parked one. */
/* every one of them sits under the 80% accuracy gate, so three right answers
   inside the test cannot finish a word and change the open set mid-run */
const OPEN = [
  ["der", 7, "2026-09-10"], ["die", 7, "2026-09-10"], ["das", 6, "2026-09-10"],
  ["und", 6, "2026-09-10"], ["ist", 5, "2026-09-10"], ["ich", 5, "2026-09-09"],
  ["du", 4, "2026-09-10"], ["er", 4, "2026-09-09"],
  ["sie", 3, "2026-09-10"], ["es", 3, "2026-09-09"], ["wir", 3, "2026-07-01"], ["ein", 2, "2026-09-10"]
];
const words = (n) => {
  const w = {};
  OPEN.slice(0, n).forEach(([word, hits, last]) => {
    w[word] = { s: 1, cc: 1, d: ["2026-06-01", last], iv: 0, due: iso(3), r: hits, wr: 10 - hits,
      tn: [hits, 0, 0], h: [...Array(hits).fill(1), ...Array(10 - hits).fill(0)], everMastered: false };
  });
  /* two finished words due today: reviews must never be held back */
  ["eine", "nicht"].forEach((word) => {
    w[word] = { s: 2, cc: 3, d: ["2026-09-01", "2026-09-02"], iv: 1, due: iso(-1), r: 12, wr: 1,
      tn: [12, 6, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], everMastered: true };
  });
  /* the rest of level 1: finished, not due for weeks */
  L1.slice(14).forEach((word) => {
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

async function collect(openCount, answers) {
  const payload = {
    de: { v: 3, words: words(openCount), coins: 0, days: {} },
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
  tap(find("\u25B6"));
  for (let k = 0; k < 800 && tiles().length < 4; k++) await sleep(10);
  const seen = [];
  for (let i = 0; i < answers; i++) {
    let target = "";
    for (let k = 0; k < 800 && !target; k++) { const w = wordSpan(); if (!armed() && w) target = w.textContent.trim(); await sleep(8); }
    for (let k = 0; k < 800 && !armed(); k++) await sleep(8);
    if (!target) break;
    seen.push(target);
    /* answer right: a miss re-queues the word 3-6 items later, and a run of
       misses cycles the same few words forever without ever reaching the rest
       of the queue. Right answers walk the queue as built, which is what this
       test is about. None of these words can finish: they are all under the
       accuracy gate. */
    tap(tiles().find((b) => b.textContent.trim() === target));
    await sleep(200);
  }
  window.close();
  return { order: seen, seen: [...new Set(seen)], errs };
}

// --- twelve unfinished words, cap 8 -----------------------------------------
/* 11 answers is exactly one queue: two reviews interleaved with nine pool words */
const r1 = await collect(12, 22);
const first = [...new Set(r1.order.slice(0, 11))];
const openSeen = first.filter((w) => OPEN.some(([x]) => x === w));
const kept = OPEN.slice(0, CAP).map(([w]) => w);
const held = ["sie", "es", "ein"];
console.log("first queue:", first.join(" "), "\nwhole run:  ", r1.seen.join(" "));
check("at most the cap plus one parked word are served", openSeen.length <= CAP + 1,
  `${openSeen.length} unfinished words served`);
check("the eight nearest to finishing are served", kept.every((w) => openSeen.includes(w)),
  `missing ${kept.filter((w) => !openSeen.includes(w)).join(",") || "none"}`);
check("the parked word is the one longest unseen", openSeen.includes("wir"));
check("the other held-back words never appear", held.every((w) => !openSeen.includes(w)),
  `appeared: ${held.filter((w) => openSeen.includes(w)).join(",") || "none"}`);
check("reviews of finished words are not held back",
  ["eine", "nicht"].every((w) => first.includes(w)),
  `missing ${["eine", "nicht"].filter((w) => !first.includes(w)).join(",") || "none"}`);
/* the parked slot rotates: the next build parks a different one, so over two
   builds at most one more held-back word appears */
const openAll2 = r1.seen.filter((w) => OPEN.some(([x]) => x === w));
check("the parked slot rotates, one word at a time", openAll2.length <= CAP + 2,
  `${openAll2.length} unfinished words over two queues: ${openAll2.join(",")}`);
check("no uncaught errors", r1.errs.length === 0, r1.errs.map(String).join(" | "));

// --- control: five unfinished words, nothing to cap -------------------------
const r2 = await collect(5, 12);
const five = OPEN.slice(0, 5).map(([w]) => w);
check("under the cap every unfinished word is served", five.every((w) => r2.seen.includes(w)),
  `served ${r2.seen.join(" ")}`);
check("no uncaught errors (control)", r2.errs.length === 0, r2.errs.map(String).join(" | "));
process.exit(fail);

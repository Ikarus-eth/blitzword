// Flüssig (level 2) requires recent accuracy, not just a 3-answer streak.
//
// The old gate was "3 consecutive correct on >=2 calendar days". DESIGN.md
// justified it with the 1.6% chance of a random guesser clearing 3-in-a-row.
// That holds for a guesser and fails for a partial learner: a word read
// correctly ~40% of the time clears the same bar ~6% of the time per window,
// and re-queuing hands out dozens of windows per session. A real export had
// 20 of 70 Flüssig words below 70% lifetime accuracy, one of them at 39% —
// words that then took spaced-review intervals and stopped coming back.
//
// Differential test: two identical runs, differing only in seeded per-word
// history (40% vs 90%). Both are fed correct answers, so both build the streak
// the old gate asked for. The 90% run must promote; the 40% run must not.
// Remove the accuracy floor and the two runs become identical, failing here.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];

const LOW = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1];    // 40%
const HIGH = [1, 1, 1, 1, 1, 1, 1, 1, 0, 1];   // 90%
const QUESTIONS = 7;

// Every word sits one correct answer short of the gate: streak 2, two calendar
// days already on record. Only `h` differs between the two runs.
const payload = (hist) => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 1, cc: 2, d: ["2026-07-20", "2026-07-21"], iv: 0, due: null,
      r: hist.filter((x) => x).length, wr: hist.filter((x) => !x).length,
      tn: [3, 3, 0], h: hist.slice(), everMastered: false
    };
  }
  return {
    de: { v: 2, words, coins: 0, days: {} },
    en: { v: 2, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 5, snd: false }   // 850 ms flash: catchable, still quick
  };
};

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LETTERS = /[A-Za-zÄÖÜäöüß]+/g;

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
  const tiles = () => buttons().filter((b) => b.className.includes("tile"));
  const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  // The flashed target is the only non-button span holding a curriculum word.
  // Tiles are always in the DOM (hidden by opacity), so their presence says
  // nothing about the stage; the tile grid's pointer-events does.
  const flashed = () => [...window.document.querySelectorAll("span")]
    .filter((s) => LVL1.includes(s.textContent.trim()) && !s.closest("button"))
    .map((s) => s.textContent.trim());
  const answerable = () => { const t = tiles()[0]; return !!t && t.parentElement.style.pointerEvents === "auto"; };

  await sleep(400);
  tap(buttons().find((b) => b.textContent.trim() === "\u25B6"));

  let answered = 0;
  for (let q = 0; q < QUESTIONS; q++) {
    let target = "";
    for (let k = 0; k < 120 && !target; k++) {          // catch the flash
      const f = flashed();
      if (f.length === 1) target = f[0];
      await sleep(15);
    }
    for (let k = 0; k < 120 && !answerable(); k++) await sleep(15);   // wait for tiles to arm
    const hit = tiles().find((b) => b.textContent.trim() === target);
    if (!hit) continue;
    tap(hit); answered++;                               // deliberately correct
    await sleep(1000);                                  // correct feedback stage is 950 ms
  }

  const stored = JSON.parse(window.localStorage.getItem("sr.de") || "null");
  const words = stored ? stored.words : {};
  const promoted = Object.entries(words).filter(([, w]) => w.s === 2).map(([k]) => k);
  const streaked = Object.values(words).filter((w) => w.cc >= 3).length;
  console.log(`${label}: answered ${answered}, words at streak>=3: ${streaked}, promoted to Flüssig: ${promoted.length} ${JSON.stringify(promoted)}, errors: ${errs.length}`);
  window.close();
  return { promoted: promoted.length, streaked, answered, errs: errs.length };
}

const low = await run("40% history", LOW);
const high = await run("90% history", HIGH);

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

check("both runs answered questions", low.answered >= 3 && high.answered >= 3);
check("both runs built streaks of 3+ — the old gate's entire condition", low.streaked >= 1 && high.streaked >= 1);
check("40% history: streak reached, Flüssig withheld", low.promoted === 0);
check("90% history: Flüssig awarded", high.promoted >= 1);
check("no uncaught errors", low.errs === 0 && high.errs === 0);

process.exit(fail);

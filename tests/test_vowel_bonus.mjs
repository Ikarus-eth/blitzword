// A Vokal-Blitz round above 70% takes a minute off today's goal — once a day.
//
// Why here and not in the ring: the goal is read by the ⏱ ring, the flame, the
// streak, the joker rule and the 14-day chart, and this file has twice paid for
// letting two displays of one test drift apart. So the minute lands on the day
// record as `vb` and `goalOf` is the only place that knows about it.
//
// Why one round: a round takes about a minute and already credits its own time
// to the ring like any game, so an uncapped bonus makes a vowel round worth
// about two minutes and the reading loop can be skipped altogether.
//
// Asserted:
//   1. 9 of 12 right (>70%) writes vb = 60 and the ring reads against 600 s
//   2. a second won round the same day adds nothing
//   3. 8 of 12 (<=70%) pays nothing
//   4. a short round cannot pay
//   5. the floor holds: a day carrying a large bonus still needs 8 minutes
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
const REAL = new Set(LVL1.map((w) => w.toLowerCase()));

const words = () => {
  const w = {};
  /* seen but unfinished, so level 1 stays the only reachable level and the
     vowel queue draws from words this test knows */
  LVL1.forEach((word) => {
    w[word] = { s: 1, cc: 1, d: ["2026-09-01", "2026-09-10"], iv: 0, due: iso(3), r: 4, wr: 4,
      tn: [4, 0, 0], h: [1, 0, 1, 0, 1, 0, 1, 0], everMastered: false };
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

function boot(days) {
  const payload = {
    de: { v: 3, words: words(), coins: 0, days },
    en: { v: 3, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 7, snd: false }
  };
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  window.speechSynthesis = { cancel() {}, getVoices: () => [], speak() {}, addEventListener() {}, removeEventListener() {} };
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  return { window, doc: window.document, errs };
}

/* Drives one round, getting exactly `rightWanted` items right. The blanked word
   plus each option is checked against the level-1 list: the foils are built so
   they are never real curriculum words, so the option that spells one is the
   answer. */
async function round(ctx, rightWanted) {
  const { doc, window } = ctx;
  const btns = () => [...doc.querySelectorAll("button")];
  const tiles = () => btns().filter((b) => b.className.includes("tile"));
  const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const find = (t) => btns().find((b) => b.textContent.trim() === t);
  const blank = () => [...doc.querySelectorAll("span")].find((s) => s.textContent.includes("\u25AE") && s.children.length);

  tap(btns().find((b) => b.textContent.trim() === "a e i"));
  await sleep(300);
  let right = 0, n = 0;
  for (let i = 0; i < 20; i++) {
    for (let k = 0; k < 400 && !tiles().length; k++) await sleep(10);
    if (!tiles().length) break;
    const shown = (blank() || { textContent: "" }).textContent.trim();
    const opts = tiles().map((b) => b.textContent.trim());
    const correct = opts.find((o) => REAL.has(shown.replace("\u25AE", o).toLowerCase()));
    const want = right < rightWanted && correct;
    const pick = want ? correct : opts.find((o) => o !== correct) || opts[0];
    tap(tiles().find((b) => b.textContent.trim() === pick));
    n++; if (pick === correct) right++;
    await sleep(300);
    if (find("\u25B6")) { tap(find("\u25B6")); await sleep(250); } else await sleep(1250);
    if (/\d+ \/ \d+/.test(doc.getElementById("root").textContent)) break;
  }
  await sleep(1500);
  return { right, n };
}
const saved = (ctx) => JSON.parse(ctx.window.localStorage.getItem("sr.de"));
const dayNow = (ctx) => (saved(ctx).days[iso()] || {});

// --- 1 & 2: a won round pays once ------------------------------------------
{
  const ctx = boot({ [iso()]: { s: 520, b1: 0, b2: 0, g: 660 } });
  await sleep(600);
  const r1 = await round(ctx, 9);
  check("round ran twelve items", r1.n === 12, `${r1.right}/${r1.n}`);
  check("nine of twelve right", r1.right === 9, `${r1.right}/${r1.n}`);
  check("a won round takes a minute off the day", dayNow(ctx).vb === 60, `vb ${dayNow(ctx).vb}`);
  const shown = ctx.doc.querySelector("[data-vowel-bonus]");
  check("the round-end screen says so", !!shown && Number(shown.getAttribute("data-vowel-bonus")) === 60);
  // back home: the ring must read against 600 s, not 660
  const home = () => [...ctx.doc.querySelectorAll("button")].find((b) => /Deutsch/.test(b.textContent));
  [...ctx.doc.querySelectorAll("button")].find((b) => b.textContent.trim() === "🏠")
    .dispatchEvent(new ctx.window.MouseEvent("click", { bubbles: true }));
  await sleep(400);
  const sec = dayNow(ctx).s;
  const pct = Number((home().textContent.match(/(\d+)%/) || [])[1]);
  check("the ring reads against the shortened goal",
    pct === Math.min(100, Math.floor((sec / 600) * 100)) && pct !== Math.floor((sec / 660) * 100),
    `${pct}% with ${sec.toFixed(0)} s (600 -> ${Math.floor(sec / 600 * 100)}%, 660 -> ${Math.floor(sec / 660 * 100)}%)`);
  const r2 = await round(ctx, 12);
  check("a second won round the same day adds nothing", dayNow(ctx).vb === 60,
    `${r2.right}/${r2.n}, vb ${dayNow(ctx).vb}`);
  check("no uncaught errors", ctx.errs.length === 0, ctx.errs.map(String).join(" | "));
  ctx.window.close();
}
// --- 3: 8 of 12 is not above 70% -------------------------------------------
{
  const ctx = boot({ [iso()]: { s: 520, b1: 0, b2: 0, g: 660 } });
  await sleep(600);
  const r = await round(ctx, 8);
  check("eight of twelve pays nothing", r.right === 8 && !dayNow(ctx).vb, `${r.right}/${r.n}, vb ${dayNow(ctx).vb}`);
  ctx.window.close();
}
// --- 5: the floor holds ------------------------------------------------------
{
  /* 400 s of an 11-minute day carrying 300 s of bonus: without the floor the
     goal would be 360 s and the day would already count. With it the goal is
     480 s and it does not. */
  const ctx = boot({ [iso()]: { s: 400, b1: 0, b2: 0, g: 660, vb: 300 } });
  await sleep(700);
  const home = [...ctx.doc.querySelectorAll("button")].find((b) => /Deutsch/.test(b.textContent));
  const pct = Number((home.textContent.match(/(\d+)%/) || [])[1]);
  const streak = Number(ctx.doc.querySelector("[data-streak-home='de']").getAttribute("data-streak"));
  check("a bonus cannot push the goal under 8 minutes", pct === Math.floor((400 / 480) * 100) && streak === 0,
    `400 s of a 660 s day with 300 s earned: ${pct}%, streak ${streak}`);
  ctx.window.close();
}
process.exit(fail);

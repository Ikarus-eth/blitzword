// The mini-game launchers are a parent switch, not a self-clearing threshold.
//
// Two assertions matter here and they pull in opposite directions:
//
//   1. b/d must NOT disappear on its own. The old rule retired a pair after 20
//      drill answers at 90%. A real export hit exactly that (18 of the last 20)
//      while the same export carried 35 b/d substitutions in actual reading —
//      8.6% of every error, `der`->`ber` twelve times — and 81% lifetime drill
//      accuracy. The drill was scoring itself and the rule read that as
//      evidence about words. Against the old build the launcher is gone here.
//
//   2. each game can be switched off in the parent dashboard, and off means
//      absent from the start screen, not greyed out.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// `lp.bd` seeded at 18/20 over the rolling window: retired under the old rule.
const RETIRED_BD = { r: 74, wr: 17, h: [1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] };

const payload = (games) => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: 9, wr: 1, tn: [4, 4, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], everMastered: true,
      mx: { [w.replace(/[aeiouäöü]/, "o")]: 3 }
    };
  }
  // b<->d well above LETTER_PAIR_MIN, the shape of the real export
  words["der"].mx = { ber: 12, des: 1 };
  words["da"] = { s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
    r: 17, wr: 10, tn: [4, 4, 0], h: [1, 1, 1, 0, 1, 1, 1, 1, 1, 1], everMastered: true, mx: { ba: 6 } };
  const meta = { lang: "de", speed: 4, snd: false };
  if (games) meta.games = games;
  return {
    de: { v: 3, words, coins: 0, days: { [iso()]: { s: 300, b1: 0, b2: 0 } }, lp: { bd: RETIRED_BD } },
    en: { v: 3, words: {}, coins: 0, days: {} },
    meta
  };
};

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(games) {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload(games)), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  await sleep(450);
  const doc = window.document;
  const btns = () => [...doc.querySelectorAll("button")];
  const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const launcher = (label) => btns().find((b) => b.textContent.trim() === label);
  const mixLauncher = () => btns().find((b) => b.getAttribute("aria-label") === "Tier-Blitz");
  const toggle = (k) => doc.querySelector(`[data-game-toggle="${k}"]`);
  const meta = () => JSON.parse(window.localStorage.getItem("sr.meta") || "{}");
  const openDash = async () => { tap(btns().find((b) => b.textContent.trim() === "⚙")); await sleep(250); };
  const closeDash = async () => {
    const back = btns().find((b) => b.textContent.trim() === "\u2B05");
    if (!back) throw new Error("dashboard back button not found");
    tap(back);
    await sleep(300);
  };
  return { window, errs, btns, tap, launcher, mixLauncher, toggle, meta, openDash, closeDash };
}

let fail = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${extra ? "   " + extra : ""}`);
  if (!cond) fail = 1;
};

// --- 1. b/d stays put even though the drill window says 90% ----------------
const a = await boot(null);
const present = { bd: !!a.launcher("b d"), vowel: !!a.launcher("a e i"), mix: !!a.mixLauncher() };
console.log("launchers with defaults:", JSON.stringify(present));
check("b/d launcher survives a drill window that would have retired it", present.bd);
check("Vokal-Blitz visible by default", present.vowel);
check("Tier-Blitz visible by default", present.mix);
check("no uncaught errors (defaults)", a.errs.length === 0);

// --- 2. switching one off removes it from the start screen -----------------
await a.openDash();
const tg = { vowel: a.toggle("vowel"), letters: a.toggle("letters"), mix: a.toggle("mix") };
check("all three switches render in the dashboard", !!tg.vowel && !!tg.letters && !!tg.mix);
check("switches start on", ["vowel", "letters", "mix"].every((k) => tg[k].getAttribute("data-on") === "1"));
a.tap(tg.letters);
await sleep(120);
check("switch flips to off", a.toggle("letters").getAttribute("data-on") === "0");
await a.closeDash();
console.log("after switching b/d off:", JSON.stringify({
  bd: !!a.launcher("b d"), vowel: !!a.launcher("a e i"), mix: !!a.mixLauncher()
}));
check("b/d gone from the start screen", !a.launcher("b d"));
check("the other two are untouched", !!a.launcher("a e i") && !!a.mixLauncher());
await sleep(750);
check("the switch is written to sr.meta", a.meta().games && a.meta().games.letters === false,
  JSON.stringify(a.meta().games || null));
a.window.close();

// --- 3. an off switch survives a reload ------------------------------------
const b = await boot({ vowel: true, letters: false, mix: false });
console.log("launchers from saved meta:", JSON.stringify({
  bd: !!b.launcher("b d"), vowel: !!b.launcher("a e i"), mix: !!b.mixLauncher()
}));
check("b/d stays off after reload", !b.launcher("b d"));
check("Tier-Blitz stays off after reload", !b.mixLauncher());
check("Vokal-Blitz still on", !!b.launcher("a e i"));
check("no uncaught errors (saved meta)", b.errs.length === 0);
b.window.close();

// --- 4. switching back on brings it back -----------------------------------
const c = await boot({ vowel: true, letters: false, mix: true });
check("starts hidden", !c.launcher("b d"));
await c.openDash();
c.tap(c.toggle("letters"));
await sleep(120);
await c.closeDash();
check("switching back on restores the launcher", !!c.launcher("b d"));
check("no uncaught errors (restore)", c.errs.length === 0);
c.window.close();

console.log(fail ? "SOME CHECKS FAILED" : "all checks passed");
process.exit(fail);

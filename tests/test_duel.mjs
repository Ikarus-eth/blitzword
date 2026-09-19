// The duel above the flash card: his crowned figure against a bandit.
//
// The two constants ARE the rule he asked for. A duel is a race, so the side
// ahead on average is decided by p/DUEL_HP against (1-p)/DUEL_LIVES, and 7
// hits against 3 lives puts that break-even at exactly p = 0.70. Change either
// number and the 70% goes with it, so both are asserted from the DOM.
//
// It is a race rather than an end-of-round accuracy audit because an audit has
// a dead state — once "finish above 70%" is out of reach, every remaining
// answer of the round pays nothing, which is the same shape as the timer that
// used to make error-heavy sessions longer.
//
// Asserted:
//   1. the constants: 7 hits to fell the bandit, 3 lives for the king
//   2. seven correct answers knock the bandit out, and the KO stays on screen
//      until the next answer lands, which is when a fresh bandit appears
//   3. a clean win pays strictly more than one that cost a life
//   4. three misses fell the king, and coins never go down doing it
//   5. the beaten king is replaced on the next answer, not by a timer
//   6. going home and starting again does NOT reroll a duel in progress
//   7. turbo has no duel at all
//   8. nothing in the band animates while the word is on screen
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];

/* Every level-1 word seen once and unfinished: level 1 stays the only
   reachable level, so the queue never leaves the list this test knows. */
const words = () => {
  const w = {};
  LVL1.forEach((word) => {
    w[word] = { s: 1, cc: 1, d: ["2026-09-01", "2026-09-10"], iv: 0, due: iso(3),
      r: 4, wr: 2, tn: [4, 0, 0], h: [1, 1, 0, 1, 1, 0, 1, 1], everMastered: false };
  });
  return w;
};

const html = readFileSync("./index.html", "utf8");
let fail = 0;
const check = (name, cond, detail = "") => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${detail ? "   " + detail : ""}`);
  if (!cond) fail = 1;
};

function boot(ws = words()) {
  const payload = {
    de: { v: 3, words: ws, coins: 0, days: { [iso()]: { s: 0, b1: 0, b2: 0 } } },
    en: { v: 3, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 9, snd: false }
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
  const doc = window.document;
  const btns = () => [...doc.querySelectorAll("button")];
  const tiles = () => btns().filter((b) => b.className.includes("tile"));
  const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const armed = () => !!(tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto");
  const wordSpan = () => [...doc.querySelectorAll("span")]
    .find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && !s.closest("button"));
  const band = () => doc.querySelector("[data-duel]");
  const at = (k) => { const b = band(); return b ? b.getAttribute(k) : null; };
  /* The coin count is read off the screen, not out of localStorage. The save
     is debounced, so a storage read straight after an answer returns the total
     from some earlier answer — which is how this test first "measured" a clean
     win paying less than a scrappy one. */
  const coins = () => {
    const el = [...doc.querySelectorAll("div")]
      .filter((d) => d.children.length === 0 && d.textContent.includes("\u{1FA99}")).pop();
    if (!el) return NaN;
    const m = el.textContent.match(/(\d+)/);
    return m ? +m[1] : NaN;
  };

  /* The target can only be known while it is on screen, and the flash is
     250 ms at this speed. A sampler running the whole time is the only version
     of this that cannot miss it — an earlier one polled from inside item() and
     lost the word whenever the test happened to arrive after the flash.
     It also records what the band was doing during every frame the word was
     visible, which is the freeze assertion further down. */
  const seen = { w: "", frozen: [] };
  /* The tiles are hidden for exactly the fixation dot and the flash
     (`showTiles` is the answer and feedback stages), so their container going
     transparent is the precise window the freeze rule is about. A miss holds
     the word on screen at feedback too, and the band is meant to move there —
     sampling on "a word is visible" instead of this flagged those frames and
     was wrong, not the app. */
  const sampler = window.setInterval(() => {
    const t = tiles()[0];
    const hidden = t && t.parentElement.style.opacity === "0";
    if (hidden) {
      const b = band();
      if (b) seen.frozen.push(b.getAttribute("data-duel-frozen"));
    }
    if (armed()) return;
    const w = wordSpan();
    if (w) seen.w = w.textContent.trim();
  }, 5);

  async function item(right) {
    for (let k = 0; k < 900 && !armed(); k++) await sleep(6);
    const target = seen.w;
    if (!armed() || !target) throw new Error("no armed item (target=" + JSON.stringify(target) + ")");
    const pick = right
      ? tiles().find((b) => b.textContent.trim() === target)
      : tiles().find((b) => b.textContent.trim() !== target);
    if (!pick) throw new Error("no tile for target " + target);
    tap(pick);
    for (let k = 0; k < 200 && armed(); k++) await sleep(6);
    return target;
  }
  /* A miss holds the screen by design — only the continue button moves on. */
  async function cont() {
    for (let k = 0; k < 300; k++) {
      const c = btns().find((b) => b.textContent.trim() === "\u25B6");
      if (c) { tap(c); return true; }
      await sleep(10);
    }
    return false;
  }
  async function play() {
    tap(btns().find((b) => b.textContent.trim() === "\u25B6"));
    for (let k = 0; k < 600 && tiles().length < 4; k++) await sleep(10);
  }
  async function home() {
    tap(btns().find((b) => b.textContent.trim() === "\u{1F3E0}"));
    for (let k = 0; k < 400 && tiles().length >= 4; k++) await sleep(10);
  }
  return { window, doc, btns, tiles, tap, armed, band, at, coins, item, cont, play, home, errs, seen,
    stop: () => window.clearInterval(sampler) };
}

// ----------------------------------------------------------------- 1 + 2 + 3
const a = boot();
await sleep(500);
await a.play();

check("the duel is on the play screen", !!a.band());
check("the bandit takes 7 hits", a.at("data-duel-maxhp") === "7", `got ${a.at("data-duel-maxhp")}`);
check("the king has 3 lives", a.at("data-duel-maxlives") === "3", `got ${a.at("data-duel-maxlives")}`);
check("both numbers put the break-even at 70%",
  a.at("data-duel-maxhp") === "7" && a.at("data-duel-maxlives") === "3",
  "p/7 = (1-p)/3  ->  p = 0.70");

const hpAfter = [];
let coinsBeforeClean = a.coins();
for (let i = 0; i < 7; i++) { await a.item(true); hpAfter.push(a.at("data-duel-hp")); }
const cleanPay = a.coins() - coinsBeforeClean;
console.log("hp after each of 7 correct answers:", hpAfter.join(" "));

check("each correct answer lands one hit", hpAfter.slice(0, 6).join(" ") === "6 5 4 3 2 1");
check("the seventh knocks the bandit out", hpAfter[6] === "0");
check("the knocked-out bandit stays on screen", a.at("data-duel-hp") === "0" && a.at("data-duel-lives") === "3");
check("the king kept all three lives", a.at("data-duel-lives") === "3");

// the next answer is when the fresh bandit appears — not a timer
await sleep(2500);
check("no timer clears the KO", a.at("data-duel-hp") === "0");
await a.item(true);
check("the next answer brings a fresh bandit", a.at("data-duel-hp") === "6", `got ${a.at("data-duel-hp")}`);

// a win that cost a life must pay less than the clean one
let coinsBeforeScrappy = a.coins();
await a.item(false); await a.cont();
check("a miss costs a life", a.at("data-duel-lives") === "2", `got ${a.at("data-duel-lives")}`);
for (let i = 0; i < 6; i++) await a.item(true);
const scrappyPay = a.coins() - coinsBeforeScrappy;
check("that duel was also won", a.at("data-duel-hp") === "0");
console.log("coins for the clean win:", cleanPay, "| for the win that cost a life:", scrappyPay);
check("a clean win pays strictly more", cleanPay > scrappyPay, `${cleanPay} > ${scrappyPay}`);

// ------------------------------------------------------------------- 4 + 5 + 6
const b = boot();
await sleep(500);
await b.play();
const coinsBeforeDeath = b.coins();
let coinFloor = coinsBeforeDeath;
const lives = [];
for (let i = 0; i < 3; i++) {
  await b.item(false);
  lives.push(b.at("data-duel-lives"));
  coinFloor = Math.min(coinFloor, b.coins());
  await b.cont();
  coinFloor = Math.min(coinFloor, b.coins());
}
console.log("lives after each of 3 misses:", lives.join(" "));
check("each miss costs one life", lives.join(" ") === "2 1 0");
check("the third miss fells the king", b.at("data-duel-lives") === "0");
check("the bandit is still standing", b.at("data-duel-hp") === "7");
check("losing takes no coins away", b.coins() >= coinsBeforeDeath && coinFloor >= coinsBeforeDeath,
  `${coinsBeforeDeath} -> ${b.coins()} (floor ${coinFloor})`);

// going home and starting again must not hand him a fresh king
await b.home();
await b.play();
check("a duel in progress survives the home screen", b.at("data-duel-lives") === "0",
  `got ${b.at("data-duel-lives")}`);
await b.item(true);
check("the next answer starts a new duel", b.at("data-duel-lives") === "3" && b.at("data-duel-hp") === "6",
  `lives=${b.at("data-duel-lives")} hp=${b.at("data-duel-hp")}`);

// --------------------------------------------------------------------- 7 + 8
// nothing in the band moves while the word is on screen
await b.item(true);
const fr = b.seen.frozen;
check("the band is frozen through every fixation dot and flash",
  fr.length > 20 && fr.every((f) => f === "1"),
  `${fr.length} samples, unfrozen: ${fr.filter((f) => f !== "1").length}`);
check("it moves again at the feedback", b.at("data-duel-frozen") === "0");

check("no uncaught errors", a.errs.length === 0 && b.errs.length === 0,
  [...a.errs, ...b.errs].map(String).join(" | "));

// turbo: no duel at all. Every level-1 word Flüssig but none at rocket tier,
// which is exactly the state that offers the 🚀 launcher in the stack screen.
const goldish = {};
LVL1.forEach((w) => {
  goldish[w] = { s: 2, cc: 3, d: ["2026-09-01", "2026-09-10"], iv: 1, due: iso(5),
    r: 9, wr: 0, tn: [9, 0, 0], h: [1, 1, 1, 1, 1, 1, 1, 1], everMastered: true };
});
const c = boot(goldish);
await sleep(500);
c.tap(c.btns().find((x) => x.textContent.trim() === "\u{1F4CA}"));
for (let k = 0; k < 300; k++) {
  if (c.btns().some((x) => x.textContent.trim() === "\u{1F680}")) break;
  await sleep(10);
}
const turboBtn = c.btns().find((x) => x.textContent.trim() === "\u{1F680}");
check("the turbo launcher is reachable", !!turboBtn);
c.tap(turboBtn);
for (let k = 0; k < 400 && c.tiles().length < 4; k++) await sleep(10);
check("turbo runs no duel", c.tiles().length >= 4 && !c.band(),
  `tiles=${c.tiles().length} band=${!!c.band()}`);
a.stop(); b.stop(); c.stop();

console.log(fail ? "\nSOME CHECKS FAILED" : "\nall checks passed");
process.exit(fail);

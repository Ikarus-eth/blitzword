// The opponent ladder: Goblin 8/5, Bandit 7/3, Troll 10/3, Giant 9/2,
// Dragon 12/2. Climb on three straight wins, drop on two straight deaths.
//
// Three-up/two-down is measured, not chosen. At two-up/two-down he spent only
// 48-61% of duels on the rung matching his reading and ran five or six duels
// at a time stuck above it; three-up holds him at home 70-92% of the time at
// every accuracy from 0.60 to 0.90. tools/sim_duel.mjs --ladder is the table.
//
// The book is seeded through the import link so each leg starts one step from
// the transition it tests, instead of playing sixty duels to reach it.
//
// Asserted:
//   1. two wins do not climb; the third does, and the new opponent only
//      appears on the answer after the knockout
//   2. one death does not drop; the second does
//   3. the enemy that killed him is marked, and beating it clears the mark
//   4. beating an opponent awards its badge
//   5. gear arrives at five lifetime wins, and is cosmetic
//   6. a tougher opponent pays more, so losing on purpose to farm an easy
//      rung is not the better-paid game
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
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

function boot(book = {}) {
  const payload = {
    de: { v: 3, words: words(), coins: 0, days: { [iso()]: { s: 0, b1: 0, b2: 0 } } },
    en: { v: 3, words: {}, coins: 0, days: {} },
    ach: { v: 3, de: book, en: {} },
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
  /* the coin count comes off the screen: the word save is debounced and a
     storage read straight after an answer returns an older total */
  const coins = () => {
    const el = [...doc.querySelectorAll("div")]
      .filter((d) => d.children.length === 0 && d.textContent.includes("\u{1FA99}")).pop();
    const m = el && el.textContent.match(/(\d+)/);
    return m ? +m[1] : NaN;
  };
  /* the badge gallery is persisted by runAchCheck on the answer itself, not
     debounced, so localStorage is the honest place to read it */
  const unlocked = () => Object.keys(((JSON.parse(window.localStorage.getItem("sr.ach") || "{}").de) || {}).unlocked || {});

  const seen = { w: "" };
  const sampler = window.setInterval(() => {
    if (armed()) return;
    const w = wordSpan();
    if (w) seen.w = w.textContent.trim();
  }, 5);

  async function item(right) {
    for (let k = 0; k < 900 && !armed(); k++) await sleep(6);
    const target = seen.w;
    if (!armed() || !target) throw new Error("no armed item");
    const pick = right ? tiles().find((b) => b.textContent.trim() === target)
                       : tiles().find((b) => b.textContent.trim() !== target);
    if (!pick) throw new Error("no tile for " + target);
    tap(pick);
    for (let k = 0; k < 200 && armed(); k++) await sleep(6);
  }
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
  /* plays correct answers until the lifetime win count moves — which also
     absorbs the first answer of the next duel when one is already running */
  async function winDuel() {
    const before = +at("data-duel-wins");
    for (let i = 0; i < 22; i++) {
      await item(true);
      if (+at("data-duel-wins") > before) return true;
    }
    return false;
  }
  async function dieOnce() {
    for (let i = 0; i < 9; i++) {
      await item(false);
      const dead = at("data-duel-lives") === "0";
      await cont();
      if (dead) return true;
    }
    return false;
  }
  return { window, doc, btns, tiles, tap, armed, at, coins, unlocked, item, cont, play,
    winDuel, dieOnce, errs, stop: () => window.clearInterval(sampler) };
}

// ------------------------------------------------- 1. three wins to climb
const a = boot({ dRung: 1 });
await sleep(500);
await a.play();
check("he starts against the Bandit", a.at("data-duel-foe") === "bandit", `got ${a.at("data-duel-foe")}`);
check("no gear before five wins", a.at("data-duel-gear") === "0", `got ${a.at("data-duel-gear")}`);

await a.winDuel();
check("the beaten opponent stays on screen", a.at("data-duel-hp") === "0" && a.at("data-duel-foe") === "bandit");
await a.item(true);
check("one win does not climb", a.at("data-duel-foe") === "bandit", `got ${a.at("data-duel-foe")}`);
await a.winDuel();
await a.item(true);
check("two wins do not climb", a.at("data-duel-foe") === "bandit", `got ${a.at("data-duel-foe")}`);
await a.winDuel();
await a.item(true);
check("the third win climbs", a.at("data-duel-foe") === "troll", `got ${a.at("data-duel-foe")}`);
check("the Troll takes 10 hits and gives 3 lives",
  a.at("data-duel-maxhp") === "10" && a.at("data-duel-maxlives") === "3",
  `${a.at("data-duel-maxhp")}/${a.at("data-duel-maxlives")}`);
const un = a.unlocked();
console.log("badges after three wins over the Bandit:", un.filter((x) => x[0] === "o").join(" "));
check("beating the Bandit awards its badge", un.includes("o3"), un.join(","));
check("the first win awards First Win", un.includes("o1"));
check("no badge for an opponent he has never met", !un.includes("o4") && !un.includes("o6"));

// ---------------------------------------------------- 2. two deaths to drop
const b = boot({ dRung: 2 });
await sleep(500);
await b.play();
check("seeded onto the Troll", b.at("data-duel-foe") === "troll", `got ${b.at("data-duel-foe")}`);
await b.dieOnce();
check("the enemy that killed him is marked", b.at("data-duel-rev") === "2", `got ${b.at("data-duel-rev")}`);
await b.item(true);
check("one death does not drop", b.at("data-duel-foe") === "troll", `got ${b.at("data-duel-foe")}`);
check("and it is flagged as a rematch", b.at("data-duel-rematch") === "1");
await b.dieOnce();
await b.item(true);
check("the second death drops a rung", b.at("data-duel-foe") === "bandit", `got ${b.at("data-duel-foe")}`);
check("the Bandit is not the one he owes", b.at("data-duel-rematch") === "0");
check("the mark stays on the Troll", b.at("data-duel-rev") === "2");

// ------------------------------------------------------- 3. revenge clears
const c = boot({ dRung: 1, dRev: 1 });
await sleep(500);
await c.play();
check("the rematch is showing", c.at("data-duel-rematch") === "1");
await c.winDuel();
check("beating him clears the mark", c.at("data-duel-rev") === "-1", `got ${c.at("data-duel-rev")}`);
check("and awards Revenge", c.unlocked().includes("o8"), c.unlocked().filter((x) => x[0] === "o").join(","));

// ----------------------------------------------------------- 4. the gear
const d = boot({ dRung: 1, dWins: 4 });
await sleep(500);
await d.play();
check("still no gear at four wins", d.at("data-duel-gear") === "0", `got ${d.at("data-duel-gear")}`);
const dHp = d.at("data-duel-maxhp"), dLv = d.at("data-duel-maxlives");
await d.winDuel();
check("the fifth win earns gear", d.at("data-duel-gear") === "1", `got ${d.at("data-duel-gear")}`);
await d.item(true);
check("gear changes nothing about the fight",
  d.at("data-duel-maxhp") === dHp && d.at("data-duel-maxlives") === dLv,
  `${d.at("data-duel-maxhp")}/${d.at("data-duel-maxlives")} vs ${dHp}/${dLv}`);

// --------------------------------------------- 5. a tougher enemy pays more
async function killingBlowPay(rung) {
  const h = boot({ dRung: rung });
  await sleep(500);
  await h.play();
  while (+h.at("data-duel-hp") > 1) await h.item(true);
  const before = h.coins();
  await h.item(true);
  const after = h.coins();
  h.stop();
  return { name: h.at("data-duel-foe"), pay: after - before, wins: +h.at("data-duel-wins") };
}
const gob = await killingBlowPay(0);
const gia = await killingBlowPay(3);
console.log(`killing blow: ${gob.name} ${gob.pay} coins | ${gia.name} ${gia.pay} coins`);
check("both duels were actually won", gob.wins === 1 && gia.wins === 1);
check("the Giant pays more than the Goblin", gia.pay > gob.pay, `${gia.pay} > ${gob.pay}`);

check("no uncaught errors", [a, b, c, d].every((h) => h.errs.length === 0),
  [a, b, c, d].flatMap((h) => h.errs).map(String).join(" | "));
a.stop(); b.stop(); c.stop(); d.stop();
console.log(fail ? "\nSOME CHECKS FAILED" : "\nall checks passed");
process.exit(fail);

// What the duel actually costs and pays, measured rather than reasoned about.
//
// Two legs, and the split matters:
//
//   VALIDATE  boots the real built index.html and plays a coin-flip child
//             through it, comparing hp/lives after EVERY answer against the
//             model below. Not rates — the state sequence, answer by answer.
//             If that matches, the model is the build.
//   SWEEP     runs the validated model at scale across accuracies, because a
//             JSDOM answer costs ~1.7 s and the sweep needs ~10^6 of them.
//
// Reasoning about this file twice pointed the wrong way in this repo's
// history, so the numbers it prints are the ones that decide the constants.
//
//   node tools/sim_duel.mjs            # sweep only
//   node tools/sim_duel.mjs --validate # + the JSDOM leg (~3 min)
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const HP = 7, LIVES = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ------------------------------- the model ------------------------------ */
/* One answer. Resolved duels are cleared on the next answer, not by a timer,
   so the reset happens here at the top — same order as the app. */
function step(d, ok) {
  if (d.hp <= 0 || d.lives <= 0) { d.hp = HP; d.lives = LIVES; d.clean = true; }
  if (ok) d.hp--;
  else { d.lives--; d.clean = false; }
  return d;
}
const fresh = () => ({ hp: HP, lives: LIVES, clean: true });

/* ------------------------------- the sweep ------------------------------ */
function sweep(p, duels = 200000) {
  let win = 0, clean = 0, dead = 0, answers = 0, d = fresh();
  while (win + dead < duels) {
    step(d, Math.random() < p);
    answers++;
    if (d.hp <= 0) { win++; if (d.clean) clean++; }
    else if (d.lives <= 0) dead++;
  }
  const n = win + dead;
  return {
    p, win: win / n, dead: dead / n, clean: clean / n, perDuel: answers / n
  };
}

/* ----------------------------- the real build ---------------------------- */
const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];

async function validate(p, want) {
  const words = {};
  LVL1.forEach((w) => {
    words[w] = { s: 1, cc: 1, d: ["2026-09-01", "2026-09-10"], iv: 0, due: iso(3),
      r: 4, wr: 2, tn: [4, 0, 0], h: [1, 1, 0, 1, 1, 0, 1, 1], everMastered: false };
  });
  const payload = {
    de: { v: 3, words, coins: 0, days: { [iso()]: { s: 0, b1: 0, b2: 0 } } },
    en: { v: 3, words: {}, coins: 0, days: {} },
    meta: { lang: "de", speed: 9, snd: false }
  };
  const html = readFileSync("./index.html", "utf8");
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  window.speechSynthesis = { cancel() {}, getVoices: () => [], speak() {}, addEventListener() {}, removeEventListener() {} };
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const doc = window.document;
  const btns = () => [...doc.querySelectorAll("button")];
  const tiles = () => btns().filter((b) => b.className.includes("tile"));
  const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const armed = () => !!(tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto");
  const band = () => doc.querySelector("[data-duel]");
  const wordSpan = () => [...doc.querySelectorAll("span")]
    .find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && !s.closest("button"));

  await sleep(500);
  const seen = { w: "" };
  const sampler = window.setInterval(() => {
    if (armed()) return;
    const w = wordSpan();
    if (w) seen.w = w.textContent.trim();
  }, 5);

  tap(btns().find((b) => b.textContent.trim() === "\u25B6"));
  for (let k = 0; k < 600 && tiles().length < 4; k++) await sleep(10);

  const d = fresh();
  let mism = 0, n = 0, win = 0, dead = 0, clean = 0;
  for (let i = 0; i < want; i++) {
    for (let k = 0; k < 900 && !armed(); k++) await sleep(6);
    if (!armed()) break;
    const target = seen.w;
    const ok = Math.random() < p;
    const pick = ok ? tiles().find((b) => b.textContent.trim() === target)
                    : tiles().find((b) => b.textContent.trim() !== target);
    if (!pick) break;
    tap(pick);
    for (let k = 0; k < 300 && armed(); k++) await sleep(6);
    step(d, ok);
    n++;
    const b = band();
    const hp = +b.getAttribute("data-duel-hp"), lv = +b.getAttribute("data-duel-lives");
    if (hp !== Math.max(d.hp, 0) || lv !== Math.max(d.lives, 0)) {
      mism++;
      if (mism < 6) console.log(`  mismatch #${n}: build hp=${hp} lives=${lv} | model hp=${d.hp} lives=${d.lives}`);
    }
    if (d.hp <= 0) { win++; if (d.clean) clean++; }
    else if (d.lives <= 0) dead++;
    if (!ok) {   // a miss holds the screen; only the continue button moves on
      for (let k = 0; k < 300; k++) {
        const c = btns().find((b2) => b2.textContent.trim() === "\u25B6");
        if (c) { tap(c); break; }
        await sleep(10);
      }
    }
  }
  window.clearInterval(sampler);
  return { n, mism, win, dead, clean };
}

/* --------------------------------- run ---------------------------------- */
const pct = (x) => (x * 100).toFixed(1).padStart(5) + "%";
console.log(`duel: ${HP} hits to fell the bandit, ${LIVES} lives for the king`);
console.log(`break-even from p/${HP} = (1-p)/${LIVES}:  p = ${(HP / (HP + LIVES)).toFixed(3)}\n`);

if (process.argv.includes("--validate")) {
  const want = +(process.argv.find((a) => a.startsWith("--n="))?.slice(4) || 110);
  console.log(`VALIDATE — ${want} answers through the real build at p=0.75`);
  const v = await validate(0.75, want);
  console.log(`  answers played:        ${v.n}`);
  console.log(`  state mismatches:      ${v.mism}   <-- must be 0`);
  console.log(`  duels won / lost:      ${v.win} / ${v.dead}  (clean wins ${v.clean})\n`);
  if (v.mism) { console.log("MODEL DOES NOT MATCH THE BUILD — the sweep below means nothing"); process.exit(1); }
}

console.log("SWEEP — 200k duels per row");
console.log("    p     he wins    he dies   clean win   answers/duel   duels per 10 min*");
for (const p of [0.55, 0.60, 0.65, 0.6667, 0.70, 0.75, 0.78, 0.80, 0.85, 0.90]) {
  const r = sweep(p);
  /* *at ~30 answers in a 10-minute sitting, which is what his session records
     show for the middle speed settings */
  console.log(`  ${p.toFixed(3)}  ${pct(r.win)}     ${pct(r.dead)}    ${pct(r.clean)}       ${r.perDuel.toFixed(1)}           ${(30 / r.perDuel).toFixed(1)}`);
}
console.log("\nclean win = won without losing a life (7 correct in a row)");
console.log("Bernoulli answers. Real misses cluster — a missed word comes back 3–6 items");
console.log("later — so real runs of both kinds are somewhat longer than these.");

/* ======================= the ladder ===================================
   Five opponents, each the same two numbers in a different pair, so each
   rung's break-even is hits/(hits+lives). Climb on 2 straight wins, drop
   on 2 straight deaths.

   The point of the ladder is not variety. It is that the rung he settles
   on IS a measurement of how he reads: he stops climbing where the rung's
   break-even passes his accuracy. That also closes the slider exploit the
   flat duel has — slowing down to win climbs him into a harder opponent
   until the win rate comes back to even, so the turtle setting buys him a
   dragon, not a winning streak.

   Acceptance criterion, stated before the numbers were looked at:
     - he sits on the rung whose break-even is nearest his accuracy from
       below, for at least 70% of duels
     - he is never stuck above that rung for more than 3 duels on average
   node tools/sim_duel.mjs --ladder                                       */
const FOES = [
  { name: "Goblin", hp: 8, lives: 5 },
  { name: "Bandit", hp: 7, lives: 3 },
  { name: "Troll",  hp: 10, lives: 3 },
  { name: "Giant",  hp: 9, lives: 2 },
  { name: "Dragon", hp: 12, lives: 2 }
];
const be = (f) => f.hp / (f.hp + f.lives);

function ladder(p, duels = 200000, start = 1) {
  let rung = start, w = 0, l = 0;                 // consecutive results
  const occ = FOES.map(() => 0);
  let wins = 0, dead = 0, answers = 0, above = 0, aboveRuns = 0, inAbove = 0;
  const home = FOES.reduce((best, f, i) => (be(f) <= p ? i : best), 0);
  for (let d = 0; d < duels; d++) {
    const f = FOES[rung];
    let hp = f.hp, lv = f.lives;
    occ[rung]++;
    if (rung > home) { above++; inAbove++; } else { if (inAbove) { aboveRuns++; } inAbove = 0; }
    while (hp > 0 && lv > 0) { answers++; if (Math.random() < p) hp--; else lv--; }
    if (hp <= 0) { wins++; w++; l = 0; if (w >= 2) { rung = Math.min(4, rung + 1); w = 0; } }
    else { dead++; l++; w = 0; if (l >= 2) { rung = Math.max(0, rung - 1); l = 0; } }
  }
  return { p, home, occ: occ.map((n) => n / duels), win: wins / duels, dead: dead / duels,
    perDuel: answers / duels, above: above / duels,
    stuck: aboveRuns ? above / aboveRuns : 0 };
}

if (process.argv.includes("--ladder")) {
  console.log("\nLADDER — 200k duels per row");
  console.log("opponents: " + FOES.map((f) => `${f.name} ${f.hp}/${f.lives} (${be(f).toFixed(3)})`).join("  "));
  console.log("\n    p    home rung        time on each rung          at home  he wins  answers  stuck");
  for (const p of [0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95]) {
    const r = ladder(p);
    const bars = r.occ.map((x) => (x * 100).toFixed(0).padStart(3)).join(" ");
    const atHome = r.occ[r.home] + (r.home > 0 ? r.occ[r.home - 1] : 0);
    console.log(`  ${p.toFixed(2)}  ${FOES[r.home].name.padEnd(7)}  ${bars}   ${(atHome * 100).toFixed(0).padStart(4)}%   ${(r.win * 100).toFixed(0).padStart(4)}%    ${r.perDuel.toFixed(1).padStart(5)}   ${r.stuck.toFixed(1)}`);
  }
  console.log("\ncolumns are Goblin Bandit Troll Giant Dragon, % of duels spent there");
  console.log("'at home' = on the rung matching his reading, or the one below it");
  console.log("'stuck' = mean run length of duels spent above his rung");
}

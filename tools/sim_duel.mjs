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

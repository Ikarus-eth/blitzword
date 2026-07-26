// New badges carry a star until he has looked at them.
//
// Three properties, and the middle one is the trap. Marking on *entry* would be
// the obvious implementation and would be wrong: the star would be cleared by
// the very act of going to look for it, so a badge earned between visits would
// never once be seen marked. Marking happens on the way out instead.
//
//   1. a badge unlocked since the last visit shows a star, and the trophy on
//      the start screen shows one too so he knows to go and look;
//   2. the star stays put for the whole visit;
//   3. leaving clears it, and it does not come back on the next visit.
//
// Also covered: an existing save has unlocked badges and no `seen` map. Those
// count as already seen, otherwise the entire wall lights up on the first run
// after this shipped — on the one occasion the star most needs to mean
// something.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dom = new JSDOM(html, { url: "https://example.com/blitzwort/", runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
const errs = [];
window.addEventListener("error", (e) => errs.push(e.error || e.message));

const btns = () => [...window.document.querySelectorAll("button")];
const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const html_ = () => window.document.getElementById("root").innerHTML;
// ⭐ is already the glyph for star level on the language cards, so counting the
// character finds the wrong things. The markers carry data-new.
const stars = () => window.document.querySelectorAll('[data-new]').length;
const stored = () => JSON.parse(window.localStorage.getItem("sr.ach") || "{}");
const trophy = () => btns().find((b) => /🏆/.test(b.textContent));
const openBadges = () => tap(trophy());
const back = () => tap(btns().find((b) => b.textContent.trim() === "⬅"));

await sleep(450);

// ---- 0. a fresh profile has nothing unlocked and nothing starred -----------
const starsAtStart = stars();
console.log("stars on a fresh start screen:", starsAtStart);

// ---- 1. earn some badges by playing --------------------------------------
tap(btns().find((b) => b.textContent.trim() === "▶"));
let answered = 0;
for (let q = 0; q < 4; q++) {
  for (let k = 0; k < 300; k++) {
    const t = btns().filter((b) => b.className.includes("tile"));
    if (t.length && t[0].parentElement.style.pointerEvents === "auto") break;
    await sleep(15);
  }
  const t = btns().filter((b) => b.className.includes("tile"));
  if (!t.length) break;
  tap(t[0]); answered++;
  await sleep(400);
  const cont = btns().find((b) => b.textContent.trim() === "▶");
  if (cont) tap(cont);        // a miss holds until continue
  await sleep(500);
}
tap(btns().find((b) => b.textContent.trim() === "🏠"));
await sleep(400);
const unlockedNow = Object.keys(stored().unlocked || {}).length;
const homeStar = stars() >= 1;
console.log(`answered ${answered}, badges unlocked: ${unlockedNow}, star on the home trophy: ${homeStar}`);

// ---- 2. the badge screen shows stars, and they stay for the whole visit ----
openBadges();
await sleep(350);
const starsOnOpen = stars();
await sleep(1200);
const starsStillThere = stars();
console.log("stars when the screen opens:", starsOnOpen, "| still there 1.2 s later:", starsStillThere);
const seenBeforeLeaving = Object.keys(stored().seen || {}).length;
console.log("badges marked seen while still on the screen:", seenBeforeLeaving);

// ---- 3. leaving clears them, and they stay cleared -------------------------
back();
await sleep(400);
const seenAfter = Object.keys(stored().seen || {}).length;
const homeStarAfter = stars();
console.log("badges marked seen after leaving:", seenAfter, "| star still on the trophy:", homeStarAfter >= 1);

openBadges();
await sleep(350);
const starsOnRevisit = stars();
console.log("stars on the next visit:", starsOnRevisit);
back();
await sleep(300);

// ---- 4. an old save with no `seen` map must not light up everything --------
const legacy = { unlocked: { a1: "2026-07-01", a2: "2026-07-01", a3: "2026-07-02" }, bestStreak: 4 };
const dom2 = new JSDOM(html, { url: "https://example.com/blitzwort/", runScripts: "dangerously", pretendToBeVisual: true });
const w2 = dom2.window;
w2.requestAnimationFrame = (cb) => setTimeout(cb, 0);
w2.cancelAnimationFrame = (id) => clearTimeout(id);
delete w2.storage;
w2.localStorage.setItem("sr.ach", JSON.stringify(legacy));
await sleep(600);
const legacyStars = w2.document.querySelectorAll('[data-new]').length;
const legacySeen = Object.keys(JSON.parse(w2.localStorage.getItem("sr.ach")).seen || {}).length;
console.log("legacy save — stars on the start screen:", legacyStars, "| pre-seeded as seen:", legacySeen);

console.log("uncaught errors:", errs.length);

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

check("a fresh profile shows no star", starsAtStart === 0);
check("playing unlocked at least one badge", unlockedNow >= 1);
check("the start-screen trophy stars when something is waiting", homeStar);
check("the badge screen shows stars on the new ones", starsOnOpen >= 1);
check("the stars stay put for the whole visit", starsStillThere === starsOnOpen);
check("nothing is marked seen while he is still looking", seenBeforeLeaving === 0);
check("leaving marks them seen", seenAfter === unlockedNow);
check("the trophy star clears once seen", homeStarAfter === 0);
check("no stars on the next visit", starsOnRevisit === 0);
check("a legacy save without a seen map does not light up", legacyStars === 0 && legacySeen === 3);
check("no uncaught errors", errs.length === 0);

window.close(); w2.close();
process.exit(fail);

// The dated error log — `mx` with dates, so "is this error type getting better"
// becomes answerable.
//
// A word's `mx` is a lifetime tally that only ever grows: it can say he confuses
// m with n, never whether that is improving. The b/d drill was run for weeks on
// exactly that kind of number. So every reading answer now also lands in a
// per-day record: answers, wrong answers, and the letter pairs from the same
// diff the dashboard already uses. The answer count is the denominator, so two
// weeks compare with two weeks.
//
// Asserted:
//   1. a right answer counts in `n` and nowhere else
//   2. a wrong answer counts in `w` and adds its letter pair
//   3. mini-game answers never touch it (Tier-Blitz round here)
//   4. the log keeps 60 days
//   5. the dashboard shows the 14-day window and the pair rows
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// 70 days of old log, to prove the 60-day trim
const oldErs = {};
for (let i = 100; i > 30; i--) oldErs[iso(-i)] = { n: 1, w: 0, p: {} };
const payload = {
  de: { v: 3, words: {}, coins: 0, days: {}, ers: oldErs },
  en: { v: 3, words: {}, coins: 0, days: {} },
  meta: { lang: "de", speed: 7, snd: false }
};
const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
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

let fail = 0;
const check = (name, cond, detail = "") => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${detail ? "   " + detail : ""}`);
  if (!cond) fail = 1;
};
const btns = () => [...doc.querySelectorAll("button")];
const tiles = () => btns().filter((b) => b.className.includes("tile"));
const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const find = (t) => btns().find((b) => b.textContent.trim() === t);
const armed = () => tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto";
const wordSpan = () => [...doc.querySelectorAll("span")]
  .find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && !s.closest("button"));
const saved = () => JSON.parse(window.localStorage.getItem("sr.de"));
const ersToday = () => (saved().ers || {})[iso()] || { n: 0, w: 0, p: {} };
async function nextTarget() {
  let target = "";
  for (let k = 0; k < 800 && !target; k++) { const w = wordSpan(); if (!armed() && w) target = w.textContent.trim(); await sleep(8); }
  for (let k = 0; k < 800 && !armed(); k++) await sleep(8);
  return target;
}
/* the test's own copy of the rule, for equal-length words only */
const pairOf = (a, b) => {
  const out = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) out.push([a[i].toLowerCase(), b[i].toLowerCase()].sort().join("↔"));
  return out;
};

await sleep(600);
tap(find("\u25B6"));
for (let k = 0; k < 800 && tiles().length < 4; k++) await sleep(10);

let right = 0, wrong = 0;
const expect = {};
for (let i = 0; i < 4; i++) {           // four right
  const t = await nextTarget(); await sleep(150);
  tap(tiles().find((b) => b.textContent.trim() === t)); right++;
  await sleep(150);
}
for (let i = 0; i < 2; i++) {           // two wrong, equal-length foils
  const t = await nextTarget(); await sleep(150);
  const bad = tiles().find((b) => b.textContent.trim() !== t && b.textContent.trim().length === t.length)
    || tiles().find((b) => b.textContent.trim() !== t);
  const chosen = bad.textContent.trim();
  tap(bad); wrong++;
  if (chosen.length === t.length) pairOf(t, chosen).forEach((k) => { expect[k] = (expect[k] || 0) + 1; });
  await sleep(200);
  tap(find("\u25B6"));                  // a miss waits for continue
  await sleep(200);
}
await sleep(1500);
const e1 = ersToday();
check("every reading answer counted", e1.n === right + wrong, `n ${e1.n}, answers ${right + wrong}`);
check("only the misses counted as wrong", e1.w === wrong, `w ${e1.w}, misses ${wrong}`);
const pairsOk = Object.entries(expect).every(([k, v]) => (e1.p[k] || 0) === v);
check("letter pairs of the chosen tiles recorded", Object.keys(expect).length > 0 && pairsOk,
  `expected ${JSON.stringify(expect)}, got ${JSON.stringify(e1.p)}`);
check("60-day trim", Object.keys(saved().ers).length === 60, `${Object.keys(saved().ers).length} days`);

// --- a mini-game must not touch it ---------------------------------------
tap(find("🏠"));
await sleep(400);
const before = ersToday();
tap(btns().find((b) => b.getAttribute("aria-label") === "Tier-Blitz"));
const mixReady = () => doc.querySelectorAll("[data-frag]").length >= 4 &&
  !doc.querySelector('[data-mix="fb"]') && !find("\u25B6");
for (let q = 0; q < 2; q++) {
  for (let k = 0; k < 900 && !mixReady(); k++) await sleep(10);
  tap(tiles()[0]);
  for (let k = 0; k < 200 && !doc.querySelector('[data-mix="fb"]'); k++) await sleep(10);
  await sleep(300);
  if (find("\u25B6")) { tap(find("\u25B6")); await sleep(200); } else await sleep(1100);
}
tap(find("🏠"));
await sleep(1500);
const tm = saved().tm ? saved().tm.r + saved().tm.wr : 0;
const after = ersToday();
check("two Tier-Blitz answers landed", tm === 2, `tm ${tm}`);
check("mini-game answers are not in the reading error log", after.n === before.n && after.w === before.w,
  `n ${before.n}->${after.n}`);

// --- the dashboard shows the window ---------------------------------------
tap(find("\u2699")); await sleep(250);
const g = doc.querySelector("[data-pin-gate]");
if (g) {
  const ans = String(Number(g.getAttribute("data-gate-a")) * Number(g.getAttribute("data-gate-b")));
  for (const c of ans) tap(doc.querySelector(`[data-pin-key="${c}"]`));
  tap(doc.querySelector('[data-pin-key="ok"]'));
}
await sleep(400);
const card = doc.querySelector("[data-errlog]");
check("dashboard has the error-over-time card", !!card);
if (card) {
  check("its 14-day window is today's answers", Number(card.getAttribute("data-err-n14")) === right + wrong,
    `n14 ${card.getAttribute("data-err-n14")}`);
  check("its 14-day window is today's misses", Number(card.getAttribute("data-err-w14")) === wrong,
    `w14 ${card.getAttribute("data-err-w14")}`);
  const rows = [...doc.querySelectorAll("[data-err-pair]")];
  const shown = Object.fromEntries(rows.map((r) => [r.getAttribute("data-err-pair"), Number(r.getAttribute("data-err-now"))]));
  check("its pair rows match the log", Object.entries(expect).every(([k, v]) => shown[k] === v),
    `rows ${JSON.stringify(shown)}`);
  check("the earlier window is empty, as it must be on day one",
    Number(card.getAttribute("data-err-nprev")) === 0, card.getAttribute("data-err-nprev"));
}
check("no uncaught errors", errs.length === 0, errs.map(String).join(" | "));
window.close();
process.exit(fail);

// The parent dashboard's "Sitzungen" must say where the time went, and its
// Ring column must be the ring's own number.
//
// The question it answers came from watching him: a lot of the sitting seemed
// to go on trophies. The ring cannot show that, because trophies earn nothing
// on it by construction (test_active_time). So the log is measured apart from
// the ring: presence per screen while the app is visible and was touched in the
// last 30 s, idle beyond that, a new sitting after 5 minutes away.
//
// A scripted sitting with known durations, run on a virtual clock so minutes
// cost milliseconds (Date.now is offset; the loop's own timers stay real):
//
//   home 60 s -> trophies 180 s -> home 10 s -> reading: 6 right, a 120 s stall,
//   a miss studied 12 s, 2 right -> home -> parent dashboard 40 s -> hidden 2 min
//   -> Tier-Blitz 3 answers -> reading, and the iPad locked for 10 min
//   mid-question, then answered.
//
// Asserted from the dashboard rows:
//   1. trophies, parent, idle and time in games each match the script (±1-2 s)
//   2. Dauer = Übung + 🏆 + 🎉 + 🏠 + 💤, and equals the visible child time
//      (the parent dashboard and the 2-minute hide are not in it)
//   3. Ring = the day-record credit gained in that sitting (±0.2 s)
//   4. answers exact: 10 reading, 9 right, 3 mini; one 30-s cap; the miss screen
//   5. the 2-minute hide stays one sitting, the 10-minute lock starts a second
//      one, whose Ring (30 s, capped) sits above its time in games: the ring
//      was paid for a locked iPad, and the row flags it
//   6. the export carries the sittings
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const payload = {
  de: { v: 3, words: {}, coins: 0, days: {} },
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

// virtual clock: minutes of trophies or a locked iPad in milliseconds
let offset = 0;
const realNow = window.Date.now.bind(window.Date);
window.Date.now = () => realNow() + offset;
const jump = (sec) => { offset += sec * 1000; };
const vnow = () => window.Date.now();
let vis = "visible";
Object.defineProperty(doc, "visibilityState", { get: () => vis, configurable: true });
Object.defineProperty(doc, "hidden", { get: () => vis === "hidden", configurable: true });
const setVis = (v) => { vis = v; doc.dispatchEvent(new window.Event("visibilitychange")); };

let fail = 0;
const check = (name, cond, detail = "") => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${detail ? "   " + detail : ""}`);
  if (!cond) fail = 1;
};
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const btns = () => [...doc.querySelectorAll("button")];
const tiles = () => btns().filter((b) => b.className.includes("tile"));
const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const find = (t) => btns().find((b) => b.textContent.trim() === t);
const touch = () => doc.body.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const armed = () => tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto";
const wordSpan = () => [...doc.querySelectorAll("span")]
  .find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && !s.closest("button"));
const daySec = () => { const raw = window.localStorage.getItem("sr.de"); return raw ? ((JSON.parse(raw).days[iso()] || {}).s || 0) : 0; };
async function nextTarget() {
  let target = "";
  for (let k = 0; k < 800 && !target; k++) { const w = wordSpan(); if (!armed() && w) target = w.textContent.trim(); await sleep(8); }
  for (let k = 0; k < 800 && !armed(); k++) await sleep(8);
  return target;
}
const tapRight = (t) => tap(tiles().find((b) => b.textContent.trim() === t));
const tapWrong = (t) => tap(tiles().find((b) => b.textContent.trim() !== t));
async function openDash() {
  tap(find("\u2699")); await sleep(250);
  const g = doc.querySelector("[data-pin-gate]");
  if (g) {
    const ans = String(Number(g.getAttribute("data-gate-a")) * Number(g.getAttribute("data-gate-b")));
    for (const c of ans) tap(doc.querySelector(`[data-pin-key="${c}"]`));
    tap(doc.querySelector('[data-pin-key="ok"]'));
  }
  await sleep(350);
}

await sleep(600);
// --- 1. home 60 s ----------------------------------------------------------
for (let i = 0; i < 3; i++) { jump(20); touch(); }
// --- 2. trophies 180 s, touched every 25 s -------------------------------
tap(btns().find((b) => b.textContent.includes("🏆")));
const tTro0 = vnow();
await sleep(250);
check("trophy gallery open", !!find("\u2B05"));
for (let i = 0; i < 7; i++) { jump(25); touch(); }
jump(5);
const tTro1 = vnow();
tap(find("\u2B05"));
await sleep(250);
// --- 3. home 10 s, then reading --------------------------------------------
jump(10);
const tPlay0 = vnow();
tap(find("\u25B6"));
for (let k = 0; k < 800 && tiles().length < 4; k++) await sleep(10);
let tLastTap = 0;
for (let i = 0; i < 6; i++) { const t = await nextTarget(); await sleep(250); tLastTap = vnow(); tapRight(t); await sleep(120); }
let idleExp;
{ // a stall: 120 s with nothing touched, then the right answer
  const t = await nextTarget(); jump(120);
  const tStall = vnow(); tapRight(t);
  idleExp = (tStall - tLastTap) / 1000 - 30;
  await sleep(120);
}
let mdExp;
{ // a miss, studied for 12 s, then continue
  const t = await nextTarget(); await sleep(200);
  const tMiss = vnow(); tapWrong(t); await sleep(200);
  jump(12);
  const tCont = vnow(); tap(find("\u25B6"));
  mdExp = (tCont - tMiss) / 1000;
  await sleep(120);
}
for (let i = 0; i < 2; i++) { const t = await nextTarget(); await sleep(250); tapRight(t); await sleep(120); }
await sleep(900);
const tPlay1 = vnow();
tap(find("🏠"));
await sleep(300);
// --- 4. parent dashboard 40 s ---------------------------------------------
await openDash();
const tPar0 = vnow();
check("dashboard open", doc.body.textContent.includes("Eltern-Dashboard"));
jump(20); touch(); jump(20); touch();
const tPar1 = vnow();
tap(find("\u2B05"));
await sleep(300);
// --- 5. hidden 2 min on home: same sitting, none of it counted ----------
const tH0 = vnow(); setVis("hidden"); jump(120); const tH1 = vnow(); setVis("visible"); touch();
await sleep(200);
// --- 6. Tier-Blitz, 3 answers ----------------------------------------------
const tMix0 = vnow();
tap(btns().find((b) => b.getAttribute("aria-label") === "Tier-Blitz"));
const tmOf = () => { const raw = JSON.parse(window.localStorage.getItem("sr.de")); return raw.tm ? raw.tm.r + raw.tm.wr : 0; };
/* Tapping on sight loses answers: the four fragments are still on screen during
   the feedback stage, and mixAnswer ignores a tap that arrives then. Wait for
   the answer stage (fragments up, no feedback span, no continue button) and
   confirm each answer landed in L.tm before going on. */
const mixReady = () => doc.querySelectorAll("[data-frag]").length >= 4 &&
  !doc.querySelector('[data-mix="fb"]') && !find("\u25B6");
let mixDone = 0;
for (let q = 0; q < 3; q++) {
  for (let k = 0; k < 900 && !mixReady(); k++) await sleep(10);
  tap(tiles()[0]);
  for (let k = 0; k < 200 && !doc.querySelector('[data-mix="fb"]'); k++) await sleep(10);
  mixDone++;
  await sleep(300);
  if (find("\u25B6")) { tap(find("\u25B6")); await sleep(200); }
  else await sleep(1100);
}
const tMix1 = vnow();
tap(find("🏠"));
await sleep(1500);
check("three Tier-Blitz answers landed", tmOf() === 3 && mixDone === 3, `tm r+wr = ${tmOf()}, taps that landed ${mixDone}`);
// --- 7. reading, iPad locked 10 min mid-question --------------------------
const tQ0 = vnow();
tap(find("\u25B6"));                     // startPlay flushes: the day record is current here
const ring1 = daySec();
for (let k = 0; k < 800 && tiles().length < 4; k++) await sleep(10);
const tLock = await nextTarget();
const tH2 = vnow(); setVis("hidden"); jump(600); const tH3 = vnow(); setVis("visible");
await sleep(150);
tapRight(tLock);
await sleep(1200);
const tQ2 = vnow();
tap(find("🏠"));
await sleep(1500);
const ringAll = daySec();

// --- read the dashboard -----------------------------------------------------
await openDash();
const rows = [...doc.querySelectorAll("[data-sess-row]")];
const num = (r, k) => Number(r.getAttribute("data-" + k));
check("two sittings listed (the 2-min hide did not split, the 10-min lock did)", rows.length === 2, `got ${rows.length}`);
const [s2, s1] = rows;
if (s1 && s2) {
  const trophyExp = (tTro1 - tTro0) / 1000;
  const parentExp = (tPar1 - tPar0) / 1000;
  const workExp = (tPlay1 - tPlay0) / 1000 - idleExp + (tMix1 - tMix0) / 1000 + (tH2 - tQ0) / 1000;
  const sess1 = JSON.parse(window.localStorage.getItem("sr.sess")).list.slice(-2)[0];
  const durExp = (tH2 - sess1.t0) / 1000 - (tH1 - tH0) / 1000 - parentExp;
  console.log(`\nsitting 1: dur ${num(s1, "dur")} (exp ${durExp.toFixed(1)}) | work ${num(s1, "work")} (exp ${workExp.toFixed(1)})` +
    ` | trophy ${num(s1, "trophy")} (exp ${trophyExp.toFixed(1)}) | home ${num(s1, "home")} | fest ${num(s1, "fest")}` +
    ` | idle ${num(s1, "idle")} (exp ${idleExp.toFixed(1)}) | parent ${num(s1, "parent")} (exp ${parentExp.toFixed(1)})` +
    ` | ring ${num(s1, "ring")} (day ${ring1.toFixed(3)})`);
  console.log(`sitting 2: dur ${num(s2, "dur")} | work ${num(s2, "work")} | ring ${num(s2, "ring")} (day ${(ringAll - ring1).toFixed(3)}) | cap ${num(s2, "cap")}\n`);

  check("trophy time matches the script", near(num(s1, "trophy"), trophyExp, 1), `${num(s1, "trophy")} vs ${trophyExp.toFixed(1)}`);
  check("idle is the stall beyond 30 s", near(num(s1, "idle"), idleExp, 1), `${num(s1, "idle")} vs ${idleExp.toFixed(1)}`);
  check("time in games matches the script", near(num(s1, "work"), workExp, 2), `${num(s1, "work")} vs ${workExp.toFixed(1)}`);
  check("parent time recorded separately", near(num(s1, "parent"), parentExp, 1), `${num(s1, "parent")} vs ${parentExp.toFixed(1)}`);
  check("no summary or round-end screen was visited", num(s1, "fest") < 0.5, `${num(s1, "fest")}`);
  const sum = num(s1, "work") + num(s1, "trophy") + num(s1, "fest") + num(s1, "home") + num(s1, "idle");
  check("Dauer is the sum of its columns", near(num(s1, "dur"), sum, 0.05), `${num(s1, "dur")} vs ${sum.toFixed(2)}`);
  check("Dauer excludes the parent dashboard and the hidden 2 min", near(num(s1, "dur"), durExp, 2), `${num(s1, "dur")} vs ${durExp.toFixed(1)}`);
  check("Ring equals the day credit gained in sitting 1", near(num(s1, "ring"), ring1, 0.2), `${num(s1, "ring")} vs ${ring1.toFixed(3)}`);
  check("reading answers exact", num(s1, "read") === 10 && num(s1, "readok") === 9, `read ${num(s1, "read")}, right ${num(s1, "readok")}`);
  check("mini-game answers exact", num(s1, "mini") === tmOf(), `mini ${num(s1, "mini")} vs L.tm ${tmOf()}`);
  check("one answer hit the 30 s cap", num(s1, "cap") === 1, `cap ${num(s1, "cap")}`);
  check("miss screen time recorded", near(num(s1, "md"), mdExp, 0.6), `${num(s1, "md")} vs ${mdExp.toFixed(1)}`);
  check("sitting 1 is not flagged", num(s1, "ringover") === 0);
  check("sitting 2 holds the one answer after the lock", num(s2, "read") === 1, `read ${num(s2, "read")}`);
  check("its Ring is the capped span", near(num(s2, "ring"), 30, 0.2) && near(num(s2, "ring"), ringAll - ring1, 0.2),
    `${num(s2, "ring")} vs day ${(ringAll - ring1).toFixed(3)}`);
  check("and exceeds its time in games, flagged", num(s2, "work") < 5 && num(s2, "ringover") === 1, `work ${num(s2, "work")}`);
}
tap(btns().find((b) => b.textContent.includes("Export anzeigen")));
await sleep(200);
const ta = doc.querySelector("textarea[readonly]");
let exported = null; try { exported = JSON.parse(ta.value); } catch (e) {}
check("export carries the sittings", !!(exported && exported.sess && exported.sess.list && exported.sess.list.length === 2),
  exported && exported.sess ? `list ${exported.sess.list.length}` : "no sess");
check("no uncaught errors", errs.length === 0, errs.map(String).join(" | "));
window.close();
process.exit(fail);

// A joker excuses one missed day, and the parent dashboard is behind a PIN.
//
// The streak was never stored. calcStreak() walks backwards from today while
// dayDone(days[iso].s) holds, so a missed day does not destroy anything — the
// walk simply stops at the gap and every surface that shows a flame reports 0.
// A joker adds one date to a set the walk steps over, which is why one change
// has to move the home cards, the play top bar, the dashboard "Serie" AND
// bestStreakDays in computeStats at the same instant. A call site that still
// calls calcStreak(days) alone shows a different number from its neighbour, and
// the ring/flame split that cost a five-day streak was exactly that shape.
//
// The rules the buttons have to enforce:
//   - reach 14 days back, never today (today is not missed yet),
//   - 7 clear days between two excused days, so a two-day gap is never bridged
//     and skipping is never free,
//   - the day before an excused day must be genuinely practised, so a joker can
//     bridge a run but can never start one out of nothing.
//
// An excused day bridges the walk and adds NOTHING to the total. The streak
// stays a count of days actually practised, so the 📅 ladder still means what
// it says. The first build counted it and every downstream number — the flame,
// bestStreakDays, the day badges — ran one high per joker.
//
// Against the pre-change build every check below fails: there is no PIN, no
// joker card, and the flame stays at 0.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const LVL1 = ["der", "die", "das", "und", "ist", "ich", "du", "er", "sie", "es",
  "wir", "ein", "eine", "nicht", "ja", "nein", "in", "an", "auf", "mit"];
const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

const DONE = 700;     // over the 600 s goal
const SHORT = 120;    // a day he started and did not finish

// day offsets that are missed; everything else in the span is a full day
const buildDays = (missed, span) => {
  const days = {};
  for (let i = 1; i <= span; i++) {
    days[ago(i)] = { s: missed.includes(i) ? SHORT : DONE, b1: 0, b2: 0 };
  }
  days[iso()] = { s: 0, b1: 0, b2: 0 };   // today not practised yet
  return days;
};

const payload = (days, jok) => {
  const words = {};
  for (const w of LVL1) {
    words[w] = {
      s: 2, cc: 3, d: ["2026-07-20", "2026-07-21"], iv: 1, due: "2026-09-01",
      r: 9, wr: 1, tn: [4, 4, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], everMastered: true
    };
  }
  const meta = { lang: "de", speed: 4, snd: false };
  if (jok) meta.jok = jok;
  return {
    de: { v: 3, words, coins: 0, days },
    en: { v: 3, words: {}, coins: 0, days: {} },
    meta
  };
};

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(days, jok) {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload(days, jok)), "utf8").toString("base64"));
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
  const q = (sel) => doc.querySelector(sel);
  const num = (sel, attr) => { const e = q(sel); return e ? Number(e.getAttribute(attr)) : null; };

  const homeStreak = () => num('[data-streak-home="de"]', "data-streak");
  const dashStreak = () => num("[data-streak-dash]", "data-streak");
  const playStreak = () => num("[data-streak-play]", "data-streak");
  const row = (d) => q(`[data-joker-day="${d}"]`);
  const jokBtn = (d) => q(`[data-joker-btn="${d}"]`);
  const meta = () => JSON.parse(window.localStorage.getItem("sr.meta") || "{}");
  const ach = () => JSON.parse(window.localStorage.getItem("sr.ach") || "{}");

  const key = (k) => { const b = q(`[data-pin-key="${k}"]`); if (b) tap(b); };
  const enter = async (code) => { for (const c of String(code)) key(c); await sleep(250); };
  const openGate = async () => { tap(btns().find((b) => b.textContent.trim() === "⚙")); await sleep(250); };
  const back = async () => {
    const b = btns().find((x) => x.textContent.trim() === "\u2B05");
    if (b) tap(b);
    await sleep(300);
  };
  return { window, errs, btns, tap, q, homeStreak, dashStreak, playStreak, row, jokBtn, meta, ach, openGate, enter, back };
}

let fail = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${extra !== "" ? "   " + extra : ""}`);
  if (!cond) fail = 1;
};

/* ---------------------------------------------------------------------------
   1. the real case: 17 full days, yesterday short, flame reads 0
   ------------------------------------------------------------------------ */
const a = await boot(buildDays([1], 18));
check("streak is 0 with yesterday missed", a.homeStreak() === 0, String(a.homeStreak()));

/* ---- the dashboard is behind the PIN ---- */
await a.openGate();
check("gear opens a PIN gate, not the dashboard", !!a.q("[data-pin-gate]") && !a.q("[data-joker-card]"));
await a.enter("9999");
check("wrong PIN does not open the dashboard", !!a.q("[data-pin-gate]") && !a.q("[data-joker-card]"));
check("wrong PIN is reported", a.q("[data-pin-gate]") && a.q("[data-pin-gate]").getAttribute("data-pin-bad") === "1");
await a.enter("1234");
check("1234 opens the dashboard", !a.q("[data-pin-gate]") && !!a.q("[data-joker-card]"));
check("dashboard still shows the export", a.btns().some((b) => /Export/.test(b.textContent)));

/* ---- the joker rescues the streak ---- */
check("dashboard agrees the streak is 0", a.dashStreak() === 0, String(a.dashStreak()));
check("yesterday is listed as a gap", !!a.row(ago(1)));
check("yesterday can be excused", a.row(ago(1)).getAttribute("data-can") === "1");
check("a completed day is not listed", !a.row(ago(2)));
a.tap(a.jokBtn(ago(1)));
await sleep(200);
check("excusing yesterday restores the run: 17 practised days", a.dashStreak() === 17, String(a.dashStreak()));
check("the excused day itself adds nothing — 18 calendar days, 17 counted",
  a.dashStreak() === 17 && a.dashStreak() !== 18, String(a.dashStreak()));
check("the excused day is marked", a.row(ago(1)).getAttribute("data-jok") === "1");

/* ---- the day itself is untouched: only the streak moved ---- */
await sleep(800);
const de = JSON.parse(a.window.localStorage.getItem("sr.de"));
check("the excused day keeps its real seconds", de.days[ago(1)].s === SHORT, String(de.days[ago(1)].s));
check("the joker is written to sr.meta", Array.isArray(a.meta().jok) && a.meta().jok.includes(ago(1)),
  JSON.stringify(a.meta().jok || null));

/* ---- computeStats sees it too: the day-streak ladder fires ---- */
const dayBadges = Object.keys(a.ach().de ? a.ach().de.unlocked : {}).filter((k) => /^f\d/.test(k));
check("the 14-day badge unlocks off the repaired streak", dayBadges.includes("f6"), JSON.stringify(dayBadges));

/* ---- every surface reports the same number ---- */
await a.back();
check("home card shows 17", a.homeStreak() === 17, String(a.homeStreak()));
a.tap(a.btns().find((b) => b.textContent.trim() === "▶"));
await sleep(300);
check("play top bar shows 17", a.playStreak() === 17, String(a.playStreak()));
check("no uncaught errors", a.errs.length === 0, JSON.stringify(a.errs.map(String)));
a.window.close();

/* ---------------------------------------------------------------------------
   2. it survives a reload, and taking it back breaks the streak again
   ------------------------------------------------------------------------ */
const b = await boot(buildDays([1], 18), [ago(1)]);
check("a saved joker is in force on load", b.homeStreak() === 17, String(b.homeStreak()));
await b.openGate(); await b.enter("1234");
b.tap(b.jokBtn(ago(1)));
await sleep(200);
check("taking the joker back drops the streak to 0", b.dashStreak() === 0, String(b.dashStreak()));
await sleep(800);
check("sr.meta no longer holds it", !(b.meta().jok || []).includes(ago(1)), JSON.stringify(b.meta().jok || null));
b.window.close();

/* ---------------------------------------------------------------------------
   3. the allowance rules
      missed: yesterday, 5, 9, 10 and 17 days ago; everything else practised
      - 1  allowed; days 2-4 practised behind it, so the streak reads 3 not 4
      - 5  blocked: 4 days after the joker already spent on day 1
      - 9  blocked: day 10 was also missed, so nothing to bridge from
      - 10 allowed: 9 clear days, and day 11 was practised
      - 13 allowed: 12 clear days — and blocked again once 10 is used
      - 17 not listed: past the 14-day reach
      - today never listed
   ------------------------------------------------------------------------ */
const c = await boot(buildDays([1, 5, 9, 10, 13, 17], 25));
await c.openGate(); await c.enter("1234");
c.tap(c.jokBtn(ago(1)));
await sleep(200);
const can = (n) => c.row(ago(n)) && c.row(ago(n)).getAttribute("data-can") === "1";
check("day 5 is blocked inside the 7-day window", c.row(ago(5)) && !can(5),
  c.row(ago(5)) ? c.row(ago(5)).getAttribute("data-why") : "missing");
check("day 9 is blocked — day 10 was missed too", c.row(ago(9)) && !can(9),
  c.row(ago(9)) ? c.row(ago(9)).getAttribute("data-why") : "missing");
check("day 10 is allowed", can(10));
check("day 13 is allowed", can(13));
c.tap(c.jokBtn(ago(10)));
await sleep(200);
check("a second joker at day 10 now blocks day 13", c.row(ago(13)) && !can(13),
  c.row(ago(13)) ? c.row(ago(13)).getAttribute("data-why") : "missing");
check("day 10 reads as set", c.row(ago(10)).getAttribute("data-jok") === "1");
check("day 17 is out of reach", !c.row(ago(17)));
check("today is never offered", !c.row(iso()));
check("a two-day gap stays broken, and the joker adds nothing", c.dashStreak() === 3,
  String(c.dashStreak()));
check("no uncaught errors (rules)", c.errs.length === 0, JSON.stringify(c.errs.map(String)));
c.window.close();

/* ---------------------------------------------------------------------------
   4. a joker cannot invent a streak from nothing
   ------------------------------------------------------------------------ */
const d = await boot({ [iso()]: { s: 0, b1: 0, b2: 0 }, [ago(1)]: { s: SHORT, b1: 0, b2: 0 } });
await d.openGate(); await d.enter("1234");
check("nothing to bridge from, so nothing is offered", !d.row(ago(1)) || d.row(ago(1)).getAttribute("data-can") === "0");
check("streak stays 0", d.dashStreak() === 0, String(d.dashStreak()));
d.window.close();

console.log(fail ? "SOME CHECKS FAILED" : "all checks passed");
process.exit(fail);

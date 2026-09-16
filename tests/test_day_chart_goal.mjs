// The 14-day chart is a third display of "was this day done", and it has to
// give the same answer as the ring and the flame.
//
// It coloured a bar green at `min >= 10`, a literal 600 s, and its legend said
// "Tages-Ziel (10 min)". The goal became a property of the day on 5 Sep 2026 and
// every day since carries g = 660. A day at 630 s therefore showed green in the
// dashboard while the ring read 95% and the streak did not count it: the same
// split between two displays of one test that DESIGN records costing a
// five-day streak once already. `dayDone(day)` is the only rule, so the chart
// reads it.
//
// Asserted, against a dashboard opened through the gate:
//   1. 630 s on a day stamped g = 660 is NOT green   (fails on the old build)
//   2. 630 s on a legacy day (no g, goal 600) IS green
//   3. 660 s on a g = 660 day is green, 100 s is not
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const iso = (off = 0) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const days = {
  [iso(-1)]: { s: 630, b1: 0, b2: 0, g: 660 },   // 10:30 on an 11-minute day: not done
  [iso(-2)]: { s: 630, b1: 0, b2: 0 },           // 10:30 on a legacy 10-minute day: done
  [iso(-3)]: { s: 660, b1: 0, b2: 0, g: 660 },   // exactly the goal: done
  [iso(-4)]: { s: 100, b1: 0, b2: 0, g: 660 }    // started, not done
};
const payload = {
  de: { v: 3, words: {}, coins: 0, days },
  en: { v: 3, words: {}, coins: 0, days: {} },
  meta: { lang: "de", speed: 4, snd: false }
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
const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

await sleep(500);
tap(btns().find((b) => b.textContent.trim() === "\u2699"));
await sleep(250);
const g = doc.querySelector("[data-pin-gate]");
if (g) {
  const ans = String(Number(g.getAttribute("data-gate-a")) * Number(g.getAttribute("data-gate-b")));
  for (const c of ans) tap(doc.querySelector(`[data-pin-key="${c}"]`));
  tap(doc.querySelector('[data-pin-key="ok"]'));
}
await sleep(400);
check("dashboard open", doc.body.textContent.includes("Eltern-Dashboard"));

const norm = (hex) => { const el = doc.createElement("div"); el.style.background = hex; return el.style.background; };
const GREEN = norm("#2FBF71");
const bar = (date) => [...doc.querySelectorAll("div[title]")].find((d) => d.getAttribute("title").startsWith(date + ":"));
const colour = (date) => { const b = bar(date); return b ? b.style.background : null; };

for (const off of [-1, -2, -3, -4]) check(`chart has a bar for ${iso(off)}`, !!bar(iso(off)));
check("630 s on an 11-minute day is not green", colour(iso(-1)) !== GREEN, `got ${colour(iso(-1))}`);
check("630 s on a legacy 10-minute day is green", colour(iso(-2)) === GREEN, `got ${colour(iso(-2))}`);
check("660 s on an 11-minute day is green", colour(iso(-3)) === GREEN, `got ${colour(iso(-3))}`);
check("100 s is not green", colour(iso(-4)) !== GREEN, `got ${colour(iso(-4))}`);
check("no uncaught errors", errs.length === 0, errs.map(String).join(" | "));
window.close();
process.exit(fail);

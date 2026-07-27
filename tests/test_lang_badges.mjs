// One gallery of 120 badges per language.
//
// Everything he had was earned reading German, so an existing save's badges
// become the German gallery, dates and bookkeeping intact. Nothing is
// re-evaluated and nothing is taken away. English starts empty except for the
// badges that are not claims about one language — practice minutes, the day
// streak, "Zwei Sprachen!", "Alles offen!" — which stay pooled and appear in
// both. Those are copied across at migration *already marked seen*, or the
// first check after the update fires twenty-odd toasts for things he earned
// weeks ago.
//
// Also covered: the export now carries the badges. It did not before, so moving
// to a new device wiped every award while the reading progress arrived intact.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b64 = (s) => Buffer.from(s, "utf8").toString("base64");

function mount(url = "https://example.com/blitzwort/") {
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  // the parent dashboard's voice picker subscribes to voiceschanged, so the
  // stub needs the listener methods or that screen throws on render
  window.speechSynthesis = {
    cancel: () => {}, getVoices: () => [], speak: () => {},
    addEventListener: () => {}, removeEventListener: () => {}
  };
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  return { window, errs };
}
const btns = (w) => [...w.document.querySelectorAll("button")];
const tap = (w, el) => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
const ach = (w) => JSON.parse(w.localStorage.getItem("sr.ach") || "null");
const head = (w) => (w.document.getElementById("root").innerHTML.match(/(\d+)\/(\d{2,4})</) || [])[1];

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

// answers up to n questions of the reading loop, pressing continue after a miss
async function play(w, n) {
  let answered = 0;
  for (let q = 0; q < n; q++) {
    for (let k = 0; k < 300; k++) {
      const t = btns(w).filter((b) => b.className.includes("tile"));
      if (t.length && t[0].parentElement.style.pointerEvents === "auto") break;
      await sleep(15);
    }
    const t = btns(w).filter((b) => b.className.includes("tile"));
    if (!t.length) break;
    tap(w, t[0]); answered++;
    await sleep(400);
    const cont = btns(w).find((b) => b.textContent.trim() === "▶");
    if (cont) tap(w, cont);
    await sleep(450);
  }
  return answered;
}

// ---- 1. an existing flat save becomes the German gallery -------------------
// a7 is shared (10 minutes in a day); a1 and c1 are German reading badges.
const legacy = {
  unlocked: { a1: "2026-06-01", c1: "2026-06-02", a7: "2026-06-03" },
  seen: { a1: true, c1: true, a7: true },
  bestStreak: 12, chunksDone: 5, perfectSpeeds: { 5: true }, vRounds: 3
};
const m = mount();
m.window.localStorage.setItem("sr.ach", JSON.stringify(legacy));
await sleep(700);
const mig = ach(m.window);
const stars = m.window.document.querySelectorAll("[data-new]").length;
console.log("after migration — de:", JSON.stringify(mig.de.unlocked), "| en:", JSON.stringify(mig.en.unlocked));
console.log("de bookkeeping kept:", mig.de.bestStreak, mig.de.chunksDone, JSON.stringify(mig.de.perfectSpeeds), mig.de.vRounds,
  "| en bookkeeping fresh:", mig.en.bestStreak, mig.en.chunksDone, mig.en.vRounds);
check("every badge he had is still unlocked, in the German gallery",
  ["a1", "c1", "a7"].every((id) => !!mig.de.unlocked[id]));
check("unlock dates survive untouched", mig.de.unlocked.a1 === "2026-06-01" && mig.de.unlocked.c1 === "2026-06-02");
check("German keeps its bookkeeping", mig.de.bestStreak === 12 && mig.de.chunksDone === 5 && mig.de.vRounds === 3);
check("English starts with fresh bookkeeping", mig.en.bestStreak === 0 && mig.en.chunksDone === 0 && mig.en.vRounds === 0);
check("the shared badge is in the English gallery too, same date", mig.en.unlocked.a7 === "2026-06-03");
check("German-only badges did NOT leak into English", !mig.en.unlocked.a1 && !mig.en.unlocked.c1);
check("the copied badge arrives already seen, so nothing pops up", !!mig.en.seen.a7 && stars === 0);
check("the migrated store is written back to storage", mig.v === 3);
m.window.close();

// ---- 2. the two galleries fill independently -------------------------------
const p = mount();
await sleep(450);
tap(p.window, btns(p.window).find((b) => b.textContent.trim() === "▶"));
const deAnswers = await play(p.window, 3);
tap(p.window, btns(p.window).find((b) => b.textContent.trim() === "🏠"));
await sleep(400);
const afterDe = ach(p.window);
console.log(`played ${deAnswers} German questions — de: ${Object.keys(afterDe.de.unlocked).length}, en: ${Object.keys(afterDe.en.unlocked).length}`);
check("German play unlocks German badges", Object.keys(afterDe.de.unlocked).length >= 1);
check("German play leaves the English gallery empty", Object.keys(afterDe.en.unlocked).length === 0);

// switch to English on the start screen and play there
tap(p.window, btns(p.window).find((b) => b.textContent.includes("English")));
await sleep(250);
tap(p.window, btns(p.window).find((b) => b.textContent.trim() === "▶"));
const enAnswers = await play(p.window, 3);
tap(p.window, btns(p.window).find((b) => b.textContent.trim() === "🏠"));
await sleep(400);
const afterEn = ach(p.window);
// the 23 pooled badges: minutes, day streak, "Zwei Sprachen!", "Alles offen!"
const POOLED = /^(a5|a7|h10|e\d+|f\d+)$/;
const newInDe = Object.keys(afterEn.de.unlocked).filter((id) => !afterDe.de.unlocked[id]);
console.log(`played ${enAnswers} English questions — de: ${JSON.stringify(Object.keys(afterEn.de.unlocked))}, en: ${JSON.stringify(Object.keys(afterEn.en.unlocked))}`);
check("English play unlocks English badges", Object.keys(afterEn.en.unlocked).length >= 1);
console.log("new in the German gallery during English play:", JSON.stringify(newInDe));
check("English play adds nothing to the German gallery except pooled badges",
  newInDe.every((id) => POOLED.test(id)));
check("a reading badge earned in English was not already there from German play",
  Object.keys(afterEn.en.unlocked).some((id) => !POOLED.test(id) && !afterDe.en.unlocked[id]));

// ---- 3. the gallery has a flag per language and counts them separately -----
tap(p.window, btns(p.window).find((b) => /🏆/.test(b.textContent)));
await sleep(250);
const shownFirst = head(p.window);
const flagDe = btns(p.window).find((b) => b.textContent.trim().startsWith("🇩🇪"));
const flagEn = btns(p.window).find((b) => b.textContent.trim().startsWith("🇬🇧"));
console.log("gallery opens on the language being played:", shownFirst, "| flags present:", !!flagDe, !!flagEn);
tap(p.window, flagDe);
await sleep(200);
const shownDe = head(p.window);
tap(p.window, flagEn);
await sleep(200);
const shownEn = head(p.window);
console.log("German gallery shows", shownDe, "| English gallery shows", shownEn);
check("both language flags are on the badge screen", !!flagDe && !!flagEn);
check("the German gallery reports the German count", Number(shownDe) === Object.keys(afterEn.de.unlocked).length);
check("the English gallery reports the English count", Number(shownEn) === Object.keys(afterEn.en.unlocked).length);
tap(p.window, btns(p.window).find((b) => b.textContent.trim() === "⬅"));
await sleep(300);

// ---- 4. the export carries the badges -------------------------------------
tap(p.window, btns(p.window).find((b) => b.textContent.trim() === "⚙"));
await sleep(300);
tap(p.window, btns(p.window).find((b) => /Export/.test(b.textContent)));
await sleep(250);
const area = p.window.document.querySelector("textarea[readonly]");
const exported = area ? area.value : "";
let parsed = null;
try { parsed = JSON.parse(exported); } catch (e) {}
console.log("export keys:", parsed ? Object.keys(parsed).join(",") : "(unreadable)");
check("the export includes the badges", !!parsed && !!parsed.ach && !!parsed.ach.de);
check("the export still includes both languages' words", !!parsed && !!parsed.de && !!parsed.en);
check("no uncaught errors while playing", p.errs.length === 0);

// and a fresh device fed that export gets both galleries back
const r = mount("https://example.com/blitzwort/?import=" + encodeURIComponent(b64(exported)));
await sleep(700);
const restored = ach(r.window);
console.log("restored — de:", Object.keys(restored.de.unlocked).length, "| en:", Object.keys(restored.en.unlocked).length);
check("importing on a new device restores the German gallery",
  Object.keys(restored.de.unlocked).length === Object.keys(afterEn.de.unlocked).length);
check("importing on a new device restores the English gallery",
  Object.keys(restored.en.unlocked).length === Object.keys(afterEn.en.unlocked).length);
check("no uncaught errors on the restored device", r.errs.length === 0);

p.window.close(); r.window.close();
process.exit(fail);

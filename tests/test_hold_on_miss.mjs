// A miss holds the screen until he taps continue.
//
// The feedback stage used to run on a timer: 950 ms for a correct answer, 1900
// ms for a wrong one. A miss is the one moment in the loop where there is
// actually something to look at — the word he did not recognise, spelled
// correctly, next to the tile he chose instead — and 1.9 s is not long enough
// to look at it, never mind long enough to ask for the sound again.
//
// So: correct answers still advance on their own, a wrong answer waits. While
// it waits the correct word stays up and tapping it replays the audio.
//
// Three assertions, and the first is the one that will regress if someone
// reinstates the timer: after four seconds on a miss, the app must still be
// sitting on the same word.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dom = new JSDOM(html, { url: "https://example.com/blitzwort/", runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
const spoken = [];
window.speechSynthesis = { cancel: () => {}, getVoices: () => [], speak: (u) => spoken.push(u.text) };
window.SpeechSynthesisUtterance = function (t) { this.text = t; };
const errs = [];
window.addEventListener("error", (e) => errs.push(e.error || e.message));

const buttons = () => [...window.document.querySelectorAll("button")];
const tiles = () => buttons().filter((b) => b.className.includes("tile"));
const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const wordSpan = () => [...window.document.querySelectorAll("span")]
  .find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && !s.closest("button"));

await sleep(400);
tap(buttons().find((b) => b.textContent.trim() === "\u25B6"));

// wait for the play screen to mount before reading anything — the start screen
// has its own word span (the product name) and would be captured as the target
for (let k = 0; k < 400 && tiles().length < 4; k++) await sleep(15);

// wait out fixation + flash, capturing the target on the way past
let target = "";
for (let k = 0; k < 400 && !target; k++) {
  const armed = tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto";
  const w = wordSpan();
  if (!armed && w) target = w.textContent.trim();
  await sleep(15);
}
for (let k = 0; k < 400; k++) {
  if (tiles()[0] && tiles()[0].parentElement.style.pointerEvents === "auto") break;
  await sleep(15);
}
console.log("target:", JSON.stringify(target));

// answer deliberately wrong
const wrong = tiles().find((b) => b.textContent.trim() !== target);
console.log("tapped the wrong tile:", JSON.stringify(wrong.textContent.trim()));
tap(wrong);
await sleep(200);

const spokenAfterMiss = spoken.length;
const shownNow = (wordSpan() || {}).textContent;
console.log("correct word shown right after the miss:", JSON.stringify(shownNow));

// the old behaviour advanced at 1900 ms. Sit here well past that.
await sleep(4000);
const stillShown = (wordSpan() || {}).textContent;
const held = stillShown && stillShown.trim() === target;
console.log("after 4.2 s, still showing the same word:", held, JSON.stringify(stillShown));

// tapping the word plays it again
const w = wordSpan();
tap(w);
await sleep(150);
const replayed = spoken.length > spokenAfterMiss;
console.log("spoken count before/after tapping the word:", spokenAfterMiss, "->", spoken.length);

// only continue moves on. In a round the sole "▶" is the continue button.
const cont = buttons().find((b) => b.textContent.trim() === "\u25B6");
console.log("continue button present:", !!cont);
if (cont) tap(cont);
await sleep(700);
const movedOn = !wordSpan() || wordSpan().textContent.trim() !== target ||
  (tiles()[0] && tiles()[0].parentElement.style.opacity === "0");
console.log("advanced after continue:", movedOn);
console.log("uncaught errors:", errs.length);

let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "ok  " : "FAIL"}  ${name}`); if (!cond) fail = 1; };

check("a target was flashed and a wrong tile was tapped", !!target && !!wrong);
check("the correct word is shown on a miss", shownNow && shownNow.trim() === target);
check("no auto-advance: still on the same word 4 s later", held);
check("tapping the word plays it again", replayed);
check("a continue button is offered", !!cont);
check("continue advances the round", movedOn);
check("no uncaught errors", errs.length === 0);

process.exit(fail);

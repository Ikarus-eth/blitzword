import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html, {
  url: "https://example.com/blitzwort/",
  runScripts: "dangerously",
  pretendToBeVisual: true
});
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;

// jsdom has no speechSynthesis at all — install a spy so we can see what the app tries to say
const spoken = [];
window.speechSynthesis = {
  cancel: () => {},
  getVoices: () => [],
  speak: (utt) => spoken.push(utt.text)
};
window.SpeechSynthesisUtterance = function (text) { this.text = text; };

await new Promise((r) => setTimeout(r, 300));

const playBtn = [...window.document.querySelectorAll("button")].find((b) => b.textContent.trim() === "▶");
playBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

// fixation (500ms) then into word stage — sample the flashed word before it's masked
await new Promise((r) => setTimeout(r, 600));
const flashSpan = [...window.document.querySelectorAll("span")].find(
  (s) => s.textContent.trim().length > 0 && /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()) && s.textContent.trim() !== "▶"
);
const target = flashSpan ? flashSpan.textContent.trim() : null;
console.log("captured flashed target word:", target);

// default speed index 3 -> 2500ms flash; wait past it into the answer stage
// (500ms fixation + 2500ms flash already elapsed 600ms of it above, add solid margin)
await new Promise((r) => setTimeout(r, 2700));

const tiles = [...window.document.querySelectorAll("button")].filter((b) => b.textContent.trim() === target);
console.log("matching answer tile found:", tiles.length > 0);
console.log("spoken[] before any tap (should be empty):", JSON.stringify(spoken));

tiles[0].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 150));

console.log("\nspoken after tapping the CORRECT tile:", JSON.stringify(spoken));
console.log("speech fired on a CORRECT answer:", spoken.includes(target + "."));

console.log("\n=== SPEAK-ON-CORRECT TEST", spoken.includes(target + ".") ? "PASSED" : "FAILED", "===");
process.exit(spoken.includes(target + ".") ? 0 : 1);

import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html, { url: "https://example.com/blitzwort/", runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
window.speechSynthesis = { cancel: () => {}, getVoices: () => [], speak: () => {} };
window.SpeechSynthesisUtterance = function (t) { this.text = t; };
const errors = [];
window.addEventListener("error", (e) => errors.push(e.error || e.message));

await new Promise((r) => setTimeout(r, 300));

// 1. trophy button exists on Home and gallery opens with none unlocked.
// The denominator is read from the page rather than hardcoded: it is the badge
// count, which changes whenever a category is added, and a literal here means
// two unrelated tests break every time that happens.
const byText = (t) => [...window.document.querySelectorAll("button")].find((b) => b.textContent.includes(t));
const trophyBtn = byText("🏆");
console.log("trophy button found on Home:", !!trophyBtn);
trophyBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
let rootHtml = window.document.getElementById("root").innerHTML;
const TOTAL = (rootHtml.match(/\b0\/(\d{2,4})\b/) || [])[1];
console.log("gallery opened (0/" + TOTAL + " shown):", !!TOTAL);
console.log("all 10 category names present:", ["Erste Schritte", "Richtige in Folge", "Fragen beantwortet", "Wörter gemeistert", "Tägliche Übung", "Tage-Serie", "Perfektes Tempo", "Übungs-Stufen", "Stufen gemeistert", "Turbo & Gold"].every((c) => rootHtml.includes(c)));
console.log("locked badges show the lock icon:", rootHtml.includes("🔒"));

// back to home, then play a round
const backBtn = byText("⬅");
backBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));

const playBtn = byText("▶");
playBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 600));
const flashSpan = [...window.document.querySelectorAll("span")].find((s) => /^[a-zA-ZäöüÄÖÜß]+$/.test(s.textContent.trim()));
const target = flashSpan.textContent.trim();
await new Promise((r) => setTimeout(r, 2700));
const correctTile = [...window.document.querySelectorAll("button")].find((b) => b.textContent.trim() === target);
correctTile.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 100));

rootHtml = window.document.getElementById("root").innerHTML;
console.log("\nafter 1 correct answer:");
console.log("uncaught errors:", errors.length);
console.log("unlock toast appeared (Abzeichen!):", rootHtml.includes("Abzeichen"));
console.log("toast shows the right badge title:", rootHtml.includes("Erste richtige Antwort"));

const achStored = JSON.parse(window.localStorage.getItem("sr.ach") || "null");
console.log("\nsr.ach persisted:", !!achStored);
console.log("a1 recorded as unlocked in storage:", achStored && !!achStored.unlocked.a1);
console.log("only a1 unlocked, nothing extra:", achStored && Object.keys(achStored.unlocked).length === 1);

// jump back home (via the in-game home button) then reopen gallery, confirm it now shows 1/100 and a1 in full color
const homeBtn = [...window.document.querySelectorAll("button")].find((b) => b.textContent.trim() === "🏠");
homeBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
const trophyBtn2 = byText("🏆");
trophyBtn2.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
rootHtml = window.document.getElementById("root").innerHTML;
console.log("\ngallery now shows 1/" + TOTAL + ":", rootHtml.includes(`1/${TOTAL}`));
console.log("Erste Schritte category shows 1/10:", /Erste Schritte[\s\S]{0,60}1\/10/.test(rootHtml));

const allPass = errors.length === 0 && !!achStored && !!achStored.unlocked.a1 && !!TOTAL && rootHtml.includes(`1/${TOTAL}`);
console.log("\n=== ACHIEVEMENTS E2E TEST", allPass ? "PASSED" : "FAILED", "===");
process.exit(allPass ? 0 : 1);

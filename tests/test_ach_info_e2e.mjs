import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html, { url: "https://example.com/blitzwort/", runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
delete window.storage;
const errors = [];
window.addEventListener("error", (e) => errors.push(e.error || e.message));

await new Promise((r) => setTimeout(r, 300));

const byText = (t) => [...window.document.querySelectorAll("button")].find((b) => b.textContent.includes(t));
byText("🏆").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));

let rootHtml = window.document.getElementById("root").innerHTML;
// denominator read from the page, not hardcoded — see test_achievements_e2e
const TOTAL = (rootHtml.match(/\b0\/(\d{2,4})\b/) || [])[1];
console.log("gallery opened (0/" + TOTAL + "):", !!TOTAL);

// find a badge button by its terse title text and tap it — "Richtig!"
// (a1: answer one question correctly) should exist and be locked (grayscale)
const badgeBtn = [...window.document.querySelectorAll("button")].find((b) => b.textContent.includes("Richtig!"));
console.log("found the 'Richtig!' badge button:", !!badgeBtn);
badgeBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));

rootHtml = window.document.getElementById("root").innerHTML;
console.log("\nafter tapping the badge:");
console.log("uncaught errors:", errors.length);
console.log("modal shows the full explanation text:", rootHtml.includes("Beantworte eine einzige Frage richtig"));
console.log("modal shows locked status (not achieved yet):", rootHtml.includes("Noch nicht geschafft"));
console.log("modal does NOT falsely claim it's achieved:", !rootHtml.includes("Geschafft am"));

// tap outside the card (the semi-transparent overlay) to dismiss
const overlay = [...window.document.querySelectorAll("div")].find((d) => {
  const s = d.getAttribute("style") || "";
  return s.includes("position: fixed") && s.includes("z-index: 70");
});
console.log("\noverlay found:", !!overlay);
overlay.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
rootHtml = window.document.getElementById("root").innerHTML;
console.log("modal dismissed after tapping outside:", !rootHtml.includes("Beantworte eine einzige Frage richtig"));
console.log("gallery still visible underneath (didn't accidentally navigate away):", rootHtml.includes(`0/${TOTAL}`));

const allPass = errors.length === 0 && !!TOTAL && rootHtml.includes(`0/${TOTAL}`);
console.log(`\n=== ACHIEVEMENT INFO MODAL E2E TEST ${allPass ? "PASSED" : "FAILED"} ===`);
process.exit(allPass ? 0 : 1);

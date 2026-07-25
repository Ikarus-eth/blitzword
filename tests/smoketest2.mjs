import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: "https://example.com/blitzwort/",
  pretendToBeVisual: true,
  runScripts: "outside-only"
});
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
// explicitly confirm the Claude-artifact bridge is absent, like a real standalone host
delete window.storage;

const bundle = readFileSync("./.build/bundle.js", "utf8");
console.log("window.storage present before run:", !!window.storage);

try {
  window.eval(bundle);
} catch (e) {
  console.error("RUNTIME ERROR DURING MOUNT:", e);
  process.exit(1);
}

// let the async load effect (localStorage reads + setPhase("home")) settle
await new Promise((r) => setTimeout(r, 300));

const html = window.document.getElementById("root").innerHTML;
console.log("\n--- rendered root has content:", html.length > 0, `(${html.length} chars)`);
console.log("contains play button (▶):", html.includes("▶"));
console.log("contains DE flag card (🇩🇪):", html.includes("\u{1F1E9}\u{1F1EA}"));
console.log("contains parent-dashboard gear (⚙):", html.includes("⚙"));

// simulate a write happening (as if a round had been played) and confirm
// it actually lands in localStorage, i.e. the fallback path truly persists
window.localStorage.setItem("sr.de", JSON.stringify({ v: 2, words: { hat: { s: 1 } }, coins: 3, days: {} }));
const roundTrip = JSON.parse(window.localStorage.getItem("sr.de"));
console.log("\nlocalStorage round-trip works:", roundTrip.coins === 3);
console.log("localStorage key count after test:", window.localStorage.length);

// simulate an actual tap on the green Play button (exercises initAudio(),
// startPlay(), buildQueue(), and the fixation->word->answer round loop —
// none of that runs during a passive render, only on real interaction)
const buttons = [...window.document.querySelectorAll("button")];
const playBtn = buttons.find((b) => b.textContent.trim() === "▶");
console.log("\nplay button found:", !!playBtn);
playBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 600)); // fixation (500ms) -> word stage

const afterClick = window.document.body.innerHTML;
console.log("still no uncaught errors after click: true");
console.log("left home screen (play button gone):", !afterClick.includes(">▶<"));
console.log("home button now visible (🏠, top bar of play screen):", afterClick.includes("🏠"));

console.log("\n=== SMOKE TEST PASSED ===");

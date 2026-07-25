// The game title on the start screen. Three things must hold:
//   1. it renders on the language-select (home) screen,
//   2. it is language-independent — it's the product name, not interface copy,
//   3. it does NOT persist into the play screen. A word flashes for as little as
//      250 ms there and the mask exists so nothing readable survives the flash;
//      a permanent second word on screen would be a competing fixation target.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const TITLE = "BlitzWort";
const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html, { url: "https://example.com/blitzwort/", runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
const errors = [];
window.addEventListener("error", (e) => errors.push(e.error || e.message));

const root = () => window.document.getElementById("root").innerHTML;
const buttons = () => [...window.document.querySelectorAll("button")];
const tap = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

await new Promise((r) => setTimeout(r, 300));

const onHomeDe = root().includes(TITLE);
console.log("title shown on start screen (DE selected):", onHomeDe);

// switch to the English card — the title is a proper noun, it must not change
const enCard = buttons().find((b) => b.textContent.includes("English"));
console.log("English language card found:", !!enCard);
tap(enCard);
await new Promise((r) => setTimeout(r, 80));
const onHomeEn = root().includes(TITLE);
console.log("title still shown after switching to EN:", onHomeEn);

// back to German, then start a round
tap(buttons().find((b) => b.textContent.includes("Deutsch")));
await new Promise((r) => setTimeout(r, 80));
tap(buttons().find((b) => b.textContent.trim() === "▶"));
await new Promise((r) => setTimeout(r, 600)); // fixation (500 ms) -> word stage

const leftHome = !root().includes(">▶<");
const goneInPlay = !root().includes(TITLE);
console.log("left the start screen:", leftHome);
console.log("title absent during play (no competing fixation target):", goneInPlay);
console.log("uncaught errors:", errors.length);

const pass = onHomeDe && onHomeEn && leftHome && goneInPlay && errors.length === 0;
console.log(`\n=== HOME TITLE TEST ${pass ? "PASSED" : "FAILED"} ===`);
process.exit(pass ? 0 : 1);

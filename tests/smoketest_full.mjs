import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf8");

const virtualConsole = new (await import("jsdom")).VirtualConsole();
const errors = [];
virtualConsole.on("jsdomError", (e) => errors.push(e));

const dom = new JSDOM(html, {
  url: "https://example.com/blitzwort/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole
});
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;

window.addEventListener("error", (e) => errors.push(e.error || e.message));

await new Promise((r) => setTimeout(r, 400));

console.log("uncaught errors:", errors.length);
errors.forEach((e) => console.log(" -", e && e.stack ? e.stack.split("\n")[0] : e));

const root = window.document.getElementById("root");
console.log("root rendered:", root.innerHTML.length > 0, `(${root.innerHTML.length} chars)`);
console.log("play button present:", root.innerHTML.includes("▶"));
console.log("error-fallback message NOT shown (means no load error):", !root.innerHTML.includes("schiefgelaufen"));
console.log("title:", window.document.title);
console.log("apple-mobile-web-app-capable tag present:", !!window.document.querySelector('meta[name="apple-mobile-web-app-capable"]'));
console.log("manifest link present:", !!window.document.querySelector('link[rel="manifest"]'));
console.log("apple-touch-icon link present:", !!window.document.querySelector('link[rel="apple-touch-icon"]'));

process.exit(errors.length > 0 ? 1 : 0);

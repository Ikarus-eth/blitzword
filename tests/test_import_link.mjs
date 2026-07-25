import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

// build the exact same encoded payload the app's "Link erstellen" button would produce
const b64encode = (str) => Buffer.from(str, "utf8").toString("base64");
const fakeProgress = {
  de: {
    v: 2,
    words: {
      "hat": { s: 2, cc: 3, d: ["2026-07-18", "2026-07-19"], iv: 1, due: "2026-07-25", r: 12, wr: 2, tn: [3, 1, 0], mx: { het: 2 } },
      "Mütze": { s: 1, cc: 1, d: ["2026-07-20"], iv: 0, due: null, r: 3, wr: 1, tn: [1, 0, 0] }
    },
    coins: 87,
    days: { "2026-07-20": { s: 640, b1: 1, b2: 0 } }
  },
  en: { v: 2, words: {}, coins: 5, days: {} },
  meta: { lang: "de", speed: 4, snd: true, pagesUrl: "https://example.github.io/blitzwort/" }
};
const encoded = b64encode(JSON.stringify(fakeProgress));
const importUrl = `https://example.github.io/blitzwort/?import=${encodeURIComponent(encoded)}`;
console.log("simulated import URL length:", importUrl.length);

const html = readFileSync("./index.html", "utf8");
const { VirtualConsole } = await import("jsdom");
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e));

const dom = new JSDOM(html, {
  url: importUrl,   // <-- this is the whole point: load AS IF the link was tapped
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: vc
});
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
delete window.storage;
window.addEventListener("error", (e) => errors.push(e.error || e.message));

console.log("\nlocalStorage BEFORE any script runs (should be empty — fresh device):", window.localStorage.length);

await new Promise((r) => setTimeout(r, 400));

console.log("uncaught errors:", errors.length);
errors.forEach((e) => console.log(" -", e && e.stack ? e.stack.split("\n")[0] : e));

console.log("\n--- after load ---");
console.log("localStorage key count:", window.localStorage.length);
const storedDe = JSON.parse(window.localStorage.getItem("sr.de") || "null");
console.log("sr.de imported correctly:", storedDe && storedDe.coins === 87 && !!storedDe.words["Mütze"]);
console.log("umlaut word key intact:", storedDe && Object.keys(storedDe.words).includes("Mütze"));
const storedMeta = JSON.parse(window.localStorage.getItem("sr.meta") || "null");
console.log("meta imported (pagesUrl remembered):", storedMeta && storedMeta.pagesUrl === "https://example.github.io/blitzwort/");

console.log("\nURL was cleaned up (no ?import= left, avoids re-importing on refresh):", !window.location.search.includes("import="));

const rootHtml = window.document.getElementById("root").innerHTML;
console.log("\nhome screen shows imported coin count (87):", rootHtml.includes("87"));
console.log("play button rendered:", rootHtml.includes("▶"));

console.log("\n=== IMPORT-LINK TEST", errors.length === 0 ? "PASSED" : "FAILED", "===");
process.exit(errors.length > 0 ? 1 : 0);

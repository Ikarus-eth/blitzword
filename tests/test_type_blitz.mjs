// Tipp-Blitz: he writes the word instead of picking it.
//
// The export said the four-tile format cannot fix what is wrong. 87% of his 454
// wrong answers are one wrong letter, 52% of those in the middle of the word,
// and 42% of everything wrong is one vowel put in place of another. He is at
// 90% telling m from n on a tile in Buchstaben-Blitz and still writes "wemt",
// "fimd", "agaim". Recognition and production are different skills and only one
// of them was being trained.
//
// The three ways of being right without spelling, each asserted below:
//   - the word still on screen  -> copying, and copying is not spelling
//   - empty slots for each letter -> hands him the silent e in "ride", and
//     dropped letters are 8% of his errors
//   - a key rejected as he types -> tap-until-green, which pays and teaches
//     nothing
//
// And the keyboard: measured on his real export, 91% of the wrong spellings he
// actually produces use a letter that is not in the target word. A board built
// from the word's own letters could not produce one of them, so it could not
// correct them either. The board therefore carries the letters he has actually
// written in their place.
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Poll for the write instead of sleeping past the debounce. The save is on a
// 1200 ms timer and a flat wait that happens to clear it on an idle machine
// fails under load — that is the test_animal_mix race, already paid for once.
const waitFor = async (fn, ms = 6000) => {
  for (let i = 0; i < ms / 100; i++) { if (fn()) return true; await sleep(100); }
  return false;
};
const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

// the twelve weakest words in his book, with the misspellings he really made
const REAL = {
  went: { r: 16, wr: 34, mx: { want: 7, tent: 3, wemt: 7, vent: 4, wend: 5, wint: 4, wet: 4 } },
  ride: { r: 16, wr: 29, mx: { rid: 7, rode: 9, rede: 2, hide: 5, ryde: 1, ribe: 2, ridi: 2, rite: 1 } },
  came: { r: 21, wr: 29, mx: { ceme: 8, come: 8, cane: 1, cave: 3, name: 5, kame: 2, cama: 1, cami: 1 } },
  find: { r: 24, wr: 28, mx: { fimd: 6, fend: 4, vind: 3, finb: 3, fynd: 1, mind: 3, fine: 4, fond: 2, fint: 2 } },
  want: { r: 14, wr: 16, mx: { went: 5, wand: 5, wait: 2, wamt: 1, wont: 1, vant: 2 } },
  come: { r: 18, wr: 20, mx: { came: 8, coma: 2, cume: 5, kome: 1, cone: 3, some: 1 } },
  made: { r: 13, wr: 14, mx: { madi: 2, mede: 2, mate: 2, mad: 2, nade: 1, make: 3, mada: 1, maid: 1 } },
  make: { r: 16, wr: 15, mx: { maka: 2, mane: 4, made: 3, take: 2, moke: 1, nake: 1, meke: 2 } },
  his: { r: 19, wr: 14, mx: { hys: 4, has: 3, is: 2, hes: 3, hic: 2 } },
  down: { r: 11, wr: 8, mx: { dovn: 1, town: 2, bown: 1, duwn: 2, dawn: 1, dowm: 1 } },
  with: { r: 13, wr: 9, mx: { will: 2, vith: 1, wit: 2, wyth: 1, wish: 1, weth: 1, widh: 1 } },
  can: { r: 28, wr: 19, mx: { cen: 3, cat: 4, cap: 3, san: 2, con: 5, cam: 2 } }
};

// the reach gate is real — he is not asked to write words from levels he has
// not got to — so the fixture has to earn its way up the ladder first. The EN
// list is read out of the source rather than copied, so it cannot drift.
const src = readFileSync("./src/App.jsx", "utf8");
const EN = eval(src.slice(src.indexOf("const EN = [") + 11, src.indexOf("\n];", src.indexOf("const EN = [")) + 2));
const mastered = () => ({
  s: 2, cc: 4, d: [ago(4), ago(3)], iv: 2, due: ago(-9),
  r: 9, wr: 0, tn: [9, 8, 0], h: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], everMastered: true
});

const payload = () => {
  const words = {};
  EN.slice(0, 4).forEach((lvl) => lvl.forEach((e) => { words[e[0]] = mastered(); }));
  for (const [w, v] of Object.entries(REAL)) {
    words[w] = {
      ...mastered(), due: ago(1), r: v.r, wr: v.wr,
      tn: [v.r, 4, 2], h: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1], mx: v.mx
    };
  }
  const days = {};
  for (let i = 1; i <= 6; i++) days[ago(i)] = { s: 700, b1: 0, b2: 0 };
  days[iso()] = { s: 0, b1: 0, b2: 0 };
  return {
    de: { v: 3, words: {}, coins: 0, days: {} },
    en: { v: 3, words, coins: 0, days },
    meta: { lang: "en", speed: 9, snd: false }   // speed 9: the floor on exposure is what is under test
  };
};

const html = readFileSync("./index.html", "utf8");

async function boot() {
  const url = "https://example.github.io/blitzword/?import=" +
    encodeURIComponent(Buffer.from(JSON.stringify(payload()), "utf8").toString("base64"));
  const dom = new JSDOM(html, { url, runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  delete window.storage;
  const errs = [];
  window.addEventListener("error", (e) => errs.push(e.error || e.message));
  await sleep(450);
  const doc = window.document;
  const q = (sel) => doc.querySelector(sel);
  const all = (sel) => [...doc.querySelectorAll(sel)];
  const tap = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const btns = () => [...doc.querySelectorAll("button")];
  const target = () => { const e = q("[data-type-target]"); return e ? e.textContent.trim() : null; };
  const keys = () => all("[data-type-key]").map((b) => b.getAttribute("data-type-key")).filter((k) => k !== "del");
  const typed = () => { const e = q("[data-type-input]"); return e ? e.textContent.trim() : null; };
  const press = (c) => tap(q(`[data-type-key="${c}"]`));
  const en = () => JSON.parse(window.localStorage.getItem("sr.en"));
  const rec = (w) => en().words[w];
  return { window, doc, errs, q, all, tap, btns, target, keys, typed, press, en, rec };
}

let fail = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "ok  " : "FAIL"}  ${name}${extra !== "" ? "   " + extra : ""}`);
  if (!cond) fail = 1;
};

const a = await boot();

/* ---- the tile is on the home screen ---- */
check("Tipp-Blitz has a launcher", !!a.q("[data-type-tile]"));
a.tap(a.q("[data-type-tile]"));
await sleep(120);
check("it opens the game", !!a.q("[data-type-screen]"));

/* ---- the flash, then the gap ---- */
const shown = a.target();
check("the word is shown to start with", !!shown && /^[a-z]+$/.test(shown), String(shown));
check("speed 9 does not make it a memory test — the exposure has a floor",
  a.target() !== null);
await sleep(1700);   // past the 1500 ms floor
check("THE WORD IS GONE BEFORE HE TYPES", a.target() === null, String(a.target()));
// body.textContent would include the inlined bundle, which holds the whole
// word list; only the rendered screen matters here
const screenText = () => {
  const n = a.q("[data-type-screen]").cloneNode(true);
  n.querySelectorAll("style").forEach((e) => e.remove());
  return n.textContent;
};
check("and it is nowhere else on the rendered screen either",
  !screenText().includes(shown), screenText().slice(0, 70));
check("no empty slots give the length away",
  (a.typed() || "").replace(/[▮\s]/g, "") === "", JSON.stringify(a.typed()));

/* ---- the keyboard carries the letters he actually writes ---- */
const ks = a.keys();
check("the keyboard is the whole alphabet", ks.length === 26, String(ks.length));
check("in QWERTY order, not alphabetical", ks.slice(0, 3).join("") === "qwe", ks.slice(0, 6).join(""));
// the 14-key board was measured at 38% for a player who knows every consonant
// and guesses the vowel; five forced vowels took that to 9%. A full alphabet
// removes the question — nothing about the key set depends on the word, so it
// cannot leak, and every letter he might reach for is present.
check("every vowel is there", ["a", "e", "i", "o", "u"].every((v) => ks.includes(v)), ks.join(""));
const inWord = new Set(shown.split(""));
check("it is not just the word's own letters",
  ks.filter((k) => !inWord.has(k)).length >= 20, ks.join(""));
const before = a.rec(shown);
const wrongOnes = Object.keys(before.mx || {});
const reachable = wrongOnes.filter((g) => [...g].every((c) => ks.includes(c)));
check(`his real misspellings of "${shown}" are reachable on this board`,
  wrongOnes.length === 0 || reachable.length / wrongOnes.length >= 0.8,
  `${reachable.length}/${wrongOnes.length}: ${reachable.join(" ")}`);

/* ---- a wrong letter is accepted, not rejected: no tap-until-green ---- */
const wrongKey = ks.find((k) => k !== shown[0]);
a.press(wrongKey);
await sleep(80);
check("a wrong first letter is accepted, so the keypad cannot be searched",
  a.typed() === wrongKey, `${a.typed()} vs ${wrongKey}`);
check("nothing is judged before ✓", !a.q("[data-type-target]"));
a.press("del");
await sleep(80);
check("backspace works", a.typed() === null || a.typed() === "▮", JSON.stringify(a.typed()));

/* ---- a wrong word: recorded, and the diff shows where ---- */
const wrong = wrongOnes.find((g) => [...g].every((c) => ks.includes(c))) || wrongKey;
for (const c of wrong) a.press(c);
await sleep(80);
a.tap(a.q("[data-type-commit]"));
await sleep(200);
check("committing a wrong spelling shows the correct word", a.target() === shown, String(a.target()));
const contBtn = () => a.btns().find((b) => /Weiter|Continue|Next|Go on/i.test(b.textContent));
check("and it does not skip on by itself", !!contBtn(),
  a.btns().map((x) => x.textContent).join("|"));
await waitFor(() => a.rec(shown).tp);
const rec = a.rec(shown);
check("the miss is recorded under tp", rec.tp && rec.tp.wr === 1, JSON.stringify(rec.tp));
check("with what he actually wrote", rec.tp.mx && rec.tp.mx[wrong] === 1, JSON.stringify(rec.tp.mx));
check("the reading record is untouched — s", rec.s === before.s, `${rec.s} was ${before.s}`);
check("the reading record is untouched — r/wr",
  rec.r === before.r && rec.wr === before.wr, `${rec.r}/${rec.wr}`);
check("and it is not pushed into review", rec.due === before.due, String(rec.due));
check("the day is credited from typing", (a.en().days[iso()] || {}).s > 0, String((a.en().days[iso()] || {}).s));

/* ---- a correct word ---- */
a.tap(contBtn());
await sleep(1700);
const w2 = a.q("[data-type-screen]") ? null : null;
const ks2 = a.keys();
check("the keyboard does not change between words — it cannot leak the letters",
  ks2.join("") === ks.join(""), ks2.join(""));
check("and its word is hidden too", a.target() === null);
a.window.close();

/* ---- a second boot to type one right, from the flash ---- */
const b = await boot();
b.tap(b.q("[data-type-tile]"));
await sleep(120);
const word2 = b.target();
await sleep(1700);
for (const c of word2) b.press(c);
await sleep(80);
check("he can spell it correctly from memory", b.typed() === word2, `${b.typed()} vs ${word2}`);
b.tap(b.q("[data-type-commit]"));
await sleep(300);
check("a right answer is marked as right", !!b.q("[data-type-ok]"),
  b.q("[data-type-ok]") ? b.q("[data-type-ok]").textContent : "no mark");
// It used to slide away after 1100 ms, which took the word off screen at the
// one moment worth looking at: he built it himself and it is correct. Both
// outcomes wait for the tap now, so nothing about the pause tells him which he
// got before he has read it.
await sleep(1900);
check("a right answer WAITS for the tap and does not advance on its own",
  b.target() === word2 && !b.q("[data-type-commit]"), String(b.target()));
check("the continue button is there for a right answer too",
  !!b.btns().find((x) => /Go on|Weiter|Continue|Next/i.test(x.textContent)),
  b.btns().map((x) => x.textContent).join("|"));
await waitFor(() => b.rec(word2).tp);
const rec2 = b.rec(word2);
check("a hit is recorded under tp", rec2.tp && rec2.tp.r === 1, JSON.stringify(rec2.tp));
check("a hit does not promote the reading level either", rec2.s === 2, String(rec2.s));
check("coins went up", b.en().coins > 0, String(b.en().coins));
check("no uncaught errors", b.errs.length === 0, JSON.stringify(b.errs.map(String)));
b.window.close();

console.log(fail ? "SOME CHECKS FAILED" : "all checks passed");
process.exit(fail);

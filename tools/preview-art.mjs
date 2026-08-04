import { ANIMALS, ORDER } from "../src/art.mjs";
import { writeFileSync, readFileSync } from "fs";

const kebab = (k) => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
const attrs = (o) =>
  Object.entries(o).map(([k, v]) => `${kebab(k)}="${v}"`).join(" ");
const render = (els) => els.map(([t, o]) => `<${t} ${attrs(o)}/>`).join("");

const GWRAP = (inner) =>
  `<g stroke="${"#22314A"}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;

/* one band of one animal, drawn into a w x (w/2) box */
export const band = (key, b, x, y, w) => {
  const a = ANIMALS[key];
  const els = [a.head(), a.body(), a.rear()][b];
  return `<svg x="${x}" y="${y}" width="${w}" height="${w / 2}" viewBox="0 ${b * 60} 120 60">${GWRAP(render(els))}</svg>`;
};

const whole = (keys, x, y, w) =>
  keys.map((k, i) => band(k, i, x, y + (i * w) / 2, w)).join("");

/* ---------------------------------------------------------------------------
   node tools/preview-art.mjs --raster  ->  sheet-raster.html

   The shipped drawings are the generated illustrations inlined in src/App.jsx,
   not these vectors — the vectors are the geometry the illustrations were
   warped back onto, and the fallback if that ever has to be undone. This mode
   pulls the inline images straight out of App.jsx and lays out the same three
   checks the vector sheet does: all eight whole, hybrids with a rule drawn
   across each cut so a mismatched seam is obvious, and the strips at answer-
   tile size, which is the smallest they are ever seen.

   HTML rather than SVG because the images are data URIs; open it in a browser.
--------------------------------------------------------------------------- */
if (process.argv.includes("--raster")) {
  const src = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const imgs = {};
  const re = /(\w+): "(data:image\/webp;base64,[A-Za-z0-9+/=]+)"/g;
  let m;
  while ((m = re.exec(src))) imgs[m[1]] = m[2];
  const keys = ORDER.filter((k) => imgs[k]);
  if (keys.length !== ORDER.length) {
    console.error(`only found ${keys.length}/${ORDER.length} inline images in src/App.jsx`);
    process.exit(1);
  }
  const W = 150, BH = W / 2;
  const strip = (k, b) =>
    `<div style="width:${W}px;height:${BH}px;overflow:hidden;position:relative;` +
    (b ? "border-top:4px solid rgba(34,49,74,.34);box-shadow:inset 0 3px 5px -3px rgba(34,49,74,.45);" : "") +
    `"><img src="${imgs[k]}" style="position:absolute;left:0;top:${-b * BH}px;width:${W}px;height:${W * 1.5}px"></div>`;
  const whole = (t) => `<div style="margin:0 8px">${[0, 1, 2].map((b) => strip(t[b], b)).join("")}</div>`;
  const HY = [["krokodil", "jaguar", "elefant"], ["giraffe", "flamingo", "zebra"],
              ["gorilla", "krokodil", "kamel"], ["zebra", "giraffe", "jaguar"],
              ["flamingo", "kamel", "gorilla"], ["elefant", "zebra", "giraffe"]];
  const tiny = (k) => `<div style="margin:0 6px;width:92px">${[0, 1, 2].map((b) =>
    `<div style="width:92px;height:46px;overflow:hidden;position:relative;` +
    (b ? "border-top:3px solid rgba(34,49,74,.34);" : "") +
    `"><img src="${imgs[k]}" style="position:absolute;left:0;top:${-b * 46}px;width:92px;height:138px"></div>`).join("")}</div>`;
  writeFileSync("sheet-raster.html",
    `<!doctype html><meta charset="utf-8"><title>BlitzWort — Tier-Blitz artwork</title>
<body style="background:#EDF5FC;font:14px system-ui;color:#22314A;margin:24px">
<h2>the eight, whole</h2><div style="display:flex">${keys.map((k) => whole([k, k, k])).join("")}</div>
<h2>hybrids — a rule is drawn across every cut</h2><div style="display:flex">${HY.map(whole).join("")}</div>
<h2>at answer-tile size</h2><div style="display:flex">${keys.map(tiny).join("")}</div>
</body>`);
  console.log(`sheet-raster.html written (${keys.length} animals)`);
  process.exit(0);
}

const W = 120;
const cols = 8;
const sheetW = cols * (W + 16) + 16;

let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="1030" viewBox="0 0 ${sheetW} 1030">
<rect width="100%" height="100%" fill="#EDF5FC"/>`;

ORDER.forEach((k, i) => {
  const x = 16 + i * (W + 16);
  out += `<rect x="${x - 6}" y="10" width="${W + 12}" height="${W * 1.5 + 34}" rx="18" fill="#fff" stroke="#22314A" stroke-width="3"/>`;
  out += whole([k, k, k], x, 22, W);
  out += `<text x="${x + W / 2}" y="${22 + W * 1.5 + 20}" font-family="sans-serif" font-size="15" font-weight="700" text-anchor="middle" fill="#22314A">${k}</text>`;
});

const HY = [
  ["krokodil", "jaguar", "elefant", "Krogufant"],
  ["giraffe", "flamingo", "zebra", "Giminbra"],
  ["gorilla", "krokodil", "kamel", "Gokomel"],
  ["zebra", "giraffe", "jaguar", "Zerafar"],
  ["flamingo", "kamel", "gorilla", "Flamela"],
  ["kamel", "gorilla", "giraffe", "Karilraffe"],
  ["elefant", "zebra", "flamingo", "Elebrago"],
  ["jaguar", "elefant", "krokodil", "Jaledil"]
];
HY.forEach((h, i) => {
  const x = 16 + i * (W + 16);
  const y = 260;
  out += `<rect x="${x - 6}" y="${y - 12}" width="${W + 12}" height="${W * 1.5 + 34}" rx="18" fill="#fff" stroke="#22314A" stroke-width="3"/>`;
  out += whole([h[0], h[1], h[2]], x, y, W);
  out += `<text x="${x + W / 2}" y="${y + W * 1.5 + 18}" font-family="sans-serif" font-size="15" font-weight="800" text-anchor="middle" fill="#22314A">${h[3]}</text>`;
});

/* seam check: every band of every animal overlaid, so a mismatched neck or
   hip width shows up as a fringe rather than having to be spotted by eye */
const y3 = 520;
out += `<text x="20" y="${y3 - 8}" font-family="sans-serif" font-size="14" font-weight="700" fill="#22314A">seam check — all 8 overlaid per band</text>`;
[0, 1, 2].forEach((b) => {
  const x = 16 + b * (W + 40);
  out += `<rect x="${x - 6}" y="${y3}" width="${W + 12}" height="${W / 2 + 12}" rx="14" fill="#fff" stroke="#22314A" stroke-width="2"/>`;
  ORDER.forEach((k) => {
    out += `<g opacity="0.3">${band(k, b, x, y3 + 6, W)}</g>`;
  });
  out += `<line x1="${x + 47}" y1="${y3 + 4}" x2="${x + 47}" y2="${y3 + W / 2 + 8}" stroke="#FF6B6B" stroke-width="1"/>`;
  out += `<line x1="${x + 73}" y1="${y3 + 4}" x2="${x + 73}" y2="${y3 + W / 2 + 8}" stroke="#FF6B6B" stroke-width="1"/>`;
  out += `<line x1="${x + 33}" y1="${y3 + 4}" x2="${x + 33}" y2="${y3 + W / 2 + 8}" stroke="#3E8EF7" stroke-width="1"/>`;
  out += `<line x1="${x + 87}" y1="${y3 + 4}" x2="${x + 87}" y2="${y3 + W / 2 + 8}" stroke="#3E8EF7" stroke-width="1"/>`;
});

/* tile-size legibility: what a strip looks like as an answer tile */
const y4 = 640;
out += `<text x="20" y="${y4 - 8}" font-family="sans-serif" font-size="14" font-weight="700" fill="#22314A">answer-tile size (74px strip)</text>`;
ORDER.forEach((k, i) => {
  const x = 16 + i * 100;
  [0, 1, 2].forEach((b) => {
    out += `<rect x="${x}" y="${y4 + b * 45}" width="80" height="40" rx="10" fill="#fff" stroke="#22314A" stroke-width="2"/>`;
    out += band(k, b, x + 4, y4 + b * 45 + 1, 72);
  });
});

out += `</svg>`;
writeFileSync("./sheet.svg", out);
console.log("wrote sheet.svg");

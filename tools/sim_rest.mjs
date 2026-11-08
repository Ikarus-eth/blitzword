// Simulates days of the core reading loop against buildQueue extracted from a
// given App.jsx, with answer() scheduling replicated here. See DESIGN "Enough
// for today". Learner: per-word accuracy drawn from P0..P0+PW, +GAIN per answer.
//   node tools/sim_rest.mjs src/App.jsx rest2acc        # the shipped rule
//   node tools/sim_rest.mjs <old App.jsx> none          # before (git show 16da4e0:src/App.jsx)
//   rest2 = rest after two right with no accuracy floor (the rejected arm)
//   env: P0 (0.45) PW (0.45) GAIN (0.01). ~1 min per 100 runs.
import { readFileSync } from "fs";
const [, , src, rule = "none", DAYS = "14", RUNS = "200", LANG = "de"] = process.argv;
const app = readFileSync(src, "utf8").split("\n");
const lines = (a, b) => app.slice(a - 1, b).join("\n");
const find = (re, from = 0) => app.findIndex((l, i) => i >= from && re.test(l)) + 1;
const listsEnd = find(/^const LISTS = /);
const helpersA = find(/^const pad = /), helpersB = find(/^const clone = /);
const histA = find(/^const HIST_N = /), histB = find(/^function levelAcc/) + 8;
const starA = find(/^function starLevel/), turboA = find(/^function buildTurboQueue/);
const extra = app.filter((l) => /^const (OPEN_CAP|IVL|isHot|REST_AFTER|restsToday)\b/.test(l)).join("\n");
const code = [lines(9, listsEnd), extra, lines(helpersA, helpersB), lines(histA, histB), lines(starA, turboA - 1),
  "return { LISTS, buildQueue, reachLevel, IVL, recentAcc, pushHist, MASTER_ACC };"].join("\n");

let NOW = 0;   // simulated day offset
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else { super(2026, 10, 9, 12); this.setDate(this.getDate() + NOW); } }
}
const M = new Function("Date", code)(FakeDate);
const list = M.LISTS[LANG];
const tISO = () => { const d = new FakeDate(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const plus = (n) => { const d = new FakeDate(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

const ANS_PER_DAY = 150;
function run() {
  const L = { words: {} };
  const p = {};                       // hidden true accuracy per word
  const P0 = +(process.env.P0 || 0.45), PW = +(process.env.PW || 0.45), GAIN = +(process.env.GAIN || 0.01);
  const pOf = (w) => (p[w] ??= P0 + Math.random() * PW);
  const stats = [];
  for (let day = 0; day < +DAYS; day++) {
    NOW = day;
    const today = tISO();
    const seen = {}; let right = 0, n = 0, newIntro = 0, easyReps = 0;
    let q = M.buildQueue(L, list), i = 0;
    while (n < ANS_PER_DAY) {
      if (i >= q.length) { q = M.buildQueue(L, list); i = 0; if (!q.length) break; }
      const e = q[i]; const t = e[0];
      const ws = L.words[t] || (L.words[t] = { s: 0, cc: 0, d: [], iv: 0, due: null, r: 0, wr: 0, tn: [0, 0, 0], everMastered: false });
      if (ws.rest === today && !q.resting) { i++; continue; }   // stale copy in a built queue
      if (ws.r + ws.wr === 0) newIntro++;
      const open = ws.s < 2;
      const easy = open && ws.tdd === today && ws.td >= 2 && M.recentAcc(ws) >= M.MASTER_ACC;
      if (easy) easyReps++;
      const ok = Math.random() < pOf(t);
      n++; if (ok) right++;
      if (open) seen[t] = (seen[t] || 0) + 1;
      M.pushHist(ws, ok);
      if (ok) {
        ws.r++;
        if (ws.s === 2) { ws.iv = Math.min(ws.iv + 1, M.IVL.length - 1); ws.due = plus(M.IVL[ws.iv]); }
        else {
          ws.s = 1; ws.cc++;
          if (!ws.d.includes(today)) { ws.d.push(today); if (ws.d.length > 5) ws.d = ws.d.slice(-5); }
          { ws.td = ws.tdd === today ? (ws.td || 0) + 1 : 1; ws.tdd = today; }
          if (ws.cc >= 3 && ws.d.length >= 2 && M.recentAcc(ws) >= M.MASTER_ACC) { ws.s = 2; ws.iv = 0; ws.due = plus(M.IVL[0]); ws.everMastered = true; }
          else if (rule === "rest2" && ws.td >= 2) ws.rest = today;
          else if (rule === "rest2acc" && ws.td >= 2 && M.recentAcc(ws) >= M.MASTER_ACC) ws.rest = today;
        }
        p[t] = Math.min(0.97, pOf(t) + GAIN);
      } else {
        ws.wr++; ws.cc = 0; { ws.td = 0; ws.tdd = today; }
        if (ws.s === 2) { ws.s = 1; ws.iv = 0; }
        ws.due = plus(1);
        q.splice(Math.min(q.length, i + 3 + Math.floor(Math.random() * 4)), 0, e);
        p[t] = Math.min(0.97, pOf(t) + GAIN);
      }
      i++;
    }
    const exps = Object.values(seen);
    const fin = Object.values(L.words).filter((w) => w.s === 2).length;
    const unfinished = Object.values(L.words).filter((w) => w.s < 2 && w.r + w.wr > 0).length;
    stats.push({ acc: right / Math.max(n, 1), n, distinctOpen: exps.length, meanExp: exps.reduce((a, b) => a + b, 0) / Math.max(exps.length, 1),
      maxExp: Math.max(0, ...exps), newIntro, fin, unfinished, easyReps });
  }
  return stats;
}
const all = [...Array(+RUNS)].map(run);
const avg = (f, d0, d1) => { let s = 0, k = 0; all.forEach((r) => r.slice(d0, d1).forEach((x) => { s += f(x); k++; })); return s / k; };
const fmt = (x, d = 1) => x.toFixed(d);
console.log(`rule=${rule} lang=${LANG} runs=${RUNS} days=${DAYS} answers/day=${ANS_PER_DAY}`);
console.log(`exposures per unfinished word per day: mean ${fmt(avg((x) => x.meanExp, 0, +DAYS))}, max ${fmt(avg((x) => x.maxExp, 0, +DAYS))}`);
console.log(`distinct unfinished words/day ${fmt(avg((x) => x.distinctOpen, 0, +DAYS))}, new words/day ${fmt(avg((x) => x.newIntro, 0, +DAYS))}`);
console.log(`answers spent on unfinished words already right twice today: ${fmt(avg((x) => x.easyReps, 0, +DAYS))}/day`);
console.log(`accuracy ${fmt(100 * avg((x) => x.acc, 0, +DAYS))}%, answers/day ${fmt(avg((x) => x.n, 0, +DAYS), 0)}`);
console.log(`finished after 7d ${fmt(avg((x) => x.fin, 6, 7))}, after ${DAYS}d ${fmt(avg((x) => x.fin, +DAYS - 1, +DAYS))}; unfinished carried at end ${fmt(avg((x) => x.unfinished, +DAYS - 1, +DAYS))}`);

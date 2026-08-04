import React, { useState, useEffect, useRef } from "react";

/* ================================================================
   BlitzWort v2 — sight-reading speed trainer (DE/EN), iPad-first
   Chunked sessions · provisional mastery · speed-tiered mastery
   ================================================================ */

/* ---------------- content: [target, d1, d2, d3] ----------------- */
const DE = [
  [ // Stufe 1
    ["der","den","dem","des"],["die","dir","sie","nie"],["das","dass","des","was"],
    ["und","uns","rund","wund"],["ist","isst","ins","bist"],["ich","mich","dich","ach"],
    ["du","da","zu","tu"],["er","es","wer","ihr"],["sie","nie","wie","sich"],
    ["es","er","so","uns"],["wir","mir","wie","wird"],["ein","nein","mein","dein"],
    ["eine","keine","meine","einer"],["nicht","nichts","dicht","nickt"],["ja","je","na","ha"],
    ["nein","mein","dein","kein"],["in","im","ihn","an"],["an","am","ab","in"],
    ["auf","aus","auch","rauf"],["mit","mir","mich","mal"]
  ],
  [ // Stufe 2
    ["zu","zum","zur","du"],["von","vom","vor","nun"],["für","fürs","führ","vier"],
    ["aber","über","oder","außer"],["oder","oben","ohne","jeder"],["auch","ach","auf","euch"],
    ["dann","denn","wann","kann"],["wenn","wann","denn","wen"],["was","war","das","wer"],
    ["wer","wen","wir","weg"],["wie","nie","wir","sie"],["wo","so","was","wir"],
    ["da","du","das","ja"],["hier","vier","her","ihr"],["so","wo","sie","es"],
    ["man","mal","kann","mag"],["mein","dein","nein","kein"],["dein","mein","sein","kein"],
    ["sein","sei","kein","seit"],["ihr","ihm","ihn","wir"]
  ],
  [ // Stufe 3
    ["hat","hast","halt","hart"],["war","was","wahr","warm"],["sind","seid","sing","blind"],
    ["bin","bis","hin","ihn"],["bist","bis","ist","hast"],["wird","wir","wild","wirst"],
    ["kann","dann","wann","kam"],["muss","musst","nass","dass"],["will","wild","weil","voll"],
    ["soll","voll","toll","sonst"],["mag","mal","sag","lag"],["darf","dort","dann","scharf"],
    ["habe","habt","hatte","gebe"],["hatte","hätte","halte","hatten"],["gibt","gib","gilt","gab"],
    ["geht","gehst","steht","dreht"],["kommt","komm","kommst","nimmt"],["macht","mach","machst","lacht"],
    ["sagt","sag","sagst","jagt"],["sieht","sieh","zieht","siegt"]
  ],
  [ // Stufe 4
    ["Haus","Maus","Hals","Halt"],["Maus","Haus","Mais","Maul"],["Hund","Hand","Mund","Bund"],
    ["Katze","Tatze","Kater","Kante"],["Ball","Fall","Wall","Knall"],["Baum","Raum","Bauch","Zaun"],
    ["Auto","Auge","Autos","Acht"],["Kind","Wind","Kinn","Kino"],["Mann","Wand","Kamm","Mond"],
    ["Frau","Grau","Blau","Bau"],["Mama","Papa","Oma","Mami"],["Papa","Mama","Opa","Papi"],
    ["Oma","Opa","Omi","Ohr"],["Opa","Oma","Opi","Obst"],["Schule","Schale","Schuhe","Spule"],
    ["Buch","Bach","Buche","Bauch"],["Tag","Tal","Takt","Teig"],["Nacht","Macht","Nachts","Acht"],
    ["Sonne","Tonne","Wonne","Sahne"],["Mond","Mund","Mode","Monat"]
  ],
  [ // Stufe 5
    ["gut","tut","gilt","gab"],["groß","bloß","grob","grüß"],["klein","kein","keins","klar"],
    ["alt","als","all","kalt"],["neu","nun","treu","neun"],["schön","schon","scheu","schien"],
    ["schnell","schnellt","schrill","schmal"],["langsam","seltsam","sparsam","lange"],
    ["laut","lauf","haut","blau"],["leise","reise","weise","leide"],["rot","tot","roh","fort"],
    ["blau","grau","bald","blas"],["grün","grau","kühn","grünt"],["gelb","gelbe","halb","gern"],
    ["weiß","weit","heiß","weiße"],["schwarz","schwer","schwang","schwarze"],["hell","heil","hellt","voll"],
    ["dunkel","dunkle","dunkeln","denken"],["kalt","kahl","halt","kaut"],["warm","wahr","warum","arm"]
  ],
  [ // Stufe 6
    ["gehen","sehen","geben","gegen"],["kommen","können","kämmen","krummen"],["laufen","kaufen","taufen","lauten"],
    ["springen","bringen","klingen","sprangen"],["spielen","spülen","zielen","fielen"],["lesen","legen","leben","lösen"],
    ["malen","mahlen","zahlen","malten"],["singen","sinken","ringen","sangen"],["essen","messen","wissen","lassen"],
    ["trinken","trocken","tranken","blinken"],["schlafen","schlagen","schaffen","schliefen"],["sehen","gehen","sahen","stehen"],
    ["hören","hörten","holen","führen"],["sprechen","sprachen","brechen","stechen"],["fragen","tragen","fangen","fragten"],
    ["sagen","jagen","tagen","lagen"],["machen","wachen","kochen","machten"],["lachen","machen","wachen","krachen"],
    ["weinen","meinen","weiten","wohnen"],["helfen","halfen","heften","hoffen"]
  ],
  [ // Stufe 7
    ["heute","heule","haute","laute"],["morgen","sorgen","morgens","borgen"],["gestern","gestehen","gestört","gesamt"],
    ["jetzt","setzt","letzte","putzt"],["bald","halb","kalt","bunt"],["immer","nimmer","innen","irren"],
    ["nie","wie","sie","die"],["oft","fort","ob","elf"],["wieder","weiter","wider","nieder"],
    ["schon","schön","schien","schob"],["noch","nach","doch","hoch"],["sehr","mehr","sehe","seht"],
    ["mehr","sehr","mir","her"],["viel","fiel","vier","voll"],["wenig","wenige","winzig","ewig"],
    ["alle","allen","alte","falle"],["alles","alle","allen","altes"],["nichts","nicht","nachts","rechts"],
    ["etwas","etwa","sowas","eines"],["nur","nun","zur","pur"]
  ],
  [ // Stufe 8
    ["Wasser","Messer","Fässer","Wetter"],["Feuer","Feier","Feder","Mauer"],["Luft","Lust","Duft","Lift"],
    ["Erde","Ende","Ente","Erbe"],["Blume","Bluse","Blüte","Blase"],["Gras","Glas","Grad","Gruß"],
    ["Wald","Wand","Wall","Wild"],["Berg","Burg","Zwerg","Werk"],["See","Fee","Tee","Reh"],
    ["Meer","Mehl","Heer","Meter"],["Regen","Wagen","Regal","Regeln"],["Schnee","Schere","Schnur","Scheu"],
    ["Wind","Wand","Wild","Kind"],["Wolke","Wolle","Woche","Falke"],["Stern","Stirn","Sturm","Kern"],
    ["Himmel","Hummel","Zimmer","Hammer"],["Garten","Karten","Warten","Arten"],["Straße","Strafe","Größe","Stärke"],
    ["Stadt","Staat","Stall","Start"],["Dorf","Torf","Korb","Wurf"]
  ],
  [ // Stufe 9
    ["Hand","Hund","Wand","Sand"],["Fuß","Gruß","Fluss","Fass"],["Kopf","Topf","Knopf","Korb"],
    ["Auge","Augen","Auto","Lauge"],["Ohr","Uhr","Chor","Rohr"],["Nase","Hase","Vase","Nässe"],
    ["Mund","Mond","Hund","Bund"],["Haar","Paar","Jahr","Haare"],["Arm","Darm","Art","Arme"],
    ["Bein","Wein","Beil","Beine"],["Herz","Harz","Herd","Kerze"],["Bauch","Buch","Bach","Rauch"],
    ["Zahn","Bahn","Hahn","Zaun"],["Finger","Fenster","Finder","Ringe"],["Tier","Tür","Teer","Tiere"],
    ["Vogel","Vögel","Kegel","Nagel"],["Fisch","Tisch","Frosch","Fleisch"],["Pferd","Pfeil","Herd","Pfand"],
    ["Schaf","Schal","Schlaf","Schau"],["Kuh","Kur","Schuh","Uhu"]
  ],
  [ // Stufe 10
    ["Brot","Boot","Brett","Bart"],["Milch","Molch","Milbe","Blick"],["Apfel","Ampel","Gipfel","Affe"],
    ["Ei","Eis","Eier","Esel"],["Käse","Kasse","Katze","Käfer"],["Kuchen","Küche","Kochen","Kissen"],
    ["Eis","Ei","Reis","Eisen"],["Saft","Kraft","Salz","Saat"],["Tisch","Fisch","Tasche","Tuch"],
    ["Stuhl","Stall","Strahl","Stufe"],["Bett","Brett","Fett","Beet"],["Tür","Tier","Turm","Türe"],
    ["Fenster","Finger","Muster","Feder"],["Lampe","Rampe","Lippe","Lupe"],["Uhr","Ohr","Uhu","Ufer"],
    ["Bild","Wild","Feld","Geld"],["Schuh","Kuh","Schau","Schaum"],["Hose","Dose","Rose","Hase"],
    ["Jacke","Backe","Hacke","Zacke"],["Mütze","Münze","Mühle","Pfütze"]
  ]
];

const EN = [
  [ // Level 1
    ["the","then","them","he"],["a","at","an","as"],["and","an","end","ant"],["I","it","in","if"],
    ["to","too","two","do"],["in","is","it","on"],["is","it","as","his"],["it","is","if","at"],
    ["you","your","yes","out"],["he","be","we","her"],["she","he","see","the"],["we","he","me","be"],
    ["of","off","on","or"],["on","no","one","an"],["at","it","as","an"],["my","by","may","me"],
    ["me","my","we","be"],["go","no","do","got"],["no","on","not","now"],["so","no","do","to"]
  ],
  [ // Level 2
    ["was","saw","wash","has"],["are","our","ear","arm"],["said","says","sad","sail"],["his","has","him","is"],
    ["her","here","him","hen"],["they","them","then","the"],["that","than","what","chat"],["this","his","thin","these"],
    ["with","wish","will","wit"],["for","from","four","or"],["but","bat","put","bus"],["not","net","nut","note"],
    ["all","tall","fall","ill"],["can","cat","car","cap"],["had","has","hid","bad"],["have","gave","hive","hare"],
    ["one","on","once","none"],["two","too","to","tow"],["up","us","cup","put"],["down","dawn","town","done"]
  ],
  [ // Level 3
    ["see","sea","she","seen"],["look","book","took","lock"],["like","line","lake","bike"],["come","came","some","home"],
    ["came","come","cave","name"],["get","got","let","wet"],["got","get","hot","dot"],["make","made","take","mane"],
    ["made","make","mad","maid"],["play","pray","plan","clay"],["run","ran","fun","sun"],["jump","bump","junk","lump"],
    ["help","held","heap","yelp"],["find","fine","mind","fond"],["ride","rode","rid","hide"],["want","went","wait","wand"],
    ["went","want","wet","tent"],["will","well","wall","with"],["did","dad","dig","hid"],["do","to","go","dot"]
  ],
  [ // Level 4
    ["what","when","that","want"],["when","what","then","where"],["where","were","there","here"],["who","how","why","whom"],
    ["why","who","way","sky"],["how","who","now","hot"],["then","than","them","ten"],["than","then","that","tan"],
    ["them","then","they","team"],["there","three","where","these"],["here","hare","her","hear"],["out","our","oat","cut"],
    ["our","out","or","hour"],["your","you","yours","four"],["some","same","come","home"],["from","form","farm","frog"],
    ["into","onto","info","unto"],["over","oven","ever","offer"],["under","uncle","until","wonder"],["again","begin","aging","grain"]
  ],
  [ // Level 5
    ["big","bag","bug","dig"],["little","litter","kettle","middle"],["good","food","gold","wood"],["new","now","few","knew"],
    ["old","odd","cold","oil"],["fast","fist","last","fact"],["slow","snow","show","slot"],["red","bed","rod","rid"],
    ["blue","blow","glue","blur"],["green","grown","greet","queen"],["yellow","mellow","yell","fellow"],["black","block","back","blank"],
    ["white","while","write","wide"],["hot","hat","hit","not"],["cold","bold","cord","gold"],["day","bay","way","dry"],
    ["night","light","right","might"],["sun","son","run","sum"],["moon","moan","noon","mood"],["star","stir","stay","scar"]
  ],
  [ // Level 6
    ["cat","car","cap","cut"],["dog","dot","dig","log"],["house","horse","mouse","hose"],["mouse","house","moose","mouth"],
    ["ball","bell","bald","tall"],["tree","three","free","tray"],["car","can","cart","far"],["boy","box","buy","toy"],
    ["girl","curl","gift","grill"],["man","men","mad","map"],["mom","mop","mum","mad"],["dad","bad","dab","did"],
    ["book","look","boot","cook"],["school","stool","scoop","cool"],["bed","bad","bud","red"],["door","floor","dear","doom"],
    ["hand","band","land","hang"],["head","heat","bead","herd"],["eye","dye","eve","ear"],["ear","eat","era","car"]
  ],
  [ // Level 7
    ["eat","ate","tea","east"],["drink","drank","brink","trick"],["sleep","sheep","steep","sweep"],["read","real","road","ready"],
    ["write","white","wrote","wrist"],["sing","sink","king","sting"],["walk","talk","wall","wake"],["talk","walk","tall","tale"],
    ["stop","step","shop","spot"],["open","oven","upon","often"],["close","chose","cloth","cross"],["give","gave","live","dive"],
    ["take","tale","make","tape"],["put","pot","pit","but"],["ask","ash","act","art"],["tell","tall","bell","till"],
    ["know","knew","now","snow"],["think","thing","thank","drink"],["say","saw","way","day"],["saw","was","say","sew"]
  ],
  [ // Level 8
    ["water","later","wafer","waiter"],["fire","five","wire","hire"],["rain","ran","main","rein"],["snow","slow","show","know"],
    ["wind","wing","mind","wand"],["cloud","clown","could","cold"],["sky","shy","spy","sly"],["grass","glass","grasp","brass"],
    ["flower","flour","follow","slower"],["bird","bind","third","bard"],["fish","fist","wish","dish"],["horse","house","hose","worse"],
    ["sheep","sleep","sheet","ship"],["cow","how","now","crow"],["pig","pit","big","pin"],["duck","luck","dock","dusk"],
    ["frog","from","fog","flag"],["bear","beat","bean","pear"],["lion","line","loin","iron"],["wolf","wool","golf","elf"]
  ],
  [ // Level 9
    ["after","alter","offer","water"],["before","because","become","beside"],["about","above","aloud","again"],["because","became","becomes","before"],
    ["around","ground","round","across"],["away","aware","awake","sway"],["every","very","ever","berry"],["never","newer","fever","nerve"],
    ["always","almost","anyway","allows"],["only","once","oily","lonely"],["very","vary","every","ferry"],["much","must","such","mush"],
    ["many","any","mane","money"],["more","most","mare","mode"],["most","more","mist","mast"],["both","bath","boat","booth"],
    ["each","eats","echo","beach"],["other","otter","older","either"],["first","fist","frost","thirst"],["last","list","lost","fast"]
  ],
  [ // Level 10
    ["bread","break","beard","broad"],["milk","mild","silk","mile"],["apple","ample","apples","angle"],["egg","leg","edge","ego"],
    ["cake","lake","care","cage"],["ice","ace","nice","rice"],["juice","juicy","voice","twice"],["table","cable","tablet","title"],
    ["chair","chain","cheer","hair"],["window","winter","widow","wonder"],["lamp","camp","limp","lump"],["clock","block","click","cloak"],
    ["shoe","show","shore","shot"],["hat","hot","hut","ham"],["coat","goat","coast","cot"],["ship","shop","chip","shin"],
    ["train","brain","trail","rain"],["plane","place","plan","plate"],["road","read","toad","load"],["town","down","torn","tone"]
  ]
];

const LISTS = { de: DE, en: EN };
const DUR = [7500, 5000, 3500, 2500, 1500, 850, 700, 500, 350, 250];
const SPEED_ICONS = ["🐢","🚶","🚲","🛴","🏃","🐎","🚗","🏎️","✈️","🚀"];
const IVL = [3, 7, 14, 30];
const TIER = ["🐢", "🏃", "🚀"];
const CHUNK_SEC = 150;   // active seconds per chunk (~2.5 min)
const CHUNK_Q = 50;      // hard cap on questions per chunk
const STR = {
  de: { newLvl: "Neue Stufe!", cont: "Weiter", lvl: "Stufe", newWords: "Neue Wörter!", today: "heute", ach: "Abzeichen!", achDone: "Geschafft am", achLocked: "Noch nicht geschafft" },
  en: { newLvl: "New level!", cont: "Go on", lvl: "Level", newWords: "New words!", today: "today", ach: "Achievement!", achDone: "Achieved on", achLocked: "Not yet achieved" }
};
const PHRASES = {
  de: ["Super!", "Stark!", "Toll gemacht!", "Weiter so!", "Klasse!", "Wow!", "Spitze!", "Du bist schnell!"],
  en: ["Great job!", "Awesome!", "Well done!", "Keep going!", "Super!", "Wow!", "Amazing!", "So fast!"]
};
const CHEER = ["🎉","🌟","💪","🚀","🦄","👏","🐬","🦊"];
const C = {
  bg: "#EDF5FC", ink: "#22314A", card: "#FFFFFF", green: "#2FBF71",
  red: "#FF6B6B", gold: "#F6A500", blue: "#3E8EF7", mask: "#B9C6D4"
};

/* ---------------------------- helpers --------------------------- */
const pad = (n) => String(n).padStart(2, "0");
const tISO = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return tISO(d); };
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const freshLang = () => ({ v: 2, words: {}, coins: 0, days: {} });
const migrate = (L) => {
  if (!L) return freshLang();
  L.v = 2;
  if (!L.words) L.words = {};
  Object.keys(L.words).forEach((k) => {
    const w = L.words[k];
    if (!w.tn) w.tn = [0, 0, 0];
    if (w.everMastered === undefined) w.everMastered = w.s === 2;
    /* Seed the rolling window from lifetime counts. Without this an existing
       save starts with an empty history, every word looks like 100%, and the
       words that motivated the accuracy floor would sail through the gate once
       more before enough evidence accumulated to stop them. Order within the
       seed is arbitrary and never read — only the ratio matters. */
    if (!w.h) {
      const att = (w.r || 0) + (w.wr || 0);
      if (att >= 3) {
        const ones = Math.round((w.r / att) * HIST_N);
        w.h = [...Array(HIST_N)].map((_, i) => (i < ones ? 1 : 0));
      } else w.h = [];
    }
  });
  if (!L.days) L.days = {};
  if (typeof L.coins !== "number") L.coins = 0;
  return L;
};

const tierOf = (d) => (d <= 500 ? 2 : d <= 1500 ? 1 : 0);
const tiOf = (tn) => (tn[2] >= 2 ? 2 : tn[1] >= 2 ? 1 : tn[0] >= 2 ? 0 : -1);
const isHot = (ws) => ws && ws.s === 1 && ws.cc >= 3;   // mastered pending 2nd day

/* ---- rolling per-word accuracy: `ws.h`, last HIST_N answers as 1/0 ----------
   Why this exists. The Flüssig gate was "3 correct in a row on 2 different
   days", justified by a random guesser clearing 3-in-a-row only ~1.6% of the
   time. That maths is right for a guesser and wrong for a partial learner: a
   child who reads a word correctly 40% of the time clears the same bar ~6% of
   the time per window, and with re-queuing he gets dozens of windows across two
   days. Real exports showed 20 of 70 Flüssig words sitting below 70% lifetime
   accuracy, one of them at 39%. Those words then took spaced-review intervals
   and stopped coming back.
   Flüssig is defined in DESIGN.md as "accuracy achieved". The floor below makes
   that claim true rather than changing what the level means. Streak still gates
   *when* the check happens; accuracy gates whether it passes.                  */
const HIST_N = 10;
const MASTER_ACC = 0.8;    // recent accuracy needed to enter Flüssig
const REACH_ACC = 0.7;     // recent accuracy needed to unlock the next level
const REACH_MIN_N = 15;    // ...but only once a level has this many answers logged
const recentAcc = (ws) => {
  const h = ws && ws.h;
  if (!h || !h.length) return 1;   // no history yet — streak alone decides, as before
  let s = 0; for (const x of h) s += x;
  return s / h.length;
};
const pushHist = (ws, ok) => {
  ws.h = [...(ws.h || []), ok ? 1 : 0].slice(-HIST_N);
};
/* accuracy across a whole level, pooled over the per-word windows */
function levelAcc(L, lvl) {
  let n = 0, hit = 0;
  lvl.forEach((e) => {
    const ws = L.words[e[0]];
    if (ws && ws.h && ws.h.length) { n += ws.h.length; for (const x of ws.h) hit += x; }
  });
  return n >= REACH_MIN_N ? hit / n : null;   // null = too little evidence to block on
}

/* Graduated mastery, not a single flag — based on Precision Teaching's
   accuracy+fluency distinction and the RESA framework (Retention,
   Endurance, Stability, Application; Binder 1996), plus the finding
   that expanding-interval review — short gap first, then wider —
   outperforms equal spacing for young children specifically (Vlach
   et al. 2014). Levels:
     0 Neu        — never answered
     1 Gelernt    — at least one correct, still building the streak
    -1 Wiederholen— was fluent+ before, a miss knocked it back down
     2 Flüssig    — accuracy gate cleared (3 correct, 2 different
                    days) — this is PT's "fluency," not yet tested by
                    a real time gap. What the app used to call
                    "mastered" — it wasn't wrong, just one stage early.
     3 Behalten   — survived its first spaced review (RESA "retention":
                    correct again after days with no practice)
     4 Gemeistert — survived every expanding interval up to the
                    longest one (RESA "endurance" + "stability") —
                    genuine long-term recall, not recent practice */
const LVL_NAMES = {
  de: { "0": "Neu", "-1": "Wiederholen", "1": "Gelernt", "2": "Flüssig", "3": "Behalten", "4": "Gemeistert" },
  en: { "0": "New", "-1": "Relearning", "1": "Learning", "2": "Fluent", "3": "Retained", "4": "Mastered" }
};
const LVL_COLORS = {
  "0": ["#EEF3F8", "#C9D6E2", "#8CA0B5"],
  "-1": ["#FFDFC2", "#E2821E", "#7A3F08"],
  "1": ["#FFF1BF", "#E4B93F", "#7A6210"],
  "2": ["#CFF0DC", "#2FBF71", "#14653C"],
  "3": ["#B9E4DC", "#159C86", "#0B4A40"],
  "4": ["#DCCCFF", "#7C4FE0", "#3A1E80"]
};
function wordLevel(ws) {
  if (!ws || ws.r + ws.wr === 0) return 0;
  if (ws.s !== 2) return ws.everMastered ? -1 : (ws.cc > 0 ? 1 : 0);
  if (ws.iv >= IVL.length - 1) return 4;
  if (ws.iv >= 1) return 3;
  return 2;
}

/* ------------------------- pseudo-word foils ---------------------- */
/* every real word (target or curated distractor) across a language's
   curriculum — used so a generated foil never accidentally collides
   with a word the child is actually meant to learn */
function buildRealSet(list) {
  const s = new Set();
  list.forEach((lvl) => lvl.forEach((e) => e.forEach((w) => s.add(w.toLowerCase()))));
  return s;
}
const REAL = { de: buildRealSet(DE), en: buildRealSet(EN) };
const VOWELS = { de: "aeiouäöü", en: "aeiouy" };
const CONS = "bcdfghjklmnpqrstvwxyz";
/* single-letter substitution map: visually/phonetically confusable
   letters, so a generated foil differs from the target by exactly
   one confusable letter rather than a random one */
const SUB = {
  de: { a: "eoä", e: "aiä", i: "eü", o: "uö", u: "oü", ä: "ae", ö: "o", ü: "ui",
        b: "dp", d: "bt", p: "qb", q: "p", m: "n", n: "m", f: "vw", v: "fw", w: "v",
        s: "z", z: "s", t: "d", g: "k", k: "g", c: "k", ß: "s" },
  en: { a: "eo", e: "ai", i: "ey", o: "ua", u: "o", y: "iu",
        b: "dp", d: "bt", p: "qb", q: "p", m: "n", n: "m", f: "vw", v: "fw", w: "v",
        s: "zc", c: "sk", t: "d", g: "kj", k: "gc", j: "g" }
};
/* one confusable single-letter substitution away from `target`, never
   a word that already exists in the curriculum or in `avoid`; letters
   with a curated confusion pair are tried before the generic pool so
   results stay maximally close to real confusions */
function fakeWord(target, lang, avoid) {
  const idx = [...Array(target.length).keys()];
  const mapped = idx.filter((i) => SUB[lang][target[i].toLowerCase()]);
  const unmapped = idx.filter((i) => !SUB[lang][target[i].toLowerCase()]);
  const positions = [...shuffle(mapped), ...shuffle(unmapped)];
  for (const pos of positions) {
    const ch = target[pos], lc = ch.toLowerCase();
    const isUpper = ch !== lc;
    let opts = SUB[lang][lc];
    if (!opts) {
      const pool = VOWELS[lang].includes(lc) ? VOWELS[lang] : CONS;
      opts = [...pool].filter((c) => c !== lc).join("");
    }
    for (const rc of shuffle([...opts])) {
      const repl = isUpper ? rc.toUpperCase() : rc;
      const candidate = target.slice(0, pos) + repl + target.slice(pos + 1);
      const key = candidate.toLowerCase();
      if (candidate !== target && !REAL[lang].has(key) && !avoid.has(key)) return candidate;
    }
  }
  return null;   // no safe non-word found (very rare) — caller falls back to a real distractor
}
/* composes the 4 answer tiles: target + a random mix of curated real
   distractors and generated non-word foils, 1–2 foils per question so
   real words average 2–3 and foils never exceed 2 */
function composeTiles(entry, lang) {
  const [target, ...reals] = entry;
  const fakeCount = Math.random() < 0.5 ? 1 : 2;
  const realsShuf = shuffle(reals);
  const chosenReal = realsShuf.slice(0, 3 - fakeCount);
  const spare = realsShuf.slice(3 - fakeCount);
  const avoid = new Set([target.toLowerCase(), ...chosenReal.map((w) => w.toLowerCase())]);
  const fakes = [];
  for (let i = 0; i < fakeCount; i++) {
    const fw = fakeWord(target, lang, avoid);
    if (fw) { fakes.push(fw); avoid.add(fw.toLowerCase()); }
    else if (spare.length) { const r = spare.shift(); fakes.push(r); avoid.add(r.toLowerCase()); }
  }
  return shuffle([target, ...chosenReal, ...fakes]);
}

/* star level: celebration gate — ≥90% fully mastered */
function starLevel(L, list) {
  let u = 1;
  for (let i = 0; i < list.length - 1; i++) {
    const m = list[i].filter((e) => L.words[e[0]] && L.words[e[0]].s === 2).length;
    if (m >= Math.ceil(list[i].length * 0.9)) u = i + 2; else break;
  }
  return u;
}
/* reach level: practice-pool gate — ≥70% mastered OR hot (achievable day 1),
   AND the level is actually being read correctly.
   The count condition alone let three levels open in four days while accuracy
   fell from 75% to 59%: words qualify as "hot" on a streak, the pool grows, and
   the earlier level never consolidates. The accuracy condition only engages
   after REACH_MIN_N answers exist in that level, so it cannot reproduce the old
   failure where day 1 was mathematically incapable of unlocking anything. */
function reachLevel(L, list) {
  let u = 1;
  for (let i = 0; i < list.length - 1; i++) {
    const m = list[i].filter((e) => {
      const ws = L.words[e[0]];
      return ws && (ws.s === 2 || isHot(ws));
    }).length;
    if (m < Math.ceil(list[i].length * 0.7)) break;
    const a = levelAcc(L, list[i]);
    if (a !== null && a < REACH_ACC) break;
    u = i + 2;
  }
  return u;
}
/* why the pool stopped growing — for the parent dashboard only */
function reachBlock(L, list) {
  const i = reachLevel(L, list) - 1;
  if (i >= list.length - 1) return null;
  const m = list[i].filter((e) => {
    const ws = L.words[e[0]];
    return ws && (ws.s === 2 || isHot(ws));
  }).length;
  if (m < Math.ceil(list[i].length * 0.7)) return null;   // held by count, the original rule
  const a = levelAcc(L, list[i]);
  return a !== null && a < REACH_ACC ? { lvl: i + 1, acc: a } : null;
}

function buildQueue(L, list) {
  const today = tISO();
  const reach = reachLevel(L, list);
  const due = [], pool = [];
  list.forEach((lvl, li) => lvl.forEach((entry) => {
    const ws = L.words[entry[0]];
    if (ws && ws.due && ws.due <= today) due.push(entry);
    else if (li < reach && (!ws || ws.s < 2)) pool.push(entry);
  }));
  due.sort((a, b) => (L.words[a[0]].due < L.words[b[0]].due ? -1 : 1));
  /* weighted random order: weakest words more likely early, but never deterministic */
  const wt = (e) => { const ws = L.words[e[0]]; return ws ? (ws.wr + 1) / (ws.cc + 1) : 1.3; };
  const bag = pool.map((e) => ({ e, w: wt(e) }));
  const ordered = [];
  while (bag.length) {
    let total = 0; for (const x of bag) total += x.w;
    let r = Math.random() * total, k = 0;
    while (k < bag.length - 1 && (r -= bag[k].w) > 0) k++;
    ordered.push(bag[k].e); bag.splice(k, 1);
  }
  /* interleave reviews into the stream (1 review : 2 fresh) instead of front-loading */
  const q = [];
  let di = 0, pi = 0;
  while (di < due.length || pi < ordered.length) {
    if (di < due.length) q.push(due[di++]);
    for (let j = 0; j < 2 && pi < ordered.length; j++) q.push(ordered[pi++]);
  }
  /* no identical neighbours */
  for (let i = 1; i < q.length; i++) {
    if (q[i][0] === q[i - 1][0]) {
      const j = q.findIndex((e, k) => k > i && e[0] !== q[i - 1][0]);
      if (j > i) { const tmp = q[i]; q[i] = q[j]; q[j] = tmp; }
    }
  }
  if (!q.length) {
    list.slice(0, reach).forEach((lvl) => lvl.forEach((e) => {
      if (L.words[e[0]] && L.words[e[0]].s === 2) q.push(e);
    }));
    return shuffle(q);
  }
  return q;
}
function buildTurboQueue(L, list, li) {
  const pend = [], done = [];
  list[li].forEach((e) => {
    const ws = L.words[e[0]];
    (ws && ws.tn && tiOf(ws.tn) === 2 ? done : pend).push(e);
  });
  return [...shuffle(pend), ...shuffle(done)];
}
const isGoldLevel = (L, lvl) => lvl.every((e) => {
  const ws = L.words[e[0]];
  return ws && ws.s === 2 && ws.tn && tiOf(ws.tn) === 2;
});
/* --------------------------- Vokal-Blitz ---------------------------------
   A separate exercise, deliberately not a change to the core loop. DESIGN.md
   says this is not a phonics app and the reading loop stays exactly that.
   This mode exists because a real export showed 28% of all wrong tiles were
   vowel-only swaps with the consonant frame intact — nicht→necht, von→vun,
   Buch→Boch, kann→kenn. The consonant skeleton is being read and the vowel
   guessed. In English that half-works. In German the vowel carries full
   information and cannot be inferred from the frame, so it needs training.

   The word is *heard*, not flashed: the question is "which vowel was in the
   word you just heard", a grapheme-identity task rather than a speed task, so
   there is no fixation dot, no mask and no speed tier. Results live in
   `ws.vk` and never touch s / cc / iv / due / h — a different skill must not
   move the reading schedule or contaminate the reading accuracy figures.

   No colour cue on the blank. Colour-coding the vowel would make the tile
   choice solvable without reading the letter, and learners cued during
   practice but not at test do worse than learners never cued at all. Colour
   appears only in the feedback, after the answer is locked in.              */
const VUNIT = ["ei", "ie", "eu", "äu", "au", "aa", "ee", "oo"];
const VALT = {
  a: ["e", "o", "ä"], e: ["a", "i", "ä"], i: ["e", "ü", "ie"], o: ["u", "a", "ö"],
  u: ["o", "ü", "a"], ä: ["a", "e", "ö"], ö: ["o", "ü", "e"], ü: ["u", "i", "ö"],
  y: ["i", "ü", "e"],
  ei: ["ie", "eu", "ai"], ie: ["ei", "i", "ü"], eu: ["äu", "au", "ei"],
  äu: ["eu", "au", "ai"], au: ["eu", "ou", "o"], aa: ["a", "o", "ah"],
  ee: ["e", "ie", "eh"], oo: ["o", "u", "oh"]
};
/* every vowel position in a word; digraphs (ei, au, ie…) stay whole so the
   child is never asked to pick one half of a sound */
function vowelSlots(word, lang) {
  const V = VOWELS[lang], out = [];
  for (let i = 0; i < word.length; i++) {
    const two = word.slice(i, i + 2).toLowerCase();
    if (VUNIT.includes(two)) { out.push({ i, len: 2, unit: two }); i++; continue; }
    if (V.includes(word[i].toLowerCase())) out.push({ i, len: 1, unit: word[i].toLowerCase() });
  }
  return out;
}
const fillSlot = (word, slot, unit) => word.slice(0, slot.i) + unit + word.slice(slot.i + slot.len);
/* did this wrong tile differ from its target by a vowel and nothing else? */
function vowelOnlyMiss(target, chosen, lang) {
  if (target.length !== chosen.length) return false;
  const V = VOWELS[lang];
  let d = 0, isV = false;
  for (let i = 0; i < target.length; i++) {
    const a = target[i].toLowerCase(), b = chosen[i].toLowerCase();
    if (a === b) continue;
    d++; isV = V.includes(a) && V.includes(b);
  }
  return d === 1 && isV;
}
/* one question: word, which slot is blanked, three tiles. Foils that would
   spell a real word from the curriculum are dropped, same rule as fakeWord. */
function vowelItem(word, lang) {
  const slots = vowelSlots(word, lang);
  if (!slots.length) return null;
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const alts = (VALT[slot.unit] || []).filter((u) => {
    if (u === slot.unit) return false;
    const filled = fillSlot(word, slot, u).toLowerCase();
    return filled !== word.toLowerCase() && !REAL[lang].has(filled);
  });
  if (!alts.length) return null;
  return { word, slot, opts: shuffle([slot.unit, ...shuffle(alts).slice(0, 2)]) };
}
function buildVowelQueue(L, list, lang, n) {
  const reach = reachLevel(L, list);
  const bag = [];
  list.slice(0, reach).forEach((lvl) => lvl.forEach((e) => {
    const word = e[0], ws = L.words[word];
    if (!vowelSlots(word, lang).length) return;
    let w = 1;
    Object.entries((ws && ws.mx) || {}).forEach(([c, k]) => {
      if (vowelOnlyMiss(word, c, lang)) w += 4 * k;      // he has actually missed this vowel
    });
    if (ws && ws.vk) w += 2 * (ws.vk.wr || 0);
    bag.push({ word, w });
  }));
  const out = [];
  while (bag.length && out.length < n) {
    let total = 0; for (const x of bag) total += x.w;
    let r = Math.random() * total, k = 0;
    while (k < bag.length - 1 && (r -= bag[k].w) > 0) k++;
    const it = vowelItem(bag[k].word, lang);
    bag.splice(k, 1);
    if (it) out.push(it);
  }
  return out;
}
/* --------------------------- Buchstaben-Blitz -----------------------------
   b and d are the same shape mirrored; m and n are the same arch once or twice.
   That is a looking problem, not a reading problem, and the main loop is a bad
   place to fix it: a b/d contrast turns up in roughly one question in six, so
   50 reps on the pair would cost ~300 questions. This mode shows nothing else.

   Flash and mask, same mechanic as the main loop, deliberately. A side-by-side
   matching task would be solvable by comparing shapes without ever identifying
   a letter — the mask forces him to encode which letter it was. Exposure steps
   down inside the round (1200 → 800 → 500 ms) and the items get longer, so the
   difficulty climbs while the pair stays constant.                           */
const LETTER_N = 15;
const swapAt = (word, from, to) => {
  const i = word.toLowerCase().indexOf(from);
  if (i < 0) return null;
  const rep = word[i] === word[i].toUpperCase() ? to.toUpperCase() : to;
  return word.slice(0, i) + rep + word.slice(i + 1);
};
function buildLetterQueue(L, list, lang, pair, n) {
  const { a, b } = pair, items = [];
  const mk = (show, other) => ({ show, opts: shuffle([show, other]), answer: show });
  /* 1. bare letters — is this shape an a or a b at all */
  items.push(mk(a, b), mk(b, a));
  /* 2. syllables — the shape now sits next to something else */
  const syl = [];
  for (const v of "aeiou") { syl.push([a + v, b + v]); syl.push([b + v, a + v]); }
  shuffle(syl).slice(0, 5).forEach(([s, o]) => items.push(mk(s, o)));
  /* 3. real words he is learning, against the one-letter pseudo-word */
  const reach = reachLevel(L, list);
  const words = [];
  list.slice(0, reach).forEach((lvl) => lvl.forEach((e) => {
    const w = e[0], lw = w.toLowerCase();
    if (lw.includes(a)) { const o = swapAt(w, a, b); if (o) words.push([w, o]); }
    else if (lw.includes(b)) { const o = swapAt(w, b, a); if (o) words.push([w, o]); }
  }));
  /* words he has actually missed on this pair come first */
  words.sort((x, y) => {
    const c = (p) => { const ws = L.words[p[0]]; return ws && ws.mx && ws.mx[p[1]] ? ws.mx[p[1]] : 0; };
    return c(y) - c(x);
  });
  const top = words.slice(0, 6), rest = shuffle(words.slice(6));
  [...top, ...rest].slice(0, n - items.length).forEach(([w, o]) => items.push(mk(w, o)));
  return items.slice(0, n);
}
/* Exposure follows the speed slider, exactly like the main loop — the slider is
   the child's one difficulty control and a game that ignores it is a game he
   cannot make easier when he is struggling. The within-round ramp is kept, but
   as a relative step down the same DUR table rather than fixed milliseconds, so
   it stays a ramp at every setting instead of being a ramp at some and a wall
   at others. */
const letterExposure = (i, speed) => DUR[Math.min(speed + (i < 5 ? 0 : i < 10 ? 1 : 2), DUR.length - 1)];

const VOWEL_N = 12;

/* ===================== Tier-Blitz (Krogufant) ======================
   A third sublexical exercise, behind its own button, on the model of Sara
   Ball's flip-book: three strips — head, middle, rear — and the name is cut
   with them, so Kro(kodil) + (Ja)gu(ar) + (Ele)fant reads "Krogufant".

   Why a nonsense word is the point. Every other reading task in the app can,
   in principle, be passed by recognising a familiar shape — that is what
   automaticity *is*, and it is what the main loop trains. But a made-up name
   has never been seen before, so there is no stored whole-word form to match
   against and the only way through is to read the syllables. That is the one
   thing whole-word practice cannot check on its own.

   Same isolation rule as the other two: results go to L.tm at language level.
   A placed strip is not a claim about having read a curriculum word, so it
   must never touch s/cc/iv/due/h/r/wr/tn/d. test_animal_mix asserts it. */

const MIX_N = 10;                 // items per round
const MIX_TILES = 4;
const MIX_HOLD = 1100;            // auto-advance after a correct answer
const KROGU = ["krokodil", "jaguar", "elefant"];
const KROGU_ODDS = 512;           // 8^3 — one exact combination out of all of them

/* The fragments, per slot, per language. Head fragments carry the capital;
   middle and rear are lowercase, so the three concatenate into one
   pronounceable word. Within any one slot all eight are distinct — if two
   animals shared a fragment there, a name would have two correct builds and
   the wrong tile would still be right. */
const TIERE = {
  krokodil: { de: ["Kro", "ko", "dil"], en: ["Cro", "co", "dile"] },
  elefant: { de: ["Ele", "le", "fant"], en: ["El", "e", "phant"] },
  jaguar: { de: ["Ja", "gu", "ar"], en: ["Ja", "gu", "ar"] },
  giraffe: { de: ["Gi", "raf", "raffe"], en: ["Gi", "raf", "raffe"] },
  flamingo: { de: ["Fla", "min", "go"], en: ["Fla", "min", "go"] },
  gorilla: { de: ["Go", "ril", "la"], en: ["Go", "ril", "la"] },
  zebra: { de: ["Ze", "bra", "bra"], en: ["Ze", "bra", "bra"] },
  kamel: { de: ["Ka", "me", "mel"], en: ["Ca", "me", "mel"] }
};

/* The drawings. Each animal is one 400x600 WebP on the shared body raster:
   band 0 is the top third, band 1 the middle, band 2 the bottom, so a strip is
   cut with overflow rather than with three separate files. They were painted
   from the vectors in src/art.mjs through an image model and then warped back
   onto the raster row by row, so every silhouette is within 0.6% of the
   template width at both cut lines and any head sits on any body. src/art.mjs
   remains the source of truth for the geometry and the fallback drawing.

   Inline rather than eight files because the service worker fetches every GET
   network-first with no-store: separate assets would be re-fetched on every
   open and would not survive going offline. */
const TIER_ORDER = ["krokodil", "elefant", "jaguar", "giraffe", "flamingo", "gorilla", "zebra", "kamel"];
const TIER_IMG = {
  krokodil: "data:image/webp;base64,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",
  elefant: "data:image/webp;base64,UklGRv5eAABXRUJQVlA4WAoAAAAQAAAAjwEAVwIAQUxQSNAOAAARf6AgbQMWTsFfRASczGlCfzawQQC1uJGj1y3Jwtlqh2FmSmEcj2rDaIU5UpgjhTnWJMckhTnyHi/Kx3zyMc1N28vgRPYe34LWM+HMuqssy5KlVr8flnq6v++91+FE9H8C4Kf+j4wPfvC7nveZGz/8qSe995WG3PKvec2nPJzuIL70XkLL//bdeKHOnb9mCuwT5zHQzhsNYb3iJgz8zL0kZd04wRC7TzTldB2G/GVDSIUbMPQvmyJ6xXdQwb+OC6jhoZJXxcVTcFFROyYca4TKNk3ZnEOFvxyTTNVTCW1TLtUJqv0Wueyh6lmpXILKt4RS9dTD+3FWmA9uHzW0DabefvMtp92vnN7Y+MAbnm/NX1AVtcwEMD8/P/+wdzzMsAyyyp//jod+d776hUsf5m9fjyV/1rOfcOml53d2dhzPOXP+r970uBhB1vxtt2GQG6fvMz8/rYqaJn189PO3e3ihnZfME5N//Ld3MGhnp/vIKfu6tGacuhmD3bnsoZTk/wfDdW7/5RcYVdQ2DQDWPf7Iw8CdF92DjFPfRQW/NNBnCQBWMFznXxMkWDd4SPxjPnXd3SEhNkn4TxThhwj4fRTihwzdqp4U8M2GZgOUY12v/0JJPl2nU54onIQ+louy7CS0uQaluaRLGeWZ0uRAIHU9yijRlBY9kbRjGhRckeCCBreiTLtx5ayxUHBJuSqKNaXaObksKVb15NI11FpDwabVGkqmqVTekwzOqbSKoj2p0r5suoZCrmwwoc4KCveoOtvSaatzIB00VSmjeJOqLMunpMqufGxVRvJBU40CCjihRk1Cx9UYSKiuhiuhrqFCGUWcUWFZRosqnJVRRYU9GbVUcGXUVaCIMnaM8BpCwlh4a1LKhteT0snwhlIqhTeWUis0y5NS1wirgGKOhVWWUyKs1e+9zYW1K6dsWP3IMJRTLjKcDMuNDBM51UMqoJybIZUFZUeGbkiNyLAcGVYFhbHIkAhnS1KZcLYllQ1nNzL0IsPghwFSkSEbjfYllQhn93twXSMyQDTajgxbkWFVUHZkaIZUjgyFyACunBbDGsrpWFh7csqGtSunubDW5BQPqyGmFoRdFVMztIKYSqGBK6Uj4fWklAtvWUrp8MpSSoQHrowcQ4GhjFqg4Fl9mmP1WhN9FlRY1SejwdK+PjkVitp08qi+vanPnApwoMvLGxrga7TpGkqc1SV1ToenebrUQclVTbrmgQ6VA12yahQ1WbImOnTWdYmrAQd6zBVRy4dqYoOiW1o4xrIe6aEeJVXKWlRgS4+TK3rMqQIjHTKwr0c9P9GhDcpu6RCDoR5do69DVp2Cp14bwNUDk8saODF14Jx6WbA8TbKWq14dFK4p58SgjJqehHX1cirBWLUKwIouTSgq1zGUWlctB7CtSxdgqFoJlLZctboxgF1dMAYN1VJqwbpaJwCgr00C8hO12qC45arUMQBgoE0G4Fa10qrBnkoV0CoHAAcq2aB83lUordciACwr5NxPPVhXpwV6LQEA9NWpgIbWt5XJTBlq0zpU9pRJ6AAFT5G2MWWsTecQ/IcqTwc9/1aRNEx1NbNcNc4YmsC+Ek2YPtEGk4fg95ToxEDXvKtCQr/0FPimCknQ9xWT8F4GM13trFF4Twedq15YtjFroE9yGpRD+7KhFZzywjkzBwSkZ8DHQ/olEzQ/5YXgfMEAny4BcF0oHwD9T00Csx8Ovof6xH3AdV5wjwIKi/8a0Jdj4H+gT8wPPOt/A2o+Hoh8+7cD+NV7mXCBe9p0wL/1R14Qv2ICmdYnL3M9H07n8/8YgwveJQLgWf+8cyE7TzKA1Pm3v+PdN25sbHxl44v3nocgt7SpXxDA/M/esuHNcE6/bh6INiDoNW1KARx+5T9ceukvXPq55z0E+F3V5lhAnFueLnFxwIEmXZBnT5OmQNY0WRBIQ5O0QMqaxARS0KMCEh1pkZHIH3ha1AVSnqCeb5HHCHWNSWMdtX2pMCxXHzRlsY4aHxWF5erUMSSxjlofFUTB1atlyGEFNT8qh6FuTTHUUPukFAb62YYMakhgSgYDCuoiKCOJL5PANg0Y4y8/JuIEf1cjkR2DvTEVeJS7BpLZMZjbpwOzvBVcQhZ520NK45xZLinP4GwFaU0wtkfMM/lqILEdvobU4Amuqkhum6sBPZjhqeARVOFpDQnuGCwNKcI0R8tIcoujPk2Y4ifvEVXn52qkOsbOiKwcNw0ke4mbIV2Y4KWMhOd4+RplTVbyHmWY4qSGpJc42aOtw0h+Qhum+FhB4kt8DKnrGmyMqcMkFzUk/5lcnKXP5uKAPkzyUEMGn8nDFgc2DwccYIKDqsfCMQ7OIotdk4ERDzhHXxGZfCZ9q1zY9O1zgXPUFTw2jlO3imw2qevzgUniXEZytNWQ0TptW5w4Jmn7nGCGsgKyWqJslRfHJKzPC8YJGzFzgq4iMrtE163cYJwqa8LOUaoKyG6dqlV+bKoG/OAcTdaEoTRNNWR4gaY+R02aDjjCOEXWhKUsRTVkuUTRHk82RX2eMElPwWPqBD01ZLpJzxpXXYOcAVeYJGfCVo6avMdWiZoVZLtFTY8vxyRmwBemaLEmjOVoKSLjJ2m5mrM2LQPOHIMUlzNMUmJ5rKUpKSPrOUq2eKtQ0uOtTcmAN8cgxOUNE5EhR0cZmS/RscJdhY5t7pp09LlzjKiAJhkH7M1RYU3YS1NRRvaPUNHgr0TFCn8tKrb56xpE9PnDGBEjASQjQ4oGyxPAERoKGBVqElikYVUCFRo2JdCmYS0y9CTQoWFPAo5BwlACmKAgPxZBhQBriDLM6LeOQrRN3QquFDCjWx/F2NbM8uSAGb3WUZB1vcaSwJhODRRlTqc9WVR0cmXhmPoUUZgpfVaksaDPtjSW9BlIo6PPWBpo6pL3xBHXpYriTOnSiAwr8jiiy2pk2Py+w3Zk2IsM25FhUx65yJCKDHO6LMvD1KUqjg7oak2ksaQNHEhjQZ+eNFL6LAvDMfWxXFlUQOM9WWR0qskiphMcSKICWu9KIq5XeSKHCmjel0Nat7IYWqD9N4TgJPTLuzI4CgTWPAl82KAArhFA2wQav8Fedw6IrH2XOScBZFqf8nc7N84DgNLfmMxwfulxNRZum+Fc+rmHAq3Fd9+G2L3lA/cG4CH29ne/+wvX/8q7YkCw9bjH3RMOs+AYwCELNkSF1vdWqhyUeLA8BhaZQAaPMzFhIMUDcJBkYsBAnIk9+rpGVGgBkz36Slxs0neEi+XIUKUvzUWevkRUsIHNMXXNyLDIR5+6LB/r1KX4qFEX46NMXZKPBnVpPtaoW+CjR12FjwF1bT7G1DkGF3mPOjS5qCL5KS626DvCxR59C1wM6atwMaLPZsKa0OcYTCD9XZOHMgOY4aHGwRIPyxw4SRY2OcA6Cz0WMMnBgIc6Bwc8YDIy1OmzJkxgkj6Pi3pkwCR1BWSzQl2NDydG3BofmI0MbeK2GMEMbT1O2rRtc4IJ0nqsHCNtyEonMmAyMjwzMtiRAdOEjZlZJMxlpk3YkBlMRoYFunrcNOkacuOYZA24wSxZfXZORoYmWT12MBYZ0lStseC4viqSa5/zZUuuVfD8YJyoGgsl6PtKE9Vg4Rg0fC0QVWUhCeD6aRKVZ2EOoOenQ5TlcWACNPygSROMGegaAFVfSaKGDLQBAIZ+jhHVY6ByqOenQtQaAwuHGn6aRNUYyByyPB+OSVOZgeQhGPnAJE2WR19sSt9PhiYYkdeBqZt+jhO1R15rWsNPiahV8irTCn6aRJXJW5gGEx9tovIedekZIx8dosClLjVj4MMxiBpSl5ux5wPjRPWpOzJj189cZMjKbtVPTmaLM1b8LMiswseQuiMzqn5ysiv6WSCqT93ijLznY1FmpRkwkd5iZFiaNfSxRNSAjYGPFlF96iqzeuSNqLNn7ZI3oK7OR5+6ZhBNosbUVYJYFN46eS4XlusjJ7OlGd9A8sbU2dOKSJ41YShJUx4ZMkVX9hUX3bKvXGSoRIaW6LZ8dUS37Qvjkuv5MwWX93w5BkllJlbQf4ykKhN7F5AgqcjEiIEaE/sXMCe4vkA6IwIcUwDOL8cL/+Sp1QmiBew5X3woAMCz/8xTyQ6izty/n3533IDpxXffcpsyS1M2/R1jrHPx4x5nwAVaj3vcQ1wl7CkNf2nGbAh4rFDe85WQHIz9dEB0+35KQkNzyu/5SQita0yB4ayuITQbpt866wQIr+hN65pS68yA/SnOo0Bq3VnFyaE6yM2YAZdMENFJkdUgzwafv4/4VcyRtckJvPof4o8Dsmus0L4cGdbUqAc1UKJrcFFToxJUXwk0o4IN32tZJg9NLlbI6wCXte+Z2N9zWSava3CxQh6aXCxHq8WgeqKoqnFRUHfJ63hQ20p0gMuiGhcFdZcSXYOLGnk2/EDDkaA25XVRUHcp0ZZFNqhVJZqySAXVUMJmo0hehY3890wW2bAm1JXYgDF1C5Ehy8eIuhQfB0rEgiorkeNjX6eCEik+zlIX42OTOpOPNeK6wOeyCh0I3FXAZqRAXIkRcBWwgxsrkJXFUnD7CiQ5+boCi8H1w7OBU2sS3vHgtsMrwX34sB6yH14muOXwvvS/aT6KqGAyuFp4iHN85D0FYsEVFHBMPmAcXhtCHIVnA6N74VXC6IdX4mQ1vFwYa+FlOSmGNxdGNbw4JzAOqw2humdCsoHVs2EthvPsd3rhLPBSDSsZTn6C4c7xAqNwbAj5T8JpA7NboZx5QFg1xB0nuGPcFC7/ZnDOS82wil77hl/wEJ0Zzoxfxiuu3YlxA4UnPHd85Xf/ehLAW55rQeh/b95xCXbdZ9yNWH/ec7/+jOvQQWz95R9e+U7rwcBu8QMvrMZf/enx+Z3O3ed9tWMvMsKDc6nf/dL8Hyf+wMO6Ufy3a26y17Pf+bnXnTcNCxi24s/62Oc/cfknG6lnFzx0PMS3oHfHi2KrGVDwOfDKWP7nzFc++7kxeNbFxRfcs2ZC7dUGMP4cgPz8P268+Padizc2Hvr8d8zDQ/Kg6sNgpmUAWCDBV8I83ONzAPAuywSVDX+CNOCnNgRWUDggCFAAADAxAZ0BKpABWAI+3WClTSilo6IueDrhEBuJZT4r4ZFv/D//PCaZuHY6up7yqP6HT7Zgf9bW//fsgHxzlkiS951S+1eL7ljs9+BT199Ff/X+p1gDUAOMjn+/730Hfnzolv8/yv/Z/qGzsjd3NNxYfvLc7n52vTt/fd3x5jvOr9In+k6b31NvQA86/1V/73/6PSm9QD/6eoB/7eJP/on4u+4T559o/x386/z79F91P3efWzdr+a7I2fbs5/XeHt/v7n0Anejz1PpRkr9j9C3ppaaFQr9iPTq9kn7P//r3J/15/+SOv0g1C3RpgLK5Fqi55noBkfMlHF6H940KyHdvX9/T8uFjS7wlqTW1yr/ltVmgRf7VwwzLrHA6Akz0AyPmSfsimbXzYln9W06uv1jIV5hu4Y2ZmFMzhTcObFqkod91z/7HY4lIZPrIQ28ulVXBjhVY89MitSYaOMNdzku1qe09m0bfiG37ydeSZLR1jy0sQYuBWqdfuQ0S/d8dLYdWX//u1Bf24bWQj07p3CDU/I7E4rnOzNmkvFTV17tXJRf6y5rIbXEU/qrWFkrrDCj8YLcGZvJAIUtOdWY6GkYC33T2VAWLtrxX02UPOgHbSjtE2GI9fhXUvvkGbPK4Pmvm21o/J8Sypfc4JGMwmgJmCh0V/UAHgKceJmT7YanqJEcPDfZFsYNFkud9A7qa1jKsG3vy1EOxJEV32XyA5EDOoBULLJcVQZkWhhwxZz6J1e9VHXdtWJD89VhK4TDkje8HE+Gb9Pg7ZVLM7JJIlemoudP1bieuc0DDHvydkX9zW6iJwmHEOavn8+zitkpLsovKEWke23gyUa7xfQ4P1Pk+4+7SPufk2KMrtROblVHhe9mOkGuyNg/YAkUnt7zKErqtH9e7xDHi7ce/YcrQSUZbNLwSd64XC7Uh8Yi32ipfx7iKUsVil87odjuxIrKod5WJAf15yvNXBuFKLGy8FYQPD1iY83UstXDXC8xLWqWm4Aes+oLRXafDC0PnOFQ3dXUC+52RTgCpNJuINfdBwkdJYcuGa5bzpE/LKCubvjiI4aqDu8cE5MAZB2t8WgplaFkR+1vbxbkXAmSxQxGMF3Q9KKJ0G2JVXM37SjJ2LazVWT3nx2aSY4dJHAkfBZEMBJV5FD3qaXhmrs4io7Q4CBZvYzaeT5PEU15oTXrvuaSks+33/OLv6U6juzMb76GY0P1lM0nug90Q94DfrdPxyGy4/H/aj5odYjHRQqG0UymltY7cN0Co0//wFJvxD312AkTxOtgPVeWrtoZQkbkSaEIsl+Z4OuX94X6mdo429NYsFuSGFfTH0XP+Y/3hjpAWBaHS81+JXAOruhT0CDH//XJLfz46lamoDPZK4ojJW+cBurlwpVHEMAtvt9JyJo4i9p5k201835zyWDqLIE8XOamgQbO3BlgMP4sf2qB+SkwMeS6NMBJQdr3ICsXDjEE4NuErbTILdLA6K09H4QB+4RVNUL8FYt2vdcy6MLrp4WSuRaorEERN5pLU8NST23CDRIk0sIhKHhUlF1PGGQ10V1/7NGlz1DxzCCwDQvdd5cU761C3RpgLKstawKWnJ01jilYguAaEy2cubPcpykrNArESlaFlzYqfWKDnuCpV5Xl6QUkfMlHF7M2pNF9YLh0x3yNnyqM187XGDrb88gOfhrruqy6Mo3ZEmTvO73pT+whCI3luQV+kGoW6ND3zA/egPCQoqjMMMZzK9g5GFIRhLcWe16QF+pU4EL5YHt2dYnsiE2MWbgq2tho3uJCHj1KowBY/RmmFlpZXItT1WeOg8gSgiQ+EJ5FYeoH716HeocoQ8s3YbNI3f7Q2mTSI88MCJymnkRJJf8NJcNVNgpO9o87TdGhdgK39A8jB3JsQKIIVNzDYth9n6Y3+laMHORCy6jObe7dClTYu0t0DPD9+4XZTpjIRTluiUT/rqVrVFPqABb6Ees67vbh4q9SNsSOOavldqXn6o3CYzbwNHCfZjqQb/1efyyvlGbAAu2zz9AMhIwg8vOQiGzXyqTqPLaha306BPYCYzc51nOwnKuTYRCXvQHaAPPQm+i/3TyuexaPbQmJiNJiZkF5l+TajxkedpfUEzC5Y3ANnUaiJyCNnBL/LXd46cEjJuQAx+qQbiqVceArP9pBbe3nXomBSZz0+0Wacb4c4DkhzrsrM+dG+mDJTzl97+kuB3Li1RWJ1+T6aPfU+eiMaiZT2mlY5rt4LlCNI6bliBfkmDF1n4At0PQIz+DInPK03FxZHNMFj8SBtzhVJky9Tu13jk0XM/GB9Qh9OcgFYlKbps6x8Mrv7+6fuvxD5h1TCnlQYZ9Lba77tVg3qmm5EwRfKVJvsG9VoKrAs5YVRARNnJvG2N4aEb6/Z5nmUoVT2U2e/iBh2UiIpVA2dIF5stAVwg4jP9NhCRcZWxClvikHcxfdHjvlmrZALGaNoKOL2eZ4jx3esJeUMQUgeqrqGn/SMxgR8C2peboc4AgwJNt8cTLZ8umlatTI1ZOmiDozKHWFEYewq8z0AyPklcs5YdlI9wnuZlHDTaEwNlj5JH/MKkvpUznU5r8PArgt0aYCxOzPhNaE7DV7VSzLJaZFmrTOVoSKcQfgMmZqQuufmRe5XCabo0wFlN4tvD00vFI/YxZE0OBeAX8MzfNPnUXWjPvX0BCyxrAPPPsKgEmegGR3vJblqDGpvS0BqphgAWtMfiIOs6Vy2eAWxpFxR2NrJrLj9DvvURU5pUwM0dNXE5hj5ko4vNfR5t1ybEE2HJTIFEeLv3gqB+A6jtLikf3rWyM279nPeS499GI/7rkdqmP2qFO5MtB2SiUyy9hZcDEaYCyuRDJanQvnL4kCybC0PTRQ+rtCP4S86tIajcbAqwnudmTJ6+jXM6NoVEmuGCHeaBDVFzzPLfqwS0RBIiGPbA838jTZ37hSUffpY6TOX7OF8BNnXO/k6KKtIETm7k4JKA1MuTPOnBHcXs8zz9YojbFrQdhb2dEXvaqbi9sRsI6uRaoueZabybRiDw0rgQn9YBXfq7UllarOYTqV+zlx03mhF6loSMxrDgu+65+O/16NHl0+nWZOyVyLU553TDssjj4HYgpsfr7T4PQw74Qx1cZUoGT+mG7+1/iuH/Vxiqpa09S7Co3VfJGgJIF2NyPR+5Hr95o+0K5noBkfMlAwFdiX+q5Bg0TvyV6o/A1uu+GlPY7vFoJc0vQUxZN89zahW66mbK9wluS33LMBZXItUXPJvqjs7TcrSpzj0Ax0AAP7zpcAAAAAAAABmxIR8VBCxiO+GDYpbLOqqa2cYHLZa16EeO0RM5CLH3cYJhJQeK8uCmG6DjDxgfnO+S9okwCV15BWz0SFTmycI3pEUHx+v6cwWc0HUSf1wXk0bnBOVNp8l04fCW8ZJgvlvvWJwJpSAFd46vBXkG2ZGEZgo8HwfFJ8FXp9KhKdIpdfjYN8f5F4iQWE+jHA2Zobgu9u3HIAiTgbLgpXD3d1yG8UI/Eg8LBXeyfk+4pe3C5FEMESJhInH7lDHZ4IWWZciradRI6j+vt81qicuwekSJHhmsDfQt1QWd1X/uSIKTo6FaL3RVIUl+Rhg+/dHp99kM1sdiBhpU4Asmcc8yj4OsT7SK5y1GLgOpiyGfnm53NIOH26I9PaWoI18T2c2l8BlAAAMKASa9kpaZHiwVzL4H1Z/Wa/FAyPuZ6FDKkF0B/ir2YruT6zSz8Hmas4asuVa45ECoz0IniFlJyd+WtmFP35UJf7pA0j71aWFPOvbV16o5p/Qipz63+zmwM2BqY7BR8fcmD6roFU8JLgXumnugQU2apkXYkTJoglzOMq9cxd2/PB4VBcnPWfEV+E/jDdeel2b3yT2dwkvlA+y8de3ncxLoFzvrOPvfW81PV/q8uwSlz3BrXTwkerowAN1uXG1KW/xravxC+Yf4a/lM4tszCu9cuUfyzzd3shRcgvFoY9mvJiYRUHHpp9Tx0xfc8V1/+aUAZqYmi3QDdbc7Hfmz0ynfrn6F1uCgfVuDPgfeNrKhj6ub/kY88zGimC8yUTCUWF/4t5NfydJapESwpFtw+AkXzEnBXNo89MemqvuzV2BioaPpxTZjehQmZrhU6nrMUJEpoqDlEmYa29nfcqOQ0B85yjA2mKm4qkq6Syg0UGQ5NXRLachmSuQAHaaD1qW2cdpFiqL1wALv7OtlNjsbTLcHdgeO0vhhkpJtdbFU/IVC2YUGvub/b5XK9zRitXHrP+XD/y1ZEeP1ZJMfPVmnVSSok/heA9U+loGHS/rY7c0kYsIk8xCbmLmZc1uDPmv/1IIrNWxw1Rfd8Meh6dytAW9/ZNYzDO5B5JTY1yXzuoHkXqB+0vIvo0aj396jVDIxMF+PsWTstfa+YVa7n3hIhQRJUtQu9iCNN+DWoKd5XujE0zhvnl+iNj/pbJUm9wxjAnazjOy5ldLyLml1G3kuWWmk7OKZOZqj//PnWmC93lQ8VHdFs+o5h309yaZuC6++Dw7OYrXcwK50pPqc6yeAfZNUtaUk6kR6aeMD+j2X6gg2b/g9FObr/XTdXJGGcibcLvatCPrM1yObzNWPmWwR58BafhVM2r58dqaPtenZpHiYZiEQsSquiyyC4TuxaqKDeQZXNNeDxybDNFf+R/bAOoTsCjpIAAEbMvlta1eP72cZ/zpJScXlZlc4CdtUFTj3sq59N/tNEA2PcHrGhsbAvki+/NSycg2P6fpHd22vPXiPvxcyepmDXIfFqWyrjwmTt2YGJFXkJD4zMD1YF3i7Eem4STNO6r4gXIv2G5hmIDufOy6XqRBOmov8IrcZVY0291+yBCZkyHSOIp4W6hJZLSj1ZIOgOI1bMukF0UTnUBTm4h8YcC7dortdw6dIxWGp1Pp62NQotBiBh2uViYbZwTdkXEgFzGAymPDtM/oRsKZiLRkJEwkveiUNuaWfNHqjSd/gWtFYZw6Dpjk6loQAfV+2pj3kpUtjfb37CY0hjH5fAzYJ/9KejTKgvX5BqCw4QvwCTlzjkozIjBXafsup1Ojsv3MYKomYlrl6C1YgJ0bw66D9aStObDaWZ/3VGH4VLvlqITN+1NiatQp6jKHqv3Ts/kEyTyTxfd1je5fQ31YOWbswHKeXARdE/FsWSxz6PbxzQRNzYvwBp4ZiCji6M6M6FbfES51GIxCtpIsECRK4owH1zrrgmXY/TE2YmE7FbzlWKBcm8sK7GSp93mpElCfvRfCZjW4MpJM2ojdfajPHihomhvW9Bx2QEF0vHNhOYOcofUCfG2g35/IgSqJXU1azGHyo6Mi5n92p1Kk57wxoTbiNaUJ7tkogl0e0HBZTIapbf2Bdww5iP3U7d8YiwMSehcC7S0jmAdRaIXqQ4K1Naa5Eil3+RvAVaEZAMDVK+5qM4V1eeIzsbG6kO7wp2SaH2Gqza1sC3Q6TOmFKqOq5hGgktuMTp79sWclpZKvWLprhyQLF+rP+HQ3mQ8oETcShxCLXAHkXjj4LzcU2MmdPjiUGZVMqgY+lJsxMPl/rJb3gReU9nmcVlmoFyB4jqjxISXQaNtCX7d64K1Dlovvq1AhHqPAC4VOj3kCV6jwzymn8SpzDMbmDqBkgSw47nxAdbsgkJ6hX3UEn970VmsoWakBwf+Kyc+0O27ROgyQCGO7ivMNnltNxXraCWY8WptfTyNMCNUfCRyoElkyXEjiwviVG/fqmY78TnTs/pcs7AeuN5Qfdg5fDYQN9JTnJ28iNrhz9TPxAEHKxVkvkIzhfmiSMl0qAzQwR7nDqRmQxl7ipNziD5QyGh+mvbtOfzcn8zhNiAGhM/HFDlJxsMtJuiJQ1+/j49NRR8ps/xLsl5pGH6JG5rjDaiX4IUarC88FLdmVgW7Zi0rnea2i3E1hUCvm/i9UFUZ2ag+EPdQWQBS0LC8NfItW6MeecpApkjkMxeTcuSxFOt0EmRSEpqP0iw7mYxoYtt9ViRH9GrWm0I4OggnfI9joD91bWzU4y7xE7PEVJru0QX30N+sdbDn2sKnDQQJwauyGWwjjXKpxh3/f6s+3eyiqD6ney2dIMPIOhWjIp5Rn90GdjQPxxUhJ6nFf+mwmaUZ7pcnGa4aPBQYO7U21sMxhEExa5B/gscS/cxqgWbn877PXwpmL7+736aM2PME7QoHJfcwJRILJHeF+F/43Ord7P8oXevk/SkBHFsWLdtJBcskz88uYzuPFs1TXNwhYtJS2AccjEdz+xwkhFVq2nucgSb9bxEVRm/hSiP4mbzNXY7Jh/7AeKRKS2xCCVO9dEYVVktsGqT+ukhB8doC2L0q66eKVWxjsmUa943QxTKQ4NLP+lwYzEup/Ii7WoGza0dVX45hQfaQseavZguTmB0Ei5R5tzVhp1GBELb75/ojfJ8jhKu+0mjO6KlbjT1nZW9/Q7LGYTcdzjPLAcTYFUssOMa0Fgxh34yr4SG/2WXxs2uJgry0h+prymK6qJv/0trKm504UdyVycB5D9s/dIVPmVOrXjZd/RYG5+EHjgV3u+VGX/anVwzPpQErEHwXsTIJa1mTO1N5eN+iOiXqTRwaiDL5JTtPTg1BRA9BEkuo0McBs1CyZWpyF5M+fJ+vzBZFhpXTo/I5VUhxKMAm52J8uCzwanpUhtnn0I3rl9ojTFbmCvmrWy1C9AfVOrgsjggrFLK3tDU4rUtPYofMORxqABz30WZF2/LvxM4kZApThEMXwnaWL0Fk3Dz6v5rQkPE0OzKTPm0xTRfuo17rQCgF/pZtb7eGgqSLcE0A+vpUMpylYQqMTCant5OPiicDFQKeJ+EIFHQDPzTmURxN1XzJtkqNJrvZInIEpKpNyWvcawm7scjFkhTvArDWIh8gjet4nKZY+Y3by8gcUxWmcUUUG56cm0GO8y6ULFuxmqN9JMlksI9M2Cl+hFOSmxhiAQg+lm4U+dNre+muBc1T2YUGBEQSrWhah8XTYQyk27YQDBGEwsa1MUufA3dAP/HgtF/HyAmxyKjpqNopCYE8bE66BgSVVGdrwhmmFsY5LQaDXOPhoSQQSX+I3MlvXMS3Hr4K7PHlfanjY3JDMqNRfMDWpx3Cxe5o6UIPJ3shtpmjslmj8TebnuvAMixAzoSJdDknlAZWmxRitSXT+52UU2eGAAc9UYnvxuDJE2rxNLSMEaRd7j5r284EKVZV8oOQ3UCDH3mq+yOleSb6cc1SjXnXIGf3A492HIpQQNVH1vr+TCaYePV1RoNvwyStwDi9ZZ14d1mOO4VI4x3wB3zBWNjbphD0qDJum5SKoAtfoU5shXB+2m4UCH81ykT+IFykv8rJ78PwtSMaXLOxf+xB6sRIWaSd5rVbLpMW8ALYeyqc8IxuuUscFtSqbZqm4WrwPEewdfNXQT4Z25F8Oaf2MdYJDx+dVYXNBgQ5h96fCej/KcU0ghbFdLM4SyNMECuEcQstiLxUTOPPdINaFsfQ4CHJLuwr39+k/kMmX/QNCvBJ9qaWSV+EoUaV/ha5juibIC5IiB7Yt2EXIAG2ZSR5lbCIgnLyjIaMPVIXhdcJM5BfZ8ByCFgHANRzDnedssAi0xvCx6ImD57AximhZRBbpHeCMR9pJ/30R82DIvO5ldVo1ifihfqA25yVh7SLRkC16sr4MdGU+qoIkbDK3zNwU131XI0yvGTZFSW1Fdt2GxpbcbPQMHw+aVF4JNbfUZb0pJcuJKkS81n7ar2SOI52X6rZKdi1US/an+smPP6zsZGXwHC+ADjPcKr6cAiL92KMc4fsiYnmwKyx6cdnDhwtKWs0uCt5rEpTNojH9LtB0FH8TQHL04Dy93iZhtxjSZMbmyQd8iTx46/f/KWvHOt+esmOKIh2kqqWCgcw/lqNsNJG8akmnBrc3exR59V/rgH3RMT/zUSbEw9Zn5nItSXL/Hl5HC4lm27zgcXBc/PxBtazU6pnugkUfnO8+keH5brRLkuI2vFCPHqRAbmIn7aqF0F7xaFISUEUJyg6Z8ZcaBeiL178N0fvHJ4jcbSBigY5Mr+g9l69tQc3hDFA23t9dRCRFvoHAlI7pRWvbT7TBWnu2kcPSjk2feTxlvpd2jCYQyLfzzthYwI79oDhyw0Ws9pY6QU5hyUqmBH4jzUMHsLJ63VQDK4WUiY6tZ5uhwATQ18M1dZlw5puXuVlNy9ButsRT67W8VpskgFEZAlsH4Jwk2pN9vEwv12ZBsWvmOg+Fj2b/7snhRaQ0rozWSo8qrlv/om7dDRM7Tn5Q4xtwncwTOxkLmyHkRD2ETgoJZ8hQp/ileX0xT5UZ8UZCaqtV66m87a4JoQh6bKRXepsaqW10EfR0tOtCn6bgDXbMmyM0K4Ztus5RC67XmgMDqU8dxCoDnz/RpQQzk5J43tP4QLUiQb11zR6ik7ed6JQveVPUgWYH7ohs/JQNpUMN4IwC8hB/ziWpuaqRwk6oiUlsPqWCjzy7vqKNKNQiufY4l99Czo70EnzRXp3WbGJEhZdle2ZAqMCQzsLiN7wTGGsovgiCS/xCKqcymUMI1R31K4BzDOjFBCH2IqzxmvHi+mjzPLJQs6bYtfbSijK0VZcmOpNQOBRpDVA0QO1ckn8cPU1OA1clg3JtD0JiQStnGAb6pj8KRgqDmUhfpOoClbLkB7vb7zIguckuYOeXaRs7DhcI+xJgmUJJwkZJuiKcbJH4QVM0ol/63uXSboIEmSmKlcAgPWwzeqqvipKucURYprGtaV3b5rL3Aou1hP9B6OP5Qwx3OZIeEjKMHBj/KrGtPQo7OJKMLr490/+p6EDM2nVGadW4U11jNdbSTpEGxKCOgyc8099Swmu0hVwygnoR4MD/dfiMDo6N+FvU4vZ8aGBQsSPFxrIQuHsH9gZdFKjdGM4NWiD+/3vcRj0MQrOAn0MKIf62pFk9dcpsrUOgxlcbcYRnT/L3BdIj56bs9Tn/9HN4Gn1OvaoYR2ed5hGOurNpn3niYmb6dwk5JAh/ImjEVMfjw9Mtv6D/G28uv+QTcXb1fQbG81xsu5gxQsQNEWrStfe3THeZhPX3NdPX2mklrNiHVvPh2dKtw3BWoD40vT8UvRkDiT3v7VxnrVZWpwV+83dI+tQx9/qcPljkkloSUr8FtXk2TT1nV6lrpLSSbkIUSSfvv2tNvDh+BPNRng5HYF1k8cKuTBtoT9xjh3IJY1Q6QiQdvBul1/CpENXw5LQchuPgo96G4Sgjt1H+v8eLovK2GJmEH1BEz0evFNbpBZ/QZOA4imgW1047v1SwqPrfUPACZpd5j8+FYo0L9qc55vtEOUjaTdKoyrYcgN8+0kVX3hZcF0qgF8XUGOY8oFzmPDY2WvgpeQoAhf0V648M8jEl9n26Z95fONhK+D2GnwWSOJeXi0BgPZa/WXy0nxIKqN1QebXdaC8tpvU4SoXsz+IV3yz10syBGzX66RUyCsZXC9Lsd24zsSfKCa8GRDKkRCCt5J3X2hbiZlB8iFixAyYHjUAwWOuCvj8+vtTVWXQ192kobgEBGTiZyyZTd/kvKchX/i5ciMvZAKQodFZi30TfzKESi3g+GoSHqhcmkgd9pF3iksCi993dHy5tMavxRHdq1jhBAQqm2IDikb1UnC4pYQRHbIMVEf9huJg1gRMevCHkbykgKqcVCoNaPAprlbd2vvbWq385E/mwN1FISbXfFP34Vz1LYkQEbpXSYq1X1R2XEu2r8hQfFFnDH+a+9pb3HlxhdCXazg7enj73B/lanczM/mzBGjGvdqdiKhoPk8md6vHIzGnb5cygH486zFbrZhNmjw5QPPnLNnP83TRUKimBOTuRij/McNwEtTDj9FvjxgXzUaGsVMTxkJBDRhXRZU6lNEePz3dqmcotzESHNPfi6j6nIGIEKvcvB3spYhuFppheLcpDm1v8sCDbR6qOzd3k6LyGVExXSIwAv018JXN1D1emiM0BGvT+hlNsBpSJDsfQR12bKxjOeutBZ2N6re5A7Uryohoz4R9Z+NgXCFor8NKqKGZkGYqcTtasUEOX/mTom6xlkUGxfUYSy2bJPyLG8hzjTDxN6N5ejj7nHYosR3AJ0QTgMYiYgefiMTwZTa+RgX+pkqTK2daS15wNBsx0KIewR+QNnqyO9RGHI5CUvS8MPvcWuFQ7215+U8HaiORT53LMFx8pU1t7icn/gJhfe+ArmK7C79sWoepI+WMgD6nt5Rd3MaCvvNF6CdnM1aCo7KtOeIWMvvXvhiaQNfv0NZzmuEyDXbpSFtTcvnjFoXxqvZvt8Qx5NlUa7FXwPxxrUgVzWcZQ2VNhVe//NZXzEvlBlEI+ieFoiyyzsI5rps9Wt9wUnYwcDq8TEOm0RcMT0Jl7U0RYzL1vDixZoYGlKomv0nSoqi3juaSfnNJ/7lE82cGRyAWGODh+dN2iUT1fbgSzS9MADXBRFcJQ61HRW6EiFpSPbiOyppaYX4ArMIEJ3nYhgLBRLicU1SpBOXzR0hO6eVEmXi/W83UK5e5QL62k8PNXupgt4DYTiG9SSnJVJRttJdva7Se/eNIr52ZfCLpoVL7J9g+ROKprtrZfRtCscTEA/aBdnXA7TisHbwucfPzx1bZnwMNPWYUk/d/Ubsmq/OjlSFVWYfXcj3tIHvG8H+9WgyOXxXpW591StmBqYp+XCUhSFP62nDKIM4A8ZNPW0UmUTthxUL2XfSvHFSNMrsB/TR5vKSiue8vbTHCg/Mn5yrtnta4/mzgJ6hD/rysUWBrkmzBxuNZGBkCArjH+cRDELchjwVFyEm7rsBjzPwkSkb6OUJtuY4BeJglT5jPOdQIXh5I93ppfsra5jn36WJGPUkHcpSM4Byrib+0XTmP4rnk1ijSCFghdY5Jn6T15vhYWAch1H+gUn//tXH/ajn/aYgY/8GQ4qe4QiuI0WcXSQdZiQPcwCBqNBjCfbOK0q6/4eoebC+Aivv//+ybhbF2ifywgc9QuvvNaXWFaXVi0d7IOLMFIrhhdycG+G0sEj2ATt3FusYT6wYeqwxM0WSy/jI01GT+QxhPNk+mW4x5mJuUJcdV8x5hCSptsmZRWkPa7/cQoaky94GXPGOm2KLdOnz8VEw5aCPyOy7dpMy9HPoWMvWEb9gNv7U1spUxQrtjEldpSIQySqBpqhmLsHDDVT/URYcoWbrPpNsB2OytpurkxJxPnSRL+ioEVW9y5IH3r07ZoCKKQbOH84LDJooE8q1FZ7tc44wu71TVRIrOfyecwX20AdbmXr7VrhT9xCHL1vtYBxhEJT0faLu6OaKyPcmd2IIxyBJvVVC0lQDYV/fNL8kSRiRKh5DJXkqF0lH4KoalSDmyWRy6mmJDNlP1usb9bpmZC7IiDg64DohHqx+CeCm2lgeuNZ3AT5KRUCQFbjEKZ4blvpFQuUJjzb6kyiYLH1EjY2Azw9LCGKQv3lX8qdXDN1q5eTzg27FLR1NMuVxbYQG1nqJJiETcZyUTaU/vq46CCvdtwZ4sR4TtxyG9AWsYcjwm4gzPbxwMTrAaVNEKVf9nnUs45aBJf8Pu9HIZbMhaKzMBLwFVHyOdU3aXTZfRlUQtpVcWvBgPzbBg8VIv6MFjr2toZy+9b7ZWVNib2WL1tW6Xb03eQGc9r6OoNsV9qaGGEaWkaPlw8hms63axg20VpgnAv5HX3AiWQdkEfYP/jvL19wkrkalMNa4ZUc48Cw+3LgOydOnkgQuJYtp1aSHL6P5QFCOz4TB5tLpI7etsYW8oDpnFWyrKJNtbFg4YiTCT+y2DxXU1uKwpQfqb/OYQm12LUV5YTauDjYr8Z3cOlDcVDg8N7KDBLmmhac1nG0RrLQlRXM03wtyYRtV1Uad9gLxhixCChCGLdJ/2amZJARgBurdE90oCMR/n/7+lgmm+pgPCDnJsT4UDm2LWN/617CAAA9rSHNqaTOHy+x1MhecpOCE5XTsHfkvNHuVUirMZE5aBTZj8EKx0DyAr3Fcy/Dm/JcNDukD8fyYQm2EHG3y9J5jYRAtVSht/GvQKz9lfMJTHK7a+OZdMQqVN1U4f7PGt+x3aL1Gk9KEUre8mbHLgQLQxyTVoSXhyKM41v1BZY/VFVs81p1TTLq5SVbs+ea9QT0cpRV8V1Bt6yAbW1yVpfgShImciTYEdPDgCSv5AP/gaIu5R4cw4g4Rnq6f3MvvJEgpvfAWrQlo4QyQ5hVj/eJq48YeKztOst00JfXgHW3RwuLZcjz/2DnQ9d//93hof+2ANYw268pkhm30KRnaDk9jBDbs35LZWKcG5UNlFY/yyrufBQpplMLcTmReM/cr9jBRNTw0hHr2wqt1EuiZ4p5VMkwrOR5Faf5yU4aCPcJHV4lNZVdZO0ttXHnM2dQ0bUllkE4EiJarILHxN8lN1dTHJiNpVl3IhZvY0zPDvzhltw7cCjj3YX/EzLYZ2J6Swt/u4wK+26fhr+DT2LRW9YWq+U0P1gC6ORfYo1Yzjcowh9x8179Rp38PuxwGf3dyd92kOkNp22ddDAoUrVg2eC7b2rcGaOTA2rK2ehbyyLyP3AEa/8XcQ4oZymiw5FFJkDB/lT9oQsT1Qbz2p2zPKmpGUaxhrusMhBbel/AUiCl54AWCJrsrSEXvTpfKqSWngYDdaqucYsOohewD2wVzLD/74eM4SZI4jI8za8JMlp6fHl1rLLuLqSDsmUiiOoyj9U38LBh7kHIPpMPFER75fWqdSruLIaYXYv1t64ML9l252RYIoWGQwQD6LNV6ZHZU5BCqGJpdl7PkkLHVX+It59yrJzc+P8d1Tci+OEGT0Ri52H8it+zCbq0wK7VXkLFXJKAaOWdztwpzTazGV0g0deziaU6TFofCkZO9LJjk+qR7u4U9BxqxZeFv7CGCEMuuTP/ziBMDifxDwXiJovBQFZCveLDF6M8kYA0VVUALjWqSwbQAAAALQ59Ct0Su7Fdg87DvJ16rQJVodKkDWLHxNQO3Hk0J7gt8tCbZMJjafkBsmwxn/C5+TgOLzTPn6StbX304rvy18z947GPRdHeQnEXsSupsvVvdojx3AbifcKFKewXL6uInFpuKL1beIHTEvbqLXFnMdu1HyXDdmQspuNj9OZ+6Pqc++RZu1VRCB0Y+cMLLxYNphqf2PaOsh1oP7wnPYT2pVxp1lP/IWjjGNINkS+FEEUIasRtdpQsuU0sZdI2ryY5mFbbUW8lQSj+a2vR+NoIl8T6nvaHWFeH9/RBXwkULpjORsA0RDCW6BkcnuBc4//vicCodV/fUYZz/GQp/5FKVZvxm3nkdsUifYfZZ7yRHa44xFKWisL6sw2QH8ToPOj2wC3XjyzDeV71/yu9tKW853wizsjVW1nNTC3cjVOf2+VVW9LE5joDsQAAAAQHhzoU+AFpYKBk0FfKVBGQ+S45hhbfJ35EVyJDBcQ14DVTQZ3cWzQs3fZzNZ5+0PLIYqA02DFtvXCzlLpTDizPV0Nb//Am8fobUbCxEh9esNM3HSn0O1IR0XIZLSpHuK9LdG28lJ4/GeV2/EKwllGFNjP5w/qTZXW+iiwNMM1Wk3sLO0ZUzv8mtA7fHBo48RGRr8HrzXuhLMTNc+gApUL1lF5rFoZDYrP0sFj6qOxVslMMz8qJRBKeiRF/jE1pwn6FOKCrXxJhxwea2BiLWN9A1Oev4vzPK8mLHzd37APz9ZlANpcmFH41yEnxrqW4zFzbVqCcTgjHoV+iTF8a6gEm37KNQu5/EaLSOvKjhFHO1miGyPV5vw//0sxFGOXadwXLS3sPlpNGNwVKC0OEUAuANBR7iEJKKB7InhBoWiedk3OIL6NvHsTSNEnn84tiqMSyBU54ABG04OIl9fhYTyS+bcGD/eVeGcjHz4Ma8gL5b3+JfWqPrtx2QADvzk74hDOCoOxF8kkElK8s2JowIYj6fVtFjTqdJmtFNroeUNucstLaBkiifLkn8S6tQjkLw/FlzswrebDXMd0I+8TudXZtirPPprbTxAb4li+ka/SSAV72xURO+TLYStRV+evb4MfOJ1gITUJWFVuKsXzRl5pIdqvwAbHj8GvcnFHFXUnL1eTmfiQUNF8ttF0xDZMiRw/3GUlHK/8RbCv1nRL4BtY5DYTnJ+IwCP0oSyy4FNCmiS6+XR59VLFOJ6F7mDO2x3KV9y6csmwlBoFAn7KXCdL1GgGoBFGIa+Mruihzbi4Qism0jbBQxtORvaq6pscSbHkXAA2FboTKruOWNhsWcCH++YRvn0dQM0Eo/M/dqV0jAUsrbIW8o0qiQbSKX/AysWDUp8nn8C66KwlWno2JjCD4nQ5FBY9b8Iwrtyerl+lXmowYt/zp8clC9YRDWOGVnFqf0Fp5z22FULFMAiRAAAJlp6sZX7fA7NVINOPFuXpWxZ601FYh0zDvHTBQMGeOk8nUEGXBynKDEcQYLsrviOVncdu79x3hN8VNqnhmuCkjwMojzvE+pwLIutttiQG5VwHyPi1G9QO3XxJiGBmpDNYr/tYZ1aGyyMC8dDSijlHq6LezeuG1qR8YigxJtO02s4mhIXjMfrgYWDeG7ghnxwsgS36NV9EDlerQGmLfB0cGiGJa96cEXqKqbn5UPNxj/BM/zdjlwg/GOgs1nHAtywELiMhiow1PGtTVEQyORsVWKKckjyfIQQqVJVjChYHIA3d+NAF3SEZWh+JC1v8DLBvGekhHozjvTKFTxEx/VTxVXjlG8x0dTSsUo0CuR8aLsW9jfj7aMFtE9cDrS4GfPAxfB4oWma9YlFGTX2Lv/bRK5Eb+nh9wkRl4f5RBUSAB7Eo7hQu/Ng3yfYy1CC3mrJsKzvlIa4yB6E80Prezs9eD3E65NSgPDITl15ZvGYsc5Hz2OXkmLpzikgAA6fdFBCl3xXfRoSAY9WbVUKlB0bcNuzQOBGyZvmk31qVlM3QPqpomspylpQXyxOk98Ba8hwA9lYTDxpejsip9dv4/e2jonKTRQstWfwIRlNB8PFHOaqPBXcPibI8ygQhWF8LAUiQ2AuJsiWdkfJ19W4umWYXxdv+zTZFJsOkf0JXFkFX0GGsUoET0BKi3fSqCqsea4LtH7/Gf2PQgBHs9eNxys/WyKGSapvbzs3+08moXOXnXulEQMcJBV6Pj3sDN4O3DPd8b3SwcZzzF7ySirhCv/DISmRZJx7ahmTN2MH9pj7xGdojHCNMfM615qrS8L0xkAiLmeLEwDLbWQlDff7vPCp/nJOOlynMLNPGoYouFP5SctDfkOHW/tVt0LPGs/Dy0l5P3ecZGGnZAAtb7xJnuN+8sCx8KDAkZg5tDsYC//W7b4Q7jVU7lfGS19onTPZsdpibWsz26Eo/HgaVDlpLhJ5qQAAEzbfgQX2q5UCzPu9w/pEpn6gyutX+UrbOdwk2G4rgZ+qvjQWlAkdhnOB7vPwF6nTysbuYMqfTfnE1kbl/5ErBDnv1AeEh9Lm25nuuTMXRNfJ2Y7wefNVZXspqu1NaTe0y23xDusY4J8R7fgAqn8uK26z9jWPGLhlFtfP4iUUGM/UkqXI3Zezx69pZleBoDlZYgFYMWb7d7W6ePB4VguFrgtPTEUHI0LRJCTJHQ6TUTwydOUBOuOxA3aviSvE+c8g9YbqxOcwR4Q/cSYsGHPcL2C3DgLp1oUf6VANDO8HDfg93CC0R3XXu8j5qAPg9+hcmxnu7awX/w77qLA4hZ4YaxdpvIJkZt6ojwKNyxuxG4wsZCBbj/L4TKBSdfK4Db/t9hIdcfQvN0MGQJbvg4sKrdhzvPvhsKbpAzjWptVqw2tvMUG9I+K1Yf9R1dp3vmuMp0uEf+QdiDwYzKUf1uOr4R02ffugrl64vS6udi43yc1FjW0Wzq6zfKP5QGlfL4GvQGGOrEsGFLuzldBhqaFXgNwjK6xAxouIAX5+Ks+A/NPicUBv+ehPjUow8HS3mEy3BM/+HWn63qtib4BoeN48SZx5uZvGTuZKrAqxJG95hYgGSRdqGCLNDec7CNxkQiJ6RxLCQ4LbZTnu7aqzX7n//9LuFBGk5YVvK21obapfj0yzlRuFSehzv3jvB9BS7o1fAOACg7CG7s1krcxv6TmmVu0xnr/Cl89GYzprQD1Tq0GwD34ZQqPGiQmaUDTeJhVuAHZx/Ho/GPYIIZWJvVqgi56qDCDCv3OS4lU8asgCUgv9YQBHa4m0Y2HxSZACF2QId+v1SOHOIlUEEdDUuT5ksQkjMc/WCRj2nWFywqRrjfgHzDHpBNGk82/jiEOdne67qODri6xHVWzIjWPWOfBU6KICVv8d7i3sMN6dOUAk18WiipNZfnuhGPI1Dfyul2sFe2sMjvhu3Gb/nnq2yFsmMaliQ3BfueZ8xfROwdAKC98MJiXBYbVAyDsh4JF/qKqmYrUW/TbNjOIyzv5qjPPv3Bjf+SwdtDZGGFIPF1N45ubCFJ3cBdsNJAbD9J0fdi/bkk6l84qEzFJi4J/P1NSGgJ882MpFqQAOaukqq4rp/EzeZVnK1n2bXPLhomhBYhp9beY8lLROmuY4+ha75Jk7EbZrhjmaYexZXrtVvO7bxCVy0X7vJDkeOhOSftgYJE4ubPhs4Gy3mqx5sBHgmkDPcI2ZRe+7GU7NFsVTUwmG/2dBorQHZwyxzHm1krAxw+h/+xeYLW5FpJH548AEe4ohM0iPlGWXpbChfyWc015v3iGPDaayjzsIl/5JfLQTyfspDkENCoOA3BSLq7UPQvTy4Eq5gzwTOfq5IqAQlEotHY6E0RCXuLdv13ol9aeFS3hdmb5cMNfz4t1InPyN5gPCYpPdQNfNh8S8b5ToM8wHCOknq6nEFEtg3uHUzUb8y/OT1vRviAC5PMcuFvpTYt+V4C0TpZH2XVsR/BT6Dobg0SxRGVrUvfwtZsnhL2q/EfADJjkbMVYrA80bQTCsR2M6Fd2LvY32yHZzeORluw3s/YZ+jc0KBCwLP/9UqBOyw36fNAnefGHz8HGxJD/knIIbdAbn3ksowlE2hapstXK/0kALTg89iceRbaEGxPXYIy8zqn5sNtNkj8gYfaE3TLi2aP0D/E1p1Vjp7YxwlMneP+nrSAdbuFc2JsCV3WdQ+SMVm1LfTCG/yFhsNmd1AgixfVQJ00GwPkR90+MtmlT79jDstvc7pS3zd1q+w7J5sjMPySflLdClcri86990e6RhMzloSwn2reV9KyJLlt9zZb1B8zWGT9zrqHMARn3/PBr2mdL6jxwm0xHFZxyOMB/q1L4H3jTkKALPESY8hvqSlHERayLKiOnW5ryO1A06C2nshu09tQphCfyX4B/wRdiMfQDE9yw4BRwoyswkI09ydeFjQhD84ZQMgQatj+kXuRgcY7FvGwg3gO0vhcr+O4ucJktP/0p0fTwQTVYtWiXHlNJYpR4K9GFpvxu+qqwYswD0FDGPBy7byQqAWHkEDvKS6uWSln5bW/ZeYVCPZECOZHiHkb4Q95uVrlKAdgSiDRMw7JoXFWicVGlpMVel9W2GwCv9esi98BjyFaj8G6ZYOb1AB7pokSjBig+lRheEtv48YQj6QUujPSVL5JdJn/31jHPrsOBkQ0sTX15eqTwQs4Qhhb/ZN79V4gq274dzTMxFUv7JFgEPBhjcGYvIqPz5+cSCNFPkte14c3czhA0JMdq+VMix2V2KjoklUCYwCAHpAe4M49FFC3Rhf8It1tMpm2+QiZqRPtLpkq8fl14bVk+cQMkbNa6o7bDdh6FjYHl21mgnbnDewzBMKoBkoyDj6d+ytbd23nsQbZhMXzufZKCqcsQOCMJIIKYyTVjBq6p+1BwFb+c3lh90qP3uh8YvL4JTSwLLWXw3NXzCtBiEf9LGaZ0mam2UBKqjzE4Ka6gdZNOOozAB6JcVKUDgKUDKvgxwInSt1Afab36mVhIHWqaJX3NLq8D0ncr4uaHDpr+TYHsg/ccZg9fqc2NlGeKumWLSd5eEBDxhimvpD+binbyad83j8efX5AUCI7SeylBsHK9+Kinf6LVhnjPYmw35VnkeOmzD7I68wCcgUxwI/zQbeCAOTlTvXOP8lTr7D4rY6XeacjjW87j5PJpl6xAEMLdyWFVjEDc2CwjwAl47YZ2QCs99xPRnOHwF1V7ea97sXeHI9iTqAFGaa+Hkxz78I1GaqUC1Ek+mKLoK45wZWUe66iBQ78Wobu+DiZiPwdOGBoM+kSbS9gd/4I860Y/qFfkK/r+cy+YdRGwOWtWCNGXHVq7/X99RNBqw7NJ9DYlNgVENWjKilljgDFOAg7J7Wnv5IcJS182E6Nvqk/BMEUcIeHSONI+MTcfdsevrP8ZkUf6yh7zlXLIoXhd8R8VO72QF694TqS+Q+ssOJ4SgcWwymwhuwUmpAhLkMUN//VT0Y7yPTlTsL0SWwRjyAys5/I+D3BdMyoFyYG2FwKkMe5qhWpEux+gtsLiQhKjwQR3x36zPPBhTiOIjWA/KWSEg0iQqZpPiyhSTunGO7zpiE9lPs5p/SFgr7J1Xn1u/YAin0o9fh+V+V4e043m+VU+LZolf9N5JwbHe3mrydvgplIhFDl4nIXnicPkLUtt5G/7vbUyd5YEjKBwFI9wSrs0vy1+3Lu+c4KZmxFIh4DvpjiM5LEoPFPC8L9wuBhQF9yNhFqgXifgDV4+OOOLm0spE9nrCbh1jiDyPQNlUxBVZwKIWUzCvxSdy0WO2HFK2cnGxShMQuarBymg5sYlxV5RZchDW8WSLWdY8SNPNoixaEgb39wdGC9QBRbagQYc2FgN7MzgmdfHfD+N1A6EcDMV6MeBYmmj+bvmsln1dKI/qLpncrJ3fg5uHyCliSRZlWVOhZuOIPl466XmlFakHiyYYU+8abma+a35eXDj50JXdb48Je+9aooXoIm9pNK6NX+xSjsjSHe4a3gOh5Fh+3Hfnj53RQVIZWMqbbWSe+xJ6h/k/6uoA7wTTjL/6yw0SS7PGIgmagcipIKo0kE7/N/eb3IVjbTdgt9HnojrwQnqTlZezWcOrKQpTKrb8KG+UN1+s4jUoasaTmx1uyI7IJ97rqV17qKwcgqzopt4GT+bLr6itxQ+4Vo5ugc29w4bmHlkZQgJ7QHlj6Nt3QLpoyA7ICZwkSQhtB5wDLLCtk4qDApY58nu/L8hj/VJ4bS2Z0+0xrL9SBOQ36Fn0TGIGZ6XjwHqx0AbnmCBjzaqSG6p9RaAl4aq0Mz/L/K1IgQBNfJHFmgl0k7mix3QehjrJZ6CfxPFxTQxnwEnL4jJUYqcHSjFjzuEY/5rUzjSmQA+P74AFwxhfdwPoubyOte+HqJ0STVy56A+Dqc/7mTpnuOgQPW+bH+Z8Fcy4Ef3evswkqYSW5uTfP/VJcgn3E1Z8bCqcs8cIuvWelJI+yozVVWIQ/f1gAhCDFH9IAGhWhpLe72dZ3fwk+ucZFab2nhCUHwSaU9X64CPooFOcGSNzsIPnw+zfUczUOyrU3vlbn8IH5GjQxJLKpAVxr02pUM9dHDVy7DE/wm2KDdT0dKEO1zLtoy5SGd84aHsYqhtFeTYLXgjdkZsNT/1idGe8Y8myTxbXezbbWbcfn5gjw3w6b5BzJ6QfkjZyz6Ovgnw56F9s5Lo+kJu4g7bX5G6M/qi3jiNUGddHb8tD/B16m1FrYT06HUYm9p0ePjACh/k4egfsfdOW2U5PXwZ00X5CycpcAeCAp5wb1Lvj+6Abc7f6B8Ex0rDToYXpXOHD87dDdwzXV1I/sCZNx54HusS9aWM1KXhCEQ2xWgzxDCqEJKCic5dIFXRMTBeULY+CifbbckQ6qY9rj6vDecig0fBcxPVMB3dDXojYdbnlqsKtxfyy/kS9y0Vv2gr2LQ3fYNNKtX3embii92oJN0quKTt+7RuUrrxte/1prYCHYfgllOx3a18tt/MHBXgW7ItCC+9jgOopUN17guqOwi+FW4JCQgP6sYhP2cWtUjtBBo9tb1xX5SVI16Gz2J5kj6J5HYCjT1m+HvnkNQ4uJmEdizissFq4PMYr+JLC0MDUEBnhfXivVAywVW8mAngTTqQL9hwABGaM+bGcsFkVCIy695IkjV2qebJVLI4x6KIjaYSJ9a0oDXjmyFqSN7ehGpqb+qX3NMT5hxsLzA7/3PR5eVXAn6zJasFTXmQ7uA8xyixXF9mrC2S7r1fgb0OI39Djq9VVze62MNKjk5SMeIfBQM9TIoFK0TMeyieBCWdME8TaRDUp9QHJg2ehMkqG5ttF6Q2uleE5rwoxphAGvk5w309t1WekU0Gd+MDtTNuBmQunts/sqsAzfxe8xHQIWzOfVqOhgtN/cOAyIWgO8lYSEVE/TzK3iOnKtC5/GEVXNceRLsMMifQlfPizWY8iW1RVt5nq3l6ufJgAaG8TnIFjE4H5VCUyf/HQyoYz1TjR/hitiJnYRDl6U/qKPQaRJWhapy7Ix8F6+o3ZX6NM+dx4Uv0G80oIPxNnspAMmOyCIIcGn28tk5jckS9kUjAinti3NRtnKM49+m7UpVguGm5oYQkgdTVWElsoTH5wwZ5zw0HykgR4CQMbBd5GTPVmG6/+qggA0GwSswAAqJ6wuV9+0CUT9CEOaYJL0xGXy4bgOaepNm5jYpKq8RxEIlK7Hfpva3mdcbABqQWRkWbw/eD7sNM2nMqKooGdvuvUoIGW6+USEZszTwfZ9aerM/gLtrqHl7rFC6qzgVuuyCBq6elI0JqK25IpxRQLu/PIziw8eYYsLAlzGlmfWcfIHap+HIFdO3PicALnXUxYICk2BCs6fTgbKtpbv1poy+pJX+fbo0KFWcDh3gltIuStSiwROja2P9DMMsFQvHW60IdL1sa+RhBRzlB6dKvTDulvhGsIsZjhFKcuMsIZNbHQ0BPojoHf32Ysyl1oLdj2cXT86xA8hmXv+ZJvtfyJs97gi5AKV3ZCYct6pVhXRqkdNExdRKpRlKzqlggFUu4gFphvj+rc5QeCpt1nFCmu+cP9Ni38zgWdEZwMfIHvXZ2iN1jpurid4sam8ETEE0NgAe/fjpwzimCR23pSpaTn5JpTYeh+VOcpis+Zkwi8c/jcZyZs7UjZVSC45AGaOnU01tZUsLYZnqoHjKmk7TnqbilBWGFFzn8EirODptk8AAAAAsoM7+mCJvCqmMG6DnQffefkvyfiUnEzIkd0flSprbSldq0qDESwks97u0ASsyuO2+IyCD0g6gEpT4yhlLzw10bERboRwXJQJctbIyT4LUhAnWO6CX8QnQPuliLgc0Wt+tlnebS8przQfxCMUBkK8mrMqb2WOv2zn6yC9Uq1vAebmMbn5+FYi5KrxvgjXAiKlohyyMi9QvKIaHLytVITcjPTsbHLuaUKPH6LbLx4xSSZfcVeqy/OOdQ4fZbsVoMvC3FWlDr2GNnUF9BO5UB/B1wd5HFX7I6cXGDPfHwkfLB44J1cnDMhSYD8WLxqihNsqj63XtICulJC/5VEKbW2UYS8DIEmQ5OTjksHWcPU5aac+MzH3Qaer3VvfYBundjSVc4Yqg6IlZkFYmgiYd7NgOJLT7DpSzOaeU39P7U32PucKNB/7ksfW1OihllBVjvDKU/MaTv+VYeviHISK8VPXiENKYCkVossK0tDoxAWY26a3k2sojmTnP2cuze2LvSWNf/hPK6IvAHX69JnBvf7m9rpJ3tAAE6DCgGy+H56w8eewBV7p3TOJj1geCF2n8KwKxmtjLmVFY8LxpXSYIkVW8C2VgGFDdfsfEyEPyZ0m1Yr0lp8lAqGlxCir/2RaDSGaOBIMzZDUbVu8VGTwP9Wqm4iJhIQvpwa87i+Oe0nGT1//IsWdaOO6jBuw4mCX2T/RrWkAAFoOlxNyl/ZRnl/fJEPATz0ctxdnk7w1rIZtURMjnC2dwHeFwHZJL0u7ftMs/01XFR8NCTKvrWxcae/OTDLQAKavMc3dl8iXCGs5Tw/XHOwFBxI97RogXnwFX3L1G/gOSJN5R8ttDoc48GIr5eDUAdqd4kgIE8W52XkOpfd/Gm6KCkiGEIofgFFWKsoWfNFyvLfLVc/nS+r3GFqA/srSTnVHgWKfblbOgnChRnuKAUgk+dy/V96+jeKotdmvSGY9lB6qfdx4CAXPB1ZpnNNNtznzfhoqF4fInzqX7zmi7OmaVLmLa6DFmY+hsxkSYjBO6ZbpnUcoyd2JtgYFLDweZCuPLWqDlpc1eid21rJqGmmzYiXwb0wZr6AdBfU0Oaqwa7e9IcPiKCvLEIR6JxomuyUXg6TEAIAd1JgtT1DH3WbjoDfLzmyuh/MqOVyK3MHHt2iWmu3JzH6KOq0lVETGjOrF+polVqDFp81i2WpGparLquLmBKB6kRR5u6JCZtlYJpQiSx2WJrrI56rfpEb50NNqH7r5/jmwk5emuBVkdCs+hQw3++W1MOECELXWf0MzFAc6K+EjmmyE5McL4wCB42iLCJK9BWWhc2l6Wg17lgXlXSpmNXNWU1brtlfOqI22GV0AdXo+/g+DvWFi5z9PIVS5gO71tBAjNrbjrhtpXPgdMoSkvyy1ERfJKGdcgMMWeQXjYns5B/CcnWDmobPwQtB4PTg8zRhR+xlBqLuJHk9PNVHT21SmQllMPZ4l4gmcAFYWEOi0a5RyZr9Ulh1hqt3yqNFeEZtDNKDyKdgIkKhvbQa1pETB9qGLIyd+c9ftL7R5Ut7Oae0PN7fB0yMDr4PXuFSnRGAwk/FvU1dwEs6WmDojcAbZjIAeQCz0rcnPE3XZo8N5L2JehxQMDueSPvTE7PGWwZF6yQ9b/6PzV4TIn4oImOcC54Eq+yO5bbH+5gds2hiCgZXjmZSNa3hyZMV8ISWGkKMVM8jzOTSUBLG85Tss5bK/lnsG5Pphqd7ui9ogjN7b4yTvor1dOT7ILAfLGrP7HWaeTzEVI+MbhfmgSAAA8FS3Z1G09fJcS0SznbpD2z3Sbl+yo4S/IOUAFq7WT8zOs3BXMl9X2OajsqkJir7NCIWyJfw6EI6KunU+BiA3q1iRK0M/KWQhmgyKPdP7igKmWJ40pY0yAU7YohMurODufUviZz0BePk4LsFOgxb0SgKzOy1p0hX339MnFP9TiX/Coaj8eN+uckiE7FqF69acZR599iRwTFeE9UqEWZo/LDGeSGRt3ZAaW0uEBZpuT3iTCM8jGvCXRRA0QWdFI3EanbJpR+H6o8lvqJ63OEjBiTUQF5+yd6avk9t5T6C43Lvp5DQ27rVo8w02mwD+VxSMQ2nVGsO+rnSO/aPgSdRw2ckMp0dElX3iSrcOgjTa+Gxqt1QFaNYXwfWGuV2yYVvOdi2svZUtf/zmJ0uI2X2VzDC9zzTES4f0ZqsWEQdGoovJr2yrSiMXfy6CVnxZdDe4lEm+sSPrqT20MQuid6cIO+XZC7AUkagBwLsLYZvSkOdIdO9DGWH1++fZFLzaWsoDzXaW9rUop7HqFtFlVz6idlTD0UcftV1jCFybrFc0Py4fUuW0wm1f6LEHrmx9w6j4+AblkMR1dr89cK/HWySymJuaqk8qdum5J2Lkft5+bGS91XN9SabgzJfVRihlCfzKmpPrnbOv2S5fVm/GYFqtPx97vLJfSMzIz+3GNmFyKyZ1DiBcgAABJmJZ/SmJykXnnriPxpKB/igrc7FMTf3EFkFwRD/UXUjDSOeX6SotlNs6A9IANqVuQvU3JP4NWmdYjgUlkiE6tZcrNmOLr6n+dU5XWU7bLQY1IdusGqvEf4uOGj7bsI3ymc75jHDCjsOrc04sjC2mWsk7tBDenDUjBsMDsUofdmATsI4Sr1pziN4ZuZJkoqz0mQ7hI9ucNJRslynMWeRUvHy/FQV5ax5paqhwMUCBfly7XNol/0RDqWdbr0H4VfWSSzg3kyjvzrkvDhUkYag+lnui8rbNoMmZpoFjdDbNbzm4Q86SWtClRNjwffpAOzGshBgQPcgVfrIUPb0hLMRXZyhEqyuoyNqEAplMeM+p6DXqPFoRwi/nwqRwl3scKteu7/0I4AkuqzWn8fa9JLKyWB1a5Z9SsSjakx83jRkE8+9wF3eRtt3HHKS/rdwVscZT2OG2LeUvc6qyr1HAYqhIjVfaugVT+vfJfiq51in3p35+/eFomT9PIeHli1x7u/ecxUkTR/GQEHCvQpJfzh8Hziq5V+6iaDctUDVNsc8eKyzhA6lgBSkQTzUXoqQRsro5IshQI7tFKd/oIXz50YaSg62lPB65ElBcHhtO2ttfYSlio3ItCqD/iaqQZ03u1ttkq/86tmQaL5o8MnAAACdUXc7hj0zZLJG1ZZWAmcmHK2CkqBLmiCRfbAVDACMtV0uepMHdKEfrnapzSkG/KJr7wnINhqfYJeaXsZ3M++1E4jxaGQDn2S38hsiYwFBzxPrHFs86Dfw5uNdqR733VjMaWrdLNGLxXU+MmPz5adXZtYgwf0++yII/+aZt667goYCGnbKWWf4Tv0/1lcuK7zi/5cf7HLdaC4556aSJ9w5CiKSIULQAEia+eElA2YdhkJ5r30xn3YkuESy2TYZULFowdsv1gxotCeWMuknCok8LCSgwc/fwVz2T9IdpFQUbv41gaw1C8BkipdxhCp24korGDm6YCw2B5oXK/ilzRdZ8MXRGn0dC5f0O5hyyoZSrqQMYsF23o68j+hv3ls0f3vdGXUwVytZRzjpm7WZaV2KHv4jd6gPf1VTe7Bi/2wR0zMRvgfl9KtWGvno4TrH+im8qC3qSQzPYUtgMCKfkBb7v6LV1u4eA2N1KZcSRipCB6LWIza8li/JFyc+gF7qR4oHeDNkFKCG1cRTYcInvslITnsJfQ2qBkMmNU8dISMEQ9mWnKG0riM71WUE1aZ48f563PndnuipDYLoSlIfplMBIQckQLoAa37LxLnHui56R6jdTrQRIt2obQMC+xpTuyBdZ5rWDPrKvSpseFZP0iqDzUqpLvNA9a0JbFs5Skyy+aSAVeeAwsMoPz4Jg3ZTn2PZGFKQIum8Tk+8f56L2+yxVNEbC0YSaJgQcDuFdz0FIl/eE++Qdq5PDYYEcN6MtMURrCE8tcSAZbCkigkDB2Q/Y+ehXpW8Ktjn2VODkwNEV6nIcht4sg8bvC3QSou0VPUYkoB299YUBHh/2rRp3v9/YnpBXBbCkJyKpW+POgs2YjvK/agqvNtWLxzt9On5ZjPVtM2IJ+teCfzx2v0vVUgRl5jHHjnIMj15E/l4mA1AeNOPVvQX1YEvkdopzy+05j4PLgdPbWSmETqlt75SgoexNTt0duuyskKqW+cKwUBhSPZ4n3/q14PlKuQNM7xGXPY+9wl9PHCgcLrmjLUV0ddYoMx0JsxKe9+uJYAOoi2C464gIx2iOyYw3DRkeMeN0Xrn9IRMDdKH+DwMsUAKyYBkJK3RWxTqmRsGPxy7ydhQ1F2ZQZmQVSlX7WSsKhqo/vOWEtyO+Yf408AHlbn97oSQMHDZMsyuvKpXqhdPKrxX9sWhH4wQsuEKsbgSwaOwO7KRCOa4cRMe7nFAN/jFh7Vz1CO/7nAAAARs96dGYlgPbtx5QDHBPCRfsuN8zBKaSt+SaMdOzAl+AGs1EJmZF4o3zFyfjH9GGQKaNUipKjEM5cZVotMmOcKOe82zZ5gzdfaOOre2+wZwmYtT24eME2G5tXzVFV+dqU8zFeT0TspafSN0ru5UH481OVrfC+c6SWkZWyvF68zuuTepCu5bB4TsY3NF12Ua/OHm/RFV4mI94ote2bXR28AFcDDfmbPfHz2AikcnU7vpv2CdqEEbnW5y7HKmeMUDUM8IFT5yfbr+kbteY9+N0rRdsV5fX80W5idH3X6ZDk0FpZ8CFlx4PjmIb/tEQBsZp43qHrZtlEyuEQU5jCmxAXq0+jpTYZUJJlSY8/kuMtC/f0q5cZ9HnI0g7qCCDQ+u/ze7kRILy5UFnirY/BIrNoFfRPFU1H0lX7jo3vGCpTWfdRW8WnC/b5dUTKLe/IM3K3ZenoqitMzxPJ6N16PDqNv4/aEovuHxTuYVa2FLPjkP+YvgJwfnvDgACJA1YheA1XhfUCWdMRlKFUJJyPCfLPaygzcLif4lguzyxXtVKMDhtRZOLjgvd/2mcL4Y7a3xcDN/yzksS2AwDbWdOSwGxct0nFpwG6SjFXP8c/8fhN3WWXA0/4X7puUhv+nfX36jn1Q3XK8KYaZ2XnngaiUoFwjTlygxZbKxNzpD6689mv3yPDxOBV+zZDkcE63egNBnzcjPkYpRAOHadP5NcrhdgPydvBNY1F1bTAdywPicK7WCFKiBTjEJrQ7+ZmcfHC3MCDtehK0v36spNoRsknWkv4oHqEEAPZ3VOHkiTU2/fRLFTIIJLPBKwJfT7ZV3yhg+RxRMSd8mL7VsTF84QQ/c0J3OLWX7CPZFJndpB+s9ew4aobI9KvumeSvC8FSrWrcj1DO3wj3gr3B6H3uRMVrXRXdfi5Cjha2v1onBflQEG6EAAACr4QhORiL3aPs8udOHkt8nVtOcmVK2mGosL8fdX5sG0wG3Xdq+YgsyOv/52Tms73ycWIKY8Cqr+prCJA5tZPmHWJ0+J92YhCX6SUutlRqsQaA0DFgIvLy0fe106FbdAcUQkpn7VCXr8ukGkzLZVtt4C4mvmyFTGURh+Pq6yetHYeHgOUax5saHNv3MXCdm0K8C0ntYIKhMV0n/dXCCWoOcR2Jndd+wzVbn4HimMIepLwRyNVkTOdOYvODA1dPkKobtgu9fGo7QbpjqRfruTEWghsE1uu0qM8i7TagKT8/8KOG/Klg1C+sjn4N99C3th92v0I+F8ZhxDyK7ovtczHVQSEGSCmmyv1ol9d4urDbnk1Hxl/2my5ok9JpMYT08zvdOYSu44i/Fr0uNStxOqCb1pKok4Avr00EHdhZN20mKHyAdimiriKZC7ZuY2RVrdK0pxy98VzhtV4tRzPUwD3kSEW/nLq0z4/oypSbtMC0sZRlnwcxHcMmHo55gAABK+s73C/THveYm9EunU2JmEd3WnUdXv2C6maSw0j2BM9/2spVUAjW8OZdoR48xsRr64s9RI007lwvyILby+b9x4NozmQzIZCrnzTs4vBe989gMY2XjPP0bBZBqbxNqbYBdI5g/C+Bfdci8WmJxbyrqxeGNUXjJ1OhwR2fZVmZH94FPszDz/DvIrwOlKxNKbReBoBcQXb8xfibwz6wxcVwL+bhLSElv2zJYeDlBK1pd7U0a++Td3QUcEHVU6ZkYTujiUEIQDzLJpLdlqLKCLxWtJF3YMGJyIvodtgFOEpykbF2aC5VRSQU9DAHoOF9Tpzr8ZipB22pfMafFZpkCvC6W/vvYybFjJRTCVku0EhTJvG+X5MGQ8ui8E7x+kagEhiSQK3gRTEOu3O57yANH9KZfTB0qvH34vAXbHlYE/+kHmwGuBdZb4h5AUGgXAAgAAAAAAAAAAAAA=",
  jaguar: "data:image/webp;base64,UklGRhZdAABXRUJQVlA4WAoAAAAQAAAAjwEAVwIAQUxQSIkQAAARf2AgbdvUHOzZIyJSfgfrgD9o2xY3jv7vboElGap6YHGgFGaPsoxjhTnWMq+8DAF5X2Z5mdd6mV/pZUykZQjIyxyNl1nlCWNXTLKo7z/Gaj1PP9f99MsV0f8JoP+d/V1xJPskW/CrMRjuJ9t/FZdrg7n5fgdC9l0PMnNarg4z881nAMjdxydOytU7gZsTxl3Q411n5Nrahb23xMz6pQGLt7EbcythUO4zPsu3Moo/4hhT6HPAtFxLAfi2Mwz5xICDpuQqBGFOmZD7DAduO3LRIFD7sljoCvdy8DIJ3gnEvOyE7MI+j/lqyTbG4Dv2h+odPo87LdnaONx+Woje7vPYSclqYzG/KjR/5PPYTZI8p4B/xwnHx1hhSTQaKOCbYyEoPOCrOCxbRwXfdrq23ICVHpJtTQl7VwZznbEWH2C1MxbC/KoRe570y7/2lbf++q995rp9z3vMiGyPFU/JVlHFNyVPeMqDQx7p+e23XryfiPIDVtwk2fPKuHXayf/wcx67fdN7L3mIVZeEc/vKDJwSjjo4UtJ9FEdCuoXIkIfRdqSjLooyib+B4ir51lCc4ohXA9Ek+QsgShZAQwyzNrCDIWMDWxjiNrACoU42uAChaAWuj2DOCqiLYNYONhFM2cExBHE7qABokh0uAFi2BOqbV7SFrnmztvBd89K2sGJc6ym2sGhc9VeiQp2sYWDavDVQz7TJyJCKDAftYWBa07GFAhs/aQs182ZsYcu8ki0MzGvH7CDHABN2UIkMGwgOOlawg+BVCSsYIiiRDWZ9BHUrWGKIp9lAA8M5NrCB4ZAN9DCULSDHGJt75auB4JR8Gygm5eugmIkMJfGyPoryHumWGGV1r3Sfh9Em6ddh8IR0PRwz0g1wHIoMRemGOJrCLTLOlnAFJHtlqwDhRGTIyLaKJCXbJpJJ2baQHJZtJzL0kRRl20FSkm2AZF62LpKSaM52VNjbiwruMCrQIDIMkSyLlmOk1chQ+k8hGvxnRDEyHJatj2RGtg6SjGz9yLCNJBEZ4rJtWF3tMifAGpAWBf2Vc2Ro8E2PHbUKpBrgwh9xUwb3HvZevne3CpDSiJP+0ef2Y2SgnM/cevouBSCzu/3ygPn2JEn5Tp/Z++v9RJQDMnXCBT/2mW90SM7nPcDM7etie2iAI+Nenv3UkNl7WYwkzf0TM/Mv7j8LyAfvrz7IzN/aR9L+kc/M7Pk4dr3jqSTwBV9luN51Dsn8yz0wHzqTxC4MoNQdEvykH/owWs+JkeyvHaJ4YpykXwXRJPmXQBy1AHeIYcoCqI8hYwM7EJpkg8chlKxgEcIhG3D3DBFMnvqC08S76yYInr8cF+8Yg5wmgQtfvyXwT1Hc8e1v3vrNW2+55ZZbvvnNb90ak6HCkH/xU89vD5mZ297P/9qRwf3T993/oT//sxc/+clPfuo7/+TPvuab17ruT54cy558/r7ck5/85CfvO4UEdSnwaz9p3CxZ445pcXv4vGFlskd3aNaURdCWUV7cJmpGLZNN5ow62ypoy6Am2WXBoHnLoI45yZMsY8mYMtlmdmhIc8I66OOGHCIL7ZiRtJEVI6pkpR0D2kk7WTTgAFnqPaG7lmw1F7oZa6GdsJXs5fNhu9ZeFsOWspeVsGXsZT0ybIYt/Z9fW2GbsJftsMWiQsuxl82QtSMDJ+2lG7YJe+mFLfafX/2wpSLDnL30wlaKDOXIMBsZZiLDIXvph+2wvQzCNhsZ6tZy8jAqfCYybHPo05ay6IevHrMSt8sGXmMln2cjkxZS8M0oWkiHDd0Xsww3z6ZeQ5aZ/54xfGbMLj7mm9N07KLHBmesYpFNrmYtwv2yUfxsxx4KbHY5bg+bhvF1ji18wTetSpaYHbLxGccOPsbme5NW4PQBcMoKGoywHLMA9/sQuGoBCwxyQr5VFEfl66IoibfAKL2UdKswuOgKt4HDO1e4AQ7OyFZhoLOiOR0kXkKytzPUSck6WJqCNRjshFxbaFJi5Qdo5sXaYbRNR6g8440LdRxQSqgdQFWZsj6gpkwLjDgt0p2QZkXqQmo6AuV8SJyIybPImA+RvDVQywKtgOKkPBuoDsrTR9UUZ5Fhn+oI08H172lZsj4unpSlxsCLsmwhq4uS85FxUhDnewz9gBzZAmOvy7GwBM5LipH/DjieEoM66J4jRoHRNx0pvgOPHytFD9/vCZHz8XFChgYLeI4MfQmqIuRYwqYjQUUEnpbguAxzEnRlmBcgxzI2BfiOEJzEN5RiykG3wFL+XhxdQwxOoduU46oYuJ4cU4Td9eWY34ttieVsPwXbhiDer2PrCcJFaDmW9I44skVROIXsC7LMIhvI8pwkLncoy+1pXIssa4twH4sMm8LwW3BtSVOElfWlaSVQNVhaL+bGMB2TZ8KNYzouDqcJdE+eZVDuQJ4yqAWWt34SplWBvDMwdQTiWUw9iUqQCizxPKSKSNXTEG2IxNOIujLNA8pxVKgIVY/haQjlvRbPilTvwbMjFE/AybPURTgVsebgFMSqXoCmJlbrfDQNsbwXoNkSi5/mgBnK9dY4ljzLfbuDpSJYm7CuCMZxLBuSJbB0JZuA4g4lm3SQLLDkhwlpRbTmE6ICz0WGg0hWZJt1gGzJViSgHdnqSAaylYFkfdlKQBZY9rKLY0m4VhZHQzrCuSacF3MiAqcTMHrS3eCAWPhNXzo+AOIYy9+OYdiwAD6KoWcDrTiCClthEkHHDjIAFtkOSwDWLcGLmdexBE4aV2BbLBnXsIaqcevWwEnTtuxhyjDXt4dXG7bE9lg3rGYRbcNWI8PWfzl0LGI5MjQjQztr1pZFLBfMWreIEpm9ahHzhtUs4ohhSxZxyLCsbw8Zw2hoD3HTutZQJ9M3rGHOuFVrSBqX8y2hSub3LeEogM/bgRcH4Pat4CghXLQBLw6BOvK1ziCMCwPx0oRy0RfuWsL5Dtn+JgaE3inZ9Q5B/aVekOYAnvfuQYDnEtr8T0f9bmIbXpVe883dWtcRXverDzPzLz58uUPH4c27RCef8slLTj9lH0HOvuhFL4oTER2DN0NS1uBlxFiENyFGFl48KniOGK4Prkly9sG1HTl64JokZx9c1ZGjC65Icm6BW3bk+C64VkyOz4MrkZxL4FKC5PrYMoLQGrYjkeGwJAvYJiXJQ2s6klSgVUnSPLSSKDloZVFcH1lVlFxkOMbQ45JsY8tIMsB2VJAsY68LQl1sTUGyPra2I8fnGXxajuORYRPdnBw9dEUxXB9dXYwFRt+OSXEMHk9KcRxf/UlCdPGx54jg+gLwhAhZlnBKhAURZkVoiFASYV2E9hWOAB0RmP96P76uENw+C53rS8H8Ow62HAt6cxxaTRJuTyBbEYXbZ0UF5rMig3cFrA1pmK9G1ZGHzwK1IZB3FqYdgZhTkaE9gWggEjdjeFxfJv6IA4ek4ufAccXidGRoOVGBb4wMPIkly4K341DykvGroORE41RkqDpRgQ8CKQjXcnDkheODkcFLwMj6wvE8jAKLn4gM83bV9jVwAkROiLm/0zELwvVlyNALBupaDgYayjBN9Jr7lfFBEDsypIgo94iyloNhS4YkEdFJQ1U8hWFDhBbtesFAVRnDigjF3WhVFU9Y0/SIbFfVUQg1EVIjaMFX1HYQ5ERIjKLfV8STCFxfgCIFvU9RCQH1BSgFKijyYgjuFKDlBKGuGj6IoCHADAWuKFpGsCgNddVwHEBOnIqiSQDUw5cZw+2qKSHYxhcbg5bUeDEANXh1GrujhDMAFuEdHG9RzTwAd4AuMR71lNQB0F3giqTwO0o4AaAAblJFXs0UAOpim1VBHSUlBB/DdkDJqpI6ggVsCSVZXwUnAFSwpZXQppIpADVs02oaSuZtJ6Mmp2QZwBo0L6GGtlV4MfNWoHFSUU0FJ82rYJtWRAMV0+Ydw5ZS1VNx2LwNbHFVmyrKljOp6pgKjhlXg+alVOV8FXHjKthiqqivImVcDRrHlXVUTNrNtLI1FTPGVbBNhemocWvQvJiyhoq6cRVonFaWV9EyrgGtHVPmDhVwzLSKNu9hDc2BNk8dDQRazl78+ovf+SAPxvjJX/zFxS94XN+gHqAVbWU60X398z41CHDdJS6dONDnqNtSkTKtFpIT10a1T6XdV7VxSt1xFdNydAOcPaKhL6luS8UMumZ81M4ozoxYM2hVxZxpq9rqNLobIBUaz1GXVzFv2pq2YoBtBY9q4wl1WV+eZoDjo7wDIyra2jF11FewjG45wNqoJo1saPN0dBTMoysHWBpVHPWoNp4OVcm0lRDR9ojUqJq+VKjqpq1pKwZZ2q1Mo1f0pTVsKGiiOxKE+rscDPCovqSGdQV1dMVYkHfdx+yf6QSo6cuEynMM29JWdYJQ9vWXnEJBG1jaZPiatiLpfFRfWsOqAs8Bd0TLmr64hnW7qOlLaFjDs2LUqkkFPMe1HdbS0BfXsIRnS9shLSsm1fCsaZvWUjNpVZ6iljVtno51ec7V8qg2ToeqToZvaZvSsqIvoWFTQRPdYS2r2ryYhh0FdXRHtKxpazsaegpK6A5pqWirk8ahgiOm7Wg7rGVBW0lDjhXOm7alLallSVtZw6JAE1pq2loaGgJNaVnUVtWwqWIWXVpLXltTQ0/FDLqkUS0NA4GmjKqGK40uZVRZw1BFDF1SS05bXV2OFbYddIe0LEKpE7oZLXltLXVLKorwJrXQwJiaill4KT1dXXV1ayoy8Kb0DHU11W0q8Bx4SS2ur6ulrqugScZvGJVjU9yhgpJ5a0ZR35QFVjiPL6bF1VZVtqoigy+uhTq6Ssq2VaTgeY6eriFZVhmDx3E9PUO+qKJE+BJGlRW9g1XO4muT3r6uupp3+EpS+IqaOrqKKrKf8llllQCu6mpq2tY1N97573mI1ZYRVHS1NG3pWh7rD4es+qgAy5o6usrj/D2rTwrQdIw6PMbbWb3nCODFjSoFyw40lEmAZcKxyRqnJShq2tR1OFCedWYkOKJpXVcx0KaOaxwIBV1zmlZ0lYLkWOcUQczpOqKpputIkM9rSVtAQ9ehIF0dryYRMpqWdGUC5FnnrAxJTfnwrGq5QoYJTTldiQDbOm4kGZKaaKgpFaCvwUugyOpK6RpoSgToajiPYPY1TenaCc22umUHx7amCV0dTfEA6+oyhHNdT8vRta6nRQH/VtmrCei2niLpbugpBqGuojIh3dQzp21BTzrQqppHJqFU9BzSlg9PQU06DiWvJ6WNhlpSgaijokhY3aGWhKNtR0siWH443nIMDPV11N2Ytg0dXiwYfXGsO+KEdlvHPOlf1FGlMbN+sPoz4gR3TcdUCLK+hqPj0Nv9ILcmCHBBx0QIaFPD5Fj0jlG/uJ4w99W1nTA01JVJ4Qs/6zPzf3wwTqA/r65OYcz6YSI6/5TXnuIQ7Kyv7JpQ0KayjBr0A2WJcBRU1UniH6uap3C6fUWzIp3VV+NNhISW1HhJkRI/UlOi0N6lpEwiLyR7KryJ8Lg7KtIyZamm4nEU4oI/3rUkdf4Wf6yrKdQf98dpxcWikwbjLFPI3zZOmuQuPDBG80DY6O/vD9J8nSMY5W763iDAHUkKf/ZPeiPKjyXZ97q5z+zmXR0jI/PveeQR/29e8tZ9JH/2jX/c/vS3XvYYMnXvnj25ONniPjI469D/1xwAVlA4IGZMAABQPwGdASqQAVgCPrlUo0wnJT+iLHepi/AXCWJu1zW309iYT1zmuhyc/VsLVRjK+O8mS5Ow+0mf5S0BcgTRn0TOdvKfGy6PrX5P/a88Lj/xVz/+Je+q/afy9Ln9U9H7o/+bbzn/UV/iemz9X794PYA86T1a/8B54HqAf/b1AP/rxNH9F/DL9ffjN82/mf9N+Jf7z/1f2v/O/BA+r68v8F3Xv5Jnz7af27/T5Uz/Lu9RcMuz5naG/WPYR/mn+M9XDwLag/lk+vj92P//7kv6+f/9l+5JpZjeqDbIawrlY5dcBfYvCFUmHPVffBgUSjYg95khH2IRD9iwFZdW4/fck08sXlAcK0jTfthwciDTfQKydvuqkw7EdfxQ6Lx9mtzkf9EnyCZIRgQIf3fVejg0Km9f+6f5LFQ7ZwgRuoRIfnud/5Q3MLFnQ0++5GtxcsEPocNwIgtHhz+GMMIeeTnrm+/jF/CXpjYPA/jj2+oLI8AfRD0SZfoCSAcoew8tcaKKUxBLSTkl8tN08sXyxKrBSoQXrT2Jpct1/xEe+wLUOx313RZy6Pr/HcXkLBrb8dKxD8Rl6mFj3VynMm5ot618MJ08sXy03TyqsiTP9oF4+YX3NQv5+za9uKPQTzDwh85eoXDNjCDcPR97RQ3uutuwjT8aOS3siYq13qLxp4USePCq03TyxfLTcJx6rFPdFVXea6EN+AE/L7fCCL/d7sqabLTTXwRMM3Uagh4CQTHceGnkYdE1BnlEJ0qz2jpXn4N4VP3TyxfLTdO9zRwoxgGYoi56BpLEcBlOv+Guf0bVEJSN2Hh9kaJMPPfUPJAdbxEshLl6t5GynDC54z6ZWACA/t7Pl+5Jp5YvlkoFWYUfLSYrUWe0sEMGRhRoEkRviSebbx+CEDKbxHEl9E/DFaXP+yNxTzfGYuGWq8jVA0qgYyyUSB07+38fWWlRnTuq3G55Ak08sXlrV0qFZBUnrXxdP0nc/JmD1ZlWphADQNsNgagjtRp9QlGR3dpA7WpxMCeum1eB1p9Iw8tSgIOYINeVtrRVbEnntNX0YfMTSzoF8tN0v2L9G/32FaRLe7McBYb4u80ILYcfVXG+JAVojgvuvnk9bKNc/mSfhH6P2REQqq0+CVnFAT6BY+De/fck08sX4TWPcKY9unzvlzLu0m0lqLNh61Vbs4xN4s8do/1Td5yb1dW5MD2oX7kmnli+Wm3s0iTv3itK4PaG4Ow1uWrxHdYM7m1STHi4Sb3WCr4Gy7BmD45ypvt77kmnli+Wm3nBu+3vwUm7VEGNEXLYFKbLQIFGvL/aGE45+ugKUs08EEnGWyz2wV9wz2meEF8tN08sXlGG0ue4fI4ByzzSM+HL6xgW2zsrD75gJEcSX6w3iOeFEun4i7JRh77ixMntbbxwhTlvOdEDgTyxfLTdPCg91TtVDIij8SNt2QPtcQITQMgdxrzqIPqrfza2y7TJvFR8f8zJgrGUPHhw7SMv8C11JsVmXttzr9hWGLt3JVpunli7IMgbunxVKPZWzQ6cTNELhN086FBMVq0WP4hKVsLlQPTVPbbkzchibbLhbVzTuhsrTqfat/VZXY0qhNgsrzoNPvuD7gQPDznyETwaJBMw4b4RAlEKJ29cCDr0UNdszfAdK2Nurft2Kogwr7kri8rd+OtdT4DIuxqOqouIdWLoPLF8tN0msQsNQ7y0ge0Eq5C0kTCGK2EcxlWOgukcfKrMljPNWALoxOUWInwiGZQX9Pgf/3NqF+5G+Pzx/0oXiL16aLwacCIbgIEQSd8SMXGvLsKTY8xbXtAhKHRQivhHUyppsiuxNdJEE0C+Wl5FyEYVqQKZBiTlp+rhIug69wco3RcLB89ROg114YzGwGhmubVrQnluMjc0eQiy5Io3TKFtmApPFjIeLAiEEtu4aaBcn5+5xBttybd/XT2K0R08l8BX+ehcfwU1GqkFZG8k8wQW2CPKEMRXjGKD1vy3xycR5/bJA7KDHHNkLMPvau608sTLQw9P/6QLM2GDi7vltqJgiUqVCdSbCgolUseWQrES67eURGq6L9nDWcxQJ2NNs4TK0hcJs+BppZX5cYr0aRC1OZSaX7katkDS4aPXy2h3eAXxM2gxdGb+n3TqCCfpsm6wkto8hN2xFQ7ySpvssRmIWpJ7CzfAYTF7cvpeUMMpDhbxV6NT4HQl79yUvWyoZL3SeKs125r8od3K4RyCgpgDlIK1Z6Z8Ow3Yi9cEK/ynCjJlg94xp8UId2oKlb0ZGDUfcRK03TyxD+BNKqiJV5Y0X80aLtKLbK8Q1zKAO8Kx+HpDV5Y/XSt3KrcwkULCFqWKdXF8fGWjL4lPb64xQf+HQisXy03TuviOGjMeCMFR1mc6PB4dYOvzCMub7Lpgfrc06szfb1evq7phl9RiJ1xPOOJNOo+WTGGbQoq/2nVI/ck08raiTuQ1AepJFB3HnmEjSVUASry+U6A2mgYMLHnH+1GHGWGbdNzmbcmuRy197LovVsfpbsCbytV4Ft0nkd1whERbDErrgYmSdARCC+RSGyCl8z5Igxmwus6CmFPmh1rpsTQnpgqyWe7zbHgRJPG2loZuq2Ay8/0rxNrTdPF3fN0GcUHJCGY5D9gWSdRWOl0e5k7yinfm224usqdCikxv6dg7bcJEz4nwXgEhWxsBNFK+gUXo5chsRg9AuZQq8k2b9yTSp+gFMXa3xrQFjkSAqawUvCMi7lKJAbMHxYYrsZcCNoXer3QTAwgoNSIZ/+j2uP5fM3EIBkJSUzl51br6ULdcOAJz8BL4dItseLkof+s6D6jJ2s6BeTdVKFzfTuarPp++tKZaFhr3qlZHy137NVWSo4UYMG6VPTGVfmQD2mgM4KsQZcJwFJ5Ro60R1L11BYfH3ndLQ66NhIU4iYm4FTLKBERZZoPR55IrGeEF8jSmfxL/rhL7UcJA/pIBp2cyiH2anHJoOWXTz/vJI7U6VgETJ30cstisueXzSwOF+GhGSiGt++ejaFizllKSVNkGG1EgnXVVQYkmAA0YyYewyoLB7MecbbpnKhzKDjMfRtR0vSD7i0GYemabsvMPtlxVSNn5CBJphWXkndO9R+M285UU9wD3LxD8xiRp0wbSwll5YoJdIMhlVdRHA6wCTmKmqqSULrMTlRel1KnD7WdAvIgLIj0V52oV7VqWmtcQ/ebbF0M1fx+Hcx7VAkpeA5VjE5s6+u3Vgt4Cyqfqf37dw0f6gkqF+4QqJVaqG54y//knPdAbbVXRNEQ4F2r1/HZmQVcmG8ZDxUslVbG5GEjlp2x5GG79BxuZH0h+OdQBPGXhD0M0w9lX8D41t14iz/7MjFizodLMuOuF437KtYs98w1Q5muWOX4rlqzGi88FW3M+Po5JCY71cFmQVadggChoEQgvlpxzJWsRCGuxam+XE94AAP757INGmdDuFgdndZkUFqC/D4SPbA8QMSg7tIm8uKCgB69ivN/YEna6s3U+VMjK923E4qGNCWoi/lUyPjGcw4IaWsQcFmSbBtKcPngMQSG9qigBVYEUZ9KcGE2uyljz0ukV1lSIn3fpaghmDDUOvqe+yf0AxJcx4MCEOdTp+6KJlRRUSk5kJS/d0DUs8cX8jlFl1LZ6TMqpk6ISFRa405W/kJSC88ilENtDYiK3XL++IbdSOFiGWj1Y2nzDirjqhl/qhSj75G7ZtzKlPlcnOYbp6fZ8I5xSW1GXEgbFaVduQ/ZLd0SLGXblAqwZ64XXKMuKpN36VKxbHFBelyl0CWvRIetjF1ubVizn7pjmNVacy/0y9ZgB2r2T+P+g0N9Yj6qXs8gSxtBdpTU+PaneCeOvMDf+vc6ifGv11aXcOhy+lgiBrnpHLM7OlhTu4mXMquQydbSwJgDg5OP2feq2IihYogCdEqQtx/wYAld2/yYiwiMHbNIAfH5B2CLfD27qZWhMKHi6iiAvOaZAB4wP57nzH/jf08Qv9WdBGNlrkYOTPg3TSYTTACKAPnWaLmdPW4iY8+yO4ur35M8ODCcx8oiVm1v+JatHg4PtFAjw6t9Frrm66JCwbT2HR+EVfk60rAlP4mGYIU3aqHBAr/On7aQja2P5qNr4GdsGG4uArq6dr6cKrshKwiR5pXR/+UTqlXgzZJYRF/rmrgXIk1llAm1cPYeiMg+DdwM2z+BnykNvqWNuH5IOn1xYOKlk1Sgy0SeOAhWfwRyKb/tWwC8XIMWFZic87zeDeco4kifS4xQAk1kITeV4CdheqCxgHuE137lJRmlSqi39gjO6xisHGH7q64hGyovPy6b9gufJuRZ9/3St7/5tbomQIThFHwx/T5IBm06XrXC74UX5svSMxg3I2Fv3cTSxmgqiSrZjw+LSHhDH7DU+vqJyqH0AZWNWFqz8+En3ajopJsw6xZ2C1c8pKWI7t6TwVHEmcQatkxwKpNTotHKg0ux1M5EVPFd4tx7bLlThqkAPElVCdVLH8xpJjWRqafp5Ssx3VX8fVN+l+ijKpwhY32F7RpNGaRARSObvyMDDu9DMckEsP+yTk6NPPD+nfF6sagkRe4EIF8DbukDg0uoPSlpqNVJNqtNeg3AaFDckJPjv693Ivi49nmeR7wZC+HtvtSy3CrXkpgxRBYlE8oM5wa4as1arcjJz2ZxLAcAAA0QjkUd8Sv5QayzRpco6oQLBwHluygTWmk4hCpjZUaoh+36xd7s9y7EaGBgL5anJNMJre6lD6Lm8b0wetj7j8NWQiy6diH94R2sgOl4zXTR2s6/99Rc6ijf0aar56Uv12wM934zfO1gaU/c+ntoGTTPHfFfZycMvMEtSu2gZGICR6mDdZ5q3UfZLi8dwe6BuG4Uww7MT0oftb7QMCNI26SfHUoboKdmlaqX+xQcqxZMZwzLmtuv1x/TqLvxGawu4Jei/QYNt6RCHXVvtiriMbIw5TYmlwzG9qT5GLwze+ysEfQ++HOS8BQGcOPcRJDJzMKu2Vf6AMdBaPEbxyPXwipd4Rz5PolRqpl3xwtGQ0U2hZ/Zk1SQ+G2476sWUvP3r/iOL4k0L7tt1HCQOvy8L6i2wxWIYdUoT8GB4tPsWWbeDdhWcmTk8S8cyPRXfjhc3CCvQ3BBEyze3IAAT+9SFg+V+qB+vIzzIkrLbzLNHps2jOs2qUIgnij6WIkhqsrrzfPSB0wUpkIbWnGC1gdN+XdJwUzLJkiLT8oiBDDWIbY3i0DA6byw1KfQbkNayMWYSLDp2vd3qMR6Zne8qluCXoVuUVoEOiC3h7dDTFImNwBo1ArLeB8mwBYEWq9nuuTFL41WBUJMLLa+2Ox6/DSO2n5351cWV0M48JtcoMW8gi9LR4Bm9e8/XzZvFnP/A5MuIGaci4jPJxC+/Av+CY+rVXkf/rq2qcq6UbrKxvFagzGkgO3Avj/2Jf4emtjytHdQNuAHgd5/0uNV/6yi8Vs8FBS9yqfxl+nIlkT4Wl0/b2od8jfIhxu+LKeKKe1/Wd/2A+3TmJMmZS0Y59AOZ8wAEKW6DMvlojmrahZYnmpmSJxOs1yNcVtNLuXtH8p5jpF4mmN4uI/XbZZatUpfpDI/k5kn9oMIFyq5sPssFilGq8vVCBML2ZnQmWoEG6ENC9UyiSj17AhUoDs4hK8uCyklVYZL1AXhXnc0+DpKlOpOeXga9U2uokT6KEJ3bFScsiROt/+iVyhee5B9GzB2EWSqo0ZTfsVcYSb4jl8IWcFs65l+FjzbcYNNo5koOVGK5mZeB2MVuYMYd6CPazGJhkGQDcU/dVKj4YLuECeGrj1V/0CvccMl2tQRqxGHqfhfe7DabxibH7hdIMfVinFFc1DYGSrhqp0y+nBljCuo5CBtp1hyceN8ok8v/uyv1zmT5GkbgnOY4tld1JpEHHuj0ZnSD+KnCWlmhhAlXtFbs9eLEtXNj3mHSNtUKFRkHGmlEBGhg9pw/ZWGxFniEI5S1MyPjupa7NQXDbRayEazqmADkp/k/sHfpNwrWXJK0c6WkcaFViWKC55MHBMMzBGEVz+AnfUTpusPK68cdHoqCF3Cq2oIKm3Xc0mkuvNuQpUJQStsNWmzEz9LjbgIoQO97NGpvX+1oK9Et3aMB6xmfbqqgrdbxfKM1KXDeJ1apTMyUmPub1daqC2TFLpVDgA3X/BwYai44Nzvcr9HFFXl0uitdVp2sSuD37vAkQzjzmCaoG0HOa7OOkIZxaAYFZx3QZgP9gaejCmTUHwC08RCRmP6UXD3OmcYmGzJEcZUkh4qySath80GNGbkFS91CbZyL5c0AAOAR+dRa29trk1NPjE4W1JFSZecvkFBFkIEmZ4C8pZZp/Fy4Z0DuoeTdFka6alP83Gun5TQOvJqLi2HddulErx2vjasgcoIO4tSAoDJ0p4CYFboNrjiWp8h6eyieh9WswXvMsPbZqHK38c84lufnlYe1RCkDSO5UMd5cMK01MR/AGcMb14cID4AveIa3D2gQkLqfBX7K32foBvY7QFhgeZ3IVvkt20ES6Ox8dBZQ8FxclzShP9DZgNHcgml8ziHHaQNnS0d+AHjeTLi0feRgjH/nDivygzkc4Cv+l7awzpPq/Iz+rC3f37XoYIJhz17sSUAc+c+j9yiJ/pewcRwI8wy4CaY9KzWgfuj00Q3Fv/jC3zlgFe02icu7TzgTjUXpPMS5YQqHTBVtAasGxzL/HMNDDgWr49A0HJGIvt62vSy8pKmRmxCNGQSGJIGNMBs8FX5X34Uy6MfMw8qg5WrOCc+zYkckCZnIV0O/ElJKL98lxLrEYZuODkxwlKxwRQ2pAThk9GLgBRFKlA+I46tPwDSlfRGcHGiOUxYGARspoM+aoB3G8vc4zoXn+n60zKEubHOt3yOnrPre5YTIFsW0BlB5lwK4IFkEvif6TfGHQVqeSDaEr+oZDC3mhcos/XnD3Mw5gaw+fUEBnsQCS+UGWdVJHXDbe1LtBvIxXsDp0T/MgPGQMku2oiXqv6hDyaj/HmF9/+JqFSJYLEXT8Rej4yZ/HO5U5hT+VAxhDcJfX/UqpbR/MiomMzL6KXL9lUtwAjerYby4ZZNFUFl21Q36/lxUZ/iTmQt3g0fj7rZwbPkNQUpXXabdN6omIAo/NHaA6fOkgWfTeqv1WMFvlBbji2lGzPIvg4NsODd3iD3fpLP46el53qEMnSb5PYpjyaBVJlKzzlYmewhgMNe/XdULXg4h6SWwlULHVSrTd9DbAFqQFc5B9HQzMzo6Ly4EHbv6ZJKkmNMcnaZjW/23c9Ajl1sSB/S1tjJp78zCXgHMOvw1e1N4wl5Ja0Rz5QNHjDwBPwTFCuFPuIQeN2OnmmkkJ2EHEIcBCd8AA4+KVDKqz4cjgEBQ9uFYAlrv400C82WdNAXMSobg0yHYQEheYxxID1cI1ZL9R0EdN6J3OxdtDJnWvCbVRB8CZIXMxiOw9+eNf8FsqczGsp5jxVBrJWOMLDGAnJcWh72i61Ktwjn1MgeJMrXREb+k1wMJXkRl/jiyw0Q1Otg1EKEuziaYcOYKVIWv/2rpM3QgMriC2N6j1G4Dgt/0Be6oX4308pDldJP05y4TjwFfxexARa48xa1HUB69/mHTAmHTg/0dVsKeMSsrOHPtyHuoapgq0u8OrsBCKB39pbJ9suvHB+OnPR6Kg1E0uA3s4T5kLdv4W8YeEWuNLseCPcFZWU6/O2LLvXGFo13Jv5hsLr5t2zJ+iQ5hdNX5dViUr6Qif5h9dE3tizDc5918fHYIlyV/W5iFxHGOZq/iXluIy03kfNmkcMod6ABdGqyQKtfzcfPnco3CcRqtJHGPA95cuWu8qAXahxgwbVi7PLTvdMiGs19+We/6NKzpiAAABD6BtoA9hs2iXNlaizW/bbJG2n1OO2NgozoKDssx0WFL1Dt6636YmZyeqTO6wmOH+Ylo9MDUalbdwaD2c2uFbWpjBT9Ep8LDBOloCvf+n7HpZ0Rijm7e2y568qPEdFWyyygJDSCtCMmWh0i+IVCevVzcBdrha9Hw601cNl44+5bocpR6niu+pwlFyGiMKb2Ybz/pFahFxgrFrWU0KP5FNJtjQLspFDh41TJP8Vpgz8mgKcZgcYc1mln8Gmre1Ak6eEI3Q/aG24xgKlsVe7o4Bja2rKW5nwrKdPosjjfVoeKFNJt1jL2k0y9vYrv8YNJdXIeP6jlfOeSR/KXj7wL7xqUE+jQNuvSP3LvZRIR+nNPay1wFfx3vYbkrH5G1C8arjAqnPBNdTRKZTZKkSsIzAG6vWYFPreUMC13RQAS8NH7jC1tj0cU0VL3IxCIZiCyeoef480sMeLUeAn6WONgzg4q3zc7C7sINA7HZgsEolgQIT+2hXQAbQMNHrei6eq+5Ezw+az5QHwTwUKpC0UQmCgLNjEVGRRvzL1jDiDPFwaQwP9KTdxJv+/pb1o+2m1zblh/CVn8xqP8T7lSO8CW68kdKiVRAXLIB4J6FjrbKjjG9g7j3Ou3/ZXCCNYcG/DstwKqMDJ//XuPB7efjMdZKwROZvNFbs+E+fg511IkVUr2Z6tRTRu1hdktkZUrL+aPZwvPnEMh9lriCAAGzR0iNYf7JYsmkHAE2dwsp3UTRYUzFCtQA8H19VPtAfVROOramD+MjQkCkNe5w25JQw6A7A4znom0EtecJsrocA3DkysJg+sqsWiOHNDhssp5fm20PpzH17zZCJRaUjXW+0BYgLAWbHYN0Pg7Gzmm4rbNyAsQvZvsp0SXBk0cfCTDu4suIWmO+D6ynKgZ4dPpP6QqJcUNqq1qHC0KDbF8IMIHkKE60k0tyHv0TVJF3jIrBY94JV98BYT7dI8b9rxI6DzTcEZSkd30z8JJTvv5IFen8sKLyjV2AAwHpB01/zT8xBnyxCGDyf+luB434zEaFlKO7HT3n5f2Lq+aCrJs+dBvcZIbBGZ2HPVKB3jljwue0piveWxMPDPTawIDhDoJNyLCd/E8AO3ZTO1j0S5tVDDWH3QfbZP3kz6oIIgrtxycHoL5jEr9cdtpdG36KsoCP5LYgYvDGI/nQbe/4KKOL5GvNoBduAAABP8H+mfFIRQOa+IHDny7x+EvqlwOiazeRPLRMXstHQd7t185eLDcelXiiMnZKUXVLG6T9OKOFAGMJYtZc8ptEe9KQtMtJtDXL9YkSG4woqrBT3jp6mrm4DydBaEQQ9yez62UExWFSpG059H7gGGs/gMTFBUDYSz92n9/y12vrkoNQraTPMvbgB0VpXBuVU4WjexCJbR7QAdD0410Ye4LinxynW1hibYEfXK6cbfod/B3zfQPc+jEfZFWlm3ukzKXiwVljDCf9woSrR5lrzrNiosDVGEFfzBSTf0fankSrxsOB+duZFM9LvaK+wpRYvqSxYD0oXpEVf9aT1fHhJq/wdC48mfFgAAEo79o/FGwU+EfuYMRj3Pry4d8VaLGe3qSMqu0bOXi9uDZaBQwOdBwHPyk+rSUrhU6Qa+u/MKk3WLU0uUuc7Lp7znjFWsG/UCTy2S1F/Kj2u+sQLwQrVnH9I5OkVHw1QQq29pIFUypOy4Y0pGe1xdr1YP5iTNKyDYZ4f+ygFUbJShqYTGo+hhA+fIAFAMCHDDN3zZuG5WAwllRDzhl1H0okxcEyt5tuluXuruh5/6MCr87zkZWUEDLbu6+mGYrpqMFjrCJGcZn3SZAgXlP+sTBFQfsC1hP5ti6sGV31l8d0nq2VO3en38lPLvViTjbsBu3g4fLKrKuKcEeskB5tVXAAAbiq9BzHE0TgVeM0eSWQl9ycx1m6by5imhiNpH9Y7xSSdhNp7jem/YKlTFT16PPS+/FfjflovTY3iwH+RRWqnErjeTG2xvvPGf8rPhys7L1ASFVjTbeMNmWXchL/nSZtGqKcRK88sAk56qZ82SlMZuNWRUaQSs9IMMj15eOItxOxWApXyykE2TwIHI6ci7gRNvRD3Wvocs9JuBak2dcTnq+duRwvzn1ciIjpzUC8cB8LAY8fXkdFqVEd9QXDuSQVk1xHbA1Pz/N0uXI5FiFI4bVqmClbFhoaYFBHUrmLSDsQ1MaemWYrndcO1c/qVDYLqEHsCO+IgPhLQzrsRbZoxRBqxz98M5j04hPqkeA5VSHC8LJ/d/R5eGhIRr1NRHkBe8njqTSWDCV6EJ2LdmAId421e6pDbvuCZ7VNSvTm8IMxAAQYtuOExQzW86tSTOUKvDWz39Yyx23E3BHr1sxEtZq+vY36GBe5MR8DbPIEizblmII/AL5NRZiB9UF7wbJVX6al4x2e5J4x6SgCBHq4tqKa/PClKofgiJqaf6o8SvgePZW1MkxLfjJY4bEVbvHYGWD/e/FU9EJS9FkvYLxN+emH3aUygEOD3CQV8KsQm2RYpE05gphAQn+3ZeLgmts1YRpsJXorAHoh2GDOfe9NFQVzaGdz0pK+gkRr98rd3bXd14W5ASnlIQWunED2HeI8lnhGcqrqzkDX+W2XzIFwT8Q7jbPacmTKkwuvQCQoIdJ3pAwioQWFGnhuxzImhKpGqKy2AFNvlImCk00HhaEUdTasXNIIrbNIa2WN3pevZm9fOad90VDsASym9NXBdxjZsCrIUeDTuoTBWYBN5f4hznswr7i1mfeo0GRtpkFvL6aOtWjkhNsoYST5IfrZb65XCzeDvq9q3FTUyGWFa/qO5XTvVvTIcmAAsMAhtfzd5dY5T9ax++ppQabGHL8g+aIcE3qjpEbQOJdE2ULw6WixfcjEsTLEbBX8QCuNJ66YerRq/5Gmb0YksN8hgk8gICcwkER4EF3j75y7yorGSS9XaUICK/WMiDRj7q42SKdA+3BWuqgQRhpyOsUKVzn0dSALInrO7hmYqGlzLCdEyL3+6+dgI1OaJTq0Ej3IYSJdwZW9B4xhd2SfsojmzvAx7zg01nXETpnwHLKIT2o796nY/csWXYba+nnGO0Vh6tVbnIvnxF6ebKxkAy9n2kcPARLGZOirF1jk7eyqv1PIEdMeR+CVKGokVhxnz1vDOENtUJV28DddmGvspwQwVEdX3+t0rrFUKNC2bMuCWohskvvUr4mnZbtHWvTihvgSRdxqLsnbjm7EOSUPrLT+QtaH442aroDRXRjInjvJseZS8Y8F2Z+44FYdPXn/AhnxEzh4EsJOSeUfqmfk3pf2Z5NBco3TiTJzeUWFEQS2bQXfU8PZf5Cy13W+4QUcMU9hVmtHAsHK4VQC8U3Fvppo4HPsvwpRwlV49j/EVA7bTwAowrtqvPGGGf2tweW4GhqZIW+wCtI6abnxwPAGtZQ+dnbgBn6H8WqwCgw1FH9INRwlLbzRUMqNznMed1uPoEMvPFIcKeUaap+oRrKiuaBkIf4zHZovsokwvPFEgXTViE+w/w2U81uewJgel6jCJzAk9Yche/P78/jtDAER4Jb8JoAdF14+izUQOIhz9AlVFzxniXPzbVfiheRvWsls/kdD9o5Jiv/H8eEACPjrz7vb8pW3E8+C+gX35KokZz1jzyxcMNiergVWbMR+XGgtBjetY7bmOIJDUcWTmHENlkubVgY1uJuwWpNjxzo0iZbvw8ktfeiKWsheOAmMG/coWs0C8JFKupFoNnQaRlwmDgokvwsSwy4H7WbvvX26JjjQ0kOrNdoEL890T1JMIiryGQmnpkDpRt8rgO4yL2Lf+M1n+U45aeOsGweUVttRq9Awuu3LGXxyYao07cBeHxdjinkJyYDjTYb10oYPIeTBygZ3bc+RdHf2XaEp5XCCJaKnhG/8ptgAOkcF0HOVF5BfQ5FF6uuOTo3zY9RGn4sn13rFt2wXMqG42GicU4VfW6baJ2aaO8tBnablhfpzSTYmnxONPTJ4YvmWSooyF62lWbCVZIoY8uz5psi26injsatauF5PmH9Vsn3KPFSC3sYCTJkEVYQdKYnIZZMG0xFIlUwbysuzqxEQEnuCfxEmwyIjzAMBNGc/VWYmuDAQTebLRA0U9Hw6mqR55js9m274P0qx6FJX1nsf6rRko9SWlkpPCeC22sDglzCAputT3QQFLj3jszv5hRlcSYBVQVLZfih+AfEsXmGcdz6bRtHOCmu/MDXANVOCew7xVBkim/j3IIVysgyFGHk8t4iTk57QZ8fuI/U7XaOJLo4MvacTSRNTep8RPtfOJ2kjcdvx1UuMsNF1HtmQ0JyRfkKnAJ0wTvMl1h+BvbdvNpsR0ZYeCRxx7WmMVYGIVWQ++jiF0YX95knYlWxEkQ4IRCXRqOCGJ0c05urSpz1UcS9K6cpzNzh2DjeVm/7wcvg/Ks5TOloQl46+F4CZqpB4P20F49k0s4dWGn1zzK6G3zPeOcFGt/T1t5YqOIVrvo+8DmtnXmhQc8N282o6CZNdnbX1TRFQmkgldHDcZhff+W7g06EcQfffbXWXLiBn911Z5ibawA1Bhfev6fp/qftHDRuuLfAWiM3TOLRsy8wRmNbm5uDaHzV9ODXUZq9a999JkEsQmlfAQzN5vdpW/Ru+p9zeGPfL9bPya1/iPG94N3wJuYlV9Hb2SuTwDvkE1UkkDzy7T5L9bP+i25jvWWBGjHawOtPYHx2l1TKGSkMGKWJK5bQng5aBuxFnQt6Y7aKc0RD5yKgwVYJr6PYrPHZsVyM8XO5dp9SXZ/z1Qqy+CoZRqrQzuDkjpLuqWtPHipGr+f5OiV3lQQpWHDITiyYqoh2gdr006+P+rgqVGW2ibFbxoUTLtiE6wH7iCBTofSkg2IveTYMcdwLTuUGuMI302H6ch8hmcWwWuXjABjrYxsXzLyR7FOS96KeVkVHDlyn/4vP3csGI2c3ZSuxQ5fOFjXkGjYkpMUX+51HI5B24AJAIOpdI9KG7fqBzDQZezeo0tRfluJcOM1KMs05mSTSCjlJ59pNdbZhV61xAuRXi3RTKwFgIFOInN3+Ve1UQYvCiFh57rVIVHDmn8sE1kOzfGqsBSWmpbMOGWDNGNsUxkqPbVCm8MgWby+Ya4MlFdCKUpF5Eu1tcX3Fn5n1x9FtpmddnJKIHs2WW7jfPu70LMG2jqfzSA7+NauaKdSyWuSpInJoIuAg+6T+Xz1rbcQi8xd6g4XjM+QryAi7Db+Q2YNg4eA3yOXZn55Q3t1/SSOd7Vjhei2Vs3rIVJwT4tEy1oGJipvrUaFZIFxcNv6orMqd686PRbB1lFFuOM4URX0wQTp/KRGRWFFOb+MPDRucGhwqbMA+jzFJm+ofNKIj0hgZgRRSMLiRMGf848i3TEmaalrojVoQyh4FF8pl9acXr5LACQpuSV7JBddEPaqc4Kt2dGx5YmS6Qycy4fOr6yGMDWEM4eJb6VmqeoiRljIkHJnPOrd2cNf8UGNOM3Uw+yt+78h34FoLSmjQ1/slrVblgtFNwA4TZIyUCh+4myrP/4jRAYIJYJQwICmTYPbDi8oy6xWzS9Uo9HRUIPpL7SbNS2BdplYUSZzQE1Pps6XnR0VYVp09uGPf2MH3ZS/0qjEmrE57CxxGyxgI8aB93jjTN2bfnTyPvmdsImO6vAZy+WZ5FzpMmP7PgKX/79/YU/MI42watQH/WcqFrrO12qIAf7SmtK3VfyHMchM91GVVucRpS0F1+dc6igUqxpHO6OLAVSRjYdeJWgIm1aRD5PhafZ+rhW9Rg0vvpSSzpQTzDw8OQEfaSjGjzW+JwBqFgPMj7NZUsHsnjPXK58hxkWYVel0geE0VtteW5FyTgmSPRKo1ZaYj2QePtCvdnDs9G2j+wpOY16zl1Q5QlwwuBukcu/H1HVkL2wkbFRSdE5+Q4ffZx0INsLTJz254dL3xRUSn+doXkyNFaT5ivFqGjPURFPjuTkZgqiYgUwflDGQjAj8MqXZsiJnk1wv1XRWTupfV+HZtuWkKIHkUtQHdDLjRlLTIO11BxUc9yk8pZwldPaDW2E/6QT2nfXVWrr9mVb3hqd+AVzq47RzBF1UriWu+JNSEqxAzTC7o9ZgHfenZcEjgFs+QHJGiCXji/aMSRv30A+p+qELTGNPSYGa59NeMEY4ui9JCi3CNymvJrKU10dHilu9Epu8NS2X5rRup4MLfNlicONhfRvsDHdkKVk112TLNEJee8sf44RFnfCuC1QkMn4m+vbYlHtE5JEuOYVprTMHBItKeFVPUnzeW9uE0V0xz0k0yAKBYTfvtJDZHOubXz0CH3435JMeXXBURY1hQEbXTKIMS+QbAq+Ailpr3wMrj/eN8jjarl1n0DYy62Aa+/3yZfjZEWbtTh67kjNJ0eW+jE4ohN3To1tise6dwA+HlUHelJJ4JxcUaWqWjSsZI7ZWfOJOQTGDOzmjDir1Y0Teg5gADekhnS5D78M6zkaLAmFwIueQ57lHI4w/VOhcacKDzVMbmzdf71lESiZ0fMt+Y52NC4Ogu75T2BuHLmrhKPppE9VPd26G3wPqpLs2PzVnQK2FCDJkF2VSGi5KEW0IxKEu3chph6hdcc6Dj9hu4WYxbZgVJ6vrqNlmvB55BoOqpCwxKCw4mcDErbklL7KwL8hmq05+zdKnlWixMc0mHNIzKdXWUoIh+UH6VCQXWRJCz05ZQrLB+fdiJOBloztmZgIL1D3USSFU8NsXThTJhhnMxQ9InCFXrRdXWFUu4QvPFEzPJZJMlfVjlHqvjVNsXqBDwsMNLmQqE89yOqiVPLljmH7bt1wu7MuHcWkxae3k9pwS+BWseuUSqD3kshA3f9WvtX1/0yyiehORvUMluDUClI6tfUl2ucrOwu4o2EHfbNjWEETcybdyQXV2jO2zy8WDpBf24zdKZ/iKnr33uUzcUIC4bGX/qHZ4PjA7lQa4ZIWSsnhRB9ziCnfg6GTf/ZzQlGs3ObHRG9Dz0MJ0e4zFvbpEHflrmSjSHnXleYGvmXPiFrNmV0WP+R59Q/3h1gokEceLFpZMRYgdIwXsYto80zqmwQTa8VkoMeL+CpuwwE9gBWQRaml3KhoQkhiIFDreyfR9MuD8DWh63NXglqXBnwzdF/2OX90GU4HShiIbPgsMwKSRuaNtSKJbt9YaXZejFztdumGcyoiQZAUcn+/fqDu9MhoKebdjdjA1YY+IURDTjKxv1gBb0f73bstT3tO6luyJEKfBY/bM0pEEOaDb45UNo6GYMhn7nw8+trucUkTrShKqKMK4KWLIwZteD1VxkzcZF583s/S5TOc/sUwqzkF3cWHeerhk01v0dM8zKfjwopO3nIq7oOPa6CSZKDi693vP4UV+tlCqd+LCyDjXjCZZtLlNnhO1/2XPhGAAaO53AsXfwe7dgvevlZG1PEbaCloGchsiYUpTb5cIp4e9+jdEcQA7rHVQreudw+uhkJZJrKiZ187645r42B9QaLGOuHi8276TJXy13FAn20+JHqaBjOeG+52STyugG5MWh9BvTAbYfJm7ly3xM2ov4AZFCjkhxy96pTBCpJ3mgyb5N/42y2XPaaTdL94+1b53ThnQMersaaQj+dKBr+FlZ/rb+WvNOt2JSLVCTP8UrKNa/C3CdYl8ZI31QlPAIxNyyYHqjDtwvJueGFFjyyjEML9wzCDm6ZPJ2MMEGOIlBbUq55H1hfjU4UtkC8B9GzjtvvUApmkkCODn/leVL5nmL4TQmkYxt+7UicU9FEH5CNTZpXsnNTh7Ymdtq2r6eiuVUImp3tUlj7J2ONh2UI52rdp+ZyGulBJCO6/7oz1Rfdu+PpO/rwSS3fYa2xj5orCYpMf4YP3G6Be4KEdn332DX0JO8BN00RcNWpssSVP600ySZdrm/6FGmyIg0IVo7kHDvlY8MjEsdw9FXIN7NSfJNkLfIOenoeFgn0S0tl7NobPTVReAGz3FX2UJd5yLhblLWhL+19BzsNd3lbGL/TQcYNxbWkOjoYFx+Z2CLnuM954qUDMZ1ak3Tl7SG9wyWwMl+k5qb/ja/ytKPk+fMpVU12+sfxrGx/ApAv6OmmkqaK0GQKgeTTmvJ4d0edTLyldeqNuWQe6IeVF0+8UcoaT+DMjDuVfszwNRgDuSx1UyeJLEmqwvoGXsOJVzkQrksQfNytWhHZPV9JA7ShAm70+zZbqHZfgABBFSCSA94wqHfryn/zDK0jyXaoZT5+XGMrC6yBbbKyZSavD4P4I+OgRUHIai0I3UgcAwlQOV3+8B7Q/xmKdJfzAxqYjfwqj/CXaeJR9ZRUepO7brXzsU7ChHlfYNDb47lXmg1tXthWkfnwG3KuZhdjsRwqjKxS+i+ezeACJb23v6EmApqbRm+Y2GTWoWhvpZXcAdaxhWMfjYd2PAAEtWqmMBWY3wi5i9Z0knTK07YZ3yk0ppQ4FcQR6cgvO9A1U9oa/5M0SEkgGS/G48pwIuWcs6iSNU0qr+7YaxC/YZcH3tmFq77drUYHf571eZ0HJ1hOxfH0eEzqgmSrKLnfTV0GNwnrm9gRmjJx4IDsVzMSLpauL5aGEmPad5pkyP4PjIM930HM23K3tZyX/uMRELVqrQ4ZR+jDMnZdzKeMv71NbJ0vrsaqp5BBIw4lDcmT+MkS2VNy68JsU5kGfTz4f/StscymH+sTXsiowbVyHlj4IDtNlyJ9tPBOXkMe0pxGfBfI+0MRz7pxOSJZOBJd16cXoGjsikFg/1p2xiuzKUl8wy7EvvD/nbSHb4daLPeUl65g40n525dgE1PWIHkkRyd+usiXr45YPAGGdiW5olc2xcXsVxmjl8ML3IjBNM0EJRq8JvnV7k55RLqHJ8fIRqFqDlSixevo1FaPPWw8WMDBKar2k9qz4dQFemzKa+NTMBhL/Zkfd87kpPcNSx/82Cx4DQnZZ5lDs9FCGANNi+vAzIp7iAbBcRiICW2VH5Nq2icavUd/K7YtZu63k58mNjJrk+KuJdLqIHU7v5eDGk7z7B4bjbo5zY/n7zX52cnrxYXmnuyD1tPd3ivXSLJWY3/RPWukb+ur5yQXPIJ5nXBeyb/nSmKT+gOsT6mIyTaJFI/VcOdxP+gy8kk+MQLgmBux5m3FC/Muh73UEdmWy/SerMyhmMXyGnNNtsQu14Z/+S3WWHqGgXhZtXqNG5AoGX04X7empGdAtIT4/JVc83uZZal09X8L27QETAGieNO984hf4QCjX4gCrlcgqyt+IyW1U03RIzdbrcGjqhPmlMzwLrOaU4k9vhxGjz3UaMnaMGdXPNcIluIReL2iye9j1bTrOG995KRuEAVvMMM3S1VkSTvv0Q5lXR5xZHuSrwMHtPSdvP7FyZLxZs+mA2G4g3CffUxW84aKsOqTI29Bn7qJdcId5vt00/7gBBnoCfJPeLGQSqkVnnYBqfj7M80yw7B/aePU98hccwV7xzI29wMgqUSOcLO5tTAjse7eJUENNhd+a+68XWDJUrl/pXn+72nbVU5/03EVyYWXmZW2tztzrBXzkqJuYhm+4x9AACLa63qz9Pfe5fHV7b4JflZnM20SG7ve6+UUJq0qLPAcW4fDTF1vc8KygDsZIKnhdn3mMnPd/YyOsuWmZkkjz5WLsVVOOkRwxBSMQIGX+EXgbySPv5WF6ic0sD6KW0YO+gBGUfj3myNzB1+EN+rHemCqpfUYgf0sek5jF0s24hcYADSzll2AQTT2bEtgAH3viGxOvFmFutz+yElnXAcynxsm25EOaIgYg111qLH+tGcuul5BktJcyHLwn+9DPnK9NN6LAeiMz8g+F28SagCwPFziRSUYHNNpj8mv9C9y0hWZnZ6jfpFf21AtQYHQrXqBhMZhk+XqO/cS946vH5eoB3fn3IucJIbav/7RGvszwI2VtqFmaH8rvIhWaLQDPHU6OClNIU74xkJbRh9/lnCTDVh/DTyqbxtuLhwjrG0SMbQLJS68/950H0okoz4FcNfON35m5ZDcl2omlACIfgyBinlT5+fJqcj/5+iUTJKj34MNBOQvC/fdLqSzC4P+wtfyabwbVHXRX6K1t69Jwtr/SBtt4+VXjSn+LcqS7rnCkBSglD/E6l4/H/dkGwxm00QSgcRq0y9tnXyYrI7TQWv/fQ08quTF/7d+mislswdpHbf1Um6gmvG3m+Q7nrePzHnVe/iCZpcOTyEe1GdnOJP+92Wh9Z02QAX/ykR7wsal9YMnjmp0+/3325yvJjHmSQ8y9M79aN8CWX+Y1duIpVAzqb+nS7KGYUhr/7OtI8uyRSOchxvyjRwjUNJvhoRZiHBIC0nzHtUB5ckZJK1tfRncJrQqjtlYNZ+dtS78Tho9Zq7N5lMzjhEBj9DPgBXWwEZQuDWhueaiq/WRr8+vq51dJzhrCNt8Z8hcKTExpt8ItDL6p7Y4eBC0lEGNpXLs+nM8+H/OrI+tGZvYU44a2BOcJCsbfSavC8Mj46a3bzUfm6WsBpYsfEY6gsO3PcfvDBHDiSh7TXRvBN1l4FX0GwGPWXmwrs5RfEiF5RPgBfQLnqQ17CyHxd21VdpSnevz0xN2FwetSptGYtuoSdPkKFHg4EVGHJxicZ85DT9q6mTiv08XLDDXhW3zQIOJQNdmGn9/LFfqwx0+xvWsksfwvqqZShRjQel27wFSw+o+/Xnm5OZLdep6/HfiIWURXDZWe+2/xO32rH/8A/Hj2r2igFbfy9mNKP74hLgoR7ZsgIv3f2iL9tqoGNMc+i9ReiJd24RlYRkv0tOvNzZn9vimD0VeCwbNWvG6Z8Zd6TPmTERhI8VBiHT09E1+3Zhtv3QWGMUMVCp2/WbctGr0EdDa2xQ5ftwKkT/RITEL/sYY73VUXGERHIdiDfAjGz46K16wrkkVtui5j53lzZfrELCWOYV01xZzUetogrSw3RtC+s7ecthT3DjLeSxLFQPM/RCavWfUcZVE586M4HVsSyiVb8ci4P/yEZnaRXnn+id2GQib6UrAZcHaXRo0mqFVYr9uMuzy2WUvcA5WqF9+qJe5Tu9AmnLIP8wyoAnfPrkZfbIjFvu9/RVnJ1SeQIz3i+cGAB9Y7zuIqPQbxA7g06+FLtz+uqYDEYz6QLf67tIceW5/6/f57F4qpNg3QOz3mdfNNgw/8fngN0kdsktZf40cGKpXoLEXYe9yqOkHvTyyZaOysmQgXEIYfgxYeNJSyjFD/Ds4W495sohKInEPWP6aaIMvMmZRNJeFgXeAqSypOorQo8Ez4c2IFeA4XMgE6dWake3ln9ytrhaVk1VKTM9mP85F3usoVvlx/NA9A4x7PYuThxomuCswrlpoZ6d60iMgBpN0gTpS+UfM1G1rr5hK9ieQAAZc1fMdgeDvedRJn2TVYKN3fs2XhZ8ZpUMGc3Lj5AzrjOllGfleO4w8xfRE2xiNsEVevFfxH96bWWpNDQKyDlpmZ4gkUvFTzM+kJkjXHyEEO6ZGGcKlYskI+TA9FCPE7yPOARttgG2nDAzF1Piat+fG1cH6HhcDVHhBE9QmcjdA2YmpeK1eYlHtwRGlfoP3G3BXfdxkR+p9tItQ89VurML89raukyS98BxTXD/84EXLfhjovN1FV5ksUQg9YsVvYBLMrIUIdJHW9OUjk/B375ZoPgdRQF5EP/o4Bqu0gBTfFv3/HRHCQ8Y1aR75l0esasMu/0AdNHSVHTMYuiCIIobauKFygz66/VJrH10MxPOtKh7H/MMTdh0XOAamaSppiMBc0UVEczXFWDTBQi6x8tb357ylv9Sd+Tv9hUDQ0JzJ+7/neQ7Pq8Zrsw0P6abAS/FNqd2tZkeqeBdMxzlzSLVxq1BFSb9rT8EzIpbHpkxH9I2awlj+i2+f2q06N62sCNM8SOZWsBoXjhmdBBg+zPRl019EKZmyUNe7ZkVQGTAFpqwR4+iA9iyofe8fFaqOkkIqG1dsycBBPXtHVbxOrFSKCn3x3uxIzoloiGM5htoXIAGYotQOH9x8G+7X3eu11tJxQ3z41vBTbFghFTlpcF60UuGJzWITE/yACf37zNGzIXXVCIf4W5BmWABgQDmqAq6Yc7V0R3+4nVTcDxe0zFyA4mp4W/hNY5R7nQRqeHJkUaybSJyEah25cCoGMHYOx1Cp+J64v0sso7DJnMlWZGvEU6tHZxksPttrqbji7UGgG7YIY1+xQH5fEcu9/CNGn0tzNiVMy00ksdMt/gZiWFDj9r3EzqWAknwhJjLipYwDVsHQsR479SK5UVmq3xzKAxYRJQs7wlLivMjtSUxDreUx13Xgf8wG2ZYcAZ/x9NyV/DUJMPrS6EPqo0udseVZAZBB5gl6x4GOEjgwjb6DK7ic4lCkbohPIeSJ3BMnUplupeWBfLiOdGe0HNvDbRaAKfrAHCSQECZWZBwsSdaXspJlDqDpEcT60aDK7oCBwXljU7v5e4/moMwjLwOZ3EgZxxy4t9hHwzsCjvKzjTzV+7NuvgsekvA7+4nUs5NS1BT45fZwdVfldaEE5A/Is/pQNoo23o3w8gcbmg7NprHRkeCeuyMQo5ZZE2+dctKDW3wimtj2yGx7yxj6qIcEHIOfNi/ZQ9wRqMBPYCPnSdsg9nHnzwsWaJ12mdv+mMHh9yeRvbS8GE6M699GoOYAymFcMb4QxIGwfwTzkgyMPXgRvcZCzve+EAn+U2AaOsEjwZCJbkObWoOPuRiM69xuChBw07XyWw60dXL9wZ/HGVMPDmg5yTveIBt5VUDe1LEnApn62TzQRi8tcct7keIDqrRxlOhE0GPnQykYvu2JekVLUUGfg5KVDpYA2WmFRsRTgsothu9uN/g8KP5kLeQa4qlJvwsuYzND33+n6PmCX5kSmS1seIzfcnkosiS0cZefOPo2eItBnbO/peo+7LzhYPsrYUytfujGlc2/B7Sn2KMfyGJen2gOraWkIPjfozN/axgQsWGecRFdxgEVIfJyM9W+tdjjkxUNovAUmXuJ2/yT+VT6OSdZge/4riVlKgswmsmzUSJYP2OD42fs+I3huN6dbZFmB1+AMedGIvBL4sf2E44MHxMgmccbKqgOoR2dVWB/P0IQc5V5otKRyml/6S+CJFscmwy7GVOUBFoE6YKF5bPTEJ4L6ormFglE7pqfTW6X2QjzAulEB9SdDbZatTLzcBt7cuDJEBzsBhz+hf6Zs/2FtaeYRyIjZltu3dscmx1zWXjuIsmldtyQwlJsjhuo0JDSh1disPmt4fWf4w3ifxGRbvBM/vqLJpK3eQr7k+2AIFO1q70mUrni3WBGWDzt+wnKGP5qVkQsTCnv8ABct2bmh1fB3aUhpC60WdA8GwrUxcuCTbgrVDGqTTE5aCWERPXsldt/F3PEYH0hioU5O1VoJk/D+s7JGRWJHp0PUzuq45eGSqfDNE6CUmM21R1YKl1l5yy2LzV5apM9HwHdStcyLs5Gxi06cuUC2b1AtvP0hBpquSVnBEZot+lcSirTYCnsab9j3gt4G+87vuXKM1IzdZdgk+d6e4+xbPwDhQ6JwNOv90AG7g1rQ9mO1cxrxL1xGb1Hb95KbVVnGOmQKEtOstRfUt7BvL4hHLu0yyFZA3AgRNvRWCZQvpAwS31UedwssG5nf4vwd4IQJbsjHm25k++umNKq09vGO/UhYA82krWsyxDYAtVWjnxs2O7/FFNLT8Aps4BVPv4dmJqxnAlX22pRppqdfWQ44b70OCR4rAQ7qkvJPxTO6yZd+nUkeLwC+cbj1p+maiN1KmVkH8U+5fQ+LW5NM7S50BKFQPJXrjTgTev8/vJDN6VSEXFWLzxWw28smPa9li2OcC7/bMAl8q4MApvpbaHBtEPEmPtj36jpP30WIQ+GerPFBv8yb9m2qac1ke1+OryJe7fIShRTAaOxzROFUMHuBXTC27ga0Przgz/dAC3FHDjEwPxKmjfnA83FQ0nH6S62Vg52NgZZsLpYr+IXRObPoytMJ7WkHBs9zYTki8BRqYCIg4otIVqulOquLvth+ZZ6mhajstJpCDvSD6YL68biDS2ZKUivoVoqs0VEVw8VVeD2cVA3F9kU5gP1s7GejukH3zfVohaj1d/cY2tRVNwK1smuWBEgVYxZhyC0MnWNfae46mP0g+BwUGCAAsl+C0ZUtTbfzEXrUdlke56CEHyab126NTMFC+F4aBrElKazl3JQRR74X8LtWAA+oShLzSnB4lA5BoU8faDoIvsIZ4/tTWK26Lf6vkwO6XY5EWKadnBy2LSxXcLrHvFABDq4J/ooXjspZ7RugHHauf300fzz46trx9Aud7etAlDbr+KJaIMwgiGaH/7Ag9eWutfjolchBgEZhEjNGLCPcwArxpeqVf61D/072BQpqaXhAoXAjlhHD5+97VRmS1CvJrNVCrjKWvKFDuN50pAHnyq5hkVOAoSC6khfqsdPDwERAuVaDNboVtWscjN/F/eXR+MAglZJhMd8BI3PA01FPHUYQ84kWd7LmFBQIf22egUOW7TO7KjOz3yjv6ww3yj5/MjfUZvRv2RAKGxvc7uVyu6aSTAsWjSZhOF3K+JnBs/dQWBfjGKNh42mrJBckXMWGfluoqCkRH2mpEoaNJCNeMBjXaVtkOBC2S+jHaB9ppJFmp7EEQ+Ab+FGcTDh+CUoHoE7gOIWI7QUE6bjAUjBJZ2NC72Tio2KZebIx3fs+WwCcWjOvphnH3EqdG+PJ9ArgUr209SjFI4ceAy5AGFGH/t85++RRI+dN+ojXzx8G80uxwT7FFLAsSZSp+coWURujQLNHlBKps4SqXe1J9O7LPVxWFgHk5ikZ8c/TAW2y9zZ96R1qH0M+h5rPcrNIRbYy30d/tofdfDeb/byCY/mX/23Yvjdka7xSDKyWVERYIZtB4WAoYX29RK+OWLDrp1WH/Ri1iqWRpTxHN2UbsH9B/jSxRWZDwN+ZkgxI/Dx//JOAAC2xYW3xZMzYWoYioIIYgNCTSbriXNhw77PPp2Yr7liU4FR81yfFXE1UdcgwPwwZheoiPhfgzjoc8U/tPjbzJjUuXaci+mqlHhrbSYABYAjQhAnxeHdmy7nZtgi2551Yy/4BVY3CM3Pbh/5XXJ4KnCQeBB9kK+Gf4MBngkfREGkY7etN9mHKOVBFe7T+nr4eRf6bnW6xxxWaHaGeI4I3wSXcwF3lpx4bH9JYfMOZqN3/b9wWLNqyvBo21tugEhtyFMWD+FeVckeGjrCj/kN7eCQl5f5IOgupkocJChfU5KrwD/WH//+nqydomALAhDe+vKC30N0ciFdnUSWrJkc/p8uaRbdVDHJdllKKirXMMI/yuVI6e0N0Q1TMnNyg5hKaprnAmrnGcrJuc9DgAsYQsbTnvAO7F8AmEeXhpUoc26NJUqsxv4ZYDMDKojpbos9CP5t1CMYMuHi4hEAMIKug4ahlNwAA4Q2+3+YFZ35UWmkLjMqkARskLq6YIWHSYkfKur2T3GZzg5uEOczYXnkScCjepLNdG87HrY5cMu0VYm7qRrfZbAin2W7f+k9yhnq4yEY1XEzhVzApE0fil7nCcye0gHHOYsI9WzbSRyg8QPOvDYS01Po1K68xO1BMuqWRvrxa8qJ2cdb8DH5NRHm8C0tuGcBMNM4AAvOfedTIXZ7UcvOZ0djgxY1QMXijf0dByMdNzx7jCXDJQ5g881rcYFnzUxBwv+Ed+fsu/AOvzqgj30mwHPST6o594AIPBsV3G7eWUY6JrO7zkbSzQshKdTCcB+wJmygVlfjtS5LwPCNIB0/VtnjGdHFeThIRNKeV/lwCOyY8rFUwd2WTIFuHz/aozzrRJNzUjemr9DGkQnKTvYsNhAzKBYKRvgeX7J7Ctf+rn4dS7a3VoNg/M/XfkE/E6sWPCjPlCwwAk0f0akTlf9KNhNzbkOl7N/rKMFBMkzJgoA4hcICbVMmfFUrc0TOBTTySKBuT0QQiez9rM73egPjkOoiTuyGj2lrCaYrJMtYws3CNGxcOU8RPBpmHyfzGlDa8Kj7/ClFT6jA6FmhYhGJ+3+UvksHSWZoiMSeu4WgL5VMd61PO8tdYDknOR8FWjr6nv+HwiwGJJ0LBkEasV1rK0yEnxwoD7lRuoC9O8iF/Qqk9sedXviBGUPF+1NEp/wV1Z3ymy98Sr92ejyNv+Ixq5rPXfvJO/FRdeK/UI+iV+o33YMm74DR6ShXMALEh/Hltg3s+8wRKNLVUTHA3gjWq/yusbAEKbWFcV7y6ObQ5e2te5OhzHtPbpbeSB9pXWwwR5V73iWvotU4M03FjZkv1AkE2yjWFAh8TQ8e4s/Ozmm3M473uGShUOhSIpkAwXtQACb+kXuCrfAVlEQZW7YTHQ83V5gcr1XiR19lebRRwDDM3oXzrmkFVmkdwGz7eywYEh2nbrDkW4FLAF6ogoE7K4WLjOzLFH2D3lZ+EQorlZAfqAQ6DKJJ+JCL7YAxcJp4gCaadLQL7GiEvZaNtALktEiKtQLbSx+60IpXZ0KKMVmF6XZpW2keq2USv3mpYBFApRj/wulszP9xb+KMWOKyx2yJ08l4Jjl7khoOXEtGRbkCuweil/8k6yGOg1YLqzGubRQES1oEnIkyk8ocx+/fU2FMMQ3Zi7PElyxUjXlUHly3bZXNdduajMlVA188o0B66FoYD3RjUwYNCJQE1GEPAwpwWPt/ge1oeHnfgHIRgxg+WUZi4FbK9Su7V1NI22RE5O444rPSUlWNE0X9BQLZADSiJtFcbQSaFe5Y2xBp2YdrePBXnqaq4QVvsf1FRh5ToaCuoQh43fz+64bwKI3Y5PbuVLgRQXukYIJc8NKyJHSIH/JjNbYrsHUN+Okby3RWiafHeIm6p+2ys4uNjPaZhe+NSLnRm379IZ/ncTOUypv6rBZihT7TtJH+/Plc7JSUixgyud7BYMDkUGt2iQAYeOc60y8sAnjAu+X+Bf8UrF2hnteMZ36PHgyaRODwQ4ZApvZUQJeq758pC2DpivSapa9eXxdV8Lqy5GlepaESuj9T5Ss/O6MmJY/GFApxaXVW7SngwgSmyiqYPal2WoWzeEHBPTkWVMcY4N1JVkmgB8iOkBJEPfu56hVPcN3aK0LlFK+F3GiIByhtlUNaMhaLKRnbWj8/MMr60HTZqvUeiOOCTUfa8Pu5YyQwhdCs+SjiY64rRGeKqecHxFrsyBWJ90tkRawl7Rs5gfin2P8Mjh6GB5qpgdMyDgD/8ONQ9NNiL1DZNKv0W8QD0OXxFZ41fFdsCVGCsrUEgbBwhZbZcJjIP/hb7AjPFYSMS0kEICQbJWniBKwFp2vMdP2De1L226KScGUXts8IgEWHj1y4UHNfA5BGfNeoDXwW9QnWKGj25HEHkuPpsQ32V0orUKH+J20dColrcgA6RzZdf4Q2sDYzUNSUiI+bI39y/GQDFbsGPzaUPHRL6TYxxZ1TepN9ugtaPwxIijCxZ74dcK+7IpeF3BGVTTRfH4QWaBq6QNTckgtrHxzsg94ZLFY+MPw0hqYzfocqzKjOxIqmbD3SLwFslCAzuS/cR2Np+DZEuTPLCJtDeGBulNCFse7cwFLLBs5Pwxf11l4lVNMNNi+ME7VPtjALpxLVwdquOfrZM3fgSaZ+vD/oUNrTo8Hon8kWe5PuEdkrE7E45jcvQpsQpLB8/5QTV0zL1hNdmLV09urcJEmBvysqFq6K8xxneazK8H0DEgC8ZS/5+inh7v6Iq7GqEZYJBGsM6n7JaJ+Fs4RT8trO/H12TmhF7kj7DUVQ1GtESm+ktiyeVkruKbPKPJy4h0HSfz7yZtyEIYWOyunfeSpNlATu4mK7q7Rq5fqOqCDDhy4GT2YzxzYUHfYBfHH/6f3AkrNgAXsylvUdfEnXZllyV0qJsW/6hPI2fT5HFaSxuPS4mOqOAHeRWd/WOYFuCoWgpTKbv62Qn69rNn4nGyWxN3auuFgAF+ia4vRsAjcFBpmOFdNJ3mEKdv5WJayljQC7KayT8b3L/vcGz16VZZk5VGVuPV7Y0NmTjrmfGFx15Yh3ud/TAcl2D7nScwPTY3xrJWBnPguI7XNw8M973c6ZSZ0HR6LIbBcJqTAFSBM4vekBJyrikX1NMCBYwPlEv2ulbJkmmqcEhOBX+wP7imbVfNBtgKZAY+C2Y7Qz/vARgEu9TWR4IM1YBK557/z4Bi4nrpqWh/DanK/hNrlBIyWrPgSTjQ5j60xc0FggSPTynOxvUnzpKUG+xBfjB6YFX8noJcmym0ZABRzFUbD7H4FRzB4lId+aUCm5Yk4qZ6oYtxjH8AEE1IUjAatj+JJfIAAAAAAAAAAAAAAA",
  giraffe: "data:image/webp;base64,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",
  flamingo: "data:image/webp;base64,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",
  gorilla: "data:image/webp;base64,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",
  zebra: "data:image/webp;base64,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",
  kamel: "data:image/webp;base64,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",
};

const mixName = (trip, lang) => trip.map((k, i) => TIERE[k][lang][i]).join("");

/* Exposure ramps the other way from the b/d drill: it opens long and works
   down to the slider setting, because a nine-letter nonsense word at rocket
   speed is not a reading task, it is a guess. Relative to the slider for the
   same reason the b/d ramp is — the slider is his one difficulty control, and
   a mode that ignores it is a mode he cannot make easier when he is stuck. */
const mixExposure = (i, speed) =>
  DUR[Math.max(0, Math.min(speed - (i < 4 ? 2 : i < 8 ? 1 : 0), DUR.length - 1))];

/* Which slot is left open, rotating over the round. The medial slot is the
   hardest — word-initial and word-final fragments both sit at an edge, where
   letters are least crowded and position is unambiguous — so it is neither
   first nor over-represented. */
const MIX_SLOTS = [0, 2, 1, 0, 2, 1, 0, 1, 2, 1];

/* Distractors are chosen for how much they overlap the right fragment, not at
   random. All four tiles show a plausible animal strip, so the picture can
   never be the cue; the only thing separating them is the printed syllable.
   If the foils were random the first letter would usually settle it, which is
   exactly the partial-decoding habit this mode exists to break. */
const fragScore = (a, b) => {
  let s = a[0].toLowerCase() === b[0].toLowerCase() ? 3 : 0;
  if (a.length === b.length) s += 2;
  const pool = b.toLowerCase().split("");
  for (const ch of a.toLowerCase()) {
    const at = pool.indexOf(ch);
    if (at >= 0) { s += 1; pool.splice(at, 1); }
  }
  return s;
};
const mixOptions = (answer, slot, lang, rnd) => {
  const right = TIERE[answer][lang][slot];
  const foils = TIER_ORDER
    .filter((k) => k !== answer && TIERE[k][lang][slot] !== right)
    .map((k) => ({ k, s: fragScore(TIERE[k][lang][slot], right) }))
    .sort((x, y) => y.s - x.s)
    .slice(0, MIX_TILES - 1)
    .map((x) => x.k);
  const all = [answer, ...foils];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
};

/* One round. Until he has built the Krogufant itself, exactly one item per
   round is set to it — otherwise the named creature the mode is built around
   is a 1-in-512 accident he might never meet. After that it is back to chance,
   and it is never scored: no badge, no tally, just the moment. */
function buildMixRound(L, lang) {
  const built = !!(L.tm || {}).krogu;
  const rnd = Math.random;
  const kroguAt = built ? -1 : Math.floor(rnd() * MIX_N);
  const items = [];
  for (let i = 0; i < MIX_N; i++) {
    let trip;
    if (i === kroguAt) trip = [...KROGU];
    else {
      do {
        trip = [0, 1, 2].map(() => TIER_ORDER[Math.floor(rnd() * TIER_ORDER.length)]);
      } while (!built && trip.join() === KROGU.join());
    }
    const slot = MIX_SLOTS[i % MIX_SLOTS.length];
    items.push({ trip, slot, answer: trip[slot], opts: mixOptions(trip[slot], slot, lang, rnd) });
  }
  return items;
}
const isKrogu = (trip) => trip.join() === KROGU.join();


/* Extra letter spacing on everything he has to read.
   Zorzi et al. (PNAS 2012) improved reading in dyslexic children on the fly,
   with no training at all, purely by widening inter-letter space — their
   manipulation was +2.5 pt on 14 pt, roughly what 0.14em gives here. Wider
   spacing reduces crowding between neighbouring letters, which is the step
   that has to succeed before a letter can be identified at all. It is the one
   typographic change with evidence behind it: the purpose-built dyslexia fonts
   (Dyslexie, OpenDyslexic) repeatedly show no benefit, and the single study
   that found one traced it to that font's spacing rather than its letterforms.
   Relevant here because b/d and m/n are 36 of his errors and both pairs are
   decided by fine detail at the letter's edge. */
const TRACK = "0.14em";

/* A miss holds the screen: the right answer stays up, tapping it plays the word
   again, and only this button moves on. Same three parts in all three games. */
const ContinueBtn = ({ onClick }) => (
  <button onClick={onClick} className="bigbtn" aria-label="weiter" style={{
    position: "absolute", right: 14, bottom: 12, width: 78, height: 78, borderRadius: "50%",
    background: C.green, border: `4px solid ${C.ink}`, boxShadow: "0 6px 0 rgba(34,49,74,.22)",
    fontSize: 34, color: "#fff", cursor: "pointer", paddingLeft: 6, zIndex: 2
  }}>▶</button>
);
const ReplayHint = () => (
  <span style={{
    position: "absolute", left: 16, bottom: 14, fontSize: 26, opacity: .5, pointerEvents: "none"
  }}>🔊</span>
);

function trimDays(days) {
  const ks = Object.keys(days).sort();
  while (ks.length > 60) delete days[ks.shift()];
}
/* The longest single uninterrupted stretch that can still be called practice.
   Past this he has walked off, and walking off earns nothing. */
const IDLE_MAX = 30;

/* Active time, measured span by span. Each answer credits the wall clock since
   the previous answer — the feedback he studied, the fixation dot, the flash
   and his own response window — so every millisecond of the loop lands in
   exactly one span and none of it is counted twice.

   This replaces `DUR + response`, which was a proxy for the same quantity and a
   poor one: it omitted the 500 ms fixation, the 950 ms correct-feedback and the
   entire hold-on-miss dwell, which is unbounded on purpose. Measured at speed 5
   with a 1.8 s response it credited 2.65 s of a 4.51 s item, so ten ring-minutes
   cost about seventeen real ones and "10 minutes a day" was not the target being
   asked for. Worse, the omitted stages are the ones a miss is made of, so the
   proxy paid least on exactly the days that were going badly — a bad session was
   punished with a longer sit.

   The cap is what keeps the original rule intact. An abandoned screen earns
   IDLE_MAX once and nothing after, so an idle open tab still cannot build a
   streak. Menus, the badge gallery, the parent dashboard, chunk-end and level-up
   screens fall outside every span by construction: the span restarts when play
   is entered, so time spent browsing trophies is never inside one. */
const span = (ref) => {
  const now = Date.now();
  const sec = ref.current ? Math.min((now - ref.current) / 1000, IDLE_MAX) : 0;
  ref.current = now;
  return sec > 0 ? sec : 0;
};

/* One answered question in any of the three games credits its active time to
   today's record and pays the daily minute milestones. All three call this.
   It used to be written inline in the reading loop only, so a mini-game answer
   moved the ⏱ ring and the flame — both read `days[today].s` — but could never
   trigger the 15/25-minute bonuses, and a day finished inside a mini-game lost
   them for good. The same minute must be worth the same wherever it was spent.
   Returns the milestone coins this answer earned. */
function creditDay(L, sec) {
  const day = L.days[tISO()] || (L.days[tISO()] = { s: 0, b1: 0, b2: 0 });
  day.s += sec;
  let bonus = 0;
  if (day.s >= 900 && !day.b1) { day.b1 = 1; bonus += 10; }
  if (day.s >= 1500 && !day.b2) { day.b2 = 1; bonus += 25; }
  trimDays(L.days);
  return bonus;
}
function calcStreak(days) {
  let n = 0;
  const d = new Date();
  if ((days[tISO(d)] || {}).s >= 600) n++;
  d.setDate(d.getDate() - 1);
  while ((days[tISO(d)] || {}).s >= 600) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ------------------------- parent analytics ---------------------- */
/* best-effort single-substitution alignment for target/chosen of equal
   or ±1 length; returns [[targetChar, chosenChar], ...] mismatch pairs */
function letterDiffs(target, chosen) {
  const tl = target.length, cl = chosen.length;
  if (Math.abs(tl - cl) > 1) return [];
  if (tl === cl) {
    const out = [];
    for (let i = 0; i < tl; i++) if (target[i] !== chosen[i]) out.push([target[i], chosen[i]]);
    return out;
  }
  const longer = tl > cl ? target : chosen, shorter = tl > cl ? chosen : target;
  let best = null;
  for (let skip = 0; skip <= longer.length - shorter.length; skip++) {
    const reduced = longer.slice(0, skip) + longer.slice(skip + 1);
    let mism = 0;
    for (let i = 0; i < shorter.length; i++) if (reduced[i] !== shorter[i]) mism++;
    if (!best || mism < best.mism) best = { reduced, mism };
  }
  const out = [];
  for (let i = 0; i < shorter.length; i++) {
    if (best.reduced[i] !== shorter[i]) {
      const a = tl > cl ? best.reduced[i] : shorter[i];
      const b = tl > cl ? shorter[i] : best.reduced[i];
      out.push([a, b]);
    }
  }
  return out;
}
/* aggregates every logged wrong-tile choice into word-pair and
   letter-pair (bidirectional) confusion tallies */
/* ---- what kind of mistake was that? ------------------------------------
   Four mechanisms, four different fixes, and the app was scoring them
   identically. From a real export of 208 errors:
     geraten  85 (41%)  chose another real word — sieht->siegt, mein->nein
     Vokal    59 (28%)  consonant frame intact, vowel wrong — nicht->necht
     Form     36 (17%)  stem-and-bowl letters — der->ber, kann->kamn
     Klang    16 (8%)   word-final devoicing — ist->isd, Tag->Tak
   The last one is not a reading failure at all: German neutralises /d/ and /t/
   word-finally, so `isd` and `ist` are homophones and no amount of sounding out
   separates them. It needs Verlängern (Tag -> Tage), not more flash practice.
   Grouping it with der->ber hides that.                                     */
const FORM_PAIRS = ["bd", "mn", "pq", "iü", "uü", "oö", "aä", "nm"].map((p) => p.split("").sort().join(""));
const VOICE_PAIRS = ["dt", "bp", "gk", "sz", "fv"].map((p) => p.split("").sort().join(""));
const MISS_KINDS = {
  guess: { key: "guess", icon: "💭", de: "geraten", en: "guessed" },
  vowel: { key: "vowel", icon: "🅰", de: "Vokal", en: "vowel" },
  form: { key: "form", icon: "🔤", de: "sieht ähnlich", en: "looks alike" },
  sound: { key: "sound", icon: "🔊", de: "klingt gleich", en: "sounds alike" },
  other: { key: "other", icon: "❓", de: "anderes", en: "other" }
};
function classifyMiss(target, chosen, lang) {
  if (REAL[lang].has(chosen.toLowerCase())) return "guess";   // a real word he could have been aiming at
  const t = target.toLowerCase(), c = chosen.toLowerCase();
  if (t.length !== c.length) return "other";
  const diff = [];
  for (let i = 0; i < t.length; i++) if (t[i] !== c[i]) diff.push([t[i], c[i], i]);
  if (diff.length !== 1) return "other";
  const [a, b, i] = diff[0];
  const pair = [a, b].sort().join("");
  const V = VOWELS[lang];
  /* word-final voicing first: in German it is genuinely unhearable, so it
     outranks the fact that d/t also look a little alike */
  if (VOICE_PAIRS.includes(pair) && i === t.length - 1) return "sound";
  if (FORM_PAIRS.includes(pair)) return "form";
  if (V.includes(a) && V.includes(b)) return "vowel";
  if (VOICE_PAIRS.includes(pair)) return "sound";
  return "other";
}
function missKinds(L, lang) {
  const tally = {}, egs = {};
  Object.keys(MISS_KINDS).forEach((k) => { tally[k] = 0; egs[k] = []; });
  Object.keys(L.words).forEach((word) => {
    const mx = L.words[word].mx;
    if (!mx) return;
    Object.keys(mx).forEach((chosen) => {
      const k = classifyMiss(word, chosen, lang);
      tally[k] += mx[chosen];
      egs[k].push({ target: word, chosen, count: mx[chosen] });
    });
  });
  Object.keys(egs).forEach((k) => egs[k].sort((a, b) => b.count - a.count));
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  return { tally, egs, total };
}

/* which letterform pairs have earned their own drill?
   Only shape pairs (b/d, m/n, p/q…) — vowel confusions go to Vokal-Blitz, and
   word-final devoicing is not a looking problem at all. The threshold exists so
   this mode is temporary: it appears when a pair is actually costing him
   answers and disappears once it stops. */
const LETTER_PAIR_MIN = 8;
const PAIR_RETIRE_N = 20;      // drill answers needed before a pair can retire
const PAIR_RETIRE_ACC = 0.9;
/* A pair retires once the drill itself shows he has it: PAIR_RETIRE_N answers
   at PAIR_RETIRE_ACC or better. Without this the mode would be permanent —
   `mx` is a lifetime tally and only ever grows, so a pair that crossed the
   threshold once could never fall back under it no matter how well he read
   afterwards. Retirement is what makes the launcher temporary. */
const pairRetired = (L, key) => {
  const rec = (L.lp || {})[key];
  if (!rec || !rec.h || rec.h.length < PAIR_RETIRE_N) return false;
  let hit = 0; for (const x of rec.h) hit += x;
  return hit / rec.h.length >= PAIR_RETIRE_ACC;
};
function letterPairsNeedingWork(L, lang) {
  const { letterList } = analyzeConfusions(L);
  return letterList
    .filter((l) => {
      const k = l.pair.split("↔").sort().join("");
      return FORM_PAIRS.includes(k) && l.count >= LETTER_PAIR_MIN &&
        !VOWELS[lang].includes(k[0]) && !VOWELS[lang].includes(k[1]) &&
        !pairRetired(L, k);
    })
    .map((l) => ({ a: l.pair.split("↔")[0], b: l.pair.split("↔")[1], count: l.count }));
}

function analyzeConfusions(L) {
  const letters = {}, pairs = [];
  Object.keys(L.words).forEach((word) => {
    const mx = L.words[word].mx;
    if (!mx) return;
    Object.keys(mx).forEach((chosen) => {
      const count = mx[chosen];
      pairs.push({ target: word, chosen, count });
      letterDiffs(word, chosen).forEach(([a, b]) => {
        const key = [a.toLowerCase(), b.toLowerCase()].sort().join("↔");
        letters[key] = (letters[key] || 0) + count;
      });
    });
  });
  pairs.sort((a, b) => b.count - a.count);
  const letterList = Object.entries(letters).map(([pair, count]) => ({ pair, count })).sort((a, b) => b.count - a.count);
  return { pairs, letterList };
}
function levelStats(L, list) {
  return list.map((lvl) => {
    let mastered = 0, learning = 0, neu = 0, attempts = 0, correct = 0;
    lvl.forEach((e) => {
      const ws = L.words[e[0]];
      if (!ws) { neu++; return; }
      if (ws.s === 2) mastered++; else if (ws.s === 1) learning++; else neu++;
      attempts += ws.r + ws.wr; correct += ws.r;
    });
    return { mastered, learning, neu, attempts, correct, total: lvl.length };
  });
}
function tierCounts(L) {
  const c = [0, 0, 0];
  Object.values(L.words).forEach((ws) => {
    if (ws.s === 2 && ws.tn) { const t = tiOf(ws.tn); if (t >= 0) c[t]++; }
  });
  return c;
}
/* every word in the curriculum bucketed by graduated mastery level,
   including untouched ones (counted as level 0) — the parent-dashboard
   answer to "what does mastered mean" */
function levelCounts(L, list) {
  const c = { "-1": 0, "0": 0, "1": 0, "2": 0, "3": 0, "4": 0 };
  list.forEach((lvl) => lvl.forEach((e) => { c[String(wordLevel(L.words[e[0]]))]++; }));
  return c;
}
/* words whose next spaced-repetition review is due today or overdue —
   makes the actual scheduling visible instead of implicit */
function dueList(L, list, n = 12) {
  const today = tISO();
  const flat = list.flat().map((e) => e[0]);
  const due = flat.filter((w) => L.words[w] && L.words[w].due && L.words[w].due <= today);
  due.sort((a, b) => (L.words[a].due < L.words[b].due ? -1 : 1));
  return due.slice(0, n).map((w) => ({ word: w, ws: L.words[w], overdue: L.words[w].due < today }));
}
/* how many level-2+ words currently sit at each expanding-interval
   stage (3/7/14/30 days) — the spacing schedule itself, visualized */
function intervalCounts(L) {
  const c = [0, 0, 0, 0];
  Object.values(L.words).forEach((ws) => { if (ws.s === 2 && ws.iv >= 0 && ws.iv < IVL.length) c[ws.iv]++; });
  return c;
}
function weakestWords(L, n = 8) {
  return Object.entries(L.words)
    .filter(([, ws]) => ws.r + ws.wr >= 3)
    .map(([word, ws]) => ({
      word, acc: ws.r / (ws.r + ws.wr), att: ws.r + ws.wr,
      tier: ws.s === 2 && ws.tn ? tiOf(ws.tn) : -1,
      top: ws.mx ? Object.entries(ws.mx).sort((a, b) => b[1] - a[1])[0] : null
    }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, n);
}
function dailyMinutes(L, n = 14) {
  const out = [], base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base); d.setDate(base.getDate() - i);
    const iso = tISO(d);
    out.push({ date: iso, min: ((L.days[iso] || {}).s || 0) / 60 });
  }
  return out;
}

/* ---------------------------- achievements ------------------------ */
/* 10 categories x 10 tiers = 100 badges. Fast-firing categories (first-
   time events, lifetime volume, daily minutes) front-load easy wins so
   the first few sessions unlock several; slow categories (multi-day
   mastery, level completion, day-streaks, gold/rocket tier) can't
   mathematically complete early — SRS mastery alone needs 2 calendar
   days per word — so they naturally taper the rate to roughly one
   every few sessions as real progress accumulates. */
const CAT_NAMES = {
  start: ["Erste Schritte", "Getting Started"],
  streak: ["Richtige in Folge", "Correct in a Row"],
  volume: ["Fragen beantwortet", "Questions Answered"],
  mastery: ["Wörter gemeistert", "Words Mastered"],
  minutes: ["Tägliche Übung", "Daily Practice"],
  days: ["Tage-Serie", "Day Streak"],
  speed: ["Perfektes Tempo", "Perfect at Speed"],
  reach: ["Übungs-Stufen", "Practice Levels"],
  star: ["Stufen gemeistert", "Levels Mastered"],
  gold: ["Turbo & Gold", "Turbo & Gold"],
  vowel: ["Vokal-Blitz", "Vowel Blitz"],
  letters: ["Buchstaben-Blitz", "Letter Blitz"],
  mix: ["Tier-Blitz", "Animal Blitz"]
};
const CAT_ORDER = ["start", "streak", "volume", "mastery", "minutes", "days", "speed", "reach", "star", "gold", "vowel", "letters", "mix"];

/* factory for a straight numeric-threshold ladder, DRYs out 8 of the
   10 categories which are otherwise near-identical boilerplate.
   deTpl/enTpl are functions of n so word order can stay natural
   ("Stufe 5", not "5 Stufe") — titles are kept to 1-3 short, common
   words since the child himself has to read these mid-game.
   deDescTpl/enDescTpl generate the longer explanation shown when a
   badge is tapped — these can be fuller sentences since they're only
   read on demand, not against the clock. */
const ladder = (prefix, cat, icon, thresholds, deTpl, enTpl, statKey, deDescTpl, enDescTpl) =>
  thresholds.map((n, i) => ({
    id: `${prefix}${i + 1}`, cat, icon,
    de: deTpl(n), en: enTpl(n),
    deDesc: deDescTpl(n), enDesc: enDescTpl(n),
    check: (S) => S[statKey] >= n
  }));

const SPEED_NAMES = {
  de: ["Schildkröte", "Spaziergänger", "Fahrrad", "Roller", "Läufer", "Pferd", "Auto", "Rennwagen", "Flugzeug", "Rakete"],
  en: ["Turtle", "Walker", "Bike", "Scooter", "Runner", "Horse", "Car", "Race Car", "Plane", "Rocket"]
};

const ACHIEVEMENTS = [
  // A — Erste Schritte: distinct first-time events, not numeric ladders
  // (those live in the other 9 categories), so session 1 has a handful
  // of quick, varied wins without duplicating a single metric ten times.
  { id: "a1", cat: "start", icon: "✅", de: "Richtig!", en: "Correct!",
    deDesc: "Beantworte eine einzige Frage richtig.", enDesc: "Answer a single question correctly.",
    check: (S) => S.totalCorrect >= 1 },
  { id: "a2", cat: "start", icon: "💪", de: "Kein Problem!", en: "No Problem!",
    deDesc: "Beantworte eine Frage falsch — das gehört zum Lernen dazu.", enDesc: "Get one question wrong — that's part of learning.",
    check: (S) => S.totalWrong >= 1 },
  { id: "a3", cat: "start", icon: "🏁", de: "Geschafft!", en: "Done!",
    deDesc: "Schließe eine Übungsrunde ab.", enDesc: "Finish one practice round.",
    check: (S) => S.chunksDone >= 1 },
  { id: "a4", cat: "start", icon: "💯", de: "Perfekt!", en: "Perfect!",
    deDesc: "Schaffe eine Runde mit mindestens 10 Fragen ganz ohne Fehler.", enDesc: "Complete a round of at least 10 questions with zero mistakes.",
    check: (S) => S.hadPerfectChunk },
  { id: "a5", cat: "start", icon: "🌍", de: "Zwei Sprachen!", en: "Two Languages!", shared: true,
    deDesc: "Spiele mindestens eine Frage auf Deutsch und eine auf Englisch.", enDesc: "Play at least one question in German and one in English.",
    check: (S) => S.bothTried },
  { id: "a6", cat: "start", icon: "📖", de: "Erstes Wort!", en: "First Word!",
    deDesc: "Bringe dein erstes Wort auf die Stufe \"Flüssig\".", enDesc: "Bring your first word to the \"Fluent\" stage.",
    check: (S) => S.masteredWords >= 1 },
  { id: "a7", cat: "start", icon: "🔥", de: "Erster Tag!", en: "First Day!", shared: true,
    deDesc: "Übe an einem Tag mindestens 10 Minuten.", enDesc: "Practice at least 10 minutes in one day.",
    check: (S) => S.bestStreakDays >= 1 },
  { id: "a8", cat: "start", icon: "📈", de: "Neue Stufe!", en: "New Level!",
    deDesc: "Schalte eine neue Übungs-Stufe frei.", enDesc: "Unlock a new practice level.",
    check: (S) => S.reach >= 2 },
  { id: "a9", cat: "start", icon: "🏆", de: "Stufe fertig!", en: "Level Done!",
    deDesc: "Meistere eine ganze Stufe komplett — mindestens 90% der Wörter, an 2 verschiedenen Tagen.", enDesc: "Fully master an entire level — at least 90% of its words, on 2 different days.",
    check: (S) => S.star >= 2 },
  { id: "a10", cat: "start", icon: "🎚️", de: "Tempo!", en: "Speed!",
    deDesc: "Verstelle zum ersten Mal den Tempo-Schieberegler.", enDesc: "Move the speed slider for the first time.",
    check: (S) => S.speedChanged },

  ...ladder("b", "streak", "🔥", [5, 10, 15, 20, 30, 40, 50, 75, 100, 150],
    (n) => `${n} Treffer!`, (n) => `${n} in a Row!`, "bestStreakEver",
    (n) => `Beantworte ${n} Fragen hintereinander richtig, ohne einen Fehler dazwischen.`,
    (n) => `Answer ${n} questions correctly in a row, with no mistake in between.`),
  ...ladder("c", "volume", "🎯", [25, 50, 100, 200, 350, 500, 750, 1000, 1500, 2500],
    (n) => `${n} Fragen`, (n) => `${n} Questions`, "totalAttempts",
    (n) => `Beantworte insgesamt ${n} Fragen — richtig oder falsch zählen beide.`,
    (n) => `Answer a total of ${n} questions — right or wrong both count.`),
  ...ladder("d", "mastery", "📖", [5, 10, 20, 35, 50, 75, 100, 125, 150, 200],
    (n) => `${n} Wörter`, (n) => `${n} Words`, "masteredWords",
    (n) => `Bringe insgesamt ${n} Wörter dieser Sprache auf die Stufe "Flüssig".`,
    (n) => `Bring a total of ${n} words in this language to the "Fluent" stage.`),
  ...ladder("e", "minutes", "⏱️", [5, 10, 15, 20, 25, 30, 40, 50, 60, 90],
    (n) => `${n} Min.`, (n) => `${n} Min`, "minutesToday",
    (n) => `Übe an einem einzigen Tag insgesamt ${n} Minuten (Deutsch und Englisch zusammen).`,
    (n) => `Practice a total of ${n} minutes in a single day (German and English combined).`)
    .map((a) => ({ ...a, shared: true })),
  ...ladder("f", "days", "📅", [2, 3, 5, 7, 10, 14, 21, 30, 60, 100],
    (n) => `${n} Tage`, (n) => `${n} Days`, "bestStreakDays",
    (n) => `Erreiche ${n} Tage in Folge mit je mindestens 10 Minuten Übung.`,
    (n) => `Reach ${n} days in a row with at least 10 minutes of practice each.`)
    .map((a) => ({ ...a, shared: true })),

  // G — one per named slider speed (turtle through rocket): a perfect
  // (0-miss, >=10 question) round played at that exact setting. "100%
  // on horse speed" is g6 below. Badge icon IS the speed icon, so the
  // title only needs the number; the description names the speed.
  ...SPEED_ICONS.map((icon, i) => ({
    id: `g${i + 1}`, cat: "speed", icon,
    de: "100%", en: "100%",
    deDesc: `Schaffe eine Runde mit mindestens 10 Fragen bei ${SPEED_NAMES.de[i]}-Tempo (${icon}) ganz ohne Fehler.`,
    enDesc: `Complete a round of at least 10 questions at ${SPEED_NAMES.en[i]} speed (${icon}) with zero mistakes.`,
    check: (S) => !!S.perfectSpeeds[i]
  })),

  ...ladder("h", "reach", "📚", [2, 3, 4, 5, 6, 7, 8, 9, 10],
    (n) => `Stufe ${n}`, (n) => `Level ${n}`, "reach",
    (n) => `Schalte Stufe ${n} zum Üben frei (geht schon ab 70% der vorigen Stufe).`,
    (n) => `Unlock level ${n} for practice (possible once 70% of the previous level is done).`),
  { id: "h10", cat: "reach", icon: "📚", de: "Alles offen!", en: "All Open!", shared: true,
    deDesc: "Schalte alle 10 Stufen zum Üben frei — in beiden Sprachen.", enDesc: "Unlock all 10 levels for practice — in both languages.",
    check: (S) => S.bothReach10 },

  ...ladder("i", "star", "⭐", [2, 3, 4, 5, 6, 7, 8, 9, 10],
    (n) => `Stufe ${n}`, (n) => `Level ${n}`, "star",
    (n) => `Meistere Stufe ${n - 1} komplett — mindestens 90% der Wörter, an 2 verschiedenen Tagen.`,
    (n) => `Fully master level ${n - 1} — at least 90% of its words, on 2 different days.`),
  { id: "i10", cat: "star", icon: "⭐", de: "Alles gemeistert!", en: "All Mastered!",
    deDesc: "Meistere alle 10 Stufen dieser Sprache komplett.", enDesc: "Fully master all 10 levels of this language.",
    check: (S) => S.fullCurriculumDone },

  ...ladder("j", "gold", "🚀", [1, 5, 10, 20, 40, 75, 120, 180],
    (n) => `${n} Rakete`, (n) => `${n} Rocket`, "rocketWords",
    (n) => `Bringe insgesamt ${n} Wörter dieser Sprache auf Raketen-Tempo (mind. 2× richtig bei ≤500ms).`,
    (n) => `Bring a total of ${n} words in this language to rocket speed (at least 2 correct answers at ≤500ms).`),
  { id: "j9", cat: "gold", icon: "🥇", de: "Gold!", en: "Gold!",
    deDesc: "Bringe eine ganze Stufe auf Raketen-Tempo — alle 20 Wörter gemeistert UND auf Raketen-Tempo bestätigt.",
    enDesc: "Bring an entire level to rocket speed — all 20 words mastered AND confirmed at rocket speed.",
    check: (S) => S.goldLevels >= 1 },
  { id: "j10", cat: "gold", icon: "🥇", de: "Alles Gold!", en: "All Gold!",
    deDesc: "Bringe alle 10 Stufen dieser Sprache komplett auf Raketen-Tempo.", enDesc: "Bring all 10 levels of this language fully to rocket speed.",
    check: (S) => S.allGold },

  /* K — Vokal-Blitz. Deliberately not another volume ladder bolted on: two
     entry badges, three volume steps, then streak, breadth, two perfect-round
     steps and one quality badge. The quality badge (k10) is the only one that
     can be lost by rushing, which is the point — the mode exists because vowels
     were being guessed, and a badge for guessing fast would undo it. */
  { id: "k1", cat: "vowel", icon: "🅰", de: "Erster Vokal!", en: "First Vowel!",
    deDesc: "Beantworte deine erste Frage im Vokal-Blitz.", enDesc: "Answer your first question in Vowel Blitz.",
    check: (S) => S.vTotal >= 1 },
  { id: "k2", cat: "vowel", icon: "🏁", de: "Runde fertig!", en: "Round Done!",
    deDesc: "Spiele eine ganze Vokal-Blitz-Runde zu Ende.", enDesc: "Play a whole Vowel Blitz round to the end.",
    check: (S) => S.vRounds >= 1 },
  ...ladder("k", "vowel", "🅰", [25, 100, 250, 500],
    (n) => `${n} Vokale`, (n) => `${n} Vowels`, "vTotal",
    (n) => `Beantworte insgesamt ${n} Fragen im Vokal-Blitz.`,
    (n) => `Answer a total of ${n} questions in Vowel Blitz.`).map((a, i) => ({ ...a, id: `k${i + 3}` })),
  { id: "k7", cat: "vowel", icon: "🔥", de: "10 am Stück!", en: "10 Straight!",
    deDesc: "Triff im Vokal-Blitz 10 Vokale hintereinander richtig.", enDesc: "Get 10 vowels right in a row in Vowel Blitz.",
    check: (S) => S.vBest >= 10 },
  { id: "k8", cat: "vowel", icon: "📚", de: "30 Wörter", en: "30 Words",
    deDesc: "Übe 30 verschiedene Wörter im Vokal-Blitz.", enDesc: "Practise 30 different words in Vowel Blitz.",
    check: (S) => S.vWords >= 30 },
  { id: "k9", cat: "vowel", icon: "💯", de: "Alles richtig!", en: "All Correct!",
    deDesc: "Schaffe eine ganze Vokal-Blitz-Runde ohne einen einzigen Fehler.", enDesc: "Complete a whole Vowel Blitz round without a single mistake.",
    check: (S) => S.vPerfect >= 1 },
  { id: "k10", cat: "vowel", icon: "🎓", de: "Vokal-Meister", en: "Vowel Master",
    deDesc: "Erreiche 90% richtige Antworten im Vokal-Blitz — über mindestens 100 Fragen gerechnet.",
    enDesc: "Reach 90% correct in Vowel Blitz — measured over at least 100 questions.",
    check: (S) => S.vTotal >= 100 && S.vCorrect / S.vTotal >= 0.9 },

  /* L — Buchstaben-Blitz. Same shape, but l10 is the one that matters: a pair
     is "cleared" when the drill itself shows 20 answers at 90%+, which is also
     what makes the launcher disappear. It is the only badge in the app awarded
     for no longer needing a feature. */
  { id: "l1", cat: "letters", icon: "🔤", de: "Erster Buchstabe!", en: "First Letter!",
    deDesc: "Beantworte deine erste Frage im Buchstaben-Blitz.", enDesc: "Answer your first question in Letter Blitz.",
    check: (S) => S.lTotal >= 1 },
  { id: "l2", cat: "letters", icon: "🏁", de: "Runde fertig!", en: "Round Done!",
    deDesc: "Spiele eine ganze Buchstaben-Blitz-Runde zu Ende.", enDesc: "Play a whole Letter Blitz round to the end.",
    check: (S) => S.lRounds >= 1 },
  ...ladder("l", "letters", "🔤", [25, 100, 250, 500],
    (n) => `${n} Buchstaben`, (n) => `${n} Letters`, "lTotal",
    (n) => `Beantworte insgesamt ${n} Fragen im Buchstaben-Blitz.`,
    (n) => `Answer a total of ${n} questions in Letter Blitz.`).map((a, i) => ({ ...a, id: `l${i + 3}` })),
  { id: "l7", cat: "letters", icon: "🔥", de: "10 am Stück!", en: "10 Straight!",
    deDesc: "Triff im Buchstaben-Blitz 10 Buchstaben hintereinander richtig.", enDesc: "Get 10 letters right in a row in Letter Blitz.",
    check: (S) => S.lBest >= 10 },
  { id: "l8", cat: "letters", icon: "💯", de: "Alles richtig!", en: "All Correct!",
    deDesc: "Schaffe eine ganze Buchstaben-Blitz-Runde ohne einen einzigen Fehler.", enDesc: "Complete a whole Letter Blitz round without a single mistake.",
    check: (S) => S.lPerfect >= 1 },
  { id: "l9", cat: "letters", icon: "🏅", de: "5× perfekt", en: "5× Perfect",
    deDesc: "Schaffe fünf Buchstaben-Blitz-Runden ganz ohne Fehler.", enDesc: "Complete five Letter Blitz rounds with no mistakes at all.",
    check: (S) => S.lPerfect >= 5 },
  { id: "l10", cat: "letters", icon: "🎓", de: "Paar geknackt!", en: "Pair Cracked!",
    deDesc: "Kriege ein Buchstaben-Paar wie b/d ganz sicher hin — 20 Antworten mit mindestens 90% richtig. Dann verschwindet die Übung von selbst.",
    enDesc: "Master a letter pair like b/d for good — 20 answers at 90% or better. The drill then disappears on its own.",
    check: (S) => S.lPairsRetired >= 1 },

  /* M — Tier-Blitz. Same shape again: two entry badges, a four-step volume
     ladder, a streak, a breadth badge, and one quality badge at the end.
     m10 mirrors k10 deliberately — 90% over at least 100 answers cannot be
     won by going faster, which is the whole reason these modes exist. There
     is no badge for the Krogufant: it is a 1-in-512 moment, and scoring it
     would turn a surprise into a target.

     m3-m6 come off the shared `ladder` factory, whose generated ids would be
     m1-m4 and collide with the two hand-written entries above. Same remap as
     k and l. A collision would put two badges in one unlock slot and quietly
     make one of them unreachable, so test_animal_mix checks one hand-written
     (m1) and one remapped (m3) badge in the same run. */
  { id: "m1", cat: "mix", icon: "\u{1F40A}", de: "Erstes Tier!", en: "First Animal!",
    deDesc: "Beantworte deine erste Frage im Tier-Blitz.", enDesc: "Answer your first question in Animal Blitz.",
    check: (S) => S.mTotal >= 1 },
  { id: "m2", cat: "mix", icon: "\u{1F3C1}", de: "Runde fertig!", en: "Round Done!",
    deDesc: "Spiele eine ganze Tier-Blitz-Runde zu Ende.", enDesc: "Play a whole Animal Blitz round to the end.",
    check: (S) => S.mRounds >= 1 },
  ...ladder("m", "mix", "\u{1F9E9}", [25, 100, 250, 500],
    (n) => `${n} Tiere`, (n) => `${n} Animals`, "mTotal",
    (n) => `Beantworte insgesamt ${n} Fragen im Tier-Blitz.`,
    (n) => `Answer a total of ${n} questions in Animal Blitz.`).map((a, i) => ({ ...a, id: `m${i + 3}` })),
  { id: "m7", cat: "mix", icon: "\u{1F525}", de: "10 am St\u00fcck!", en: "10 Straight!",
    deDesc: "Setze im Tier-Blitz 10 Streifen hintereinander richtig ein.", enDesc: "Place 10 strips correctly in a row in Animal Blitz.",
    check: (S) => S.mBest >= 10 },
  { id: "m8", cat: "mix", icon: "\u{1F993}", de: "Alle 8 Tiere", en: "All 8 Animals",
    deDesc: "Setze jedes der acht Tiere mindestens einmal richtig ein.", enDesc: "Place each of the eight animals correctly at least once.",
    check: (S) => S.mAnimals >= 8 },
  { id: "m9", cat: "mix", icon: "\u{1F4AF}", de: "Alles richtig!", en: "All Correct!",
    deDesc: "Schaffe eine ganze Tier-Blitz-Runde ohne einen einzigen Fehler.", enDesc: "Complete a whole Animal Blitz round without a single mistake.",
    check: (S) => S.mPerfect >= 1 },
  { id: "m10", cat: "mix", icon: "\u{1F393}", de: "Tier-Meister", en: "Animal Master",
    deDesc: "Erreiche 90% richtige Antworten im Tier-Blitz \u2014 \u00fcber mindestens 100 Fragen gerechnet.",
    enDesc: "Reach 90% correct in Animal Blitz \u2014 measured over at least 100 questions.",
    check: (S) => S.mTotal >= 100 && S.mCorrect / S.mTotal >= 0.9 }
];

/* Everything the checks read, for ONE language. Each language keeps its own
   gallery of 120, so a badge means "he did this in German" or "he did this in
   English" and never a blur of the two. `S` therefore reports that language's
   words, levels, mini-game records and bookkeeping.

   The exceptions are marked `shared: true` on the badge and are the reason the
   *other* language's blob is still passed in: practice minutes, the day streak,
   "Zwei Sprachen!" and "Alles offen!" are not claims about reading a particular
   language. Time at the iPad is time at the iPad, so those stay pooled and land
   in both galleries at once. */
function computeStats(data, ach, lang) {
  const other = lang === "de" ? "en" : "de";
  const L = data[lang], O = data[other];
  const list = LISTS[lang], oList = LISTS[other];
  const b = ach[lang] || {};
  const w = Object.values(L.words);
  const totalAttempts = w.reduce((a, x) => a + x.r + x.wr, 0);
  const totalCorrect = w.reduce((a, x) => a + x.r, 0);
  const today = tISO();
  const lvl10Done = (X, xl) => levelStats(X, xl)[xl.length - 1].mastered >= Math.ceil(xl[xl.length - 1].length * 0.9);
  const st = starLevel(L, list);
  return {
    totalAttempts, totalCorrect, totalWrong: totalAttempts - totalCorrect,
    masteredWords: w.filter((x) => x.s === 2).length,
    reach: reachLevel(L, list),
    star: st,
    fullCurriculumDone: st === 10 && lvl10Done(L, list),
    rocketWords: w.filter((x) => x.tn && tiOf(x.tn) === 2).length,
    goldLevels: list.filter((lvl) => isGoldLevel(L, lvl)).length,
    allGold: list.every((lvl) => isGoldLevel(L, lvl)),
    bestStreakEver: b.bestStreak || 0,
    perfectSpeeds: b.perfectSpeeds || {},
    hadPerfectChunk: Object.keys(b.perfectSpeeds || {}).length > 0,
    chunksDone: b.chunksDone || 0,
    speedChanged: !!b.speedChanged,

    /* pooled — the `shared` badges read these */
    minutesToday: (((L.days[today] || {}).s || 0) + ((O.days[today] || {}).s || 0)) / 60,
    bestStreakDays: Math.max(calcStreak(L.days), calcStreak(O.days)),
    bothTried: w.some((x) => x.r + x.wr > 0) && Object.values(O.words).some((x) => x.r + x.wr > 0),
    bothReach10: reachLevel(L, list) === 10 && reachLevel(O, oList) === 10,

    /* mini-game totals. `vk` sits on each word and `lp` on the language blob,
       so both are already per-language. Round-level facts (rounds finished,
       perfect rounds, best run) cannot be recovered from the stored records,
       so they live in that language's bookkeeping alongside chunksDone. */
    ...miniStats(L, b)
  };
}
function miniStats(L, b) {
  let vTotal = 0, vCorrect = 0, vWords = 0;
  Object.values(L.words).forEach((w) => {
    if (!w.vk) return;
    const n = (w.vk.r || 0) + (w.vk.wr || 0);
    if (!n) return;
    vTotal += n; vCorrect += w.vk.r || 0; vWords++;
  });
  let lTotal = 0, lCorrect = 0, lPairsRetired = 0;
  Object.entries(L.lp || {}).forEach(([key, rec]) => {
    lTotal += (rec.r || 0) + (rec.wr || 0); lCorrect += rec.r || 0;
    if (pairRetired(L, key)) lPairsRetired++;
  });
  const tm = L.tm || {};
  const mCorrect = tm.r || 0, mTotal = mCorrect + (tm.wr || 0);
  const mAnimals = Object.keys(tm.seen || {}).length;
  return {
    vTotal, vCorrect, vWords, lTotal, lCorrect, lPairsRetired, mTotal, mCorrect, mAnimals,
    vRounds: b.vRounds || 0, vPerfect: b.vPerfect || 0, vBest: b.vBest || 0,
    lRounds: b.lRounds || 0, lPerfect: b.lPerfect || 0, lBest: b.lBest || 0,
    mRounds: b.mRounds || 0, mPerfect: b.mPerfect || 0, mBest: b.mBest || 0
  };
}
/* one language's gallery plus the bookkeeping only the checks use */
const freshSet = () => ({
  unlocked: {}, seen: {}, bestStreak: 0, perfectSpeeds: {}, chunksDone: 0, speedChanged: false,
  vRounds: 0, vPerfect: 0, vBest: 0, lRounds: 0, lPerfect: 0, lBest: 0,
  mRounds: 0, mPerfect: 0, mBest: 0
});
const freshAch = () => ({ v: 3, de: freshSet(), en: freshSet() });
const otherLang = (l) => (l === "de" ? "en" : "de");
const setBook = (ach, lg, patch) => ({ ...ach, [lg]: { ...ach[lg], ...patch } });

/* Saves written before the split hold a single flat gallery. Everything in it
   was earned reading German, so it becomes the German set unchanged, unlock
   dates and all: nothing is re-evaluated and nothing is ever taken away.
   English starts empty apart from the shared badges, which are already true of
   him — those are copied across with their original dates and marked seen,
   because otherwise the first check after the update would fire twenty-odd
   toasts at him in a row for things he earned weeks ago.

   Same reasoning as the `seen` seeding this replaces, and the same rule: the
   result is written back to storage immediately, never left in memory only. */
function migrateAch(saved) {
  if (!saved) return freshAch();
  if (saved.unlocked) {
    const de = { ...freshSet(), ...saved };
    delete de.v;
    if (!saved.seen) {
      de.seen = {};
      Object.keys(de.unlocked).forEach((id) => { de.seen[id] = true; });
    }
    const en = freshSet();
    ACHIEVEMENTS.filter((a) => a.shared).forEach((a) => {
      if (de.unlocked[a.id]) { en.unlocked[a.id] = de.unlocked[a.id]; en.seen[a.id] = true; }
    });
    return { v: 3, de, en };
  }
  return { v: 3, de: { ...freshSet(), ...(saved.de || {}) }, en: { ...freshSet(), ...(saved.en || {}) } };
}
/* Which badges he has not looked at yet, in one gallery. `seen` is marked on
   *leaving* the badge screen, never on entering it — mark on entry and the star
   would be cleared by the very act of going to look for it. */
const unseenSet = (ach, lg) => ACHIEVEMENTS.filter((a) => ach[lg].unlocked[a.id] && !(ach[lg].seen || {})[a.id]);
const unseenAny = (ach) => unseenSet(ach, "de").length + unseenSet(ach, "en").length;
/* returns the achievement objects that just became true in `lang`'s gallery and
   weren't already unlocked there — caller merges these into that set */
function checkNewUnlocks(data, ach, lang) {
  const S = computeStats(data, ach, lang);
  return ACHIEVEMENTS.filter((a) => !ach[lang].unlocked[a.id] && a.check(S));
}

/* ----------------------------- audio ---------------------------- */
let AC = null;
/* speechSynthesis.getVoices() is asynchronous and very commonly
   returns [] on the first call — the standard fix is to wait for the
   'voiceschanged' event, but Safari's support for that event is
   inconsistent, so a short poll runs alongside it as a fallback. */
let voiceList = [];
const loadVoices = () => {
  try {
    const vs = window.speechSynthesis.getVoices();
    if (vs && vs.length) voiceList = vs;
  } catch (e) {}
};
const initVoices = () => {
  try {
    if (!window.speechSynthesis) return;
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    let tries = 0;
    const poll = setInterval(() => {
      loadVoices();
      if (voiceList.length || ++tries > 10) clearInterval(poll);
    }, 300);
  } catch (e) {}
};
const voicesForLang = (lg) => voiceList.filter((v) => v.lang && v.lang.toLowerCase().startsWith(lg));
/* Apple's classic "Eloquence" novelty voices — same English names no
   matter what language they're set to speak. On some iOS versions
   these are literally the ONLY voices Safari exposes to a web page at
   all (downloaded Enhanced/Premium ones aren't visible to any
   website), so if this is what's available, at least default to the
   plainest-sounding one instead of "Grandma" or "Zarvox" by accident. */
const NOVELTY_VOICES = new Set([
  "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos", "deranged",
  "good news", "hysterical", "jester", "kathy", "organ", "pipe organ", "ralph",
  "trinoids", "whisper", "zarvox", "eddy", "flo", "grandma", "grandpa", "reed",
  "rocko", "sandy", "shelley", "fred", "junior", "princess", "wobble", "superstar"
]);
const isNovelty = (name) => NOVELTY_VOICES.has((name || "").toLowerCase().trim());
/* candidates for a language, novelty voices sorted to the end rather
   than removed — still selectable, just not the automatic default */
const sortedVoices = (lg) => [...voicesForLang(lg)].sort((a, b) => (isNovelty(a.name) ? 1 : 0) - (isNovelty(b.name) ? 1 : 0));
const initAudio = () => {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.resume) AC.resume();
  } catch (e) {}
  initVoices();
};
const tone = (f, t0, d, type = "sine", g = 0.14) => {
  if (!AC) return;
  try {
    const o = AC.createOscillator(), v = AC.createGain();
    o.type = type; o.frequency.value = f;
    const t = AC.currentTime + t0;
    v.gain.setValueAtTime(0.0001, t);
    v.gain.linearRampToValueAtTime(g, t + 0.012);
    v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(v); v.connect(AC.destination);
    o.start(t); o.stop(t + d + 0.05);
  } catch (e) {}
};
/* frequency slide from f0 to f1 — used for the gentle "aw shucks" dip
   and the silly wobble on a perfect round, neither of which a fixed-
   pitch tone() can produce */
const glide = (f0, f1, t0, d, type = "sine", g = 0.1) => {
  if (!AC) return;
  try {
    const o = AC.createOscillator(), v = AC.createGain();
    o.type = type;
    const t = AC.currentTime + t0;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + d);
    v.gain.setValueAtTime(0.0001, t);
    v.gain.linearRampToValueAtTime(g, t + 0.02);
    v.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.05);
    o.connect(v); v.connect(AC.destination);
    o.start(t); o.stop(t + d + 0.1);
  } catch (e) {}
};
const sfx = {
  ok:    () => { tone(660, 0, 0.12); tone(990, 0.09, 0.16); },
  no:    () => { tone(200, 0, 0.28, "triangle", 0.07); },
  bonus: () => { [660, 880, 1174].forEach((f, i) => tone(f, i * 0.07, 0.13)); },
  cheer: () => { [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.18)); },
  lvl:   () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.22)); },
  // chunk-end sounds, chosen by accuracy — see the fb-stage timeout handler
  fanfare: () => {
    [440, 554, 659].forEach((f, i) => tone(f, i * 0.06, 0.14, "triangle", 0.12));
    [659, 880, 1108].forEach((f) => tone(f, 0.22, 0.4, "triangle", 0.11));
  },
  oof: () => glide(320, 90, 0, 0.55, "triangle", 0.09),   // gentle descending "aw shucks", not harsh
  perfect: () => {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.055, 0.11, "square", 0.08));
    glide(1600, 2300, 0.36, 0.16, "sine", 0.07);
    glide(2300, 1500, 0.54, 0.16, "sine", 0.07);
  }
};
/* voiceURIs: {de: uri, en: uri} of a parent-picked voice, if any —
   iOS gives no programmatic way to tell a compact voice from a
   downloaded Enhanced/Premium one, so this is set from the dashboard
   after a human actually listens and picks. rate is also adjustable
   there. A trailing period is added before speaking: an isolated bare
   word often gets flatter terminal prosody than the same word closing
   a sentence, and the period costs nothing to try. */
/* real recorded audio for German words: one JSON file mapping word ->
   base64 mp3 data, so each word is an independent, self-contained
   audio clip — no seeking, no shared timeline, nothing that can drift
   or land on the wrong word. (An earlier version packed all 200 words
   into one long file and sought to a computed offset per word — that
   relied on MP3 frame-boundary seeking staying in sync with an offset
   table over a 142-second, 200-segment file, verified only by
   comparing ffmpeg against its own encoding, not against Safari's
   actual decoder. It produced wrong words in practice. This version
   removes that entire risk category by construction: nothing is ever
   sought into, so nothing can land on the wrong clip.)
   Resolves relative to the document, so it 404s harmlessly (falling
   through to speechSynthesis) for English or when previewed inside a
   Claude artifact where no extra files are hosted at all. */
let wordAudioManifest = null;
let wordAudioManifestPromise = null;
const wordAudioCache = {};
const loadWordAudioManifest = () => {
  if (wordAudioManifest) return Promise.resolve(wordAudioManifest);
  if (!wordAudioManifestPromise) {
    // Promise.resolve().then(...) ensures a synchronous throw from
    // fetch() itself (missing API, bad call) becomes a rejection the
    // caller's .catch() can see, rather than bypassing it entirely —
    // losing speech altogether is worse than falling back to synthesis
    wordAudioManifestPromise = Promise.resolve()
      .then(() => fetch("./words/de-audio.json"))
      .then((r) => { if (!r.ok) throw new Error("no audio manifest"); return r.json(); })
      .then((j) => { wordAudioManifest = j; return j; })
      .catch((e) => { wordAudioManifestPromise = null; throw e; });   // allow retry on a later call
  }
  return wordAudioManifestPromise;
};
const playRecorded = (word, lg, rate) => {
  if (lg !== "de") return Promise.reject(new Error("no recording for this language"));
  return loadWordAudioManifest().then((manifest) => {
    const b64 = manifest[word];
    if (!b64) throw new Error("word not in audio manifest");
    return new Promise((resolve, reject) => {
      let a = wordAudioCache[word];
      if (!a) {
        a = new Audio("data:audio/mpeg;base64," + b64);
        wordAudioCache[word] = a;
      }
      a.currentTime = 0;
      a.playbackRate = typeof rate === "number" ? rate : 1.0;
      a.preservesPitch = true;          // slowing down should sound clear, not deep/monstrous
      a.webkitPreservesPitch = true;    // Safari's historical prefixed name for the same property
      a.onended = resolve;
      a.onerror = () => { delete wordAudioCache[word]; reject(new Error("recording failed to play")); };
      a.play().catch(reject);
    });
  });
};
const speakSynth = (word, lg, voiceURIs, rate, pitch) => {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const targetLang = lg === "de" ? "de-DE" : "en-GB";
    const u = new SpeechSynthesisUtterance(word + ".");
    u.lang = targetLang;
    u.rate = typeof rate === "number" ? rate : 0.92;
    u.pitch = typeof pitch === "number" ? pitch : 1.0;
    const wanted = voiceURIs && voiceURIs[lg];
    const cands = sortedVoices(lg);
    const exact = cands.filter((x) => x.lang === targetLang);
    const pool = exact.length ? exact : cands;   // e.g. only en-US installed, no en-GB — still speak, just less precisely
    const v = (wanted && cands.find((x) => x.voiceURI === wanted)) || pool[0];
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) {}
};
const speak = (word, lg, voiceURIs, rate, pitch) => {
  try {
    return playRecorded(word, lg, rate).catch(() => speakSynth(word, lg, voiceURIs, rate, pitch));
  } catch (e) {
    try { speakSynth(word, lg, voiceURIs, rate, pitch); } catch (e2) {}
  }
};

/* --------------------------- storage ---------------------------- */
/* inside a Claude artifact, window.storage exists and is preferred;
   running standalone (e.g. hosted + added to the iPad home screen)
   it doesn't, so localStorage is the fallback — same file, either host */
const HAS_CLAUDE_STORAGE = typeof window !== "undefined" && !!window.storage;
const sget = async (k) => {
  try {
    if (HAS_CLAUDE_STORAGE) {
      const r = await window.storage.get(k);
      return r && r.value ? JSON.parse(r.value) : null;
    }
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};
const persist = (k, obj) => {
  try {
    if (HAS_CLAUDE_STORAGE) { window.storage.set(k, JSON.stringify(obj)); return; }
    localStorage.setItem(k, JSON.stringify(obj));
  } catch (e) {}
};

/* ---------------------- cross-device link import ------------------ */
/* lets a parent move progress to a new host without hand-copying a
   JSON blob: encode it once as a link, open that link on the new
   device, it self-imports on load. UTF-8-safe base64 (plain btoa only
   handles Latin1, and German words carry ä/ö/ü/ß). */
const b64encode = (str) => btoa(unescape(encodeURIComponent(str)));
const b64decode = (b64) => decodeURIComponent(escape(atob(b64)));
/* runs once at load, before storage is read: if the URL carries
   ?import=<data>, decode it, persist it, then strip it from the URL
   so a refresh or share doesn't re-trigger it */
function tryUrlImport() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("import");
    if (!raw) return false;
    const obj = JSON.parse(b64decode(raw));
    if (obj.de) persist("sr.de", migrate(obj.de));
    if (obj.en) persist("sr.en", migrate(obj.en));
    if (obj.ach) persist("sr.ach", migrateAch(obj.ach));
    if (obj.meta) persist("sr.meta", obj.meta);
    const url = new URL(window.location.href);
    url.searchParams.delete("import");
    window.history.replaceState({}, "", url.toString());
    return true;
  } catch (e) { return false; }
}

/* ------------------------------ css ----------------------------- */
const css = `
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
.bw { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: manipulation; }
@keyframes bwPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
@keyframes bwPop { 0% { transform: scale(.5); opacity: 0; } 70% { transform: scale(1.07); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes bwShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-9px); } 40% { transform: translateX(9px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }
@keyframes bwFloat { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-64px); opacity: 0; } }
@keyframes bwFall { 0% { transform: translateY(-10vh) rotate(0deg); } 100% { transform: translateY(110vh) rotate(560deg); } }
@keyframes bwBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.07); } }
input[type=range].spd { -webkit-appearance: none; appearance: none; width: 100%; height: 16px; border-radius: 10px; background: #D6E4F2; outline: none; margin: 0; }
input[type=range].spd::-webkit-slider-thumb { -webkit-appearance: none; width: 48px; height: 48px; border-radius: 50%; background: ${C.blue}; border: 5px solid #fff; box-shadow: 0 3px 10px rgba(34,49,74,.35); cursor: pointer; }
.tile:active { transform: scale(.96); }
.bigbtn:active { transform: scale(.94); }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;
const cardSt = {
  background: C.card, border: `3px solid ${C.ink}`, borderRadius: 26,
  boxShadow: "6px 6px 0 rgba(34,49,74,.14)"
};

/* ------------------------------ UI ------------------------------ */
function Ring({ frac, size = 48, stroke = 5, color = C.gold, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(34,49,74,.12)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, frac))}
          style={{ transition: "stroke-dashoffset .6s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}
function DayRing({ sec, size = 48 }) {
  const pct = Math.min(100, Math.round(sec / 6));
  const done = sec >= 600;
  return (
    <Ring frac={sec / 600} size={size} color={done ? C.green : C.gold}>
      {done
        ? <span style={{ fontSize: size * 0.42 }}>🔥</span>
        : <span style={{ fontSize: size * 0.3, fontWeight: 900 }}>{pct}%</span>}
    </Ring>
  );
}
/* One band of one animal, cut out of the single drawing with the viewBox —
   the same trick the book uses, where every animal is drawn to one template
   before the page is sliced. */
function MixBand({ animal, band, w }) {
  return (
    <div aria-hidden="true" style={{
      width: w, height: w / 2, overflow: "hidden", position: "relative"
    }}>
      <img src={TIER_IMG[animal]} alt="" width={w} height={w * 1.5} style={{
        position: "absolute", left: 0, top: -band * (w / 2), display: "block"
      }} />
    </div>
  );
}
/* The assembled creature. `open` is the band left empty, or -1 for a finished
   one. The heavy rule between bands is the cut edge of the paper: the book
   has it physically, and here it also covers the last unit or two of drift
   where two animals' outlines do not quite agree. */
function MixCreature({ trip, open = -1, w = 130 }) {
  return (
    <div style={{ width: w, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      {[0, 1, 2].map((b) => (
        <div key={b} style={{
          borderTop: b ? "4px solid rgba(34,49,74,.34)" : "none",
          boxShadow: b ? "inset 0 3px 5px -3px rgba(34,49,74,.45)" : "none"
        }}>
          {b === open
            ? <div style={{
                width: w, height: w / 2, background: "repeating-linear-gradient(45deg,#EDF5FC,#EDF5FC 8px,#DCE8F5 8px,#DCE8F5 16px)",
                border: "2px dashed #9FB0C2", boxSizing: "border-box", borderRadius: 6
              }} />
            : <MixBand animal={trip[b]} band={b} w={w} />}
        </div>
      ))}
    </div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 28 }, (_, i) => i);
  const em = ["🎉", "⭐", "✨", "🎈", "🪙"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {bits.map((i) => (
        <span key={i} style={{
          position: "absolute", top: 0, left: `${(i * 37) % 100}%`,
          fontSize: 22 + ((i * 13) % 22),
          animation: `bwFall ${2.4 + ((i * 7) % 20) / 10}s linear ${((i * 11) % 14) / 10}s infinite`
        }}>{em[i % em.length]}</span>
      ))}
    </div>
  );
}
function Chip({ word, ws }) {
  const base = {
    borderRadius: 12, padding: "5px 10px", fontSize: 15, fontWeight: 700,
    border: "2px solid", display: "inline-flex", alignItems: "center", gap: 4, lineHeight: 1.4
  };
  const lvl = wordLevel(ws);
  const [bg, bc, col] = LVL_COLORS[String(lvl)];
  if (lvl === 0 || lvl === -1)
    return <span style={{ ...base, background: bg, borderColor: bc, color: col }}>{word}{lvl === -1 ? " ↩" : ""}</span>;
  if (lvl === 1) {
    if (isHot(ws)) return <span style={{ ...base, background: "#FFD9A0", borderColor: "#E28C1E", color: "#7A4A08" }}>{word} 🌙</span>;
    return <span style={{ ...base, background: bg, borderColor: bc, color: col }}>{word}{ws.cc > 0 ? " " + "•".repeat(Math.min(3, ws.cc)) : ""}</span>;
  }
  // lvl 2/3/4 — same green family so progress still reads at a glance,
  // escalating shade + mark for Flüssig -> Behalten -> Gemeistert
  const ti = tiOf(ws.tn);
  const mark = lvl === 4 ? "👑" : lvl === 3 ? "✓✓" : "✓";
  return <span style={{ ...base, background: bg, borderColor: bc, color: col }}>{word} {mark}{ti >= 0 ? TIER[ti] : ""}</span>;
}

function Stat({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, color: "#8CA0B5", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 21, fontWeight: 900 }}>{value}</span>
    </div>
  );
}
function Badge({ a, unlocked, isNew, lang, onTap }) {
  return (
    <button onClick={() => onTap(a)} className="bigbtn" style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 76,
      opacity: unlocked ? 1 : 0.38, filter: unlocked ? "none" : "grayscale(1)",
      background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit"
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16, background: unlocked ? "#FFF3D6" : "#EEF3F8",
        border: `2px solid ${unlocked ? C.gold : "#C9D6E2"}`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 27, flexShrink: 0,
        position: "relative"
      }}>
        {unlocked ? a.icon : "🔒"}
        {/* the "you have not seen this one yet" star */}
        {isNew && (
          <span data-new="1" style={{
            position: "absolute", top: -8, right: -8, fontSize: 20,
            animation: "bwPop .35s ease-out", filter: "drop-shadow(0 1px 1px rgba(34,49,74,.35))"
          }}>⭐</span>
        )}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.25, color: unlocked ? C.ink : "#9FB0C2" }}>
        {lang === "de" ? a.de : a.en}
      </div>
    </button>
  );
}
function AchievementInfo({ a, unlockedOn, lang, onClose }) {
  if (!a) return null;
  const S2 = STR[lang];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(34,49,74,.45)", zIndex: 70,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        ...cardSt, width: "min(88vw,340px)", padding: "24px 22px", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        animation: "bwPop .3s ease-out"
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: 20, background: unlockedOn ? "#FFF3D6" : "#EEF3F8",
          border: `2px solid ${unlockedOn ? C.gold : "#C9D6E2"}`, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 34
        }}>{a.icon}</div>
        <div style={{ fontSize: 19, fontWeight: 900 }}>{lang === "de" ? a.de : a.en}</div>
        <div style={{ fontSize: 14, color: "#5B6C82", lineHeight: 1.45 }}>
          {lang === "de" ? a.deDesc : a.enDesc}
        </div>
        {unlockedOn ? (
          <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>✓ {S2.achDone} {unlockedOn}</div>
        ) : (
          <div style={{ fontSize: 12, fontWeight: 800, color: "#9FB0C2" }}>{S2.achLocked}</div>
        )}
        <button onClick={onClose} style={{
          ...cardSt, marginTop: 4, padding: "9px 28px", borderRadius: 14, cursor: "pointer",
          background: C.blue, color: "#fff", fontWeight: 800, fontSize: 14, border: "none"
        }}>OK</button>
      </div>
    </div>
  );
}
function UnlockToast({ queue, onDone, lang }) {
  const cur = queue[0];
  useEffect(() => {
    if (!cur) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);
  if (!cur) return null;
  return (
    <div key={cur.id} style={{
      position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 50,
      ...cardSt, background: "#FFF7DA", borderColor: C.gold,
      padding: "10px 20px", display: "flex", alignItems: "center", gap: 12,
      animation: "bwPop .4s ease-out", maxWidth: "92vw"
    }}>
      <span style={{ fontSize: 32 }}>{cur.icon}</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#8A5A00", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {STR[lang].ach}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{lang === "de" ? cur.de : cur.en}</div>
      </div>
    </div>
  );
}

/* ------------------------------ App ----------------------------- */
export default function App() {
  const [phase, setPhase] = useState("load");   // load|home|play|chunkend|levelup|gold|stack|parent|achievements|vowel|vdone|mix|mdone|mixer
  const [vq, setVq] = useState([]);             // Vokal-Blitz round
  const [vi, setVi] = useState(0);
  const [vfb, setVfb] = useState(null);
  const vScore = useRef({ r: 0, n: 0 });
  const vAt = useRef(0);
  const vRun = useRef(0);
  const [lq, setLq] = useState([]);             // Buchstaben-Blitz round
  const [li, setLi] = useState(0);
  const [lstage, setLstage] = useState("fix");  // fix|show|answer|fb
  const [lfb, setLfb] = useState(null);
  const [lpair, setLpair] = useState(null);
  const lScore = useRef({ r: 0, n: 0 });
  const lAt = useRef(0);
  const lRun = useRef(0);
  const [mq, setMq] = useState([]);              // Tier-Blitz round
  const [mi, setMi] = useState(0);
  const [mstage, setMstage] = useState("fix");  // fix|flash|mask|answer|fb
  const [mfb, setMfb] = useState(null);
  const [mKrogu, setMKrogu] = useState(false);  // the one-off Krogufant moment
  const [mixSel, setMixSel] = useState([0, 1, 2]);
  const mScore = useRef({ r: 0, n: 0 });
  const mAt = useRef(0);
  const mRun = useRef(0);
  const [lang, setLang] = useState("de");
  const [speed, setSpeed] = useState(3);
  const [snd, setSnd] = useState(true);
  const [data, setData] = useState(null);
  const [stage, setStage] = useState("fix");    // fix|word|answer|fb
  const [cur, setCur] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [fb, setFb] = useState(null);
  const [newLvl, setNewLvl] = useState(null);
  const [phrase, setPhrase] = useState(["🎉", "Super!"]);
  const [showData, setShowData] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [dashLang, setDashLang] = useState("de");
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState(null);
  const [pagesUrl, setPagesUrl] = useState("");
  const [linkOut, setLinkOut] = useState("");
  const [ach, setAch] = useState(freshAch());
  const [unlockQueue, setUnlockQueue] = useState([]);
  const [selectedAch, setSelectedAch] = useState(null);
  const [achLang, setAchLang] = useState("de");        // which gallery is open
  const [voiceURIs, setVoiceURIs] = useState({});
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [voicesTick, setVoicesTick] = useState(0);

  const dataRef = useRef(null);   dataRef.current = data;
  const langRef = useRef(lang);   langRef.current = lang;
  const speedRef = useRef(speed); speedRef.current = speed;
  const sndRef = useRef(snd);     sndRef.current = snd;
  const pagesUrlRef = useRef(pagesUrl); pagesUrlRef.current = pagesUrl;
  const achRef = useRef(ach);     achRef.current = ach;
  const voiceURIsRef = useRef(voiceURIs); voiceURIsRef.current = voiceURIs;
  const speechRateRef = useRef(speechRate); speechRateRef.current = speechRate;
  const speechPitchRef = useRef(speechPitch); speechPitchRef.current = speechPitch;
  const queueRef = useRef([]);
  const idxRef = useRef(0);
  const rollRef = useRef([]);
  const runRef = useRef(0);
  const tilesAt = useRef(0);
  const spanAt = useRef(0);       // start of the current active-time span (see span())
  const pendingLvl = useRef(null);
  const saveT = useRef({});
  const backRef = useRef("home");
  /* which galleries he actually looked at this visit — only those get marked
     seen on the way out. Toggling to English and back must not clear the stars
     on badges he never scrolled to. */
  const achViewed = useRef(new Set());
  const chunkRef = useRef({ q: 0, right: 0, coins: 0, sec: 0, mast: [], reach0: 1 });
  const modeRef = useRef({ t: "normal", lvl: 0 });
  const pendingGold = useRef(null);

  /* checks the 100 badges against the given data (+ current ach
     extras), merges any newly-true ones into ach, persists, and
     queues them for the unlock toast — called after anything that
     could move a stat: an answer, a chunk ending, a speed change */
  const runAchCheck = (newData) => {
    const active = langRef.current, other = otherLang(active);
    const stamp = (set, list) => ({ unlocked: { ...set.unlocked, ...Object.fromEntries(list.map((a) => [a.id, tISO()])) } });
    let updated = achRef.current;
    const newly = checkNewUnlocks(newData, updated, active);
    if (newly.length) updated = setBook(updated, active, stamp(updated[active], newly));
    /* The pooled badges — minutes, day streak, both-languages — become true in
       the other gallery at the same instant, so they are unlocked there too but
       silently: the toast belongs to the game he is actually playing, and one
       badge popping up twice would read as a bug. The trophy star sends him to
       the other gallery to find it. */
    const alsoOther = checkNewUnlocks(newData, updated, other).filter((a) => a.shared);
    if (alsoOther.length) updated = setBook(updated, other, stamp(updated[other], alsoOther));
    achRef.current = updated;
    setAch(updated);
    persist("sr.ach", updated);
    if (newly.length) setUnlockQueue((q) => [...q, ...newly]);
  };

  /* ---- load ---- */
  useEffect(() => {
    (async () => {
      tryUrlImport();
      const meta = await sget("sr.meta");
      if (meta) {
        if (meta.lang === "de" || meta.lang === "en") setLang(meta.lang);
        if (typeof meta.speed === "number") setSpeed(Math.min(9, Math.max(0, Math.round(meta.speed))));
        if (meta.snd === false) setSnd(false);
        if (typeof meta.pagesUrl === "string") setPagesUrl(meta.pagesUrl);
        if (meta.voiceURIs && typeof meta.voiceURIs === "object") setVoiceURIs(meta.voiceURIs);
        if (typeof meta.speechRate === "number" && meta.audioV >= 2) setSpeechRate(meta.speechRate);
        if (typeof meta.speechPitch === "number") setSpeechPitch(meta.speechPitch);
      }
      const [de, en, savedAch] = await Promise.all([sget("sr.de"), sget("sr.en"), sget("sr.ach")]);
      const loadedAch = migrateAch(savedAch);
      /* written back at once. Left in memory only, the seeding would re-run on
         every load, and by the second load the German set would contain badges
         earned since — which would then be silently marked as already seen. */
      if (!savedAch || savedAch.v !== 3) persist("sr.ach", loadedAch);
      setAch(loadedAch);
      setData({ de: migrate(de), en: migrate(en) });
      setPhase("home");
    })();
  }, []);

  /* ---- saving ---- */
  const scheduleSave = (l) => {
    clearTimeout(saveT.current[l]);
    saveT.current[l] = setTimeout(() => {
      const d = dataRef.current;
      if (d && d[l]) persist("sr." + l, d[l]);
    }, 1200);
  };
  const flush = () => {
    const d = dataRef.current;
    if (d) { persist("sr.de", d.de); persist("sr.en", d.en); }
    persist("sr.meta", { lang: langRef.current, speed: speedRef.current, snd: sndRef.current, pagesUrl: pagesUrlRef.current, voiceURIs: voiceURIsRef.current, speechRate: speechRateRef.current, speechPitch: speechPitchRef.current, audioV: 2 });
  };
  useEffect(() => {
    if (phase === "load") return;
    const t = setTimeout(() => persist("sr.meta", { lang, speed, snd, pagesUrl, voiceURIs, speechRate, speechPitch, audioV: 2 }), 600);
    return () => clearTimeout(t);
  }, [lang, speed, snd, pagesUrl, voiceURIs, speechRate, speechPitch, phase]);
  useEffect(() => {
    const h = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", h);
    return () => { document.removeEventListener("visibilitychange", h); flush(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* keeps the dashboard's voice picker current — getVoices() loads
     async and openParent() alone can't guarantee it's ready yet */
  useEffect(() => {
    if (phase !== "parent" || !window.speechSynthesis) return;
    const bump = () => setVoicesTick((t) => t + 1);
    loadVoices(); bump();
    window.speechSynthesis.addEventListener("voiceschanged", bump);
    const poll = setInterval(() => { loadVoices(); bump(); }, 400);
    const stop = setTimeout(() => clearInterval(poll), 3000);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", bump);
      clearInterval(poll); clearTimeout(stop);
    };
  }, [phase]);

  /* ---- round flow ---- */
  useEffect(() => {
    if (phase !== "letters") return;
    let t;
    if (lstage === "fix") t = setTimeout(() => setLstage("show"), 400);
    else if (lstage === "show") t = setTimeout(() => setLstage("answer"), letterExposure(li, speedRef.current));
    return () => clearTimeout(t);
  }, [phase, lstage, li]);

  const effSpeed = () => (modeRef.current.t === "turbo" ? Math.max(speedRef.current, 7) : speedRef.current);
  const nextItem = () => {
    if (idxRef.current >= queueRef.current.length) {
      queueRef.current = modeRef.current.t === "turbo"
        ? buildTurboQueue(dataRef.current[langRef.current], LISTS[langRef.current], modeRef.current.lvl)
        : buildQueue(dataRef.current[langRef.current], LISTS[langRef.current]);
      idxRef.current = 0;
      if (!queueRef.current.length) { setPhase("home"); return; }
    }
    const entry = queueRef.current[idxRef.current];
    setCur(entry);
    setTiles(composeTiles(entry, langRef.current));
    setFb(null);
    setStage("fix");
  };

  const startChunk = () => {
    const ch = chunkRef.current;
    ch.q = 0; ch.right = 0; ch.coins = 0; ch.sec = 0; ch.mast = [];
    ch.reach0 = reachLevel(dataRef.current[langRef.current], LISTS[langRef.current]);
    rollRef.current = []; runRef.current = 0; pendingLvl.current = null; pendingGold.current = null;
    queueRef.current = modeRef.current.t === "turbo"
      ? buildTurboQueue(dataRef.current[langRef.current], LISTS[langRef.current], modeRef.current.lvl)
      : buildQueue(dataRef.current[langRef.current], LISTS[langRef.current]);
    idxRef.current = 0;
    setNudged(false);
    setPhase("play");
    nextItem();
  };
  /* ---- Buchstaben-Blitz ---- */
  const startLetters = (pair) => {
    initAudio();
    const lg = langRef.current;
    const q = buildLetterQueue(dataRef.current[lg], LISTS[lg], lg, pair, LETTER_N);
    if (!q.length) return;
    lScore.current = { r: 0, n: 0 }; lRun.current = 0;
    setLpair(pair); setLq(q); setLi(0); setLfb(null);
    /* the Bett anchor, b/d only — it is the standard German classroom cue and
       there is no equivalent worth inventing for the other pairs */
    setLstage(pair.a + pair.b === "bd" || pair.a + pair.b === "db" ? "anchor" : "fix");
    setPhase("letters");
  };
  const letterAnswer = (opt) => {
    if (lfb) return;
    const item = lq[li];
    const ok = opt === item.answer;
    const lg = langRef.current;
    const prev = dataRef.current;
    const L = clone(prev[lg]);
    const key = [lpair.a, lpair.b].sort().join("");
    L.lp = L.lp || {};
    const rec = L.lp[key] || (L.lp[key] = { r: 0, wr: 0, h: [] });
    if (ok) { rec.r++; L.coins += 1; } else rec.wr++;
    rec.h = [...(rec.h || []), ok ? 1 : 0].slice(-PAIR_RETIRE_N);
    /* Same accounting as the reading loop: the span since the previous answer,
       which covers the fixation dot, the flash, his response and the feedback
       he read. Crediting only the response made a minute of b/d worth less than
       a minute of reading — worst at turtle speed, where the flash is most of
       the item — and this is the drill he gets sent to when reading is going
       badly. Adding exposure fixed that half; the span fixes the rest. */
    const lBonus = creditDay(L, span(lAt));
    L.coins += lBonus;
    const newData = { ...prev, [lg]: L };
    dataRef.current = newData; setData(newData); scheduleSave(lg);
    lScore.current = { r: lScore.current.r + (ok ? 1 : 0), n: lScore.current.n + 1 };
    lRun.current = ok ? lRun.current + 1 : 0;
    if (lRun.current > (achRef.current[lg].lBest || 0)) achRef.current = setBook(achRef.current, lg, { lBest: lRun.current });
    runAchCheck(newData);
    if (sndRef.current) { ok ? (lBonus ? sfx.bonus() : sfx.ok()) : sfx.no(); }
    setLfb({ ok, chosen: opt });
    setLstage("fb");
    sayWord(item.answer);
    if (ok) setTimeout(letterNext, 850);   // a miss waits for the continue button
  };
  const letterNext = () => {
    if (li + 1 >= lq.length) {
      const { r, n } = lScore.current;
      const lg = langRef.current;
      achRef.current = setBook(achRef.current, lg, {
        lRounds: (achRef.current[lg].lRounds || 0) + 1,
        lPerfect: (achRef.current[lg].lPerfect || 0) + (n >= 10 && r === n ? 1 : 0)
      });
      runAchCheck(dataRef.current);
      setPhase("ldone"); return;
    }
    setLi(li + 1); setLfb(null); setLstage("fix");
  };

  /* ------------------------- Tier-Blitz --------------------------- */
  const startMix = () => {
    initAudio();
    const lg = langRef.current;
    mScore.current = { r: 0, n: 0 }; mRun.current = 0;
    setMq(buildMixRound(dataRef.current[lg], lg));
    setMi(0); setMfb(null); setMKrogu(false); setMstage("fix");
    setPhase("mix");
  };

  const mixAnswer = (opt) => {
    if (mfb || mstage !== "answer") return;
    const item = mq[mi];
    const ok = opt === item.answer;
    const lg = langRef.current;
    const prev = dataRef.current;
    const L = clone(prev[lg]);
    /* Everything this mode knows lives here, at language level like L.lp. A
       placed strip says nothing about having read a curriculum word, so none
       of s/cc/iv/due/h/r/wr/tn/d may move and no word record may be created.
       test_animal_mix asserts both by diffing L.words across a whole round. */
    const tm = L.tm || (L.tm = { r: 0, wr: 0, seen: {}, krogu: false });
    tm.seen = tm.seen || {};
    let moment = false;
    if (ok) {
      tm.r++; L.coins += 1;
      tm.seen[item.answer] = (tm.seen[item.answer] || 0) + 1;
      if (isKrogu(item.trip) && !tm.krogu) { tm.krogu = true; moment = true; }
    } else tm.wr++;
    /* Same span accounting as the other two games: the wall clock since the
       previous answer, capped at IDLE_MAX. Crediting only the response window
       would make a Tier-Blitz minute worth less than a reading minute, and the
       exposure here is the longest in the app. */
    const mBonus = creditDay(L, span(mAt));
    L.coins += mBonus;
    const newData = { ...prev, [lg]: L };
    dataRef.current = newData; setData(newData); scheduleSave(lg);
    mScore.current = { r: mScore.current.r + (ok ? 1 : 0), n: mScore.current.n + 1 };
    mRun.current = ok ? mRun.current + 1 : 0;
    if (mRun.current > (achRef.current[lg].mBest || 0)) achRef.current = setBook(achRef.current, lg, { mBest: mRun.current });
    runAchCheck(newData);
    if (sndRef.current) { ok ? (mBonus ? sfx.bonus() : sfx.ok()) : sfx.no(); }
    setMfb({ ok, chosen: opt });
    setMstage("fb");
    if (moment) setMKrogu(true);
    sayWord(mixName(item.trip, lg));
  };

  const mixNext = () => {
    if (mKrogu) { setMKrogu(false); return; }
    const n = mi + 1;
    if (n >= mq.length) {
      const lg = langRef.current;
      const { r, n: total } = mScore.current;
      achRef.current = setBook(achRef.current, lg, {
        mRounds: (achRef.current[lg].mRounds || 0) + 1,
        mPerfect: (achRef.current[lg].mPerfect || 0) + (total >= MIX_N && r === total ? 1 : 0)
      });
      runAchCheck(dataRef.current);
      setPhase("mdone"); return;
    }
    setMi(n); setMfb(null); setMstage("fix");
  };

  useEffect(() => {
    if (phase !== "mix" || mKrogu) return;
    let t;
    if (mstage === "fix") t = setTimeout(() => setMstage("flash"), 400);
    else if (mstage === "flash") t = setTimeout(() => setMstage("mask"), mixExposure(mi, speedRef.current));
    else if (mstage === "mask") t = setTimeout(() => setMstage("answer"), 350);
    else if (mstage === "fb" && mfb && mfb.ok) t = setTimeout(mixNext, MIX_HOLD);
    /* mstage === "fb" && !mfb.ok: no timer — a miss waits for the button,
       exactly as in the reading loop. */
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mstage, mi, phase, mfb, mKrogu]);

  const startPlay = () => { initAudio(); modeRef.current = { t: "normal", lvl: 0 }; flush(); startChunk(); };
  const startTurbo = (li) => { initAudio(); modeRef.current = { t: "turbo", lvl: li }; flush(); startChunk(); };

  /* ---- Vokal-Blitz ---- */
  const sayWord = (word) => {
    if (sndRef.current) speak(word, langRef.current, voiceURIsRef.current, speechRateRef.current, speechPitchRef.current);
  };
  const startVowel = () => {
    initAudio();
    const lg = langRef.current;
    const q = buildVowelQueue(dataRef.current[lg], LISTS[lg], lg, VOWEL_N);
    if (!q.length) return;
    vScore.current = { r: 0, n: 0 }; vRun.current = 0;
    setVq(q); setVi(0); setVfb(null); setPhase("vowel");
    setTimeout(() => sayWord(q[0].word), 350);
  };
  const vowelAnswer = (opt) => {
    if (vfb) return;
    const item = vq[vi];
    const ok = opt === item.slot.unit;
    const lg = langRef.current;
    const prev = dataRef.current;
    const L = clone(prev[lg]);
    const ws = L.words[item.word] ||
      (L.words[item.word] = { s: 0, cc: 0, d: [], iv: 0, due: null, r: 0, wr: 0, tn: [0, 0, 0], h: [], everMastered: false });
    const vk = ws.vk || (ws.vk = { r: 0, wr: 0 });
    if (ok) { vk.r++; L.coins += 1; }
    else { vk.wr++; vk.mx = vk.mx || {}; vk.mx[opt] = (vk.mx[opt] || 0) + 1; }
    /* counts toward the daily minute goal like any other answered question —
       active time is the span since the previous answer, capped at IDLE_MAX */
    const vBonus = creditDay(L, span(vAt));
    L.coins += vBonus;
    const newData = { ...prev, [lg]: L };
    dataRef.current = newData;
    setData(newData);
    scheduleSave(lg);
    vScore.current = { r: vScore.current.r + (ok ? 1 : 0), n: vScore.current.n + 1 };
    vRun.current = ok ? vRun.current + 1 : 0;
    if (vRun.current > (achRef.current[lg].vBest || 0)) achRef.current = setBook(achRef.current, lg, { vBest: vRun.current });
    runAchCheck(newData);
    if (sndRef.current) { ok ? (vBonus ? sfx.bonus() : sfx.ok()) : sfx.no(); }
    setVfb({ ok, chosen: opt });
    sayWord(item.word);
    if (ok) setTimeout(vowelNext, 1200);   // a miss waits for the continue button
  };
  const vowelNext = () => {
    if (vi + 1 >= vq.length) {
      const { r, n } = vScore.current;
      const lg = langRef.current;
      achRef.current = setBook(achRef.current, lg, {
        vRounds: (achRef.current[lg].vRounds || 0) + 1,
        vPerfect: (achRef.current[lg].vPerfect || 0) + (n >= 10 && r === n ? 1 : 0)
      });
      runAchCheck(dataRef.current);
      setPhase("vdone"); return;
    }
    setVi(vi + 1); setVfb(null);
    sayWord(vq[vi + 1].word);
  };

  /* What happens after the feedback stage. Pulled out of the timer because a
     wrong answer no longer runs on a timer: the correct word stays up, tappable
     to hear again, until he taps continue. A miss is the one moment in the loop
     where there is something to look at, and 1.9 s was not enough to look at it. */
  const advanceAfterFb = () => {
      if (pendingGold.current) {
        setNewLvl(pendingGold.current); pendingGold.current = null;
        modeRef.current = { t: "normal", lvl: 0 };
        flush(); if (sndRef.current) sfx.lvl();
        setPhase("gold");
        return;
      }
      if (pendingLvl.current) {
        setNewLvl(pendingLvl.current); pendingLvl.current = null;
        flush(); if (sndRef.current) sfx.lvl();
        setPhase("levelup");
        return;
      }
      idxRef.current++;
      const ch = chunkRef.current;
      if (ch.sec >= CHUNK_SEC || ch.q >= CHUNK_Q) {
        flush();
        const perfect = ch.q >= 10 && ch.right === ch.q;
        const lg = langRef.current;
        const bk = { chunksDone: (achRef.current[lg].chunksDone || 0) + 1 };
        if (modeRef.current.t !== "turbo" && perfect) {
          bk.perfectSpeeds = { ...achRef.current[lg].perfectSpeeds, [speedRef.current]: true };
        }
        achRef.current = setBook(achRef.current, lg, bk);
        runAchCheck(dataRef.current);
        setPhrase([CHEER[Math.floor(Math.random() * CHEER.length)],
                   PHRASES[langRef.current][Math.floor(Math.random() * PHRASES[langRef.current].length)]]);
        const acc = ch.q ? (ch.right / ch.q) * 100 : 0;
        if (sndRef.current) {
          if (perfect) sfx.perfect();
          else if (acc > 80) sfx.fanfare();
          else if (acc < 60) sfx.oof();
          else sfx.cheer();
        }
        setPhase("chunkend");
      } else nextItem();
  };

  /* Every span begins here. Anything that happened before play was entered —
     the home screen, the badge gallery, the parent dashboard, the chunk-end
     summary, a level-up celebration — is outside the span and earns nothing.
     Without this reset the first answer after a visit to the trophies would
     bill the whole visit to the daily ring. */
  useEffect(() => {
    if (phase === "play") spanAt.current = Date.now();
    else if (phase === "vowel") vAt.current = Date.now();
    else if (phase === "letters") lAt.current = Date.now();
    else if (phase === "mix") mAt.current = Date.now();
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    let t;
    if (stage === "fix") t = setTimeout(() => setStage("word"), 500);
    else if (stage === "word") t = setTimeout(() => { tilesAt.current = Date.now(); setStage("answer"); }, DUR[effSpeed()]);
    else if (stage === "fb" && fb && fb.ok) t = setTimeout(advanceAfterFb, 950);
    /* stage === "fb" && !fb.ok: no timer at all — waits for the continue button */
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, cur, phase]);

  const answer = (w) => {
    if (stage !== "answer" || !cur) return;
    const target = cur[0];
    const ok = w === target;
    const eff = effSpeed();
    const turbo = modeRef.current.t === "turbo";
    const resp = Math.min((Date.now() - tilesAt.current) / 1000, 10);
    /* Two different quantities that used to be one. `work` sizes the chunk: a
       chunk is CHUNK_SEC of work done, and pacing it by wall clock instead
       would silently shorten it from ~50 questions to ~27. `active` is time on
       the iPad, which is what the ⏱ ring, the flame and the minute milestones
       are about. Keep them apart. */
    const work = DUR[eff] / 1000 + resp;
    const active = span(spanAt);
    rollRef.current = [...rollRef.current, ok].slice(-10);

    const prev = dataRef.current;
    const L = clone(prev[lang]);
    const list = LISTS[lang];
    const today = tISO();
    const before = starLevel(L, list);
    const ws = L.words[target] || (L.words[target] = { s: 0, cc: 0, d: [], iv: 0, due: null, r: 0, wr: 0, tn: [0, 0, 0], everMastered: false });
    if (!ws.tn) ws.tn = [0, 0, 0];
    let earned = 0, mastered = false;

    /* Turbo answers stay out of the window. Turbo is forced ≤500 ms and DESIGN
       already rules that its failures must not demote — letting them depress
       the accuracy floor would demote by the back door. */
    if (!turbo) pushHist(ws, ok);

    if (ok) {
      ws.r++;
      const t = tierOf(DUR[eff]);                        // speed-tier evidence
      const wasGold = tiOf(ws.tn) === 2;
      for (let k = 0; k <= t; k++) ws.tn[k] = Math.min(99, ws.tn[k] + 1);
      if (turbo) {
        if (!wasGold && tiOf(ws.tn) === 2) mastered = true;  // word reached 🚀 tier
      } else if (ws.s === 2) {                           // due review passed
        ws.iv = Math.min(ws.iv + 1, IVL.length - 1);
        ws.due = plusDays(IVL[ws.iv]);
      } else {                                           // learning
        ws.s = 1; ws.cc++;
        if (!ws.d.includes(today)) { ws.d.push(today); if (ws.d.length > 5) ws.d = ws.d.slice(-5); }
        /* streak + two days + recent accuracy. The first two say he can do it
           now and could do it yesterday; the third says it is not a lucky run
           inside a word he mostly misses. */
        if (ws.cc >= 3 && ws.d.length >= 2 && recentAcc(ws) >= MASTER_ACC) {
          ws.s = 2; ws.iv = 0; ws.due = plusDays(IVL[0]); ws.everMastered = true; mastered = true;
        }
      }
      const rl = rollRef.current;
      const acc = rl.length >= 4 ? rl.filter(Boolean).length / rl.length : 0;
      const dm = DUR[eff];
      const mult = acc >= 0.8 ? (dm <= 350 ? 3 : dm <= 700 ? 2 : 1) : 1;
      earned += mult;
      runRef.current++;
      if (runRef.current > achRef.current[lang].bestStreak) achRef.current = setBook(achRef.current, lang, { bestStreak: runRef.current });
      if (runRef.current % 10 === 0) earned += 5;        // streak bonus
    } else {
      ws.wr++;
      ws.mx = ws.mx || {}; ws.mx[w] = (ws.mx[w] || 0) + 1;   // which distractor fooled him
      if (!turbo) {
        ws.cc = 0;
        if (ws.s === 2) { ws.s = 1; ws.iv = 0; }         // demote
        ws.due = plusDays(1);                            // resurfaces tomorrow
      }
      runRef.current = 0;
      const pos = Math.min(queueRef.current.length, idxRef.current + 3 + Math.floor(Math.random() * 4));
      queueRef.current.splice(pos, 0, cur);              // re-queue 3–6 later
    }
    if (sndRef.current) speak(target, lang, voiceURIsRef.current, speechRateRef.current, speechPitchRef.current); // hear the word either way, right or wrong

    const bonus = creditDay(L, active);
    earned += bonus;
    L.coins += earned;

    if (!turbo) {
      const after = starLevel(L, list);
      if (after > before) pendingLvl.current = after;
    } else if (isGoldLevel(L, list[modeRef.current.lvl])) {
      pendingGold.current = modeRef.current.lvl + 1;
    }

    const ch = chunkRef.current;
    ch.q++; ch.sec += work; ch.coins += earned;
    if (ok) ch.right++;
    if (mastered) ch.mast.push(target);

    const newData = { ...prev, [lang]: L };
    setData(newData);
    scheduleSave(lang);
    runAchCheck(newData);
    if (sndRef.current) { ok ? ((bonus || mastered) ? sfx.bonus() : sfx.ok()) : sfx.no(); }
    setFb({ ok, chosen: w, earned, mastered });
    setStage("fb");
  };

  const goHome = () => { modeRef.current = { t: "normal", lvl: 0 }; flush(); setPhase("home"); };
  const afterLevelUp = () => { setNewLvl(null); startChunk(); };
  const openStack = (from) => { backRef.current = from; setShowData(false); setPhase("stack"); };
  const openParent = () => { setDashLang(lang); setShowData(false); setImportText(""); setImportMsg(null); setLinkOut(""); setPhase("parent"); };
  const openAch = (from) => {
    backRef.current = from; setSelectedAch(null);
    setAchLang(lang); achViewed.current = new Set([lang]);
    setPhase("achievements");
  };
  const switchAchLang = (l) => { setAchLang(l); achViewed.current.add(l); setSelectedAch(null); };
  /* Marking happens here, on the way out. He has now had the chance to look at
     every star on the screen; the next one he earns will be the only one lit. */
  const closeAch = () => {
    let updated = achRef.current;
    achViewed.current.forEach((lg) => {
      const seen = { ...(updated[lg].seen || {}) };
      Object.keys(updated[lg].unlocked).forEach((id) => { seen[id] = true; });
      updated = setBook(updated, lg, { seen });
    });
    achRef.current = updated;
    setAch(updated);
    persist("sr.ach", updated);
    setPhase(backRef.current);
  };
  const dismissToast = () => setUnlockQueue((q) => q.slice(1));

  /* ---- derived ---- */
  const wrap = {
    minHeight: "100dvh", background: C.bg, color: C.ink,
    fontFamily: 'ui-rounded, -apple-system, "SF Pro Rounded", "Segoe UI", system-ui, sans-serif',
    display: "flex", flexDirection: "column"
  };
  const S = STR[lang];
  const L = data ? data[lang] : null;
  const todaySec = L ? ((L.days[tISO()] || {}).s || 0) : 0;

  /* ============================ render ============================ */
  if (phase === "load") {
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center" }}>
        <style>{css}</style>
        <div style={{ fontSize: 72, animation: "bwBreathe 1.2s ease-in-out infinite" }}>📖⚡</div>
      </div>
    );
  }

  /* ----------------------------- home ----------------------------- */
  if (phase === "home") {
    const workPairs = letterPairsNeedingWork(L, lang);
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: "clamp(14px,3vh,26px)", padding: 16, position: "relative" }}>
        <style>{css}</style>
        <button onClick={() => openStack("home")} className="bigbtn" style={{
          position: "absolute", top: 14, left: 14, width: 56, height: 56, fontSize: 26,
          ...cardSt, borderRadius: 18, cursor: "pointer"
        }}>📊</button>
        <button onClick={() => setSnd(!snd)} style={{
          position: "absolute", top: 14, right: 14, width: 56, height: 56, fontSize: 26,
          ...cardSt, borderRadius: 18, cursor: "pointer"
        }}>{snd ? "🔊" : "🔇"}</button>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap",
          gap: "clamp(8px,1.6vw,16px)", lineHeight: 1
        }}>
          <span style={{ fontSize: "clamp(38px,7vh,56px)" }}>📖⚡</span>
          <span style={{ fontSize: "clamp(30px,5.6vh,46px)", fontWeight: 900, color: C.ink }}>BlitzWort</span>
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
          {["de", "en"].map((l) => {
            const ld = data[l], sel = l === lang;
            const star = starLevel(ld, LISTS[l]);
            const stk = calcStreak(ld.days);
            const sec = (ld.days[tISO()] || {}).s || 0;
            const pct = Math.min(100, Math.round(sec / 6));
            const S2 = STR[l];
            return (
              <button key={l} onClick={() => setLang(l)} className="bigbtn" style={{
                ...cardSt, width: "min(42vw,260px)", minWidth: 205, padding: "16px 12px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer",
                borderColor: sel ? C.blue : C.ink, borderWidth: sel ? 5 : 3,
                transform: sel ? "scale(1.04)" : "scale(1)", transition: "transform .15s"
              }}>
                <span style={{ fontSize: 50, lineHeight: 1 }}>{l === "de" ? "🇩🇪" : "🇬🇧"}</span>
                <span style={{ fontSize: 23, fontWeight: 800 }}>{l === "de" ? "Deutsch" : "English"}</span>
                <span style={{ fontSize: 15, fontWeight: 700, display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center" }}>
                  <span>⭐{S2.lvl} {star}</span><span>🪙{ld.coins}</span><span>🔥{stk}</span><span>⏱{pct}% {S2.today}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ ...cardSt, width: "min(92vw,560px)", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 30 }}>🐢</span>
            <input className="spd" type="range" min={0} max={9} step={1} value={speed}
              onChange={(e) => {
                setSpeed(Number(e.target.value));
                /* the slider is one global setting, so this lands in the
                   gallery of the language he is looking at right now */
                if (!achRef.current[lang].speedChanged) {
                  achRef.current = setBook(achRef.current, lang, { speedChanged: true });
                  runAchCheck(dataRef.current);
                }
              }} />
            <span style={{ fontSize: 30 }}>🚀</span>
          </div>
          <div style={{ textAlign: "center", fontSize: 38, lineHeight: 1 }}>{SPEED_ICONS[speed]}</div>
        </div>

        <button onClick={startPlay} className="bigbtn" style={{
          width: 116, height: 116, borderRadius: "50%", background: C.green,
          border: `4px solid ${C.ink}`, boxShadow: "0 8px 0 rgba(34,49,74,.22)",
          fontSize: 50, color: "#fff", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", paddingLeft: 8
        }}>▶</button>

        {/* Vokal-Blitz. Its own label is the exercise: three vowels, no icon to
            decode. Smaller and off to the side because reading practice stays
            the default action. */}
        <button onClick={startVowel} className="bigbtn" style={{
          ...cardSt, position: "absolute", bottom: 22, right: 62, width: 88, height: 88,
          borderRadius: "50%", fontSize: 27, fontWeight: 900, letterSpacing: 1,
          color: C.blue, cursor: "pointer"
        }}>a e i</button>

        {/* Buchstaben-Blitz. Appears only while a shape pair is above threshold,
            labelled with the pair itself so there is nothing to decode. */}
        {workPairs.length > 0 && (
          <button onClick={() => startLetters(workPairs[0])} className="bigbtn" style={{
            ...cardSt, position: "absolute", bottom: 22, left: 62, width: 88, height: 88,
            borderRadius: "50%", fontSize: 30, fontWeight: 900, letterSpacing: TRACK,
            color: "#E28C1E", cursor: "pointer"
          }}>{workPairs[0].a} {workPairs[0].b}</button>
        )}

        {/* Tier-Blitz. Permanent, not remedial: unlike the b/d drill this is not
            fixing a specific error he is making, it is the one place a word
            cannot be recognised from memory. Labelled with a Krogufant rather
            than a word — the exercise itself, the way "a e i" and "b d" are. */}
        <button onClick={startMix} aria-label="Tier-Blitz" className="bigbtn" style={{
          ...cardSt, position: "absolute", bottom: 22, right: 158, width: 88, height: 88,
          borderRadius: "50%", cursor: "pointer", padding: 0, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ transform: "scale(.92)", pointerEvents: "none" }}>
            <MixCreature trip={KROGU} w={52} />
          </span>
        </button>

        <button onClick={() => openAch("home")} className="bigbtn" style={{
          position: "absolute", bottom: 12, left: 12, width: 56, height: 56, fontSize: 26,
          ...cardSt, borderRadius: 18, cursor: "pointer"
        }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            🏆
            <span style={{
              position: "absolute", bottom: -18, right: -22, background: C.gold, color: "#fff",
              fontSize: 11, fontWeight: 900, borderRadius: 10, padding: "1px 6px", border: "2px solid #fff"
            }}>{Object.keys(ach[lang].unlocked).length}</span>
            {/* something new is waiting in there. Additive: the count keeps
                meaning "how many you have", the star means "go and look". */}
            {unseenAny(ach) > 0 && (
              <span data-new="trophy" style={{
                position: "absolute", top: -20, left: -20, fontSize: 19,
                animation: "bwBreathe 1.4s ease-in-out infinite"
              }}>⭐</span>
            )}
          </span>
        </button>

        <button onClick={openParent} style={{
          position: "absolute", bottom: 12, right: 12, width: 38, height: 38, borderRadius: 12,
          background: "transparent", border: "2px solid rgba(34,49,74,.16)",
          color: "rgba(34,49,74,.32)", fontSize: 17, cursor: "pointer"
        }}>⚙</button>
        <UnlockToast queue={unlockQueue} onDone={dismissToast} lang={lang} />
      </div>
    );
  }

  /* ------------------------ Buchstaben-Blitz ----------------------- */
  if (phase === "letters" && lstage === "anchor") {
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 26, padding: 16 }}>
        <style>{css}</style>
        {/* the German classroom cue: b and d are the two ends of a Bett */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, fontWeight: 900 }}>
          <span style={{ fontSize: "clamp(70px,14vw,120px)", color: C.blue }}>b</span>
          <span style={{ fontSize: "clamp(56px,11vw,96px)" }}>🛏</span>
          <span style={{ fontSize: "clamp(70px,14vw,120px)", color: C.green }}>d</span>
        </div>
        <div style={{ fontSize: "clamp(34px,7vw,56px)", fontWeight: 900, letterSpacing: TRACK }}>Bett</div>
        <button onClick={() => setLstage("fix")} className="bigbtn" style={{
          width: 112, height: 112, borderRadius: "50%", background: C.green, border: `4px solid ${C.ink}`,
          boxShadow: "0 8px 0 rgba(34,49,74,.22)", fontSize: 46, color: "#fff", cursor: "pointer"
        }}>▶</button>
      </div>
    );
  }
  if (phase === "letters" && lq[li]) {
    const item = lq[li];
    return (
      <div className="bw" style={{ ...wrap, padding: "10px 14px 14px", gap: 12 }}>
        <style>{css}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={goHome} className="bigbtn" style={{ ...cardSt, width: 58, height: 58, fontSize: 26, borderRadius: 18, cursor: "pointer" }}>🏠</button>
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18, letterSpacing: TRACK }}>
            {lpair.a} {lpair.b}
          </div>
          <div style={{ flex: 1, height: 10, background: "#D6E4F2", borderRadius: 6, overflow: "hidden", margin: "0 4px" }}>
            <div style={{ width: `${Math.round((li / lq.length) * 100)}%`, height: "100%", background: C.blue, borderRadius: 6, transition: "width .4s" }} />
          </div>
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18, color: "#8A5A00", background: "#FFF3D6" }}>
            🪙 {L.coins}
          </div>
        </div>

        <div style={{
          ...cardSt, alignSelf: "center", width: "min(94vw,720px)",
          height: "clamp(170px,32vh,250px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
        }}>
          {lstage === "fix" && <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.ink, animation: "bwPulse .4s ease-in-out infinite" }} />}
          {lstage === "show" && (
            <span style={{ fontSize: "clamp(66px,14vw,116px)", fontWeight: 800, letterSpacing: TRACK }}>{item.show}</span>
          )}
          {lstage === "answer" && <span style={{ fontSize: 64, color: C.mask, letterSpacing: 8 }}>▮▮▮▮</span>}
          {lstage === "fb" && lfb && (
            <span onClick={() => { if (!lfb.ok) sayWord(item.answer); }} style={{
              fontSize: "clamp(60px,12vw,100px)", fontWeight: 800, letterSpacing: TRACK,
              color: lfb.ok ? C.green : C.ink, animation: "bwPop .35s ease-out",
              cursor: lfb.ok ? "default" : "pointer"
            }}>{lfb.ok ? "✓ " : ""}{item.answer}</span>
          )}
          {lstage === "fb" && lfb && !lfb.ok && <ReplayHint />}
          {lstage === "fb" && lfb && !lfb.ok && <ContinueBtn onClick={letterNext} />}
        </div>

        <div style={{
          alignSelf: "center", width: "min(94vw,760px)", flex: 1,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignContent: "center",
          opacity: lstage === "answer" || lstage === "fb" ? 1 : 0,
          pointerEvents: lstage === "answer" ? "auto" : "none", transition: "opacity .12s"
        }}>
          {item.opts.map((o, i) => {
            let bg = C.card, col = C.ink, anim = "none";
            if (lstage === "fb" && lfb) {
              if (o === item.answer) { bg = C.green; col = "#fff"; }
              else if (o === lfb.chosen) { bg = C.red; col = "#fff"; anim = "bwShake .4s ease"; }
              else { bg = "#F2F6FA"; col = "#9FB0C2"; }
            }
            return (
              <button key={i} className="tile" onClick={() => letterAnswer(o)} style={{
                ...cardSt, background: bg, color: col, minHeight: 118,
                fontSize: "clamp(38px,7vw,62px)", fontWeight: 800, letterSpacing: TRACK,
                cursor: "pointer", animation: anim, fontFamily: "inherit"
              }}>{o}</button>
            );
          })}
        </div>
      </div>
    );
  }
  if (phase === "ldone") {
    const { r, n } = lScore.current;
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 22, padding: 16 }}>
        <style>{css}</style>
        <div style={{ fontSize: 66 }}>{r === n ? "🏆" : r * 2 >= n ? "👏" : "💪"}</div>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{r} / {n}</div>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={() => startLetters(lpair)} className="bigbtn" style={{
            ...cardSt, width: 104, height: 104, borderRadius: "50%", background: C.blue,
            color: "#fff", fontSize: 40, cursor: "pointer"
          }}>↻</button>
          <button onClick={goHome} className="bigbtn" style={{
            ...cardSt, width: 104, height: 104, borderRadius: "50%", fontSize: 40, cursor: "pointer"
          }}>🏠</button>
        </div>
      </div>
    );
  }

  /* -------------------------- Vokal-Blitz -------------------------- */
  if (phase === "vowel" && vq[vi]) {
    const item = vq[vi];
    const { word, slot } = item;
    const pre = word.slice(0, slot.i), post = word.slice(slot.i + slot.len);
    return (
      <div className="bw" style={{ ...wrap, padding: "10px 14px 14px", gap: 12 }}>
        <style>{css}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={goHome} className="bigbtn" style={{ ...cardSt, width: 58, height: 58, fontSize: 26, borderRadius: 18, cursor: "pointer" }}>🏠</button>
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18 }}>a e i</div>
          <div style={{ flex: 1, height: 10, background: "#D6E4F2", borderRadius: 6, overflow: "hidden", margin: "0 4px" }}>
            <div style={{ width: `${Math.round((vi / vq.length) * 100)}%`, height: "100%", background: C.blue, borderRadius: 6, transition: "width .4s" }} />
          </div>
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18, color: "#8A5A00", background: "#FFF3D6" }}>
            🪙 {L.coins}
          </div>
        </div>

        <div style={{
          ...cardSt, alignSelf: "center", width: "min(94vw,720px)",
          height: "clamp(170px,32vh,250px)", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 18, position: "relative"
        }}>
          <span onClick={() => { if (vfb && !vfb.ok) sayWord(word); }}
            style={{ fontSize: "clamp(52px,11vw,92px)", fontWeight: 800, letterSpacing: TRACK,
              cursor: vfb && !vfb.ok ? "pointer" : "default" }}>
            {pre}
            {vfb
              /* colour only here, once the answer is locked in */
              ? <span style={{ color: vfb.ok ? C.green : C.red }}>{vfb.ok ? slot.unit : vfb.chosen}</span>
              : <span style={{ color: C.mask }}>▮</span>}
            {post}
          </span>
          {vfb && !vfb.ok && (
            <span style={{ fontSize: "clamp(34px,7vw,58px)", fontWeight: 800, letterSpacing: TRACK, color: C.green }}>
              → {pre}<span style={{ textDecoration: "underline" }}>{slot.unit}</span>{post}
            </span>
          )}
          <button onClick={() => sayWord(word)} className="bigbtn" style={{
            position: "absolute", top: 10, right: 12, width: 56, height: 56, fontSize: 26,
            ...cardSt, borderRadius: 18, cursor: "pointer"
          }}>🔊</button>
          {vfb && !vfb.ok && <ReplayHint />}
          {vfb && !vfb.ok && <ContinueBtn onClick={vowelNext} />}
        </div>

        <div style={{
          alignSelf: "center", width: "min(94vw,760px)", flex: 1,
          display: "grid", gridTemplateColumns: `repeat(${item.opts.length},1fr)`, gap: 14,
          alignContent: "center", pointerEvents: vfb ? "none" : "auto"
        }}>
          {item.opts.map((o, i) => {
            let bg = C.card, bc = C.ink, col = C.ink, anim = "none";
            if (vfb) {
              if (o === slot.unit) { bg = C.green; col = "#fff"; }
              else if (o === vfb.chosen) { bg = C.red; col = "#fff"; anim = "bwShake .4s ease"; }
              else { bg = "#F2F6FA"; col = "#9FB0C2"; }
            }
            return (
              <button key={i} className="tile" onClick={() => vowelAnswer(o)} style={{
                ...cardSt, background: bg, borderColor: bc, color: col,
                minHeight: 120, fontSize: "clamp(38px,7vw,62px)", fontWeight: 800,
                cursor: "pointer", animation: anim, fontFamily: "inherit"
              }}>{o}</button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "vdone") {
    const { r, n } = vScore.current;
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 22, padding: 16 }}>
        <style>{css}</style>
        <div style={{ fontSize: 66 }}>{r === n ? "🏆" : r * 2 >= n ? "👏" : "💪"}</div>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{r} / {n}</div>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={startVowel} className="bigbtn" style={{
            ...cardSt, width: 104, height: 104, borderRadius: "50%", background: C.blue,
            color: "#fff", fontSize: 40, cursor: "pointer"
          }}>↻</button>
          <button onClick={goHome} className="bigbtn" style={{
            ...cardSt, width: 104, height: 104, borderRadius: "50%", fontSize: 40, cursor: "pointer"
          }}>🏠</button>
        </div>
      </div>
    );
  }

  /* -------------------------- Tier-Blitz -------------------------- */
  if (phase === "mix") {
    const item = mq[mi];
    if (!item) return null;
    const name = mixName(item.trip, lang);
    const done = mstage === "fb";

    /* The Krogufant itself, once, at size. No badge and nothing tallied — it
       is the creature the whole mode is named after, and a score attached to
       it would make it a target rather than a surprise. */
    if (mKrogu) {
      return (
        <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 18, padding: 16 }}>
          <style>{css}</style>
          <Confetti />
          <MixCreature trip={KROGU} w={200} />
          <div data-mix="fb" onClick={() => sayWord(name)} style={{
            fontSize: "clamp(34px,6vw,54px)", fontWeight: 900, letterSpacing: TRACK, cursor: "pointer"
          }}>{name}</div>
          <button onClick={mixNext} className="bigbtn" style={{
            ...cardSt, width: 104, height: 104, borderRadius: "50%", background: C.green,
            color: "#fff", fontSize: 40, cursor: "pointer"
          }}>{"\u25B6"}</button>
        </div>
      );
    }

    return (
      <div className="bw" style={{ ...wrap, padding: "10px 14px 14px", gap: 10, alignItems: "center" }}>
        <style>{css}</style>

        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "min(96vw,860px)" }}>
          <button onClick={goHome} className="bigbtn" style={{
            ...cardSt, width: 58, height: 58, fontSize: 26, borderRadius: 18, cursor: "pointer"
          }}>{"\u{1F3E0}"}</button>
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18 }}>
            {mi + 1} / {mq.length}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18,
            color: "#8A5A00", background: "#FFF3D6"
          }}>{"\u{1FA99}"} {L.coins}</div>
        </div>

        {/* the name: flashed, then masked. Four blocks whatever the length, for
            the same reason the reading loop uses four — a length-matched mask
            leaks a cue. */}
        <div style={{
          ...cardSt, width: "min(96vw,860px)", height: "clamp(84px,13vh,116px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {mstage === "fix" && (
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.ink, animation: "bwPulse .4s ease-in-out infinite" }} />
          )}
          {mstage === "flash" && (
            <span data-mix="flash" style={{ fontSize: "clamp(30px,5.2vw,50px)", fontWeight: 900, letterSpacing: TRACK }}>{name}</span>
          )}
          {(mstage === "mask" || mstage === "answer") && (
            <span style={{ fontSize: "clamp(30px,5.2vw,50px)", color: C.mask, letterSpacing: TRACK }}>{"\u25AE\u25AE\u25AE\u25AE"}</span>
          )}
          {done && (
            <span data-mix="fb" onClick={() => sayWord(name)} style={{
              fontSize: "clamp(30px,5.2vw,50px)", fontWeight: 900, letterSpacing: TRACK,
              color: mfb.ok ? C.green : C.ink, cursor: "pointer"
            }}>{name}</span>
          )}
        </div>

        {/* The creature and the tiles appear only once the mask has come down.
            Shown any earlier they would sit on screen beside the flashed name,
            and the whole item would collapse into a matching task he could
            solve without reading anything. */}
        {(mstage === "answer" || done) && (
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          <MixCreature trip={item.trip} open={done ? -1 : item.slot} w={130} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {item.opts.map((o, i) => {
              let bg = C.card, bc = C.ink, col = C.ink, anim = "none";
              if (done) {
                if (o === item.answer) { bg = "#E6F9EF"; bc = C.green; col = C.green; }
                else if (o === mfb.chosen) { bg = "#FFECEC"; bc = C.red; col = C.red; anim = "bwShake .4s ease"; }
                else { bg = "#F2F6FA"; bc = "#DCE8F5"; col = "#9FB0C2"; }
              }
              /* the strip is the reward, never the cue: all four are plausible
                 animals, and only the printed syllable separates them */
              return (
                <button key={i} className="tile" onClick={() => mixAnswer(o)} style={{
                  ...cardSt, background: bg, borderColor: bc, color: col, padding: 6,
                  cursor: "pointer", animation: anim, fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4
                }}>
                  <span style={{ opacity: done && o !== item.answer && o !== mfb.chosen ? .35 : 1 }}>
                    <MixBand animal={o} band={item.slot} w={92} />
                  </span>
                  <span data-frag style={{ fontSize: 27, fontWeight: 900, letterSpacing: TRACK }}>
                    {TIERE[o][lang][item.slot]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        )}

        {done && !mfb.ok && (
          <button onClick={mixNext} className="bigbtn" style={{
            ...cardSt, width: 96, height: 96, borderRadius: "50%", background: C.blue,
            color: "#fff", fontSize: 38, cursor: "pointer"
          }}>{"\u25B6"}</button>
        )}
      </div>
    );
  }

  if (phase === "mdone") {
    const { r, n } = mScore.current;
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 20, padding: 16 }}>
        <style>{css}</style>
        <div style={{ fontSize: 66 }}>{r === n ? "\u{1F3C6}" : r * 2 >= n ? "\u{1F44F}" : "\u{1F4AA}"}</div>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{r} / {n}</div>
        {/* the free mixer, reachable only from here: an unscored playground is
            fine as a reward for finishing, and a distraction from the start
            screen */}
        <button onClick={() => { setMixSel([0, 1, 2]); setPhase("mixer"); }} className="bigbtn" style={{
          ...cardSt, padding: "12px 22px", borderRadius: 20, fontSize: 22, fontWeight: 800,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 12
        }}>
          <MixCreature trip={KROGU} w={40} />
          {lang === "de" ? "Tier-Mixer" : "Animal Mixer"}
        </button>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={startMix} className="bigbtn" style={{
            ...cardSt, width: 104, height: 104, borderRadius: "50%", background: C.blue,
            color: "#fff", fontSize: 40, cursor: "pointer"
          }}>{"\u21BB"}</button>
          <button onClick={goHome} className="bigbtn" style={{
            ...cardSt, width: 104, height: 104, borderRadius: "50%", fontSize: 40, cursor: "pointer"
          }}>{"\u{1F3E0}"}</button>
        </div>
      </div>
    );
  }

  /* Free mixer: all 512 creatures, flipped by hand, read aloud. Nothing is
     scored and nothing is stored — it is the flip-book, not the exercise. */
  if (phase === "mixer") {
    const trip = mixSel.map((i) => TIER_ORDER[i]);
    const name = mixName(trip, lang);
    const turn = (b, d) => setMixSel(mixSel.map((v, i) =>
      i === b ? (v + d + TIER_ORDER.length) % TIER_ORDER.length : v));
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 14, padding: 14 }}>
        <style>{css}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[0, 1, 2].map((b) => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => turn(b, -1)} className="bigbtn" aria-label="zurück" style={{
                ...cardSt, width: 56, height: 56, borderRadius: 18, fontSize: 24, cursor: "pointer"
              }}>{"\u25C0"}</button>
              <div style={{
                borderTop: b ? "4px solid rgba(34,49,74,.34)" : "none",
                boxShadow: b ? "inset 0 3px 5px -3px rgba(34,49,74,.45)" : "none", background: "#fff"
              }}>
                <MixBand animal={trip[b]} band={b} w={150} />
              </div>
              <button onClick={() => turn(b, 1)} className="bigbtn" aria-label="weiter" style={{
                ...cardSt, width: 56, height: 56, borderRadius: 18, fontSize: 24, cursor: "pointer"
              }}>{"\u25B6"}</button>
            </div>
          ))}
        </div>
        <div onClick={() => sayWord(name)} style={{
          fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, letterSpacing: TRACK, cursor: "pointer"
        }}>{"\u{1F50A}"} {name}</div>
        <button onClick={() => setPhase("mdone")} className="bigbtn" style={{
          ...cardSt, width: 80, height: 80, borderRadius: "50%", fontSize: 32, cursor: "pointer"
        }}>{"\u2B05"}</button>
      </div>
    );
  }

  /* ---------------------------- stack ----------------------------- */
  if (phase === "stack") {
    const reach = reachLevel(L, LISTS[lang]);
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", padding: 14, gap: 12, overflowY: "auto" }}>
        <style>{css}</style>
        <div style={{ display: "flex", width: "min(94vw,760px)", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPhase(backRef.current)} className="bigbtn"
            style={{ ...cardSt, width: 56, height: 56, fontSize: 24, borderRadius: 18, cursor: "pointer" }}>⬅</button>
          <span style={{ fontSize: 32 }}>{lang === "de" ? "🇩🇪" : "🇬🇧"}</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#5B6C82" }}>⬜ → 🟨• → 🌙 → ✓ 🐢🏃🚀</span>
        </div>
        {LISTS[lang].slice(0, reach).map((lvl, li) => {
          const m = lvl.filter((e) => L.words[e[0]] && L.words[e[0]].s === 2).length;
          const gold = isGoldLevel(L, lvl);
          return (
            <div key={li} style={{ ...cardSt, width: "min(94vw,760px)", padding: 14, borderColor: gold ? C.gold : C.ink }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 19, fontWeight: 800 }}>
                <span>{gold ? "🥇" : m >= Math.ceil(lvl.length * 0.9) ? "⭐" : "📚"}</span>
                <span>{S.lvl} {li + 1}</span>
                <span style={{ color: "#5B6C82", fontWeight: 700 }}>{m}/{lvl.length}</span>
                <div style={{ flex: 1 }} />
                {m === lvl.length && !gold && (
                  <button onClick={() => startTurbo(li)} className="bigbtn" style={{
                    ...cardSt, borderRadius: 14, padding: "6px 18px", fontSize: 24, cursor: "pointer",
                    background: "#FFF3D6", boxShadow: "3px 3px 0 rgba(34,49,74,.14)"
                  }}>🚀</button>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {lvl.map((e) => <Chip key={e[0]} word={e[0]} ws={L.words[e[0]]} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* --------------------------- parent dashboard --------------------------- */
  if (phase === "parent") {
    const PL = data[dashLang];
    const plist = LISTS[dashLang];
    const { pairs, letterList } = analyzeConfusions(PL);
    const missSplit = missKinds(PL, dashLang);
    const lvlStats = levelStats(PL, plist);
    const tiers = tierCounts(PL);
    const lvlCounts = levelCounts(PL, plist);
    const due = dueList(PL, plist);
    const ivCounts = intervalCounts(PL);
    const weak = weakestWords(PL);
    const days14 = dailyMinutes(PL, 14);
    const totalAttempts = Object.values(PL.words).reduce((a, w) => a + w.r + w.wr, 0);
    const totalCorrect = Object.values(PL.words).reduce((a, w) => a + w.r, 0);
    const overallAcc = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const masteredTotal = Object.values(PL.words).filter((w) => w.s === 2).length;
    const totalWordsN = plist.reduce((a, l) => a + l.length, 0);
    /* Badges travel with the words. Leaving them out meant a device move wiped
       every award he had earned while the reading progress arrived intact. */
    const fullExport = JSON.stringify({ de: data.de, en: data.en, ach, meta: { lang, speed, snd } });

    return (
      <div className="bw" style={{ ...wrap, alignItems: "stretch", padding: 14, gap: 12, overflowY: "auto" }}>
        <style>{css}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setPhase("home")} className="bigbtn"
            style={{ ...cardSt, width: 48, height: 48, fontSize: 20, borderRadius: 16, cursor: "pointer" }}>⬅</button>
          <div style={{ fontSize: 19, fontWeight: 900 }}>Eltern-Dashboard</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {["de", "en"].map((l) => (
              <button key={l} onClick={() => setDashLang(l)} style={{
                ...cardSt, borderRadius: 12, width: 40, height: 36, fontSize: 18, cursor: "pointer",
                borderColor: dashLang === l ? C.blue : C.ink, borderWidth: dashLang === l ? 3 : 2
              }}>{l === "de" ? "🇩🇪" : "🇬🇧"}</button>
            ))}
          </div>
        </div>

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 15 }}>Stimme</div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginBottom: 10 }}>
            iOS zeigt Webseiten nur eine kleine, feste Auswahl an Stimmen — auch dieser App. Eine unter Einstellungen →
            Bedienungshilfen → Gesprochener Inhalt heruntergeladene "Enhanced"/"Premium"-Stimme taucht hier nicht auf,
            das lässt Apple grundsätzlich bei keiner Webseite zu. Diese Liste zeigt, was tatsächlich verfügbar ist —
            antippen zum Testen, welche davon am klarsten klingt.
          </div>
          {["de", "en"].map((l) => {
            void voicesTick; // re-render once getVoices() resolves
            const opts = sortedVoices(l);
            const sample = l === "de" ? "ist" : "is";
            return (
              <div key={l} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{l === "de" ? "🇩🇪 Deutsch" : "🇬🇧 English"}</div>
                {opts.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#8CA0B5" }}>Noch keine Stimmen geladen — kurz warten oder einmal im Spiel ▶ tippen.</div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {opts.map((v) => {
                      const selected = voiceURIs[l] ? voiceURIs[l] === v.voiceURI : v === opts[0];
                      return (
                        <button key={v.voiceURI} onClick={() => {
                          const next = { ...voiceURIs, [l]: v.voiceURI };
                          setVoiceURIs(next);
                          speak(sample, l, next, speechRate, speechPitch);
                        }} style={{
                          ...cardSt, borderRadius: 12, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                          borderColor: selected ? C.blue : C.ink, borderWidth: selected ? 3 : 2,
                          background: selected ? "#EAF3FF" : "#fff"
                        }}>🔊 {v.name}{selected ? " ✓" : ""}</button>
                      );
                    })}
                    {opts.length === 1 && (
                      <div style={{ fontSize: 11, color: "#8CA0B5", width: "100%", marginTop: 2 }}>
                        Nur eine Stimme sichtbar — nichts zum Vergleichen, dieser Wert ist der einzig mögliche.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Sprechgeschwindigkeit: {speechRate.toFixed(2)}×</div>
            <input type="range" min={0.6} max={1.15} step={0.01} value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              onMouseUp={() => speak(dashLang === "de" ? "ist" : "is", dashLang, voiceURIs, speechRate, speechPitch)}
              onTouchEnd={() => speak(dashLang === "de" ? "ist" : "is", dashLang, voiceURIs, speechRate, speechPitch)}
              style={{ width: "100%" }} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Tonhöhe: {speechPitch.toFixed(2)}</div>
            <input type="range" min={0.7} max={1.3} step={0.01} value={speechPitch}
              onChange={(e) => setSpeechPitch(Number(e.target.value))}
              onMouseUp={() => speak(dashLang === "de" ? "ist" : "is", dashLang, voiceURIs, speechRate, speechPitch)}
              onTouchEnd={() => speak(dashLang === "de" ? "ist" : "is", dashLang, voiceURIs, speechRate, speechPitch)}
              style={{ width: "100%" }} />
          </div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginTop: 8 }}>
            Wenn nur eine Stimme sichtbar ist, sind Tempo und Tonhöhe die einzigen verbleibenden Stellschrauben — mehr lässt Apples Einschränkung nicht zu.
          </div>
        </div>

        <div style={{ ...cardSt, padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 10 }}>
          <Stat label="Level" value={`${reachLevel(PL, plist)} (${starLevel(PL, plist)}⭐)`} />
          <Stat label="Wörter" value={`${masteredTotal}/${totalWordsN}`} />
          <Stat label="Genauigkeit" value={`${overallAcc}%`} />
          <Stat label="Versuche" value={totalAttempts} />
          <Stat label="Münzen" value={PL.coins} />
          <Stat label="Serie" value={`${calcStreak(PL.days)} 🔥`} />
        </div>

        {/* A held level is a decision, not a stall — say so, or it reads as a bug */}
        {(() => {
          const b = reachBlock(PL, plist);
          if (!b) return null;
          return (
            <div style={{
              ...cardSt, padding: "10px 14px", fontSize: 14, fontWeight: 700,
              background: "#FFF3D6", color: "#8A5A00", borderColor: "#E28C1E"
            }}>
              ⏸ Stufe {b.lvl + 1} wartet — Stufe {b.lvl} liegt bei {Math.round(b.acc * 100)}%
              (nötig {Math.round(REACH_ACC * 100)}%). Neue Wörter kommen dazu, sobald die alten sitzen.
            </div>
          );
        })()}

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 15 }}>Mastery-Stufen</div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginBottom: 10 }}>
            "Gemeistert" ist kein Ja/Nein. Ein Wort durchläuft fünf Stufen: <b>Gelernt</b> (auf dem Weg),
            <b> Flüssig</b> (3× richtig, an 2 Tagen), <b>Behalten</b> (die erste Wiederholung nach Tagen ohne
            Übung überstanden), <b>Gemeistert</b> (den ganzen Wiederhol-Abstand bis 30 Tage geschafft).
            <b> Wiederholen</b> heißt: war schon weiter, ein Fehler hat es zurückgeworfen.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["0", "1", "-1", "2", "3", "4"].map((k) => {
              const [bg, bc, col] = LVL_COLORS[k];
              return (
                <div key={k} style={{ borderRadius: 14, padding: "8px 12px", minWidth: 78, background: bg, border: `2px solid ${bc}` }}>
                  <div style={{ fontSize: 21, fontWeight: 900, color: col }}>{lvlCounts[k]}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: col }}>{LVL_NAMES.de[k]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 14, fontWeight: 700, marginTop: 12 }}>
            <span>🐢 {tiers[0]}</span><span>🏃 {tiers[1]}</span><span>🚀 {tiers[2]}</span>
          </div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginTop: 4 }}>
            Gleiche Stufe, unterschiedliches Tempo: schnellste bestätigte Lesegeschwindigkeit pro Wort.
          </div>
        </div>

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Fällig heute</div>
          {due.length === 0 ? (
            <div style={{ fontSize: 13, color: "#8CA0B5" }}>Nichts fällig — alle Wiederholungen sind aktuell.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {due.map((d) => (
                <span key={d.word} style={{
                  fontSize: 13, fontWeight: 700, borderRadius: 10, padding: "5px 11px",
                  background: d.overdue ? "#FFE1C2" : "#EAF3FF", color: d.overdue ? "#7A3F08" : "#1E4E8C",
                  border: `2px solid ${d.overdue ? "#E2821E" : "#8FB8E8"}`
                }}>{d.word}{d.overdue ? " ⏰" : ""}</span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 12, color: "#8CA0B5", marginTop: 8 }}>
            Diese Wörter werden in der nächsten Runde automatisch zwischen alte und neue Wörter gemischt — auch sobald eine höhere Stufe offen ist, nicht erst danach.
          </div>
        </div>

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Wiederhol-Abstand</div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", height: 74 }}>
            {IVL.map((days, i) => {
              const maxIv = Math.max(1, ...ivCounts);
              return (
                <div key={days} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 32, height: Math.max(4, (ivCounts[i] / maxIv) * 46), background: C.blue, borderRadius: 4 }} />
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{ivCounts[i]}</div>
                  <div style={{ fontSize: 11, color: "#8CA0B5", fontWeight: 700 }}>{days}T</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginTop: 8 }}>
            Wie viele Wörter (Stufe Flüssig+) gerade auf welchem Abstand liegen, bevor die nächste Wiederholung fällig wird. Ein Fehler wirft ein Wort auf Stufe "Behalten" zurück und der Abstand beginnt wieder bei 3 Tagen.
          </div>
        </div>

        <div style={{ ...cardSt, padding: 14, overflowX: "auto" }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Stufen-Übersicht</div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", minWidth: 380 }}>
            <thead>
              <tr style={{ color: "#5B6C82", textAlign: "left" }}>
                <th style={{ padding: "2px 6px" }}>Stufe</th>
                <th style={{ padding: "2px 6px" }}>Gemeistert</th>
                <th style={{ padding: "2px 6px" }}>Lernen</th>
                <th style={{ padding: "2px 6px" }}>Neu</th>
                <th style={{ padding: "2px 6px" }}>Genauigkeit</th>
              </tr>
            </thead>
            <tbody>
              {lvlStats.map((s, i) => (
                <tr key={i} style={{ borderTop: "1px solid #E4ECF3" }}>
                  <td style={{ padding: "4px 6px", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: "4px 6px" }}>{s.mastered}/{s.total}</td>
                  <td style={{ padding: "4px 6px" }}>{s.learning}</td>
                  <td style={{ padding: "4px 6px" }}>{s.neu}</td>
                  <td style={{ padding: "4px 6px" }}>{s.attempts ? Math.round((s.correct / s.attempts) * 100) + "%" : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {plist.map((lvl, li) => (
              <div key={li} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#5B6C82", width: 40, flexShrink: 0 }}>St. {li + 1}</span>
                {lvl.map((e) => <Chip key={e[0]} word={e[0]} ws={PL.words[e[0]]} />)}
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardSt, padding: 14, overflowX: "auto" }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Schwächste Wörter</div>
          {weak.length === 0 ? (
            <div style={{ fontSize: 13, color: "#8CA0B5" }}>Noch nicht genug Daten.</div>
          ) : (
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", minWidth: 340 }}>
              <thead>
                <tr style={{ color: "#5B6C82", textAlign: "left" }}>
                  <th style={{ padding: "2px 6px" }}>Wort</th>
                  <th style={{ padding: "2px 6px" }}>Genauigkeit</th>
                  <th style={{ padding: "2px 6px" }}>Tempo</th>
                  <th style={{ padding: "2px 6px" }}>Verwechselt mit</th>
                </tr>
              </thead>
              <tbody>
                {weak.map((w) => (
                  <tr key={w.word} style={{ borderTop: "1px solid #E4ECF3" }}>
                    <td style={{ padding: "4px 6px", fontWeight: 700 }}>{w.word}</td>
                    <td style={{ padding: "4px 6px" }}>{Math.round(w.acc * 100)}% ({w.att})</td>
                    <td style={{ padding: "4px 6px" }}>{w.tier >= 0 ? TIER[w.tier] : "–"}</td>
                    <td style={{ padding: "4px 6px" }}>{w.top ? `${w.top[0]} (${w.top[1]}×)` : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Wort-Verwechslungen</div>
          {pairs.length === 0 ? (
            <div style={{ fontSize: 13, color: "#8CA0B5" }}>Keine.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {pairs.slice(0, 10).map((p, i) => (
                <span key={i} style={{ fontSize: 13, fontWeight: 700, background: "#F2F6FA", borderRadius: 10, padding: "5px 11px" }}>
                  {p.target} → {p.chosen} ({p.count}×)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Fehlerarten: the same 208 errors split by mechanism, because each
            one has a different remedy and the raw letter tally hides that. */}
        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Fehlerarten</div>
          {missSplit.total === 0 ? (
            <div style={{ fontSize: 13, color: "#8CA0B5" }}>Keine.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {["guess", "vowel", "form", "sound", "other"]
                .filter((k) => missSplit.tally[k] > 0)
                .map((k) => {
                  const n = missSplit.tally[k], pct = Math.round((n / missSplit.total) * 100);
                  const eg = missSplit.egs[k].slice(0, 3).map((e) => `${e.target}→${e.chosen}`).join("  ");
                  const col = { guess: "#B48CD6", vowel: C.blue, form: "#E28C1E", sound: "#3FA98A", other: "#9FB0C2" }[k];
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 17, width: 24, textAlign: "center" }}>{MISS_KINDS[k].icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, width: 104 }}>{MISS_KINDS[k][dashLang] || MISS_KINDS[k].de}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, width: 56, color: "#5B6C82" }}>{n} · {pct}%</span>
                      <div style={{ flex: "0 0 84px", height: 9, background: "#E4ECF3", borderRadius: 5, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 5 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#8CA0B5", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eg}</span>
                    </div>
                  );
                })}
              <div style={{ fontSize: 11.5, color: "#8CA0B5", lineHeight: 1.5, marginTop: 2 }}>
                🔊 <b>klingt gleich</b>: im Deutschen am Wortende nicht hörbar (ist/isd, Tag/Tak).
                Hilft nur Verlängern — Tag → Tage, Haus → Häuser, gibt → geben. Kein Lesefehler.<br />
                🔤 <b>sieht ähnlich</b>: Buchstabenform (b/d, m/n). 🅰 <b>Vokal</b>: Gerüst richtig, Selbstlaut geraten.
                💭 <b>geraten</b>: ein anderes echtes Wort gewählt.
              </div>
            </div>
          )}
        </div>

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Buchstaben-Verwechslungen</div>
          {letterList.length === 0 ? (
            <div style={{ fontSize: 13, color: "#8CA0B5" }}>Keine.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {letterList.slice(0, 10).map((l, i) => (
                <span key={i} style={{ fontSize: 15, fontWeight: 800, background: "#FFF1BF", borderRadius: 10, padding: "5px 13px" }}>
                  {l.pair} ({l.count}×)
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Übungszeit (14 Tage)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 64 }}>
            {days14.map((d, i) => (
              <div key={i} title={`${d.date}: ${Math.round(d.min)} min`} style={{
                width: 15, height: Math.max(3, Math.min(64, (d.min / 15) * 64)),
                background: d.min >= 10 ? C.green : d.min > 0 ? C.gold : "#E4ECF3", borderRadius: 3
              }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginTop: 6 }}>Grün = Tages-Ziel (10 min) erreicht.</div>
        </div>

        <div style={{ ...cardSt, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 15 }}>Daten übertragen</div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginBottom: 10 }}>
            Hier exportieren, in der neuen Version einfügen und dort importieren. Enthält beide Sprachen und alle Abzeichen.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setShowData(!showData); setImportMsg(null); }} style={{
              ...cardSt, borderRadius: 14, padding: "8px 16px", fontSize: 14, cursor: "pointer", opacity: 0.85
            }}>🔍 Export {showData ? "verbergen" : "anzeigen"}</button>
            <button onClick={async () => {
              try { await navigator.clipboard.writeText(fullExport); setImportMsg("In Zwischenablage kopiert ✓"); }
              catch (e) { setShowData(true); setImportMsg("Kopieren nicht möglich — Text unten manuell markieren."); }
            }} style={{
              ...cardSt, borderRadius: 14, padding: "8px 16px", fontSize: 14, cursor: "pointer", opacity: 0.85
            }}>📋 Kopieren</button>
          </div>
          {showData && (
            <textarea readOnly value={fullExport}
              onFocus={(e) => e.target.select()}
              style={{ width: "100%", height: 130, fontSize: 11, fontFamily: "monospace", borderRadius: 12, border: "2px solid #C9D6E2", padding: 8, marginTop: 10 }} />
          )}

          <div style={{ height: 1, background: "#E4ECF3", margin: "16px 0" }} />

          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Auf ein anderes Gerät übertragen: Link statt Text</div>
          <div style={{ fontSize: 12, color: "#8CA0B5", marginBottom: 8 }}>
            Einfacher als Text kopieren: Adresse der neuen Version eintragen, Link erstellen, den Link auf dem anderen Gerät öffnen (z.B. per Mail oder Nachricht an dich selbst). Lädt den Fortschritt dort automatisch.
          </div>
          <input value={pagesUrl} onChange={(e) => setPagesUrl(e.target.value)}
            placeholder="https://dein-name.github.io/blitzwort/"
            style={{ width: "100%", fontSize: 13, borderRadius: 12, border: "2px solid #C9D6E2", padding: "8px 10px", marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={async () => {
              const base = pagesUrl.trim();
              if (!base) { setImportMsg("Erst die Adresse der neuen Version eintragen."); return; }
              const sep = base.includes("?") ? "&" : "?";
              const url = base + sep + "import=" + encodeURIComponent(b64encode(fullExport));
              setLinkOut(url);
              try { await navigator.clipboard.writeText(url); setImportMsg("Link erstellt und kopiert ✓"); }
              catch (e) { setImportMsg("Link erstellt — unten markieren und kopieren."); }
            }} disabled={!pagesUrl.trim()} style={{
              ...cardSt, borderRadius: 14, padding: "8px 16px", fontSize: 14,
              cursor: pagesUrl.trim() ? "pointer" : "default", opacity: pagesUrl.trim() ? 1 : 0.4
            }}>🔗 Link erstellen</button>
          </div>
          {linkOut && (
            <input readOnly value={linkOut} onFocus={(e) => e.target.select()}
              style={{ width: "100%", fontSize: 11, fontFamily: "monospace", borderRadius: 12, border: "2px solid #C9D6E2", padding: "8px 10px", marginTop: 8 }} />
          )}

          <div style={{ height: 1, background: "#E4ECF3", margin: "16px 0" }} />

          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Import</div>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
            placeholder="Export von der alten Version hier einfügen …"
            style={{ width: "100%", height: 90, fontSize: 11, fontFamily: "monospace", borderRadius: 12, border: "2px solid #C9D6E2", padding: 8 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <button onClick={() => {
              try {
                const obj = JSON.parse(importText);
                if (!obj || (!obj.de && !obj.en)) { setImportMsg("Kein gültiges Export-Format erkannt."); return; }
                if (obj.de) persist("sr.de", migrate(obj.de));
                if (obj.en) persist("sr.en", migrate(obj.en));
                if (obj.ach) persist("sr.ach", migrateAch(obj.ach));
                if (obj.meta) persist("sr.meta", obj.meta);
                setImportMsg("Importiert — lädt neu …");
                setTimeout(() => window.location.reload(), 700);
              } catch (e) { setImportMsg("Konnte den Text nicht lesen."); }
            }} disabled={!importText.trim()} style={{
              ...cardSt, borderRadius: 14, padding: "8px 16px", fontSize: 14,
              cursor: importText.trim() ? "pointer" : "default", opacity: importText.trim() ? 1 : 0.4
            }}>⬆️ Importieren</button>
            {importMsg && <span style={{ fontSize: 13, fontWeight: 700, color: "#5B6C82" }}>{importMsg}</span>}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------- achievements gallery ------------------ */
  if (phase === "achievements") {
    const set = ach[achLang];
    const unlockedCount = Object.keys(set.unlocked).length;
    const newCount = unseenSet(ach, achLang).length;
    return (
      <div className="bw" style={{ ...wrap, alignItems: "stretch", padding: 14, gap: 14, overflowY: "auto" }}>
        <style>{css}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={closeAch} className="bigbtn"
            style={{ ...cardSt, width: 56, height: 56, fontSize: 24, borderRadius: 18, cursor: "pointer" }}>⬅</button>
          <span style={{ fontSize: 30 }}>🏆</span>
          {/* One gallery per language. The flags are the label: he cannot read
              "Deutsch" mid-game but he knows which flag he plays under, and it
              is the same pair he taps on the start screen. */}
          {["de", "en"].map((l) => (
            <button key={l} onClick={() => switchAchLang(l)} className="bigbtn" style={{
              ...cardSt, width: 54, height: 54, fontSize: 26, borderRadius: 18, cursor: "pointer",
              borderColor: l === achLang ? C.blue : C.ink, borderWidth: l === achLang ? 5 : 3,
              opacity: l === achLang ? 1 : 0.55, position: "relative"
            }}>
              {l === "de" ? "🇩🇪" : "🇬🇧"}
              {unseenSet(ach, l).length > 0 && (
                <span data-new={`flag-${l}`} style={{ position: "absolute", top: -8, right: -8, fontSize: 15 }}>⭐</span>
              )}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 18, fontWeight: 800, borderRadius: 18, background: "#FFF3D6", color: "#8A5A00" }}>
            {unlockedCount}/{ACHIEVEMENTS.length}
          </div>
          {newCount > 0 && (
            <div style={{
              ...cardSt, padding: "8px 14px", fontSize: 18, fontWeight: 900, borderRadius: 18,
              background: C.green, color: "#fff", borderColor: C.ink
            }}>⭐ {newCount}</div>
          )}
        </div>

        {CAT_ORDER.map((c) => {
          const items = ACHIEVEMENTS.filter((a) => a.cat === c);
          const gotN = items.filter((a) => set.unlocked[a.id]).length;
          return (
            <div key={c} style={{ ...cardSt, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{CAT_NAMES[c][lang === "de" ? 0 : 1]}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#8CA0B5" }}>{gotN}/{items.length}</span>
                {items.some((a) => set.unlocked[a.id] && !(set.seen || {})[a.id]) && (
                  <span style={{ fontSize: 15 }}>⭐</span>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-start" }}>
                {items.map((a) => (
                  <Badge key={a.id} a={a} unlocked={!!set.unlocked[a.id]}
                    isNew={!!set.unlocked[a.id] && !(set.seen || {})[a.id]}
                    lang={lang} onTap={setSelectedAch} />
                ))}
              </div>
            </div>
          );
        })}
        <AchievementInfo a={selectedAch} unlockedOn={selectedAch ? set.unlocked[selectedAch.id] : null} lang={lang} onClose={() => setSelectedAch(null)} />
      </div>
    );
  }

  /* ----------------------------- gold ----------------------------- */
  if (phase === "gold") {
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 26, position: "relative", overflow: "hidden" }}>
        <style>{css}</style>
        <Confetti />
        <div style={{ fontSize: 84, animation: "bwPop .5s ease-out" }}>🥇</div>
        <div style={{ fontSize: "clamp(30px,6vw,44px)", fontWeight: 900 }}>Gold!</div>
        <div style={{ ...cardSt, padding: "16px 40px", fontSize: 56, fontWeight: 900, animation: "bwPop .6s ease-out", background: "#FFF3D6", color: "#8A5A00" }}>
          🚀 {newLvl}
        </div>
        <button onClick={() => { backRef.current = "home"; setNewLvl(null); setPhase("stack"); }} className="bigbtn" style={{
          ...cardSt, background: C.green, color: "#fff", fontSize: 30, fontWeight: 800,
          padding: "18px 46px", cursor: "pointer", borderRadius: 22
        }}>{S.cont} ▶</button>
      </div>
    );
  }

  /* --------------------------- level up --------------------------- */
  if (phase === "levelup") {
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 26, position: "relative", overflow: "hidden" }}>
        <style>{css}</style>
        <Confetti />
        <div style={{ fontSize: 84, animation: "bwPop .5s ease-out" }}>🏆</div>
        <div style={{ fontSize: "clamp(30px,6vw,44px)", fontWeight: 900 }}>{S.newLvl}</div>
        <div style={{ ...cardSt, padding: "16px 40px", fontSize: 56, fontWeight: 900, animation: "bwPop .6s ease-out" }}>
          ⭐ {newLvl}
        </div>
        <button onClick={afterLevelUp} className="bigbtn" style={{
          ...cardSt, background: C.green, color: "#fff", fontSize: 30, fontWeight: 800,
          padding: "18px 46px", cursor: "pointer", borderRadius: 22
        }}>{S.cont} ▶</button>
      </div>
    );
  }

  /* --------------------------- chunk end -------------------------- */
  if (phase === "chunkend") {
    const ch = chunkRef.current;
    const acc = ch.q ? Math.round((ch.right / ch.q) * 100) : 0;
    const turboMode = modeRef.current.t === "turbo";
    const newWords = !turboMode && reachLevel(L, LISTS[lang]) > ch.reach0;
    let dir = 0;
    if (!turboMode && ch.q >= 8) {
      if (acc >= 90 && speed < 9) dir = 1;
      else if (acc < 60 && speed > 0) dir = -1;
    }
    return (
      <div className="bw" style={{ ...wrap, alignItems: "center", justifyContent: "center", gap: 20, padding: 16 }}>
        <style>{css}</style>
        <div style={{ fontSize: 76, animation: "bwPop .5s ease-out" }}>{phrase[0]}</div>
        <div style={{ fontSize: "clamp(30px,6vw,42px)", fontWeight: 900 }}>{phrase[1]}</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          <div style={{ ...cardSt, padding: "10px 20px", fontSize: 22, fontWeight: 800, borderRadius: 18 }}>
            ✓ {ch.right}/{ch.q} · {acc}%
          </div>
          <div style={{ ...cardSt, padding: "10px 20px", fontSize: 22, fontWeight: 800, borderRadius: 18, color: "#8A5A00", background: "#FFF3D6" }}>
            +{ch.coins} 🪙
          </div>
          <DayRing sec={todaySec} size={60} />
        </div>
        {dir !== 0 && !nudged && (
          <button onClick={() => { setSpeed(speed + dir); setNudged(true); }} className="bigbtn" style={{
            ...cardSt, borderColor: dir > 0 ? C.green : C.blue, borderWidth: 4,
            padding: "10px 24px", fontSize: 34, cursor: "pointer", borderRadius: 20,
            display: "flex", alignItems: "center", gap: 12
          }}>
            <span>{SPEED_ICONS[speed]}</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: dir > 0 ? C.green : C.blue }}>➜</span>
            <span style={{ animation: "bwBreathe 1s ease-in-out infinite" }}>{SPEED_ICONS[speed + dir]}</span>
          </button>
        )}
        {nudged && (
          <div style={{ ...cardSt, padding: "10px 24px", fontSize: 34, borderRadius: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span>{SPEED_ICONS[speed]}</span>
            <span style={{ color: C.green, fontSize: 28, fontWeight: 900 }}>✓</span>
          </div>
        )}
        {ch.mast.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: "min(94vw,700px)" }}>
            {ch.mast.map((w) => (
              <span key={w} style={{
                borderRadius: 12, padding: "5px 12px", fontSize: 17, fontWeight: 800,
                background: "#CFF0DC", border: "2px solid #2FBF71", color: "#14653C"
              }}>{turboMode ? "🚀" : "⭐"} {w}</span>
            ))}
          </div>
        )}
        {newWords && (
          <div style={{ fontSize: 24, fontWeight: 900, animation: "bwPop .5s ease-out" }}>✨ 📚 {S.newWords}</div>
        )}
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <button onClick={() => openStack("chunkend")} className="bigbtn"
            style={{ ...cardSt, width: 66, height: 66, fontSize: 28, borderRadius: 20, cursor: "pointer" }}>📊</button>
          <button onClick={startChunk} className="bigbtn" style={{
            width: 104, height: 104, borderRadius: "50%", background: C.green,
            border: `4px solid ${C.ink}`, boxShadow: "0 8px 0 rgba(34,49,74,.22)",
            fontSize: 44, color: "#fff", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", paddingLeft: 7
          }}>▶</button>
          <button onClick={goHome} className="bigbtn"
            style={{ ...cardSt, width: 66, height: 66, fontSize: 28, borderRadius: 20, cursor: "pointer" }}>🏠</button>
        </div>
        <UnlockToast queue={unlockQueue} onDone={dismissToast} lang={lang} />
      </div>
    );
  }

  /* ----------------------------- play ----------------------------- */
  const target = cur ? cur[0] : "";
  const showTiles = stage === "answer" || stage === "fb";
  const streak = calcStreak(L.days);
  const chunkFrac = Math.min(1, Math.max(chunkRef.current.sec / CHUNK_SEC, chunkRef.current.q / CHUNK_Q));

  return (
    <div className="bw" style={{ ...wrap, padding: "10px 14px 14px", gap: 10 }}>
      <style>{css}</style>

      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={goHome} className="bigbtn" style={{ ...cardSt, width: 58, height: 58, fontSize: 26, borderRadius: 18, cursor: "pointer" }}>🏠</button>
        {modeRef.current.t === "turbo" ? (
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18, background: "#FFF3D6", color: "#8A5A00" }}>
            🚀 {modeRef.current.lvl + 1}
          </div>
        ) : (
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18 }}>
            ⭐ {starLevel(L, LISTS[lang])}
          </div>
        )}
        <div data-chunk={chunkFrac.toFixed(4)} style={{ flex: 1, height: 10, background: "#D6E4F2", borderRadius: 6, overflow: "hidden", margin: "0 4px" }}>
          <div style={{ width: `${Math.round(chunkFrac * 100)}%`, height: "100%", background: C.blue, borderRadius: 6, transition: "width .4s" }} />
        </div>
        <div style={{ ...cardSt, padding: "8px 16px", fontSize: 21, fontWeight: 800, borderRadius: 18, color: "#8A5A00", background: "#FFF3D6" }}>
          🪙 {L.coins}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <DayRing sec={todaySec} />
          <span style={{ fontSize: 21, fontWeight: 800 }}>🔥{streak}</span>
        </div>
      </div>

      {/* flash card */}
      <div style={{
        ...cardSt, alignSelf: "center", width: "min(94vw,720px)",
        height: "clamp(170px,32vh,250px)", display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative"
      }}>
        {stage === "fix" && (
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.ink, animation: "bwPulse .5s ease-in-out infinite" }} />
        )}
        {stage === "word" && (
          <span style={{ fontSize: "clamp(62px,13vw,108px)", fontWeight: 800, letterSpacing: TRACK }}>{target}</span>
        )}
        {stage === "answer" && (
          <span style={{ fontSize: 64, color: C.mask, letterSpacing: 8 }}>▮▮▮▮</span>
        )}
        {stage === "fb" && fb && (
          <span onClick={() => { if (!fb.ok) speak(target, lang, voiceURIsRef.current, speechRateRef.current, speechPitchRef.current); }}
            style={{
              fontSize: "clamp(56px,11vw,92px)", fontWeight: 800, letterSpacing: TRACK,
              color: fb.ok ? C.green : C.ink, animation: "bwPop .35s ease-out",
              cursor: fb.ok ? "default" : "pointer"
            }}>
            {fb.ok ? "✓ " : ""}{target}{fb.mastered ? (modeRef.current.t === "turbo" ? " 🚀" : " ⭐") : ""}
          </span>
        )}
        {stage === "fb" && fb && !fb.ok && <ReplayHint />}
        {stage === "fb" && fb && !fb.ok && <ContinueBtn onClick={advanceAfterFb} />}
        {stage === "fb" && fb && fb.earned > 0 && (
          <span style={{
            position: "absolute", top: 10, right: 18, fontSize: 26, fontWeight: 900,
            color: "#8A5A00", animation: "bwFloat 1s ease-out forwards"
          }}>+{fb.earned} 🪙</span>
        )}
      </div>

      {/* answer tiles */}
      <div style={{
        alignSelf: "center", width: "min(94vw,760px)", flex: 1,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
        alignContent: "center", opacity: showTiles ? 1 : 0,
        pointerEvents: stage === "answer" ? "auto" : "none",
        transition: "opacity .12s"
      }}>
        {tiles.map((w, i) => {
          let bg = C.card, bc = C.ink, col = C.ink, anim = "none";
          if (stage === "fb" && fb) {
            if (w === target) { bg = C.green; bc = C.ink; col = "#fff"; }
            else if (w === fb.chosen && !fb.ok) { bg = C.red; col = "#fff"; anim = "bwShake .4s ease"; }
            else { bg = "#F2F6FA"; col = "#9FB0C2"; }
          }
          return (
            <button key={i} className="tile" onClick={() => answer(w)} style={{
              ...cardSt, background: bg, borderColor: bc, color: col,
              minHeight: 108, fontSize: "clamp(31px,5.8vw,48px)", fontWeight: 700, letterSpacing: TRACK,
              cursor: "pointer", animation: anim,
              fontFamily: "inherit", padding: "10px 8px"
            }}>{w}</button>
          );
        })}
      </div>
      <UnlockToast queue={unlockQueue} onDone={dismissToast} lang={lang} />
    </div>
  );
}

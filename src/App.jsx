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

const MIX_N = 10;                 // questions per round
const MIX_TILES = 4;
const MIX_HOLD = 1100;            // auto-advance after a correct answer
const MIX_MIN_FRAG = 2;           // a one-letter fragment is solvable by length alone
const KROGU = ["krokodil", "jaguar", "elefant"];

/* The fragments: true spoken syllables, per slot, per language. Head fragments
   carry the capital, middle and rear are lowercase, so the three concatenate
   into one pronounceable word and a whole animal spells its own name.

   Every animal here has exactly three syllables. Zebra (Ze-bra) and Kamel
   (Ka-mel) have two and were dropped: filling three slots from two syllables
   forced a doubled fragment, so a whole zebra spelled "Zebrabra" beside a
   picture of a real zebra. For 508 of 512 combinations that was harmless
   nonsense; for those four it was a real animal shown with a wrong spelling,
   which is the one thing this mode must not teach.

   Within any one slot all fragments are distinct — if two animals shared one,
   a name would have two correct builds and a wrong tile would still be right.

   Elefant is E-le-fant, and "E" is a single letter: as an answer it would be
   solvable on length alone, so MIX_MIN_FRAG keeps it out of the answer
   position in slot 0. The strip still appears everywhere, and Krogufant is
   unaffected because its contribution is "fant" in slot 2. */
const TIERE = {
  krokodil: { de: ["Kro", "ko", "dil"], en: ["Cro", "co", "dile"] },
  elefant: { de: ["E", "le", "fant"], en: ["El", "e", "phant"] },
  jaguar: { de: ["Ja", "gu", "ar"], en: ["Ja", "gu", "ar"] },
  giraffe: { de: ["Gi", "raf", "fe"], en: ["Gi", "raf", "fe"] },
  flamingo: { de: ["Fla", "min", "go"], en: ["Fla", "min", "go"] },
  gorilla: { de: ["Go", "ril", "la"], en: ["Go", "ril", "la"] },
  pelikan: { de: ["Pe", "li", "kan"] },
  papagei: { de: ["Pa", "pa", "gei"] },
  kaninchen: { de: ["Ka", "nin", "chen"] },
  schildkroete: { de: ["Schild", "krö", "te"] },
  schimpanse: { de: ["Schim", "pan", "se"] },
  libelle: { de: ["Li", "bel", "le"] },
  dromedar: { de: ["Dro", "me", "dar"] },
  skorpion: { de: ["Skor", "pi", "on"] },
  tarantel: { de: ["Ta", "ran", "tel"] },
  tintenfisch: { de: ["Tin", "ten", "fisch"] }
};
/* Which animals each language draws on. German has sixteen, English the six
   that have English syllables — the pools are separate so one language can grow
   without waiting on the other. Sixteen matters for more than variety: the
   partner tile is the animal whose fragment is closest to the right one, so a
   deeper pool more often finds one that matches both the initial letter and the
   length, and the closer the partner, the less a single letter is worth. */
const MIX_POOL = {
  de: ["krokodil", "elefant", "jaguar", "giraffe", "flamingo", "gorilla", "pelikan", "papagei", "kaninchen", "schildkroete", "schimpanse", "libelle", "dromedar", "skorpion", "tarantel", "tintenfisch"],
  en: ["krokodil", "elefant", "jaguar", "giraffe", "flamingo", "gorilla"]
};
/* Fragments fall back to German: the sixteen have no English syllables and are
   kept out of MIX_POOL.en, so this only guards against a stray lookup. */
const frag = (k, lang, slot) => ((TIERE[k][lang] || TIERE[k].de)[slot] || "");

const canAnswer = (k, slot, lang) => frag(k, lang, slot).length >= MIX_MIN_FRAG;

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
const TIER_ORDER = ["krokodil", "elefant", "jaguar", "giraffe", "flamingo", "gorilla", "pelikan", "papagei", "kaninchen", "schildkroete", "schimpanse", "libelle", "dromedar", "skorpion", "tarantel", "tintenfisch"];
const TIER_IMG = {
  krokodil: "data:image/webp;base64,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",
  elefant: "data:image/webp;base64,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",
  jaguar: "data:image/webp;base64,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",
  giraffe: "data:image/webp;base64,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",
  flamingo: "data:image/webp;base64,UklGRqBLAABXRUJQVlA4WAoAAAAQAAAAjwEAVwIAQUxQSDAPAAARf0CQbRu6wbZHRIx7/6qXFAVtGzkJf9g3fwCIiAlwkTWAioltpCPwE+KAjBeoE9tnSBOvoUzcsET9ybrlafsUR3Jyjdcc/wXl2JtPZYaT1nDdKDPbMrNdZjgxk4ZOSxozWz1mbPUy76qXUdHD0O6KaLVKVarM/A69o/op8/dLXSP6PwG2aG1bHFn5/qqkKqlk1upx6enjLunjOnZwz5w7P8EdgjsU7pCD60zucAjuULjTtbgdq7W4hNX570Y79V4k6Z75/+/7ghPR/wmg//v/P7Be+KpXX77e6K/zihUA5de+dG+gOv3eOab/dIPiskexcPECrSXftGh7NFZZch6EWaCw9AJIj23VVwliW1dWch7keUVXMyyxH2oqx1J3KUqfWQ4qetrAknepSZtloaqlAZbe1VK5PFR0lDgPduqoBw/zUEO68gFtDWXwsq+hY34g1k/SeJLqZw2e5vqpfSkC7aTOFzS1cwzedrVT+5Pr5sBx448N9KLfcHTbwOO6VpL33grPlZL+zcD7rkq+1iDATCEHjlisBD/fQaCBMrJHEawuvvq7BuFGmsgMQk4UkVoE3dRDMkfYkR56CDxQw6dNaIkOdPZLi9DrOri/QdA/HAHWaEDf7xB0/7F/BRBrYIbAf2rPAAjlS/8OFnOSf4LwDwPIxNMPOgZ+DKAnnd4Al23h9GnHxnnCrYFNG8mWOT56JLquweQIaMm2CSbzM0BNtK7jAsBBklzPwGQBoCbaDSi2eQBgQ8lSg8KxsZskn2IMPhuSZTWeYKQpWQVWFwXLwGsqWJeZhwTrM1MXLHG8xIIpQ/AkWf/X52oEG0iWmXa/oznwqZuC/ecK6JPo+X9cG9J7H0NE9OZz15ZNqU9f7ZZy7Oh9F9HEh89dLJ1SV/zCUX31R/cFNP3n5y6Sj+iKl31n+1KFe6I4euDzH3jXxRcZWnWztMJoQCmVvHr/L3772+e97sCL6WzmWHpOSi6X19dSvbyWkrpYfk1J5XKyj5ZApCNtlmOPAXmgoz6W3yMdVx50daStBy0d9eBhXUd7PizoqPQh1FHjQ1VF+50PoYoehoeFUVHlQ4s03IWPHRVteJGqqPKirqK5FxUN6caLqob6WBVmfgQKSt2qkGNV2PAjJwVP/cg0ZPzoKagLP7sKGnqSKmjgSUdBjSfn6Uc7TxZnhvP0oxpP2vrpwtPz9DP1pamfB3yJ9HPGl3Xq6ThfEvWkD/nSVM/BC77sUc8ufE3VM/Gmo55mVdDWm4F2UnibaSdbGfr+oKKcqT82UM7MH0QzQ005jUeJcqxH63STweO2bno+dXWz5VM2MyBSTelVopraq5Zq5iuD8WqgmRSrQuZXbhST+oVEMblnDcVsAY/71NHNL32yRjU/9wmRXk4Ac68aeinheVsvlW8DvTS+oTIzVDWz41EBtNRSAo97lJfoaWbHo/FYKw28v0Yrxj8bzAq4XSlNAIXRSQ3s+IaGTpoQEpUkCKGjkjSIItBI4oBt77BLI9rix292fp0Bco2kQFHA7xJApBBlEGRLISnCtNGsgI4+slC6OilsAKirQ82AcRNCqg5tEWh+sTZSBJvPDLh6ZsiNLrQLBx1dpAg4nxkQqyILqqmKNKgs1MQgKNQ00Q/rWk1kYeVmVkCgiK8GNq8HHVpu1KDuDwwPquFrNjQ88UYdpBYMfjbQQBcsHrhSvs42Dyhuky4zYPO+QLT0PBhtrhcsuQmcfvBPkVxnwWw/lOoI2O0JdSMYvl+kQ2D5DoG04clW5DkFpgcVaXpguytMYvmyV8ryZzCeBZKkjjP7AiPIDeD9Djk+7ZjLjRRfdeA+kWIX7O8SoutQcFdskKECxtwhFUFXYLyYYkMBdAURHxIgdcBYABvyd9RAxgZ7+X8hoAVQGO7WdgArAirc1cC7SvYmtphLLIpDkHHA3AngT7UQecDbDCicEKix1gVwYUeKBdamwHjPSZEbzirgKxZiRoylFviBk6PGWA+yPsTYVBjEbCWNDEdWUWerCxnLVSRsjYQA7JQeW1NxMrYaMVZZZSqFvO2ZoctUT4zhKnKm9vYVToBVV3ma7oMwCyx13FMI22VJzWXJJwxY6kLWfjmGkKOvCjN1B0cDAOtGnAWO7gXG2xA35WgCjJ08qDJkMP5TLVDMzxC4x0HgBj81hO6wkwGFFanPzmngyk0jkQ2Y6Thg3UDiwjBzHLj2upk4SwBQYaYGiusaWV5Y4tBYixdtMH7gCch6DMXKWI+XHnDd/ZksFth7eiw3rJTA+qE7ZRksl3Y4hoSTxAL//zqEtSWWJrQ46QP/dlagyW1O9oCn15vS5KPi1AQb8KHPAlfedUIa5IdPT0DMRw4UN/7RijNYweQmH33gTxkEtlM6fGwA//igQMOlKahzkVkA2wId6K5MaXKxB7z9USdQ/6ujKR80TMyBZ73WCjS5OAkgZMJg/IiDxHYEACMADR76wB8hs10ZG1/kYQK86T//FWm1PR7uxXp2HNJXWChRvOCWB0QbAjEHCYBnl0dFOwLMc9ADxp+xj8hkywkAehxUuOc5BkIPTucnJmUMaIf1w7BCAcWZSYj8ywD89gcQe4ipNf9yANf9Ryz77Wnn+dcDsG7E6oymdfw7AeDdM7EKTO/5V0F2Ow2Bb6kVbvcK8IGxvvFtCOHzETAcQ+zbnnSrjXyr46E5M5znW7Pvmihoe5YAKF7zjSgYeNYD7sLvbBRY49cIKBCLsV8TAIVw+fFJtuLXLALsyiSs82sP8p/C1IZX2uy7S7Zy2lO8Sh2w7m6TbZW7veoCuOcJFwmZV30A+DgiceDV5r5XOPkGIwCZVxWAJ6+B/NkYQp8MgI+aCJgce5Q4jBGRkUcd4J6LEdHwKAdwY9FEQ+LRCOOlGtZ59FVgWIwwA5TAMDtWqqHtF5DrYeDRdJ8ic48mAA4pou9RDeDeUg+ZRwbAu6HIwK+/K6Iw3iQoznxxRRE28KYDlN8/rQiEPikz9qYXHaE3GQplxN70MJ4RBohNf4b434ywhdhMvDkRHeu8meAn5WzQxzsHI1Xs9SYH6rpY8KYHHIUqE2+GiM1rvhB40X3ERkdRRl70APzxlC6Aihf6l8CHS2XsJj+/iviMPZlGyB5P5hHS96OLCE39GMbIwI8TMZL5UcUIqj50EaWRD2mcJD4kcRLNDDUPbvkCxjES/8C9CeL0E4V7PRcnGLinjkVKywP9NwBOHZnxQCkDWHU0yMsp4vEnk+zjyc+vFvFgJz2FfN2IB2AEIA+9Sc5FxPg8+Zs0a/mzbAPjkeqOVle8VLQiJK/vHq3GXrlPtB3k+V2HpxWXE40EyV9arqFD3s896vsTBpcQ0SlBOrRvtJr83tA/Irr+klff+OwKEdFxQc4jWv+rKcX7Lydu/yJIQkRzH/vb8NDwR5+IiN+XCBLR+Nz6feuJ5f2CxBP4vk6OgrhvxOiwV4rRZG9XjIi9oRQ2YC+Xok/8GyGaAsyFiAUYyGBDAXoy5CRg4kRIJVCNCE0RKhEqIkxECEXIJRiQiB0JEhm0EyCQQTX85STknL+BFGv8taXos2cjKdScu5TEnHC3IEfGXSxHsjKohrlAjhzMV+W4l7t5Oabc7RUjddx1xRiC+0yMm9nLpdANewiEyMF/Q4g1AfYIUQqQClELkIf7KgIkTgAcKYvl9952I3NfhaBb1rM2ksQu3WwYm0gC4Ceb+aqEQfFpw5WVBjh6J08dSDzPUiaSfRNHuUjACxnqC4UnGXZyqTBvuNkVC7u4mciFHcyUguUxLzPBMDCsGMnwICtz0VDnpJItDRgxsuHFjFTCYZ4PK11uuNBOOtRmhj4XyoqHKhMZ5O8w0YmAHhPKymd3MdHIh5yHxEUAaix0EIMpC8rGAKozQ8KCiYI2C1UUpDMDAg7KOIg42I2DmINhHDQ4GMRBbVYoAg7yKEiJw04UXMuCdhGQE4/zCNjKRCXfLmLyPvF+GnCRixcTl5lwP76K+JyLlgfE6Ey0mDgd8mffedY+u4lYTfnbOfcde1Y+cJMhZmfsXRLM3fyHci3Zn+8xxG6fu/Z1ARE9/X2jaXb4nufdEBDDesZchSbv+9j37nvWF/HTF1w2R1z3eevTGm8IiHF9G2tXroV5bRnrkqzHGYuFURVbf36uNK81TGUhibvBVELydi6w9BQjkErmHMUk8oSfg0+i2SANSOiT3BwISOqamcKQ2IaZ/gWRWDUzKck9Z2avXPocM4tyqZKZjmAzZpqCGWYaglmSovTnfMHmFHbzoz96aNlqq6IoiGhu/S2vWvrxu0fnoCgsyYJgUwpUaOIGopde9rlP3/q2L33ytk8ul/knh8Ol8uDysc+852UvfeHllx8kaQpWk8ST1mieFtL6jebu6vr1NHkzgipn5WyOSBJl1ByZkCwIVlHY0JERyXmClRQIHDlFkghmKApy9F6ShmAzEuPIJskOwWoScnRAEusCoUeJYDOKPjmak0S6yFwZREZFkbqSk9QEqwPapCiMYGVAJ0hIF4uudCgQClYHdILCGl0suPJVioJ00XBlQGIEaygSV/oUCAWrAvoqRZ8ELwPqUOSCaRdQRlEoo+lKn6InWArK81zJKVLB1JwicSWl6EpWBzSk2KuMqisdipZklqLiylcpGpIZiqpHbcG0pQhd6VqCRcFUHZIjaElmCHLjygSEeyWrCWzgSm4JGsowroxAeJ5g2hEU5OoZS9DQBUJXBi52bODKSUSFqgkycvVYZBiCwpkTFAuCaRfQiOI8wdRZgsyZCUVdsoag51MiWb3CpD7VddH1yIaSTQlSZ2YURrKKoOtMRYBEspqg58wWRU0XLWdGBDbQReLMhKAgyacELWemkTEhaDhTrQyT6EmcmRLkog0Jqs5UBD2lzVaGiqArWt7OBs6cIVgUrdsOFWd2CVLR0oA2CVqiZe2scWZAsCBa2m5AzvYJGqIp06rrTk6QyFa16rjTJYhl22u16E7i2oW6aLqj6lYpyd5rVXNoq1VPuLxV6NChyNC2RZ8czlq1pHMt2i7puoXdKZyaL1ZsdklVLfok/XSxlJw+0eJa8TYW67rVaxGK11koM25pu5CVT5WL7CTH719oF8l//QLDqmsdu0ikAFVfartxTU0X6JEGO5d4vCHn0/OXaqpAHVoGYJ9DPmYPP9XrAh2oC773mdEHyNNmB1d94ibSo7nQ+PLcA69Xl9H//f+fSwFWUDggSjwAAPD9AJ0BKpABWAI+7WyrUCmmP6Kr+WmT8B2JTdrjrVdtd7c/8MpCro1hSqWDL9R584n+3XmjaJZ7AHRQPs6A1xxzUg3VjXBsAbQFR2/1fGhoE0NLmvtdkHJ/zm97j1siHoLO7ss+mH+vekp0kOer9M3+L31nor/Vl/vXSAf//1AOFx/m/4je4f5v9sPxq87fzr3w9pe7n8N3aP5Dnt7Tf2X/Y9AjEz/59wGMRl0rTJ3H/w8xX3F7Cfluewz9yv/oa02umTHeNsltdMmO8bZLa6ZMd4ly7aZXurFHQ8GT3kw6cgerKaIrLhJgXBtsltdMfVaczjbYb3nbh9//sEqMGoBO3pYmU51JHwHpXotBnrgOamGPdMmO8bZLa6UtXIKzwe21v9a1O4yIORV1DOw49zefl7RtceJEaixtzlDwxAx/Njm60FG/g6yY7xtktpphsOTOKJvvf9llZYH2TUOzAs1Es9ui5iIM1yGC2xk/kz/ff9aCJKS3zGlCLR3Io0Yc4Zb5wJdMmO8bYDhOsKkmaIr7KE5gi1J2eh6c0enEykZSCJ1KamoSHx1oA/hU8/oWlnSwugYQ36c3y8sfX22ZiYB4JZ1kx3jbJaRRNCOTdVFNt82Obo9V9buTg30+uzCgntLmqIvQpRmXv7ovZS6a+tygdNqQ6HIdZMd42yW10yY2qdIWQk7fBjUAwyR1rEUztq2pO0TvN45UkDRYXUbbJbXTJjvEuXZ/sPBMCXz9IcI7BQhbwPuRun2wI1GYeXL1wZm10yY7xtktAVUcygrnhixjYgOnbWwVHEOLD0I2+U2hGR3O0g6yY7xtktrpjsNtHXHFULZN6lVWdyULfPAkRnwFwlGoJXU+DVNs1qe4qNtktrpkx3ja9DBIyoAFGdqdpZWF7sXESekv/z5eIQYxaetZMcnNpGqpGKQdZMd42yW10mRB1Ml9dnGXwFf6YNQqLsygh5+ZLlGl+/pmsGMRiLeJaz8J1SAMTxG2S2umTG/7eFWBD1peJKTu9czjeWu4BpB/z8gXqMgQR3pkwSb5UbjADNk2woI2Ow6DejSk+yn3qxvoabUBv9SDrJjvG1ymTgje7Y0l3b2WtDOjtSIkAj0Zrlyfz7JtkHvS79no3OgKtynHWwZPyXDP5FPpu+6m7MxJtN+XUbbI2ob7V/1/TJnaD4scRDjyG83QUiG+bcEzx46IeMHF4eJsPyoYC0dqZdIlgA3wEF2Yubkf1y+5EVSK4Mza44nLEZLTYvIlGmrd5kCtPVpywUkRGYdAAsw/EZvFqSkP8l69JzVNDme0WxxZI0sxyj6ThqfjbJZnEtmga8BGOeEjJCX40BOZYz/dyWa3UjXZ+1vQ++fmbBYITEX/v/YTUfOVsPL00SVzbBV4bpkxqWPtOqC5xHSevXGsX0EqhHJzgc1Lebh/PssB43peyrBVP7hne77zZ6OOZtA4a0KkdbSqRwXTF/MjuDM0LYtxLf9uCsjcq9e/Cfz+c2lb+HW+umdEtY2qR6bMpCJ/xdCHZ9Gd93NuyWp23kQVZMs9J0JoJxh99GndEWVpETo/GXe85Uc+D3PQW0uoDi6SLj/kD+eLhpBBFPuOqi6lcqJDEBLZpE1daxoBkkpHpWJOv3TgEN9/Bbf0sQRC9610nJLf/smvU61FsuXsuFyreBm8a2bmxLhh/KPA2EXwirsPqJOM7C58oSv/UJ7XGDq8UMTMXHyYBvr/iEemYkwDOQgcHdwxa6c4qzUG2TuOJy5c9XjpfzRHpAHG0RVMyfB/aJvQmtNZax2zTFpptNEizk+REw0dw89g+rNQKO1RcGYGj1IB4SWmz/SUnPcKxKvrFiWkeo5yUQzMwES5uCla5E+GWiLxMJG6MQlYjcTltxyrlvXDxV/Y8H5gwl5rqyqAD1rXKGaiTr6VOjuFkN7NfYsMxOPEfKwdDJI732Dj04DlwbVh0iuczBF3pHWpGSm2Pmf2hmGsbsSNJXzMyTzXOsBmTLE8WLM0IFpTR3mKb9EiFPx91kx3OSAoJ1iGUiCfRkyOuzneDdVZMwxrSD3HBgoMIOon8KZZEkbtaYRQskqWaZy39smTb0EfU8qwp/mzLfODM2myOu0nrZ+YfCrT49jZUTpQhqYWiFPpVLzHexqotL+eDalKIhZTMXFQ3NZhjqWOk6HsBBy4SXPxVe+LcszgPe/vShZrc4JRCiXaZHd7w2G1MHcCrlbgQ21D3Pyc07deg/YZdSnqGTLVy4NSNifirLJf6yZseDr6YDDhYgiiivqsVzKZU5Rm19c4OGJD243vDVedJEu6vUi/Ha2/HRbwvEBhg0+va3/acP/vLlwbYnu+RJlsJMzkhTgEdUDnLxIIgynovVP5EmBf4Hwk5GllCbndb5isGeU/VrKgv//XXP1sWICpOcv4vANHh/VwZm1v1bq9DdOWY05E3Il7ty7DaZnvMDzpa2DmxLKBMkj7m0VHjWnZfa6ZMd42yWQjPfK4P0aEpuWAI9s0/xy8avfmn4iHUaGTpGtDqCnE/0yY7xtkVFjI+GxhyuSu3TBkJNQoPZRacE/jTEW9q7/RLpkx3jbJZEaDoOgrgTKVY3ZDMUhrTcfmmJOQtxLha/KlRbQOxoOvuSYFwbbJbXEQQmOn5lgl/Tx8WlicSwfl/RA4yfn9wLH58HjnjW2fbDOHxw2MfbJjvG2S2umQZnvKfDhk5lUPjBtsltdMmO8bZLa6ZmGytdMloAD+/33MAAAAABNWIBGiNjVVPU9aS27RvQEufZ/dIYD9ouuu88E8tqR5/r9tXJxf5xGNPrnA8T+tW2KmQKvKt4DW+HPzc98NAmjOou7SJC+Gwl5KVQeoEQZAqXL9m+l3igscuTJW65z9DdtDqxkZF+T26jpT93PDgZwFnJhRD0jDEAwMW4PYXrjWSdbNrSOw5f0MrW95iSvR27go8FvGeYBN/tDjn6rNcKJNQG01eCQAAGkvj5zwJPIcudldW5MgaZ1Xpe4vFHNmtr2V/a+VUEz1eU8x8qQ5J+Mf6N0jKtFYpKoi6xAv1s53g42v/3a50+cqxCNTPansgM5m5GbP28KOiPC/mhIad/bkLAR+zbYo8M9pWaJT+XEPeIr+OSMItibNk29kB13vAtzRWwrZu9l38H+/5VSwemz1W/xydZuHypfVtYHDocR6kHey8gjS8LzHcvwS9rtntvFVsZK+SSYR9hEIlCkHlWTZmyHtjeIDGQv7F/gzV3CNKC9uZwABVxbl/89qW2KaoRyMiBkemBLy6ewWvvrM6WBVXKy78PXikkcJQcnR6PSTtOpRnIauNPOvInXvU/WaRP4+gNsXGrbA07PRquhRqkdFalyRsSjI6nIKR05zqx0VtfNXv7cTWLzI7216M8NDF5sad0uDxsdPA2j90jVP2Kw1lGZomra6Gz7LBipxAxxVMVI/i1zSFROJGls/86btO2jqw7R7K0ulh/hzu3cV0+7SdzvJ8P8/hYLjERF/y/WyMsnEDKpIjuogGU1GjgOd2gfVy6r5OJvIyC7sUhZ7ZZmDyLjTWxjxt3j5y4pxiK0+Zk6zqMEVTEQ/NUZVnfx0bQyGpIJ9tcGTOpRbxTC+yvrwg8068uY/4c3aNyvxnxsjuJIq4DEOrMhKR4c8C9bx5fszdyWIXcr24EQpiDKazSEnr2njPv6Q/N2+sJYQF0PS9LMc6F3XvauwzAYD4hnVC0eaNFYAFRUs68l6b1md+D6P5U7bv/I5J/t3Edb7wCjzqCmkUmTIiHpFUicbJnc8nQmWf3ClgDinPECDunzjbnJkrzuGDiZxsqN0IkdQMF2NKEoQlUyp8stpVPTQtgrWm2eIdn2pg/CjOP8dI/0onmi4HBTxvTSoGgjfrLm4BF60FM1njuURViQKbRsj5mmabIZyNASZd9QLYKJOJo4OZNgjsHBBWoobhi/ONkHR2NVcMo78GW2xjy0Iea5cl9S0L3ktAuDUFEHVv/ziDXMXlEjscKCT+kGseU4Ich53wgWNIGFWuWBgLyYoVC41fo/I81TZJj99oLduEAdINwc8WI8jH93jJ/gHX85P2lCTqtKwHanKuyLHUbe8Mo8A1Kv+R2SLQgY49gKB4gKM+9kji7knDLy5NStVZa24J35HYCSoarGzM7POIrz1EfNvUDmpkxR2JrBMZ01dIhdxzjb062IfxKXiO8KAAs5uD3rrFR9l7FBE6hrCJsIbu/d4at5RWh9NuBt7v9Z2CCiv+8aAprfjLKTXwbljuhRnIgni1QWhcZJB8pDeDBiTMJZGOLznUCj6aXJfbOceuq3hglv3aBqWqq41neTf+IPByIL++qTk/HwAPTR9QGvGfeIyHrTNis0yLLO2IgqQhEJAWGk6qtuE8UQqTQy8Ne5XorhtypKOeOQ5kxZkbrabjuQnwyL6Uh/F+z8r9sQMFpZ0jY55HeHF9uCKj+LyLiEibjmqmd/LjGJFdhN4t9x3bnYQWOF2xAtbJbHICDehWkXLzcVawTCHQJHiBE5cQwVlc/ELuF1lyJZWSGZtxrKnkrHxe9gZm0Qgp2f+kE4L418pooJ18FMmHi5+4ca0otVhBgOHoA1g3hJtCxaHhyaJdWausUZVleGlTKMiWGYS8HX46g9efqsVeq3/noCqSUqPzw3ct7D0rvyu5zSrK9RYycEMirlAJR5WWaYCt2zfVgALX3DiBNuWJKrvX5ljrPPkMvlL/NKfSBqgfJaFNMQC1RKKdBJS6rGTKbYCJ+aAk5hRyMEdKVtN2fBAst3DK42sWQKPULh9k2tOb4j9CsrGxlQ7LDXwBxsdFDosyUsgeteiqZ0AABDHgS+k5Vr+g1A1qtQtgK6h63e5FkWzvVDlIih7aEuy3oOtq5UAiyRaaOkL/puOQ+yWg/VSM84Yy3qsActLUwL0mr5il9lmmNdQBMBdXglT6mZN9m2GKn0pbFoYF0qddW5dNpqgkudsHK6Y7kuq9tga4ktFw9XxlKMYctfv3I3aKdceKMW4kZ3LKE82d5OZZX0HVmL86h6aRFFCACZT+BnzADoA2WLeUb+Ny6ZZFQFdZPVzhFmUcvsGE7xgojDFI6EKNI4QB3M/cA3BfrpFYZWTeHuxJxBiKSJ9j2jGW6P5L55mkNeKQVAMkMaU1P+CwqtK2dpixLjyj8GDevw7RztABkxhBCO2eC6owMmtDQE4cTLrrVFGnEhKB1xalrG/nxYn41un8Zuy4/9iz9spktIkfuUVdM/vC1+gXetr6C++Lkb/E3yRyFCqRa4pz9yf8abM7iGmrpeJC8278sujnSwOAAAVN+QgQdpZSpuX0T/jIjVadRsY5O7+neROX30V3LC6jwolY2xygP5f1k+ncZenYxnjVxr0/9A7BbcCmpJae1siSe1UxoWNFN2lSkQ6adrwQ4JLOdobw932WckhwYY+Sd+xVACCwKVgROyFaohQ9fZlxcSfzTV6RFOCnbFWU0lUgSmnbvjIHb2BbDYR0iXhvDl7FWUQbGz3OZXrCB2DJztkd1rn3wv5J96TOuIXEfI0DIWdh3AneGFd1/ca+zug85IiJAMb038lULCN0o3YiGacQrI8h5VcELEoj3ZmaYAADTkUbyJPk0aPkkRKPb6pnocVGglimYWM/FXcleZMjLlVMXG0PNOwfxqJiAiDVtttUeQoP7uEjEw3+EtEpYWA0O0FaiXQmBuwvHjQ5ebteJAcmF0fhD9UTClUsmUhVjwWYDgiz2m8OQ0L0ubnioIqo0fXPkc3EvKjAI662iKKhzYoq2Qvpx/AaQKj5nzHTqOT7Cte+fQ6R7SSirOV+TanYl/EQ7fA2EiynMuUF9lL/FKl57OQVs89O1TOhPQf3p+5064QEpp8bQGzXMieHCT9VLw+qaCOrxFvbXgAFN6qkxPyJySeX9ZMvARvsWHmTiimkdbW7SRqLjVm7y8cD9YD41ZNxSNzbUEcib3mSowkAvmfo6rPFJ3JNjH3PZCEshLPP0X+YTpjkclSWqpU/uaJKjjp4tYZKWayUqwQphWzA/ogzvMbNAOqh/jH5APWdG705aEgEscNuxpI2hQgWk+pXp4xI1B2CIx2M6TQVLbzjQvbomFIljnCP5Oy6y4cc7OPU6ZcW49Cu2CIiqfLkAsd6LiKcN/xGNgkdBXpt7larINQnJ4vbV4BFO34fJNbxgPWo+iQTr4nGhP2OKnvUuNQAAPr/qMKIXJD/RlU8IVtVSN49dZrBNk1pJBWGwQAFttdiAcKy6ey+IGlSpQM3jI7nl74b7R7UO6hTud9ndcxJ/VuIDc57YbobIcDyNGrVU9QCBDKB5mGcAG9SbfZp37qNaPvzAAUy+7Yt/uW4NT6xztUigHgb3XX3avWpDwkejkNCbOCpF6J+KzCRyx1KagpenC2fkLUF0OvN3qGdP1sY4E5zaftpYDooDSlJm2iwMEbOVr116ll+qh05GyhGtV484FboUTk+YcxI9PVprLSBiC6ewxqRs2+XP0ZofiZXuxA4YIHR8loBNVFeIIABPfPNj4LdAsqY/CvCYo5kSwHjnpJcpxLIcf1PpmQXTH93nsXFmG0NTuP3uNyH8xikyAWjFyZfRy6VnmSMdAsu7vmpFZxu/+JyvpKhlMj8GLCvEmU9PXbcSGJtd61l7btPar91b/FdY3A4jWU2Yrms/cGUpPLdk6A9LLufeOc6SHSPTH3LAIj/JCC+wS1SduLw1AqQdWy1x1QeQ9FszHEDr+S9P7bDzD6ZaQhimNaCiGymN//kyz1H2lIrKU/FdC90KZGbo01gvZN9SN1hREZDFxFNxRIYzhMYh5alWsXFv/G//VFVgpZoeDuwQ5isMA+neICbBX9cR3fI+q3mKv8p1uQiHd0hPa4OOgAAbDjwbB8XTcQPmZq3IYjEfoFAoZ8yN+cbUbllX/nt7kEzheGOBOuLLzSx2j599nkeF/SJBhQUXhH6JUjHSchWQZSVImCnui61utmShS7OdqZyyeJSrGWzGB1gfcc+vb/Nin4GHB+1iK9m/AbTK4qzqxX7+6yfAU8hgxi5K23NkscIwhIXjFftgRL4K2DPtANhOdNcPdxmLJVvXD540Ie584+ISthm1OjHXIVEJ/tdG9tdmK7NSXZT4M63+sGuRkmd2k1+d51UTtNFCTaDhZcAIlMMxK+Nbk30pT8m1Cqk4mWNk5aG+SxWdRBd0Pbg1BPsiiOjryjED+bLQObtd1ln1uBfgrBW9XFeC6GrXwAA03+j+bjzgaBLt9WCgl3djwvgW23ZptVAhDDlB91shO5K4oABFFE8dJLtWMjZo/7lWeJRzIsFxxeGvwldLGNDcF7pMxQ+zobRGC3v+pP6z0fFouwaI6Jk9EyWIAQdXb3IUDa30sjZDakMNFEIohU8q5CdnbQSYYF/xAFRtTy3ydVMJouHlTocQTqqzgJi3lzkHk95WVtA419YjqEKkyJpQIMpwXGja7hD3poESW25fI72hM5ouPgiyDxRPas5BiutX72H6rFoOcMby8UV0HZSLoe/PBNklMNqNxOrda/M62OfkOxqpvZKuKikRji3FUfoqLYtAwwqqLnrEZ7sY0vRK/FKDRx0+icImbhrWnwj/Cj6bVgkPrsrbFRDetuJu+bDoIfwpJ0uB9gHgaen7OqcG7XwG658OmQALd8yG7gL8pYJ0zlmvHKZMksI7oiMYbl1aBzvnPd/7AcXi60YeZvgMqmuiuuWXcun7ghjHeYsfw3n7GBac+KK5M+aQp3vZKRXTZP+IOQyhYkAGjsahmpcaCwwK0ZX8m5ZA6KggDBqi+9gfvIZzm7To2/3T5uPG9e5j3DAT57jzvlXEMePWAAdIvwJtLOYlypQel97VVBv3PdobJvWywZU+H74C+4YQm8ayG0gn72i6j1RkZz9qyAUNXD549rl44O5+WE8828JgaV24krEQaEvJSlSOPCCQxgs3QPtdn3lJhuOJaIZnP7NbSyi9rEXIW3z3Hgo9wpz5kJpRjd7XxrPBLpxsFDcy6MP4i/DPPP1iB+NAGNCjQ1cnSV2n4RXyZVPJHFpyosKu7EVFJtYYgJzsYuYUUuLnknYGdzN98e1aD+BtH9btZ7P/vaO0Ny0Hgtvcav210yPd5+Y/InrRiOuJA4k2/CDLci0byagwj4tKL8U7htRsbXBH/dGEqlBost+oGY5dOV687OYqcZgntaDLcwC9HjJoTFqCHbZRm4NterJFyB3I3WGG0WtceusHCsJdna5rNHGRLoX8YjUNSd955OfX2yfslV76Z3aijyPqTJzJMS6Kcw1rzLsZrT/5S8NK0/8iNnK36Kt8f7P4X+HQBZPx+25kVryisY62ZbeToFLmst75L8LKfum7d2YotaC3VobC925AOah6JAvYI5+1wQBLZ+CG4q1Qyg1g08A7eNK6joCQXSBM3+GW3UTeSWZ+0OREca6fohTWFChVx+NNtwIVCAGZXLOMWjlAi8zC1MivKIG0ctN+XMagBkSKH8ovHzcFiwWclzVpO2q81L+1sm5+KYY7lIRAkGnwHHVQNHIJSj63BonEkjbMWb+fWFadF7qCM+FMKC1ro7UuZNkuuEg5Ch2AD6JQKYDttqB2xFQ2JQXcHs8cb1r5rSjMJyVocmDRSMcdr9BujAF8QD5qkL/KKPl1WqwolnrTkK1EgoIiSwBUV10ie/6k7HXCjLc3k5wWgzVkS5lrd7sZTmoUPvNJZPJqj2YUTTJliLdJUZeGM6+iy33Bi9NT1TwGd/92QFy9YW9gBWBFOa4nZ1hqUrMbSwtGGZ8c6r548bg9SIiehDxVYHp//0Gw0/0JW7Qfac8kdoIMOD1O2G84bPLDO1AqGK21IqRoPXEmWfw4c+dt6I0gSMHo/9iE7FMfDOBwwBprtjDuZjnm0OGkLlG+c+9IyiAnKY16ANFrqarEjX6nXYv90KyABQITKIT/aoudb2fJAqUBeI+na7onhKOq9JXhetsnNFmNF5zmeu0wKbrsjpAdMx1Htn5tbYDHgxjsZdA5GUMFa+mO6r+TKA3pboME2lyVOhtH+Bi9m07Xkv8puZB0Co05/cISGQipByo47gLL+vTINlvQ4J3JvB6JAbzbEZyNoS8/BKOXUYc9Cg++8hDYv4NsFu5KDhWcMlMYbiWdBhd8Q+wattd0/AvvjfVTwkXvmmk4pM4HiY3rp13pL14oFf0GqaJXA2/eArQhZXt15p9kWYChEVyCyVli4a1Kx3IWydFDZnWTy4oE5ToaNQmhb4hdVW5SSXs4vJvHY7BEAM7oL/dUAQU9boW3lwCe5TT/STr+Fn2kCoxVQhwI4J0ha9i1IkjbSTUKjsc2Kmd9rYM98p8aLfqjvHDUbBcEVrtDfh9/MVorNR3Jdo/JJ/4SIcKU1KC5uqhHEWpx6AmPhVwgFnwwmq36skw1kTM24EKZln0iI8ps4MWrAU5o85MKs/x7xUiiwG7k6fXLViF2CNK5r6mVWcG4KWR88ct+pYjKHaAhdg4gR+sDxyDSYdFTKNAgiT+MLcCAXYB3DDVouzbb6Pn4ZI5azQir3HnvCrxAF7m4jMqafo/fVaHIFOnUOyLeZOUYWccE/WxjLo8ezqkv9EBqgIWuuyr6J38u+x2+iQpDfuKImsLFmH5rCtCzxRc+X8iQ7VkSyWzAzXgq2g/qemfjd+zIk6Bc+FE9U4MNIRxcxFOtqd+kVVUjbaAG9HcRuHsiwrcTKP1OGEWcJt35J97ZKKGCVvnTpkDcDDBXIUR7+pQfbedn4Pz/bLHuwXBGD0ZBhbFp4vU3XktRDstO+ukQoIqTUpJrZWlDr/2bpx2K1L+KZWjJSlvK866ZPo+maz4VgiTDRtVJAoDp+p4lIm8ZbuXCSZwFHhLQ8DOcsIjPj/FNz3kfOzWaJqW9nAQ7rpw5jaWv7XWrD71ttWS9PMOUFWa7Ka/9v+FYSFgJabFGVo+u/qh84ZGERfC7Vpn03CwE4z68T/adArOGBx2paRq/QuL7sdNlxQbgdSLapykxvDK3ZS487DbOCDC00kHvfFzZRVAK4C5W7gagBpC/HiKjK0NU17z4BOT4rMQXhgH7Ek1fofIqiAVKK48Qj85xc3OtVOhVQpP2CYba8bMq5jWxdZp50j0rJdXLVt9xdq0fKWuuT/tBlpVxT5CI1QV0qYfzvNRAWRUcdQsV2xvNmaLCSffN6yZCTatsQ0CNBRk6M8YHsCYw6TPjRl8J/xpjWvN8RCNvmS+btGmMJfPTrrISpYAr7Xmu4PSkFlOJJpaE3dqug93hyshyl7aHGHyQgASVcOfmNxCTbusTY0BfcPNBw7ZfPy1ZHXysd91jA+S5Gu4LpPWJTu1n1DGioG3FXcpNyeOmWV0Exf0e2MdqPSWfgpye97zGaQvXMDU0q+s/4TcxMUcyV1ZYXSl097GYVqfC8HGyYTq3efzoHd1W365ZNODY9EVhINh3IgQp0xG6mqKhxTRFxD7Arq47hcLImiEnfBNoCUO7KOwq8hOk2wNgT54vcMl6veSDgro12XwN8wCL9AR1WwH46C0cdGMmiAi0x0QnOVSSIbgWWe6Apwg+3v4k3GlPp7k3VECyJ9u/DxuQNMqx8T0Oqv7c2bgfa9dAB/bsv3rx2oRA+iWEZL9y3QtSyRkFeZSRCSgBdTty7Jz5F8G72gGvyTCzPhReEZmeogj6hXHb7gBbQf8J/70Q1kY3n1vZAGizzIzALFWsgyJdc7fuk+VuMok2celCVUk0viwmPLyYVhmBYHMppHVyj1MaWp7gTyNTU+g6fgBe8tyPLJNB/BNWRVEoJS6RT2w723ZI9SY4q8Nd/R/k5DeQQuqU+67iHy5tu7ASaiXztaIhFwg7RzC9dVxGZCnhsmC4WXZcLWRpKiUB1RhhTS2bAs5GHLxVPMI233i4GUwBVGaNE03dwYlYvgaNxmjD1HHEP1t1l4ctyX9jE00fhSEt1SytnqQDNqOEb5BVxDHYi3r9rueNepA+eqPjA4nqxpMAjgM5zpdI0uzG7DZJSzwxlUBmv3fUIrgtYsRTczSqqlHY2mEeapPdVxn1GiOX0BQLBAGPPna4WJ5lalRVI/sLn/vEF9Y7cLn8yNhJsTxTZYJAH0i10iWYUYge0T1pDdK5gMvpR/IWUK5kbPDNNKGekX7PeyHRLHEx7AtG28TOCDxQxwvUozNMDJ08tPHjomDB5uPpiT3A76dxyGA7hjSafhCpeav2y9T+5K2usnsTVek5K6pHPJGpGoRotwtsOj95H+8GI13DCxnQoMMOKBgAT2lBQc0yr/9m+6u8s5xpO/iW8ZyYAKrcekh7rYg1QPnAYMN2Z0X7MXy2P/RL6utRV3JPQUYHxhCfjfgTqAbscLNwJi1eA6EUpoizvRhx6vNHr9rEkkYLNdil6Ovha0ENY+uIny7rTL7m52QOUvmPU4N+Yla8Ua5/CGSO6B/E4MjeN+v+2qnSIJhKJKvd88y21xVVI5ZRqGcQHaOO2OubxZ1TwzSOBQHeR3M7Ib6OPBFtn+46sU8eRSGPJyuoaqdIXnD5mEsY9vuqG2A/2cp59EqPiEvJiR211H8Q3ZDQKLUNg5vUTji7csFvdiMwlOYbGfosjLVA5d3ervVtFKX6l14KKsDvrXgZ0dufUo3GFyhqSh780Nmhru5+onsjxBIe3YUfo/VcAC+b5IiImYzmoJ/3IKyTK9yQWYs5ugx1YsNgQYnZbC4ZgRvTPDkp5Sw3RGywviWzhgErymhX1XhQEaWotwpFtpRHfLXNsCGSNzRAj24CiWen/Ay7RvUQFl82hUbYYp04NraonJKNsxSKDVuHjpcjpL52+Ontmz6EVzmOMclNGzv86tp86RPVkJIyMzaf/UhUFmrUquxt+kFgePRvOP8RXwmzY+JP3IzL0HrrgvX+tdZe1RHYAn7wVUoG+QxHsmvDuntZTZTVaDWqSavk3P3YqNs0pVkzmxww+B8AAAmKflnAM/AtVr58S4H03V5hwn6oZDJY7Dd6yGq5I/s7UlxAUXyZcGVeMw297IqgUd1yyIoKHpt+ebCm4mDdffiBjTbWULatZkEfaraoT6WMYKxwSAZcJx7daKA1AZ8CPhY5u97BwsTOJ0s1H1W2dQ/IC8x/v2+1CglGyVthoIR1nwfzNsyZpzWYxBfnKpoJ/YgUlMASA0YpkSaMJLdhBqMVlgzsd47QD2fc4o51ZJ2MQOsrmz6nTCIwE8dV1ZTKB0jIaoHDmbxgJDDadWsuXtZSGtCD9eUY2ICe+KdG4qr2XxX4npfy8MLddQhQvSncQ/oxuMsrebTNSvr+WjpQIUa6d4cAkIX/8kFxwKkSVZuJw+W0Psd/xpxXDvw3GJHtz/8QoTBrKiGp1WuZHFqrGVlOdbLGVnzy6Xnpwx7ksUG3ax93hqibnbCRWFU2BZ8+20JbplfpdVADx4LtDehY5s1Y7ST3YgX8odGpqcVX+i7E2uNri2asVvc4F/hNMSE8WsF0c65Z04gIAs+BSh8dP4gJeban8KoYBkGKV0SNIw0rO46goZUWxhKf31UicrR7PddUZrJ9JkEvLeCIwFVpel6hEznB3NPqEs91XSRo5EPTWwIyxvVGkSa+DjU3vas2aAWtiRQUn9eL2xtopusJjVof7BV2DpzRM0agr9fOlYYrO0gsW9cCURHpH2XqpDBvacfVd9ZE3sehC5TUdiYmuH18OA67QqM601TCOSShhzIPfOW8uoTr/SKkTZSSDvUWC4NvBo/ZFeV1jNwj7n11veRwHVcCSZ8/BidkjDK3vGGrE5+ga3evWzfbOP8EveCILoglv2JkwTmzrajf0Eje8G/9uUSkD01ZRq+sf/26Xgc4X/6Y/rwqWPk6zASIM7dhQkf8x9nkL1x6WTIrEYQM57COurtvcMPYJldCUNTNq4J7BXQMDNVXTyRnZhpihChCAr9mhZZB4W3SLtTmPM4qfhePfN9D7EfCF16UfZ+TJKi8h3AFkXQTS9rLaeJGg+MSPEVaI44jVLPpjxa8PwaccFerccj5H2xKq6BopMv3L5gAb1NhB9fALGbRiUx/R49vXDGj3OCliHPnPw+86pojaCdIWtATuU9uhVK6+2aM5Dp0k1WM4erbeg2Kgm5CdFl2u6Ap7wWjNlK78YmFJeaHGOuLcIw1Vs8Ox+nqmLhzZeavhBczVhFvisBsu55iWmt6bglbn8g+6js14ZxZnUGTVrkUOBTKzlDqsRTwDicJWL5GGRS26tCsCeba0YGM3H1l5iioHYQ7ZFATeHdqlZiGra+PQCzdb2l8ti/ksp4VZVMWXBffEUusYBw9SfyAFm/ZEvRr6vMsm3tl8gq2tsrNdyOyIgFhuKPvSO9pqLc+EoerDW45buvPbP6Yd8Xvnn/daNbFlkvgOby2I/gsen9ayINZHfT8mxuroWWYlt78mIxrCGduyfm+3iim9sE7YWmdD+aNy1PNnOogUWwJkslfY0w+jcTv+7IT29CFBFnoRpj4nDoSAoCFezxu/ONYGcKs9ubbAClQx5XNX/dDC+6gnPRuuylPivFfX2jpu9AaBaATR3c5SZ95TkH6dcYoqjgwX9esLt9Y0jQmyZJzz8qTLElM3A50Qm0dcR9+/26nOfb/fUBglzb8GqoFmxX1NUug/1hgTNzqwaJ62MdnzLwx0RUyfEKnUmkmFmlQB46nzikheyArPYcCORP2pIkWIyCZPgqdjTRsUlOUL3BKuY9n2kbIEQ94ykWOcCCHzkeSVX3h5aw0xRIwX0lAB/i9ceXgTgrZO9eRxvObyw+IfbteVi6ArPuHE1Th6bA7BMqIk+STLvveMOsHjAWhVGhqLsmLez1G8JHNdR2BpgN8t/ycTaJcVk59izAvZ31Gb8Nm2nd8NGg/0BnCeN0t4UfolPkpShSt8ayVU2I3CNC4jDiWY8yKnBVY3VNEFtfC1Dzo8dEMWRxgL6GW2WXFM2TOaQ/uLSwjGDUBmL/suwaO83jmg8n1zFSntaSz2BYFfqXKv64tv+MKJovmkUmmB/EC+VxZ9biQesOgXCQ607U1MQCc7jBMqOqfvY1nHsIDeefMWomZ2XMcc7pi/2hIaunQmYN5rFd6hqhZu5vI9iZXiWpWRFlF0QZXkVmDPURoekgkL869QO/GNgT+xM/ikBWVMmLOuMZtXLgYDwRewoxBBLt8bXRnj+B8iQeljQ5nYskdRgxbplnQYFAvq26m8DdGFaP5Vx0cQUQ035lnJEAtrTnxOfQdDHBaxwHEjOdpU6vSh/86ZWCVgFttDnrNPcmTP8xoe/T1MYp7CXV2w8UBmegAxLa9PH3NMKgtxGcFrsq0qXYfhAswfAHw13NAhD3oO6UtNoSGukBVtkNXL9M9HxMjBg3yWBAK02x+tLIbircBLwCqs0ILyhTeBp5NcIcY2vqqikoxBdAB0ckDZoiCTY6IuzW4re/JaKut+acD3/S/6WmHtzihC1DfGSzso8WSgtRTt7ME5CWOqB/z57PjlELYrs5qbqGQ2Mp+KrUUFfKBh/QzuptEM6TrPVeHU2E4xRxgfwJDV7REwbe5zR1cP6Hux2nU3Emi0x4I0peZQiwkmYeDHgRsmqV6eMAYJkc7kKsDdRc3XIYv0SV56EibFniCuUJDOtSFWWWMXEawySeiehPgsOIoZ0ssk17z3ovG0sV8YBI7d1NhRSOkf/zLNLGR+tMAPdcqM/WdbP/AoXz9nd1AWc9PlMrkWuICSPlXiY4QfLJ2tpy6K3ndKDh+Cv49FyjWGzCaPE3Nu/Y5bAGs/PxwJ0CBw8q6AAS1Mcn/WfU1fLd8TnHz+QAnkzNTVp+F0ggFGsk1w73pbhDav/fa//2gn/2b3/9ytKwTyD77Nxpe3QMRqZrQHmwQJTjG8Bg32l+ICDKQvV1eyFJubn8mqvHr7MZ8uUsft1mjeuctSr5nxPL8WLtctn0jLKR4rdeeD1bi/QGl/gpY7Y90Hrt+mClvxd/nG1Jfmdxr6mFLQtsoEEx3nmZwyvhuTxki1D2dC06WFsJiCVInnTAaZu8o6oB0pfQosY/9iV+2BKi3efSZQrMayZQnVYie4zXrfZ+28zPDnzo3Aer7siGUqJfq1E0lZo7tSs4zYN4v/C+yGWC2asrRd43bwpqWQhSS3JVEIKT+WNAs0GsfZnpwbEqQn4KhmR5FKj9vnzWe63hTJaJByr3MV2BMh+LXlOdsauLqFpVETyMLWtpmpPN68CzKsoumDEb+XIVN9i5ILNAz4jYyUXH56f9qUlsCWURD2eV5S54eJjpYSFfLkv17un5XbPRkigElFXYhXqVr6lZg+g0qYXswJU+8ZQLPMA0yRlVNrnuKKUNjFOzTn7p9g3RV0hLN4Dszy5+l4V2eY2hlvPfgSq099QYcy2eM2n9R5agHWU/HgbcWjxvTanlGMlw6+6tcQHxFKup08ql60Yd4PrxlRiCLK2So4KpuJFvpNshwGEFO1HTlm1/ANkuhIs+s96WACxgookWRkFQy0Wal8yiZ6yBItNPuTWDJN2Dng29JbxRpaUQCg+/xIXMcWt5VfvWSfq0pD9QlSnvfpjKd2eNEsluoWaPSL9Gbm3PBARfNXC+OIq3FxXlt4dLROuC3chMGqBChXJfo5MRfa90vnJcwxGpxpz5jaT6llM+RKfsaF2MLKlM7pmirq438zckCPU1/e4OYTuiHGOqGAywAQJ90dzgCKnN6XL08/YVCj0LThr0dAZlv/L1INtspJXbTrOs+93UDG6Gi9ITl4RBjXhrajtY8pEz/b58aOJwkDQlBvxiK4a5Lu00IzQN1ejPPQiYNXKTyCYVenjesBMOHSDXSEkt9E4XHmMYJy7LJpz+NcAtuC1dqKEw3OaXkF+IxBmseWRkRE2pju3qwgmsPLWeQPgQaG+oJvpDS1j4tjPNlqT21hlOZ6aRHKY8VpaOQkZwodoTCqm4UEMWEaH9tL4NjcjWscTLDGIDRth5ca4Wiy3pHjxGgLXH4mWYITMSsTFrfEUQo1AYzTKFfQoTMspm1ZA0+6jPjtSxfYM51KoVsgXr3uPkV5++UUQqve/hTlI8xOjm/rp13Jdzs+QdM71PrLSz6OKAU15pbmpXV7yhJ/5uLlEfHVv3QzV9TwmP4J6nr4g5KKa31UFsBTswXAmS9Hr+aI01gjxQqAkAQTo9gacPAAfnObw0cedqB2RhRv+ehqGJClNXAnVllL/u3C+x41uV7pNtereRNiVUwfLcBLoY06OXTpDtIK+Zwx57VPaVEn4fmF1bryzjs5uLYanpgN6UymNQk4qNLgWyjOvdsbsfiETD5rvscUFrljBDs/1EnjiXI/1lkEyUUNcdA7TvlduD8AqsLWlrsXpP/8HAg74NKKRKHh2aRn27ubS0xjQ9z/FFbQUyjRnnuuSLWP/5BTVxQoQLoddonz3HXbzmCjjnq8lcG8f9CPw5PZcuZ9i3AHu4Q38bf5PjoOot5ymExBObiaodkO2lb9BMswzBhJeXPKm6YbGtFnSe3R5RJXv+TJVfNMID+YoH2Zt8t2uqyYWZPa/sy55/h5AfzSeEqZYr0xkN04LMX7uLT+QQmIxC9mS+zTHw3ngqcqxbjjd7cWYeLBbiuX+I/CWJgxpL1TYgrI3vawVkpNA5fFhTOXD0lldLfovn1a1KJAsc/g1GmL59lGRlcG71OHLtBMW9x5Wldof6siWCOCxnZB60BZ8JWMkF/KhvjC441NoIT+NEKeFf1SiKZIsUch7dAC0bTGtV+kW1yrQBjAAVsFNWCSsyy6Hdf5G/0aza2vBjYoUET69qHmJbsttsIAyAGBrZAFT2xqCCzAypTc1k2gCSgvZWkAgF5QsRVTLycP5286QLizH89d//g5pHdKGvRUQ6b6jlaDovsE6p/lk/KoLs/Bfd0MfURMXkjBU4Z0p1q3cWabX/LV4mUtiWAYeggvuUkZYuERQ7l5ssME5DhbDlEch2TLnX37g4U5SAOt9QuuzpAXri75k08QonImhsztJv0V+iUSEe8IZFP1bBgBKUAngVBJjHzDU5r1e8crNG6XRElLfL2Dwye7HtEgWZcXpHSf8t/zSvS3SF+Rb1JMlgKQTTxURRstTV5qb1mtFqq7MxYFO9qxMPR2HIvcxQ7IfuF3fGyf/xjinmCuGtP9514xQV8WdRUDe0vSNrn24r/OhmRs4zFvBdniTu4pgOp0DJa4DcHZPaFnxbeHf2Iiv8Xizx6rPrF3gL4tNUO+KRFGMG18l+lfIKISBysLZKAQ9v46a8Z9a2lozCBPcrHpzx4p79PrejsaRvfWtu0k0dPy4929cUgoYK6EsB6yiybWSOCocafK6KyWEGj5CrwAokN9r8p9G3DKsaXBYVwWqJZQb4TTlxwMkb3FSRBb9iiimAHUKjzofgrstLPCr9ZRKmmAWUiTiBxcqHl+i249B1/N9FDvPChHhGcBgLoY9QTJIEbLqoMsY92v2YT9oH9JKDjZOY4OyR3VyQBUiVvUUjOqx0+GrJdpdTAAfkuNd0ozMTdbz4Mt1Upc9/z5/l4cUH559lPrRXqNgJSkKJPv1M5bxtfkggtOsPtAVokVYWMVR779JdMrt/wGY5yQi5KwbQbpWX1tmykM9ieKpLC8WZdBPsYyjvQYN2upEkR5Qk0OSvv4NRXzYOQA5m1hKXCyugGY7m8wzSOqEKHpMhXEetiCECg1D7+d3xT/Mh7GK+TBulakM1ihUIdwiWRdqk1l2+ddzrfKea3zNQ7bR2f5BkUrKw7fyQ6QAPlrBsA5yRDVY5ko4ryAQObXJm78lhurYusRDkzXqutQjvlKQ7LBzOgAkz2vG6Ctwq0VTFybwK7k3nLkicJnoE7mZEnQO2A8+0Z8IDuOhWgcOwxPxOZnl7YfmAV6RQ1vR6ATYdhXehOKhrq6OfD6/ODPVf1qTB/TRg49YNisdkaK1Nbt6OooBxqK9fcgE2cm/A0j3SjCvO29PS8ecMGRWe0BX28qZPfgPkOVOlPos4v/CsUOMwConoU7JhV49NL8QVBJ4+yTaOIFkLURovshcew+bruXp05Q8ZepG0aheBS2hLWalDrO+KkdRXcQqOHXLnDXYCECQLgyp7XDR23rkjNXjnH/dUwhQjCtYa557F1BZQyxP9RYVi36UrKvhmzpHM41BQgveY6woeRGL80nW+l7Ns6z4d7n+oJUOC9UqTTuoff4YgP6ZJVufieDj2Imz12NqcXBhvr8HEF3F0HpfXwhCW0Md+s+YuUoCiUmqOtvjcrCFhABmSRFsODJ/ovneYZSkWAAWZ6YtnW2KUNkfYc5ToSAmGPaAjw5t/TxpoQXw4Tq3IA9K1rMVxx/rWt+AfhGm83RDgkuIboGpHrObNgpx7eOdb+wYRYitJCOSyEkD8NKvlfFktOCS12JVyYD5jdpO2yq244GZABXEWK3fgAy80WkBuniWnnUTjlMk84oURAZ31zs6lUTrrILy69IhanTf9NvSHfc612l57fiLQ0gmTx/91W2iVUY51cfdW1vwnZKnB1djQwzwKkoFmGqK/VGayPSbCBXiTevXojfsG86Jtf6P96ORFemtK9DGre487MOcn3KOWDvHSMm5bRTWLCLcdAOND/P5qoYK2NnrgCvikgZ0PKGV32k80gORGPLTCcp8r+I0kiz1IOCtJuP311WQu7YLJuiFOd2GIV2DzkIw1u6e9vJAr7ZiwDMw+OciF3U1gLs7VBsInEXfC5UylZipJrLJEZGb5erDJmf1psnCJ1yeNOnIs99Ld35+1oUcuWw/hGBnokEVoBRxTsyWufRQ3GtiWbUTtKOFx/D9qizwRyJjrxU8udkE6NM75wf3S4qNYUlS36mIeLWVfhj4fpn/pxSA1LwWl2bG6huC1pBteHvJiehTkBh50JCAK2RlcBXKPcUtFRYbdIV9hcmtDlPPrrh23qUS8xRPkHdth2yeiHb6pduV0ue5aLle7rO0Ay7WhINO2dwJsfY85DvwEaa7JwhUL1njxsQ4bp7rlSQL701b6aAFF1N3rb9j/7vTFUdA+hwzz3dt1FVkfJ+ON3mbs/kqPg33PoAWmZwF37HIjRGlVGDmZxQetS4oEAYw8DNPvO/r80RJfI4hUVdu1g1fm+LiR0uuOOFPkhDT5E8MgzaboBpmPV03w3Y2ENnrXsV36ZzD2dyj0zOGkcVdqnED9d2gkWt101xO+eQZUzy3kQiomzLPd7yHhATQbY8QphISXMfg0MjD0Uz2kHTTzT9APqtVxvU3HUw/V93kpAJZMC+tSfBArRnnoRqcARlv+xgChhSwo81ioBsGbnbPavTj/Rz9hjWxYQvXQLdrVoDLN13VSRqR2P3o+Ibv+G2kn/t05NAbRK9IK2NoYvHpeKeeRg1f6Ik9ot0hiXX5sgy5QGi1SqPwQdpV3Pv0HtrJoES6e0eaPL2rCkHr51+RdcwvV+Z5AnLAWFe5+ZFi29OYGU9xDYrUGYxROc+3IRfpgSShjBPY4NpetXdLzsFf/7+3VV3YiTxmzUa6iBL8vB7Y9I6o3yKv4btZQL9wU4T8ObPTXimiDmnhhfXcdKqRCLue5jbHyjfZJyL8LA1rc9Ogug8ZJEb4aaqKdpPQ8bmVh+pvE+ZjaOkMgiHJn/kNuhWgShF0KJbNADtgV1FeLSkxeb912L69lMGOBR+c2r459JVpcw9s0kk2sl9tZ7CbAvvF0Qcqoh5DsZ9uaicnzzJI44f+RYzk3o3Lk9h11C5vflnPaZeLGbPJQp2bCCinbJGyiyHXrj1/iuj+bCWo+KBAJlqv4umjumc+Rb5VkwYP0eJ5bE9KGpmxslneduURBc5X/nTBHe0+m33hij1ZQAzL6fnSPh1y8wblIKds/IqH54Sjya/83Onq9Jhm3CJ2FybLxR3IS5xY8jzsVA6gp1YrbJv1f1UMqZTLWvBetZ52xxmrySL10hU5LHAADcELj/xwssqKV6weGvCAQ0sqtDlm1G/bhOsfnoXibn7YyLxqOIVrChaQMvdTgINd18FovvSBLX04+kMZuOBsTXswgOmsMsMJsQpjGu/EmuDhWjoe4I5GhvLM+TQ+C2zO/0ywoTMNESl9j6p60ZWM8V/2d1NtLANhaW7RsXmcirIq88QnLfuyRgLZp45gLeYYWgj7aDJ7XXa2h19VTV1AVy+Dmod8BRrgdwkb0WE7CIEMkPz7PFh9yqcIKR5rGaFRT91R6dwC3cjHqRx+MWkFJNnK8l56PU65G483Tnw6xTKMt99zSC9H3T3OFYjVScWlhcBJPNtxpdXWiMJ0BN/bJ+TpzNtA33x6WtzXoeRgz+ODubK2K2+xri/8oEKZ1P5Z/shLh0dfmFgACO7Mml3R8wrUOtQUXSxa16bG+LxusVGYQofxdSDmFhy+m14tC1bLSgjYS4ooHvF+SXF15o7YmAgmuZvK0uEm/WCSxGBkXPeYZoCLm91YANd2XVpnesYJ5OpYEXbQtWJPTvq0Pk3g/6xLoRvd1BXSdVwBoDi3Np7XiQHPWZnhRIH+JE6fRiRQlZAD+6hjBKOiciOkbgtzYb2JEq2BbdTOH9cwdr2vDm16ko+jL3gqyhrCACn8YKgHcaZsr3orDgxTjTMrtJwjPLeP0gAeIZYaLxAtXFHFjQEkWVxLJz3pdm8hn3qsUF3ERqSRh0FfVrF2MyKt0RAAAAAAAAAIUREbAAAAAAAA",
  gorilla: "data:image/webp;base64,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",
  pelikan: "data:image/webp;base64,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",
  papagei: "data:image/webp;base64,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",
  kaninchen: "data:image/webp;base64,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",
  schildkroete: "data:image/webp;base64,UklGRrZMAABXRUJQVlA4WAoAAAAQAAAAjwEAVwIAQUxQSAcMAAARf6AgbQMWz0H3IiJEWpZQvzZFQdtGTsIf9s0fACJiApjrwIGVp+xRq1xnvMZM2uYnDF5DRv45eISKVtcO/n9qrCv/mcjq+zzu79nrODm4cxbXA8EdgjvkgVIXd0h5/aaissWlCu6QDof02PTXBofZ+f9+oYKI/k+AJWnbFEly3OYEPjfwuUEMruMIMTOCnSzE2xAcIMx0gaYD5IxgHeJtgxgrU8yqrBZzBWZGuP+76fz9/353SauI/k+A/N//f380GQGf+ODXfv/b3/7uJx983OXEvfHur36X/tXn3++ooaz4VqBndX/6zB1P0PXCtze67PDRU4ap4oP/oMu7j1ue3vbE2xwnyX6d2Pu3UOS+QRG6jzD0J4rz9fS4b1KsL7Tk/ITibQw1X6eYX2CIuUNx350X5yMbLCv2zxT7G1n5AsV/jpPCC9hwMpDEBSNlENEw8pRk5nwUQciaj8+T0MHSsUjxd2fDBTEbNg4kd0LGLGjFhQuCGi4akpxQ0YuaUzGJqpmwm6jBELEj2QkRo7A5DzYIK3moSXjDw5U0n9CwFzenYRa3omEVV7LgSHzNQiOvY6GV5wwJfTYM8nw+GqYknAAsSTjngg0A1hwUBLDmoEHQc9AhcIaCHQQ7FnxGQQ8hHw0LdPYDH33v8wOEN5w4bpC5vxBRIIzOf+axJ2G98DcC258G9bonuEMKqdwIcGsQnQjyBUAlYe5TPAMoX8IpAiqfovk8wV6gOePagCkIeIqlRbaHZUS2wbIhGwwSF5D5FElF0GdIdtjmSK6xrZAM2TBiq5DM2GokK7ZqNDSjoRsNLZIJW4VkxFaPhmo0rJDss+FONtTY5kgKbBkSsyHrBeqCrMJyRLbC0iFbYCmQJVjMGVcjYB/iWqEpcaVozIKqEbgtqvN4zIKpEcAtpikisyBqBHILyOWYzBM8DxHUK5pDgd2AuUmA3wtIDgX6m38VMPQ3+xcK+jcefOd9nwzims/fTwi0z5lJ1vayy48Li72stRB5R9YRJkpZEybMJmkwVEySGqHyoaQFF62knAvr5XRC5iRnzcZDOTM2ajlTNswqpTV03EhZCp2NkMHyYTYZpRDay1gw0sjIGDGrhE4ovZFwwEklYcqJmePrDSldfBeFVHuOrTesmD6280Kr83E1QuwY14qZKq6MGTPGVAm11RZRxo3p4qmE3TmajJ4mlkPh9yaOQ0NQEcdcCLY+iosUhShaQ9CPKc4FP26LpOXnTxRrzk5F0TbsHOPxU27sFlHNzVOKecpMS1HXxDgfl3sILweKfLCs1CE2X7AyUfQtKSUJzDh5S0JFifMSOsPIF0jk3RnZZAyWjzskdI+Pk5SWjpLETtkY5FRklCQ45WKQ9CQqrJc0GCZaEj1h4ieyNkQ4Ep7w8AVpD+XhLG1Lw46kuwkLkzhfkuCCvJ6EjgDOOZgRlBTcJYTOMjBB8DdYAlYMfoqvJZALfGcUbzfoCoI5Q/cYR4VuxeEzbA0B3cN2QNJh25D4KbKWoDbIJiw+xeU8mALXgcBucJ3Q+BxVSXALVE/xdKBcwONTTDsCXGC6QdRCKghyjughpgbRjMkZPAWBnuJpURV4elS9gbOh8hM0O4JdoBlwNWDshssnWHYEfI7liKzBsiLzKZKaoC+QHLGVSFZsvcVREvg5jg5djWNG18GoCP1gUDyE5ycoFnxPRnHG1xsMDSk4xXClQYFh0aCBUJCKCYJWhwWCQYcSgPU6tADukI7O6rdXwi/0O2lR6ue16NSrPcxEuyOOmXYDjlI553E0yu0Ip7O69Yr4mW4nTfZVs16TrWoNaeoSza5V8TPNBl0OFLObLoPRqyZlc72O2TBqs9Rr1aZUqyZtW7U6dQajVa+OT7Wa9FkoZYM+hVIV6Vsr9VChXqlRIZ/pdNZoqVJJGu+NhlalW5UGo1Gvks81WnSaKWSDTpVCLencKtQr1St0q5RP9DlpNVenIK331GnUWquzV6tVZ1DLp9rMeuXK2E2vPWVq0rtWplNsq8xRMWd1GRXzmS6rZktdNs0qVWrSvFXljmrearJXrRdNZ9V8qsmm21yRgnRfKdIqt6/IlXK1ItfKdYr0yg1Gj1k5n+mxaTdTw5H2pRq1epUaB/W2aozqOaPFoJ63WpzU60XJivR/sBJjAvRWhTuUggsNip8mQWcV+DGl4SK+hhJxSKKbU8EfxFaEZOhi21M6zuIqfEJUcXWUkklUc1JcjKmipKxj2qeFSyKa08IfRLQlxjaeR5SaSTRjcixjsVtyrGOpKDnrWLr06GP5fHr4JJIlQaaRbAmyiMOFBCniKClBqzjuZMPD/4cYzFjoJco+RbrR0MRxTJF1HA9TZBnHLkWmcTQpMomjThEbh0uQTiLd0qOJZUqPVSzH9JjF0iSHs7GYNTVaibZPjbvFs0uNJB7n06KWiIe0mMdUJ8VWop5SYhVXnRAuicv8OB3uKpG7jYWtRN/cSkIen/kGB3cVBY/+jAD3BFHx6HfhdXcQLZ/21duRuUMrij7iK7+79TZM7vknRdnjlx171su+97Znv/dXavzuJzf+8saXXi56d1o8yIr2lRaZ6O91cBbArEMrAB/qUCO40mEPQaXDBIENKlgIXoNeIB40aDA81GCNodRggsGs+HoBeQrwWhRvEfw1CvsneDMU5grdYGC4AO6hArMm8DmONhsO6CY4RnTr0VDBKDZ0PYwjwbcoenwpCOvxTUCYGd90NCxB/IjwvwjEqIDPMJw0WGJYc8EGDQoIFWm4htCpUEE4qtBB2KvgDIIlG04q+BSB12EGwAYdlgAqyoVCiX0Ad5QoAeyVaAAMSrQARiV6AHsltqPBGf1mJbYyFhoAvRIdgCkbeiVaACclnNFvyYZzNqzZsPzP4ZwNSzbM2XD7X5aN6H+txIsAdEp0o6EG0CixBlApsRkN69FwEUChxBSA2XLBBhW2gvCUDYsKPYRehRLCrQoFhJ0KSwiFCgsINmiQQzAnBZzFcFRgKxg7BWoQzuObgzBnfCmKGV4nKL+4oqthmAXdHMeG7qEwXEBXwTBTLriQC/Y76DYwzFN0HQwX0G1hmA1dB8P6XDATuhqG9ei2MMwJXTsaOhxrLjhC38CwPhccod/AMCu6Csc5Fxzlgjlkw5wNWy5YnwtmzQVHuWCWCH562z9y5IwRzN503de2H7zm6jv/8Lbf9t773/6T/vZ//TUlpghyETkmf3/PS7PvfvCVx1/5iVe9/1XPenn6stfKkBBrBJkEbCkhhgjSEPsIahwLn7Mhmgg6GNbz+SREGUENwzziczZEFUGF48TnkxC7lLiJIA1RpUQny4WEGGVZnxAnPmeDnBNi5Bsk6JRSTZiZr8DR890tSOn5Vjhu+TZB7MpX4Rj5uiBuS4iBbxOkopSqg5g1IUZhQ0JcC1sTYuTbBKmJf4Vj4KuD2ImvwHHFdxCkJP41EZsgRQQVSXciKElqIihw7PmqIG0EFY6RbxOkS4lbvv0g/0mJnm8d5E5KXPPtBbEhIXpZJfFfxHHNtx+kjqDEccW3CNJEUOHYySojKHA8ZOuzILsIahxXbEMapIigxdGx+SyIC3wFjpYvDVIQ/4qISZAygoqILEgR+AqSzMJXsjTzVUTkkR3BseNLw6x8axytsJmvJGIS2REisv+27bLhDl8S5pZviaNlcyayKQ+DsFSwdYE6vgRHzXYQqOVLcTRs20ANn8Xh2NpAHdtgeOhNmIatFZw2cDUStmLzFodZZZVsgwEycw2BjOcqBejKVfJ05qpCTVxrJCNXGeqWa4Wk59oP1TMNOZI91zLUQ6ZWkN7hykN1TM4iqZl6E6pheptBYj1PJaGdZxmMQJ155sHMkhA9TxLuyNIK1oalk/AlSwnGrhzFDpiVIwdjjhzpLhwYWkFbhsu1sovOX24Bx4yXm+2EmS7WCt4mXKqV3awvNgNkpkvNd8R84UKtIHbrZR5qdsUsl5lBMs1FOis7W/pLvFBAf/oCQyY7/OL52W4yqMx9/yzuTrLT1ZefoXutFdxv+3fWP1Z2/cGv30F//WmB/uLn/vB3t3vvbnzOCdl9+/Kn/vDnP9/ubrz2jMC/9JUf+E3zzU8+95SRSI8eO/a0U0Y4PJrI/+IOAFZQOCCIQAAAcBQBnQEqkAFYAj7JXqdNJ6Wjoiw3uWjwGQlnbvopVRWMUlQo+Pucdknj+8Sn5nOH76Q1ODcGZELmPY35u5kCQbrDzwHcEbC7QH7LbgFRR/wPE7+vf7L1D6F0qHR/UR/fd4bz1/pP/xu+TdFN6nv+C853NKv6f+O/6cfGDy1/e/ip+IXs/+h++f/V/Yx9P9zuvF/P8/f/V4L/sH+75LPQG/17p6/HGVf7eiv71/59lVkU9W7/y8yH3B7A/SA/df//+59+zbKlgbyWBvJYG8lgbyWBvJYG8leR9q/YyGPFhGqi3RbAGTJptNrf9VNfoWgLw/i98LqF4N5ljRf7Z5JTSrwT8VK5/4OD4sCAd9AlyL+HX0TzAQiPMa5/tOD6KdYDa4vFT8354C0XSWNF/tnklNKL13/hjVby4R7QUhW3x7ym8RtJciD2SHU70X1d0kc6rxtKvG0q1JlPble5lV3vPOpHyHDyrbdfW3u4YPrMZQpVBCWXlViM/3slnklNKvBk/IzZr7IRHOKipCeknqFqYYYKhBNGJgGL1u+qnGHIlxccqpfGTmrUwXf06YZd0itWMsaL/bO2NbVvSlYvNjzpt68Rtnv/sLphZrLYEqRvz8IxdlagrDMXp3tXhsiaWZY0X+2eQgu3y25XypNC++DTR8NQSgYowxh28J5f/0yMevA095NOqSzHt8xT75FIWErA3ksDeSbx+CfhrIp9ZmUkLjwWBd/2a+TZlVp0dMv9uNuYGknt9Sn3ndDmXVw3mcfiLag+DzRwC8sttgbyWBVmIw+NKxSAJGGo1rXgwmyrB2pt6FfUA+lsABD9vSxgRmSb/bPJKaVeNpRhl7r75ZlQUhYMMNycq3cn5ezgWQoBAiSRoeFhm2J6JI4Nv7E9AEslnklNKvG0orkW/Cjf9DJDbxEkiagAHD2oltG0dL4ZYWmm8p57ui0QS698Rp5mrHUkLtHMYFjLGi/sF3DT/OyanmdZXGO49/f/dKptkY7XdQMzgjFi62c2kyd6zJKni1qnW3IXXTUSP3olwZyc62xmngP+DoeSU0q8bOmOXLMQLST7YbWuH9q46aPCQ0VuDCBVgd+piitYhV0s98M3npWbgGQlLq0jqG8lIJPWimF4ovaclBTeo4+bVQCXzdV42lXjSd5x3leHfZv15zRI1sx22GB23wdf0OCM3QQgtrCF6kFH/GKZfpEP1j6TWD26zFdGylDLN7A3ksDb0toK9+gyg7+8t+xRJ0PZtIDbQ2RB0qQznoT+JnerIIm9KKHQXH7PoxxlIvseagqO6vKYY6HklNKtZsk/+pEqIlv1WaHWOZ2+2Dh4faP6FwEqQ3gVknXxggFF8XmMmnytx7ph7kDJ6t43kPtsJud+mRyxjNC5UyCSo6ONy9jbA3kmXu3QnEglaPjc+Pzq0FcPzyOprM+E4fgJKN8wcFB2rzLKbguHtzNWFT3csO6OEkUro5neXIuReIQylH3YilgbyTUNrv/q01/7kdArrfxdLF389vfF85MeW+UVawOmbkoK9jRzPcAL7DPQUXBZZUh1a6C/eckraeOGg+veOYvxRzBYyxoYMaPHwUA02zi9mYHyGAQcFLC868QwH5f81HjlUX4pifSOFn/L0aVa5USheJzBxjkUkUeRUbu7rQUBYGtNN1YsOHeHJKZ9mawKPiM/DUBeBgp7hml+ahvcDWtr3TC4QAmcgkmKnmqL2jsQ3vwaKVGY+wwrN77fcaLX/32iiuUn8q/Z/kVHSmMrir/2sjMFMxRg4mQLMcf3CwxTDXq2GAcU9GrswqtBxZbEDYMWNT1vfWqjclXF7Z0HZXIOOjc3zv/rG7mF01BIJUrl21imp1PyRLXd60/rjogKDB/b6P149WBW5dHmxKxqlYJ+55Ytp1J0Yck1AMPg+x2N9xhmk8SGWL/0xFo6f3yWdNsCCFU2uZqBHnnaA3i+LS4RmAYWVtspc3NRWjzUr4rtQl5b9wqCmsbQUb/Qo9NM3Vv3+a/k8qzYgo9DEtimxibbA2qFGbbIvfbvl7tjRlAu98eVdgnlUzakSb7oeD15Yw0eO2ERvPJLMu1UjzCX+sHdk5d/YEWVHV73ch68I/Ai3EMn/dKZrZk6a8bIuXm1TdjOEnE5bJ1m6vuUCybFriCg23xs1L0PJKZohGcn6GFh+D9gA8ETMGQoZBjAg3Jl1eZ5lds/bAQaKrifHhB07UQ1EYT+22jI2LUvGbgzCTFirgVLA3krzOiNse1kQ5ZSxkqBc7yJTlXEKrDsbY9EqH8hPsxazYsKQ7Ag6u8nhB+V+rz3tgIbDVzwhmVR8wsaL/bO2y7Wczgu0XJKPjqfkmMOcAnZuvjN1paL9DyQBigEnVtgbyWBWO+AUhGJMvBCPzoTPMNsQl7/lnSlk4KPW+BBJ6bDiRC35XVg+iPq8sttgbykaKzL0uK7hFLbfphFdr6EQd1AQKAAprRHGu/9P5D2lyXAu5X7u9wouaNLFn4/qD/w23o2lXjaVat54xnixYmyZCBBCBuxGJsFX5QEPkdAtluCilxsdQStwNioqlAnDn2NW/nlZNZ05RuF4TQc7Kalp7tO8PfI5bbA3krzO2+kD7hcp70h0FYGtu/ID7S3ZT85/9+OKCOHn0l5TCp3QOS+SwW4navxdmoIQ2eSU0q8GBiBvAylyRNlsq4GA9O4zQLH562zJwEwVqH6qQloY+WW2wN5JLn7gfoBuE7XYjru7F5wcg+byoQ8sl6HgmyZIFBb3LPJKaVeDJTzc1dfm7zLk8iacWhVvICF1czqXuRuYcVyNLByxov9s8hUI9Kgc7A0+yqlLMZEXfb9n9Lva0w6di1Aann3XtxoCo2cJ/WGkzsgaf0oKAuqEcYFjLGi8aV47K5HnyLQU3f7wyVpls3nm6Mo5ZgZXKyZCGLjj7q0m57t5ZBadFLR6I89502BOMov9s8kpp2qiSvpV9ndTRyi/10AAP7/nngAAAAA8WEW6B1MFvz5Vo5/TbXqUnEtaJvBGygz6iI2eTGhv0lhA6oBoy9KVrx2kiu26I534a1WXXNcDCqD9HZnD3AZ91HR6nkYdX4B19ORWm4Z3WxU+iWivVqrSBMnI/i2k93ha5C8qLoe930BZ8WQkxv68X20OpOxzgA0YFB3juDfyGOyivxUuf1eAZFS+L3up6p8K14ksclY1CsnamjyBhYEiGx0kvphNozLB4f88lTaSN0VZ3H2WUDa3W3xkTXi3Ltl2RmPG4Abq0gf89p7gOfEiFhNgIOXj/qdAjTBurwNL+dLASSTDMGOj1h96E3KY95/X/SpFTVCb2TM5SMbbYBk3uDxf1nsPpHjggCMPrdDjhpNUS/fUGrngAFAWXZzX7m2GKwH8pPu9E949XYGTBvZ1jTMhPcaP65ALwoyFuotdCthqowERO8vVSABqc6LFhgb6pIsKrbm8it1N6NrKUN6IXD4sOJdXCYRjE3xTEI7xV4pHWKZaJVf6ABZ9LEeU8hW06x38flvL2BhvX1vrsSHAfFbLwBS6hOIoqg5buzfhuo5Kw7NYufrACj9LkUbQ/zTpMEK2zC7nYTx+jL3rYsEpJ4B8+4z++CIdXlZmBY8Wz1u2fnei3CtrbxaOF8i/C3rhDw5PYb2NspwWwSFNknKsYPImGwBf5kzO871qACCbUd3Wle+BjPw6xWSDXOsJ32/4bOSUQ6Wd3CI53y6B7DPZCRjACf+K2ZGSs7/VmYNsBVFSzpjVigAWMrasT0Ih8qBVQzPYsbypYKH+qyfJbLaNNdWBSiKe8kIiBwo3JDPvwfyuFgpUYaElSrHnlAzFGEsy5WgvKecvMKZ8pQv/FmwTrGUJ/l3TMMVgOzs1qlgJ1YjWF0FMUWVSqaPAOx8L3FrG7YScIqWcFCBlEBhEhHkCRCYd1CXSPf148nTm/f//a30yliCU197aciWOKTJSdjOFxdiqsrIkm7L1uAlMa7M8UCXJF65s+nlOqyIh8lHn5Ku4JjCOApMGSXHzqs2BC3rmG/RH47DgABkDiqShHkDgIKf3CgZxYvgCGW+BdVtAVMZyuoGSXKdtTMlH0ixzk+HpXmzgKx4im50vA3K0QI9enR0JtrFEvrXwRQnGKwO7UzR2khzRGRXW3nUm0mm9S4eT4W2QBC1Ykl5dFfgU0jLO7MfWba2UAN/FvB/7HKXvZ3Q/NpwF2s28K1Hnq96DIiVKlAS9H9a6s3tgJ55adoj7j2zl6Zz3iINUkXd6rLipVFfg9dVqYGL/idF8PTxaVlfCCrrg1hvlT5pl0LYNlAju5BsHjQwMreoh9IP9aFTPv4UZgQlZh5c5N2c7B7xTtW1UPGlinZn1p5u7N+VpETGc2vjXKS+mhndXr2efj0HPbkZo/34S3yFiYCdYej+Psd/W8qzi3JSbtkWkbGH18XvTCdnfhqFfAP9WeGGqN3GKCfzqD5H06WiQIAIgKBUQMj7XzWtvf8oz8eflfciWuzt69cFbMlaqFBWHMpaT1L5yPUHGnqjQV/xXS71hHkk+08WCXWssib0KrulMlHQZLBOwzosOYlF26Kdaq8m+Gbv4S8TcWHtmjxwCBf0cW8AP/JJNj3Qd16n5a4mPcerSb65X0h1z2eJ8QOkhiDAS0wdaVy6EQPp5lsVKLC+8gR1ZuP4QTipcj/wgRaCPrbu6oNNyi3wB5irrEzJWWwDQuN9Wo1Wr/4S24qv1yEf1PeORBgpra2tFNgYNoXPzEs6ei+hW1MmRr0aR9IWxkfLGH9NKmUprk0w+aa1TV/IyLowV/tWzSRlLnMrubX3V8NSoQXYfLFfq8Y/UNOBq739XCSZxmgdKkHMRhakZqWMPhokh5ZuqwIxSfiyqQEXc2VvYQFFpTjKE4B1dNaD9PY0078kLK7KvGczdC3MuPi6Uex/guDSNziq3ZgfUtrfo4VyPEgh2Jz9GtVaHFGVAVDfTbp+bCgqkEYGqkLtSycLImAlaeIMLfZ4As2Xlh91b+s5tU+C7Na/eYoIfv/q02bTukmYA8Bq2XaEvJjf9RfxMwOjyzs5Yv23HkWVR2xVLtMLagfO8+DTD3HrBt7BkNw+eHcgjq0vZR4vy1OmaAbKwLtlGWS1Uw++DKPI5VE9wL1bcnE0XUPXbQ80i/YwTxyx67tWDYD9OUE+vaXhMJ8ixHkS+pzhcGAmu+4YccjY67e92UAXW+nQ9PSv9MLZ3OS2ssFmdpPaLLkQZr0C20wTmcmHGndfGgnIMjXiS33wWQX6wdbp7V490Uro9xTVNfHabfVivA4yuk/AfnOKrg7A6lyiFaPKsy8Tqt6bKIk71mx50m/rHeoMSp1BTVicoGL13+GdJSIIe8SAMElbGKm2m0//YG2/Juu7TOMQeHWFP5JwghDGs/dSAeDEHntQSdNx1jlGAcS7C7wCSJ6ylRPF18elNLW/vCQcj94ftRHaxH4WZd9JiCwr7qS2OckFZlWUiWt00J6vBB4G2b4rNzB/pcI1sAbt1tfg6TzXmJSrHK+oDWLenYSwrrnMbJriJctMOXL0PCY754IwmKn1lExPH8Cxaaxd0rsmhsQiARjSPGZMO5zm2uwN3G5tgRSgS0thE4yBl8vwj4EbKZywtXbz7iNtb5pZ0HJwvPDytIZP8P2SIP7rwLT7zxQtQfyQ7pog3zou1VlIbztHexOQvAQd9TZahSWeBhFgnKeniWw3XLiAz08e7TOqFEsbd+/Gx8jCJx+h2o2dPq2ieKsTDD8xiEF9elWUklj9Xu0lUbhIwf8Fb2I0MUxVvQNjLdBhyFUqA/A0jQRga3qH39KDCv2cO92FyyajEDatWEu5CxDUxlp+SpCMZpNmSDPPKPk3KMXrNAp9G2jicCsTK441m12lIcACwOZSgAJlzOyWWSAZmcgcFXtMEnVT8a1r2WJO959shPg08xdlB5Q5pBNIy54P0S80Ij0IFOOSoRe9rtYecxAiLFl3Kae+S4zYVJoloOQnJhdeZZriwZH8yBQsnFmbHQZoSXbAlUasJSkYzSsOBJY5zrV8et43gWQDRfbeouEtJ4kFs334yP9SBQSwrYNrhCVZbVov2ucnzYQSMXLjYIHDcaPmf4aAZ8Rg0HXoqytU++OIVIZJpL1xVNLlY++I4WcLwDyrOHcOuIrFgC6m5FNp/KU1rgEtevJJURcvqS0Y2FSajFI5+lsO5y/e4farZ5RLvxNoeCtgyoew2TAW73iIiFeqd+63xXD9Kny27CRNNfEe5QDldGLfIrW1yFEZUL31+xAY6R6H9gtnn7bF6J30KufQ2J3tJT8gT7etmJLYt9/EuZQAAN63bPcoApBARFIGgyYQKUi1/ADsD3FgxYjMDK49KRKtqoad7rGz8DVnwyPC6WO1hYX5saTVe/ThQnlizb6ffFl0C7NoTSQmps5VXSAUWbV4so6HiWs7rqwcUJ5GtG/3G6diTkc96NylTtNhIT/smbIDWGngwvDHUAl/d68t+J9joQPMtk/U012+OWZ4d0iAUH57sQf0NQrE3J7PN4p37jymwgUO9M/GMZSFVo+TvCIlzQLLWAvwZC9+eBYEjL9YaZi1XS/fwe9jqD3H0RSz4lG3I1r/yGq2BDkC9HVFwmkqokYKlNOErcKpHvCDC+p6e+iS5sgNGpo3kwBbXsou68RADB+mf2E7xW5d14uLKjoSNvm44ZbT3WndBSsSygmEy2j6hAiUYTOLH7Ti9fDbDGHHQ/uRidd7Z9MkZk9s5ZMChh5jFlbIdvg0jesfHL0tBn54Ezh8/Jjf2I2J9b77KqUbeHBnQPb2zJQ9EUF3v2LENsr2+4TgOFKpu0+8AXkUtH2Ik84dgUUTHCyNbdRlNaglkRPe7KIskpkWLyGNonADr11r4EbLJuDXZWUW3U253nOW5LAYNITJ+PM2Aa/8xEbjMBmYsh4huEtb57cdrwuIbWFeY9ParmFiBeXjnu4ZaO1Af1AIHNFROxqISgnsjTED86v7wt6CFdr9BRVVnk+zrJQetc1FdOeVTCmMDd+6HKixgHG1Ss3uiuJlPmQG56vP/MRAurm3BeQPD0y2FqNi5EZcUNgRtlGq+OgAxSuOj/ukZ8FSajHTSBMD5rsUbQJMUEydYeaFo630BBtRIofHVonA8k88kKUKxC27ZxgZJp+t/OgrYbPk6ZVWYB1QCdcMEU4XphCNT+ig/tfHbBzJZE1vG6TVVWCpmtBScTf8DmInIiwI9/KFLP2zVyj6mwxgmSk+scvNJ0zn/oPlS1l8b0OnL736nJyQQGk7cjVE8/HCVRApFsusLBHvNofcwIvxcqQAKCeu+7GWygHySJpVAE5FCLWLYxsMfsYmGyBQeu4Wdfs0ut55rGeBCyUyLtOMqzerrinNdb4KBm2PSX+KP23Z5VHW39D189nATh8MFZABCT0hSkP6jf87gjXi5fufLRmItb5TFQyHeqFKnG8GST/BFBOQXOkaMe9fHun8Callvq+GjNCrtN3smvWM5zqm0XBXSk4yIkh0IWk07fC0Pn5VtM0wTJWIw+csn1+R02mV0rkXbSewKDIYr8h7fs6F5XXFrgs+UJkTZtp8Y2+YTBkeHZ8MwsibiCb9bEn5Feb+1QPdNSqVimH5oMZkv+EPR0dSeTzPmsdVdVJJMieXPa5831MJzIdpKnfzKFHsri0oubpYXfkJAY8EqE5im0j8oKuAzV5Hk1BAc+FoAjwTT9Tp3VnmuT0Ya3Us0irWfJWYuFqgq2WMX2uKgB4OzKuE/LHDXePQhEIpt2K2A7Eexd2uB44MYuWp4fUalWum8LXbKiF3rMwEjxjADKem9sgQAmtr8QnyN8RY8OMaA9RLVLZLDZS0Jazv3h15Jngdaqh+i8XvNeh7cajVmpP3H495TkrXHV0KxM0ebK3Bxa1CqGXIBeel240l2A7VLyVgASrXLpL8TpI5/JIv+ppNb/ltZ+/zZUrUG7rSX8yk2f2ouO65fQYIF7vOpGBkpX4b+Q8/ZJX8orAmJHCUiBOgNuxsHL3sH3EzpZ57nk0DJIgwYuEeVfpvSZV3hSoLG581+V08jB00PPzSf6Bril5oszJwVtDXHvvemLi0RU/HpcHc3ia4oY3WVHkuk2TphsUKHy5PcA+qJmGydfrpFmqunDcpJilIxvlZxe+Ei89RUd5xgeIuinnFpAAlI+03Cqbn9fxLu1KksNGj3NU805SE52F+LfQ1KRv9FsahDQppmXrDLi9gz9UYvEugAvv43yCyWj3xq2hgg2n1zzVAoQzoPHAnhIC0rfXb20ytMzWElH23Jbj82ARGQxYhU6QpSM7/e4xz0IgbRoY8w7qgIjohCeep2bL8vDVz9GwpP/4Ivejwoc72FpsLDxfrnqKNpbon675uBaDsBNsInPYlGRpwX+N2btmIvtafR5hb9upRgVIcPbGKYbe3mdn3rtRWgVm5GVw05wVOm722kalQEcIqtTm27ucEWM8DK9i+WX52dJR57w7gYqViJSWJmT80FLgkPztqPUXi4c1bMJP68wmQpLHLV6OeCg6zK8WnRJ/Zz4MXhPduE4o6gcWCjb1xIqEeFMUBcjE1gIiBikRRUF9NO9N8He1feRjtpL/QEgJJEJ6eEb2mOl9rxBYsLgnV6f/brLG4hHkF1TstLqO6a6yuBR9uUpERxmqQb2XGGTWM9z0n2732B4rVTeRKi2zJzSDrOvxQEA5CNjpEz1ChomUD+sAAHgtlkZY5VAj6MxqutFXcJjRu7/8UgYW3UKNMVlCOvS/+E/ppqeMubCCEYS6WMh2noB9A2hOHfaA32oWTy2KRIx/APkVdUdVqjqwsU6i/Bovko/Cn5XUWNwKE/ZISmhEBYIB8VVjFSaj5XxG7YGo+zTQU80YCva01aPoAnbXvgKqK6+slNA2REIj5cZ7XOJuf3gTaEdWgDwYYwedCAmeRWtq4efncANk5Cpc6cGukNdeGOKnMOd7neePOGFOI7OrkrufM9xSgfpXc9MtXzsLBmCSwobHYl4lOrIjQXYIprXZTL1/kJb6AZewKq7SdZGlx0qQjk4gzlgPa0JW7dUGPn0XWN4AAtJa8neJnGz8QmKZf0kpkwhEk2UZy/oonzkS8GNpUoJ+YRqc8dULcs2NuOJCUFve+/xnbBJkZmqnBcWGKwG4UHIUOh/CoUscOclHaAeD2gkT1zCBqFx6yzG4E0G28kyj6kvX5OKx/6HXUgELzTGydLmbTeIbutR5uJcaxmwSEPlQ+sAYIBEUaaejs4YIDuMsYb7rMpLMd2jkfULiWUSM3PlmvH4vlRRDCX40pRXQZPR3Hq4XuD2iqQzyv/oRFolWTMNHHcQaAOfJv4D7d8LvOIj00aDGmxej46b76QW2ycZ+M1jmyhid08hqFVDFNVDX6Dy19ezyXwbC0ervAeu+h06kD1bVU84G02aqAACgHe7AUFA9tQwRH+utVvl/sajEPzgig7M9zHGLySRDrd3wOq3ft616/OP45FM8oZ0VLuZaitFtSutTQBm+2vLqQXyPqiQQU7wXsxnz9nmCU5gDuXR9StgRvL+v1zobXg1oljTdFntbV25u4f/ktVKpqGh1g4lV553j64N5HwOK27cIuxWt/MUFVvkdFeBh090UfdIUyHUcaFzTF4xeZbZcD4nnAHmgDRgahNL15Zu5eYRo1p+jBUxJSrp2Cfi3NHCPfsK0iVplRBA/lKYFfpwvxlE8ICkX7mocjiobGjoAOwUou7zhBx5mt6IOq22dgEHgUQ+blFpBa1ik8WFkXqFGmE7XEOPUmoT6l33csN44BZ/4IiKsPiJJWYM81vI01soVTnIY4rPZ/y9rFc+zuqj4Amp4q1Ak2MXYz9k9lfAsg9Uuz7kkEBYKLpP0ywiRnfxBGxdkMdCk3eRpNKr3781t8IS3nAF/13RAfuEx+7LS+a+sStE1PDJNRCvK8u1+QLUmsBf9ahctJ4D7xeFck9tIR2n/mSYB28FD2j/PHS/4uHICOmao+pBgx29uHWnhL3SmICNckCKO36jKToZLv0zK7l1UeS6FsRXuarI4Rsz1Bd8L/Y2UUOHb6K5cMWb49mlSCn2py4X16n/TxYYQSEh+EcvP+xYPOphwT55CjsyTwUEdqrS0X9CHrvUKcT3fiTJgb6p2P81dwE6YzExgmNhVlGd4CVZtOpb1Kn72yqMMtPsv034wisNTMHqpl2VEzNDMq+h7dPKwaPDKVRAcbm3vs6W9POYsAjLd1toGbVseRg7e8LWao3KnBBWt/rW1YYpOWijYSAcq7/O1H2Qn51QXaHUwZvLBpB4oUCJ6tnqV8ahKwpdfN3tKyrU9Yh95Wwsil4eXHDkcp/p27yStjhsH23GY1SscBAXzvxff2pEDvyyCeM5YeOdFiOvqn76xOBKf62xW00qNL+rux54dl2GuINqJO+BmHzUaLndTMZpahV/gafwnD97iWoodr14uZmZADXISVcpwvJ8U3tRAsHwvDaW9+c8OFsUcU3+5vdwv0rQI5DxnkkP3VQVkz2U584CGXvnqyDINbkCk1RGJyR+b7Q9pFzzAa5eZQ6Up/LnQP8TOedSRBPQOiWZ9rKUb6n4Wk2P5M3SfS6lq/avDYPy5C8Dw2XNNvdoGlxwC+cxx5JxylUIUVxfQiFjgkAG5ar6lWBRlhqEckv2czWTNhVIcumHqMcqpcc/Y5HaZLhKjI06vO+VsUw2ceCDmI3wKpSLAzHA/dsfIQ1yq+VWPxcOxOFIJXHwlrfQjeQBFMOq9fRq9zr4bZgERJqc4zFkasgdVNRHHk51DxVyam+dBsNurbjXaVb43oy/BHy9u7Ngy2JA2/p+hp1tO2ZIvhVDY5taBt0waNHc/ZcKXEuZMdYO5PQuT2swGUmkJIN+5yhdonPrEaz0tLbXP6K3fBZUI0LL1uGEyoIGYNLLeA9Yi4grr1FVyjsw0EOc/0fug0vikCG/MoqGuupeRqGAKQ5bPS7KvZ2XU1UsNDnfDormZQh62S/8JrRBDDbl+L+5Kw1oHERA2AOjaLG8UJpmmPC62/yxbMi/NRL480Jr0fNmy16Zm95Vpu4LOBj3ynCHxza+GbyUx8RaJC8+S1mo8DG4WhVRaAuVRT6OEUD8Rcgw6bx2soKqRXZpYNTV+LW/ZAEvf4coex+5UdTodk5aRS2auhW/oaEqq/jviX8HYReW33ruEv0HWd4TiMQZdkySy/iVUEJEtibq5m+5mB3vnVOzyf4SGfP3AU7HT41lgcOX7UodrNh1n+5cBFHIM0FUgZp7ZnDDdBokQ+/WUEJmc7sb48iQ1W64dETng2bQ3GWBvKni9AuEcLPVYdL9gWrJgd468yw2yTkTYQyN+GY9oZXczdhwCycLaJA4YM8ylra4zWJYp1f8vVKUZIe7fjTGPENxsGuVzWlMpEeOQiLZFKx59GnoJg3tmpP5Hx69TuGk4pZssr3BJc98py+iplwrwJ+2MiUI30UwOue3DSDu9mkkcW8W123vPxpWgEvxxvPmx0uF7uStYn1vs2BUb53rRFGqsW3tOprJv7iCevfUO/3MjkzDiWH/UjopzZMqoejoc4N4epThTCNPZ+NOM85XQPEGFkU8tnK3vjEv6QOcByTFxAa9JCMDTmeeKsOdgmmVrUQVVnb008R/aBrpIn0b9O2qeoqfyN3BjlsFV+I6qdR0yZ8Qnd/8gPo4SVSq9I4Tr0fapHqNqW8sRpL1ayw+T9EqI3C2rZuF9Zj63PmXyWHH0ogam/2TXw53s8ca7k4WGoYMNVSoBXidsMP5vdjfEaoGSmW2qcD/iMztlz/+TIpvuROA1+kLtZTN9pPHNL4CxHOEubJb0pW0JJ38WgUM/b/x6crqS7Z7Eu4GTd8AY8cQRsPsq1Rp+rqjhOQHyAJgD23o6IXf5Ct/K+Tu38Zsui1hVXiqT577FOafsHLVFQEDxJWKFdSa8NUg0mHm7vp6XCbicHVygKiZpei6wmUU72Ufxqt+nrXk0EkFvjqSjpsvqeSMnrjjVbt5Q94Kck3bV9+/Kh+1AutUlkR3Z3cnmY0pl4u+NuraebziTMwEM/8u456VoeY3hoRkjUBY8jxb5398JNr3HGDCNPLo8+p9Fhv6Gwvc2Q5cM4viHSrVWA3awUTccdAblDoJqzvtFU/VZ2jcIcJyADFwFTRqlek1Ep+ceEVAuXArfIcb5qgM0xECDirnukynWVrleO9dxWSi3K3G7iEPDLh6V9y1tdD9JAWE2Y1UHPCtarHw/Zat2qUsSWwBsrusrpiJSSgl/DULSKM2ZqJwGsCqluBJiUbWAT0N9Th1gFOP1vklkEp8gDkhR5xP1taQeyhm/cp3PqeASG9MvuRESpqgp/PIdA4ubPWIlJ0zCan74vx9c+BoW60jeEoVHzmgBLrgV21ZRVVllBhksx1gVWYph3vqoV8dMCplS/ErKfzY+khl5xyKnabXRoL1u2wF3kc6FPyfeiGK406pBfUWU4YKjyACSibMnqXnz87CvxRN3R4fFh6MkoYaSPtDF4J1eP20a7+Yyhuf07BEuNBOaR06E1zVrTpOm1jA4zS0hmtmPPhI1rfbASF8sSScJ45shNkOU0OvZDeSWCYMx56EHVVFIo7d8M3SSUlcVbN19xlzLBLWALq+K2erdcy/lxPWvlQMtxIwKTCyBeyMwIKcx93lx4Py+uNcFPB0SjG9KoPBTzF0UlhIrpXy/Oso+JxOt+gL3CqsN2aj39bYbnFSjzu3dsQTTd77sKt+nOhHa80Snolj0hui+Rj+/RYEvvyNwmiHc7qgXV1LOqud5Lec8oQ6XiNKe4jLRfzsr7/R0Y52RK+VgF1mZtS5MtEa2OF+QpjxH9aovF2YejZcjn9D33u0uOhmAKTe+WT/b0Wy/kc8yPmp7IjNsMzSr5RCuUWGMHi0kzFQAOVqmiqX1bGIM0oKakY5rSVccyzEityYp8AgydSy17IqFL41LBjbfkv9e9gxh9C3WrjLapQtwzDVyBD60UzTVg1qYcdtToQL0Bdtvb/rBkg6r4PC890YlCLgnfe6meQlbCyIKDRVEEob1WcmNf+pOJTtsxip2p0F75GFN0GAGRzR7r5vBDt4hOsqLGb5fyM1wL9PFqzooiw9mSu314gxmHkbPVptJlQg6Bf/AW3+dpdF7bIE+AzsXFznphl1jFFU+kkdxMSajTU/gGMlCRoXWRtR29BV1H9bWbXFxxn37+arcrXKKoOrRp9+u5CjxAE5+AcAOVjfj0TuchVSf5DnELHM5ldhYReLNJa9ctGW/7c5b4AYP+iXVgqlL4nTox2i/etQgIsFu/ASAynrx0x2SDxJQWIQzDya2Wem1gqTGwGpphEWfEg5fy/30SEN0+erhMdLLnCVkbWXSBGvXAtzXeFmSv0oVj18QrF+Xx0jpMmBsQAKkXtzeSp64OPkFB/1UK1JpLl9v6vOinq1Yzl7GkOQJPNxB75mXhcdb7Up6oUEnKvZofCJwasJA9ww06NtxErXrrCulnvniIn3Yi+eoWPhqeCOPhDxzOEjr5ihuumSIpAkAR45OT0UZoqJk9vB753l/avsFUEs9nykN7y/DonSad18bTaATFgZuVs3E31rK4AMpnc+8QhQR1w88qmru6oiTm79jmzlr2LCDS/pJs7OjRZNVPnNBr+XUtXSFSZquFNs1c+/rVOADt5Kh+8CSYolmeXiKwbx2yB62MVxNp0TVrcIPRifEnXzLRrLgpzOK2Pw2fIbYEnuUd/zUKxgdJ59LGlYVVamfb8hj1XTfVZjs/q8VkIYfyQvepSj5lRdo1Tu4TITFNronzPgNViTeXKlZBskt32x7DXFYw25IJQnu+FD9FxJhSEL9tKDwEbhRj9GggVZEmSFf02JmmeQ6oG/+Nq1jihGjif97IpWnGjzA+cTRL1a7TvN2ExX/WIsa1XklBTKB25PscNL6aKoqte0rd+87KSJSi7OX956XwxqsqpLn37rMQZrz51dVFmAFTw2HrngOOfcZKYVcgIa8Q0+ck9gFMJ9UsGnfd4xzXqgAwOF2/8C7/r60luc/22uc3b2fk6n9PH2h6PAhOGdRkKTM7go0mJi7vGER8ZuM4Nrw5TESp+YRVRgfiGzHI8XVNlMqB7PEOmDeRu9SG29aImmwfvu/OifskuJByNGCRTGXuW/7zKwFJLbhCnS2ZZEGw7Jog88riiEWExfnJRmE5CW73znn+v29qZcdX4Ff/f+V9RwvAsCKyagZlnjgIkhGPpXrFad9/XO2rCJxg5dihUf2NVlqKdD/OlrLxBN6vBTNtUKa9RhHrW7XVCqqFPzHjYGqWDzAktBg8vFlcAp/n71+Mzlt+BQLmgeN0NwGE34MaeTTZkb9QxJ1sqL/lvWMsexfYOzVo6NK3yb5wCzqIR28UZqeUcp83mvHPCeWSn3+zZpSFAXN8qk9+gM0xItuhQhMuoQF49/Is7vwkHniJp+TiZwIB2P6JH4wFrHkIdAAfgyqdXQOT9tGEhT+pb8wm92uJP2Twx9wz4KXQlS1boxFdIEJU16GjG6/YgGkX5Uo8/BsBGwzBinUFk2wWPawhluRL7cepFxVi3oaLU4SlPcblbX3i7YpFsKCFrwduP7ouvtlFITZGkc1BX4GnQEsPU7CZa2QU9RTJTVFHWwwdHM95wnS07YnanO57PDWKxbfD8J4HSIFr09UUa8NWFmW69b0eGRTzYrkXlCklEKY5q3UYICvz3SKEtLmZXj1mGtLtUICHp1RRpNiqSHTFpmCBjTp3tAuuTnd/zuUAKBmz42s2MKxWTDiyf9f8SmcSG+6JKHAnhelmMI8lcnywu12FxZr5sUgP+yjLuPys0O88rtk9Y1U4qJWSh1Yz6dtWCtsX0dGwPYn8jg52S6WBz3zb6ocoQI7utrW/O8hMZe4dhaI10Qg5S9MSx4B0aPkdRRyU/pla8ponMfs/m08tSSFB5XjUBhQkz9bNtvTMQ/eDT8Ax2ZuzBgJTvwlWcuViN99+kUkJeSl0F5KpUnP3yNFDRtsfFNJLAidNB4dRI8OXlNrjCugA7vwzsJ6KAZJyJ3a1q9Od3FFmqp7tZ5pgo3It/mUZI73PwkG94hNVVTurNFeniphgF0Cm+ZdbeRj0JxMW/efRAaer8pZgK9yg8zvhO/FJB14ua5l+DGQf6DUQS0SxJQgE89DIftcHdiOhz3Y7VJ+c+929nt96oraYrXQHgd27XHW20qltFeeQpJvlRmqD4lMT9VfkMgwf/LnnB5I6IQVvcTWL3AAWYja1X5Wjjm0UlSDjVSK+GQs65f18NBJuNtK44GUwrLx14Dmjk7MPpEQ9o6lu6hmpDJfv+nAjHvUG2X77noeaSJvJSdg4vSNGGxhJkX1xaj2gyi4PrtKOZWcO9uNJHHsoPzhSiDvBpbPuS6+PIV8DgqGwOg7ST4RjO9eKgrIgMm6V/j9joZrylaa/1oQIEkuJXJO/QlADSddwIKCaJLSC4W7X6FZMU1TIFYfd5ulj5qmmgcRlUtThR3+ROCI3F3k36B+SOrL3CStMyxZbekp/Z0TD9/oMQy7Sg2pADquzf3DvyIcppfIh1feum4QzcgVcocCWS2qO9PZ6U3RgyUR4HxRNzcvlrlEg6mNdEcry8sWDCy1hKw5XHWF6OUw5LB9WyrFYJeoNOJCBV4+AhslkT/XHcRR1it/QoaM1FC1vlhOTfY3FMlKTQ1xGo4Kb0YjAf1ofyyqHxs5Pi0JSPOMVnMGT+VvYXvITakqnVi8P6Ql47Sdn6DOKnCNatk5WwQ2mdKXJC//FoliMkVxMh02qQ/kzWgFQXGmmtbxJykSBgyIABsX5iFTpY/XhSE3OFSImZU01+68hnmV+UnbNFiFkvZNeIfW5wsx/uwIA40WQ9vE2IBRGK/dFfu5cbeIVRmHk8vnnzUVKTGEHGS5g/WYbaSxB5Z9lwluLca8H56Q5I4idE5SliJSu5SsyZN0gKPxe+Wlogwrl5aiZ3QT85xGyqdefze2qtXYlmkj1IHtCvslKEnxkIk2GniXR8Xv+GXPArZG4ydVQGyMNrIxqBXTL95H4Df39PwUJU1fTtcXBNphN+wV3hMGeyA7Yc2+AW7eesCjChj8AcuWB3AXGKDgZ9704GtkE5BAkm63/Xo0YedSfqFRr034s1ioZU24rh7bpXd384cUIXFLIG03ZXa9rQbO3NWpV25W/ed8ai2V89/rh13Uz4aI9Y0DnSm3K9BBDVTm/P5GphUkosmaPrOHxdr2t/76d4ouBwGK/YsOHm1AGmAulDQh5yQUYAfLMvUTwQ0Mw0mn5KzBmHFt+mKWk+Z6JonevRWCxUPELN9NRrUOiNafM2SNF4TQknaU60oZ3/CDKDx0Ekj35g03VKS+fEPs9/mCP7VrcYXFKMAsj3GOnZ4FtqrxHH357XHFb783KVPCbMML0x8MqwkDcl5cc/ObqfnWJEYcDebex9ydryoT+QZ3X1D8Z6FuIoRX1XRGcuujU7SHENv0qGaLL4kBhANbggLhxIAAeeoUA2X9rvmxq+n2Z0Woa5K9MUJ9qMtxshMZ/0D6Myk+XIPo3tLXWQN6QEJbxXHD0EbekcieeXVd53xcFNaYeImEk4PVE6thTQ/bR5fISGyvhCcDvq57t66cmnVe2EFq1jLUmCTgZ22x3t02X2PeZNGw24q38AKdyi/HRm1s8hOWmywpflZINzhABDM+/e2N03Qbt/2YDzj2yyxluKe7uCVWz0ZOV7ScQ589HbpbJS08dVL9QbDMT45Bl9PeNVd4t8lJJBWOOFhM03TSAhh8ZYXTkKyZdoXl915/5DRMPMHh1r1rT443HwKp0azA712bOoJ9iDPYsErFz0tuYzNlTZGCYnlVlY5E2OxIVMb75WEs6PTvUg2NTT7+odFVPKCQEmqT5KXuMCZ5qNKYCgtLR1b6PTCDGpZ+fbRJmoXahzJQ7a84hyQBtmfz9S3BxgBgPMaC23gCWyI2wk1vCcZe4XhVmmB4jbL8I8tumYkMBqNDylwA35Kxot5yCeQsRiUk7fkQSWghfN+Yi2S1T3aH1qDnu8N/m7Q3GYiqVMM7+WMTOEnC5AAAFD0RSFjpyEjHkX7ctARmWljLE/ew5fHy4rYBztRtsdBos7Snc2s2JzIwS3tw1Ng/hLf2AY4dESGIQf3TqQ0OeijdkQxPzCAYj5ywGILFN//ApkTe1+UWUC/oVouNqBRA5BPPHEYR9vZK6IrfDjSC6u2PJFgqt3ss/rWFzld7wJINhcbqQxa1nXs0m9uyiTV8z7Wdden+vKMTjoQbUmohY+OzTjB5VHruWB3EuB9s1abbHzAmZtovZ4aHk3q7uw9YwAjYaoBbR+qM3yoD91gBt6noFBcF5X2FTzTCQPsDC3ItLKep/JamhJWk5PqaKaU/8eD56pnJ6Vu9n4URugLjcXyYU8xrq9N+EPweHNBi8NKP9k3zJi2XR554IEaL3QH2AkfcCh66bZInzgogRqkkHrtt4gSrImqXyDk8fqus2Vtfgg7LAHJdUQS6ou/SuuTayJ9YX28v2GFdmCd9MwQYagsBbUfb5FthurNVYYLRB9dioDxGA9m38bGMsfnpsH1WbB4hthvnFaubrIjN9C+HXUbLlSxJTwr7Eig9s1CgSPwANSEoBfVexDwc7ke4+Q3Aav2trNUP7m9/5qExlII2dn5KCvoU9WenLuZQaaMlJwIjnPZupvuDIZxnYnvAd8CJzFdR5WoCboVzh379zL1EblLOroeeJWC/b1n2n3CXFn3gBz4E+yMrp7h4uTUoRds84KjWCDXNq+uO33MryFyiIxQhPrnMG2EWcb7w71dMJ+rrbg4i0oK8JDqiqyY0aCLRO36ab7G2HCGu7ix7vFzKgOrVFOfbDp3pOgIUbItshn4ecnYS/uf6ScZLLv6O/4bqLg6Sn4KYXZ1kXVIVN4s/HAIa0NnKBatvRy6Ax1OU6CvBsbyUe3GNOAIeJ0Qf8mLwwAE3x0B9Coo/+qQng7WTRnLFYa3R7pEUWo0SlfCZnRatAX0CXjPAPVuWLtahM4dvU/WBE0q+UnvRg2VJNVfb7ak8uFzicqMq0bMr/+pcYmDScfBQ3xZ5KKNR92GY533bUrBAFN41X3gh36uhdYcO2fh7lkgQinaoW8y3kpltn1oBpsTlMO2tLuGVa1BWJpvAkqR06BK0gcWZiQjqtw2+r4zmexnSaGjeOxl5rBLEqkx/K5gABp1Iz/R4ACG/66/h753CeHx/EokYIR3pM659+r6570a4qJF6ri/IW2o6eD4QybeUs3E2iC3HzC3zpkLzrD/rUXAmuHE1S0KR/RNwaXgYj/AjnJssNenuJkAndA7dacejwPrOaVTiTq9zj9E6Fozo12mA6nJjoKNz5QyXVlMmZJd0X7/FfmypRWgwWSkDoD5tFLsVAyZ1lWe9zd5UEW+eOLQIBdlpP+66sfFUp+mvYOeMIDNgYYGtWe8Rz+QU5QgGeF15RXD+xlTaoZg9twJEDjoAwUT239D6yOO0RjrceE1ny1PlOQvtzMf1wgWqAlIG/krJH1fJrJsk/w4e9p33GSx4DgbUU3WqhLhSUs8YlrL2o63sQioN6zX0eiCpRvfrps2GGoPWBpEQBrlcLjeG5RD5iMd4hlGmfqEH0BTJDyAqyMTihq0IsG1cOjPVVDYkXhqnFJPNwKE/+zPpzEql5R6xJvUbfHfkNr/a9OH/xM0b75CyvCR4i8a8krzKmgJSyNJkXXrAalv5qYwI+aLKJzS6CRg+iouNbo/hPLD1knd5sk+Wu160ABMQsL2N0Sdj59W6sd1iSYa8uFTEFPDz2xPnaIiS/+1RDaXin1JTXXGJ21RaTsfKQH/d254nEmeXLN5bHBzxN62yIpjSLothQgbkNWBBLkXcXHND/aCkVhOVppiAKA1KHcgWrivnfeaT+aLPqKY6xDeoDd15WznPqVcBq5xPyzJLIgGPvd6+tp3lXGD37bRTyZsM987up0EzZytdX7/SVDfogdDlXmRz3Jn3sUjes7F6cEVGKh4hJcncCTaRnu0pNWxruBPiwG6H3vQF3PvHHxqUWT6Bvkq41pk5Kqy9hnNSQrW87sFXzzYuvntktZzxyM0mnhcFy0TjtxvJkAtY2M++vAaBLK45SVgo4ko6TvtidEJjDi3Di5FMZ1yy+VwuZROi0wvrKbwfJMTWZGztEgGiU5ILeTjj1CRF5mUM1oxYwU06H6gXgY9yJPqP/1aByw6WvmqItqyCpyer2C83RCiu+FWjagcXs5PYbrwqUgf1ETzraa5tjAAMXBa9p0va4ghAVhPiscqC+dqqpoCuGrQRpQqnnMDsLeNYZN6JUkM3Um/gMW4UITj125t8/BA5fUM6cuGtbRgIHNQp5DT6jcUzhiwzccVe6cz3L9O/6/RZs6dIQhh1RgF9aF1gs61dyXsvKQa7iTWvAH32d4x6ZIpeUqldgjZ4VkvBVUWVebWiln1Bo1pTYE8nkVF6SnIqg8B/WZleLEDLh+BvmS8Foa06/sSZLwhxLCqF8SFqLSQ+mB0aXFSairp1qXYbQsANOuw1xtBLPIA5WBShGdPNnZuZ0vd6yoPgyituLrEyRr0Gb7Vy0RvCxPiSXdav4kkJ0pgKzGN8gsJJjEH9q4H1kXQqf9AggdTY3W2GFAUlbBGdsJgvEW+D/Ws5r8LPXrJuCGp4wPgvm/c60j1mpgBVRaT1KrYh/NLKrCHWWVTz56SXO3iBqVm+2f7RLZV4BSYPmLqKY04iiG8gWg2a3e1lKHzYmbBhNNR5Ri24iKqLV8vaHtgvB7uuAhnbPIn9WR2lylHS16NRiuXy7SmHXtK5Y9i2qsXSQdRpPSMAwyYqvxrIWYmYw3dAQr6cIrNObla3OYmhs3A4Anxd0n4VnFP5yPsD+eZepQCx5XfUo5PMnWi6YRwSfdQ5yF/j/tdZlzgr5XdUs8UUmF1+ZzqSlR0A8Xh9kx7It8kx8pA+VP4I2yXKZCcMe07bPHxqYJvzjbKDwgDSex3FdM9EfIj1a5nsgBnU3LRqcIzYmXLpQVUX5S1k1ZmzXgl/tgwgyvkrhyDBZpyVOeZ3p9B8Q6EnR5vB3pacgTYddrsL6/z3FaMnNH/F58E9/3Uove50e14H7+VKxfYXEkfZoIMYQj3adCN/48+JRCLtu4Jb1tPRbfYlDfFmY7psPwkpF70tdCHlRWkMSHNvO9CTCnXTVZHzUEyYsl4i6tKdY/ehhRjzG8g7xc43+YqLdWaBhuvLjLFT35WQSwwQvf7BwKdrIME2qVkCrahOpwQVVuZnxApPI3W0KmDKB05kiLOfEiCw7XPFxKKXJuqM0nza0QXbOx/Z6xGm579wJXpSHfiWz4IQJCRJx4wZWqtFbCBo2ZeRlv68C3CW55bX5+AWesBYKA84/mD7R/Za36/uS7WtYgh6yeY7J2mj5kYBxSJhumJTuWbP/Wo2PA4efwePlynOR9UTWQU5tVFO9eGQ5G/21PkU9oeEhiaul4de2bdwtpbcr8q159hb/Vg9UEboC47NDRGs316repS4+UVbapXU0Gy2pSUfVLTmb1Vus4eX3FElFKB8dCX4ly2WQZSEUl5Tv4n/Z3VMc/OfbXq6xKJoukT4XUEnLEaY3A0Ed/Gyef1lfZSQQB/OfF5mw63e4xYMKWokL/uMUF4psIJ1Yk94eW7b4TxZZOCc2U6p4SSEmSQBvdq6lSMXl7FiIw4aMmhBrnNZpDXvoDNaHLo6yT415c6CLeJQTttJ7mAODC84f9TwNzzUBCFvSplgSx1NmuLRq4EkksIf/W+GLSlBKpwt8+983oBizjCcazmC3QAFX4mKXloCV5XOIojhz5Mwscvw8ANF/3yHve9PNXkeTp0fQLPO20+rloenAKwW81U7Kf5Cr9ysEXMUSqL8zTd31xfUbGPsbJAS6gLjTswt6xNm4u5XZoFc2PLaZSUQCxnUrCZnoy7ZK2E5LeT39ldgk4qB9wSVBQ71uaQzSWWLvjAnext/Q6cp0hpST6wQeCOuJeScRiGXV8YBXlYzgJAPxa2Cd7Jvs6o2Lbwo64WvdaU14CL26N4/+3ybVzKlf99/nhdyM/kvwW7yYE1ck1uatByadmbNfZX90teIXjDuvx3wkiG0ETLvQEKQYwBRaw/EHSGb1Ow/UaIBmP+9kZBhOP0hDlkT7+oTalDnU0sMku+YPBxcoy0GocIabg/BArG3uKBsC70YOHvViynZuPE+v0Sz3rl9LFyQyGTUhjV814nh0T7XCyR1JcZK+qcR4GNKllXoal9LgU4VqDXIwAEagNCnzYTQh/uyYg6rIoMGoMaquY3KYYIFvYwGerlEyvre0veFeNB6F3RiQr6Hft5Di43VzVAqBdGHkrHw499jw7HS35qGnXJhQ3jxcPEBjU0RUih7nSlwTNuXrgC1JbJoxbojd9KT0q8HgAiMoEyJ5SEog5DvkySPIWc3YjBhCGDUvQ73RvJp7nEE4of1U8aceZcunyoNPXhh4AqK7yDQ/vPDWyN/VuGazG6hRF0b1IaQJ1jPLWve+KaKS+WZ2Z6sQcfRFpAWyz31ck6VWg9fA7Z4kdR9YMt+rFPHsdOHCoIezMewUK1we01N+q3E1bg+zy1d+7lpPL1tqlQHDpuJh13Dg71pqam7D0Bilxk8P/2Gj78wR+zzujt6P1EMZ+t8EzCC/64W3VqCkQr1rlnnNMUI7dnnpnKypEBkAYBJQX3pFNaGwtWcz7gZpGrLUMnMWFGxFTwK6opl/efAaTZBGXPP15F2iwofV5ngpc93/2Urb1TimJHUehn3459P6k9ied6w8ZdoFMd4St5EoJx/1zbIcBMZejPPKZMLrqycIvU6fdgofpvbz6hFayKem8ga7OxW5AULk8DTT7aK1xtitE/8MNXHlnSKgCc1ahS+n9ucBALzWVkTo7/A6yO/2LZHfDIbnCIV+QajPf+2e1p0/hkRlAKCtGzHmMFqPIF6YDCYb3IU34rCG3nMQgqCeyx8AZsng6G7ji0UX73GpslMiRZL7QjPlikX/bcBwzob1CWapy0BeKZIq8FcGK5XGS3ZnW7tdcTQxHRtemgrYzj3k4D9v2RVjsJxy+TNU3lTQANiAAAAAAAAAAAA=",
  schimpanse: "data:image/webp;base64,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",
  libelle: "data:image/webp;base64,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",
  dromedar: "data:image/webp;base64,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",
  skorpion: "data:image/webp;base64,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",
  tarantel: "data:image/webp;base64,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",
  tintenfisch: "data:image/webp;base64,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",
};

const mixName = (trip, lang) => trip.map((k, i) => frag(k, lang, i)).join("");

/* Exposure ramps the other way from the b/d drill: it opens long and works
   down, because a nine-letter nonsense word at rocket speed is not a reading
   task, it is a guess. It used to end at DUR[speed] — the same exposure as
   "der" — which at slider 7 meant 500 ms for a word like Flarildil and made
   guessing the only rational strategy on the last items of every round. It
   now ends at DUR[speed-2], so the fastest item is still roughly two to three
   times a curriculum word, which is what the design always called for.
   Relative to the slider rather than in fixed milliseconds, for the same
   reason the b/d ramp is: the slider is his one difficulty control. */
const mixExposure = (i, speed) =>
  DUR[Math.max(0, Math.min(speed - (i < 4 ? 4 : i < 8 ? 3 : 2), DUR.length - 1))];

/* Which slot is left open. The medial slot is the hardest — word-initial and
   word-final fragments both sit at an edge, where letters are least crowded
   and position is unambiguous — so it is neither first nor over-represented. */
const MIX_SLOTS = [0, 2, 1, 0, 2, 1, 0, 1, 2, 1];

/* The initial dominates, length is the tiebreak. Both are cues a child can use
   without decoding, but the initial is the one he was actually using, so a
   partner sharing it is always preferred and length only decides between
   partners that already do. Weighting the two equally was tried and measured
   worse — it let the sorter pick a same-length partner with a different
   initial, and the initial-letter-only strategy rose from ~31% to 37%. */
const fragScore = (a, b) => {
  let s = a[0].toLowerCase() === b[0].toLowerCase() ? 10 : 0;
  if (a.length === b.length) s += 3;
  const pool = b.toLowerCase().split("");
  for (const ch of a.toLowerCase()) {
    const at = pool.indexOf(ch);
    if (at >= 0) { s += 1; pool.splice(at, 1); }
  }
  return s;
};

/* A foil keeps the first letter and the length of a real fragment and swaps
   exactly one interior letter for a confusable one, off the same SUB map the
   reading loop uses for its pseudo-words.

   Keeping the initial is the entire point. Foils used to be the other animals'
   real fragments, and measured against that build a child who remembered only
   the initial letter of each syllable answered 83% of items correctly — 92%
   with word length as well, against 25% for guessing. Sixteen of the twenty-
   four possible items were decided by one letter. That is not a tuning
   problem: within a slot every fragment must be distinct, so real animal names
   cannot supply four foils that share an initial. Enlarging the pool makes it
   worse, not better — it produces duplicate fragments before it produces
   shared initials. The foils therefore have to be generated. */
function fragFoils(frag, lang, taken, n) {
  const block = new Set([frag.toLowerCase(), ...taken.map((t) => String(t).toLowerCase())]);
  const near = [], far = [];
  for (let i = 1; i < frag.length; i++) {
    const lc = frag[i].toLowerCase();
    const curated = SUB[lang][lc] || "";
    const generic = VOWELS[lang].includes(lc) ? VOWELS[lang] : CONS;
    for (const [list, chars] of [[near, curated], [far, generic]]) {
      for (const ch of chars) {
        if (ch === lc) continue;
        const v = frag.slice(0, i) + ch + frag.slice(i + 1);
        const key = v.toLowerCase();
        if (block.has(key) || REAL[lang].has(key)) continue;
        block.add(key); list.push(v);
      }
    }
  }
  return [...shuffle(near), ...shuffle(far)].slice(0, n);
}

/* Four tiles: two animals, two spellings each.

   The picture cannot decide it, because each animal appears twice. The first
   letter cannot decide it, because both foils keep it. Only the interior
   letters can.

   Two animals rather than one: with a single animal on all four tiles the
   picture would name the answer outright and the flash would be redundant.
   Two real spellings rather than one: if exactly one tile carried a real
   fragment he could pick the one he recognises without reading the name at
   all. The partner animal is the one whose fragment is closest to the right
   one, so where the pool allows it the two share an initial too. */
const mixOptions = (answer, slot, lang, rnd) => {
  const right = frag(answer, lang, slot);
  const partner = MIX_POOL[lang]
    .filter((k) => k !== answer && canAnswer(k, slot, lang) && frag(k, lang, slot) !== right)
    .map((k) => ({ k, s: fragScore(frag(k, lang, slot), right) }))
    .sort((x, y) => y.s - x.s)[0];
  const tiles = [{ animal: answer, frag: right, ok: true }];
  const pf = partner ? frag(partner.k, lang, slot) : null;
  const fa = fragFoils(right, lang, pf ? [pf] : [], 1)[0];
  if (fa) tiles.push({ animal: answer, frag: fa });
  if (partner) {
    tiles.push({ animal: partner.k, frag: pf });
    const fb = fragFoils(pf, lang, [right, fa].filter(Boolean), 1)[0];
    if (fb) tiles.push({ animal: partner.k, frag: fb });
  }
  /* a fragment too short to perturb leaves a gap; fill it with another real
     one rather than shipping three tiles */
  while (tiles.length < MIX_TILES) {
    const spare = MIX_POOL[lang].filter((k) =>
      canAnswer(k, slot, lang) && !tiles.some((t) => t.frag === frag(k, lang, slot)));
    if (!spare.length) break;
    const k = spare[Math.floor(rnd() * spare.length)];
    tiles.push({ animal: k, frag: frag(k, lang, slot) });
  }
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
};

/* One round: six creatures with a single slot open, then two creatures with
   two slots open, flashed once each. Holding two syllables from one flash is
   the escalation — it forces more of the name to be read than whichever slot
   happens to fall open, and a guess has to come off twice.

   Until he has built the Krogufant itself, one of the first six is set to it;
   otherwise the creature the mode is named after is a 1-in-4096 accident he
   might never meet. It is never scored. */
function buildMixRound(L, lang) {
  const pool = MIX_POOL[lang];
  const built = !!(L.tm || {}).krogu;
  const rnd = Math.random;
  const q = [];
  const pick = () => {
    let t;
    do { t = [0, 1, 2].map(() => pool[Math.floor(rnd() * pool.length)]); }
    while (!built && t.join() === KROGU.join());
    return t;
  };
  const open = (trip) => [0, 1, 2].filter((sl) => canAnswer(trip[sl], sl, lang));
  const push = (trip, slot, flash) => q.push({
    trip, slot, flash, answer: trip[slot],
    opts: mixOptions(trip[slot], slot, lang, rnd)
  });

  const kroguAt = built ? -1 : Math.floor(rnd() * 6);
  for (let i = 0; i < 6 && q.length < MIX_N; i++) {
    let trip = i === kroguAt ? [...KROGU] : pick();
    let ok = open(trip);
    while (!ok.length) { trip = pick(); ok = open(trip); }
    const want = MIX_SLOTS[i % MIX_SLOTS.length];
    push(trip, ok.includes(want) ? want : ok[Math.floor(rnd() * ok.length)], true);
  }
  while (q.length < MIX_N) {
    let trip = pick(), ok = open(trip);
    while (ok.length < 2) { trip = pick(); ok = open(trip); }
    const a = ok[Math.floor(rnd() * ok.length)];
    const rest = ok.filter((sl) => sl !== a);
    const b = rest[Math.floor(rnd() * rest.length)];
    push(trip, a, true);
    if (q.length < MIX_N) push(trip, b, false);   // same creature, no second flash
  }
  return q.slice(0, MIX_N);
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
    const ok = !!opt.ok;
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
    setMfb({ ok, chosen: opt.frag });
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
    setMi(n); setMfb(null);
    /* the second slot of a two-slot creature carries no new flash: the name
       was shown once and both syllables have to come out of that one look */
    setMstage(mq[n] && mq[n].flash === false ? "answer" : "fix");
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
      /* data-mix-seq marks whether this question carried its own flash or is the
         second slot of a creature that was flashed once. Polling for the flash
         span is not reliable enough to assert the two-slot escalation on. */
      <div className="bw" data-mix-q={mi} data-mix-seq={item.flash === false ? "carry" : "flash"}
        style={{ ...wrap, padding: "10px 14px 14px", gap: 10, alignItems: "center" }}>
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
                if (o.ok) { bg = "#E6F9EF"; bc = C.green; col = C.green; }
                else if (o.frag === mfb.chosen) { bg = "#FFECEC"; bc = C.red; col = C.red; anim = "bwShake .4s ease"; }
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
                  <span style={{ opacity: done && !o.ok && o.frag !== mfb.chosen ? .35 : 1 }}>
                    <MixBand animal={o.animal} band={item.slot} w={92} />
                  </span>
                  <span data-frag style={{ fontSize: 27, fontWeight: 900, letterSpacing: TRACK }}>
                    {o.frag}
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
    const pool = MIX_POOL[lang];
    const trip = mixSel.map((i) => pool[i % pool.length]);
    const name = mixName(trip, lang);
    const turn = (b, d) => setMixSel(mixSel.map((v, i) =>
      i === b ? (v + d + pool.length) % pool.length : v));
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

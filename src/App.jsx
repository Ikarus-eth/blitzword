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
const VOWEL_N = 12;

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

function trimDays(days) {
  const ks = Object.keys(days).sort();
  while (ks.length > 60) delete days[ks.shift()];
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
  gold: ["Turbo & Gold", "Turbo & Gold"]
};
const CAT_ORDER = ["start", "streak", "volume", "mastery", "minutes", "days", "speed", "reach", "star", "gold"];

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
  { id: "a5", cat: "start", icon: "🌍", de: "Zwei Sprachen!", en: "Two Languages!",
    deDesc: "Spiele mindestens eine Frage auf Deutsch und eine auf Englisch.", enDesc: "Play at least one question in German and one in English.",
    check: (S) => S.bothTried },
  { id: "a6", cat: "start", icon: "📖", de: "Erstes Wort!", en: "First Word!",
    deDesc: "Bringe dein erstes Wort auf die Stufe \"Flüssig\".", enDesc: "Bring your first word to the \"Fluent\" stage.",
    check: (S) => S.masteredCombined >= 1 },
  { id: "a7", cat: "start", icon: "🔥", de: "Erster Tag!", en: "First Day!",
    deDesc: "Übe an einem Tag mindestens 10 Minuten.", enDesc: "Practice at least 10 minutes in one day.",
    check: (S) => S.bestStreakDays >= 1 },
  { id: "a8", cat: "start", icon: "📈", de: "Neue Stufe!", en: "New Level!",
    deDesc: "Schalte eine neue Übungs-Stufe frei.", enDesc: "Unlock a new practice level.",
    check: (S) => S.reachMax >= 2 },
  { id: "a9", cat: "start", icon: "🏆", de: "Stufe fertig!", en: "Level Done!",
    deDesc: "Meistere eine ganze Stufe komplett — mindestens 90% der Wörter, an 2 verschiedenen Tagen.", enDesc: "Fully master an entire level — at least 90% of its words, on 2 different days.",
    check: (S) => S.starMax >= 2 },
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
    (n) => `${n} Wörter`, (n) => `${n} Words`, "masteredCombined",
    (n) => `Bringe insgesamt ${n} Wörter auf die Stufe "Flüssig" (Deutsch und Englisch zusammengezählt).`,
    (n) => `Bring a total of ${n} words to the "Fluent" stage (German and English combined).`),
  ...ladder("e", "minutes", "⏱️", [5, 10, 15, 20, 25, 30, 40, 50, 60, 90],
    (n) => `${n} Min.`, (n) => `${n} Min`, "minutesToday",
    (n) => `Übe an einem einzigen Tag insgesamt ${n} Minuten (Deutsch und Englisch zusammen).`,
    (n) => `Practice a total of ${n} minutes in a single day (German and English combined).`),
  ...ladder("f", "days", "📅", [2, 3, 5, 7, 10, 14, 21, 30, 60, 100],
    (n) => `${n} Tage`, (n) => `${n} Days`, "bestStreakDays",
    (n) => `Erreiche ${n} Tage in Folge mit je mindestens 10 Minuten Übung.`,
    (n) => `Reach ${n} days in a row with at least 10 minutes of practice each.`),

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
    (n) => `Stufe ${n}`, (n) => `Level ${n}`, "reachMax",
    (n) => `Schalte Stufe ${n} zum Üben frei (geht schon ab 70% der vorigen Stufe).`,
    (n) => `Unlock level ${n} for practice (possible once 70% of the previous level is done).`),
  { id: "h10", cat: "reach", icon: "📚", de: "Alles offen!", en: "All Open!",
    deDesc: "Schalte alle 10 Stufen zum Üben frei — in beiden Sprachen.", enDesc: "Unlock all 10 levels for practice — in both languages.",
    check: (S) => S.bothReach10 },

  ...ladder("i", "star", "⭐", [2, 3, 4, 5, 6, 7, 8, 9, 10],
    (n) => `Stufe ${n}`, (n) => `Level ${n}`, "starMax",
    (n) => `Meistere Stufe ${n - 1} komplett — mindestens 90% der Wörter, an 2 verschiedenen Tagen.`,
    (n) => `Fully master level ${n - 1} — at least 90% of its words, on 2 different days.`),
  { id: "i10", cat: "star", icon: "⭐", de: "Alles gemeistert!", en: "All Mastered!",
    deDesc: "Meistere alle 10 Stufen einer Sprache komplett.", enDesc: "Fully master all 10 levels of one language.",
    check: (S) => S.fullCurriculumDone },

  ...ladder("j", "gold", "🚀", [1, 5, 10, 20, 40, 75, 120, 180],
    (n) => `${n} Rakete`, (n) => `${n} Rocket`, "rocketWordsCombined",
    (n) => `Bringe insgesamt ${n} Wörter auf Raketen-Tempo (mind. 2× richtig bei ≤500ms), in beiden Sprachen zusammen.`,
    (n) => `Bring a total of ${n} words to rocket speed (at least 2 correct answers at ≤500ms), combined across both languages.`),
  { id: "j9", cat: "gold", icon: "🥇", de: "Gold!", en: "Gold!",
    deDesc: "Bringe eine ganze Stufe auf Raketen-Tempo — alle 20 Wörter gemeistert UND auf Raketen-Tempo bestätigt.",
    enDesc: "Bring an entire level to rocket speed — all 20 words mastered AND confirmed at rocket speed.",
    check: (S) => S.goldLevelsCombined >= 1 },
  { id: "j10", cat: "gold", icon: "🥇", de: "Alles Gold!", en: "All Gold!",
    deDesc: "Bringe alle 10 Stufen einer Sprache komplett auf Raketen-Tempo.", enDesc: "Bring all 10 levels of one language fully to rocket speed.",
    check: (S) => S.anyAllGold }
];

/* aggregates everything the 100 checks read, from the two language
   blobs plus the small extras (streaks/speeds/etc.) that don't live
   anywhere else since they're achievement-specific bookkeeping */
function computeStats(data, ach) {
  const words = (L) => Object.values(L.words);
  const de = data.de, en = data.en;
  const wde = words(de), wen = words(en);
  const totalAttempts = wde.reduce((a, w) => a + w.r + w.wr, 0) + wen.reduce((a, w) => a + w.r + w.wr, 0);
  const totalCorrect = wde.reduce((a, w) => a + w.r, 0) + wen.reduce((a, w) => a + w.r, 0);
  const today = tISO();
  const minutesToday = (((de.days[today] || {}).s || 0) + ((en.days[today] || {}).s || 0)) / 60;
  const reachDe = reachLevel(de, LISTS.de), reachEn = reachLevel(en, LISTS.en);
  const starDe = starLevel(de, LISTS.de), starEn = starLevel(en, LISTS.en);
  const lvl10Done = (L, list) => levelStats(L, list)[list.length - 1].mastered >= Math.ceil(list[list.length - 1].length * 0.9);
  return {
    totalAttempts, totalCorrect, totalWrong: totalAttempts - totalCorrect,
    masteredCombined: wde.filter((w) => w.s === 2).length + wen.filter((w) => w.s === 2).length,
    minutesToday,
    bestStreakDays: Math.max(calcStreak(de.days), calcStreak(en.days)),
    reachMax: Math.max(reachDe, reachEn),
    bothReach10: reachDe === 10 && reachEn === 10,
    starMax: Math.max(starDe, starEn),
    fullCurriculumDone: (starDe === 10 && lvl10Done(de, LISTS.de)) || (starEn === 10 && lvl10Done(en, LISTS.en)),
    rocketWordsCombined: wde.filter((w) => w.tn && tiOf(w.tn) === 2).length + wen.filter((w) => w.tn && tiOf(w.tn) === 2).length,
    goldLevelsCombined: LISTS.de.filter((lvl) => isGoldLevel(de, lvl)).length + LISTS.en.filter((lvl) => isGoldLevel(en, lvl)).length,
    anyAllGold: LISTS.de.every((lvl) => isGoldLevel(de, lvl)) || LISTS.en.every((lvl) => isGoldLevel(en, lvl)),
    bothTried: wde.some((w) => w.r + w.wr > 0) && wen.some((w) => w.r + w.wr > 0),
    bestStreakEver: ach.bestStreak || 0,
    perfectSpeeds: ach.perfectSpeeds || {},
    hadPerfectChunk: Object.keys(ach.perfectSpeeds || {}).length > 0,
    chunksDone: ach.chunksDone || 0,
    speedChanged: !!ach.speedChanged
  };
}
const freshAch = () => ({ unlocked: {}, bestStreak: 0, perfectSpeeds: {}, chunksDone: 0, speedChanged: false });
/* returns the list of achievement objects that just became true and
   weren't already unlocked — caller merges these into ach.unlocked */
function checkNewUnlocks(data, ach) {
  const S = computeStats(data, ach);
  return ACHIEVEMENTS.filter((a) => !ach.unlocked[a.id] && a.check(S));
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
function Badge({ a, unlocked, lang, onTap }) {
  return (
    <button onClick={() => onTap(a)} className="bigbtn" style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 76,
      opacity: unlocked ? 1 : 0.38, filter: unlocked ? "none" : "grayscale(1)",
      background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit"
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16, background: unlocked ? "#FFF3D6" : "#EEF3F8",
        border: `2px solid ${unlocked ? C.gold : "#C9D6E2"}`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 27, flexShrink: 0
      }}>{unlocked ? a.icon : "🔒"}</div>
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
  const [phase, setPhase] = useState("load");   // load|home|play|chunkend|levelup|gold|stack|parent|achievements|vowel|vdone
  const [vq, setVq] = useState([]);             // Vokal-Blitz round
  const [vi, setVi] = useState(0);
  const [vfb, setVfb] = useState(null);
  const vScore = useRef({ r: 0, n: 0 });
  const vAt = useRef(0);
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
  const pendingLvl = useRef(null);
  const saveT = useRef({});
  const backRef = useRef("home");
  const chunkRef = useRef({ q: 0, right: 0, coins: 0, sec: 0, mast: [], reach0: 1 });
  const modeRef = useRef({ t: "normal", lvl: 0 });
  const pendingGold = useRef(null);

  /* checks the 100 badges against the given data (+ current ach
     extras), merges any newly-true ones into ach, persists, and
     queues them for the unlock toast — called after anything that
     could move a stat: an answer, a chunk ending, a speed change */
  const runAchCheck = (newData) => {
    const newly = checkNewUnlocks(newData, achRef.current);
    const updated = { ...achRef.current, unlocked: { ...achRef.current.unlocked } };
    newly.forEach((a) => { updated.unlocked[a.id] = tISO(); });
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
      setAch({ ...freshAch(), ...(savedAch || {}) });
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
    vScore.current = { r: 0, n: 0 };
    vAt.current = Date.now();
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
       "active time" is the sum of response windows, never wall clock */
    const day = L.days[tISO()] || (L.days[tISO()] = { s: 0, b1: 0, b2: 0 });
    day.s += Math.min((Date.now() - vAt.current) / 1000, 12);
    trimDays(L.days);
    const newData = { ...prev, [lg]: L };
    dataRef.current = newData;
    setData(newData);
    scheduleSave(lg);
    vScore.current = { r: vScore.current.r + (ok ? 1 : 0), n: vScore.current.n + 1 };
    if (sndRef.current) { ok ? sfx.ok() : sfx.no(); }
    setVfb({ ok, chosen: opt });
    sayWord(item.word);
    setTimeout(() => {
      if (vi + 1 >= vq.length) { setPhase("vdone"); return; }
      vAt.current = Date.now();
      setVi(vi + 1); setVfb(null);
      sayWord(vq[vi + 1].word);
    }, 1500);
  };

  useEffect(() => {
    if (phase !== "play") return;
    let t;
    if (stage === "fix") t = setTimeout(() => setStage("word"), 500);
    else if (stage === "word") t = setTimeout(() => { tilesAt.current = Date.now(); setStage("answer"); }, DUR[effSpeed()]);
    else if (stage === "fb") t = setTimeout(() => {
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
        const a2 = { ...achRef.current, chunksDone: (achRef.current.chunksDone || 0) + 1 };
        if (modeRef.current.t !== "turbo" && perfect) {
          a2.perfectSpeeds = { ...a2.perfectSpeeds, [speedRef.current]: true };
        }
        achRef.current = a2;
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
    }, fb && fb.ok ? 950 : 1900);
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
    const active = DUR[eff] / 1000 + resp;
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
      if (runRef.current > achRef.current.bestStreak) achRef.current = { ...achRef.current, bestStreak: runRef.current };
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

    const day = L.days[today] || (L.days[today] = { s: 0, b1: 0, b2: 0 });
    day.s += active;
    let bonus = 0;
    if (day.s >= 900 && !day.b1) { day.b1 = 1; bonus += 10; }
    if (day.s >= 1500 && !day.b2) { day.b2 = 1; bonus += 25; }
    earned += bonus;
    L.coins += earned;
    trimDays(L.days);

    if (!turbo) {
      const after = starLevel(L, list);
      if (after > before) pendingLvl.current = after;
    } else if (isGoldLevel(L, list[modeRef.current.lvl])) {
      pendingGold.current = modeRef.current.lvl + 1;
    }

    const ch = chunkRef.current;
    ch.q++; ch.sec += active; ch.coins += earned;
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
  const openAch = (from) => { backRef.current = from; setSelectedAch(null); setPhase("achievements"); };
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
                if (!achRef.current.speedChanged) {
                  achRef.current = { ...achRef.current, speedChanged: true };
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

        <button onClick={() => openAch("home")} className="bigbtn" style={{
          position: "absolute", bottom: 12, left: 12, width: 56, height: 56, fontSize: 26,
          ...cardSt, borderRadius: 18, cursor: "pointer"
        }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            🏆
            <span style={{
              position: "absolute", bottom: -18, right: -22, background: C.gold, color: "#fff",
              fontSize: 11, fontWeight: 900, borderRadius: 10, padding: "1px 6px", border: "2px solid #fff"
            }}>{Object.keys(ach.unlocked).length}</span>
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
          <span style={{ fontSize: "clamp(52px,11vw,92px)", fontWeight: 800, letterSpacing: TRACK }}>
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
    const fullExport = JSON.stringify({ de: data.de, en: data.en, meta: { lang, speed, snd } });

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
            Hier exportieren, in der neuen Version einfügen und dort importieren. Enthält beide Sprachen.
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
    const unlockedCount = Object.keys(ach.unlocked).length;
    return (
      <div className="bw" style={{ ...wrap, alignItems: "stretch", padding: 14, gap: 14, overflowY: "auto" }}>
        <style>{css}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPhase(backRef.current)} className="bigbtn"
            style={{ ...cardSt, width: 56, height: 56, fontSize: 24, borderRadius: 18, cursor: "pointer" }}>⬅</button>
          <span style={{ fontSize: 30 }}>🏆</span>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{S.ach}</div>
          <div style={{ flex: 1 }} />
          <div style={{ ...cardSt, padding: "8px 16px", fontSize: 18, fontWeight: 800, borderRadius: 18, background: "#FFF3D6", color: "#8A5A00" }}>
            {unlockedCount}/100
          </div>
        </div>

        {CAT_ORDER.map((c) => {
          const items = ACHIEVEMENTS.filter((a) => a.cat === c);
          const gotN = items.filter((a) => ach.unlocked[a.id]).length;
          return (
            <div key={c} style={{ ...cardSt, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{CAT_NAMES[c][lang === "de" ? 0 : 1]}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#8CA0B5" }}>{gotN}/10</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-start" }}>
                {items.map((a) => (
                  <Badge key={a.id} a={a} unlocked={!!ach.unlocked[a.id]} lang={lang} onTap={setSelectedAch} />
                ))}
              </div>
            </div>
          );
        })}
        <AchievementInfo a={selectedAch} unlockedOn={selectedAch ? ach.unlocked[selectedAch.id] : null} lang={lang} onClose={() => setSelectedAch(null)} />
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
        <div style={{ flex: 1, height: 10, background: "#D6E4F2", borderRadius: 6, overflow: "hidden", margin: "0 4px" }}>
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
          <span style={{
            fontSize: "clamp(56px,11vw,92px)", fontWeight: 800, letterSpacing: TRACK,
            color: fb.ok ? C.green : C.ink, animation: "bwPop .35s ease-out"
          }}>
            {fb.ok ? "✓ " : ""}{target}{fb.mastered ? (modeRef.current.t === "turbo" ? " 🚀" : " ⭐") : ""}
          </span>
        )}
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

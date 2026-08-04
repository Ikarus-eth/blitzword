/* Artwork for the Tier-Blitz mini-game (the Krogufant Klappbilderbuch idea).
   NOT yet wired into the app — App.jsx does not import or inline this yet.
   It lives here as the single source of truth for the drawings, because it is
   the one part of that feature that cost several rounds of look-and-fix and
   cannot be recreated deterministically from a spec.

   Every animal is drawn ONCE on a shared body plan; the three strips are cut
   out of that one drawing with the viewBox. That is why any head/body/rear
   combination joins at the seams — the same trick the book uses, where all the
   animals are drawn to one template before the page is cut.

     viewBox 0 0 120 180
       band 0  y   0..60   head + neck             neck crosses y=60 at x 47..73
       band 1  y  60..120  chest + forelimbs       body crosses y=120 at x 33..87
       band 2  y 120..180  rump + hind legs + tail
   Only those two crossings are fixed. Everything between them is free, which is
   what lets a flamingo and an elephant differ wildly and still line up.

   Preview:  node tools/preview-art.mjs  ->  sheet.svg
   (contact sheet: all eight animals, sample hybrids, a seam-overlay check, and
   the strips at answer-tile size)
*/

const INK = "#22314A";
const P = (d, fill, x) => ["path", { d, fill, ...(x || {}) }];
const C_ = (cx, cy, r, fill, x) => ["circle", { cx, cy, r, fill, ...(x || {}) }];
const E = (cx, cy, rx, ry, fill, x) => ["ellipse", { cx, cy, rx, ry, fill, ...(x || {}) }];
const NO = { stroke: "none" };
/* a limb/tail drawn as an ink stroke with the colour laid over it — far less
   path data than outlining a tapered shape, and the join stays round */
const LIMB = (d, fill, w) => [
  ["path", { d, fill: "none", stroke: INK, strokeWidth: w + 3.4, strokeLinecap: "round" }],
  ["path", { d, fill: "none", stroke: fill, strokeWidth: w, strokeLinecap: "round" }]
];

const NECK = "M47,60 V46 Q47,36 60,36 Q73,36 73,46 V60 Z";
const TORSO = "M47,58 Q33,66 31,86 Q29,104 33,120 H87 Q91,104 89,86 Q87,66 73,58 Z";
const RUMP = "M33,120 Q28,131 32,142 Q41,149 60,149 Q79,149 88,142 Q92,131 87,120 Z";

/* eye that reads at thumbnail size: white, pupil, and a highlight */
const EYE = (x, y, r) => [
  C_(x, y, r, "#fff"),
  C_(x + 0.4, y + 0.4, r * 0.48, INK, NO),
  C_(x - r * 0.3, y - r * 0.35, r * 0.2, "#fff", NO)
];

/* forelimbs hanging at the sides, drawn before the torso so they emerge from
   behind it. An earlier version tucked two paws against the chest; together
   with the chest patch they read unmistakably as a pair of closed eyes. */
const ARMS = (fill, k) => {
  const one = (m) => {
    const f = (x) => (m ? 120 - x : x);
    return [
      ...LIMB(`M${f(44)},68 Q${f(30)},82 ${f(26)},100`, fill, 10 * k),
      E(f(26), 106, 9.5 * k, 7.5 * k, fill),
      P(`M${f(19)},106 Q${f(26)},110 ${f(33)},106`, "none", { stroke: INK, strokeWidth: 1.5 }),
      P(`M${f(21)},101 Q${f(26)},104 ${f(31)},101`, "none", { stroke: INK, strokeWidth: 1.3 })
    ];
  };
  return [...one(false), ...one(true)];
};

/* hind legs. k scales the leg, so a flamingo and an elephant come off the same
   template and still put their feet on the same line. Drawn before the rump so
   the rump covers the hip joint. */
const HIND = (fill, k) => {
  const one = (m) => {
    const f = (x) => (m ? 120 - x : x);
    const o = 33 + (1 - k) * 7, i = 51 - (1 - k) * 7, mid = (o + i) / 2;
    return [
      P(`M${f(o)},124 Q${f(o - 1)},150 ${f(o)},166 Q${f(o)},175 ${f(mid)},175 Q${f(i)},175 ${f(i)},166 Q${f(i + 1)},148 ${f(i)},124 Z`, fill),
      P(`M${f(o + 1)},169 Q${f(mid)},174 ${f(i - 1)},169`, "none", { stroke: INK, strokeWidth: 1.5 })
    ];
  };
  return [...one(false), ...one(true)];
};

const spots = (pts, fill) => pts.map(([x, y, r]) => E(x, y, r, r * 0.82, fill, NO));

/* ------------------------------ the eight ------------------------------ */

export const ANIMALS = {
  krokodil: {
    key: "krokodil", tint: "#6CBF4A",
    head: () => [
      P(NECK, "#6CBF4A"),
      ...spots([[52, 50, 2.6], [66, 52, 2.4], [59, 44, 2.4]], "#4E9B33"),
      P("M36,27 Q36,13 53,13 H66 Q79,13 84,23 L112,29 Q119,31 119,36 Q119,41 112,43 L84,49 Q79,57 66,57 H53 Q36,57 36,43 Z", "#6CBF4A"),
      P("M84,42 L112,38", "none", { stroke: INK, strokeWidth: 1.6 }),
      P("M88,42 L91,48 L94,42 Z", "#fff"),
      P("M97,41 L100,47 L103,41 Z", "#fff"),
      P("M106,40 L109,45 L112,40 Z", "#fff"),
      E(48, 16, 11, 9, "#6CBF4A"),
      E(70, 15, 9, 7.5, "#6CBF4A"),
      C_(48, 16, 5.4, "#F6A500"),
      E(48, 16, 1.9, 4.6, INK, NO),
      C_(70, 15, 4.4, "#F6A500"),
      E(70, 15, 1.6, 3.8, INK, NO),
      E(110, 33, 2.6, 2, "#4E9B33", NO),
      ...spots([[60, 30, 2.4], [70, 34, 2.2], [80, 30, 2]], "#4E9B33")
    ],
    body: () => [
      P(TORSO, "#6CBF4A"),
      E(60, 96, 20, 19, "#D7EFB6", NO),
      ...spots([[38, 74, 3], [46, 68, 2.6], [82, 74, 3], [74, 68, 2.6], [35, 92, 2.8], [85, 92, 2.8]], "#4E9B33"),
      ...ARMS("#6CBF4A", 1)
    ],
    rear: () => [
      ...LIMB("M84,128 Q107,134 111,154 Q113,171 101,175", "#6CBF4A", 11),
      P("M96,133 L99,127 L102,134 Z", "#4E9B33", NO),
      P("M106,143 L111,139 L111,147 Z", "#4E9B33", NO),
      ...HIND("#6CBF4A", 1),
      P(RUMP, "#6CBF4A"),
      ...spots([[44, 132, 3.2], [60, 128, 3], [76, 132, 3.2], [52, 143, 2.8], [68, 143, 2.8]], "#4E9B33")
    ]
  },

  elefant: {
    key: "elefant", tint: "#A9B4BE",
    head: () => [
      P("M42,14 Q14,8 9,30 Q5,52 26,55 Q40,56 45,42 Z", "#8794A0"),
      P("M78,14 Q106,8 111,30 Q115,52 94,55 Q80,56 75,42 Z", "#8794A0"),
      P(NECK, "#A9B4BE"),
      E(60, 28, 22, 21, "#A9B4BE"),
      P("M48,44 Q43,52 46,58", "none", { stroke: INK, strokeWidth: 5.4, strokeLinecap: "round" }),
      P("M48,44 Q43,52 46,58", "none", { stroke: "#fff", strokeWidth: 3.2, strokeLinecap: "round" }),
      P("M72,44 Q77,52 74,58", "none", { stroke: INK, strokeWidth: 5.4, strokeLinecap: "round" }),
      P("M72,44 Q77,52 74,58", "none", { stroke: "#fff", strokeWidth: 3.2, strokeLinecap: "round" }),
      ...LIMB("M60,40 Q57,51 62,57 Q68,60 70,54", "#A9B4BE", 9.5),
      ...EYE(49, 25, 4.4),
      ...EYE(71, 25, 4.4)
    ],
    body: () => [
      P(TORSO, "#A9B4BE"),
      E(60, 95, 20, 18, "#BFC9D2", NO),
      P("M38,72 Q46,66 54,70 M82,72 Q74,66 66,70", "none", { stroke: "#8794A0", strokeWidth: 2 }),
      ...ARMS("#A9B4BE", 1.1)
    ],
    rear: () => [
      ...LIMB("M86,127 Q99,136 97,150", "#A9B4BE", 4),
      C_(97, 153, 3.6, INK, NO),
      ...HIND("#A9B4BE", 1),
      P(RUMP, "#A9B4BE"),
      E(60, 134, 17, 9, "#BFC9D2", NO),
      P("M44,148 Q52,153 60,150 M76,148 Q68,153 60,150", "none", { stroke: "#8794A0", strokeWidth: 1.8 })
    ]
  },

  jaguar: {
    key: "jaguar", tint: "#F2A93B",
    head: () => [
      P("M43,18 L37,3 L56,11 Z", "#F2A93B"),
      P("M77,18 L83,3 L64,11 Z", "#F2A93B"),
      P("M45,15 L42,7 L52,12 Z", "#F7C77E", NO),
      P("M75,15 L78,7 L68,12 Z", "#F7C77E", NO),
      P(NECK, "#F2A93B"),
      C_(60, 31, 22, "#F2A93B"),
      E(60, 40, 12, 8.5, "#FFF3D6", NO),
      P("M55,35 H65 L60,40 Z", INK, NO),
      P("M60,40 Q56,45 51,42 M60,40 Q64,45 69,42", "none", { stroke: INK, strokeWidth: 1.8 }),
      ...EYE(51, 27, 4.6),
      ...EYE(69, 27, 4.6),
      ...spots([[45, 17, 2.6], [75, 17, 2.6], [52, 46, 2], [68, 46, 2], [60, 15, 2.4], [48, 36, 1.8], [72, 36, 1.8]], INK),
      P("M40,40 L30,37 M40,44 L31,44 M80,40 L90,37 M80,44 L89,44", "none", { stroke: INK, strokeWidth: 1.3 })
    ],
    body: () => [
      P(TORSO, "#F2A93B"),
      E(60, 96, 19, 18, "#FFF3D6", NO),
      ...spots([[38, 72, 3.4], [50, 66, 2.8], [70, 66, 2.8], [82, 72, 3.4], [34, 90, 3.2], [86, 90, 3.2], [37, 108, 3], [83, 108, 3], [60, 68, 2.6]], INK),
      ...ARMS("#F2A93B", 0.85)
    ],
    rear: () => [
      ...LIMB("M85,129 Q107,134 109,153 Q110,167 99,169", "#F2A93B", 8),
      ...spots([[95, 132, 2.4], [105, 141, 2.4], [107, 156, 2.4]], INK),
      ...HIND("#F2A93B", 0.82),
      P(RUMP, "#F2A93B"),
      ...spots([[44, 130, 3.4], [61, 127, 3], [77, 130, 3.4], [50, 144, 3], [70, 144, 3], [60, 152, 2.6]], INK)
    ]
  },

  giraffe: {
    key: "giraffe", tint: "#E8B96A",
    head: () => [
      P("M47,60 L52,27 Q53,19 60,19 Q68,19 69,27 L73,60 Z", "#E8B96A"),
      ...LIMB("M55,11 L53,4", "#E8B96A", 3),
      C_(53, 3, 3.4, "#B07A2E"),
      ...LIMB("M67,11 L69,4", "#E8B96A", 3),
      C_(69, 3, 3.4, "#B07A2E"),
      E(44, 16, 6, 4, "#E8B96A"),
      E(76, 16, 6, 4, "#E8B96A"),
      E(60, 17, 14, 10, "#E8B96A"),
      E(60, 23, 8, 5.5, "#F6DDAE", NO),
      ...spots([[57, 24, 1.4], [63, 24, 1.4]], INK),
      ...EYE(53, 14, 3.4),
      ...EYE(67, 14, 3.4),
      ...spots([[55, 34, 3.4], [66, 40, 3.4], [55, 48, 3.6], [67, 54, 3], [59, 42, 2.4]], "#B07A2E")
    ],
    body: () => [
      P(TORSO, "#E8B96A"),
      ...spots([[40, 72, 5], [60, 68, 4.4], [80, 72, 5], [35, 90, 4.6], [85, 90, 4.6], [48, 86, 4], [72, 86, 4], [38, 108, 4.4], [82, 108, 4.4], [60, 100, 4]], "#B07A2E"),
      ...ARMS("#E8B96A", 0.7)
    ],
    rear: () => [
      ...LIMB("M86,127 Q97,139 95,151", "#E8B96A", 3.4),
      C_(95, 155, 4.2, "#5B4327", NO),
      ...HIND("#E8B96A", 0.72),
      P(RUMP, "#E8B96A"),
      ...spots([[44, 130, 4.6], [62, 127, 4.2], [78, 131, 4.4], [50, 146, 4], [72, 146, 4], [61, 141, 3.6]], "#B07A2E")
    ]
  },

  flamingo: {
    key: "flamingo", tint: "#F58BAE",
    head: () => [
      P("M47,60 C44,44 49,29 56,18 L68,23 C63,33 61,46 73,60 Z", "#F58BAE"),
      E(59, 15, 11, 9.5, "#F58BAE"),
      P("M52,13 Q36,15 30,24 Q42,29 55,21 Z", "#F6A500"),
      P("M30,24 Q35,26 39,24.5 L35,19 Q31,21 30,24 Z", INK, NO),
      ...EYE(60, 12, 3.4)
    ],
    body: () => [
      P(TORSO, "#F58BAE"),
      P("M33,74 Q52,64 64,76 Q74,88 66,104 Q52,112 40,102 Q31,90 33,74 Z", "#F7A6C2", NO),
      P("M38,80 Q50,76 60,84 M36,92 Q49,88 60,96 M38,104 Q50,100 60,106", "none", { stroke: "#E0708F", strokeWidth: 1.8 }),
      ...ARMS("#F58BAE", 0.55)
    ],
    rear: () => [
      P("M84,124 Q104,124 110,136 Q100,142 86,138 Z", "#F7A6C2"),
      ...HIND("#F58BAE", 0.42),
      P(RUMP, "#F58BAE"),
      P("M42,138 Q52,132 62,138 M60,148 Q70,142 80,148", "none", { stroke: "#E0708F", strokeWidth: 1.8 })
    ]
  },

  gorilla: {
    key: "gorilla", tint: "#565058",
    head: () => [
      C_(35, 31, 6.5, "#565058"),
      C_(85, 31, 6.5, "#565058"),
      P(NECK, "#565058"),
      P("M38,29 Q38,8 60,8 Q82,8 82,29 Q82,52 60,52 Q38,52 38,29 Z", "#565058"),
      P("M42,25 Q60,15 78,25 Q60,21 42,25 Z", "#3C373F", NO),
      E(60, 36, 17, 14, "#7A727E", NO),
      ...spots([[55, 35, 2.2], [65, 35, 2.2]], INK),
      P("M50,44 Q60,49 70,44", "none", { stroke: INK, strokeWidth: 2 }),
      ...EYE(52, 28, 3.8),
      ...EYE(68, 28, 3.8)
    ],
    body: () => [
      P("M47,58 Q30,64 28,84 Q27,104 33,120 H87 Q93,104 92,84 Q90,64 73,58 Z", "#565058"),
      E(60, 94, 19, 19, "#7A727E", NO),
      P("M40,74 Q48,66 58,70 M80,74 Q72,66 62,70", "none", { stroke: "#3C373F", strokeWidth: 2.2 }),
      ...ARMS("#565058", 1.15)
    ],
    rear: () => [
      ...HIND("#565058", 1),
      P(RUMP, "#565058"),
      E(60, 133, 16, 8, "#7A727E", NO),
      P("M44,146 Q52,151 60,148 M76,146 Q68,151 60,148", "none", { stroke: "#3C373F", strokeWidth: 2 })
    ]
  },

  zebra: {
    key: "zebra", tint: "#FFFFFF",
    head: () => [
      P("M47,60 L50,32 Q52,22 60,22 Q68,22 70,32 L73,60 Z", "#fff"),
      P("M52,30 L47,36 L53,37 L48,44 L54,45 L49,52 L55,53 L52,60 L58,60 Q56,44 57,31 Z", INK, NO),
      P("M47,11 L41,1 L54,8 Z", "#fff"),
      P("M73,11 L79,1 L66,8 Z", "#fff"),
      P("M45,19 Q45,4 60,4 Q75,4 75,19 Q75,27 68,31 Q60,34 52,31 Q45,27 45,19 Z", "#fff"),
      E(60, 29, 10, 7.5, "#E4E9EE", NO),
      ...spots([[56, 29, 1.5], [64, 29, 1.5]], INK),
      ...EYE(52, 17, 3.8),
      ...EYE(68, 17, 3.8),
      P("M60,4 Q56,0 52,3 Q57,2 60,6 Z", INK, NO),
      P("M46,22 Q53,19 57,24 M74,22 Q67,19 63,24 M47,12 Q54,9 58,13 M73,12 Q66,9 62,13", "none", { stroke: INK, strokeWidth: 2.2 })
    ],
    body: () => [
      P(TORSO, "#fff"),
      P("M33,70 Q45,66 52,72 Q44,74 34,78 Z M87,70 Q75,66 68,72 Q76,74 86,78 Z M31,86 Q46,82 56,88 Q44,92 30,94 Z M89,86 Q74,82 64,88 Q76,92 90,94 Z M31,102 Q46,98 58,104 Q44,108 32,110 Z M89,102 Q74,98 62,104 Q76,108 88,110 Z", INK, NO),
      ...ARMS("#fff", 0.8)
    ],
    rear: () => [
      ...LIMB("M86,127 Q97,138 95,150", "#fff", 3.4),
      C_(95, 154, 4.4, INK, NO),
      ...HIND("#fff", 0.8),
      P(RUMP, "#fff"),
      P("M34,128 Q48,124 58,130 Q46,134 33,136 Z M86,128 Q72,124 62,130 Q74,134 87,136 Z M36,144 Q50,140 60,146 Q48,150 37,151 Z M84,144 Q70,140 60,146 Q72,150 83,151 Z", INK, NO)
    ]
  },

  kamel: {
    key: "kamel", tint: "#D9B47C",
    head: () => [
      P("M47,60 C46,44 48,32 54,24 Q58,19 66,19 Q74,19 75,29 L73,60 Z", "#D9B47C"),
      E(55, 13, 5.4, 4, "#D9B47C"),
      E(70, 10, 5.4, 4, "#D9B47C"),
      E(65, 19, 14.5, 10.5, "#D9B47C"),
      P("M76,13 Q90,15 90,25 Q88,32 79,30 Q73,27 74,20 Q75,15 76,13 Z", "#EFD7B0"),
      ...spots([[85, 19, 1.6], [88, 23, 1.4]], INK),
      P("M78,27 Q84,31 89,27", "none", { stroke: INK, strokeWidth: 1.7 }),
      ...EYE(62, 15, 4),
      P("M58,10 L56,6 M62,9 L61,5 M66,9 L66,5", "none", { stroke: INK, strokeWidth: 1.7 })
    ],
    body: () => [
      P(TORSO, "#D9B47C"),
      P("M34,78 Q40,58 54,64 Q60,67 66,64 Q80,58 86,78 Q60,70 34,78 Z", "#C79E63"),
      E(60, 100, 18, 15, "#EFD7B0", NO),
      ...ARMS("#D9B47C", 0.75)
    ],
    rear: () => [
      ...LIMB("M86,128 Q95,137 93,147", "#D9B47C", 3.2),
      C_(93, 151, 4, "#8A6B3C", NO),
      ...HIND("#D9B47C", 0.78),
      P(RUMP, "#D9B47C"),
      E(60, 136, 15, 8, "#EFD7B0", NO)
    ]
  }
};

export const ORDER = ["krokodil", "elefant", "jaguar", "giraffe", "flamingo", "gorilla", "zebra", "kamel"];

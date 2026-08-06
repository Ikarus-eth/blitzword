# BlitzWort — design rationale

Why the app works the way it does. `README.md` covers *how to build and deploy*;
this covers *why not to change things casually*. Most rules below exist because a
simpler version was tried first and failed in a specific way.

## Purpose and user

Trains **word-recognition automaticity** — recognising a whole word instantly,
without sounding it out. It is not a phonics app.

The user is a child (~7) who **cannot read instructions**. Everything must be
operable by tapping icons. Interface copy is minimal and in the selected language.
iPad, landscape-first, installed to the home screen as a PWA.

## Core loop

1. **Fixation dot**, 500 ms — centres the gaze so the word lands in foveal vision.
2. **Word flashes** for the slider duration. 10 steps:
   `7500, 5000, 3500, 2500, 1500, 850, 700, 500, 350, 250 ms`, shown as turtle→rocket.
3. **Mask** (`▮▮▮▮`) so the word can't be read after the flash. Always 4 blocks
   regardless of word length — a length-matched mask would leak a cue.
4. **Four answer tiles**; child taps the word he saw.
5. Feedback + **the target word is spoken aloud**, on correct answers as well as
   wrong ones (closes the sound↔print loop at the moment of recognition).
6. **A correct answer advances on its own after 950 ms. A wrong answer does
   not advance at all** — it waits for a continue button.

**Why a miss holds the screen.** The feedback stage used to be a timer: 950 ms
correct, 1900 ms wrong. But a miss is the one moment in the loop where there is
something worth looking at — the word he failed to recognise, spelled correctly,
beside the tile he chose instead — and 1.9 s is not enough to study it, never
mind enough to decide he wants to hear it again. So on a miss the correct word
stays up, **tapping it replays the audio**, and only the continue button moves
on. Correct answers keep their timer: the flow through material he knows should
stay fast, and pausing there would only slow the session down.

This applies identically in all three games. Tests assert the no-auto-advance
behaviour directly — if someone reinstates the timer, `test_hold_on_miss` fails
on the "still on the same word 4 s later" assertion.

## Distractors — the anti-guessing mechanism

This is the heart of the exercise. If distractors were random words, the child could
succeed on word *shape* alone and never read precisely.

- Each target has **3 curated real-word distractors**: same length ±1, shared first
  letter, or minimal-pair swaps (`Haus / Maus / Hals / Halt`).
- Plus **generated pseudo-words** — non-words exactly one confusable letter from the
  target (`hat → het`). Generated at runtime from a per-language confusion map
  (a↔e, b↔d, m↔n, s↔z, t↔d, …), and checked against the *entire* curriculum so a
  generated foil can never collide with a real word he is learning.
- **Per question: 1 or 2 pseudo-words** (coin flip), so 2–3 tiles are always real
  words. Never zero, never three.

## Mastery — five graduated levels, not a flag

Based on Precision Teaching's accuracy-vs-fluency distinction and the RESA framework
(Retention, Endurance, Stability, Application — Binder 1996), plus Vlach et al. 2014
on expanding-interval schedules outperforming equal spacing **specifically for young
children**, whose forgetting curve is steeper.

| level | name | meaning |
|---|---|---|
| 0 | Neu | never answered |
| 1 | Gelernt | ≥1 correct, still building the streak |
| 2 | Flüssig | 3 consecutive correct **and** correct on ≥2 different calendar days |
| 3 | Behalten | survived its first spaced review — genuine retention |
| 4 | Gemeistert | survived every interval out to 30 days — endurance + stability |
| −1 | Wiederholen | was Flüssig+ and a miss knocked it back |

Two points that are easy to get wrong:

- **Flüssig is not mastery.** An earlier version called this "mastered". Per the
  research it is *fluency* — accuracy achieved, but never yet tested by a real gap
  in time. Renaming it was a correctness fix, not cosmetic.
- **Wiederholen must stay visually distinct from Neu.** A lapsed word and a word
  never seen have identical counters but are pedagogically opposite.

**Why 2 calendar days:** with 4 options, 3 consecutive correct answers happen by
chance ~1.6% of the time. Requiring a second day makes luck negligible and forces
overnight consolidation rather than short-term echo.

**Why a third condition — recent accuracy ≥80%.** The 1.6% figure is right for a
*random guesser* and wrong for a partial learner. A word read correctly ~40% of
the time clears 3-in-a-row about 6% of the time per window, and a missed word is
re-queued 3–6 items later, so a session hands out dozens of windows. A real
export had **20 of 70 Flüssig words below 70% lifetime accuracy, one at 39%** —
each then took a spaced-review interval and stopped coming back. Every word
record therefore carries `h`, the last 10 answers as 1/0, and Flüssig now needs
streak **and** two days **and** ≥80% over that window. This does not redefine the
level: DESIGN already called Flüssig "accuracy achieved", and the floor is what
makes that sentence true. Existing saves get `h` seeded from lifetime `r`/`wr` in
`migrate`, otherwise the words that motivated the fix would sail through once
more before enough history existed to stop them. Turbo answers are excluded —
turbo failures must not demote, so they must not depress the floor either.

## Spaced repetition

Intervals **3 → 7 → 14 → 30 days**. A correct review advances one step; a miss
demotes the word to learning and resets the interval. A missed word is *also*
re-queued 3–6 items later in the same session and scheduled for tomorrow.

Due reviews are **interleaved 1 : 2 with new words**, not front-loaded. Front-loading
was tried and made every session open with a wall of previous failures.

## Two separate level gates — deliberate

- **Reach level** (which words enter practice): unlocks at **≥70%** of the previous
  level being mastered *or* "hot" (3 consecutive correct, awaiting its second day),
  **and** that level's pooled recent accuracy ≥70%. The count condition alone let
  three levels open in four days while accuracy fell from 75% to 59% — words
  qualify as hot on a streak, the pool grows, the earlier level never settles. The
  accuracy condition only engages once ≥15 answers exist in the level, so day 1
  can still unlock and the failure below is not reintroduced. A held level is
  shown and explained in the parent dashboard; silently refusing to grow the pool
  reads as a bug.
- **Star level** (celebration + the ⭐ badge): **≥90% fully mastered**, which needs
  two calendar days minimum.

They are separate because gating practice on full mastery made day 1 mathematically
incapable of unlocking anything — 20 words cycled endlessly and felt like five. The
loose gate supplies variety fast; the strict gate keeps the celebration meaningful.

## Typography

Body text and every word the child reads carry extra letter spacing (`TRACK`,
0.14em). Zorzi et al. (PNAS 2012) improved reading in dyslexic children *on the
fly, with no training*, purely by widening inter-letter space; their manipulation
was +2.5 pt on 14 pt text. Wider spacing reduces crowding between neighbouring
letters, and letter identification is the step that has to succeed before word
recognition can start.

This is the only typographic change with evidence behind it. **Do not switch to a
"dyslexia font."** Dyslexie and OpenDyslexic have repeatedly shown no benefit to
reading rate or accuracy (Kuster et al. 2018, n=170; Wery & Diliberto 2017), and
the one study that did find a benefit traced it to that font's spacing rather
than its letterforms. Keep a double-storey `a` — a single-storey form sits much
closer to `o`, and a/e and a/o are among the most confused pairs in the data.

## Sessions

A chunk ends at **~2.5 min of work or 50 questions**, whichever first, where
work is `DUR[speed] + response` summed over the questions. That is a measure of
*material got through*, not of time at the iPad, and it is deliberately not the
same number as the daily active time below — pacing a chunk by the clock would
quietly shorten it from ~50 questions to ~27, because the clock also counts the
stages between questions. The two are separated in `answer()` as `work` and
`active`; `test_active_time` pins the chunk to `work`.

Chunk end shows: a random encouragement phrase, accuracy, coins earned, any newly
mastered words, a "new words unlocked" banner, and the speed nudge.

**Adaptive speed nudge:** ≥90% accuracy over ≥8 answers suggests one step faster;
<60% suggests one step slower. One tap applies it. A 7-year-old will not calibrate
the slider himself, and automaticity training works just below the ceiling.

## Vokal-Blitz — a second exercise, not a change to the core loop

The reading loop above stays exactly what it is. This is a separate mode behind
its own button.

**Why it exists.** 28% of all wrong tiles in a real export were vowel-only swaps
with the consonant frame intact — `nicht→necht`, `von→vun`, `Buch→Boch`,
`kann→kenn`. The consonant skeleton is being read and the vowel guessed. In
English that half-works. German vowels carry full information and cannot be
inferred from the frame, so the vowel needs training directly.

- The word is **heard, not flashed**. The question is "which vowel was in the
  word you just heard" — grapheme identity, not speed. No fixation dot, no mask,
  no speed tier.
- **Digraphs stay whole** (`ei`, `au`, `ie`, `eu`…). Asking a child to pick half
  of a sound teaches the wrong unit.
- Foils that would spell a real curriculum word are dropped, same rule as
  `fakeWord`.
- The queue weights toward words where he has actually made a vowel-only miss.
- **Results live in `ws.vk` and never touch `s`/`cc`/`iv`/`due`/`h`.** A different
  skill must not move the spaced-repetition schedule or feed the two accuracy
  gates. There is a test that asserts exactly this.

**No colour cue while the question is open.** The blank is a grey block. Colour
appears only in the feedback, after the answer is locked in. Two reasons: the
foils are single-vowel substitutions of equal length, so colouring the vowel
would make every tile solvable by colour-matching without reading a letter — the
app would be measuring colour discrimination and scoring it as reading. And early
readers latch onto salient irrelevant cues (Ehri's phases; Pullen & Lane
recommend single-colour letter sets for this reason), with learners cued during
practice but not at test performing worst of all.

## Buchstaben-Blitz — a temporary drill, not a permanent mode

`b` and `d` are the same shape mirrored; `m` and `n` are the same arch once or
twice. That is a looking problem, not a reading problem, and the main loop is
the wrong place to fix it: a b/d contrast appears in roughly one question in
six, so 50 reps on the pair would cost ~300 questions. A real export had 36
errors across those two pairs, 21 of them b/d, against 683 total answers.

- **It appears only while a shape pair is above threshold** (≥8 errors) and
  disappears when the pair stops costing answers. A permanent extra button on
  the start screen is a cost paid by every child who doesn't need one. The
  launcher is labelled with the pair itself — `b d` — so there is nothing to
  decode.
- **Only letterform pairs.** Vowel confusions go to Vokal-Blitz; word-final
  devoicing is not a looking problem and belongs nowhere near this.
- **Flash and mask, same mechanic as the main loop.** A side-by-side matching
  task would be solvable by comparing two shapes without ever identifying a
  letter. The mask forces him to encode *which* letter it was.
- **Difficulty climbs inside the round while the pair stays fixed:** bare
  letters → syllables (`da`/`ba`) → real curriculum words against their
  one-letter pseudo-word (`der`/`ber`). Words he has actually missed on that
  pair are ordered first.
- **Exposure follows the speed slider**, like the main loop. The within-round
  ramp is a relative step down the same `DUR` table (+0 / +1 / +2 indices), not
  fixed milliseconds — so it stays a ramp at every setting rather than being a
  ramp at some and a wall at others. The slider is the child's one difficulty
  control; a game that ignores it is a game he can't make easier when stuck.
- **A pair retires** once the drill shows 20 answers at ≥90%, and the launcher
  disappears. This is load-bearing: `mx` is a lifetime tally that only grows, so
  without retirement a pair that crossed the threshold once could never fall
  back under it however well he read afterwards, and the "temporary" drill would
  be permanent. Retirement is also what awards `l10`.
- **The Bett anchor** opens a b/d round: `b 🛏 d`, the standard German classroom
  cue — b is the headboard, d the footboard. Shown once before the round, never
  during it, so it stays a memory hook rather than an on-screen crutch. No
  equivalent is invented for the other pairs; they open straight into the round.
- **Scoring lives in `L.lp[pair]`**, at language level rather than per word,
  because most items (bare letters, syllables) are not curriculum words at all.
  It never touches `s`/`cc`/`iv`/`due`/`h`. There is a test asserting this.

## Tier-Blitz — reading a word that cannot be recognised

Sara Ball's flip-book `Krogufant` cuts each animal into three strips and cuts
the name with them, so Kro(kodil) + (Ja)gu(ar) + (Ele)fant assembles into a
creature and a pronounceable word at the same time. That is the whole idea, and
it happens to solve a problem the rest of the app cannot.

**Why a nonsense word.** Every other reading task here can in principle be
passed on familiarity. That is not a flaw — recognising a whole word instantly
*is* the skill being trained, and the distractor design is what stops shape
alone from carrying him. But a made-up name has never been seen before, so
there is no stored form to match against and the only route through is the
syllables. A curriculum word answered correctly is ambiguous evidence: it may
have been read or it may have been recognised. `Flarildil` is not ambiguous.

- **Flash and mask, like the main loop.** Without them this collapses into a
  matching task: name on screen, strips on screen, compare. The creature and
  the tiles are therefore not rendered until the mask has come down, and a test
  asserts they are absent while the name is up.
- **Exposure ramps the other way from the b/d drill**, opening long and working
  down. It first shipped ending at `DUR[speed]` — the same exposure as `der` —
  which at slider 7 meant 500 ms for a word like `Flarildil`. That is not
  readable, so guessing was the correct strategy on the last items of every
  round. It now runs `DUR[speed-4] → DUR[speed-3] → DUR[speed-2]`, so the
  fastest item is still two to three times a curriculum word. Relative to the
  slider for the same reason every other ramp is: the slider is his one
  difficulty control.
- **The open slot rotates, and the medial one is hardest.** Word-initial and
  word-final fragments sit at an edge, where letters are least crowded and
  position is unambiguous. The middle has neither advantage, so it is neither
  first nor over-represented.
- **Sixteen animals in German, ten in English.** The pools are separate so one
  language can grow without waiting on the other. Depth is not only variety: the
  partner tile is the animal whose fragment is closest to the right one, so a
  deeper pool more often finds one matching both the initial and the length, and
  the closer the partner, the less a single letter is worth. Ten of the sixteen
  were painted over an existing animal's vector rather than drawn from scratch —
  a pelican over the flamingo, a scorpion over the crocodile — which keeps the
  body raster by construction and costs no new vector work. Every one still
  spells its own name: Schild+krö+te, Tin+ten+fisch, Skor+pi+on.

  **English takes only the ten whose English name also has three syllables**, and
  needs no new artwork for it: Cro-co-dile, El-e-phant, Ja-gu-ar, Fla-min-go,
  Go-ril-la, Pe-li-can, Chim-pan-zee, Drag-on-fly, Scor-pi-on, Oc-to-pus. Six
  drop out on syllable count alone — giraffe, parrot, rabbit, tortoise and camel
  have two, tarantula has four — and stay German-only. Elephant's middle is the
  single letter `e`, so `MIX_MIN_FRAG` keeps it out of the answer position
  there, the mirror of what `E` does in German slot 0.

  **English measures worse than German and structurally so: 44% against 32%**,
  both against a floor of 25%. Its fragment initials are nearly all unique —
  slot 0 reads C, E, J, F, G, P, C, D, S, O, with only Cro and Chim sharing one —
  so the partner tile rarely matches the initial, and one letter is enough to
  narrow the four tiles to the right pair. That is a property of the English
  animal names, not of the selection rule; only more English animals move it.
  Stachelschwein / porcupine is the one clean candidate found so far. Känguru,
  Kakadu and Kolibri all collide in German (`gu` against Jaguar, `Ka` against
  Kaninchen, `li` against Pelikan).
- **Every animal has exactly three syllables.** Zebra (Ze-bra) and Kamel
  (Ka-mel) have two, and filling three slots from two syllables forced a
  doubled fragment: a whole zebra spelled `Zebrabra` next to a picture of a
  real zebra. For 508 of 512 combinations that was harmless nonsense; for those
  four it was a real animal shown with a wrong spelling, which is the one thing
  this mode must not teach. Both were dropped.
- **Within any slot all fragments are distinct.** If two animals shared one, a
  name would have two correct builds and a wrong tile would still be right.
- **A one-letter fragment is never the answer.** Elefant is E-le-fant, and `E`
  in slot 0 would be solvable on length alone, so `MIX_MIN_FRAG` keeps it out
  of the answer position there. The strip still appears everywhere and
  Krogufant is unaffected, because Elefant contributes `fant` in slot 2.

### Distractors — where the first version lost

The mode shipped with the other animals' real fragments as foils, ranked by
letter overlap. Measured against that build, a child who remembered **only the
initial letter of each syllable answered 83% of items correctly** — 92% with
word length as well, against 25% for guessing. Sixteen of the twenty-four
possible items were decided by one letter. That matches what actually happened
in use: he was guessing and mostly getting away with it.

**This is structural, not a tuning problem.** Within a slot every fragment must
be distinct, so real animal names cannot supply four foils that share an
initial. Enlarging the pool makes it worse: at ten animals `Ka` collides in
slot 0, at twelve `la` collides in slot 2, at fourteen `li` collides in slot 1.
Duplicate fragments arrive before shared initials do.

So the foils are generated, off the same `SUB` confusion map the reading loop
uses for its pseudo-words — the mechanism DESIGN already calls the heart of the
exercise, and the one thing Tier-Blitz was missing. A foil **keeps the first
letter and the length** and swaps exactly one interior letter.

**Four tiles, two animals, two spellings each.** The picture cannot decide it,
because each animal appears twice. The first letter cannot decide it, because
both foils keep it. Only the interior letters can. Two animals rather than one:
with a single animal on all four tiles the picture would name the answer and
the flash would be redundant. Two real spellings rather than one: if exactly
one tile carried a real fragment he could pick the one he recognises without
reading the name at all.

Measured on the rebuilt game across 90 sampled items: **0 decided by the
initial alone, 0 by length alone**, and the initial-letter-only strategy drops
from 83% to 32% against a floor of 25%. It is not 25% exactly because the
partner cannot always match both the initial and the length of the right
fragment — that is what the pool size buys. At six animals the same measurement
gave 44%; at sixteen it gives 32%.

The scoring that picks the partner weights the initial above the length, and
that ordering was measured rather than assumed: weighting the two equally let
the sorter choose a same-length partner with a different initial and pushed the
figure back up to 37%. `test_animal_mix` reads the correct tile off the feedback
colouring and asserts both counts are zero rather than merely lower.

- **Two slots open in the back half of the round.** Six creatures with one slot,
  then two creatures with both slots open and **one flash between them**. Holding
  two syllables from a single look forces more of the name to be read than
  whichever slot happens to fall open, and a guess has to come off twice.
- **Scoring lives in `L.tm`**, at language level like `L.lp`, holding `r`,
  `wr`, a per-animal tally and the Krogufant flag. It never touches
  `s`/`cc`/`iv`/`due`/`h`/`r`/`wr`/`tn`/`d`, and no word record is created: a
  placed strip is not a claim about having read a curriculum word. Animal names
  are not curriculum words at all. `test_animal_mix` diffs every word record
  across a whole round and fails on any drift.
- **The launcher is permanent**, unlike the b/d drill. That one is remedial and
  disappears when the pair stops costing answers; this is not fixing an error
  he is making, so there is nothing for it to retire against. Labelled with a
  Krogufant rather than a word — the exercise itself, the way `a e i` and `b d`
  are.
- **The artwork is generated, then forced back onto the raster.** The eight
  animals were drawn as vectors first, in `src/art.mjs`, on the shared body
  plan. Free text-to-image cannot hold that plan — the whole mechanism depends
  on every head being the same width at y=60 — so each vector was rendered and
  passed through an image model as an *edit*, with the drawing as the base.
  That holds the silhouette by construction, but not exactly: the necks of the
  giraffe, the camel and the flamingo came back 25-32% too narrow, because a
  slender neck is what those animals actually have, and the crocodile came back
  18% too wide. Each image is therefore warped back row by row, with scale and
  centre interpolated between four control rows — identity at the top and
  bottom edges, exact at the two cuts — so the correction is concentrated where
  it has to be right and the extremities are left alone. Every silhouette is
  now within 0.6% of the template at both cut lines. The heavy rule drawn over
  each seam is the cut edge of the paper, which the book has physically; it is
  also what covers the last unit of drift. Backgrounds are cleared to
  transparent by a border flood fill, plus the vector silhouette for pockets a
  border fill cannot reach, such as the gap between the legs — without that,
  three animals with slightly different background tints stack into a hybrid
  with a bright step at every seam. `node tools/preview-art.mjs --raster`
  rebuilds the contact sheet from the images inlined in App.jsx.

- **The images are inline base64, not files.** The service worker fetches every
  GET network-first with `no-store`, so eight separate assets would be
  re-fetched on every open and would not survive going offline. ~193 KB of
  WebP, 400x600 at q46-76, each under 25 KB.

- **The Krogufant is guaranteed once.** Left to chance it is 1 in 512 and he
  might never meet the creature the mode is named after, so until he has built
  it one item per round is set to it. After that it is back to chance. The
  celebration is unscored, and so is the free mixer that flips through all 512
  after a round — reachable only from the round-end screen, because an unscored
  playground is a fine reward for finishing and a distraction from the start
  screen.

## Rewards

- +1 coin per correct answer.
- **Speed multiplier** ×3 (250–350 ms) / ×2 (500–700 ms) / ×1 slower — active **only
  while rolling accuracy over the last 10 answers is ≥80%**, and only after ≥4
  answers exist. Without this gate, max speed + random tapping is the optimal
  coin-farming strategy.
- +5 coins per 10-answer correct streak.
- +10 coins at 15 min in a day, +25 more at 25 min.
- Daily flame streak requires ≥10 min active practice.
- **Coins only ever accumulate.** No shop yet, nothing is ever taken away.

**All three games credit the same day record.** The ⏱ ring and the flame both
read `days[today].s`, and every answer handler adds its active time through
`creditDay()`, which also pays the two minute milestones. The milestone check
used to sit inline in the reading loop, so mini-game minutes slid the ring past
15 and 25 without paying, and a day that ended inside a mini-game lost the bonus
for good. `test_daily_credit` asserts this, and fails if the day record is
inlined back into one handler.

### The ring and the day's credit are one test

`dayPct(sec)` and `dayDone(sec)` are the only two places the 600 s goal is
read. `dayPct` **floors**, which is what makes `dayPct(sec) === 100` exactly
equivalent to `dayDone(sec)`. Do not switch it back to rounding, and do not
inline `sec >= 600` at a new call site.

The ring used to print `Math.round(sec / 6)` clamped at 100 while `calcStreak`
and the flame tested `sec >= 600`. Those are different tests, and everything in
**[597, 600) displayed 100% and earned nothing**. That is not a corner case,
because the child stops the moment the ring reads full: in a real export half
of all full sessions ended within six seconds of the goal, and two of twelve
landed inside the dead window — 599.715 s and 598.076 s. The second one cost a
five-day streak that had actually been done, and the `f3` badge with it, on a
day that showed him 100%. A rounded display is a promise the credit rule then
refused to keep.

`test_day_goal` sweeps day totals across the boundary and asserts the two
agree at every point; it fails on the old build at 598.076 s.

**The v3 migration pays out the days already lost to this.** It runs once over
`L.days` and credits exactly the days the *old* display rounded up to 100% —
`s < 600 && Math.round(s / 6) >= 100` — leaving every genuinely short day
alone. It is idempotent, but it is still persisted at load rather than kept in
memory, for the same reason the achievement `seen` seeding is: a migration that
re-derives itself on every start is reading data that has since moved. The
repair is deliberately written against the superseded display rule, which is
the only thing that makes "he was told this day was finished" recoverable
after the fact.

### Active time is the span between answers, capped

Each answer credits the wall clock since the previous answer — `span()`, capped
at `IDLE_MAX` (30 s) — so every millisecond of the loop lands in exactly one
span and none of it in two.

This replaced `DUR[speed] + response`, which was a proxy for the same quantity
and a leaky one. It counted the flash and his answer and dropped the 500 ms
fixation dot, the 950 ms feedback on a correct answer, and the entire
hold-on-miss dwell, which has no timer on it by design. Measured at speed 5 with
a 1.8 s response it credited 2.65 s of a 4.51 s item: **the ring closed after
about 17 real minutes rather than 10**, which is not the target anyone was
setting. Worse, the stages it dropped are the ones a miss is made of, so the
proxy paid least on exactly the days that were going badly — a bad session was
charged a longer sit than a good one, which is backwards.

**The cap is what carries the original rule.** The rule was never "measure
response windows"; it was that an idle open tab must earn nothing, or the daily
streak means nothing. A walked-away-from screen now earns `IDLE_MAX` once and
nothing after, which serves that rule while a raw wall clock would not.
Everything outside the loop is outside every span by construction: the span
restarts when a mode is entered, so the home screen, the badge gallery, the
parent dashboard, the chunk-end summary and level-up celebrations are never
inside one. Browsing trophies is not practice, and the first answer after
coming back is billed from re-entry, not from whenever he last answered.

The same treatment applies to both mini-games, so a b/d minute and a reading
minute are still worth the same — that was already true once the drill started
crediting its flash, and the span keeps it true for the fixation and feedback
stages as well. `test_active_time` asserts credited-vs-clock, the cap, the
gallery exclusion and the chunk separation; it fails against any build that
goes back to summing response windows.

This is not in tension with the rule that a mini-game must not touch
`s`/`cc`/`iv`/`due`/`h`. Those fields are claims about *reading a word*, which a
vowel or letterform answer is no evidence for. Minutes on task are not a claim
about any word, and time spent is time spent whichever button he pressed.

## Speed tiers — mastery quality, not just quantity

Every correct answer logs evidence at its tier: 🐢 ≥2500 ms, 🏃 700–1500 ms,
🚀 ≤500 ms. A tier is confirmed after **2** correct answers at that speed, so a
single lucky 25% guess can't award it. The same word can be solid at turtle speed
and not yet at rocket — that distinction is the point.

Level unlocking is deliberately **speed-agnostic**: otherwise a cautious slider
choice would gate progression and punish the child for being careful.

## Gold / turbo mode

A fully mastered level can be replayed at forced ≤500 ms to earn rocket tier.
Two rules make it safe:

- Correct answers update tier evidence and coins but **do not advance SRS due
  dates** — no spacing actually occurred, so extending intervals would corrupt the
  schedule.
- Failures **do not demote mastery** and do not reset the streak. The word was
  mastered at a slower speed and that remains true. Without this, turbo is a trap
  that destroys progress and the child learns to avoid it.

## Achievements

130 badges: 13 categories × 10 tiers (first-time events, correct-in-a-row, questions
answered, words mastered, daily minutes, day streak, perfect-at-each-speed, practice
levels, levels mastered, turbo/gold, plus one category per mini-game).

The number is not a constant anywhere. It is `ACHIEVEMENTS.length`, and the
only assertion worth making about it is that it equals ten times the number of
categories. It was a literal `100` once and then a literal `120`; both times
adding a category broke a passing test that was testing nothing useful.

### One gallery per language

Each language has its own set of the same 120, scored only on that language's
words, levels, mini-game records and bookkeeping. A badge therefore means "he did
this in German" or "he did this in English" and never a blur of the two. Without
the split, starting English would have handed him most of a gallery on day one for
German work, and the badges would have stopped saying anything about English.

Twenty-three badges are marked `shared` and stay pooled across both languages:
the ten daily-minute tiers, the ten day-streak tiers, "Erster Tag!", "Zwei
Sprachen!" and "Alles offen!". None of them is a claim about reading a particular
language — time at the iPad is time at the iPad, and the last two are *defined*
across both, so a per-language "all levels open" would only duplicate the Stufe-10
badge. Shared badges unlock in both galleries at the same moment. Only the
gallery of the language he is actually playing gets a toast; one badge popping up
twice reads as a bug, and the trophy star sends him to the other gallery to find
it.

`sr.ach` is `{ v: 3, de: {...}, en: {...} }`, each set holding `unlocked`, `seen`
and the achievement-only counters (`bestStreak`, `perfectSpeeds`, `chunksDone`,
`speedChanged`, and the two mini-games' round tallies). Those counters used to be
global; per-language evaluation is meaningless while they are not.

**Migration.** A save written before the split has one flat gallery, all of it
earned in German, so it becomes the German set unchanged — unlock dates, streak
records and all. Nothing is re-evaluated and nothing is taken away. English starts
empty apart from the shared badges he already holds, which are copied across with
their original dates **and marked seen**. Left unseen they would arrive as twenty
toasts in a row for things he earned weeks ago, on the first launch after the
update. Written back to storage immediately, for the same reason the `seen`
seeding is.

**Leaving the badge screen marks only the galleries he actually opened.** The
screen remembers which flags were tapped during the visit. Marking both would
clear the stars on a gallery he never looked at, which is the same mistake as
marking on entry.

### Export

The export carries `de`, `en`, `ach` and `meta`. Badges were left out originally,
so moving to a new device restored every word and every level while silently
wiping the entire trophy case.

- **Titles are 1–3 short common words** ("5 Treffer!", "Gold!") because the child
  reads them himself in a toast during play. Tapping any badge opens the full
  unlock criterion in a sentence — detail on demand, not against the clock.
- **Pacing is structural, not tuned.** Fast categories (first-times, lifetime volume)
  front-load several in session 1; slow categories (multi-day mastery, day streaks)
  *cannot* fire early because mastery needs two calendar days. The taper is a
  consequence of the rules, so thresholds can be edited without breaking it.

## Audio

All 200 German words are **pre-recorded, one independent clip per word**, base64 in
`words/de-audio.json`. English still uses browser `speechSynthesis` — iOS exposes
only a poor voice set to web pages, and downloaded system voices are invisible to
any website, which is why recordings exist at all.

Pacing (silence trimmed, mild slowdown) is **baked into the files**. The playback
slider stretches silence too, so it could not reproduce the same result; `meta.audioV`
guards against a stale saved rate double-applying the correction.

See README for the two audio failure modes that must never be reintroduced.

## Parent dashboard

Behind a small grey gear, bottom-right of the home screen — deliberately the only
sub-80px target in the app so it doesn't invite taps.

Contains: mastery-level distribution (with the five levels explained inline),
today's due-review list, the SRS interval distribution, a per-level table, weakest
words with their most common confusion, **letter-level confusion aggregation**
(e.g. `a↔e (7×)`, derived by diffing every wrong tile against its target), a
**Fehlerarten** split, a 14-day
practice chart, voice settings, and export/import for moving progress between
devices.

### Fehlerarten — four mechanisms, four remedies

The raw letter tally hides that different errors need different responses, and
the app was scoring them identically. Every wrong tile is classified:

| kind | meaning | what actually helps |
|---|---|---|
| 💭 geraten | chose another real word (`sieht→siegt`) | full decoding, not more speed |
| 🅰 Vokal | frame right, vowel wrong (`nicht→necht`) | Vokal-Blitz |
| 🔤 sieht ähnlich | letterform (`der→ber`, `kann→kamn`) | letter-level discrimination |
| 🔊 klingt gleich | word-final devoicing (`ist→isd`, `Tag→Tak`) | Verlängern |

The last row is the one worth stating plainly: it is **not a reading failure**.
German neutralises /d/ and /t/ word-finally, so `isd` and `ist` are homophones
and no amount of sounding out separates them. The remedy is extension —
`Tag → Tage`, `Haus → Häuser`, `gibt → geben` — and grouping it with `der→ber`
hides that completely. On the reference export the split was 41 / 26 / 19 / 11 %.

### New-badge star

A badge unlocked since he last opened the screen carries a ⭐ in its corner, the
category header carries one if any of its badges are new, the header shows a
green ⭐ count, and the trophy on the start screen carries one so he knows to go
and look.

**Marking happens on the way out, never on entry.** Marking on entry is the
obvious implementation and is exactly wrong: the star would be cleared by the
act of going to look for it, so a badge earned between visits would never once
be seen marked. Leaving the screen marks everything currently unlocked as seen.

`seen` is a plain id→true map rather than a timestamp — a "last viewed"
time has to reason about same-second unlocks and a device clock that can move
backwards, and buys nothing here.

**Migration matters.** An existing save has unlocked badges and no `seen` map.
Those are seeded as already seen *and written back to storage immediately*. In
memory only, the seeding would re-run on every load, and by the second load
`unlocked` would contain badges genuinely earned since — which would then be
silently marked seen and never star. The one occasion the feature most needs to
work is the first launch after it ships.

Note the star spans carry `data-new`. ⭐ is already the glyph for star level on
the language cards, so counting the character finds the wrong elements; the
attribute is what the test selects on.

### Mini-game badges

Each mini-game carries its own 10, bringing the total to 130 per language. All three follow
the same shape: two entry badges (first answer, first completed round), a four-step
volume ladder, a streak, a breadth or perfect-round badge, and one quality
badge that cannot be won by rushing.

That last one is the point. `k10` needs 90% across at least 100 vowel answers,
`m10` the same across 100 animal answers, and `l10` needs a pair retired — all
three reward accuracy over throughput. A badge for answering quickly would work
directly against the reason these modes exist. `l10` is the only badge in the
app awarded for no longer needing a feature. There is deliberately no badge for
the Krogufant: it is a 1-in-512 moment, and a score attached to it would turn a
surprise into a target.

Ids are worth one note: all three categories are built from the shared `ladder`
factory with prefixes `k`, `l` and `m`, whose generated ids collide with the
hand-written entries and are remapped to `k3`–`k6` / `l3`–`l6` / `m3`–`m6`. A collision
would make two badges share an unlock slot and quietly render one unreachable,
so `test_minigame_awards` checks one hand-written and one remapped badge in the
same run. The badge total is derived from `ACHIEVEMENTS.length` everywhere it is
displayed — it used to be a literal `100` in the header and in two tests, which
is why adding a category broke them.

## Storage

Keys: `sr.de`, `sr.en` (per-language progress), `sr.meta` (settings), `sr.ach`
(achievements). Dual-mode by design — `window.storage` inside a Claude artifact,
`localStorage` when deployed standalone — so the same source runs in both hosts.

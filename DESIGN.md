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

## How many words may be unfinished at once — the open-set cap

On the 18 Sep 2026 export he was carrying 21 unfinished English words at the
same time and getting 66% of his answers right. Ten words accounted for 30% of
every answer he had ever given, at 37–56% correct each, with four tiles on
screen. That is the shape of a grind, and it is what he was quitting the moment
the ring filled.

`OPEN_CAP = 8`: at most eight unfinished words are in play, chosen by recent
accuracy, nearest to finishing first, plus one parked word on every queue build
— the one he has gone longest without, so a hard word is deferred rather than
dropped. Reviews of finished words are never held back.

**Simulated against that export before building it** (his real per-word state,
accuracy and due dates; outcomes drawn from each word's own measured accuracy;
no learning in the model, so every difference is scheduling, 300 runs):

| arm | words finished in 14 d | accuracy | distinct words/day |
|---|---|---|---|
| today, no cap | 12.0 | 57.4% | 28.9 |
| cap 8, nearest done | 13.1 | 63.4% | 17.2 |
| cap 8 + parked slot | 13.2 | 62.0% | 19.9 |
| cap 8, weakest first | 0.9 | 49.0% | 15.5 |
| cap 8, random rotation | 11.3 | 57.6% | 22.4 |

Three things in that table decided the design, and two of them contradicted the
reasoning that led to it:

- **Capping the pool alone does nothing.** The first version capped `pool`, and
  every arm came out identical to no cap at all. The diagnosis is in the queue:
  of the ~16 words in a typical build, ~14 arrive through `due` and only ~4
  through `pool`, because every miss sets `due` to tomorrow. The cap has to
  apply to unfinished words wherever they come from.
- **Serving the weakest first is the worst thing available.** It finishes
  almost nothing: a word he gets right a third of the time cannot pass the
  mastery gate however often it is shown, and while it is shown, nothing else
  is. The pool weighting still leans that way *within* the served set, which is
  fine; the selection of what is in play must not.
- **The cap does not add throughput, it moves it forward.** Over 42 simulated
  days the arms converge (16.5–16.7 finished). What it buys is a higher hit
  rate — 57% to 62% — and finishes arriving sooner. That is the point: the
  complaint was that he does not enjoy it, not that the curriculum is too slow.

The parked slot costs about 1.4 points of accuracy against a pure cap and is
kept anyway: a word vanishing for weeks is how "went" would stop being practised
at all. `test_open_cap` pins all of it, and fails on the build before, on a
weakest-first ranking, and with the parked slot removed.

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

### A won round takes a minute off the day

One Vokal-Blitz round above 70% — 9 of 12 or better, a full round — takes a
minute off today's goal. Once a day. No day may finish under `GOAL_FLOOR`,
8 minutes, whatever is earned.

Why this game and no other: medial-vowel confusions are his largest error type
by a distance (went/want, come/came, then/them, make/made), and on the 18 Sep
2026 export he had played this drill **twice, ever**, against 35 rounds of the
b/d drill aimed at his smallest error type. Nothing routed him here, so the
reward does. If a later session is tempted to "fix the inconsistency" by paying
the other games too, this is the reason not to.

Three numbers set the shape:

- **It cannot be tapped through.** Three options per item, so 9 of 12 by
  guessing happens about once in a thousand rounds.
- **It is not free.** His measured vowel accuracy is 70% (34/47 English,
  52/76 German), so about half his rounds clear the bar.
- **One round, because a round is worth about two minutes.** It takes roughly a
  minute and already credits its own time to the ring like every other game. Add
  a minute off the goal and the payoff doubles; uncapped, the fastest way
  through an 11-minute day is vowel rounds and no reading at all, which would
  displace the main exercise. Capped at one, the most it can move is a minute.

The minute lands on the day record as `vb` and **`goalOf` is the only place that
knows about it**, so the ⏱ ring, the flame, the streak, the joker rule and the
14-day chart all keep reading one number. Two displays of one test drifting
apart has cost this app a streak once and a green bar in the chart once; it does
not get a third chance. A lost round costs nothing and nothing is ever taken
back.

`test_vowel_bonus` pins the threshold, the once-a-day cap, the full-round
requirement and the floor. It fails on the build before, and on three broken
ones: the threshold loosened to 8 of 12, the cap removed, and the floor removed.

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
- **A pair reaching 20 drill answers at ≥90% awards `l10` and nothing else.**
  It used to also retire the pair and hide the launcher, and that was wrong in a
  way worth recording, because the rule looked correct and the numbers said
  otherwise. On a real export the b/d pair retired at exactly the gate — 18 of
  the last 20 — while the same export carried **35 b/d substitutions in actual
  reading, 8.6% of all 405 errors**, `der`→`ber` twelve times on its own, and
  81% lifetime drill accuracy. The rolling window was measuring the drill and
  the rule was reading it as evidence about words. Transfer had not happened,
  and the one exercise pointed at the problem deleted itself.

  A threshold cannot see that, because the only thing it can see is its own
  scores. Someone watching the child read can. So **the three mini-game
  launchers are now switches in the parent dashboard** (`meta.games`, default
  on, off means absent from the start screen rather than greyed out). The
  original worry that motivated retirement — `mx` only grows, so a pair could
  never fall back under the threshold and the "temporary" drill would become
  permanent — is answered by the switch instead of by an inference the data
  does not support. `test_game_toggles` asserts the launcher survives a window
  that would have retired it, and `test_minigame_awards` now asserts the same
  in the opposite direction from what it once did.
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

**The 14-day chart is a third display of the same test** and it drifted the
same way. It coloured a bar green at `min >= 10`, a literal 600 s, and kept
doing so after the goal became a property of the day: from 5 Sep a 10:30 day
showed green in the dashboard while the ring read 95% and the streak did not
count it. The chart now takes `done` from `dayDone` on the day record, and its
tooltip prints m:ss instead of rounded minutes, since "11 min" for 630 s is the
rounded-display promise again. `test_day_chart_goal` fails on the old build at
exactly that day. Any new place that shows "was this day done" reads `dayDone`.

**The v3 migration pays out the days already lost to this.** It runs once over
`L.days` and credits exactly the days the *old* display rounded up to 100% —
`s < 600 && Math.round(s / 6) >= 100` — leaving every genuinely short day
alone. It is idempotent, but it is still persisted at load rather than kept in
memory, for the same reason the achievement `seen` seeding is: a migration that
re-derives itself on every start is reading data that has since moved. The
repair is deliberately written against the superseded display rule, which is
the only thing that makes "he was told this day was finished" recoverable
after the fact.

### The joker — one excused day, and it can only bridge

He lost a 17-day streak to one missed evening. Nothing had actually been
destroyed: the streak is not stored anywhere. `calcStreak` walks backwards from
today for as long as the day counts, so a gap does not reset a counter, it just
stops the walk. A joker is one date in `meta.jok` that the walk steps over.

**The joker moves the streak and nothing else.** `days[iso].s` is untouched, so
the ⏱ ring, the 14-day chart, the minute milestones and every "he practised X
minutes" number still report only real practice.

**An excused day bridges the walk and adds nothing to the total.** The flame
stays a count of days he actually practised, and the 📅 ladder keeps meaning
what it says: "30 Tage" is thirty days at the iPad, not thirty minus however
many were bought back. It shipped the other way round once, on the reasoning
that a flame stalling for a day would read to him as the app losing the day.
That is the weaker argument — he sees the same number instead of a reset to
zero, which is already the whole rescue, and "it didn't go up because you didn't
practise" is both true and the thing a streak is for. Counting the joker ran the
flame, `bestStreakDays` and the day badges one high per joker; on the first real
save it showed 16 for 15 practised days. `test_joker` pins the distinction: an
eighteen-calendar-day span with one excused day reads 17.

Three rules, each closing a way of getting the flame for free:

- **`JOKER_GAP` is a rolling seven days, not a calendar week.** "One per week"
  was the first version, and it is wrong: ISO weeks put a boundary between
  Sunday and Monday, so two adjacent days fall in different weeks and a whole
  weekend away would have been bridgeable for free. Seven clear days between
  excused dates means **a two-day gap can never be bridged**, which is the
  property worth having.
- **`JOKER_REACH` is 14 days**, so a streak that has visibly read 0 for a
  fortnight cannot be resurrected later. `days` only keeps 60 entries anyway.
- **The day before an excused day must be genuinely practised**, tested with
  `dayDone` and not with the joker-aware `dayCounts`. A joker bridges a run; it
  cannot start one out of nothing and cannot chain off another joker. With a
  seven-day gap the chaining case is already unreachable, but the check states
  the intent and survives a change to the gap.

**The second argument to `calcStreak` is not optional in practice.** Five places
report a streak — both home language cards, the play top bar, the dashboard
"Serie" and `bestStreakDays` in `computeStats` — and a call site that drops
`jok` shows a different number from the one beside it. That is the same shape as
the ⏱ ring and the flame disagreeing, which cost a five-day streak once already.
`test_joker` asserts all five agree and that the badge ladder fires off the
repaired streak.

**It is parent-only and invisible to him.** The switches live in the dashboard
behind the PIN; nothing on the child's side mentions a joker. A streak he knows
can be bought back is no longer a reason to open the app on a tired evening, and
the whole value of the streak is that pull. What he sees is an intact flame.

Applying one re-runs the achievement check immediately rather than waiting for
the next answer, because `bestStreakDays` changed the moment the switch flipped.

Blocked days are listed greyed with their reason rather than hidden. A parent
looking for yesterday needs to see that it is there and why it cannot be used;
a missing row reads as the feature being broken.

## Tipp-Blitz — he writes the word instead of picking it

Read off his export of 4 Sep: **87% of his 454 wrong answers are one wrong
letter.** Not word confusion — one letter. 52% of those substitutions are in the
middle of the word, and **42% of everything wrong is one vowel put in place of
another** (e/a and a/e alone account for 65). Silent-e words run at 52% against
65% for everything else, with came↔come and make↔made mutual and symmetric.

And the drills are not transferring. He is at **372/412 = 90%** telling m from n
on a tile in Buchstaben-Blitz and still writes *wemt*, *fimd*, *agaim*, *umder* —
35 in-word m/n confusions, 31 t/d, 13 b/d. Recognising a letter in isolation and
producing it inside a word are different skills and only the first was trained.

**The four-tile format cannot reach any of this.** 91% of his substitutions use a
letter that is not in the target word. Choosing between four whole words somebody
else assembled never asks him to produce a letter.

### Three ways of being right without spelling, each closed

- **The word is gone before he types.** If it stays up the strategy that pays is
  copying, and copying is not spelling.
- **No empty slots.** Four boxes for "ride" hands him the silent e, and dropped
  letters are 8% of his errors — *rid* for ride, *mad* for made.
- **Nothing is judged until ✓.** Rejecting a wrong key as he types turns it into
  tap-until-green, which pays and teaches nothing. A wrong first letter is
  accepted and stays there.

Exposure has a **1500 ms floor** whatever the speed slider says. The reading loop
at speed 9 is a 250 ms recognition flash; this asks him to hold the word and
rebuild it, and at that exposure it would be testing memory instead of spelling.

### The keyboard is the whole alphabet

QWERTY for English, QWERTZ with ä ö ü ß for German — what "standard keyboard"
means, and what he will meet on a real one.

It was a 14-key board first: the word's letters plus the letters he had actually
written in their place. That was built to keep the search cost down, and it did,
but it bought that with a scaffold. Fourteen keys rule out twelve letters before
he starts, and **the set of keys is itself a clue about the word**. A full
alphabet is identical for every item, so it leaks nothing at all, and every
letter he could reach for is present — which means every mistake he can make is
one he can express. The 14-key board had to be engineered to achieve that; the
full one gets it for free. `test_type_blitz` asserts the key set does not change
between words.

The cost is real: ten keys to a row instead of a 6×3 grid of big ones, and more
hunting for a seven-year-old. If rounds start dragging, that is the thing to look
at first.

### What the 14-key board taught, kept here because it will come back



Not the word's own letters: measured, **91%** of the wrong spellings he actually
produces use a letter that is not in the target, so that board could not produce
one of them and therefore could not correct them. Not all 26 either — the search
cost would sit above the spelling cost for a seven-year-old. So it is the word's
letters plus the letters he has actually written in their place, derived from his
`mx` at run time rather than a table fixed once, padded from the pairs he
confuses across the whole book. On the twelve weakest words that reaches **100%**
of his recorded misspellings.

It shipped at 12 keys and that was wrong, and only playing it caught it.
`tools/sim_type.mjs` runs the built game with strategies a child could actually
use:

| strategy | 12 keys | 14 keys, all vowels |
|---|---|---|
| types the word (control) | 100% | — |
| random tapping | 0% | — |
| first letter + length, rest guessed | 0% | — |
| **knows every consonant, guesses the vowel** | **38%** | **9%** |
| model of his real per-word accuracy | 56% | 69% |

A player who skips the exact step the game exists to train was scoring two thirds
of what real spelling scores. Boards were coming out with four vowels or fewer,
so the vowel was a one-in-four guess. **Every board now carries all five vowels**,
which makes a one-vowel word one in five and a two-vowel word one in twenty-five.
Language extras (ä ö ü, y) come in only when the word or one of his misspellings
of it uses them, so a German board does not spend eight of fourteen keys on
vowels. AC1 held at 235/235 through the change. The 56→69 on the ability model is
noise across 32 trials and is not claimed as an improvement.

This is the Tier-Blitz lesson arriving a second time: every assertion passed at
12 keys. Ask what a seven-year-old could do to be right without doing the thing
being trained, then *measure whether it pays*.

### Both outcomes wait for the tap

A right answer used to slide away after 1100 ms. That took the word off screen
at the one moment it is worth looking at — he built it himself and it is
correct, and that is the version to leave in front of him. It also means nothing
about the pause tells him which he got before he has read it, and it makes the
correct case behave exactly like the miss case, which was already hold-on-tap.

The dwell counts toward the day, and that is deliberate: the active-time
contract says a span covers the feedback he studied, bounded by `IDLE_MAX`, so
an abandoned screen earns 30 s once and nothing after. Excluding the dwell here
would have been the exception, not the fix — it would put time outside every
span, which is the thing the span model exists to prevent.

### It never touches the reading record

Typing writes to `ws.tp` — the same shape as `vk`, next to it on the word — and
leaves `s`, `cc`, `due`, `h` and `everMastered` alone. He can read a word long
before he can spell it, and a spelling miss must not push a word he reads fine
back down the ladder or into review.

Words are drawn from those he has met at least `TYPE_MIN_SEEN` times, 3 to 5
letters, weighted by how often he has got them wrong. **Deliberately not gated on
`everMastered`**: his five worst words — went, ride, came, find, want — have never
been mastered, and those are exactly the ones to write. The queue serves words at
49% mean reading accuracy against 58% for the eligible pool, which is the bias
working as intended; the ability model still scores about 5 or 6 out of 8, so it
is hard without being punishing.

Ten badges, like every other category — the header total asserts that, and eight
broke it. None of them rewards typing fast. Speed is not the skill here and a
badge for it would push him back toward the guessing the Tier-Blitz foil redesign
took out.

### Baseline for the only measurement that decides this

**86 medial-vowel errors in 444 attempts on the twelve seed words = 19.4%**, as of
the 4 Sep export. Per word: came 32%, come 34%, ride 24%, went 22%, want 20%,
his 18%, can 17%, down 16%, find 12%, make 10%, made 7%, with 5%. If Tipp-Blitz
works, that figure falls in the *recognition* game. If it does not move, the game
is entertainment and should be cut.

## The daily goal is a property of the day, not a constant

`DAY_GOAL` went 600 → 660 on 5 Sep 2026. Raising the constant alone would have
been silently destructive, and nothing in the test suite would have caught it
before the app did.

**His whole English run sits between 601 and 659 seconds.** Seventeen days for
seventeen, every one of them under 660 — he practises to the target and stops
within seconds of it, which is the same evidence that says the goal *is* the
session length and that moving it will move his practice. Because the streak is
derived rather than stored, a global 660 makes `dayDone` false for all sixteen
days at once and the flame recomputes from 16 to 0 the next time he opens the
app. The property that has protected this app twice — derived state cannot go
stale — is the exact property that makes a moved goalpost retroactive.

So `creditDay` stamps `g` onto a day when it first creates it, and `dayDone`,
`dayPct` and the ring all read the goal off the day. Days written before the
change carry no `g` and keep `LEGACY_GOAL`. Today's record, if it already
exists, also keeps it: the goalposts do not move halfway through a session he
has already started. The v2→v3 repair is pinned to `LEGACY_GOAL` too — it is
about history and must not be re-judged by a later standard.

`dayPct` and `dayDone` now take the day record rather than seconds. That is
deliberate: with a per-day goal, seconds alone are no longer enough to answer
either question, and a signature that still accepted them would let a call site
silently use the wrong goal.

`test_day_goal` covers the equivalence sweep at both goals and asserts that
sixteen days of 601–659 s survive the rise. Against a build with one global
constant that assertion fails, along with three others.

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

The export carries `de`, `en`, `ach`, `meta` and `sess`. Badges were left out originally,
so moving to a new device restored every word and every level while silently
wiping the entire trophy case. `meta.jok` is on the same list for the same
reason: it is persistent user state, and a device move that dropped it would
break a live streak on arrival. Anything added to `meta` has to be added to the
export object, the debounced save *and* `flush()` — three sites, and
`test_joker` checks the save and the export.

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

### The recording is what bounds any print→sound exercise

Every mode in this app ends in *pick a printed thing* or *pick a grapheme*. The
core loop flashes a word and takes a tile; Vokal-Blitz plays a word and takes a
vowel; Tier-Blitz takes a syllable tile. **Nothing anywhere tests grapheme →
phoneme**, which is the direction that actually fails: he sees `Mond` and says
"Mund". Testing it needs the child to *produce or choose a sound*, which means
audio options, speech recognition (unreliable on iOS), or an adult listening.

An audio-choice game — print the word, offer two clips, tap the one that matches
the letters — was measured against a real export before any of it was built, and
the numbers said not to build it:

```
error mass                                     405   100.0%
  distractor already recorded                   40     9.9%   (20 distinct pairs)
  distractor is a real German word, no clip    130    32.1%   (69 new clips)
  distractor is a pseudo-word                  235    58.0%   (unusable)
```

Both words in a pair need a clip, and only the 200 curriculum words have one, so
the pool is bounded by the recording rather than by his errors — twenty pairs,
six of them from a single error each.

The 58% cannot be rescued by recording, and this is the part worth remembering.
Most of his confusions are with **pseudo-words** (`der`→`ber`, `ist`→`isd`,
`hatte`→`hotte`), which are pedagogically the right contrasts and are exactly
what the generated distractors already produce. But if one option is not a word,
*"pick the one that sounds like a real word"* answers it without reading
anything:

```
GUESS AUDIT — "pick the option that is a real German word"
  real-word distractors only          50.0%    (ceiling was 55%)
  all distractors incl. pseudo-words  79.0%    fails
```

So real-word distractors are not a preference, they are the whole constraint,
and they are the scarce thing.

**Do not "fix" this by flipping the direction.** Playing the target and offering
two printed words needs no new audio and covers everything — and is the core
loop with two tiles instead of four. It tests print recognition, which three
modes already test, and quietly drops the one direction the exercise existed
for. A version of this that looks cheap and covers 100% is the wrong version.

## Parent dashboard

Behind a small grey gear, bottom-right of the home screen — deliberately the only
sub-80px target in the app so it doesn't invite taps — and behind a four-digit
PIN (`PARENT_PIN`, currently `1234`).

### The gate has no secret in it

It was a fixed four-digit PIN, `1234`, for two days. He cracked it. Changing the
digits would have bought a week, because **the weakness was that the secret was
constant** — a code typed in front of him is learned by watching, and that one
did not even need watching.

So there is no secret. The gate draws a fresh multiplication every time and
writes the operands as German number words: *siebenundfünfzig mal fünf*, 23–97 ×
3–9, never a round ten. Three barriers stacked, and he cannot clear all three at
once: **read** "siebenundfünfzig", which is the exact skill this app exists to
teach him and which he does not have yet; **hold** two numbers; **multiply** two
digits by one. Watching gives him nothing, because the next question is
different. A wrong answer draws a new question, so working the keypad is not a
search either — there is no fixed target to converge on.

An adult reads it and answers in a few seconds. That asymmetry is the whole
design, and it decays gracefully: by the time he can read the words and do the
arithmetic he is ten and the streak game is over.

Still **no lockout after N wrong tries** — a parent shut out of their own export
with no way back is a worse outcome than a child with time on his hands.
Instead, **every attempt is logged** to `meta.gate` (last 20, right and wrong)
and shown in the dashboard as 🔑 Zugriffe. A gate you cannot tell has been opened
is a gate you have to guess about, and the joker switches sit behind it — a
self-served joker would otherwise show up only as a streak that looks a day too
long.

`pinRef` holds the typed digits rather than state, so fast taps cannot race a
render and drop one.

Three existing tests tapped the gear and expected the dashboard immediately
(`test_game_toggles`, `test_lang_badges`, `test_reach_accuracy_gate`); their
helpers read `data-gate-a`/`data-gate-b` and answer. Exposing the operands is
not a back door — they are on screen in words either way. `test_joker` asserts
the gate itself, including that no digits appear on it, that the words match the
operands against its own copy of the number table (a wrong table would make the
gate unreadable to the parent as well), that a wrong answer redraws, and that a
stale answer does not open the new question.

Contains: mastery-level distribution (with the five levels explained inline),
today's due-review list, the SRS interval distribution, a per-level table, weakest
words with their most common confusion, **letter-level confusion aggregation**
(e.g. `a↔e (7×)`, derived by diffing every wrong tile against its target), a
**Fehlerarten** split, a 14-day
practice chart, the joker switches, voice settings, and export/import for moving
progress between devices. **⏱ Sitzungen** sits first; see below.

### Sitzungen — where the time at the iPad goes

Asked for because it looked as if a lot of each sitting went on the trophies.
The ring cannot show that: trophies earn nothing on it by construction, and
until 16 Sep 2026 the app stored no wall-clock time at all, only credited
seconds per day.

**What the ring counts, measured on the live build before this was added**
(scripted session, virtual clock): 60 s home + 180 s gallery + 30 s home, then
▶, and the first answer credited 1.3 s, its own play time. 60 s on the chunk
summary: the next answer credited 1.3 s. 120 s staring at one question: 30 s.
The app hidden 10 min mid-question: 30 s. So the ring counts only time inside a
game, with two leaks of at most IDLE_MAX per answer.

**The log is measured apart from the ring, so it can check the ring.** Per
sitting it books presence per screen: time counts while the app is visible and
the screen was touched within IDLE_MAX, the ring's own walk-away rule. Past
that it is idle (💤), and idle is only written down when the next touch shows
he came back within `SESS_GAP` (5 min). A longer gap ends the sitting.
Without that rule an iPad left on the trophy screen reads as forty minutes of
trophies, which is the exact misreading this exists to prevent.

- **Ring is the ring's number, not an estimate.** `cr` is the sum of the seconds
  every answer handler passed to `creditDay` while the sitting was open.
  `test_sessions` compares it to the day record to 0.2 s.
- **Ring above time in games is the hidden-app leak showing.** A span that was
  running when the iPad was locked is capped at IDLE_MAX but not cut, so the
  ring is paid for up to 30 s of a locked screen. The row flags it in orange.
  It is not closed: closing it lowers future credit, and whether it happens
  often enough to matter is what this log will show.
- **What keeps a locked iPad out of every column is `tk.mark = now` on the way
  back into view.** The `tk.vis` guard in `sessAdvance` is defensive only: a
  build without it passes every assertion, because nothing books time while
  the app is hidden. A build without the mark reset fails three of them.
- **Parent screens are booked under `parent` and left out of Dauer.** The gate
  (`pin`) counts as home: it is on his side of the gear.
- **Groups:** games = play, vowel, letters, mix, type · 🏆 = gallery and word
  stack · 🎉 = chunk summary, level-up, gold, round-end screens, the Tier-Blitz
  mixer · 🏠 = everything else. Dauer is the sum of those plus 💤, so the
  columns add up.
- **`md`, seconds on a miss screen before continue**, is recorded now because a
  pace reward (the racing idea under discussion) would erode exactly that
  dwell, and its baseline has to exist before any such reward does.
- Refs, not state: every touch passes through it. Listeners are capture-phase
  on the document so a tap is booked before the handler it triggers changes
  the screen. Both `pointerdown` and `click`, because a tap produces both and
  the tests dispatch only clicks; the second of the pair books nothing.
- Storage is its own key, `sr.sess`, last 60 sittings, written by its own
  debounce, by `flush()` and on hide. No periodic timer: an untouched stretch
  books nothing anyway, and a repeating timer stops `smoketest2` from ever
  exiting. Not in `meta`, which already has three write sites. It travels in
  the export and in both import paths.

`test_sessions` runs a scripted sitting (home, 180 s of trophies, reading with a
120 s stall and a studied miss, the parent dashboard, a 2-minute hide, a
Tier-Blitz round, then a 10-minute lock mid-question) and checks every column
against the script. Verified failing on the build before, and against three
deliberately broken builds: trophies counted as practice, hidden time booked on
return, parent time inside Dauer.

### Fehler über die Zeit — the dated error log

`mx` on a word is a lifetime tally with no dates. It can say he confuses m with
n; it cannot say whether that is getting better, and that is the only question
that decides whether a drill deserves his minutes. Buchstaben-Blitz was run 42
rounds on the strength of a number that could only grow.

Every reading answer now also lands in `L.ers[iso] = { n, w, p }`: answers,
wrong answers, and the letter pairs from `letterDiffs`, the same diff the
dashboard's lifetime card uses. `n` is the denominator, so a fortnight compares
with a fortnight of a different length. Turbo answers are excluded — forced
≤500 ms, so their error rate is not comparable with a normal day's. Mini-games
never touch it: their answers are not curriculum reading. 60 days, like `days`.

The dashboard shows errors per 100 answers for the last 14 days against the 14
before, and per-pair counts for both. Collection starts the day it shipped
(18 Sep 2026), so the earlier window is empty at first and the card says so.

**What prompted it** (measured from the 18 Sep export): 782 Buchstaben-Blitz
answers against 42 completed rounds, so 19% of drill answers came from rounds
he abandoned. A round is 15 items in a fixed order — 2 bare letters, 5
syllables, 8 real words — and `letterExposure` gives the first five the longest
flash, 1500 ms at his setting against 700 ms for items 11 to 15. Restarting
after five items therefore keeps him on the easiest items at the slowest
exposure, earns about a quarter more ring seconds per answer, and never reaches
the word items, which are the half aimed at reading. Meanwhile the drill's own
m/n number was 91% over 631 answers while his English reading still showed
about 44 m↔n substitutions. Drill mastery without transfer, the same shape as
the b/d case above. The drill is switched off; this log is how the decision to
switch it back on gets made — by a falling error rate, not by a drill score.
If it does come back, the round has to resume where he left it instead of
restarting, or the shortcut is still there.

`test_error_log` pins the counting, the 60-day trim and the mini-game exclusion.
It fails on the previous build, and on two broken ones: every answer counted as
wrong, and a Tier-Blitz answer leaking into the reading log.

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

## App icon

Deep blue ground (`#0036A0` top → `#002C88` bottom, the same faint vertical
gradient the first icon had), yellow bolt `#FDCC04`, white dot. The silhouette is
the original icon's, recoloured, so the shape is unchanged.
Two files, `icon-512.png` and `apple-touch-icon.png` (180 px, downsampled from the
512 master). `manifest.json` and the head block in `src/mkhtml.py` reference them
by fixed filename, so replacing the icon never touches either file.

**The icon is seen at 76 px, not at 512.** iPad home screen renders it at 76,
Spotlight at 60. A word-cloud icon was proposed and rejected on a measurement:
resized to 76 px the text became blue-and-white noise and only the bolt read at
all. Rule: **no text in the icon** — it has to work as a silhouette. Judge any
replacement by rendering it at 76 and 60 px, never by looking at the 512.

**No letterforms at all, not even decorative ones.** The rejected image contained
a mirror-reversed `GOOD` and a mangled `FHACTICE`. Mirror reversal is the exact
error class the b/d drill exists to correct, and the icon is a glyph he taps
several times a day.

**Contrast, measured not eyeballed.** Bolt against ground went 2.86–3.20 → 6.79–8.05
across the gradient (white on light blue → yellow on deep blue); the dot went
1.48 → 11.25. WCAG relative-luminance ratio. Keep any future icon above the old
3.20, and measure it rather than judging by eye — a large flat symbol looks fine
at 512 px at contrast that disappears at 60.

**Bump the `sw.js` cache name whenever an icon changes.** The fetch handler is
network-first, so an online load gets the new file regardless, but the
install-time `addAll` pins the icons into the named cache; without a rename the
old bytes survive there for offline loads. `blitzwort-v2` → `v3` shipped with
this icon.

**iOS bakes the home-screen icon at install time.** App content self-updates on
next open; the icon does not. The shortcut has to be deleted and re-added once
from Safari. Nothing is lost by doing that — progress lives in `localStorage` on
the origin, not inside the web clip. This is the one exception to "the iPad
updates itself".

## Storage

Keys: `sr.de`, `sr.en` (per-language progress, including `days` and the dated
error log `ers`), `sr.meta` (settings), `sr.ach` (achievements), `sr.sess`
(sittings for the dashboard). Dual-mode by design — `window.storage` inside a Claude artifact,
`localStorage` when deployed standalone — so the same source runs in both hosts.

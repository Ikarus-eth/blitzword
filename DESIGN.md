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

A chunk ends at **~2.5 min of active time or 50 questions**, whichever first.
**"Active time" is the sum of per-question response windows, not wall clock** — an
idle open tab must earn nothing, or the daily streak becomes meaningless.

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

100 badges: 10 categories × 10 tiers (first-time events, correct-in-a-row, questions
answered, words mastered, daily minutes, day streak, perfect-at-each-speed, practice
levels, levels mastered, turbo/gold).

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

`ach.seen` is a plain id→true map rather than a timestamp — a "last viewed"
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

Each mini-game carries its own 10, bringing the total to 120. Both follow the
same shape: two entry badges (first answer, first completed round), a four-step
volume ladder, a streak, a breadth or perfect-round badge, and one quality
badge that cannot be won by rushing.

That last one is the point. `k10` needs 90% across at least 100 vowel answers
and `l10` needs a pair retired — both reward accuracy over throughput. A badge
for answering quickly would work directly against the reason these modes exist.
`l10` is the only badge in the app awarded for no longer needing a feature.

Ids are worth one note: both categories are built from the shared `ladder`
factory with prefixes `k` and `l`, whose generated ids collide with the
hand-written entries and are remapped to `k3`–`k6` / `l3`–`l6`. A collision
would make two badges share an unlock slot and quietly render one unreachable,
so `test_minigame_awards` checks one hand-written and one remapped badge in the
same run. The badge total is derived from `ACHIEVEMENTS.length` everywhere it is
displayed — it used to be a literal `100` in the header and in two tests, which
is why adding a category broke them.

## Storage

Keys: `sr.de`, `sr.en` (per-language progress), `sr.meta` (settings), `sr.ach`
(achievements). Dual-mode by design — `window.storage` inside a Claude artifact,
`localStorage` when deployed standalone — so the same source runs in both hosts.

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

## Spaced repetition

Intervals **3 → 7 → 14 → 30 days**. A correct review advances one step; a miss
demotes the word to learning and resets the interval. A missed word is *also*
re-queued 3–6 items later in the same session and scheduled for tomorrow.

Due reviews are **interleaved 1 : 2 with new words**, not front-loaded. Front-loading
was tried and made every session open with a wall of previous failures.

## Two separate level gates — deliberate

- **Reach level** (which words enter practice): unlocks at **≥70%** of the previous
  level being mastered *or* "hot" (3 consecutive correct, awaiting its second day).
  Reachable inside one session.
- **Star level** (celebration + the ⭐ badge): **≥90% fully mastered**, which needs
  two calendar days minimum.

They are separate because gating practice on full mastery made day 1 mathematically
incapable of unlocking anything — 20 words cycled endlessly and felt like five. The
loose gate supplies variety fast; the strict gate keeps the celebration meaningful.

## Sessions

A chunk ends at **~2.5 min of active time or 50 questions**, whichever first.
**"Active time" is the sum of per-question response windows, not wall clock** — an
idle open tab must earn nothing, or the daily streak becomes meaningless.

Chunk end shows: a random encouragement phrase, accuracy, coins earned, any newly
mastered words, a "new words unlocked" banner, and the speed nudge.

**Adaptive speed nudge:** ≥90% accuracy over ≥8 answers suggests one step faster;
<60% suggests one step slower. One tap applies it. A 7-year-old will not calibrate
the slider himself, and automaticity training works just below the ceiling.

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
(e.g. `a↔e (7×)`, derived by diffing every wrong tile against its target), a 14-day
practice chart, voice settings, and export/import for moving progress between
devices.

## Storage

Keys: `sr.de`, `sr.en` (per-language progress), `sr.meta` (settings), `sr.ach`
(achievements). Dual-mode by design — `window.storage` inside a Claude artifact,
`localStorage` when deployed standalone — so the same source runs in both hosts.

# BlitzWort

Sight-reading / word-recognition speed trainer for a child (~7), German + English.
Runs as a PWA from the iPad home screen.

**Live:** https://ikarus-eth.github.io/blitzword/
(GitHub Pages, branch `main`, root folder)

Read **`DESIGN.md`** as well before changing behaviour — it explains *why* the
mastery model, level gates, reward gating and audio pipeline are shaped the way
they are. Most of those rules replaced a simpler version that failed in a
specific way.

## Repo layout

| path | what |
|---|---|
| `src/App.jsx` | **the only source you edit** — the whole React app |
| `src/entry.jsx` | mount point |
| `src/mkhtml.py` | inlines a built bundle into `index.html` |
| `src/build.sh` | rebuild `index.html` from `src/App.jsx` |
| `tests/` | test suite + `tests/run.sh` |
| `index.html` | **generated — never hand-edit.** Bundle is minified & inlined |
| `words/de-audio.json` | 200 German words, base64 mp3, one self-contained clip each |
| `sw.js` | service worker (network-first, `no-store`) |
| `manifest.json`, `*.png` | PWA metadata + icons |

## Workflow

```bash
./src/build.sh     # src/App.jsx -> index.html
./tests/run.sh     # runs the suite against the built index.html
```
Then commit `index.html` (and anything else changed). Pages redeploys automatically.

The suite takes ~9 minutes. Where a single command is limited to 300 s (the
Claude sandbox), run `tools/run_batched.sh /tmp/suite.log` repeatedly until it
prints `DONE` — same files, same pass rule, resumable.

## Things learned the hard way — don't undo these

- **`index.html` is generated.** Editing it directly is lost on the next build.
- **Audio is one independent clip per word.** An earlier version concatenated all
  200 into one file and seeked to computed offsets; MP3 frame-boundary seeking
  drifted and the app read out *wrong words*. Never reintroduce seeking.
- **Splitting a long recording into words is error-prone.** A pause inside a word
  (common before a final `t`/`d`/`g`) looks exactly like a word boundary. Counting
  segments is NOT sufficient validation — a split plus a merge cancel out and the
  count still looks right while words are silently misaligned. Validate by checking
  that the smallest word-gap is clearly larger than the largest in-word pause.
- **Service worker uses `cache: "no-store"` + `updateViaCache: 'none'`.** Without
  both, iOS serves a stale app indefinitely and deploys appear to do nothing.
- **No `localStorage` inside a Claude artifact**, but the deployed standalone app
  *does* use it — `speak()`/storage code paths detect which host they're in.
- **The home-screen icon does not self-update.** iOS bakes the icon into the web
  clip when the shortcut is created. A new `apple-touch-icon.png` only shows up
  after the shortcut is deleted and re-added from Safari; app content still
  updates on its own. Bump the `sw.js` cache name on any icon change.
- **Audio slowdown is baked into the files**, not applied at playback. `meta.audioV`
  guards against a stale saved playback-rate double-applying it.
- **The parent dashboard is behind a fresh arithmetic question**, asked on every
  open and never remembered. It was a fixed PIN (`1234`) for two days, until he
  cracked it. Any test that reaches the dashboard has to solve the question from
  `data-gate-a`/`data-gate-b`; three tests open the dashboard and one of them only
  turned up because it spells the gear `\u2699` and escaped a grep for the literal
  character.
- **`test_animal_mix` used to fail about 1 run in 3 under load, and the first
  write-up of why was wrong.** It was filed as the save debounce being too short.
  It was not: polling for the write did not fix it. The English leg tapped a tile,
  waited a flat 300 ms for the continue button, and when the render was slower
  than that the next iteration tapped a tile still showing feedback — the tap did
  nothing and the item was silently skipped, so a four-item leg recorded two
  answers and failed the count. It now waits for the button instead of guessing at
  render time. Both mechanisms were plausible from reading the code and only the
  measurement separated them; the same thing happened with the ⏱ timer fix. If
  this file goes red again, check the record count separately from the
  anti-guessing assertions — those are not timing-dependent and a failure there is
  real. Do not loosen a threshold to make it quiet.
- **Never raise `DAY_GOAL` as a global constant.** The streak is derived, so a
  higher goal is judged against days already practised and wipes them. Every day
  in the 4 Sep export was between 601 and 659 s; a global 660 would have taken a
  16-day streak to 0. The goal is stamped on each day at `creditDay` and read
  back with `goalOf`. `dayPct`/`dayDone` take the day record, not seconds.
- **A new badge category needs exactly 10 badges.** `test_minigame_awards`
  asserts the header total equals ten times the number of category tallies.
  Tipp-Blitz shipped with 8 and broke it; the fix is two more badges, not a
  looser assertion.
- **A new badge category also needs a `CAT_NAMES` entry.** Without one the
  trophy gallery throws while rendering and the whole screen goes blank.
  `test_achievements_e2e` catches it.
- **`tools/sim_type.mjs`** plays the built game with strategies a child could
  actually use and reports the hit rate of each. Run it after any change to the
  Tipp-Blitz board or queue: green tests said the 12-key board was fine, and the
  simulation showed vowel-guessing scoring 38%.
- **The Contents API can lag a push by ~30 s.** Straight after this commit it
  served the *pre-push* `src/App.jsx` while `index.html` from the same tree was
  already current — a verify step that trusts it reads a half-updated repo that
  does not exist and invites a panicked re-push. Verify against the blob SHA in
  the commit's tree (`/git/trees/<head>?recursive=1` then `/git/blobs/<sha>`):
  it is content-addressed and cannot be stale. Re-check Contents after, not
  instead.
- **A background test run in the sandbox dies silently at 300 s.** `nohup` and
  `setsid` do not protect it; twice the log simply stopped growing in the middle
  of `test_animal_mix`, which looks exactly like a hang in the test. Use
  `tools/run_batched.sh`. It also pins `TZ`: several tests key "today" by
  date, and a run crossing local midnight fails for no reason.
- **Never leave a repeating timer running in the app.** A 15 s `setInterval`
  added for session saves made `smoketest2` hang: it ends by letting the event
  loop drain, and a repeating timer never lets it, so the runner killed it at
  150 s and it looked like a hang inside the test. Sessions now save on taps,
  screen changes, answers and hide, which is enough.
- **Sittings (`sr.sess`) book presence from document-level click and pointerdown
  listeners.** A test that expects time on a screen has to touch it (a click on
  `document.body` is enough); an untouched stretch past 30 s is idle by design.
  JSDOM takes ~0.3 s to render the trophy gallery and that is booked to the
  screen being left, so keep tolerances at a second, not at a frame.
- **`meta` has three write sites** — the export object, the debounced save and
  `flush()`. A field added to one and not the others survives until a device move
  and then vanishes. That is how the badge case was wiped once.

## Deploying

Push to `main`; Pages rebuilds in ~1 min. Prefer one atomic commit via the Git Data
API (blobs → tree → commit → ref) so the site is never half-updated.
`words/de-audio.json` is ~1.6 MB, past the simple Contents API limit — use blobs.

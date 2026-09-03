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
- **The parent dashboard is behind a PIN** (`PARENT_PIN`, `1234`), asked on every
  open and never remembered. Any test that reaches the dashboard has to enter it;
  three did not and one of them only failed because it spelled the gear `\u2699`
  and escaped a grep for the literal character.
- **`test_animal_mix` fails intermittently, roughly 1 run in 8, and it is a
  timing race in the test rather than a bug.** The English leg plays 4 items and
  asserts that at least 3 landed in `sr.en.tm` after a fixed 1600 ms wait for the
  save debounce; a correct answer skips the continue tap, so a fast run can
  outpace the debounce and record 2. Re-run before treating it as a regression,
  and check whether the failing assertion is the record count — the anti-guessing
  assertions in the same file are not timing-dependent and a failure there is
  real. Do not loosen the threshold to make it quiet.
- **The Contents API can lag a push by ~30 s.** Straight after this commit it
  served the *pre-push* `src/App.jsx` while `index.html` from the same tree was
  already current — a verify step that trusts it reads a half-updated repo that
  does not exist and invites a panicked re-push. Verify against the blob SHA in
  the commit's tree (`/git/trees/<head>?recursive=1` then `/git/blobs/<sha>`):
  it is content-addressed and cannot be stale. Re-check Contents after, not
  instead.
- **`meta` has three write sites** — the export object, the debounced save and
  `flush()`. A field added to one and not the others survives until a device move
  and then vanishes. That is how the badge case was wiped once.

## Deploying

Push to `main`; Pages rebuilds in ~1 min. Prefer one atomic commit via the Git Data
API (blobs → tree → commit → ref) so the site is never half-updated.
`words/de-audio.json` is ~1.6 MB, past the simple Contents API limit — use blobs.

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
- **Audio slowdown is baked into the files**, not applied at playback. `meta.audioV`
  guards against a stale saved playback-rate double-applying it.

## Deploying

Push to `main`; Pages rebuilds in ~1 min. Prefer one atomic commit via the Git Data
API (blobs → tree → commit → ref) so the site is never half-updated.
`words/de-audio.json` is ~1.6 MB, past the simple Contents API limit — use blobs.

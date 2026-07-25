// each fake Audio instance carries the base64 payload it was built
// from, so we can assert not just "audio played" but "the RIGHT
// word's audio played" — this is exactly the property that broke
// with the seek-based sprite (right word requested, wrong one heard)
class FakeAudioElement {
  constructor(src) { this.src = src; this._playing = false; }
  play() {
    this._playing = true;
    return Promise.resolve().then(() => { this.onended && this.onended(); });
  }
}
global.Audio = FakeAudioElement;

const manifestData = {
  "hat": Buffer.from("AUDIO-FOR-HAT").toString("base64"),
  "Mütze": Buffer.from("AUDIO-FOR-MUTZE").toString("base64"),
  "und": Buffer.from("AUDIO-FOR-UND").toString("base64")
};
let fetchedUrl = null;
let fetchShouldFail = false;
global.fetch = (url) => {
  fetchedUrl = url;
  if (fetchShouldFail) return Promise.resolve({ ok: false });
  return Promise.resolve({ ok: true, json: () => Promise.resolve(manifestData) });
};

let synthCalls = [];
global.window = { speechSynthesis: { cancel: () => {}, speak: (u) => synthCalls.push(u), getVoices: () => [] } };
global.SpeechSynthesisUtterance = function (t) { this.text = t; this.voice = null; };

// reproduce the exact shipped module-scope state + functions
let wordAudioManifest = null;
let wordAudioManifestPromise = null;
const wordAudioCache = {};
const loadWordAudioManifest = () => {
  if (wordAudioManifest) return Promise.resolve(wordAudioManifest);
  if (!wordAudioManifestPromise) {
    wordAudioManifestPromise = Promise.resolve()
      .then(() => fetch("./words/de-audio.json"))
      .then((r) => { if (!r.ok) throw new Error("no audio manifest"); return r.json(); })
      .then((j) => { wordAudioManifest = j; return j; })
      .catch((e) => { wordAudioManifestPromise = null; throw e; });
  }
  return wordAudioManifestPromise;
};
const playRecorded = (word, lg) => {
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
      a.onended = resolve;
      a.onerror = () => { delete wordAudioCache[word]; reject(new Error("recording failed to play")); };
      a.play().catch(reject);
    });
  });
};
const speak = (word, lg, voiceURIs, rate, pitch) => {
  try {
    return playRecorded(word, lg).catch(() => {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word + ".");
        u.lang = lg === "de" ? "de-DE" : "en-GB";
        window.speechSynthesis.speak(u);
      } catch (e) {}
    });
  } catch (e) {}
};

let allOk = true;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  allOk = allOk && ok;
};
const payloadOf = (audioEl) => Buffer.from(audioEl.src.split(",")[1], "base64").toString();

async function run() {
  // the critical property: each requested word plays ITS OWN audio,
  // never another word's — repeated across several words, not just one
  await speak("hat", "de");
  check("hat -> plays hat's own audio, not any other word's", payloadOf(wordAudioCache["hat"]), "AUDIO-FOR-HAT");

  await speak("Mütze", "de");
  check("Mütze -> plays Mütze's own audio", payloadOf(wordAudioCache["Mütze"]), "AUDIO-FOR-MUTZE");

  await speak("und", "de");
  check("und -> plays und's own audio", payloadOf(wordAudioCache["und"]), "AUDIO-FOR-UND");

  // replaying an earlier word still gives its own audio, not
  // whatever was played most recently (no shared/mutated state)
  await speak("hat", "de");
  check("replaying hat still gives hat's audio, not und's (no cross-talk)", payloadOf(wordAudioCache["hat"]), "AUDIO-FOR-HAT");
  check("no speechSynthesis fallback triggered on any successful play", synthCalls.length, 0);

  // missing word -> clean fallback, not silence, not wrong audio
  synthCalls = [];
  await speak("nichtVorhanden", "de");
  check("word missing from manifest falls back to synthesis", synthCalls.length, 1);
  check("fallback speaks the correct (missing) word, not a cached one", synthCalls[0].text, "nichtVorhanden.");

  // manifest fetch failure -> still falls back cleanly
  wordAudioManifest = null; wordAudioManifestPromise = null; fetchShouldFail = true;
  synthCalls = [];
  await speak("hat", "de");
  check("manifest fetch failure falls back to synthesis without throwing", synthCalls.length, 1);

  // English never touches this machinery
  fetchedUrl = null; synthCalls = [];
  await speak("is", "en");
  check("English never fetches the German manifest", fetchedUrl, null);
  check("English speaks via synthesis directly", synthCalls.length, 1);

  console.log(`\n=== PER-WORD AUDIO CORRECTNESS TEST ${allOk ? "PASSED" : "FAILED"} ===`);
  process.exit(allOk ? 0 : 1);
}
run();

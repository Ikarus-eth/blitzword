class FakeAudioElement {
  constructor(src) { this.src = src; this.playbackRate = 1; this.preservesPitch = undefined; this.webkitPreservesPitch = undefined; }
  play() { return Promise.resolve().then(() => { this.onended && this.onended(); }); }
}
global.Audio = FakeAudioElement;

const manifestData = { hat: Buffer.from("AUDIO-FOR-HAT").toString("base64") };
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve(manifestData) });

let synthCalls = [];
global.window = { speechSynthesis: { cancel: () => {}, speak: (u) => synthCalls.push(u), getVoices: () => [] } };
global.SpeechSynthesisUtterance = function (t) { this.text = t; this.voice = null; this.rate = null; this.pitch = null; };

// reproduce the exact shipped functions
let wordAudioManifest = null, wordAudioManifestPromise = null;
const wordAudioCache = {};
const loadWordAudioManifest = () => {
  if (wordAudioManifest) return Promise.resolve(wordAudioManifest);
  if (!wordAudioManifestPromise) {
    wordAudioManifestPromise = Promise.resolve().then(() => fetch("./words/de-audio.json"))
      .then((r) => { if (!r.ok) throw new Error("no audio manifest"); return r.json(); })
      .then((j) => { wordAudioManifest = j; return j; });
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
      if (!a) { a = new Audio("data:audio/mpeg;base64," + b64); wordAudioCache[word] = a; }
      a.currentTime = 0;
      a.playbackRate = typeof rate === "number" ? rate : 0.92;
      a.preservesPitch = true;
      a.webkitPreservesPitch = true;
      a.onended = resolve;
      a.onerror = () => { delete wordAudioCache[word]; reject(new Error("recording failed to play")); };
      a.play().catch(reject);
    });
  });
};
const speak = (word, lg, voiceURIs, rate, pitch) => {
  return playRecorded(word, lg, rate).catch(() => {
    const u = new SpeechSynthesisUtterance(word + ".");
    u.rate = rate; window.speechSynthesis.speak(u);
  });
};

let allOk = true;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  allOk = allOk && ok;
};

async function run() {
  // default rate applied when none passed
  await speak("hat", "de");
  check("default rate applied to recorded audio", wordAudioCache["hat"].playbackRate, 0.92);
  check("pitch preserved so slowdown doesn't sound deep/monstrous", wordAudioCache["hat"].preservesPitch, true);
  check("Safari-prefixed property also set", wordAudioCache["hat"].webkitPreservesPitch, true);
  check("synthesis fallback NOT triggered", synthCalls.length, 0);

  // slider value actually changes it — simulating dragging to the slow end
  await speak("hat", "de", {}, 0.6);
  check("slider set to 0.6 -> playbackRate is 0.6, not the default", wordAudioCache["hat"].playbackRate, 0.6);

  // and the fast end
  await speak("hat", "de", {}, 1.15);
  check("slider set to 1.15 -> playbackRate is 1.15", wordAudioCache["hat"].playbackRate, 1.15);

  console.log(`\n=== RECORDED-AUDIO RATE CONTROL TEST ${allOk ? "PASSED" : "FAILED"} ===`);
  process.exit(allOk ? 0 : 1);
}
run();

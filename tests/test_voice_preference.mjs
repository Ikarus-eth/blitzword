// direct extraction of the pure voice-selection logic, no DOM needed
let voiceList = [
  { name: "Anna (Compact)", lang: "de-DE", voiceURI: "compact.de-DE.Anna" },
  { name: "Petra (Enhanced)", lang: "de-DE", voiceURI: "enhanced.de-DE.Petra" },
  { name: "Samantha (Compact)", lang: "en-US", voiceURI: "compact.en-US.Samantha" },
  { name: "Daniel (Enhanced)", lang: "en-GB", voiceURI: "enhanced.en-GB.Daniel" }
];
const voicesForLang = (lg) => voiceList.filter((v) => v.lang && v.lang.toLowerCase().startsWith(lg));
const NOVELTY_VOICES = new Set(["albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos", "deranged",
  "good news", "hysterical", "jester", "kathy", "organ", "pipe organ", "ralph", "trinoids", "whisper", "zarvox",
  "eddy", "flo", "grandma", "grandpa", "reed", "rocko", "sandy", "shelley", "fred", "junior", "princess", "wobble", "superstar"]);
const isNovelty = (name) => NOVELTY_VOICES.has((name || "").toLowerCase().trim());
const sortedVoices = (lg) => [...voicesForLang(lg)].sort((a, b) => (isNovelty(a.name) ? 1 : 0) - (isNovelty(b.name) ? 1 : 0));

let lastUtterance = null;
global.window = {
  speechSynthesis: {
    cancel: () => {},
    speak: (u) => { lastUtterance = u; }
  }
};
global.SpeechSynthesisUtterance = function (text) { this.text = text; this.voice = null; };

// reproduce speak() verbatim from the source so this test exercises the
// exact shipped logic, not a paraphrase of it
const speak = (word, lg, voiceURIs, rate) => {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const targetLang = lg === "de" ? "de-DE" : "en-GB";
    const u = new SpeechSynthesisUtterance(word + ".");
    u.lang = targetLang;
    u.rate = typeof rate === "number" ? rate : 0.92;
    const wanted = voiceURIs && voiceURIs[lg];
    const cands = sortedVoices(lg);
    const exact = cands.filter((x) => x.lang === targetLang);
    const pool = exact.length ? exact : cands;
    const v = (wanted && cands.find((x) => x.voiceURI === wanted)) || pool[0];
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) {}
};

let allOk = true;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  allOk = allOk && ok;
};

// no preference set -> falls back to the first de-DE match (Anna, compact)
speak("ist", "de", {}, 0.92);
check("no preference -> first match (Anna)", lastUtterance.voice.voiceURI, "compact.de-DE.Anna");
check("default rate applied", lastUtterance.rate, 0.92);
check("trailing period added", lastUtterance.text, "ist.");

// explicit preference for the Enhanced voice -> should override the default
speak("ist", "de", { de: "enhanced.de-DE.Petra" }, 0.92);
check("saved preference -> Petra (Enhanced), not the default Anna", lastUtterance.voice.voiceURI, "enhanced.de-DE.Petra");

// preference for a voice that ISN'T installed on this device -> falls
// back gracefully to the first match instead of leaving voice unset
speak("ist", "de", { de: "enhanced.de-DE.DoesNotExist" }, 0.92);
check("missing preferred voice -> graceful fallback to first match", lastUtterance.voice.voiceURI, "compact.de-DE.Anna");

// English uses en-GB matching (Daniel), independent of the German pref
speak("is", "en", { de: "enhanced.de-DE.Petra" }, 0.92);
check("en preference unset -> prefers exact en-GB match (Daniel) over en-US", lastUtterance.voice.voiceURI, "enhanced.en-GB.Daniel");

// if no en-GB voice is installed at all, gracefully falls back to
// whatever English variant IS available rather than speaking nothing
voiceList = voiceList.filter((v) => v.voiceURI !== "enhanced.en-GB.Daniel");
speak("is", "en", {}, 0.92);
check("no en-GB installed -> falls back to en-US (Samantha) rather than silence", lastUtterance.voice.voiceURI, "compact.en-US.Samantha");

// custom rate is honored
speak("ist", "de", {}, 0.7);
check("custom rate honored", lastUtterance.rate, 0.7);

console.log(`\n=== VOICE PREFERENCE UNIT TEST ${allOk ? "PASSED" : "FAILED"} ===`);
process.exit(allOk ? 0 : 1);

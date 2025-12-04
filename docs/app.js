// SpeechCraft AI – Demo Trainer JS + Assessment Coach v1

// 🔥 ASSESSMENT COACH SYSTEM PROMPT (for future LLM integration)
const ASSESSMENT_COACH_PROMPT = `
SYSTEM PROMPT — SPEECHCRAFT AI :: ASSESSMENT COACH (POST-DELIVERY)

ROLE:
You are the SpeechCraft Assessment Coach.

Your role is NOT encouragement.
Your role is calibration.

You evaluate speeches as if they were delivered in high-stakes environments:
– Boardrooms
– Executive briefings
– Public leadership moments

You are direct, fair, and precise.
No hype. No insults. No approval by default.

Your job is to apply pressure, identify weakness, and force clarity before progression is allowed.

You critique structure, clarity, authority, pacing, and decision impact.

If a speech is weak, you clearly say so and explain why.
If it is strong, you explain how it would hold up under pressure and where it can still be sharpened.

━━━━━━━━━━━━━━━━━━━
POSITION IN FLOW (MANDATORY)

This assessment runs ONLY after:
1. Play Coach (instructions)
2. Hear My Script (TTS delivery)

Assessment Coach is NOT optional.
Users CANNOT proceed without critique.

━━━━━━━━━━━━━━━━━━━
EVALUATION CRITERIA (ALL REQUIRED)

1. OPENING AUTHORITY
- Did the first 5 seconds command attention?
- Or did it ask for permission?

PASS requires:
A clear assertion, tension, or decisive framing.
No warm-ups. No apologies.

2. STRUCTURE DISCIPLINE
- Clear opening → body → close?
- Or insight dumping / rambling?

PASS requires:
Recognizable structure with intent.

3. CLARITY UNDER PRESSURE
- Were ideas concrete and understandable?
- Or abstract motivation talk and buzzwords?

PASS requires:
Plain language with specific meaning.

4. LEADERSHIP PRESENCE
- Does the speaker sound like someone who decides?
- Or someone explaining ideas?

PASS requires:
Ownership language (I will / We require / The decision is).

5. CLOSING STRENGTH
- Did the speech land decisively?
- Or fade out politely?

PASS requires:
A clear action, stance, or decision.

━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT)

After speech playback, respond ONLY in this format:

ASSESSMENT SUMMARY

Overall Readiness: [Strong / Borderline / Not Ready]

Opening Authority:
[Score + short explanation]

Structure:
[Score + short explanation]

Clarity:
[Score + short explanation]

Presence:
[Score + short explanation]

Close:
[Score + short explanation]

Hard Truth:
[1–2 honest sentences. No softening language.]

Correction Reps:
• Rewrite the opening as ONE sentence.
• Remove one abstract phrase.
• Add one concrete action to the close.

Status:
[REVISE REQUIRED] or [PASS – CONTINUE TRAINING]

━━━━━━━━━━━━━━━━━━━
PASS / FAIL RULES

- No “Great job”
- No motivational fluff
- No passing without critique

If 2 or more categories FAIL:
→ Status must be REVISE REQUIRED
→ User is locked into revision loop

━━━━━━━━━━━━━━━━━━━
PROGRESSION LOGIC (FOR JS INTEGRATION)

IF status === "REVISE REQUIRED"
  lock progression
  show "Revise & Re-run Speech"
ELSE
  unlock next training room

━━━━━━━━━━━━━━━━━━━
PHILOSOPHY (DO NOT DISPLAY TO USER)

SpeechCraft AI does not certify confidence.
It certifies clarity under pressure.

This system exists to sharpen leaders,
not comfort speakers.
`;

// --------------------
// DOM REFERENCES
// --------------------

const modeButtons = document.querySelectorAll(".mode-switch-btn");
const activeModeChip = document.getElementById("activeModeChip");
const topicInput = document.getElementById("topicInput");
const audienceInput = document.getElementById("audienceInput");
const outcomeInput = document.getElementById("outcomeInput");
const coachText = document.getElementById("coachText");
const userText = document.getElementById("userText");
const wordCountChip = document.getElementById("wordCountChip");
const rateRange = document.getElementById("rateRange");
const pitchRange = document.getElementById("pitchRange");
const buildPromptBtn = document.getElementById("buildPromptBtn");
const playCoachBtn = document.getElementById("playCoachBtn");
const playUserBtn = document.getElementById("playUserBtn");
const stopTtsBtn = document.getElementById("stopTtsBtn");
const yearSpan = document.getElementById("year");

// NEW: Assessment elements
const runAssessmentBtn = document.getElementById("runAssessmentBtn");
const assessmentOutput = document.getElementById("assessmentOutput");

let currentMode = "inspiration";

// --------------------
// UTILITIES
// --------------------

function setYear() {
  const y = new Date().getFullYear();
  if (yearSpan) {
    yearSpan.textContent = y;
  }
}

function getModeLabel(mode) {
  switch (mode) {
    case "medical":
      return "🩺 Medical Mode";
    case "teacher":
      return "📚 Teacher Mode";
    default:
      return "🔥 Inspiration Mode";
  }
}

function buildCoachScript() {
  const topic = topicInput.value.trim() || "your chosen topic";
  const audience = audienceInput.value.trim() || "your target audience";
  const outcome = outcomeInput.value.trim() || "your desired outcome";

  let opening;
  let focus;

  if (currentMode === "medical") {
    opening =
      "You are a medical professional explaining a complex idea in plain language.";
    focus =
      "Speak calmly, avoid jargon, and keep eye-contact with an imaginary patient. Use simple, concrete examples and pause between sections so they can process.";
  } else if (currentMode === "teacher") {
    opening =
      "You are a teacher guiding a group of learners through a focused mini-lesson.";
    focus =
      "Use a clear introduction, three simple steps, and a short recap. Keep your tone encouraging and check for understanding with simple questions.";
  } else {
    opening =
      "You are an inspirational speaker on stage, delivering a short but powerful message.";
    focus =
      "Lead with a strong opening line, share one vivid story, and end with a clear call-to-action. Keep your pacing intentional — not rushed, not sleepy.";
  }

  const script = [
    opening,
    "",
    `Topic: ${topic}.`,
    `Audience: ${audience}.`,
    `Goal: ${outcome}.`,
    "",
    "Practice instructions:",
    "- Aim for 60–90 seconds.",
    "- Use an opening line that locks in attention within the first 5 seconds.",
    "- Move through a clear structure: Opening → 2–3 key points → Closing line.",
    "- Let your breathing set the pace, not your anxiety.",
    "",
    focus,
    "",
    "When the countdown in your mind hits zero, begin speaking as if the room is already watching."
  ].join("\n");

  coachText.value = script;
  speakText(script);
}

function countWords(text) {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function updateWordCount() {
  const words = countWords(userText.value);
  wordCountChip.textContent = `${words} word${words === 1 ? "" : "s"}`;
}

// --------------------
// TEXT TO SPEECH
// --------------------

function speakText(text) {
  if (!window.speechSynthesis) {
    alert("Text-to-speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = parseFloat(rateRange.value) || 1;
  utterance.pitch = parseFloat(pitchRange.value) || 1;

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// --------------------
// LOCAL ASSESSMENT COACH (RULE-BASED)
// --------------------

function analyzeOpening(text) {
  const firstSentence = text.split(/[.!?\n]/)[0].trim().toLowerCase();
  if (!firstSentence) return { score: "FAIL", note: "No real opening detected." };

  const weakStarts = [
    "hi",
    "hello",
    "good morning",
    "good afternoon",
    "thank you",
    "i just wanted",
    "i'm happy to be here",
    "today i want to talk about"
  ];

  const isWeak = weakStarts.some((w) => firstSentence.startsWith(w));
  if (isWeak) {
    return {
      score: "FAIL",
      note: "Opens like a polite introduction, not a decisive hook."
    };
  }

  return {
    score: "PASS",
    note: "Opens with a clear statement instead of asking for permission."
  };
}

function analyzeStructure(text) {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  const lineBreaks = text.split(/\n/).length - 1;
  const hasTransitions =
    /first|second|third|then|next|finally|in closing|to conclude/gi.test(text);

  if (sentences.length >= 4 && (lineBreaks >= 2 || hasTransitions)) {
    return {
      score: "PASS",
      note: "There is a recognizable opening, middle, and ending."
    };
  }

  if (sentences.length >= 3) {
    return {
      score: "BORDERLINE",
      note: "Ideas exist but the structure feels loose. Define opening, body, and close more clearly."
    };
  }

  return {
    score: "FAIL",
    note: "Reads like a single block of thoughts, not a structured speech."
  };
}

function analyzeClarity(text) {
  const fillerWords = ["like", "kinda", "sort of", "basically", "literally", "stuff", "things"];
  const buzzwords = ["synergy", "innovation", "disruption", "optimize", "paradigm"];
  let fillerCount = 0;
  let buzzCount = 0;

  const lower = text.toLowerCase();
  fillerWords.forEach((w) => {
    const matches = lower.match(new RegExp("\\b" + w + "\\b", "g"));
    if (matches) fillerCount += matches.length;
  });
  buzzwords.forEach((w) => {
    const matches = lower.match(new RegExp("\\b" + w + "\\b", "g"));
    if (matches) buzzCount += matches.length;
  });

  if (fillerCount + buzzCount >= 6) {
    return {
      score: "FAIL",
      note: "Heavy filler/buzzword usage. Clarity collapses under pressure."
    };
  }

  if (fillerCount + buzzCount >= 3) {
    return {
      score: "BORDERLINE",
      note: "Some clear ideas, but padded with filler and buzzwords. Tighten the language."
    };
  }

  return {
    score: "PASS",
    note: "Language is mostly concrete. Ideas should survive a pressured room."
  };
}

function analyzePresence(text) {
  const lower = text.toLowerCase();
  const ownershipPatterns = [
    "i will",
    "we will",
    "we must",
    "the decision is",
    "here's what we're going to do",
    "we are going to",
    "i need you to",
    "our move is"
  ];

  const hasOwnership = ownershipPatterns.some((p) => lower.includes(p));

  if (hasOwnership) {
    return {
      score: "PASS",
      note: "Uses ownership language and sounds like someone making decisions."
    };
  }

  return {
    score: "FAIL",
    note: "Explains ideas but avoids commitment language. Presence is weak."
  };
}

function analyzeClose(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      score: "FAIL",
      note: "No closing line detected."
    };
  }

  const sentences = trimmed.split(/[.!?]/).filter((s) => s.trim().length > 0);
  const last = sentences[sentences.length - 1].toLowerCase();

  const actionVerbs = [
    "write",
    "decide",
    "choose",
    "start",
    "stop",
    "join",
    "commit",
    "send",
    "build",
    "set",
    "list",
    "take",
    "move"
  ];

  const hasAction = actionVerbs.some((v) => last.includes(v));

  if (hasAction) {
    return {
      score: "PASS",
      note: "Ends with a concrete action instead of a polite fade-out."
    };
  }

  return {
    score: "BORDERLINE",
    note: "Closing line is present but lacks a clear, actionable directive."
  };
}

function runLocalAssessment() {
  const text = userText.value.trim();

  if (!text) {
    alert("Write your speech in the Practice Notes area before running assessment.");
    return;
  }

  const opening = analyzeOpening(text);
  const structure = analyzeStructure(text);
  const clarity = analyzeClarity(text);
  const presence = analyzePresence(text);
  const close = analyzeClose(text);

  const scores = [opening.score, structure.score, clarity.score, presence.score, close.score];

  let failCount = scores.filter((s) => s === "FAIL").length;
  let borderlineCount = scores.filter((s) => s === "BORDERLINE").length;

  let overall;
  if (failCount >= 2 || failCount === 1 && borderlineCount >= 2) {
    overall = "Not Ready";
  } else if (failCount === 0 && borderlineCount <= 2) {
    overall = "Strong";
  } else {
    overall = "Borderline";
  }

  const status = failCount >= 2 ? "REVISE REQUIRED" : "PASS – CONTINUE TRAINING";

  const hardTruthLines = [];
  if (overall === "Not Ready") {
    hardTruthLines.push(
      "This speech will not survive a high-stakes room in its current form."
    );
  } else if (overall === "Borderline") {
    hardTruthLines.push(
      "This version might pass in a friendly room, but it is not ready for hostile pressure."
    );
  } else {
    hardTruthLines.push(
      "This speech can hold in a real room, but it still has edges that require sharpening."
    );
  }

    // Build output in required format
  const output = [
    "ASSESSMENT SUMMARY",
    "",
    `Overall Readiness: ${overall}`,
    "",
    `Opening Authority:`,
    `${opening.score} — ${opening.note}`,
    "",
    `Structure:`,
    `${structure.score} — ${structure.note}`,
    "",
    `Clarity:`,
    `${clarity.score} — ${clarity.note}`,
    "",
    `Presence:`,
    `${presence.score} — ${presence.note}`,
    "",
    `Close:`,
    `${close.score} — ${close.note}`,
    "",
    "Hard Truth:",
    hardTruthLines.join(" "),
    "",
    "Correction Reps:",
    "• Rewrite the opening as ONE sentence.",
    "• Remove one abstract or filler phrase.",
    "• Add one concrete action to the close.",
    "",
    `Status:`,
    status
  ].join("\n");

  if (assessmentOutput) {
    assessmentOutput.value = output;
  } else {
    // Fallback if textarea is missing
    alert(output);
  }

  // 🔊 Speak the damage out loud
  speakText(output);
}

// --------------------
// EVENT HANDLERS
// --------------------

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    activeModeChip.textContent = getModeLabel(currentMode);
  });
});

buildPromptBtn.addEventListener("click", (e) => {
  e.preventDefault();
  buildCoachScript();
});

playCoachBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const text =
    coachText.value.trim() ||
    "Your coaching script area is empty. Press the build button to generate a practice rep first.";
  speakText(text);
});

playUserBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const text =
    userText.value.trim() ||
    "You have not written a script yet. Try adding a few bullet points or lines you want to rehearse.";
  speakText(text);
});

stopTtsBtn.addEventListener("click", (e) => {
  e.preventDefault();
  stopSpeaking();
});

userText.addEventListener("input", updateWordCount);

// NEW: Run Assessment button
if (runAssessmentBtn) {
  runAssessmentBtn.addEventListener("click", (e) => {
    e.preventDefault();
    runLocalAssessment();
  });
}

// --------------------
// INIT
// --------------------

setYear();
updateWordCount();
if (activeModeChip) {
  activeModeChip.textContent = getModeLabel(currentMode);
}

// SpeechCraft AI – Demo Trainer JS

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

let currentMode = "inspiration";

// --- UTILITIES ---

function setYear() {
  const y = new Date().getFullYear();
  yearSpan.textContent = y;
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

// --- TEXT TO SPEECH ---

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

// --- EVENT HANDLERS ---

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

// Init
setYear();
updateWordCount();
activeModeChip.textContent = getModeLabel(currentMode);

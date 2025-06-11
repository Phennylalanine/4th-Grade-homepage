const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answerInput");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const levelEl = document.getElementById("level");
const comboEl = document.getElementById("combo");
const xpFloatContainer = document.getElementById("xpFloatContainer");
const confettiContainer = document.getElementById("confetti");

let questions = [];
let currentIndex = -1;
let lastIndex = -1;
let level = parseInt(localStorage.getItem("months_level")) || 1;
let xp = parseInt(localStorage.getItem("months_xp")) || 0;
let combo = 0;
let doubleXP = false;
let tripleXP = false;
let quadrupleXP = false;
let quintupleXP = false;

fetch("questions.csv")
  .then(response => response.text())
  .then(text => {
    questions = text
      .trim()
      .split("\n")
      .map(line => {
        const [jp, en] = line.split(",");
        return { jp: jp.trim(), en: en.trim() };
      });
    shuffleQuestions();
  });

function shuffleQuestions() {
  // Fisher-Yates shuffle but with no immediate repeats
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
}

function getNextIndex() {
  let idx;
  do {
    idx = Math.floor(Math.random() * questions.length);
  } while (idx === lastIndex);
  lastIndex = idx;
  return idx;
}

function startQuiz() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";
  loadNextQuestion();
}

function loadNextQuestion() {
  currentIndex = getNextIndex();
  const question = questions[currentIndex];
  questionEl.textContent = `${question.jp} - ${question.en}`;
  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();
  submitBtn.disabled = false;
  nextBtn.disabled = true;
  comboEl.textContent = combo;
  levelEl.textContent = `Level: ${level}`;
  updateProgressBar();
  speakEnglish(question.en);
}

function updateProgressBar() {
  const xpNeeded = (level + 1) * 3;
  progressBar.max = xpNeeded;
  progressBar.value = xp;
}

function handleAnswerSubmit() {
  const answer = answerInput.value.trim();
  const correct = questions[currentIndex].en;
  if (answer === "") return; // no blank submissions
  if (answer === correct) {
    combo++;
    xp += 1;
    if (combo >= 15) {
      doubleXP = true;
      if (combo >= 20) tripleXP = true;
      if (combo >= 25) quadrupleXP = true;
      if (combo >= 35) quintupleXP = true;
    }
    if (doubleXP) {
      xp += 1;
      showXPFloat("+2 XP!");
    }
    if (tripleXP) {
      xp += 2;
      showXPFloat("+3 XP!");
    }
    if (quadrupleXP) {
      xp += 3;
      showXPFloat("+4 XP!");
    }
    if (quintupleXP) {
      xp += 4;
      showXPFloat("+5 XP!");
    }
    checkLevelUp();
    comboEl.textContent = combo;
  } else {
    combo = 0;
    comboEl.textContent = combo;
    alert(`Your input: ${answer}\nCorrect input: ${correct}`);
  }
  answerInput.disabled = true;
  submitBtn.disabled = true;
  nextBtn.disabled = false;
}

function checkLevelUp() {
  const xpNeeded = (level + 1) * 3;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    localStorage.setItem("months_level", level);
    confettiBurst();
  }
  localStorage.setItem("months_xp", xp);
  updateProgressBar();
  levelEl.textContent = `Level: ${level}`;
}

function confettiBurst() {
  const confettiCount = 100;
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti-piece");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
    confetti.style.animationDuration = (Math.random() * 3 + 2) + "s";
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
}

function showXPFloat(text) {
  const floatEl = document.createElement("div");
  floatEl.classList.add("xp-float");
  floatEl.textContent = text;
  xpFloatContainer.appendChild(floatEl);
  setTimeout(() => {
    floatEl.style.opacity = "0";
    setTimeout(() => floatEl.remove(), 1000);
  }, 1500);
}

function speakEnglish(text) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.cancel(); // cancel previous speech if any
  window.speechSynthesis.speak(utterance);
}

submitBtn.addEventListener("click", handleAnswerSubmit);

nextBtn.addEventListener("click", loadNextQuestion);

answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (answerInput.disabled) {
      if (!nextBtn.disabled) {
        loadNextQuestion();
      }
    } else {
      handleAnswerSubmit();
    }
  }
});

document.getElementById("startBtn").addEventListener("click", startQuiz);

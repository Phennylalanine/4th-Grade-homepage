// script.js

let questions = [];
let currentIndex = -1;
let points = 0;
let combo = 0;
let xp = 0;
let level = 1;

const xpBar = document.getElementById("xpBar");
const pointsEl = document.getElementById("points");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const jpTextEl = document.getElementById("jpText");
const enTextEl = document.getElementById("enText");
const answerInput = document.getElementById("answerInput");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

let lastQuestionIndex = null;
let confettiParticles = [];
let confettiAnimationId = null;

// Keys for localStorage
const levelKey = "months_level";
const xpKey = "months_xp";

// Load level and xp from localStorage or default
function loadProgress() {
  level = parseInt(localStorage.getItem(levelKey)) || 1;
  xp = parseInt(localStorage.getItem(xpKey)) || 0;
  updateLevelDisplay();
  updateXpBar();
}

// Save level and xp to localStorage
function saveProgress() {
  localStorage.setItem(levelKey, level);
  localStorage.setItem(xpKey, xp);
}

function updateLevelDisplay() {
  levelEl.textContent = level;
}

function updateXpBar() {
  const neededXp = (level + 1) * 3;
  const percent = Math.min((xp / neededXp) * 100, 100);
  xpBar.style.width = percent + "%";
}

function nextQuestion() {
  feedbackEl.textContent = "";
  answerInput.value = "";
  nextBtn.disabled = true;
  answerInput.disabled = false;
  answerInput.focus();

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * questions.length);
  } while (newIndex === lastQuestionIndex && questions.length > 1);

  currentIndex = newIndex;
  lastQuestionIndex = currentIndex;

  const q = questions[currentIndex];
  jpTextEl.textContent = q.jp;
  enTextEl.textContent = q.en;

  // Speak the English word automatically
  speakWord(q.en);
}

function speakWord(text) {
  if (!window.speechSynthesis) return;

  // Cancel any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

function handleAnswerSubmit() {
  const userAnswer = answerInput.value;
  const correctAnswer = questions[currentIndex].en;

  if (userAnswer === "") {
    feedbackEl.textContent = "Please type your answer.";
    return;
  }

  if (userAnswer === correctAnswer) {
    // Correct
    feedbackEl.style.color = "green";
    feedbackEl.textContent = "Correct!";
    points++;
    combo++;
    let xpGain = 1;

    if (combo >= 15) {
      // Double XP at 15+
      xpGain *= 2;
    }
    if (combo >= 20) {
      // Triple XP at 20+
      xpGain *= 1.5;
    }
    if (combo >= 25) {
      // Quadruple XP at 25+
      xpGain *= 1.33;
    }
    if (combo >= 35) {
      // Quintuple XP at 35+
      xpGain *= 1.25;
    }
    xpGain = Math.floor(xpGain);

    addXp(xpGain);

    pointsEl.textContent = points;
    comboEl.textContent = combo;

  } else {
    // Incorrect
    feedbackEl.style.color = "red";
    feedbackEl.innerHTML = `Your input: <b>${userAnswer}</b><br>Correct input: <b>${correctAnswer}</b>`;
    combo = 0;
    comboEl.textContent = combo;
  }

  answerInput.disabled = true;
  nextBtn.disabled = false;
}

function addXp(amount) {
  xp += amount;
  const neededXp = (level + 1) * 3;

  showFloatingXp(`+${amount} XP`);

  while (xp >= neededXp) {
    xp -= neededXp;
    level++;
    updateLevelDisplay();
    confettiExplosion();
  }

  updateXpBar();
  saveProgress();
}

// Floating XP animation
function showFloatingXp(text) {
  const xpFloat = document.createElement("div");
  xpFloat.classList.add("floating-xp");
  xpFloat.textContent = text;
  xpFloat.style.left = (window.innerWidth / 2 - 30 + (Math.random() * 60 - 30)) + "px";
  xpFloat.style.top = (window.innerHeight / 2 + 20) + "px";
  document.body.appendChild(xpFloat);

  setTimeout(() => {
    xpFloat.remove();
  }, 1500);
}

// CONFETTI

function confettiExplosion() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  confettiParticles = [];

  const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];

  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      r: Math.random() * 6 + 4,
      d: Math.random() * 20 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  if (!confettiAnimationId) {
    runConfetti();
    setTimeout(() => {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
      clearCanvas();
    }, 3000);
  }
}

function runConfetti() {
  confettiAnimationId = requestAnimationFrame(runConfetti);
  clearCanvas();
  updateConfetti();
  drawConfetti();
}

function clearCanvas() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

function updateConfetti() {
  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    p.tiltAngle += p.tiltAngleIncremental;
    p.x += Math.sin(p.tiltAngle) * 2;
    p.y += (Math.cos(p.tiltAngle) + 3 + p.d / 2) * 1.5;
    p.tilt = Math.sin(p.tiltAngle) * 15;

    if (p.y > window.innerHeight) {
      p.x = Math.random() * window.innerWidth;
      p.y = -20;
      p.tilt = Math.random() * 10 - 10;
    }
  }
}

function drawConfetti() {
  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    confettiCtx.beginPath();
    confettiCtx.lineWidth = p.r / 2;
    confettiCtx.strokeStyle = p.color;
    confettiCtx.moveTo(p.x + p.tilt + p.r / 4, p.y);
    confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
    confettiCtx.stroke();
  }
}

// Load CSV questions from file
function loadCSV() {
  return fetch("questions.csv")
    .then(response => response.text())
    .then(text => {
      const lines = text.trim().split("\n");
      const qArray = [];

      for (const line of lines) {
        // CSV format: jp,en
        const [jp, en] = line.split(",");
        if (jp && en) qArray.push({ jp: jp.trim(), en: en.trim() });
      }
      return qArray;
    });
}

// Event listeners
answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !nextBtn.disabled) {
    nextQuestion();
  } else if (e.key === "Enter") {
    handleAnswerSubmit();
  }
});

nextBtn.addEventListener("click", () => {
  nextQuestion();
});

document.getElementById("startBtn").addEventListener("click", () => {
  startScreen.classList.remove("active");
  quizScreen.classList.add("active");
  answerInput.focus();
  loadCSV().then(qs => {
    questions = qs;
    loadProgress();
    nextQuestion();
  });
});

// For debugging - uncomment to test directly without start screen
// loadCSV().then(qs => {
//   questions = qs;
//   loadProgress();
//   nextQuestion();
//   startScreen.classList.remove("active");
//   quizScreen.classList.add("active");
// });


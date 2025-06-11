// script.js

// Confetti lib (tiny, vanilla) - adapted from https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js
// For simplicity, here is a minimal confetti function:
function confettiBurst() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() * 0.6 }
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Load canvas-confetti from CDN dynamically
function loadConfettiLib() {
  return new Promise((res) => {
    if (window.confetti) return res();
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.onload = () => res();
    document.body.appendChild(script);
  });
}

const jpQuestionEl = document.getElementById("jpQuestion");
const enQuestionEl = document.getElementById("enQuestion");
const answerInput = document.getElementById("answerInput");
const nextBtn = document.getElementById("nextBtn");
const messageEl = document.getElementById("message");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const xpBar = document.getElementById("xpBar");
const xpBarContainer = document.getElementById("xpBarContainer");

const STORAGE_LEVEL_KEY = "months_level";
const STORAGE_XP_KEY = "months_xp";

let questions = [];
let currentIndex = 0;
let score = 0;
let combo = 0;
let xp = 0;
let level = 1;
let answered = false;

// XP needed for next level
function xpToNextLevel(lv) {
  return (lv + 1) * 3;
}

// Load saved data or initialize
function loadData() {
  level = parseInt(localStorage.getItem(STORAGE_LEVEL_KEY)) || 1;
  xp = parseInt(localStorage.getItem(STORAGE_XP_KEY)) || 0;
  updateLevelDisplay();
  updateXPBar();
}

// Save data
function saveData() {
  localStorage.setItem(STORAGE_LEVEL_KEY, level);
  localStorage.setItem(STORAGE_XP_KEY, xp);
}

// Show question
function showQuestion() {
  if (currentIndex >= questions.length) {
    // End of quiz
    jpQuestionEl.textContent = "🎉 You've completed all questions!";
    enQuestionEl.textContent = "";
    answerInput.disabled = true;
    nextBtn.disabled = true;
    return;
  }
  const q = questions[currentIndex];
  jpQuestionEl.textContent = q.jp;
  enQuestionEl.textContent = q.en;
  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();
  nextBtn.disabled = true;
  messageEl.textContent = "";
  answered = false;
}

function showXPFloat(multiplier) {
  const floatEl = document.createElement("div");
  floatEl.textContent = `+${multiplier} XP!`;
  floatEl.classList.add("xp-float");
  // Random position near center bottom
  floatEl.style.left = (window.innerWidth / 2 + (Math.random() * 100 - 50)) + "px";
  floatEl.style.top = (window.innerHeight - 100 + (Math.random() * 30 - 15)) + "px";
  document.body.appendChild(floatEl);
  setTimeout(() => {
    floatEl.remove();
  }, 1200);
}

// Calculate XP multiplier based on combo count
function getXPMultiplier(cmb) {
  if (cmb < 15) return 1;
  if (cmb >= 15 && cmb < 20) return 2;
  if (cmb >= 20 && cmb < 25) return 3;
  if (cmb >= 25 && cmb < 30) return 4;
  // 30+ combo quadruple XP and above:
  if (cmb >= 30) {
    // For every 5 combo after 25, increase multiplier by 1
    return 4 + Math.floor((cmb - 25) / 5);
  }
  return 1;
}

function updateLevelDisplay() {
  levelEl.textContent = level;
}

function updateXPBar() {
  const needed = xpToNextLevel(level);
  const percent = Math.min(100, (xp / needed) * 100);
  xpBar.style.width = percent + "%";
}

// Handle answer submission
function submitAnswer() {
  if (answered) return;
  const userAnswer = answerInput.value.trim();
  const correctAnswer = questions[currentIndex].en;

  if (userAnswer === "") return; // do nothing on empty

  if (userAnswer === correctAnswer) {
    // Correct
    score++;
    combo++;
    let multiplier = getXPMultiplier(combo);

    // Points and combo +1, XP + multiplier
    let xpGain = multiplier;
    xp += xpGain;

    // Save data to localStorage
    // Check level up
    const needed = xpToNextLevel(level);
    if (xp >= needed) {
      xp -= needed;
      level++;
      updateLevelDisplay();
      loadConfettiLib().then(() => {
        confetti();
      });
    }
    updateXPBar();
    saveData();

    scoreEl.textContent = score;
    comboEl.textContent = combo;

    if (multiplier > 1) {
      showXPFloat(multiplier);
    }

    messageEl.style.color = "green";
    messageEl.textContent = "Correct!";
  } else {
    // Incorrect, show error message with case difference
    combo = 0; // reset combo on fail
    comboEl.textContent = combo;
    messageEl.style.color = "red";
    messageEl.innerHTML = `Wrong!<br>Your input: <b>${userAnswer}</b><br>Correct input: <b>${correctAnswer}</b>`;
  }
  answered = true;
  answerInput.disabled = true;
  nextBtn.disabled = false;
  nextBtn.focus();
}

// Load CSV and parse
function loadCSV() {
  return fetch("questions.csv")
    .then(res => {
      if (!res.ok) throw new Error("Could not load CSV");
      return res.text();
    })
    .then(text => {
      // Parse CSV: jp,en
      const lines = text.trim().split("\n");
      questions = lines.map(line => {
        const [jp, en] = line.split(",");
        return { jp: jp.trim(), en: en.trim() };
      });
    });
}

nextBtn.addEventListener("click", () => {
  if (!answered) return;
  currentIndex++;
  showQuestion();
});

answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!answered) {
      submitAnswer();
    } else {
      if (!nextBtn.disabled) {
        currentIndex++;
        showQuestion();
      }
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadData();
  loadCSV()
    .then(() => {
      showQuestion();
    })
    .catch(err => {
      jpQuestionEl.textContent = "Error loading questions.csv";
      console.error(err);
    });
});

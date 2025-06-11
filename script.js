let questions = [];
let currentQuestion = null;
let score = 0;
let streak = 0;
let xp = 0;
let level = 1;
let userInteracted = false;

// Start screen elements
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// DOM elements
const questionDisplay = document.getElementById("question");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const xpDisplay = document.getElementById("xp");
const levelDisplay = document.getElementById("level");

// New DOM elements for XP progress bar and multiplier animation
const xpProgress = document.getElementById("xpProgress");
const xpMultiplierAnim = document.getElementById("xpMultiplierAnim");

// Start the game on button click
startBtn.addEventListener("click", () => {
  userInteracted = true;
  startScreen.style.display = "none";
  showQuestion();
});

// Load CSV with PapaParse
Papa.parse("questions.csv", {
  download: true,
  header: true,
  complete: function(results) {
    questions = results.data.filter(q => q.jp && q.en); // Filter valid rows
  }
});

function getRandomQuestion() {
  return questions[Math.floor(Math.random() * questions.length)];
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function showQuestion() {
  currentQuestion = getRandomQuestion();
  questionDisplay.textContent = `${currentQuestion.en} ${currentQuestion.jp}`;
  answerInput.value = "";
  answerInput.disabled = false;
  feedback.innerHTML = "";
  nextBtn.style.display = "none";
  answerInput.focus();

  if (userInteracted && currentQuestion.en) {
    speak(currentQuestion.en);
  }
}

function updateScoreAndStreakDisplay() {
  scoreDisplay.textContent = "Score: " + score;
  streakDisplay.textContent = "コンボ: " + streak;
}

function updateXPDisplay() {
  if (xpDisplay) xpDisplay.textContent = "XP: " + xp;
  if (levelDisplay) levelDisplay.textContent = "Lv: " + level;

  const baseXP = 1;
  const xpNeeded = (level ** 2) * baseXP;
  const progressPercent = Math.min((xp / xpNeeded) * 100, 100);
  if (xpProgress) {
    xpProgress.style.width = progressPercent + "%";
  }
}

function saveProgress() {
  localStorage.setItem("events_xp", xp);
  localStorage.setItem("events_level", level);
}

function loadProgress() {
  const savedXP = localStorage.getItem("events_xp");
  const savedLevel = localStorage.getItem("events_level");
  if (savedXP !== null) xp = parseInt(savedXP, 10);
  if (savedLevel !== null) level = parseInt(savedLevel, 10);
  updateScoreAndStreakDisplay();
  updateXPDisplay();
}

function checkLevelUp() {
  const baseXP = 1;
  const xpNeeded = (level ** 2) * baseXP;

  if (xp >= xpNeeded) {
    level++;
    xp -= xpNeeded;
    feedback.innerHTML += `<br/>🎉 レベルアップ！Now Level ${level}`;
    saveProgress(); // Ensure progress is saved after level up
    updateXPDisplay();
  }
}

function showXpMultiplierAnimation(multiplier) {
  xpMultiplierAnim.textContent = `+${multiplier}x XP!`;
  xpMultiplierAnim.style.opacity = "1";
  xpMultiplierAnim.style.animation = "floatUpFade 1.5s forwards";

  xpMultiplierAnim.addEventListener("animationend", () => {
    xpMultiplierAnim.style.opacity = "0";
    xpMultiplierAnim.style.animation = "";
  }, { once: true });
}

function showFeedback(correct, expected, userInput) {
  if (correct) {
    streak++;
    score++;

    // Calculate XP multiplier based on streak every 15 streaks
    const xpMultiplier = 1 + Math.floor(streak / 15);
    const xpGained = xpMultiplier;

    // Add XP and show bonus animation if multiplier > 1
    xp += xpGained;

    feedback.innerHTML = `✅ 正解！Good job!<br/>XP +${xpGained}`;

    if (xpMultiplier > 1) {
      showXpMultiplierAnimation(xpMultiplier);
    }

    checkLevelUp();
    saveProgress();
    updateScoreAndStreakDisplay();
    updateXPDisplay();
  } else {
    let mismatchIndex = [...expected].findIndex((char, i) => char !== userInput[i]);
    if (mismatchIndex === -1 && userInput.length > expected.length) {
      mismatchIndex = expected.length;
    }

    const correctPart = expected.slice(0, mismatchIndex);
    const wrongPart = expected.slice(mismatchIndex);

    feedback.innerHTML = `
      ❌ 間違いがあります<br/>
      <strong>正解:</strong> ${expected}<br/>
      <strong>あなたの答え:</strong> ${userInput}<br/>
      <strong>ここが間違い:</strong> ${correctPart}<span style="color:red">${wrongPart}</span>
    `;
    streak = 0;
    updateScoreAndStreakDisplay();
  }

  answerInput.disabled = true;
  nextBtn.style.display = "inline-block";
}

answerInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    if (answerInput.disabled) {
      showQuestion();
    } else {
      const userAnswer = answerInput.value.trim();
      const expected = currentQuestion.en.trim();
      const isCorrect = userAnswer === expected;
      showFeedback(isCorrect, expected, userAnswer);
    }
  }
});

nextBtn.addEventListener("click", showQuestion);

// Optional: manual speak button
const speakBtn = document.getElementById("speakBtn");
if (speakBtn) {
  speakBtn.addEventListener("click", function() {
    if (currentQuestion && currentQuestion.en) {
      speak(currentQuestion.en);
    }
  });
}

// Initialize
loadProgress();

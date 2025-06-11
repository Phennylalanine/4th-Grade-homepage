let currentQuestionIndex = 0;
let score = 0;
let combo = 0;
let level = 1;
let xp = 0;
let questions = [];
const maxComboForBonus = 5;

const jpText = document.getElementById("jpText");
const enText = document.getElementById("enText");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const pointsEl = document.getElementById("points");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const xpBar = document.getElementById("xpBar");

document.getElementById("startBtn").addEventListener("click", startQuiz);
nextBtn.addEventListener("click", checkAnswer);
answerInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") checkAnswer();
});

function startQuiz() {
  document.getElementById("startScreen").classList.remove("active");
  document.getElementById("quizScreen").classList.add("active");

  fetch("questions.csv")
    .then((response) => response.text())
    .then((data) => {
      questions = parseCSV(data);
      shuffleArray(questions);
      loadNextQuestion();
    })
    .catch((err) => {
      console.error("Failed to load questions.csv:", err);
    });
}

function parseCSV(data) {
  return data
    .trim()
    .split("\n")
    .map((line) => {
      const [jp, en] = line.split(",");
      return { jp: jp.trim(), en: en.trim().toLowerCase() };
    });
}

function loadNextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0;
    shuffleArray(questions);
  }

  const question = questions[currentQuestionIndex];
  jpText.textContent = question.jp;
  enText.textContent = question.en; // Show the English word

  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus(); // Autofocus here
  nextBtn.disabled = false;
  feedback.textContent = "";

  speak(question.en);
}

  const question = questions[currentQuestionIndex];
  jpText.textContent = question.jp;
  enText.textContent = ""; // Hide the English word at first

  answerInput.value = "";
  answerInput.disabled = false;
  nextBtn.disabled = false;
  feedback.textContent = "";

  speak(question.en);
}

function checkAnswer() {
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = questions[currentQuestionIndex].en;

  if (userAnswer === correctAnswer) {
    feedback.textContent = "✔️ Correct!";
    feedback.style.color = "green";
    combo++;
    score += 10 + Math.min(combo, maxComboForBonus);
    xp += 10;
    showFloatingXP("+10 XP");
    updateStats();
    checkLevelUp();
    triggerConfetti();

    currentQuestionIndex++;
    setTimeout(loadNextQuestion, 1000);
  } else {
    feedback.textContent = `✖️ Wrong! Try again.`;
    feedback.style.color = "red";
    combo = 0;
    updateStats();
  }

  answerInput.disabled = true;
  nextBtn.disabled = true;
}

function updateStats() {
  pointsEl.textContent = score;
  comboEl.textContent = combo;
  levelEl.textContent = level;

  const xpPercent = Math.min((xp % 100), 100);
  xpBar.style.width = `${xpPercent}%`;
}

function checkLevelUp() {
  if (xp >= 100) {
    level++;
    xp = xp % 100;
    levelEl.textContent = level;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function showFloatingXP(text) {
  const xpElem = document.createElement("div");
  xpElem.textContent = text;
  xpElem.className = "floating-xp";
  xpElem.style.left = `${Math.random() * 80 + 10}%`;
  xpElem.style.top = "50%";
  document.body.appendChild(xpElem);
  setTimeout(() => xpElem.remove(), 1500);
}

// Confetti effect
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
let confettiParticles = [];

function triggerConfetti() {
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -20,
      r: Math.random() * 6 + 2,
      d: Math.random() * 5 + 1,
      color:
        "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 70%)",
      tilt: Math.random() * 10 - 10,
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
    ctx.fill();
  });
  updateConfetti();
}

function updateConfetti() {
  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    p.y += p.d;
    p.x += Math.sin(p.tilt) * 2;

    if (p.y > confettiCanvas.height) {
      confettiParticles.splice(i, 1);
      i--;
    }
  }
}

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setInterval(drawConfetti, 30);

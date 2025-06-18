// ... your existing variables ...
let currentQuestionIndex = 0;
let score = 0;
let combo = 0;
let level = 1;
let xp = 0;
let questions = [];
let answered = false;

const maxComboForBonus = 5;

const jpText = document.getElementById("jpText");
const enText = document.getElementById("enText");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const pointsEl = document.getElementById("points");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const xpBar = document.getElementById("xpBar");
const xpText = document.getElementById("xpText");
const choicesContainer = document.getElementById("choicesText");

// Added confetti canvas and context
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
const confettiParticles = [];

document.getElementById("startBtn").addEventListener("click", startQuiz);
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  loadNextQuestion();
});
answerInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (!answered) {
      checkAnswer();
    } else if (!nextBtn.disabled) {
      nextBtn.click();
    }
  }
});

tryAgainBtn.addEventListener("click", tryAgain);

loadProgress();

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
  const lines = data.trim().split("\n");
  return lines.slice(1).map((line) => {
    const [jp, en] = line.split(",");
    return { jp: jp.trim(), en: en.trim() };
  });
}

function loadNextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0;
    shuffleArray(questions);
  }

  const question = questions[currentQuestionIndex];
  jpText.textContent = question.jp;
  enText.textContent = question.en; // optional display for debugging

  speak(question.en);

  const correctAnswer = question.en;
  const wrongAnswers = questions.filter(q => q.en !== correctAnswer).map(q => q.en);
  shuffleArray(wrongAnswers);

  const options = [correctAnswer, ...wrongAnswers.slice(0, 3)];
  shuffleArray(options);

  choicesContainer.innerHTML = "";
  options.forEach(opt => {
    const span = document.createElement("span");
    span.textContent = opt;
    span.className = "choice-option";
    span.style.padding = "5px 10px";
    span.style.border = "1px solid #ccc";
    span.style.borderRadius = "5px";
    span.style.background = "#f9f9f9";
    span.style.margin = "5px";
    span.style.userSelect = "none";
    choicesContainer.appendChild(span);
  });

  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();

  feedback.textContent = "";
  feedback.style.color = "black";

  nextBtn.disabled = true;
  tryAgainBtn.style.display = "none";
  answered = false;
}

function checkAnswer() {
  const userAnswer = answerInput.value.trim();
  const correctAnswer = questions[currentQuestionIndex].en;
  answered = true;
  answerInput.disabled = true;

  if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
    gainXP(10);
    score += 10;
    combo++;
    if (combo % maxComboForBonus === 0) gainXP(20);
    showFloatingXP(10);
    triggerConfetti();
    nextBtn.disabled = false;
  } else {
    feedback.innerHTML = `Wrong!<br>Your answer: ${userAnswer}<br>Correct: ${correctAnswer}`;
    feedback.style.color = "red";
    tryAgainBtn.style.display = "inline-block";
    combo = 0;
  }

  updateStats();
}

function tryAgain() {
  answerInput.value = "";
  feedback.textContent = "";
  feedback.style.color = "black";
  answerInput.disabled = false;
  tryAgainBtn.style.display = "none";
  answered = false;
  answerInput.focus();
}

function gainXP(amount) {
  xp += amount;
  while (xp >= xpToNextLevel()) {
    xp -= xpToNextLevel();
    level++;
  }
  updateStats();
}

function xpToNextLevel() {
  return level * 50;
}

function updateStats() {
  pointsEl.textContent = `Score: ${score}`;
  comboEl.textContent = `Combo: ${combo}`;
  levelEl.textContent = `Level: ${level}`;
  xpBar.style.width = `${(xp / xpToNextLevel()) * 100}%`;
  xpText.textContent = `${xp}/${xpToNextLevel()} XP`;
  saveProgress();
}

function saveProgress() {
  localStorage.setItem("quizProgress", JSON.stringify({ score, combo, level, xp }));
}

function loadProgress() {
  const saved = JSON.parse(localStorage.getItem("quizProgress"));
  if (saved) {
    score = saved.score;
    combo = saved.combo;
    level = saved.level;
    xp = saved.xp;
    updateStats();
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

function triggerConfetti() {
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -20,
      r: Math.random() * 6 + 2,
      d: Math.random() * 5 + 1,
      color: "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 70%)",
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

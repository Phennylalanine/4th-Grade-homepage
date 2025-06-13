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
const xpText = document.getElementById("xpText"); // 👈 New element for XP fraction

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

// ✅ Load progress on page load
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
  return data
    .trim()
    .split("\n")
    .map((line) => {
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
  enText.textContent = question.en;

  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();

  feedback.textContent = "";
  feedback.style.color = "black";

  nextBtn.disabled = true;
  tryAgainBtn.style.display = "none";
  answered = false;

  speak(question.en);
}

function checkAnswer() {
  if (answered) return;
  answered = true;

  const userAnswer = answerInput.value.trim();
  const correctAnswer = questions[currentQuestionIndex].en;

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = "✔️ <strong>Correct!</strong>";
    feedback.style.color = "green";
    combo++;

    score += 1; // ✅ Only 1 point per correct answer

    // ✅ XP Calculation with Combo Bonus
    const xpBonus = combo >= 15 && combo % 5 === 0 ? (combo / 5) - 1 : 1;
    gainXP(xpBonus);
    showFloatingXP(`+${xpBonus} XP`);

    updateStats();

    answerInput.disabled = true;
    nextBtn.disabled = false;
    tryAgainBtn.style.display = "none";
  } else {
    let comparison = "";
    const maxLength = Math.max(userAnswer.length, correctAnswer.length);

    fo

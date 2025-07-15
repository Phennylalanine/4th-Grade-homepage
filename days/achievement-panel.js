// Configuration
const achievementMilestones = {
  combos: [25, 50, 100],
  scores: [50, 75, 100],
  levels: [5, 10, 25, 50]
};

// Achievement definitions (for tooltip text)
const achievementDefinitions = [
  // Scores
  ...achievementMilestones.scores.map(m => ({
    key: `score-${m}`,
    type: 'score',
    value: m,
    label: `Score ${m}`,
    desc: `Get a total score of ${m} or more in this quiz.`
  })),
  // Combos
  ...achievementMilestones.combos.map(m => ({
    key: `combo-${m}`,
    type: 'combo',
    value: m,
    label: `Combo ${m}`,
    desc: `Achieve a combo streak of ${m} or more correct answers.`
  })),
  // Levels
  ...achievementMilestones.levels.map(m => ({
    key: `level-${m}`,
    type: 'level',
    value: m,
    label: `Level ${m}`,
    desc: `Reach level ${m}.`
  })),
];

// Helper: load and save to localStorage
function getAchievements() {
  return JSON.parse(localStorage.getItem('quizAchievements') || '{}');
}
function saveAchievements(data) {
  localStorage.setItem('quizAchievements', JSON.stringify(data));
}

// Helper: update progress (call this from your quiz code)
window.updateQuizAchievements = function (quizName, {score, combo, level}) {
  let data = getAchievements();
  if (!data[quizName]) data[quizName] = {scores: [], combos: [], levels: []};

  // Add new achievements if reached
  achievementMilestones.scores.forEach(m => {
    if (score >= m && !data[quizName].scores.includes(m)) data[quizName].scores.push(m);
  });
  achievementMilestones.combos.forEach(m => {
    if (combo >= m && !data[quizName].combos.includes(m)) data[quizName].combos.push(m);
  });
  achievementMilestones.levels.forEach(m => {
    if (level >= m && !data[quizName].levels.includes(m)) data[quizName].levels.push(m);
  });

  saveAchievements(data);
  renderAchievementPanel();
}

// UI rendering
function renderAchievementPanel() {
  const data = getAchievements();
  const panel = document.getElementById('achievement-panel-content');
  if (!panel) return;

  // Use icon grid per quiz
  let html = '';
  if (Object.keys(data).length === 0) {
    html = '<div style="color:#888;text-align:center;">No achievements yet.</div>';
  } else {
    Object.keys(data).forEach(quiz => {
      // For easy lookup
      const got = {
        score: (data[quiz].scores || []),
        combo: (data[quiz].combos || []),
        level: (data[quiz].levels || []),
      };
      html += `
        <div class="achieve-section">
          <div class="achieve-title">${quiz}</div>
          <div class="achieve-grid">
            ${achievementDefinitions.map(def => {
              const achieved = got[def.type] && got[def.type].includes(def.value);
              const icon = achieved ? "unlocked.png" : "locked.png";
              return `
                <div class="achieve-icon" tabindex="0">
                  <img src="${icon}" alt="${def.label}" />
                  <span class="achieve-tooltip">${def.label}<br>${def.desc}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });
  }
  panel.innerHTML = html;
}

// Setup panel and tab
function setupAchievementPanel() {
  // Insert panel HTML
  const panel = document.createElement('div');
  panel.id = 'achievement-panel';
  panel.innerHTML = `<div id="achievement-panel-content"></div>`;
  document.body.appendChild(panel);

  // Insert tab
  const tab = document.createElement('div');
  tab.id = 'achievement-tab';
  tab.textContent = '実績'; // Japanese for "Achievements"
  tab.onclick = function() {
    panel.classList.toggle('open');
    renderAchievementPanel();
  };
  document.body.appendChild(tab);

  // Close panel when clicking outside
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && !tab.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
  setupAchievementPanel();
  renderAchievementPanel();
});

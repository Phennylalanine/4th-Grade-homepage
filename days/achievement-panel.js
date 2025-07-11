// Configuration
const achievementMilestones = {
  combos: [25, 50, 100],
  scores: [50, 75, 100],
  levels: [5, 10, 25, 50]
};

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

  let html = '';
  Object.keys(data).forEach(quiz => {
    html += `<div class="achieve-section">
      <div class="achieve-title">${quiz}</div>
      <ul class="achieve-list">
        ${achievementMilestones.scores.map(m => `
          <li class="achieve-item">Score ${m} <span class="${data[quiz].scores.includes(m) ? 'achieve-got' : ''}">${data[quiz].scores.includes(m) ? 'Got' : ''}</span></li>
        `).join('')}
        ${achievementMilestones.combos.map(m => `
          <li class="achieve-item">Combo ${m} <span class="${data[quiz].combos.includes(m) ? 'achieve-got' : ''}">${data[quiz].combos.includes(m) ? 'Got' : ''}</span></li>
        `).join('')}
        ${achievementMilestones.levels.map(m => `
          <li class="achieve-item">Level ${m} <span class="${data[quiz].levels.includes(m) ? 'achieve-got' : ''}">${data[quiz].levels.includes(m) ? 'Got' : ''}</span></li>
        `).join('')}
      </ul>
    </div>`;
  });
  if (!html) {
    html = '<div style="color:#888;text-align:center;">No achievements yet.</div>';
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

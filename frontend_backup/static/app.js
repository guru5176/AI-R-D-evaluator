// ============================================================
// AI Proposal Evaluator — App Logic
// ============================================================

const API_URL = '';  // same origin

// State
let lastEval = null;
let chatHistory = [];
let selectedFile = null;

// ======================== NAVIGATION ========================

function navigateTo(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const nav = document.querySelector(`[data-page="${pageId}"]`);
  if (nav) nav.classList.add('active');

  // Update header title
  const titles = {
    dashboard: 'Dashboard',
    evaluate: 'Evaluate Proposal',
    results: 'Evaluation Results',
    chat: 'Reviewer Agent Chat',
    history: 'Evaluation History'
  };
  document.getElementById('page-title').textContent = titles[pageId] || 'Dashboard';

  // Load data for specific pages
  if (pageId === 'dashboard' || pageId === 'history') loadHistory();
  if (pageId === 'results' && lastEval) renderResults(lastEval);
}

// Sidebar nav clicks
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.page));
});

// ======================== FILE UPLOAD ========================

const fileInput = document.getElementById('file-input');
const uploadZone = document.getElementById('upload-zone');
const fileSelected = document.getElementById('file-selected');
const fileSelName = document.getElementById('file-sel-name');
const fileSelRemove = document.getElementById('file-sel-remove');

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      selectedFile = e.target.files[0];
      fileSelName.textContent = selectedFile.name;
      fileSelected.classList.remove('hidden');
      uploadZone.style.display = 'none';
    }
  });
}

if (fileSelRemove) {
  fileSelRemove.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileSelected.classList.add('hidden');
    uploadZone.style.display = '';
  });
}

// Drag & drop
if (uploadZone) {
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      selectedFile = e.dataTransfer.files[0];
      fileSelName.textContent = selectedFile.name;
      fileSelected.classList.remove('hidden');
      uploadZone.style.display = 'none';
    }
  });
}

// ======================== SUBMIT PROPOSAL ========================

async function submitProposal() {
  if (!selectedFile) {
    showToast('Please upload a PDF file first.', 'error');
    return;
  }

  const budget = document.getElementById('budget-input').value;
  if (!budget || budget < 100000) {
    showToast('Please enter a valid budget.', 'error');
    return;
  }

  // Show spinner
  document.getElementById('spinner-overlay').classList.remove('hidden');

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('budget', budget);

  try {
    const resp = await fetch(`${API_URL}/submit/`, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();

    if (data.error) {
      showToast(data.error, 'error');
      document.getElementById('spinner-overlay').classList.add('hidden');
      return;
    }

    lastEval = data;
    showToast('Proposal evaluated successfully!', 'success');

    // Navigate to results
    setTimeout(() => {
      document.getElementById('spinner-overlay').classList.add('hidden');
      navigateTo('results');
    }, 500);

  } catch (err) {
    console.error(err);
    showToast('Backend request failed. Check server.', 'error');
    document.getElementById('spinner-overlay').classList.add('hidden');
  }
}

// ======================== RENDER RESULTS ========================

function renderResults(data) {
  // Decision banner
  const banner = document.getElementById('decision-banner');
  const decision = data.decision || '';
  let bannerClass = 'rejected';
  let icon = '\u274C';

  if (decision.includes('Strongly')) {
    bannerClass = 'recommended';
    icon = '\u2705';
  } else if (decision.includes('Revisions')) {
    bannerClass = 'revisions';
    icon = '\u26A0\uFE0F';
  }

  banner.className = 'decision-banner ' + bannerClass;
  document.getElementById('decision-icon').textContent = icon;
  document.getElementById('decision-text').textContent = decision;

  // Score rings
  setScoreRing('ring-final', 'score-final', data.final_score, 100);
  setScoreRing('ring-novelty', 'score-novelty', data.novelty, 100);
  setScoreRing('ring-finance', 'score-finance', data.finance, 100);

  // Confidence
  if (data.confidence_band) {
    document.getElementById('conf-value').textContent = (data.confidence || 0).toFixed(1);
    document.getElementById('conf-low').textContent = (data.confidence_band.lower || 0).toFixed(1);
    document.getElementById('conf-high').textContent = (data.confidence_band.upper || 0).toFixed(1);
  }

  // Similar projects
  const spList = document.getElementById('similar-projects-list');
  spList.innerHTML = '';
  if (data.similar_projects && data.similar_projects.length > 0) {
    data.similar_projects.forEach(proj => {
      const title = proj.project || 'Unknown';
      const sim = (proj.similarity || 0).toFixed(2);
      let url = proj.url || '';
      if (!url || url.toLowerCase() === 'nan') url = '';

      const div = document.createElement('div');
      div.className = 'similar-project';
      div.innerHTML = `
        <div>
          <div class="sp-title">${escapeHtml(title)}</div>
          <div class="sp-score">Similarity: <strong>${sim}</strong></div>
          ${url ? `<a class="sp-link" href="${escapeHtml(url)}" target="_blank">Read Paper &rarr;</a>` : ''}
        </div>
      `;
      spList.appendChild(div);
    });
  } else {
    spList.innerHTML = '<div class="no-violations">\u2705 No similar projects found &mdash; high novelty!</div>';
  }

  // Violations
  const vList = document.getElementById('violations-list');
  vList.innerHTML = '';
  if (data.violations && data.violations.length > 0) {
    data.violations.forEach(v => {
      const div = document.createElement('div');
      div.className = 'violation-item';
      div.innerHTML = `<span>\u274C</span> ${escapeHtml(v)}`;
      vList.appendChild(div);
    });
  } else {
    vList.innerHTML = '<div class="no-violations">\u2705 No financial violations detected!</div>';
  }

  // AI Narrative
  document.getElementById('narrative-text').textContent = data.ai_report_text || 'No narrative available.';

  // Report URL
  const reportBtn = document.getElementById('report-download-btn');
  if (data.report_url) {
    reportBtn.href = data.report_url;
  }
}

function setScoreRing(ringId, numberId, value, max) {
  const v = parseFloat(value) || 0;
  const pct = Math.min((v / max) * 100, 100);

  document.getElementById(numberId).textContent = v.toFixed(1);

  // Determine color
  let color = '#EF4444';
  if (v >= 85) color = '#22C55E';
  else if (v >= 70) color = '#F59E0B';

  const ring = document.getElementById(ringId);
  ring.style.background = `conic-gradient(${color} ${pct * 3.6}deg, #F0F0F0 ${pct * 3.6}deg)`;
}

// ======================== TABS ========================

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Deactivate all
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    // Activate clicked
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ======================== CHAT ========================

async function sendChat() {
  const input = document.getElementById('chat-input');
  const question = input.value.trim();
  if (!question) return;

  if (!lastEval) {
    showToast('Please evaluate a proposal first.', 'error');
    return;
  }

  // Hide empty state
  const empty = document.getElementById('chat-empty');
  if (empty) empty.style.display = 'none';

  // Add user bubble
  addChatBubble('user', question);
  input.value = '';

  // Send to API
  try {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('proposal_text', lastEval.proposal_text || '');
    formData.append('final_score', lastEval.final_score || 0);
    formData.append('decision', lastEval.decision || '');

    const resp = await fetch(`${API_URL}/ask/`, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();
    addChatBubble('ai', data.answer || 'No response.');
  } catch (err) {
    addChatBubble('ai', 'Error: Could not reach the reviewer agent.');
  }
}

function addChatBubble(role, text) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  bubble.innerHTML = `
    ${escapeHtml(text)}
    <div class="bubble-meta">${role === 'user' ? 'You' : 'AI Reviewer'} &bull; ${now}</div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

// ======================== HISTORY ========================

async function loadHistory() {
  try {
    const resp = await fetch(`${API_URL}/history/`);
    const data = await resp.json();

    renderHistoryTable('history-tbody', 'history-empty', data);
    renderHistoryTable('full-history-tbody', 'full-history-empty', data);
    updateStats(data);

  } catch (err) {
    console.error('Failed to load history:', err);
  }
}

function renderHistoryTable(tbodyId, emptyId, data) {
  const tbody = document.getElementById(tbodyId);
  const empty = document.getElementById(emptyId);
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!data || data.length === 0) {
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  data.forEach(item => {
    const score = parseFloat(item.final_score);
    let badgeClass = 'danger';
    let badgeLabel = 'Not Recommended';
    let progressClass = 'red';

    if (item.decision.includes('Strongly')) {
      badgeClass = 'success';
      badgeLabel = 'Recommended';
      progressClass = 'green';
    } else if (item.decision.includes('Revisions')) {
      badgeClass = 'warning';
      badgeLabel = 'Revisions';
      progressClass = 'orange';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="file-name">
          <div class="file-icon">\uD83D\uDCC4</div>
          ${escapeHtml(item.filename)}
        </div>
      </td>
      <td><strong>${score.toFixed(1)}</strong>/100</td>
      <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${badgeLabel}</span></td>
      <td>
        <div class="progress-bar-wrapper">
          <div class="progress-bar"><div class="progress-fill ${progressClass}" style="width:${score}%"></div></div>
          <span class="progress-value">${score.toFixed(0)}%</span>
        </div>
      </td>
      <td>${escapeHtml(item.created_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStats(data) {
  if (!data || data.length === 0) return;

  const total = data.length;
  const scores = data.map(d => parseFloat(d.final_score));
  const avg = scores.reduce((a, b) => a + b, 0) / total;
  const approved = data.filter(d => d.decision.includes('Strongly')).length;
  const revisions = data.filter(d => d.decision.includes('Revisions')).length;
  const rejected = total - approved - revisions;
  const latest = scores[0];

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-avg').textContent = avg.toFixed(1);
  document.getElementById('stat-approved').textContent = approved;
  document.getElementById('stat-latest').textContent = latest.toFixed(1);

  // Donut chart
  const chart = document.getElementById('donut-chart');
  const pApproved = total > 0 ? (approved / total) * 100 : 0;
  const pRevisions = total > 0 ? (revisions / total) * 100 : 0;
  const pRejected = total > 0 ? (rejected / total) * 100 : 0;

  const a1 = pApproved * 3.6;
  const a2 = a1 + pRevisions * 3.6;

  chart.style.background = `conic-gradient(
    #22C55E 0deg ${a1}deg,
    #F59E0B ${a1}deg ${a2}deg,
    #EF4444 ${a2}deg 360deg
  )`;

  document.getElementById('donut-value').textContent = avg.toFixed(0) + '%';
  document.getElementById('legend-recommended').textContent = approved;
  document.getElementById('legend-revisions').textContent = revisions;
  document.getElementById('legend-rejected').textContent = rejected;
}

// ======================== TOAST ========================

function showToast(message, type) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '\u2705' : '\u274C'}</span> ${escapeHtml(message)}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ======================== UTILS ========================

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ======================== INIT ========================

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
});

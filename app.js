// =============================
// Member 4 Contribution - GreenSplit Hackathon Project
// File: app.js
// Description: Handles theme toggling and chart rendering for personal and group carbon tracking.
// Author: Member 4
// For evaluation: This file contains the main JS logic for UI interactivity and data visualization.
// =============================

// Theme toggle logic (robust for integration)
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }
}

// Logout button demo handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    alert('Logout clicked! (Demo only)');
    // For integration: replace with real logout logic
  });
}


// Chart rendering logic (robust for missing DOM or data)
let personalMonthlyChart;
function updatePersonalMonthlyChart() {
  const canvas = document.getElementById("personalMonthlyChart");
  if (!canvas || typeof Chart === 'undefined' || typeof personalExpenses === 'undefined' || typeof carbonFactors === 'undefined' || typeof categoryColors === 'undefined') return;
  const ctx = canvas.getContext("2d");
  const byMonthCategory = {};
  personalExpenses.forEach(e => {
    const month = e.date.slice(0,7);
    if (!byMonthCategory[month]) byMonthCategory[month] = {};
    byMonthCategory[month][e.category] = (byMonthCategory[month][e.category] || 0) + e.co2;
  });
  const months = Object.keys(byMonthCategory).sort();
  const categories = Object.keys(carbonFactors);
  const datasets = categories.map(cat => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    data: months.map(m => byMonthCategory[m][cat] || 0),
    backgroundColor: categoryColors[cat],
    stack: 'Stack'
  }));
  if (personalMonthlyChart) personalMonthlyChart.destroy();
  personalMonthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  });
}


let groupMemberChart;
function updateGroupMemberChart(group) {
  const canvas = document.getElementById("groupMemberChart");
  if (!canvas || typeof Chart === 'undefined' || !group || !Array.isArray(group.members) || !Array.isArray(group.splits)) return;
  const ctx = canvas.getContext("2d");
  const byMember = {};
  group.members.forEach(member => {
    byMember[member] = group.splits.reduce((sum, split) => sum + (split.co2[member] || 0), 0);
  });
  if (groupMemberChart) groupMemberChart.destroy();
  groupMemberChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(byMember),
      datasets: [{
        label: "CO₂ per Member (kg)",
        data: Object.values(byMember),
        backgroundColor: '#36a2eb',
        borderColor: '#2a81cb',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// For integration: Call updatePersonalMonthlyChart() and updateGroupMemberChart(group) as needed.
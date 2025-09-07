let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let personalExpenses = [];
let personalRewardPoints = 0;
let groups = [];
let sessionExpenses = []; // Temporary array for fresh split expenses
const carbonFactors = {
  food: 0.5,
  travel: 2.0,
  shopping: 1.2,
  utilities: 1.5,
  entertainment: 0.8
};
const categoryColors = {
  food: '#ff6384',
  travel: '#36a2eb',
  shopping: '#ffce56',
  utilities: '#4bc0c0',
  entertainment: '#9966ff'
};

// Load data for current user
function loadUserData() {
  if (currentUser) {
    const user = users.find(u => u.username === currentUser);
    if (user) {
      personalExpenses = user.data.personal.expenses || [];
      personalRewardPoints = user.data.personal.rewardPoints || 0;
      groups = user.data.groups || [];
    }
  }
}

// Save data for current user
function saveUserData() {
  if (currentUser) {
    const userIndex = users.findIndex(u => u.username === currentUser);
    if (userIndex !== -1) {
      users[userIndex].data = {
        personal: { expenses: personalExpenses, rewardPoints: personalRewardPoints },
        groups: groups
      };
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
}

// Show/Hide Pages
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
  // Clear form inputs when showing login or signup page
  if (pageId === 'loginPage') {
    document.getElementById('loginForm').reset();
  } else if (pageId === 'signupPage') {
    document.getElementById('signupForm').reset();
  }
  // Clear session expenses when leaving group details page
  if (pageId !== 'groupDetailsPage') {
    sessionExpenses = [];
  }
}

// Show Personal Page and Update UI
window.showPersonalPage = function() {
  showPage('personalPage');
  updatePersonalUI();
};

// Show Group Page and Update UI
window.showGroupPage = function() {
  showPage('groupPage');
  updateGroupUI();
};

// Login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = username;
    loadUserData();
    showPage('choicePage');
  } else {
    alert("Invalid credentials");
  }
});

// Signup
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  if (users.find(u => u.username === username)) {
    alert("Username exists");
    return;
  }
  users.push({ username, password, data: { personal: { expenses: [], rewardPoints: 0 }, groups: [] } });
  localStorage.setItem('users', JSON.stringify(users));
  alert("Signup successful, please login");
  showPage('loginPage');
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  saveUserData();
  currentUser = null;
  personalExpenses = [];
  personalRewardPoints = 0;
  groups = [];
  sessionExpenses = [];
  showPage('loginPage');
});

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Load theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}

// Personal Add Expense
document.getElementById("personalExpenseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("personalAmount").value);
  const description = document.getElementById("personalDescription").value.trim();
  const category = document.getElementById("personalCategory").value;
  const date = document.getElementById("personalDate").value || new Date().toISOString().slice(0,10);

  if (!amount || !description) return;
  const co2 = (amount / 100) * (carbonFactors[category] || 1);
  personalExpenses.push({ amount, description, category, date, co2 });

  updatePersonalUI();
  saveUserData();
  e.target.reset();
});

// Update Personal UI
function updatePersonalUI() {
  const list = document.getElementById("personalRecentList");
  list.innerHTML = "";
  personalExpenses.slice(-5).reverse().forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.date} - ₹${exp.amount.toFixed(2)} (${exp.category}, ${exp.co2.toFixed(2)}kg CO₂)`;
    list.appendChild(li);
  });

  const totalCo2 = personalExpenses.reduce((sum, e) => sum + e.co2, 0);
  document.getElementById("personalCarbonStats").textContent = `Total CO₂: ${totalCo2.toFixed(2)}kg`;

  if (totalCo2 < 50 && personalExpenses.length > 0) personalRewardPoints += 10;
  document.getElementById("personalRewardPoints").textContent = `Reward Points: ${personalRewardPoints}`;

  updatePersonalMonthlyChart();
}

let personalMonthlyChart;
function updatePersonalMonthlyChart() {
  const ctx = document.getElementById("personalMonthlyChart").getContext("2d");
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

// Create Group
document.getElementById("createGroupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("groupName").value.trim();
  const members = document.getElementById("groupMembers").value.split(',').map(m => m.trim()).filter(m => m);
  if (!name || members.length === 0) {
    alert("Please provide a group name and at least one member");
    return;
  }
  groups.push({ name, members, expenses: [], splits: [], rewardPoints: 0 });
  updateGroupUI();
  saveUserData();
  e.target.reset();
});

// Update Group UI
function updateGroupUI() {
  const groupList = document.getElementById("groupList");
  groupList.innerHTML = "";
  groups.forEach((group, index) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${group.name}</h3>
      <p>Members: ${group.members.join(', ')}</p>
      <button onclick="showGroupDetails(${index})">View Details</button>
    `;
    groupList.appendChild(div);
  });
}

// Toggle Split Inputs
window.toggleSplitInputs = function() {
  const splitMode = document.getElementById("splitMode").value;
  const splitType = document.getElementById("splitType").value;
  const memberInputs = document.getElementById("memberInputs");
  const groupIndex = parseInt(document.getElementById("groupDetailsName").dataset.groupIndex);
  const group = groups[groupIndex];
  
  const expensesToSplit = splitMode === 'fresh' ? sessionExpenses : group.expenses;
  const totalExpense = expensesToSplit.reduce((sum, exp) => sum + exp.amount, 0);
  const totalCo2 = expensesToSplit.reduce((sum, exp) => sum + exp.co2, 0);

  document.getElementById("totalExpenseDisplay").textContent = totalExpense > 0 
    ? `Total ${splitMode === 'fresh' ? 'New' : 'All'} Expenses to Split: ₹${totalExpense.toFixed(2)}` 
    : `No ${splitMode === 'fresh' ? 'new' : ''} expenses to split`;

  if (splitType === "equal") {
    memberInputs.innerHTML = `<p>Bill will be split equally among members.</p>`;
  } else {
    memberInputs.innerHTML = "";
    group.members.forEach(member => {
      const div = document.createElement("div");
      div.innerHTML = `
        <label>${member}</label>
        <input type="number" id="split_${member}" placeholder="${splitType === 'custom-percent' ? 'Percentage' : 'Amount'} for ${member}" min="0" step="${splitType === 'custom-percent' ? '0.01' : '0.01'}">
      `;
      memberInputs.appendChild(div);
    });
  }
};

// Show Group Details
window.showGroupDetails = function(groupIndex) {
  if (!groups[groupIndex]) return;
  const group = groups[groupIndex];
  showPage('groupDetailsPage');
  document.getElementById("groupDetailsName").textContent = group.name;
  document.getElementById("groupDetailsName").dataset.groupIndex = groupIndex;

  // Add Expense to Group
  const groupExpenseForm = document.getElementById("groupExpenseForm");
  groupExpenseForm.onsubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("groupAmount").value);
    const description = document.getElementById("groupDescription").value.trim();
    const category = document.getElementById("groupCategory").value;
    const date = document.getElementById("groupDate").value || new Date().toISOString().slice(0,10);

    if (!amount || !description) return;
    const co2 = (amount / 100) * (carbonFactors[category] || 1);
    const expense = { amount, description, category, date, co2 };
    group.expenses.push(expense);
    sessionExpenses.push(expense); // Add to session for fresh split

    updateGroupDetailsUI(groupIndex);
    saveUserData();
    updateGroupUI();
    e.target.reset();
    toggleSplitInputs(); // Update split inputs to reflect new expense
  };

  // Populate Split Form
  toggleSplitInputs();

  // Group Bill Splitter
  const groupSplitForm = document.getElementById("groupSplitForm");
  groupSplitForm.onsubmit = (e) => {
    e.preventDefault();
    const splitMode = document.getElementById("splitMode").value;
    const splitType = document.getElementById("splitType").value;
    const expensesToSplit = splitMode === 'fresh' ? sessionExpenses : group.expenses;
    const totalExpense = expensesToSplit.reduce((sum, exp) => sum + exp.amount, 0);
    const totalCo2 = expensesToSplit.reduce((sum, exp) => sum + exp.co2, 0);
    const members = group.members;

    if (totalExpense <= 0) {
      document.getElementById("groupSplitResult").textContent = `No ${splitMode === 'fresh' ? 'new' : ''} expenses to split`;
      return;
    }

    const splitAmounts = {};
    const splitCo2 = {};
    let resultText = `Split Result (${splitMode === 'fresh' ? 'New' : 'All'} Expenses: ₹${totalExpense.toFixed(2)}):\n`;

    if (splitType === "equal") {
      const perMemberAmount = totalExpense / members.length;
      const perMemberCo2 = totalCo2 / members.length;
      members.forEach(member => {
        splitAmounts[member] = perMemberAmount;
        splitCo2[member] = perMemberCo2;
        resultText += `${member}: ₹${perMemberAmount.toFixed(2)}, CO₂: ${perMemberCo2.toFixed(2)}kg\n`;
      });
    } else if (splitType === "custom-amount") {
      let total = 0;
      members.forEach(member => {
        const input = parseFloat(document.getElementById(`split_${member}`).value) || 0;
        splitAmounts[member] = input;
        total += input;
      });

      if (Math.abs(total - totalExpense) > 0.01) {
        document.getElementById("groupSplitResult").textContent = `Error: Sum of amounts (₹${total.toFixed(2)}) must equal total expenses (₹${totalExpense.toFixed(2)})`;
        return;
      }

      members.forEach(member => {
        const share = splitAmounts[member] / totalExpense;
        splitCo2[member] = totalCo2 * share;
        resultText += `${member}: ₹${splitAmounts[member].toFixed(2)}, CO₂: ${splitCo2[member].toFixed(2)}kg\n`;
      });
    } else if (splitType === "custom-percent") {
      let totalPercent = 0;
      members.forEach(member => {
        const percent = parseFloat(document.getElementById(`split_${member}`).value) || 0;
        splitAmounts[member] = percent;
        totalPercent += percent;
      });

      if (Math.abs(totalPercent - 100) > 0.01) {
        document.getElementById("groupSplitResult").textContent = `Error: Sum of percentages (${totalPercent.toFixed(2)}%) must equal 100%`;
        return;
      }

      members.forEach(member => {
        const share = splitAmounts[member] / 100;
        splitAmounts[member] = totalExpense * share;
        splitCo2[member] = totalCo2 * share;
        resultText += `${member}: ₹${splitAmounts[member].toFixed(2)}, CO₂: ${splitCo2[member].toFixed(2)}kg\n`;
      });
    }

    // Store only the latest split
    group.splits = [{ date: new Date().toISOString().slice(0,10), amounts: splitAmounts, co2: splitCo2, mode: splitMode }];
    document.getElementById("groupSplitResult").textContent = resultText;

    // Clear session expenses after a fresh split
    if (splitMode === 'fresh') {
      sessionExpenses = [];
    }

    updateGroupDetailsUI(groupIndex);
    saveUserData();
    groupSplitForm.reset();
    toggleSplitInputs();
  };

  // Back to Group Page
  document.getElementById("backToGroupPage").onclick = () => {
    sessionExpenses = []; // Clear session expenses when leaving
    showPage('groupPage');
    updateGroupUI();
  };

  updateGroupDetailsUI(groupIndex);
};

// Update Group Details UI
function updateGroupDetailsUI(groupIndex) {
  const group = groups[groupIndex];
  if (!group) return;
  const list = document.getElementById("groupRecentList");
  list.innerHTML = "";
  group.expenses.slice(-5).reverse().forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.date} - ₹${exp.amount.toFixed(2)} (${exp.category}, ${exp.co2.toFixed(2)}kg CO₂)`;
    list.appendChild(li);
  });

  const totalCo2 = group.expenses.reduce((sum, e) => sum + e.co2, 0);
  document.getElementById("groupCarbonStats").textContent = `Total CO₂: ${totalCo2.toFixed(2)}kg`;

  if (totalCo2 < 50 && group.expenses.length > 0) group.rewardPoints += 10;
  document.getElementById("groupRewardPoints").textContent = `Reward Points: ${group.rewardPoints}`;

  updateGroupMemberChart(group);
}

let groupMemberChart;
function updateGroupMemberChart(group) {
  const ctx = document.getElementById("groupMemberChart").getContext("2d");
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

// Initial show login
showPage('loginPage');
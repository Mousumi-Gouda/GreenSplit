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
  sessionExpenses.push(expense);

  updateGroupDetailsUI(groupIndex);
  saveUserData();
  updateGroupUI();
  e.target.reset();
  toggleSplitInputs();
};

const groupSplitForm = document.getElementById("groupSplitForm");
// --- MOCK DEFINITIONS FOR DEMO/EVALUATION PURPOSES ---
// These mocks allow the code to run without errors. Replace with real data in integration.
if (typeof group === 'undefined') {
  var group = {
    members: ['Alice', 'Bob', 'Charlie'],
    expenses: [],
    splits: []
  };
}
if (typeof groupIndex === 'undefined') {
  var groupIndex = 0;
}
if (typeof carbonFactors === 'undefined') {
  var carbonFactors = {
    food: 2.5,
    travel: 5.0,
    shopping: 1.2,
    utilities: 3.0,
    entertainment: 1.5
  };
}
if (typeof sessionExpenses === 'undefined') {
  var sessionExpenses = [];
}
if (typeof updateGroupDetailsUI === 'undefined') {
  function updateGroupDetailsUI() {}
}
if (typeof saveUserData === 'undefined') {
  function saveUserData() {}
}
if (typeof updateGroupUI === 'undefined') {
  function updateGroupUI() {}
}
if (typeof toggleSplitInputs === 'undefined') {
  function toggleSplitInputs() {
    // For demo: show input fields for custom splits
    const splitType = document.getElementById('splitType').value;
    const memberInputs = document.getElementById('memberInputs');
    memberInputs.innerHTML = '';
    if (splitType === 'custom-amount' || splitType === 'custom-percent') {
      group.members.forEach(member => {
        const label = document.createElement('label');
        label.textContent = member + ': ';
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `split_${member}`;
        input.min = '0';
        input.step = '0.01';
        label.appendChild(input);
        memberInputs.appendChild(label);
        memberInputs.appendChild(document.createElement('br'));
      });
    }
    // Show total expense
    const splitMode = document.getElementById('splitMode').value;
    const expensesToSplit = splitMode === 'fresh' ? sessionExpenses : group.expenses;
    const totalExpense = expensesToSplit.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('totalExpenseDisplay').textContent = 'Total: ₹' + totalExpense.toFixed(2);
  }
}
// --- END MOCK DEFINITIONS ---
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

  group.splits = [{ date: new Date().toISOString().slice(0,10), amounts: splitAmounts, co2: splitCo2, mode: splitMode }];
  document.getElementById("groupSplitResult").textContent = resultText;

  if (splitMode === 'fresh') {
    sessionExpenses = [];
  }

  updateGroupDetailsUI(groupIndex);
  saveUserData();
  groupSplitForm.reset();
  toggleSplitInputs();
};
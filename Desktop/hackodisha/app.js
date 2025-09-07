// --- Added for standalone functionality ---
// Example carbon emission factors for each category (kg CO2 per 100 currency units)
const carbonFactors = {
  food: 2.5,
  travel: 5.0,
  shopping: 1.2,
  utilities: 3.0,
  entertainment: 0.8
};

// Array to store personal expenses
const personalExpenses = [];

// Reward points for the user
let personalRewardPoints = 0;

// Stub for saveUserData (does nothing in this standalone demo)
function saveUserData() {
  // In a real app, this would save to localStorage or a backend
}
document.getElementById("personalExpenseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  // Get the amount entered by the user
  const amount = parseFloat(document.getElementById("personalAmount").value);
  // Get the description entered by the user
  const description = document.getElementById("personalDescription").value.trim();
  // Get the selected category
  const category = document.getElementById("personalCategory").value;
  // Get the date or use today's date if not provided
  const date = document.getElementById("personalDate").value || new Date().toISOString().slice(0,10);

  // Validate input
  if (!amount || !description) return;
  // Calculate CO2 based on amount and category
  const co2 = (amount / 100) * (carbonFactors[category] || 1);
  // Add the expense to the list
  personalExpenses.push({ amount, description, category, date, co2 });

  // Update the UI and save data
  updatePersonalUI();
  saveUserData();
  // Reset the form
  e.target.reset();
});

// Update the personal expenses UI
function updatePersonalUI() {
  const list = document.getElementById("personalRecentList");
  list.innerHTML = "";
  // Show the 5 most recent expenses
  personalExpenses.slice(-5).reverse().forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.date} - ₹${exp.amount.toFixed(2)} (${exp.category}, ${exp.co2.toFixed(2)}kg CO₂)`;
    list.appendChild(li);
  });

  // Calculate and display total CO2
  const totalCo2 = personalExpenses.reduce((sum, e) => sum + e.co2, 0);
  document.getElementById("personalCarbonStats").textContent = `Total CO₂: ${totalCo2.toFixed(2)}kg`;

  // Reward points logic
  if (totalCo2 < 50 && personalExpenses.length > 0) personalRewardPoints += 10;
  document.getElementById("personalRewardPoints").textContent = `Reward Points: ${personalRewardPoints}`;
}
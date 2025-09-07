document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  // Handle login form submission
  // Checks credentials and logs in the user if valid
  const username = document.getElementById("loginUsername").value.trim(); // Get entered username
  const password = document.getElementById("loginPassword").value; // Get entered password
  // Find user with matching credentials
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = username;
    loadUserData(); // Load user-specific data
    showPage('choicePage'); // Navigate to choice page
  } else {
    alert("Invalid credentials"); // will show error if login fails
  }
});

document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  // Handle signup form submission
  // Registers a new user and saves to local storage
  const username = document.getElementById("signupUsername").value.trim(); // Get entered username
  const password = document.getElementById("signupPassword").value; // Get entered password
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    alert("Username exists");
    return;
  }
  // Add new user to users array
  users.push({ username, password, data: { personal: { expenses: [], rewardPoints: 0 }, groups: [] } });
  localStorage.setItem('users', JSON.stringify(users)); // Save users to local storage
  alert("Signup successful, please login");
  showPage('loginPage'); // Redirect to login page
});
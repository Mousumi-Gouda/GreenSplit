
//
// GreenSplit – Group Splitting Logic
// ----------------------------------
// Hi there! 👋 This file powers the group splitting feature of GreenSplit.
// It's designed to be modular, easy to integrate, and friendly for future teammates.
//
// Main features:
// - Create new groups with custom names and members
// - Prevent duplicate group names
// - View all your groups in a clean UI
// - Export/import group data (JSON)
//
// If you're maintaining or extending this, enjoy! If you have questions, just ask the team.
//


// Minimal page switching logic for modular integration (used for navigation)
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
  const el = document.getElementById(pageId);
  if (el) el.style.display = 'block';
}

// All groups are stored here (replace with app-wide state if needed)
let groups = [];

// Save user data (customize for your backend or storage solution)
function saveUserData() {
  // Example: localStorage.setItem('groups', JSON.stringify(groups));
}

// Show group details (customize for your modal or navigation)
function showGroupDetails(index) {
  // Friendly message for group details
  alert(`Welcome to "${groups[index].name}"!\nMembers: ${groups[index].members.join(', ')}\n(More group features coming soon!)`);
}

// Export all groups as a JSON file (for backup or sharing)
function exportGroups() {
  const dataStr = JSON.stringify(groups, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'groups.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import groups from a JSON file (for restore or sharing)
function importGroups() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const imported = JSON.parse(evt.target.result);
        if (Array.isArray(imported)) {
          groups = imported;
          updateGroupUI();
          saveUserData();
        } else {
          alert('Invalid group data format.');
        }
      } catch {
        alert('Failed to import group data.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Attach event listeners after DOM is ready (so everything works smoothly)
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("createGroupForm");
  const formError = document.getElementById("formError");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  // Group creation logic: add a new group if valid
      const name = document.getElementById("groupName").value.trim();
      const members = document.getElementById("groupMembers").value.split(',').map(m => m.trim()).filter(m => m);
  // Prevent duplicate group names (case-insensitive)
      if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        if (formError) {
          formError.textContent = 'A group with this name already exists.';
          formError.style.display = 'block';
        }
        return;
      }
  // Check for valid input
  if (!name || members.length === 0) {
        if (formError) {
          formError.textContent = 'Please provide a group name and at least one member.';
          formError.style.display = 'block';
        }
        return;
      }
  // Hide error if all is good
  if (formError) formError.style.display = 'none';
      groups.push({ name, members, expenses: [], splits: [], rewardPoints: 0 });
      updateGroupUI();
      saveUserData();
      e.target.reset();
    });
  }
  updateGroupUI();
});

// Render the group list UI (refreshes the visible list of groups)
function updateGroupUI() {
  const groupList = document.getElementById("groupList");
  groupList.innerHTML = "";
  if (groups.length === 0) {
    groupList.innerHTML = '<div style="color:#888; text-align:center; padding:1rem;">No groups created yet. Use the form to add your first group!</div>';
    return;
  }
  groups.forEach((group, index) => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginBottom = "1rem";
    div.innerHTML = `
      <h3 style="margin-top:0;">${group.name}</h3>
      <p style="margin:0.5rem 0 0.5rem 0;"><strong>Members:</strong> ${group.members.join(', ')}</p>
      <button onclick="showGroupDetails(${index})" style="margin-top:0.5rem;">View Details</button>
    `;
    groupList.appendChild(div);
  });
}
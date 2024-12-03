const form = document.getElementById("reminderForm"); 
const activeReminders = document.getElementById("activeReminders");
const completedReminders = document.getElementById("completedReminders");

let reminders = JSON.parse(localStorage.getItem('reminders')) || [];  // Load reminders from localStorage
let currentAudio = null;

// Request Notification Permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("reminderText").value;
  const time = new Date(document.getElementById("reminderTime").value);
  const sound = document.getElementById("alertSound").value;

  const reminder = { text, time, sound, status: "active" };
  reminders.push(reminder);
  localStorage.setItem('reminders', JSON.stringify(reminders));  // Save reminders to localStorage
  renderReminders();
  form.reset();

  // Check reminders immediately after adding a new one
  checkReminders();
});

function renderReminders() {
  activeReminders.innerHTML = "";
  completedReminders.innerHTML = "";

  reminders.forEach((reminder, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <span>${reminder.text} - ${new Date(reminder.time).toLocaleString()}</span>
      <div>
        ${
          reminder.status === "active"
            ? `<button class="action done" onclick="markDone(${index})">Done</button>
               <button class="action edit" onclick="editReminder(${index})">Edit</button>
               <button class="action delete" onclick="deleteReminder(${index})">Delete</button>`
            : `<button class="action delete" onclick="deleteReminder(${index})">Delete</button>`
        }
      </div>
    `;
    if (reminder.status === "active") {
      activeReminders.appendChild(listItem);
    } else {
      completedReminders.appendChild(listItem);
    }
  });
}

function markDone(index) {
  reminders[index].status = "done";
  localStorage.setItem('reminders', JSON.stringify(reminders));  // Update localStorage
  renderReminders();
}

function deleteReminder(index) {
  reminders.splice(index, 1);
  localStorage.setItem('reminders', JSON.stringify(reminders));  // Update localStorage
  renderReminders();
}

function editReminder(index) {
  const reminder = reminders[index];
  const newText = prompt("Edit your reminder text:", reminder.text);
  const newTime = prompt(
    "Edit your reminder time (YYYY-MM-DDTHH:MM):",
    new Date(reminder.time).toISOString().slice(0, 16)
  );

  if (newText !== null && newTime !== null) {
    reminders[index].text = newText;
    reminders[index].time = new Date(newTime);
    localStorage.setItem('reminders', JSON.stringify(reminders));  // Update localStorage
    renderReminders();
  }
}

function checkReminders() {
  const now = new Date();
  reminders.forEach((reminder, index) => {
    if (reminder.status === "active" && new Date(reminder.time) <= now) {
      // Stop and reset the previous sound
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Play Reminder Sound
      currentAudio = new Audio(reminder.sound);
      currentAudio.play();

      // Show Notification with Logo
      if (Notification.permission === "granted") {
        const notification = new Notification("Reminder", {
          body: reminder.text,
          icon: "techJoseh.png",  // Replace this with the path to your logo image
        });
      }

      // Mark the reminder as done
      reminders[index].status = "done";
      localStorage.setItem('reminders', JSON.stringify(reminders));  // Update localStorage
      renderReminders();
    }
  });
}

// Check reminders immediately on page load and then every minute
checkReminders();  // Run on page load to check for reminders
setInterval(checkReminders, 60000);  // Then continue checking every minute

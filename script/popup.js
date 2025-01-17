document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reminderForm');
  const repeatDaily = document.getElementById('repeatDaily');
  const weekdaySelector = document.getElementById('weekdaySelector');
  const reminderList = document.getElementById('reminderList');

  // Load existing reminders
  loadReminders();

  // Toggle weekday selector visibility
  repeatDaily.addEventListener('change', () => {
    weekdaySelector.classList.toggle('hidden', !repeatDaily.checked);
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const reminderText = document.getElementById('reminderText').value;
    const reminderTime = document.getElementById('reminderTime').value;
    const isRepeating = repeatDaily.checked;
    const selectedDays = isRepeating ? Array.from(weekdaySelector.querySelectorAll('input:checked')).map(input => parseInt(input.value)) : [];

    addReminder(reminderText, reminderTime, isRepeating, selectedDays);
    form.reset();
    weekdaySelector.classList.add('hidden');
  });

  function addReminder(text, time, isRepeating, selectedDays) {
    const reminder = { 
      id: Date.now().toString(),
      text, 
      time, 
      isRepeating, 
      selectedDays 
    };
    chrome.storage.sync.get({ reminders: [] }, (data) => {
      const reminders = data.reminders;
      reminders.push(reminder);
      chrome.storage.sync.set({ reminders }, () => {
        loadReminders();
        chrome.runtime.sendMessage({ action: 'scheduleReminder', reminder });
      });
    });
  }

  function loadReminders() {
    chrome.storage.sync.get({ reminders: [] }, (data) => {
      const reminders = data.reminders;
      reminderList.innerHTML = '';
      reminders.forEach((reminder, index) => {
        const reminderElement = createReminderElement(reminder, index);
        reminderList.appendChild(reminderElement);
      });
    });
  }

  function createReminderElement(reminder, index) {
    const div = document.createElement('div');
    div.className = 'reminder-item';
    div.innerHTML = `
      <p>${reminder.text}</p>
      <p>Time: ${formatDateTime(reminder.time)}</p>
      <p>${reminder.isRepeating ? `Repeats on: ${formatSelectedDays(reminder.selectedDays)}` : 'Does not repeat'}</p>
      <button data-id="${reminder.id}">Remove</button>
    `;
    div.querySelector('button').addEventListener('click', removeReminder);
    return div;
  }

  function removeReminder(e) {
    const id = e.target.getAttribute('data-id');
    chrome.storage.sync.get({ reminders: [] }, (data) => {
      const reminders = data.reminders;
      const index = reminders.findIndex(r => r.id === id);
      if (index !== -1) {
        reminders.splice(index, 1);
        chrome.storage.sync.set({ reminders }, () => {
          loadReminders();
          chrome.runtime.sendMessage({ action: 'cancelReminder', id });
        });
      }
    });
  }

  function formatDateTime(dateTimeString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  }

  function formatSelectedDays(selectedDays) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return selectedDays.map(day => daysOfWeek[day]).join(', ');
  }
});


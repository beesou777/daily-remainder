chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.sync.get({ reminders: [] }, (data) => {
    const reminder = data.reminders.find(r => r.id === alarm.name);
    if (reminder) {
      showNotification(reminder);
      if (!reminder.isRepeating) {
        removeReminder(reminder.id);
      } else {
        scheduleNextReminder(reminder);
      }
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scheduleReminder') {
    scheduleReminder(request.reminder);
  } else if (request.action === 'cancelReminder') {
    chrome.alarms.clear(request.id);
  }
});

function showNotification(reminder) {
  chrome.notifications.create(reminder.id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/img/icon.png'), // Fixed the icon URL path to use chrome.runtime.getURL
    title: 'Reminder',
    message: reminder.text
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error(`Failed to create notification: ${chrome.runtime.lastError.message}`);
    } else {
      // Open the popup window when the notification is shown
      chrome.windows.create({
        url: `reminderPopup.html?reminderText=${reminder.text}`,
        type: 'popup',
        width: 400,
        height: 200
      })
    }
  });
}



function removeReminder(id) {
  chrome.storage.sync.get({ reminders: [] }, (data) => {
    const reminders = data.reminders.filter(r => r.id !== id);
    chrome.storage.sync.set({ reminders });
  });
}

function scheduleReminder(reminder) {
  const alarmInfo = {
    when: Date.parse(reminder.time)
  };
  chrome.alarms.create(reminder.id, alarmInfo);
}

function scheduleNextReminder(reminder) {
  const now = new Date();
  const reminderTime = new Date(reminder.time);
  reminderTime.setDate(now.getDate());
  reminderTime.setMonth(now.getMonth());
  reminderTime.setFullYear(now.getFullYear());

  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const dayOfWeek = reminderTime.getDay();
  if (reminder.selectedDays.length > 0 && !reminder.selectedDays.includes(dayOfWeek)) {
    let daysToAdd = 1;
    while (!reminder.selectedDays.includes((dayOfWeek + daysToAdd) % 7)) {
      daysToAdd++;
    }
    reminderTime.setDate(reminderTime.getDate() + daysToAdd);
  }

  const alarmInfo = {
    when: reminderTime.getTime()
  };
  chrome.alarms.create(reminder.id, alarmInfo);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ reminders: [] }, (data) => {
    data.reminders.forEach(scheduleReminder);
  });
});


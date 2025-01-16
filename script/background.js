chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.local.get(alarm.name, (result) => {
      const reminder = result[alarm.name];
      if (reminder) {
        chrome.notifications.create(alarm.name, {
          type: "basic",
          iconUrl: "/assets/img/icon.png",
          title: "Reminder Alert!",
          message: reminder.message,
        });
        chrome.storage.local.remove(alarm.name);
      }
    });
  });
  
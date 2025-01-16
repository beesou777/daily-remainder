document.getElementById("reminderForm").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const message = document.getElementById("message").value;
  
    if (!date || !time || !message) {
      alert("Please fill all fields!");
      return;
    }
  
    const reminderTime = new Date(`${date}T${time}`).getTime();
  
    // Store the reminder
    chrome.storage.local.set({
      [reminderTime]: { message, time: reminderTime },
    }, () => {
      alert("Reminder set successfully!");
    });
  
    // Schedule alarm
    chrome.alarms.create(reminderTime.toString(), {
      when: reminderTime,
    });
  
    // Clear the form
    document.getElementById("reminderForm").reset();
  });
  
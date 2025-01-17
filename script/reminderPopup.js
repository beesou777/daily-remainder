document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const reminderText = params.get('reminderText');
    console.log(reminderText)
    document.getElementById('reminderText').innerText = reminderText;
  
    document.getElementById('closeButton').addEventListener('click', () => {
      window.close();
    });
  });
  
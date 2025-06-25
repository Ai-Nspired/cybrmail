const form = document.getElementById('emailForm');
const status = document.getElementById('status');
const sendBtn = document.getElementById('sendBtn');

// Change this to your deployed worker URL
const EMAIL_API_URL = 'https://cybrmail.ai-n.workers.dev/';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  sendBtn.disabled = true;
  status.textContent = "Sending...";
  status.className = "status";

  const to = form.to.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();
  const fileInput = form.file;

  // Prepare payload
  let payload = { to, subject, text: message };

  // Handle attachment as base64
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      payload.attachment = {
        name: file.name,
        type: file.type || "application/octet-stream",
        content: base64String
      };
    } catch (err) {
      status.textContent = `Error reading file: ${err.message}`;
      status.className = "status error";
      sendBtn.disabled = false;
      return;
    }
  }

  try {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const textResponse = await response.text();
    if (response.ok) {
      status.textContent = `✅ Sent! Server says:\n${textResponse}`;
      status.className = "status success";
      form.reset();
    } else {
      status.textContent = `❌ Failed (status ${response.status}):\n${textResponse}`;
      status.className = "status error";
    }
  } catch (err) {
    status.textContent = `Network error: ${err.message}`;
    status.className = "status error";
  } finally {
    sendBtn.disabled = false;
  }
});

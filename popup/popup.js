document.addEventListener('DOMContentLoaded', async () => {
  const startChatBtn = document.getElementById('start-chat-btn');
  const sendBtn = document.getElementById('send-btn');
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('messages');
  const chatContainer = document.getElementById('chat-container');
  const startContainer = document.getElementById('start-container');

  let pageContent = null;

  // Start chat button
  startChatBtn.addEventListener('click', async () => {
    try {
      // Get page content first
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'readPageContent' });
      
      if (response && response.success) {
        pageContent = response.content;
        
        // Send page content to background for context
        chrome.runtime.sendMessage({
          action: 'setPageContent',
          content: pageContent
        });
        
        // Switch to chat interface
        startContainer.style.display = 'none';
        chatContainer.classList.add('active');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
        
        // Add initial message
        addMessage('Chat started! I have the page content as context. How can I help you?', 'bot');
      } else {
        alert('Could not read page content. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Error starting chat. Please try again.');
    }
  });

  // Send message button
  sendBtn.addEventListener('click', sendMessage);

  // Enter key to send message
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';

    // Send to background for processing
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'processMessage',
        message: message
      });
      
      if (response && response.reply) {
        addMessage(response.reply, 'bot');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, there was an error processing your message.', 'bot');
    }
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
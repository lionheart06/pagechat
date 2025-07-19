document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('toggle-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status-text');

  // Load current state
  const { isEnabled = true } = await chrome.storage.sync.get('isEnabled');
  updateUI(isEnabled);

  // Toggle extension
  toggleBtn.addEventListener('click', async () => {
    const { isEnabled: currentState } = await chrome.storage.sync.get('isEnabled');
    const newState = !currentState;
    
    await chrome.storage.sync.set({ isEnabled: newState });
    updateUI(newState);
    
    // Send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled: newState });
  });

  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });

  function updateUI(isEnabled) {
    if (isEnabled) {
      statusIndicator.style.backgroundColor = '#4caf50';
      statusText.textContent = 'Active';
      toggleBtn.textContent = 'Disable Extension';
    } else {
      statusIndicator.style.backgroundColor = '#f44336';
      statusText.textContent = 'Inactive';
      toggleBtn.textContent = 'Enable Extension';
    }
  }
});
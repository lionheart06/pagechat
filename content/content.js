// Content script - runs on all pages
let isEnabled = true;

// Initialize
(async function init() {
  const result = await chrome.storage.sync.get('isEnabled');
  isEnabled = result.isEnabled ?? true;
  
  if (isEnabled) {
    attachEventListeners();
  }
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'toggle':
      isEnabled = request.enabled;
      if (isEnabled) {
        attachEventListeners();
      } else {
        removeEventListeners();
      }
      sendResponse({ success: true });
      break;
      
    case 'getPageInfo':
      sendResponse({
        title: document.title,
        url: window.location.href,
        textContent: document.body.innerText.substring(0, 1000)
      });
      break;
  }
});

function attachEventListeners() {
  // Add your page interaction logic here
  console.log('PageChat: Event listeners attached');
  
  // Example: Log clicks
  document.addEventListener('click', handleClick);
}

function removeEventListeners() {
  console.log('PageChat: Event listeners removed');
  document.removeEventListener('click', handleClick);
}

function handleClick(event) {
  if (!isEnabled) return;
  
  // Example click handler
  console.log('PageChat: Click detected on', event.target.tagName);
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'updateBadge',
    text: '!'
  });
}
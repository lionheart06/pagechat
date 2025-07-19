// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('PageChat extension installed');
  
  // Initialize default settings
  chrome.storage.sync.set({
    isEnabled: true,
    settings: {
      theme: 'light',
      notifications: true
    }
  });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      chrome.storage.sync.get('isEnabled', (result) => {
        sendResponse({ isEnabled: result.isEnabled });
      });
      return true; // Keep message channel open for async response
      
    case 'updateBadge':
      chrome.action.setBadgeText({
        text: request.text,
        tabId: sender.tab?.id
      });
      break;
      
    default:
      console.log('Unknown action:', request.action);
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Reset badge when page loads
    chrome.action.setBadgeText({ text: '', tabId: tabId });
  }
});
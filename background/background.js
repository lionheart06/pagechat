// Background service worker
let chatCounter = 0;
let pageContent = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('PageChat extension installed');
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
      
    case 'logPageContent':
      console.log('=== PAGE CONTENT LOGGED ===');
      console.log('Title:', request.content.title);
      console.log('URL:', request.content.url);
      console.log('Timestamp:', request.content.timestamp);
      console.log('Content Length:', request.content.fullContent.length);
      console.log('Text Content:', request.content.fullContent.substring(0, 500) + '...');
      console.log('========================');
      break;
      
    case 'setPageContent':
      pageContent = request.content;
      console.log('Page content set for chat context:', pageContent?.title);
      break;
      
    case 'processMessage':
      chatCounter++;
      const reply = `Hello${chatCounter}`;
      console.log('Processing message:', request.message);
      console.log('Sending reply:', reply);
      sendResponse({ reply: reply });
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
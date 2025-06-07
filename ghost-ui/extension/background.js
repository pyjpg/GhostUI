// background.js - Enhanced with better error handling and injection
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-ghost-ui") {
    console.log('Background: Received toggle-ghost-ui command');
    
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        const tabId = tabs[0].id;
        const tabUrl = tabs[0].url;
        console.log('Background: Sending message to tab', tabId, 'URL:', tabUrl);
        
        try {
          // First, try to send a message to existing content script
          await chrome.tabs.sendMessage(tabId, { action: 'toggle-ghost-ui' });
          console.log('Background: Message sent successfully to existing content script');
        } catch (error) {
          console.log('Background: Content script not ready, injecting...', error.message);
          
          // If content script not available, inject it
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['content.js']
            });
            
            // Wait a moment for injection, then try again
            setTimeout(async () => {
              try {
                await chrome.tabs.sendMessage(tabId, { action: 'toggle-ghost-ui' });
                console.log('Background: Message sent after injection');
              } catch (retryError) {
                console.error('Background: Failed to send message after injection:', retryError);
              }
            }, 500);
            
          } catch (injectionError) {
            console.error('Background: Failed to inject content script:', injectionError);
          }
        }
      }
    });
  }
});

// Handle tab updates to ensure content script is ready
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Optionally pre-inject content script for better responsiveness
    if (tab.url.startsWith('http') || tab.url.startsWith('https')) {
      console.log('Background: Tab loaded, ensuring content script is ready:', tab.url);
    }
  }
});

console.log('GhostUI background script loaded');
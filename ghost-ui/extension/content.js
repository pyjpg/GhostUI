// content.js - Fixed version with better reliability
let injected = false;
let isReady = false;

function initializeContentScript() {
  console.log('GhostUI: Initializing content script on', window.location.href);
  isReady = true;
}

function togglePalette() {
  console.log('GhostUI: togglePalette called, injected:', injected, 'isReady:', isReady);
  
  if (!isReady) {
    console.log('GhostUI: Not ready yet, retrying in 100ms');
    setTimeout(togglePalette, 100);
    return;
  }

  if (!injected) {
    console.log('GhostUI: Injecting script...');
    
    // Function to inject script when DOM is ready
    function injectScript() {
      try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('injected.js');
        script.type = 'module';
        script.onload = () => {
          console.log('GhostUI injected script loaded');
          // Wait a bit for the script to initialize
          setTimeout(() => {
            if (window.mountGhostUI) {
              console.log('GhostUI: Mounting UI');
              window.mountGhostUI();
            } else {
              console.error('mountGhostUI not available');
            }
          }, 100);
        };
        script.onerror = (err) => {
          console.error('Failed to load GhostUI script:', err);
        };
        
        // Try different injection points in order of preference
        let target = null;
        if (document.head) {
          target = document.head;
        } else if (document.documentElement) {
          target = document.documentElement;
        } else if (document.body) {
          target = document.body;
        }
        
        if (target) {
          target.appendChild(script);
          injected = true;
          console.log('GhostUI: Script injected into', target.tagName);
        } else {
          console.log('GhostUI: No injection target available, retrying...');
          // Retry after DOM elements are available
          setTimeout(injectScript, 50);
        }
      } catch (error) {
        console.error('GhostUI: Error during script injection:', error);
        // Retry on error
        setTimeout(injectScript, 100);
      }
    }
    
    injectScript();
  } else {
    console.log('GhostUI: Script already injected, mounting UI');
    // call into the injected script
    if (window.mountGhostUI) {
      window.mountGhostUI();
    } else {
      console.error('mountGhostUI not available');
    }
  }
}

// Enhanced keyboard listener with better event handling
function handleKeydown(e) {
  // Check if we're in an input field - if so, don't intercept
  const activeElement = document.activeElement;
  const isInputField = activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.contentEditable === 'true' ||
    activeElement.getAttribute('contenteditable') === 'true'
  );
  
  // Skip if in Google's search box specifically
  const isGoogleSearchBox = activeElement && (
    activeElement.getAttribute('name') === 'q' ||
    activeElement.classList.contains('gLFyf') ||
    activeElement.getAttribute('role') === 'combobox'
  );
  
  const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
  const ctrl = isMac ? e.metaKey : e.ctrlKey;
  
  if (ctrl && e.shiftKey && e.key.toLowerCase() === 'k' && !isInputField && !isGoogleSearchBox) {
    console.log('GhostUI: Keyboard shortcut triggered');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    togglePalette();
    return false;
  }
}

// Multiple event listener approaches for better compatibility
function setupKeyboardListeners() {
  // Primary listener with capture
  document.addEventListener('keydown', handleKeydown, true);
  
  // Backup listener without capture
  document.addEventListener('keydown', handleKeydown, false);
  
  // Window-level listener as final fallback
  window.addEventListener('keydown', handleKeydown, true);
}

// Message listener for chrome commands
function setupMessageListener() {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('GhostUI: Received message:', message);
      if (message.action === 'toggle-ghost-ui') {
        console.log('GhostUI: Received toggle command from background');
        togglePalette();
        sendResponse({ success: true });
      }
      return true; // Keep message channel open
    });
  }
}

// Enhanced initialization with multiple strategies
function initialize() {
  console.log('GhostUI content script starting initialization...');
  
  // Always set up message listener immediately
  setupMessageListener();
  
  // Strategy 1: Immediate initialization if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('GhostUI: DOM loaded');
      initializeContentScript();
      setupKeyboardListeners();
    });
  } else {
    // DOM already loaded
    setTimeout(() => {
      initializeContentScript();
      setupKeyboardListeners();
    }, 10);
  }
  
  // Strategy 2: Window load event (backup)
  window.addEventListener('load', () => {
    console.log('GhostUI: Window loaded');
    if (!isReady) {
      initializeContentScript();
      setupKeyboardListeners();
    }
  });
  
  // Strategy 3: Delayed initialization for dynamic pages
  setTimeout(() => {
    console.log('GhostUI: Delayed initialization check');
    if (!isReady) {
      initializeContentScript();
      setupKeyboardListeners();
    }
  }, 500);
  
  // Strategy 4: Immediate setup for keyboard listeners (most important)
  setTimeout(setupKeyboardListeners, 0);
}

// Start initialization
initialize();

console.log('GhostUI content script loaded on:', window.location.href);
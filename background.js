// Track recent tab creations to detect redirect spam
const recentTabs = new Map();
const TAB_SPAM_THRESHOLD = 3; // Close if 3+ tabs opened in 5 seconds
const TAB_SPAM_WINDOW = 5000; // milliseconds

chrome.tabs.onCreated.addListener((tab) => {
  // Close tabs opened from other tabs (popups)
  if (tab.openerTabId) {
    // Check if this looks like redirect spam
    const now = Date.now();
    const recentCount = Array.from(recentTabs.values()).filter(
      (time) => now - time < TAB_SPAM_WINDOW
    ).length;
    
    recentTabs.set(tab.id, now);
    
    // If multiple tabs opened rapidly, close them
    if (recentCount >= TAB_SPAM_THRESHOLD) {
      chrome.tabs.remove(tab.id);
      console.log(`[Popup Killer] Closed redirect spam tab: ${tab.id}`);
      return;
    }
    
    // Always close popup tabs
    chrome.tabs.remove(tab.id);
  }
  
  // Cleanup old entries
  const now = Date.now();
  for (const [id, time] of recentTabs.entries()) {
    if (now - time > TAB_SPAM_WINDOW * 2) {
      recentTabs.delete(id);
    }
  }
});

// Close tabs if their title is blank or suspicious
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.title !== undefined) {
    // Close blank/suspicious title tabs opened from popups
    if (tab.openerTabId && (!changeInfo.title || changeInfo.title.length < 3)) {
      setTimeout(() => {
        chrome.tabs.query({ url: tab.url }, (tabs) => {
          if (tabs.some(t => t.id === tabId && t.openerTabId)) {
            chrome.tabs.remove(tabId);
          }
        });
      }, 500);
    }
  }
});
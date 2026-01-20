chrome.tabs.onCreated.addListener((tab) => {
  if (tab.openerTabId) {
    chrome.tabs.remove(tab.id);
  }
});
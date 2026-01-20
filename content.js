// Disable alert/confirm/prompt
window.alert = () => {};
window.confirm = () => false;
window.prompt = () => null;

// Track user interaction state
let lastUserInteraction = {
  ctrlKey: false,
  shiftKey: false,
  metaKey: false,
  button: null,
  timestamp: 0
};

// Monitor actual user keyboard/mouse events to detect intentional opens
document.addEventListener('mousedown', (e) => {
  lastUserInteraction = {
    ctrlKey: e.ctrlKey,
    shiftKey: e.shiftKey,
    metaKey: e.metaKey,
    button: e.button,
    timestamp: Date.now()
  };
}, true);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.shiftKey) {
    lastUserInteraction = {
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
      button: null,
      timestamp: Date.now()
    };
  }
}, true);

// Only allow window.open if user intentionally triggered it (Ctrl/Cmd + Click)
window.open = (url, target, features) => {
  const now = Date.now();
  const isRecentUserAction = (now - lastUserInteraction.timestamp) < 500;
  const isModifiedClick = lastUserInteraction.ctrlKey || lastUserInteraction.metaKey || lastUserInteraction.shiftKey;
  
  if (isRecentUserAction && isModifiedClick && target === '_blank') {
    console.log(`[Popup Killer] Allowing intentional new tab: ${url}`);
    return window.open.call(window, url, target, features);
  }
  
  console.warn(`[Popup Killer] Blocked window.open attempt: ${url}`);
  return null;
};

// Remove target="_blank" unless user has modifier key held
const removeBlankTargets = () => {
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!(e.ctrlKey || e.metaKey || e.shiftKey)) {
        link.removeAttribute('target');
        link.target = '';
        console.log(`[Popup Killer] Removed target="_blank" from link (user not holding modifier key)`);
      }
    }, true);
  });
};

removeBlankTargets();
new MutationObserver(removeBlankTargets).observe(document.documentElement, { childList: true, subtree: true });

// Block forced redirects
let navigationAttempts = 0;
const startTime = Date.now();

const blockRedirect = (newUrl) => {
  navigationAttempts++;
  const elapsed = Date.now() - startTime;
  
  // Allow first navigation in first 2 seconds (legitimate page load)
  if (navigationAttempts === 1 && elapsed < 2000) {
    return false; // Allow it
  }
  
  // Block subsequent redirects (forced redirects)
  console.warn(`[Popup Killer] Blocked redirect to: ${newUrl}`);
  return true; // Block it
};

// Override window.location.replace()
const originalReplace = window.location.replace;
window.location.replace = function(url) {
  if (!blockRedirect(url)) {
    originalReplace.call(this, url);
  }
};

// Block location.assign()
const originalAssign = window.location.assign;
window.location.assign = function(url) {
  if (!blockRedirect(url)) {
    originalAssign.call(this, url);
  }
};

const removePopups = () => {
  document.querySelectorAll(
    '[role="dialog"], .modal, .popup, .overlay, .cookie'
  ).forEach(el => el.remove());
};

// Run immediately & watch for new ones
removePopups();
new MutationObserver(removePopups)
  .observe(document.documentElement, { childList: true, subtree: true });

Object.defineProperty(navigator, 'hardwareConcurrency', { value: 4 });
Object.defineProperty(navigator, 'deviceMemory', { value: 8 });

HTMLCanvasElement.prototype.toDataURL = () => "";
HTMLCanvasElement.prototype.getContext = () => null;

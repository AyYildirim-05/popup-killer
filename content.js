// Disable alert/confirm/prompt
window.alert = () => {};
window.confirm = () => false;
window.prompt = () => null;

// Block window.open at page level
window.open = () => null;

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

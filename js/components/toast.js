let region = null;

function ensureRegion() {
  if (region) return region;
  region = document.createElement("div");
  region.className = "toast-region";
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  document.body.appendChild(region);
  return region;
}

export function showToast(message, { duration = 3200 } = {}) {
  const el = ensureRegion();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message; // never innerHTML — message may echo user/server text
  el.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

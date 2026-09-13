const PREFIX = "fivem-tracker:";

function isAvailable() {
  try {
    const testKey = `${PREFIX}__test__`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const available = isAvailable();

export const storage = {
  available,

  get(key, fallback = null) {
    if (!available) return fallback;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    if (!available) return false;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      // Storage full, disabled, or private-browsing quota hit — fail
      // silently and let the app keep working in-memory for this session.
      return false;
    }
  },

  remove(key) {
    if (!available) return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* no-op */
    }
  },
};

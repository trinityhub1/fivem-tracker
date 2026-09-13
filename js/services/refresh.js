export function createRefreshLoop(callback) {
  let intervalMs = 0;
  let timerId = null;
  let running = false;

  async function tick() {
    if (running) return; // never overlap a slow request with the next tick
    running = true;
    try {
      await callback();
    } finally {
      running = false;
    }
  }

  function schedule() {
    clear();
    if (intervalMs > 0) {
      timerId = setInterval(tick, intervalMs);
    }
  }

  function clear() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clear();
    } else if (intervalMs > 0) {
      schedule();
    }
  });

  return {
    setInterval(ms) {
      intervalMs = ms;
      if (!document.hidden) schedule();
    },
    stop() {
      intervalMs = 0;
      clear();
    },
    tickNow: tick,
  };
}

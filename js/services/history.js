import { storage } from "./storage.js";

const RECENT_KEY = "recent-servers";
const MAX_RECENT = 8;
const MAX_OBSERVATIONS = 500; // caps memory for a page left open a long time

/** Recently viewed servers, persisted locally so they survive a reload. */
export const recentServers = {
  list() {
    const list = storage.get(RECENT_KEY, []);
    return Array.isArray(list) ? list : [];
  },

  record(serverId, name) {
    const list = recentServers.list().filter((s) => s.id !== serverId);
    list.unshift({ id: serverId, name: name || serverId, viewedAt: Date.now() });
    storage.set(RECENT_KEY, list.slice(0, MAX_RECENT));
  },
};

/**
 * Tracks per-server population/ping observations for the current browser
 * session only (in memory, not persisted). Used to compute session
 * statistics — explicitly NOT a claim of long-term historical data, since
 * V1 has no backend to store that.
 */
export function createSessionTracker() {
  const observationsByServer = new Map();

  function observationsFor(serverId) {
    if (!observationsByServer.has(serverId)) {
      observationsByServer.set(serverId, []);
    }
    return observationsByServer.get(serverId);
  }

  return {
    record(serverId, { players, maxPlayers, pings }) {
      const list = observationsFor(serverId);
      list.push({
        timestamp: Date.now(),
        players,
        maxPlayers,
        averagePing: pings && pings.length
          ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length)
          : null,
      });
      if (list.length > MAX_OBSERVATIONS) {
        list.splice(0, list.length - MAX_OBSERVATIONS);
      }
    },

    get(serverId) {
      return observationsFor(serverId).slice();
    },

    clear(serverId) {
      observationsByServer.delete(serverId);
    },
  };
}

export const sessionTracker = createSessionTracker();

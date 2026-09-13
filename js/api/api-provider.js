// The rest of the app should only ever import from this file, never from
// cfx-api.js directly. That keeps a single swap point if we ever add a
// different data source (e.g. an optional backend in a later version)
// alongside or instead of the direct Cfx endpoint.
import { getServerRaw, getPlayersRaw } from "./cfx-api.js";

const inflight = new Map();

// De-duplicates concurrent calls for the same key so rapid refresh clicks
// or overlapping timers don't fire multiple simultaneous requests.
function dedupe(key, factory) {
  if (inflight.has(key)) return inflight.get(key);
  const promise = factory().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

export const apiProvider = {
  async getServer(serverId) {
    return dedupe(`server:${serverId}`, () => getServerRaw(serverId));
  },

  async getPlayers(serverId) {
    return dedupe(`players:${serverId}`, () => getPlayersRaw(serverId));
  },
};

import { TrackerError, ErrorCodes } from "../utils/errors.js";

// Documented public endpoint used by servers.fivem.net itself. No API key
// required, no server-side proxy needed. If this endpoint ever changes or
// becomes unreachable directly from the browser, only this file needs to
// change — see js/api/api-provider.js for the abstraction boundary.
const ENDPOINT_BASE = "https://servers-frontend.fivem.net/api/servers/single";

const REQUEST_TIMEOUT_MS = 8000;

// getServerRaw and getPlayersRaw both need the same underlying endpoint
// response. This tiny cache means calling both together (as the app does
// on every load/refresh) results in one network request, not two.
const RAW_CACHE_MS = 2000;
const rawCache = new Map(); // serverId -> { promise, timestamp }

function fetchRawCached(serverId) {
  const cached = rawCache.get(serverId);
  if (cached && Date.now() - cached.timestamp < RAW_CACHE_MS) {
    return cached.promise;
  }
  const promise = fetchRaw(serverId);
  rawCache.set(serverId, { promise, timestamp: Date.now() });
  // Don't let a failed request poison the cache for subsequent calls.
  promise.catch(() => rawCache.delete(serverId));
  return promise;
}

async function fetchRaw(serverId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${ENDPOINT_BASE}/${encodeURIComponent(serverId)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new TrackerError(ErrorCodes.TIMEOUT, "Request timed out");
    }
    throw new TrackerError(ErrorCodes.NETWORK, "Network request failed");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new TrackerError(ErrorCodes.NOT_FOUND, "Server not found");
  }
  if (response.status === 429) {
    throw new TrackerError(ErrorCodes.RATE_LIMITED, "Rate limited");
  }
  if (response.status >= 500) {
    throw new TrackerError(ErrorCodes.UNAVAILABLE, "Upstream unavailable");
  }
  if (!response.ok) {
    throw new TrackerError(ErrorCodes.UNAVAILABLE, `Unexpected status ${response.status}`);
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw new TrackerError(ErrorCodes.MALFORMED, "Invalid JSON in response");
  }

  if (!json || typeof json !== "object" || !json.Data) {
    // The endpoint returns an empty/near-empty body for servers that are
    // offline or unknown rather than a clean 404 in every case.
    throw new TrackerError(ErrorCodes.OFFLINE, "Server appears offline");
  }

  return json;
}

function toSafeString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toSafeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function getServerRaw(serverId) {
  const json = await fetchRawCached(serverId);
  const data = json.Data || {};

  return {
    id: serverId,
    name: toSafeString(data.hostname, "Unnamed server").trim() || "Unnamed server",
    online: true,
    players: toSafeNumber(data.clients, Array.isArray(data.players) ? data.players.length : 0),
    maxPlayers: toSafeNumber(data.sv_maxclients, 0),
    gameType: typeof data.gametype === "string" ? data.gametype : null,
    mapName: typeof data.mapname === "string" ? data.mapname : null,
    joinUrl: `https://cfx.re/join/${serverId}`,
    lastUpdated: new Date(),
  };
}

export async function getPlayersRaw(serverId) {
  const json = await fetchRawCached(serverId);
  const data = json.Data || {};
  const rawPlayers = Array.isArray(data.players) ? data.players : [];

  return rawPlayers.map((p, index) => ({
    // Only display-safe fields — never identifiers, IPs, or anything
    // beyond what the server already broadcasts publicly.
    id: toSafeNumber(p && p.id, index),
    name: toSafeString(p && p.name, "Unknown").slice(0, 120),
    ping: toSafeNumber(p && p.ping, null),
  }));
}

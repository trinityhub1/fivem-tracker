import { isValidServerId } from "./validators.js";

/**
 * Accepts a bare server ID, a cfx.re/join/<id> link, or a
 * servers.fivem.net/servers/detail/<id> link and returns just the ID,
 * or null if nothing recognisable was found.
 */
export function extractServerId(rawInput) {
  if (!rawInput || typeof rawInput !== "string") return null;

  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Bare ID
  if (isValidServerId(trimmed)) {
    return trimmed.toLowerCase();
  }

  // Try parsing as a URL (with or without a protocol)
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);

    if (host === "cfx.re" && parts[0] === "join" && parts[1]) {
      return isValidServerId(parts[1]) ? parts[1].toLowerCase() : null;
    }

    if (host.endsWith("fivem.net") && parts.includes("detail")) {
      const idx = parts.indexOf("detail");
      const candidateId = parts[idx + 1];
      return candidateId && isValidServerId(candidateId)
        ? candidateId.toLowerCase()
        : null;
    }

    // Fallback: last path segment, if it looks like a valid ID
    const last = parts[parts.length - 1];
    return last && isValidServerId(last) ? last.toLowerCase() : null;
  } catch {
    return null;
  }
}

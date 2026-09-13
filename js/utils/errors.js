export class TrackerError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const ErrorCodes = {
  INVALID_ID: "INVALID_ID",
  NOT_FOUND: "NOT_FOUND",
  OFFLINE: "OFFLINE",
  TIMEOUT: "TIMEOUT",
  RATE_LIMITED: "RATE_LIMITED",
  UNAVAILABLE: "UNAVAILABLE",
  MALFORMED: "MALFORMED",
  NETWORK: "NETWORK",
};

const MESSAGES = {
  [ErrorCodes.INVALID_ID]: "That doesn't look like a valid Cfx server ID or join link.",
  [ErrorCodes.NOT_FOUND]: "We couldn't find that server. Double-check the ID and try again.",
  [ErrorCodes.OFFLINE]: "This server appears to be offline right now.",
  [ErrorCodes.TIMEOUT]: "The request took too long. The server or FiveM's endpoint may be slow to respond.",
  [ErrorCodes.RATE_LIMITED]: "Too many requests. Please wait a moment and try again.",
  [ErrorCodes.UNAVAILABLE]: "FiveM's server information service is temporarily unavailable.",
  [ErrorCodes.MALFORMED]: "The server sent back data we couldn't understand.",
  [ErrorCodes.NETWORK]: "We couldn't reach the network. Check your connection and try again.",
};

export function friendlyMessage(error) {
  if (error instanceof TrackerError && MESSAGES[error.code]) {
    return MESSAGES[error.code];
  }
  return "Something went wrong. Please try again.";
}

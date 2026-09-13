// Cfx server IDs are short alphanumeric strings (lowercase letters + digits).
// This is deliberately permissive but bounded, to avoid sending obviously
// invalid or oversized input to the API layer.
const SERVER_ID_PATTERN = /^[a-z0-9]{3,10}$/i;

export function isValidServerId(id) {
  return typeof id === "string" && SERVER_ID_PATTERN.test(id.trim());
}

export function isSafePlainText(value, maxLength = 200) {
  return typeof value === "string" && value.length <= maxLength;
}

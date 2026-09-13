// Hash routing means the server never sees the "page" (everything after #),
// so this works on GitHub Pages (or any static host) with zero rewrite
// rules and no 404 redirect trick required.

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const [path, query] = hash.split("?");
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { name: "home", params: {} };
  }
  if (segments[0] === "server" && segments[1]) {
    return { name: "server", params: { id: decodeURIComponent(segments[1]) } };
  }
  return { name: "not-found", params: { path }, query };
}

export function createRouter(routes) {
  function handle() {
    const route = parseHash();
    const handler = routes[route.name] || routes["not-found"];
    if (handler) handler(route.params);
  }

  window.addEventListener("hashchange", handle);
  window.addEventListener("DOMContentLoaded", handle);

  return {
    start: handle,
    navigate(path) {
      window.location.hash = path;
    },
  };
}

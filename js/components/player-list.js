import { pingClass } from "../utils/formatter.js";

const SORT_OPTIONS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "ping", label: "Ping" },
];

function chevronIcon() {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svgNs, "path");
  path.setAttribute("d", "M9 6l6 6-6 6");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  return svg;
}

export function renderPlayerControls(container, state, handlers) {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "player-controls";

  const searchWrap = document.createElement("div");
  searchWrap.className = "search-wrap";
  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "Search players…";
  search.setAttribute("aria-label", "Search players");
  search.value = state.query || "";
  let debounceTimer = null;
  search.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => handlers.onSearch(search.value), 180);
  });
  searchWrap.appendChild(search);
  wrap.appendChild(searchWrap);

  const sortWrap = document.createElement("div");
  sortWrap.className = "sort-buttons";
  sortWrap.setAttribute("role", "group");
  sortWrap.setAttribute("aria-label", "Sort players by");
  for (const opt of SORT_OPTIONS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = opt.label;
    btn.setAttribute("aria-pressed", String(state.sortKey === opt.key));
    btn.addEventListener("click", () => handlers.onSort(opt.key));
    sortWrap.appendChild(btn);
  }
  wrap.appendChild(sortWrap);

  container.appendChild(wrap);
}

export function renderPlayerList(container, players, handlers) {
  container.innerHTML = "";
  const list = document.createElement("div");
  list.className = "player-list";
  list.setAttribute("role", "list");

  if (players.length === 0) {
    const empty = document.createElement("div");
    empty.className = "view-state";
    empty.innerHTML = ""; // ensure clean, then set via safe nodes
    const h2 = document.createElement("h2");
    h2.textContent = "No players match your search";
    const p = document.createElement("p");
    p.textContent = "Try a different name or ID, or clear the search box.";
    empty.appendChild(h2);
    empty.appendChild(p);
    container.appendChild(empty);
    return;
  }

  for (const player of players) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "player-row";
    row.setAttribute("role", "listitem");
    row.addEventListener("click", () => handlers.onSelectPlayer(player));

    const idEl = document.createElement("span");
    idEl.className = "p-id";
    idEl.textContent = `#${player.id}`;
    row.appendChild(idEl);

    const nameEl = document.createElement("span");
    nameEl.className = "p-name";
    nameEl.textContent = player.name;
    row.appendChild(nameEl);

    const pingEl = document.createElement("span");
    pingEl.className = "p-ping";
    if (typeof player.ping === "number" && player.ping >= 0) {
      const tag = document.createElement("span");
      tag.className = `ping-tag ${pingClass(player.ping)}`;
      tag.textContent = `${player.ping}ms`;
      pingEl.appendChild(tag);
    } else {
      pingEl.textContent = "—";
    }
    row.appendChild(pingEl);

    const chevronWrap = document.createElement("span");
    chevronWrap.style.display = "flex";
    chevronWrap.style.color = "var(--text-faint)";
    chevronWrap.appendChild(chevronIcon());
    row.appendChild(chevronWrap);

    list.appendChild(row);
  }

  container.appendChild(list);
}

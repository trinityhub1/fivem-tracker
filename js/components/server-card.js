import { formatPercent, formatTime } from "../utils/formatter.js";

const REFRESH_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
];

function icon(pathData, viewBox = "0 0 24 24") {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svgNs, "path");
  path.setAttribute("d", pathData);
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  return svg;
}

const ICONS = {
  star: "M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L12 3z",
  link: "M9 15l6-6M10 6l1-1a4 4 0 015.7 5.7l-1 1M14 18l-1 1A4 4 0 017.3 13.3l1-1",
  copy: "M9 9h9a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1v-9a1 1 0 011-1zM5 15H4a1 1 0 01-1-1V5a1 1 0 011-1h9a1 1 0 011 1v1",
  share: "M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M16 6l-4-4-4 4M12 2v14",
};

export function renderServerCard(container, state, handlers) {
  const { server, isFavourite, refreshIntervalMs, lastUpdated, autoRefreshTick } = state;
  container.innerHTML = "";

  const card = document.createElement("section");
  card.className = "server-card";
  card.setAttribute("aria-label", "Server status");

  // --- top row: status + favourite ---
  const top = document.createElement("div");
  top.className = "server-card__top";

  const left = document.createElement("div");
  const pill = document.createElement("span");
  pill.className = `pill pill--${server.online ? "online" : "offline"}`;
  pill.textContent = server.online ? "Online" : "Offline";
  left.appendChild(pill);

  const name = document.createElement("h1");
  name.className = "server-card__name";
  name.textContent = server.name;
  left.appendChild(name);

  const meta = document.createElement("div");
  meta.className = "server-card__meta";
  meta.textContent = `ID: ${server.id}`;
  left.appendChild(meta);

  top.appendChild(left);

  const favBtn = document.createElement("button");
  favBtn.className = `btn is-icon btn-ghost${isFavourite ? " is-active" : ""}`;
  favBtn.setAttribute("aria-pressed", String(isFavourite));
  favBtn.setAttribute("aria-label", isFavourite ? "Remove favourite" : "Add favourite");
  favBtn.style.color = isFavourite ? "var(--accent-amber)" : "";
  favBtn.appendChild(icon(ICONS.star));
  favBtn.addEventListener("click", handlers.onToggleFavourite);
  top.appendChild(favBtn);

  card.appendChild(top);

  // --- population ---
  const pct = formatPercent(server.players, server.maxPlayers);
  const popWrap = document.createElement("div");
  popWrap.className = "server-card__population";

  const popRow = document.createElement("div");
  popRow.className = "population-row";
  const strong = document.createElement("strong");
  strong.textContent = `${server.players} / ${server.maxPlayers || "?"}`;
  popRow.appendChild(strong);
  const pctSpan = document.createElement("span");
  pctSpan.textContent = `${pct}% full`;
  popRow.appendChild(pctSpan);
  popWrap.appendChild(popRow);

  const track = document.createElement("div");
  track.className = "progress-track";
  const fill = document.createElement("div");
  fill.className = "progress-fill";
  fill.style.width = `${pct}%`;
  track.appendChild(fill);
  popWrap.appendChild(track);

  card.appendChild(popWrap);

  // --- actions ---
  const actions = document.createElement("div");
  actions.className = "server-card__actions";

  const joinBtn = document.createElement("a");
  joinBtn.className = "btn btn-primary";
  joinBtn.href = server.joinUrl;
  joinBtn.rel = "noopener noreferrer";
  joinBtn.appendChild(icon(ICONS.link));
  joinBtn.appendChild(document.createTextNode(" Join server"));
  actions.appendChild(joinBtn);

  const copyLinkBtn = document.createElement("button");
  copyLinkBtn.className = "btn btn-secondary";
  copyLinkBtn.appendChild(icon(ICONS.copy));
  const copyLinkLabel = document.createElement("span");
  copyLinkLabel.className = "btn-label-full";
  copyLinkLabel.textContent = " Copy join link";
  copyLinkBtn.appendChild(copyLinkLabel);
  copyLinkBtn.addEventListener("click", () => handlers.onCopy(server.joinUrl, "Join link copied"));
  actions.appendChild(copyLinkBtn);

  const copyIdBtn = document.createElement("button");
  copyIdBtn.className = "btn btn-ghost";
  copyIdBtn.textContent = "Copy ID";
  copyIdBtn.addEventListener("click", () => handlers.onCopy(server.id, "Server ID copied"));
  actions.appendChild(copyIdBtn);

  const shareBtn = document.createElement("button");
  shareBtn.className = "btn btn-ghost is-icon";
  shareBtn.setAttribute("aria-label", "Copy shareable link");
  shareBtn.appendChild(icon(ICONS.share));
  shareBtn.addEventListener("click", () => handlers.onCopy(handlers.shareUrl(server.id), "Shareable link copied"));
  actions.appendChild(shareBtn);

  card.appendChild(actions);

  // --- info grid ---
  const grid = document.createElement("div");
  grid.className = "server-card__info-grid";
  const infoItems = [
    ["Game type", server.gameType || "Not available"],
    ["Map", server.mapName || "Not available"],
    ["Max players", server.maxPlayers || "Not available"],
    ["Last updated", formatTime(lastUpdated)],
  ];
  for (const [label, value] of infoItems) {
    const item = document.createElement("div");
    item.className = "info-item";
    const l = document.createElement("div");
    l.className = "label";
    l.textContent = label;
    const v = document.createElement("div");
    v.className = "value";
    v.textContent = String(value);
    item.appendChild(l);
    item.appendChild(v);
    grid.appendChild(item);
  }
  card.appendChild(grid);

  // --- refresh controls ---
  const refreshRow = document.createElement("div");
  refreshRow.className = "refresh-status";

  const refreshLabel = document.createElement("span");
  refreshLabel.textContent = "Auto-refresh:";
  refreshRow.appendChild(refreshLabel);

  const select = document.createElement("select");
  select.className = "refresh-select";
  select.setAttribute("aria-label", "Auto-refresh interval");
  for (const opt of REFRESH_OPTIONS) {
    const optionEl = document.createElement("option");
    optionEl.value = String(opt.value);
    optionEl.textContent = opt.label;
    optionEl.selected = opt.value === refreshIntervalMs;
    select.appendChild(optionEl);
  }
  select.addEventListener("change", () => handlers.onRefreshIntervalChange(Number(select.value)));
  refreshRow.appendChild(select);

  if (autoRefreshTick) {
    const tickSpan = document.createElement("span");
    tickSpan.textContent = autoRefreshTick;
    refreshRow.appendChild(tickSpan);
  }

  card.appendChild(refreshRow);

  container.appendChild(card);
}

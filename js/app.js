import { createRouter } from "./router.js";
import { apiProvider } from "./api/api-provider.js";
import { extractServerId } from "./utils/parser.js";
import { TrackerError, ErrorCodes, friendlyMessage } from "./utils/errors.js";
import { storage } from "./services/storage.js";
import { favourites } from "./services/favourites.js";
import { recentServers, sessionTracker } from "./services/history.js";
import { createRefreshLoop } from "./services/refresh.js";
import { showToast } from "./components/toast.js";
import { renderServerCard } from "./components/server-card.js";
import { renderPlayerControls, renderPlayerList } from "./components/player-list.js";
import { showPlayerModal } from "./components/player-card.js";
import { renderStatistics } from "./components/statistics.js";

const root = document.getElementById("view-root");

/* ---------------------------- Theme ---------------------------- */

const THEME_KEY = "theme";
const themeButtons = document.querySelectorAll("[data-theme-choice]");
const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(choice) {
  const resolved = choice === "system" ? (systemMedia.matches ? "dark" : "light") : choice;
  document.documentElement.setAttribute("data-theme", resolved);
  themeButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === choice));
  });
}

function initTheme() {
  const saved = storage.get(THEME_KEY, "system");
  applyTheme(saved);
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      storage.set(THEME_KEY, btn.dataset.themeChoice);
      applyTheme(btn.dataset.themeChoice);
    });
  });
  systemMedia.addEventListener("change", () => {
    const saved2 = storage.get(THEME_KEY, "system");
    if (saved2 === "system") applyTheme("system");
  });
}

/* ------------------------ Shared helpers ------------------------ */

function shareUrl(serverId) {
  return `${window.location.origin}${window.location.pathname}#/server/${serverId}`;
}

async function copyToClipboard(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast("Couldn't copy automatically — you can select and copy it manually.");
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* --------------------------- Home view --------------------------- */

function renderFeatureGrid() {
  const grid = el("div", "feature-grid");
  const features = [
    ["Live players", "See who's currently online, with search and sort."],
    ["Session statistics", "Population and ping while you're watching, in a lightweight chart."],
    ["Favourites", "Save servers locally — no account needed."],
    ["Shareable links", "Every server gets a URL you can paste anywhere."],
    ["One-click join", "Jump straight into the server or copy the join link."],
    ["Free, always", "Static site, public API, zero backend. Genuinely £0 to run."],
  ];
  for (const [title, desc] of features) {
    const card = el("div", "feature");
    card.appendChild(el("h3", null, title));
    card.appendChild(el("p", null, desc));
    grid.appendChild(card);
  }
  return grid;
}

function renderChipRow(items, onRemove) {
  const row = el("div", "chip-row");
  for (const item of items) {
    const chip = el("a", "server-chip");
    chip.href = `#/server/${item.id}`;
    chip.appendChild(el("span", null, item.name));
    if (onRemove) {
      const removeBtn = el("button", "server-chip__remove", "✕");
      removeBtn.setAttribute("aria-label", `Remove ${item.name} from favourites`);
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(item.id);
        renderHome();
      });
      chip.appendChild(removeBtn);
    }
    row.appendChild(chip);
  }
  return row;
}

function renderHome() {
  stopActiveRefresh();
  root.innerHTML = "";

  const hero = el("section", "hero");
  hero.appendChild(el("div", "hero__eyebrow", "Open source · Free · No account"));
  hero.appendChild(el("h1", null, "Track FiveM servers in real time."));
  hero.appendChild(
    el("p", "lede", "Paste a server ID or join link to see live players, ping, and capacity — instantly, for free.")
  );

  const form = el("form", "lookup-form");
  form.setAttribute("role", "search");
  const input = el("input");
  input.type = "text";
  input.name = "server";
  input.placeholder = "Server ID or cfx.re/join/... link";
  input.setAttribute("aria-label", "Cfx server ID or join link");
  input.autocomplete = "off";
  form.appendChild(input);
  const submitBtn = el("button", "btn btn-primary", "Track server");
  submitBtn.type = "submit";
  form.appendChild(submitBtn);
  hero.appendChild(form);

  const hint = el("p", "lookup-hint", "Example: vp4rxq, or https://cfx.re/join/vp4rxq");
  hero.appendChild(hint);

  const freeStrip = el("div", "free-strip");
  ["No account required", "No cost to host", "Open source (MIT)"].forEach((t) => {
    freeStrip.appendChild(el("span", null, t));
  });
  hero.appendChild(freeStrip);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = extractServerId(input.value);
    if (!id) {
      showToast(friendlyMessage(new TrackerError(ErrorCodes.INVALID_ID)));
      return;
    }
    window.location.hash = `/server/${id}`;
  });

  root.appendChild(hero);
  root.appendChild(renderFeatureGrid());

  const favs = favourites.list();
  if (favs.length) {
    const section = el("div", "home-section");
    const header = el("div", "home-section__header");
    header.appendChild(el("h2", null, "Favourites"));
    section.appendChild(header);
    section.appendChild(renderChipRow(favs, (id) => favourites.remove(id)));
    root.appendChild(section);
  }

  const recents = recentServers.list().filter((r) => !favs.some((f) => f.id === r.id));
  if (recents.length) {
    const section = el("div", "home-section");
    const header = el("div", "home-section__header");
    header.appendChild(el("h2", null, "Recently viewed"));
    section.appendChild(header);
    section.appendChild(renderChipRow(recents));
    root.appendChild(section);
  }
}

/* -------------------------- Server view -------------------------- */

let activeRefresh = null;

function stopActiveRefresh() {
  if (activeRefresh) {
    activeRefresh.stop();
    activeRefresh = null;
  }
}

function renderLoadingState() {
  root.innerHTML = "";
  const card = el("section", "server-card");
  for (let i = 0; i < 4; i++) {
    card.appendChild(el("div", "skeleton skeleton-block", ""));
  }
  root.appendChild(card);
}

function renderErrorState(error) {
  root.innerHTML = "";
  const state = el("div", "view-state is-error");
  state.appendChild(el("h2", null, "Couldn't load that server"));
  state.appendChild(el("p", null, friendlyMessage(error)));
  const backLink = el("a", "btn btn-secondary", "Back to home");
  backLink.href = "#/";
  backLink.style.marginTop = "16px";
  backLink.style.display = "inline-flex";
  state.appendChild(backLink);
  root.appendChild(state);
}

const REFRESH_KEY = "refresh-interval";

async function renderServerView(serverId) {
  stopActiveRefresh();
  renderLoadingState();

  let uiState = { query: "", sortKey: "id" };

  async function loadAndRender() {
    let server, players;
    try {
      [server, players] = await Promise.all([
        apiProvider.getServer(serverId),
        apiProvider.getPlayers(serverId),
      ]);
    } catch (err) {
      renderErrorState(err);
      return;
    }

    recentServers.record(server.id, server.name);
    sessionTracker.record(server.id, {
      players: server.players,
      maxPlayers: server.maxPlayers,
      pings: players.map((p) => p.ping).filter((p) => typeof p === "number" && p >= 0),
    });

    root.innerHTML = "";

    const cardContainer = el("div");
    root.appendChild(cardContainer);

    const controlsContainer = el("div");
    const listContainer = el("div");
    const playersSection = el("div");
    playersSection.style.marginBottom = "var(--space-6)";
    const playersHeader = el("div", "section-header");
    playersHeader.appendChild(el("h2", null, "Live players"));
    playersHeader.appendChild(el("span", "count", `${players.length} online`));
    playersSection.appendChild(playersHeader);
    playersSection.appendChild(controlsContainer);
    playersSection.appendChild(listContainer);
    root.appendChild(playersSection);

    const statsContainer = el("div");
    root.appendChild(statsContainer);

    function applyPlayerFilters() {
      let filtered = players;
      if (uiState.query.trim()) {
        const q = uiState.query.trim().toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q)
        );
      }
      const sorted = [...filtered].sort((a, b) => {
        if (uiState.sortKey === "name") return a.name.localeCompare(b.name);
        if (uiState.sortKey === "ping") return (a.ping ?? Infinity) - (b.ping ?? Infinity);
        return a.id - b.id;
      });
      renderPlayerList(listContainer, sorted, {
        onSelectPlayer: showPlayerModal,
      });
    }

    function renderControls() {
      renderPlayerControls(controlsContainer, uiState, {
        onSearch: (value) => {
          uiState.query = value;
          applyPlayerFilters();
        },
        onSort: (key) => {
          uiState.sortKey = key;
          renderControls();
          applyPlayerFilters();
        },
      });
    }

    renderControls();
    applyPlayerFilters();

    function drawCard() {
      renderServerCard(
        cardContainer,
        {
          server,
          isFavourite: favourites.isFavourite(server.id),
          refreshIntervalMs: storage.get(REFRESH_KEY, 10000),
          lastUpdated: server.lastUpdated,
        },
        {
          onToggleFavourite: () => {
            const nowFav = favourites.toggle(server.id, server.name);
            showToast(nowFav ? "Added to favourites" : "Removed from favourites");
            drawCard();
          },
          onCopy: copyToClipboard,
          shareUrl,
          onRefreshIntervalChange: (ms) => {
            storage.set(REFRESH_KEY, ms);
            activeRefresh.setInterval(ms);
            showToast(ms === 0 ? "Auto-refresh turned off" : `Auto-refresh set to ${ms / 1000}s`);
          },
        }
      );
    }

    drawCard();

    renderStatistics(statsContainer, {
      observations: sessionTracker.get(server.id),
      server,
    });
  }

  activeRefresh = createRefreshLoop(loadAndRender);
  await loadAndRender();
  activeRefresh.setInterval(storage.get(REFRESH_KEY, 10000));
}

/* ------------------------- Not found view ------------------------- */

function renderNotFound() {
  stopActiveRefresh();
  root.innerHTML = "";
  const state = el("div", "view-state is-error");
  state.appendChild(el("h2", null, "Page not found"));
  state.appendChild(el("p", null, "That link doesn't match anything in FiveM Tracker."));
  const backLink = el("a", "btn btn-secondary", "Back to home");
  backLink.href = "#/";
  backLink.style.marginTop = "16px";
  backLink.style.display = "inline-flex";
  state.appendChild(backLink);
  root.appendChild(state);
}

/* ------------------------------ Init ------------------------------ */

initTheme();

const router = createRouter({
  home: renderHome,
  server: ({ id }) => {
    const cleanId = extractServerId(id) || (/^[a-z0-9]{3,10}$/i.test(id) ? id.toLowerCase() : null);
    if (!cleanId) {
      renderNotFound();
      return;
    }
    renderServerView(cleanId);
  },
  "not-found": renderNotFound,
});

router.start();

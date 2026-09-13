import { pingClass } from "../utils/formatter.js";

let currentBackdrop = null;

function closeModal() {
  if (currentBackdrop) {
    currentBackdrop.remove();
    currentBackdrop = null;
    document.removeEventListener("keydown", onKeydown);
  }
}

function onKeydown(e) {
  if (e.key === "Escape") closeModal();
}

export function showPlayerModal(player) {
  closeModal();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", `Player details for ${player.name}`);

  const header = document.createElement("div");
  header.className = "modal__header";
  const h3 = document.createElement("h3");
  h3.textContent = player.name;
  header.appendChild(h3);

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal__close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", closeModal);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const rows = document.createElement("div");
  rows.className = "modal__rows";

  const entries = [
    ["Server ID", `#${player.id}`],
    [
      "Ping",
      typeof player.ping === "number" && player.ping >= 0 ? `${player.ping}ms` : "Not available",
    ],
    ["Status", "Online now"],
  ];

  for (const [k, v] of entries) {
    const row = document.createElement("div");
    row.className = "modal__row";
    const kEl = document.createElement("span");
    kEl.className = "k";
    kEl.textContent = k;
    const vEl = document.createElement("span");
    vEl.className = "v";
    if (k === "Ping" && typeof player.ping === "number") {
      vEl.classList.add(pingClass(player.ping));
    }
    vEl.textContent = v;
    row.appendChild(kEl);
    row.appendChild(vEl);
    rows.appendChild(row);
  }
  modal.appendChild(rows);

  const note = document.createElement("p");
  note.className = "session-note";
  note.textContent =
    "Only information the server publicly broadcasts is shown here. FiveM Tracker does not attempt to reveal a player's real identity.";
  modal.appendChild(note);

  const actions = document.createElement("div");
  actions.className = "modal__actions";
  const closeAction = document.createElement("button");
  closeAction.className = "btn btn-secondary";
  closeAction.textContent = "Close";
  closeAction.addEventListener("click", closeModal);
  actions.appendChild(closeAction);
  modal.appendChild(actions);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  currentBackdrop = backdrop;
  document.addEventListener("keydown", onKeydown);
  closeBtn.focus();
}

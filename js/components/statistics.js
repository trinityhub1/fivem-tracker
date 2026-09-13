import { average } from "../utils/formatter.js";

function buildChartSvg(observations, maxPlayers) {
  const width = 600;
  const height = 160;
  const padding = 8;
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Population over the current session");

  if (observations.length < 2) {
    const text = document.createElementNS(svgNs, "text");
    text.setAttribute("x", width / 2);
    text.setAttribute("y", height / 2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "var(--text-faint)");
    text.setAttribute("font-size", "13");
    text.textContent = "Collecting session data — check back in a moment.";
    svg.appendChild(text);
    return svg;
  }

  const ceiling = Math.max(maxPlayers || 0, ...observations.map((o) => o.players), 1);
  const stepX = (width - padding * 2) / (observations.length - 1);

  const points = observations.map((o, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (o.players / ceiling) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = document.createElementNS(svgNs, "polyline");
  polyline.setAttribute("points", points.join(" "));
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "var(--accent-green)");
  polyline.setAttribute("stroke-width", "2");
  polyline.setAttribute("stroke-linejoin", "round");
  polyline.setAttribute("stroke-linecap", "round");
  svg.appendChild(polyline);

  const areaPoints = `${padding},${height - padding} ${points.join(" ")} ${width - padding},${height - padding}`;
  const area = document.createElementNS(svgNs, "polygon");
  area.setAttribute("points", areaPoints);
  area.setAttribute("fill", "var(--accent-green-bg)");
  svg.appendChild(area);

  return svg;
}

export function renderStatistics(container, { observations, server }) {
  container.innerHTML = "";

  const section = document.createElement("div");
  section.className = "stats-section";

  const header = document.createElement("div");
  header.className = "section-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Session statistics";
  header.appendChild(h2);
  section.appendChild(header);

  const note = document.createElement("p");
  note.className = "session-note";
  note.textContent =
    "Based on what this page has observed since you opened it — not long-term server history.";
  section.appendChild(note);

  const playerCounts = observations.map((o) => o.players);
  const pings = observations.map((o) => o.averagePing).filter((p) => typeof p === "number");

  const stats = [
    ["Current", server.players],
    ["Session peak", playerCounts.length ? Math.max(...playerCounts) : server.players],
    ["Session low", playerCounts.length ? Math.min(...playerCounts) : server.players],
    ["Avg. ping", pings.length ? `${average(pings)}ms` : "Not available"],
  ];

  const grid = document.createElement("div");
  grid.className = "stats-grid";
  for (const [label, value] of stats) {
    const card = document.createElement("div");
    card.className = "stat-card";
    const l = document.createElement("div");
    l.className = "label";
    l.textContent = label;
    const v = document.createElement("div");
    v.className = "value";
    v.textContent = String(value);
    card.appendChild(l);
    card.appendChild(v);
    grid.appendChild(card);
  }
  section.appendChild(grid);

  const chartWrap = document.createElement("div");
  chartWrap.className = "chart-wrap";
  chartWrap.appendChild(buildChartSvg(observations, server.maxPlayers));
  section.appendChild(chartWrap);

  container.appendChild(section);
}

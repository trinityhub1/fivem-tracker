# FiveM Tracker

Track. Discover. Connect.

FiveM Tracker is a free, open-source, static web app for looking up a FiveM
server and seeing who's currently online — live player list, ping, capacity,
session statistics, and a one-click join link. No account, no database, no
paid backend.

**Live demo:** `https://<your-github-username>.github.io/fivem-tracker/`
(update this link once you've deployed — see below)

## Features (V1)

- Look up a server by its Cfx ID or a `cfx.re/join/...` link
- Live server status, player count, and capacity
- Live player list with search and sort (by ID, name, or ping)
- Session statistics: peak/low/average population observed while you're
  watching, plus ping stats
- One-click **Join Server**, copy join link, copy server ID
- Favourites, saved locally in your browser (no account needed)
- Shareable server URLs (`#/server/<id>`) — paste a link, it loads instantly
- Auto-refresh (off / 5s / 10s / 30s / 60s)
- Dark, light, and system themes
- Mobile-first responsive layout
- Zero backend, zero database, zero cost to host

## Why it's free to run

The entire app is static HTML/CSS/JavaScript. It calls FiveM's public server
endpoint directly from the browser, so there is nothing for you to host beyond
static files. [GitHub Pages](https://pages.github.com/) serves those files at
no cost. There's no login system, no server-side code, and no paid API.

## Project structure

```
fivem-tracker/
├── .github/workflows/deploy.yml   GitHub Pages deployment
├── assets/                        icons, logo
├── css/                           styles (base, components, responsive, themes)
├── js/
│   ├── app.js                     app bootstrap
│   ├── router.js                  hash-based router (works on GitHub Pages)
│   ├── api/                       API abstraction (swap providers without touching the UI)
│   ├── components/                UI rendering (server card, player list, stats, toast)
│   ├── services/                  favourites, session history, refresh loop, storage
│   └── utils/                     parsing, formatting, validation, error mapping
├── index.html
├── 404.html                       redirects deep links back into the SPA router
├── manifest.json
└── LICENSE / SECURITY.md / CONTRIBUTING.md / CODE_OF_CONDUCT.md
```

## Running it locally

No build step or dependencies. Any static file server works:

```bash
# Python
python3 -m http.server 8080

# Node (if you have it)
npx serve .
```

Then open `http://localhost:8080`.

Opening `index.html` directly via `file://` will mostly work too, but a local
server avoids occasional browser restrictions on `fetch`.

## Deploying to GitHub Pages (free)

1. Create a new **public** repository on GitHub (e.g. `fivem-tracker`).
2. Upload/push all the files in this project to that repository.
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Push to `main` (or run the workflow manually from the **Actions** tab). The
   included workflow (`.github/workflows/deploy.yml`) will build and publish
   the site automatically.
6. Your site will be live at `https://<username>.github.io/<repo-name>/`.

No secrets, tokens, or paid plan are required for any of this.

### If you'd rather not use git/command line

You can do all of the above from github.com in the browser:

1. Create the repository (green **New** button).
2. Use **Add file → Upload files** and drag in this whole project folder.
3. Commit directly to `main`.
4. Follow steps 3–5 above in **Settings → Pages**.

## How the API layer works

The UI never calls `fetch` directly. Everything goes through
`js/api/api-provider.js`, which exposes:

```js
apiProvider.getServer(serverId)
apiProvider.getPlayers(serverId)
```

`js/api/cfx-api.js` implements this against FiveM's public server endpoint
(`https://servers-frontend.fivem.net/api/servers/single/<id>`). If that
endpoint ever changes, moves behind CORS restrictions, or you want to add a
different data source (e.g. a future optional backend), you only need to
change or add a provider — the UI and components don't need to know.

## Privacy

- FiveM Tracker does not require an account.
- Favourites, theme, and refresh preference are stored only in your browser
  (`localStorage`) — never sent anywhere.
- Only information the public FiveM server endpoint exposes is shown (server
  name, player count, connected players' current display name and ping).
- The app does not collect IP addresses, does not attempt to reveal a
  player's real identity, and does not correlate players across unrelated
  services.
- Session statistics (peak/average/low players, ping) are calculated from
  what your own browser observes while the page is open — they are not a
  historical record from a database, and the UI labels them as session data
  for that reason.

## Limitations (V1)

- Only servers that expose the standard public FiveM server info are
  supported. Data availability depends entirely on what a given server
  chooses to publish.
- "Statistics" are per-session, not long-term history — there is no backend
  to store history yet (see roadmap).
- Server discovery/browsing, monitoring/alerts, and server-owner dashboards
  are future features, not implemented in V1 (see roadmap below) — this
  keeps V1 genuinely free to host.

## Roadmap

- **V1.1** — richer charts, more session stats
- **V1.5** — server discovery/directory, filters, tags
- **V2** — optional server-owner profiles, optional FiveM resource for
  richer opt-in server data
- **V3** — optional backend for real historical data, uptime monitoring,
  and alerts (opt-in; V1's static/free path stays supported)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and small PRs are very
welcome.

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## License

MIT — see [LICENSE](LICENSE). FiveM Tracker is an independent project and is
not affiliated with, endorsed by, or sponsored by Cfx.re or Rockstar Games.

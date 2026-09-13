# Contributing to FiveM Tracker

Thanks for considering a contribution! This project is deliberately small and
dependency-light — please keep that in mind for PRs.

## Ground rules

- V1 must keep working as a static site with **no backend, no database, and
  no paid service** required.
- Don't add a framework or build step "just because" — vanilla HTML/CSS/JS is
  the default for V1 unless there's a clear, documented reason.
- Never commit API keys, tokens, or credentials.
- Never fabricate server/player data — if a field isn't available, show "Not
  available" or omit it.
- Don't add features that could be used to deanonymize players, expose IP
  addresses, or scrape data outside the public FiveM server endpoint.

## Getting started

1. Fork the repository.
2. Create a branch: `git checkout -b feature/short-description`.
3. Run the app locally with any static server (see README).
4. Make your change.
5. Test manually across desktop + mobile widths, and dark/light themes.
6. Open a pull request describing what changed and why.

## Coding style

- Use plain, modern JavaScript (ES modules where used already).
- Keep UI code out of `js/api/` — components should call the API abstraction
  (`apiProvider`), never `fetch` directly.
- Use `textContent`/safe DOM methods for anything derived from server or
  player data.
- Match existing naming: `kebab-case.js` filenames, `camelCase` functions.

## Reporting bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser/device, if relevant

## Feature requests

Open an issue describing the use case. Please check the README's roadmap
first — some features are intentionally deferred to V1.5/V2/V3 to keep V1
free to host.

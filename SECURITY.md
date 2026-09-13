# Security Policy

FiveM Tracker is a static, client-side web app. There is no server, database,
or account system in V1, which limits (but does not eliminate) the attack
surface.

## Supported versions

Only the latest version deployed on the `main` branch is supported with
security fixes.

## Design rules this project follows

- No API keys, tokens, or credentials are ever committed to the repository
  or shipped in client-side code.
- No arbitrary URL fetching or open proxying — the app only calls the
  documented public FiveM server endpoint.
- Untrusted data (server names, player names, any server-supplied text) is
  rendered using safe DOM APIs (`textContent`), never `innerHTML`, to prevent
  HTML/script injection.
- External links open safely (`rel="noopener noreferrer"`).
- No IP addresses or hidden player identifiers are collected, stored, or
  displayed.
- Dependencies are kept to a minimum; any added dependency should have a
  documented reason.

## Reporting a vulnerability

If you find a security issue (e.g. an XSS vector via server/player data, a
way to leak local favourites data, or a way to abuse the auto-refresh logic
to hammer the FiveM endpoint):

1. Please **do not** open a public GitHub issue with exploit details.
2. Instead, open a private report via GitHub's **Security → Report a
   vulnerability** tab on this repository, or contact the maintainer listed
   in the repository's profile.
3. Include steps to reproduce and, if possible, a suggested fix.

We'll acknowledge reports as quickly as we can and credit reporters (if
they'd like) once a fix ships.

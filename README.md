# All Things I'm Learning

A personal engineering blog — notes from building, breaking, and debugging software systems. Static, content-driven, no backend.

## Stack

- **React 18** + **react-router 7** (client-side routing)
- **Vite 6** (dev server + build)
- **Tailwind CSS 4** — design tokens live in `src/styles/theme.css`, consumed as utilities

## Getting started

```bash
npm install
npm run dev        # dev server
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run typecheck  # tsc --noEmit
```

## Structure

```
src/
  data/notes.ts          # single source of truth for posts (add a note → it gets a page)
  styles/theme.css       # design tokens (fonts + palette)
  app/
    App.tsx              # routes
    pages/               # HomePage, NotePage
    components/          # Hero, NotesList, Footer
```

## Adding a post

Add an entry to `notes` in `src/data/notes.ts`. It automatically appears in the
list on the home page and gets its own page at `/notes/<slug>`.

## Deploy (GitHub Pages)

The site auto-deploys on every push to `main` via
`.github/workflows/deploy.yml`, which builds and publishes `dist/` to Pages.

Live at: <https://haleyha2407.github.io/all-things-im-figuring-out/>

**One-time setup:** in the repo, go to **Settings → Pages → Build and
deployment → Source: GitHub Actions**. (The deploy step fails until this is set.)

Because it's a project page served from a subpath, two things must stay aligned:

- `base` in `vite.config.ts` — the repo subpath (`/all-things-im-figuring-out/`).
  If the repo is ever renamed, update this.
- The router `basename` in `src/main.tsx` reads Vite's `BASE_URL`, so it follows
  `base` automatically — no separate edit needed.

**SPA routing on Pages:** Pages has no server-side rewrite, so a hard load or
refresh of a route like `/notes/<slug>` would 404. `public/404.html` catches
that, encodes the path into a query string, and redirects to the app; a small
shim in `index.html` decodes it back into the real URL before React mounts.
(This only activates on live Pages — `npm run preview` has its own fallback.)

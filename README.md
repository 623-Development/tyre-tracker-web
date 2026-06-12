# Tyre Tracker Web

  React + Vite web app for the [Tyre Tracker](https://github.com/623-Development/track-app) motorsport tyre pressure tracking tool.

  ## Stack

  - **React 18 + Vite** — TypeScript, Tailwind CSS v4, shadcn/ui
  - **Clerk** — Google + Apple SSO (set `VITE_CLERK_PUBLISHABLE_KEY`)
  - **Wouter** — lightweight client-side routing
  - **TanStack Query + Axios** — API data fetching with auth token injection
  - **Recharts** — dashboard pressure charts

  ## Pages

  | Route | Description |
  |-------|-------------|
  | `/` | Dashboard – pressure overview chart |
  | `/sessions` | Session list + log new session |
  | `/sessions/:id` | Per-wheel delta breakdown |
  | `/cars` | Vehicle profiles |
  | `/compounds` | Tyre compound library |
  | `/setups` | Saved setup configurations |
  | `/settings` | App preferences |

  ## Origin

  This repository is a subtree extract from the monorepo at  
  [`623-Development/track-app`](https://github.com/623-Development/track-app) (`artifacts/tyre-tracker-web/`).

  The source `package.json` references `@workspace/api-client-react` (from the monorepo's `lib/` packages) and  
  Replit-specific Vite plugins (`@replit/vite-plugin-*`). When adapting for standalone deployment:

  1. Replace `@workspace/api-client-react` imports with the generated code inlined or via a published package
  2. Remove Replit-specific Vite plugins from `vite.config.ts`
  3. Set `BASE_PATH=/` and `PORT=3000` (or use Vite defaults by simplifying the config)
  4. Set `VITE_CLERK_PUBLISHABLE_KEY` from your Clerk dashboard

  ## Theme

  Dark-only motorsport theme — `#0d0d0f` background, `#ef3e36` primary red, no light mode toggle.
  
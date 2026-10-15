# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## Project

Hexlet course project "Календарь звонков": a calendar call-booking service, built together with AI. It is a pnpm workspaces monorepo (Node 22+, pnpm 9, TypeScript 7, ESM throughout) with two packages: `apps/backend` and `apps/frontend`. The UI text is in English; the README is in Russian.

Do not delete, edit, or rename `.github/workflows/hexlet-check.yml`. Hexlet's automated grading depends on it.

## Commands

Run these from the repo root:

```bash
pnpm dev            # backend :3000 (tsx watch) + frontend :5173 (vite), in parallel
pnpm test           # vitest run in every package
pnpm lint           # oxlint --deny-warnings (warnings fail)
pnpm typecheck      # tsc in every package
pnpm build          # backend: tsc -> dist/; frontend: tsc -b && vite build
pnpm format         # prettier --write . (pnpm format:check runs in CI)
```

To run a single package or test:

```bash
pnpm --filter backend test
pnpm --filter frontend test -- src/App.test.tsx   # single file
pnpm --filter frontend test -- -t "shows ok"      # by test name
pnpm --filter backend exec vitest                 # watch mode
```

CI (`.github/workflows/ci.yml`) runs `format:check`, `lint`, `typecheck`, `test`, and `build`, in that order. All five must pass.

## Architecture

- **Backend** (`apps/backend`): Express 5. `src/app.ts` exports `createApp()`, which builds the app without listening. `src/index.ts` only calls `listen` on `PORT` (default 3000). Tests use Supertest on `createApp()` directly, so new routes go into the app factory and never into `index.ts`. All routes live under `/api`. The backend uses `NodeNext` module resolution, so relative imports need the `.js` extension (`import { createApp } from './app.js'`). `tsconfig.build.json` excludes `*.test.ts` from the build.
- **Frontend** (`apps/frontend`): Vite + React 19 + Tailwind CSS v4 (through `@tailwindcss/vite`, so there is no tailwind config file; the theme is in `src/index.css`). The Vite dev server proxies `/api` to `http://localhost:3000`, so the frontend calls the backend with relative `/api/...` URLs. The `@/` alias points to `src/` and is set in both `vite.config.ts` and `tsconfig.app.json`. Vitest uses jsdom with globals, and `src/test/setup.ts` loads jest-dom matchers. Tests stub `fetch` with `vi.stubGlobal` instead of calling the real backend.
- **UI components**: shadcn/ui (style `base-nova`, built on `@base-ui/react` rather than Radix, with lucide icons). Generated components go in `src/components/ui/`, and oxlint's `only-export-components` rule is turned off there. Add components with the shadcn CLI (`pnpm --filter frontend exec shadcn add <name>`) or the `shadcn` MCP server set up in `.mcp.json`. Use `cn()` from `@/lib/utils` to merge class names.

## Conventions

- Commit messages must follow Conventional Commits (`feat:`, `fix:`, `chore:`, ...). A husky `commit-msg` hook enforces this with commitlint.
- Releases go through release-please. It bumps the version in the root `package.json` and in both app `package.json` files together, so don't edit versions or `CHANGELOG.md` by hand.
- Prettier and `.editorconfig` set formatting. Existing code uses single quotes.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `arkadiy93/ai-for-developers-project-386`, through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and one `docs/adr/` at the repo root. See `docs/agents/domain.md`.

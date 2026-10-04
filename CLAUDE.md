# Cap Finances — core web app

Multi-tenant hosted web app ("Cap Finances"), a rebranded fork of Bigcapital (AGPL-3.0 accounting software). This is the **product your deployed clients run** — not the desktop Electron app (`~/cap-finances-desktop`, separate repo) and not the generic self-hosted toolkit (`~/bigcapital-hosting`, which provisions per-client Docker stacks).

## How this repo reaches production
`.github/workflows/build-cap-finances.yml` builds and pushes two images on every push to `develop` (or a `v*` tag):
- `ghcr.io/bintoudu40/cap-finances-webapp`
- `ghcr.io/bintoudu40/cap-finances-server`

`~/bigcapital-hosting/multi-client.override.yml` pulls those exact images to provision each client's isolated Docker stack (one per client, auto-assigned port from 8091+, own subdomain via Cloudflare tunnel). **A commit sitting unpushed on `develop` never reaches any client** — always check `git log origin/develop..HEAD` before assuming a fix is live.

## Status as of 2026-10-04 (verify with `git log` before trusting this — this repo moves fast)
- `develop` pushed through `b427afafc` (5 new commits today, see `git log -5`): per-tenant seat limits + password-reset fix (earlier), then 4 more from a chatbot build/test session:
  1. `fix: honor custom DB/tenant ports in knex connection configs` — `BaseCommand.ts` (CLI), `SystemDB.module.ts`, `TenancyDB.module.ts`. Knex `connection` objects omitted `port` entirely, silently defaulting to mysql's 3306 regardless of `DB_PORT`/`SYSTEM_DB_PORT`/`TENANT_DB_PORT`. Blocks anyone running the DB on a non-default port.
  2. `fix: missing useEffect import crashes org setup Initializing step` — `SetupInitializingForm.tsx` called `useEffect()` with only the default `React` import; `// @ts-nocheck` hid it from typecheck. Threw `ReferenceError` in the **production build**, crashing the mandatory "Initializing" step of every new-org signup. Worth confirming this wasn't already live-broken for real users before today's fix shipped.
  3. `fix: registration could hang forever on a successful signup` — `Register.tsx`'s post-signup auto-login chain had no `.then()` on success (only `.catch()`, and that destructured the wrong error shape). `/auth/register` is a public route not covered by the authenticated-route redirect guards, so even a fully successful signup+login left the submit button spinning forever with no navigation.
  4. `feat: add rule-based French accounting assistant chatbot` — see below.
- **Chatbot shipped (2026-10-04):** `packages/webapp/src/components/Chatbot/AssistantChatbot.tsx`, mounted in `PrivatePages.tsx`, `react-chatbotify` dep. Renders only for orgs with `metadata.location` in `['BJ','SN']` (Bénin/Sénégal) — gating bug fixed before commit (was reading `organization.location` instead of `organization.metadata.location`, so it never rendered for anyone). Verified end-to-end via Playwright against a local production-mode build: opens on click, French menu + rule-based flow (TVA submenu) both tested working. **Next: confirm it renders correctly on an actual client deploy** once the build pipeline picks up this push — a local test is not a substitute for that check.

- Local dev setup notes (not previously documented): the 4 `shared/*` workspace packages (`sdk-ts`, `bigcapital-utils`, `pdf-templates`, `email-components`) must be built (`pnpm --filter <pkg> run build`) before the server will even typecheck/run — none had ever been built in a fresh clone. `ConfigModule` reads `.env` from `process.cwd()` with no `envFilePath` override, so CLI commands must be run from the repo root (or have the env exported first) — running from `packages/server` silently loses all DB credentials. There's also a separate `QUEUE_PORT` env var (BullMQ) distinct from `REDIS_PORT` — easy to miss. This repo's `.claude/CLAUDE.md` specifies Node 18.16.1 via nvm; no nvm was available in this environment and everything ran fine on Node 22 — flagged, not fixed.
- MECeF (Bénin e-invoicing) integration status lives with the desktop app, not here — see global memory `cap-finances-mecef`.

## Gotchas specific to this repo
- Mail templates (`Mail.ts`, `static/mail/*.html`) use Mustache, rendered fresh from disk per send. Any URL in an `href` MUST use triple-mustache `{{{ var }}}` — double-mustache HTML-escapes forward slashes (`/` → `&#x2F;`), which Yahoo Mail (at least) silently fails to render as a link.
- Financial report API rows are localized by `Accept-Language` — French orgs get rows like `'Produits'`/`'RÉSULTAT NET'`, not `'income'`/`'net income'`. Match on the exact localized string.
- Use `useApiRequest()` from `@/hooks/useRequest` for custom API calls, not `http` from `@/services/axios` — the latter uses a stale redux auth path and silently returns empty data.

## Where the rest of the context lives
Global Claude memory (`~/.claude/projects/-Users-senakeith/memory/`) has the full history: `cap-finances-core.md`, `bigcapital-ohada-automation-chatbot.md`, `cap-finances-mecef.md`, `bigcapital-deployment.md`, `cap-finances-license-webclients.md`. This file is the fast-path summary; that memory is the detailed log.

# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A **QBR (Quarterly Business Review) dashboard** for B2B SaaS customer success
teams. It replaces the static slide deck a CSM would normally present with a
single shareable live web page: cover, agenda, team, current-state analytics,
tech stack, future state / roadmap, and next steps.

The demo account is **"Acme Corp."** All content currently shipped is
placeholder data for that fictional account.

- Originally generated on **Lovable**; development has since moved here.
- Deployed at **dynamic-qbr.vercel.app**, auto-deploying from the `main` branch.
  A push to `main` is a production deploy — treat it as publishing.

## Where this is going

**The goal is to replace the hardcoded QBR data with live data pulled from
HubSpot.** Every decision about how data is shaped should be made with that in
mind: the account data should stay plain, serializable, JSON-shaped values so
that a HubSpot response can eventually be mapped onto the same structure. Avoid
putting React components, functions, or JSX inside the data layer — those can't
come back from an API.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** with **shadcn/ui** (Radix primitives) in `src/components/ui/`
- **React Router** (`react-router-dom`) for routing
- **Recharts** for charts
- **lucide-react** for icons
- **Vitest** + Testing Library for tests (currently only a placeholder test)
- `@` is aliased to `src/` (see `vite.config.ts`, `tsconfig.json`)

Commands:

```bash
npm run dev       # Vite dev server (UI only - /api is NOT served, see below)
npm run dev:api   # vercel dev - serves the UI *and* the serverless function
npm run build     # Vite production build
npm run lint      # eslint (currently exits 1 on pre-existing errors, see Known gaps)
npm test          # vitest run
npm run typecheck # tsc over the app AND the api/ folder
npm run verify    # REQUIRED BEFORE PUSHING - see below
```

## File structure

```
src/
  main.tsx                    entry point
  App.tsx                     providers + routes
  index.css                   Tailwind base + QBR design tokens + flip-card CSS
  pages/
    Index.tsx                 "/" -> renders dashboard with customerId "default"
    QbrPage.tsx               "/qbr/:customerId" -> same dashboard, per-customer
    QbrDashboard.tsx          the page: sticky nav + every section in order
    NotFound.tsx              catch-all 404
  contexts/
    QbrContext.tsx            QbrProvider + useQbr(); fetches the account, holds admin overrides
  data/
    account.ts                accountData — the Acme Corp content; now the FALLBACK,
                              not the source of truth (the API is)
  types/
    qbr.ts                    QbrData and all its sub-types
  components/
    qbr/                      one file per section of the QBR page
      QbrSkeleton.tsx         loading placeholder shown while the fetch is in flight
    ui/                       shadcn primitives — generated, don't hand-edit
    NavLink.tsx               router NavLink wrapper (currently unused)
  lib/
    fetchAccount.ts           client-side wrapper around GET /api/account
  hooks/, test/

api/
  account.ts                  serverless function: GET /api/account?id=<customerId>
scripts/
  smoke-api.mjs               loads + invokes the BUILT function (npm run smoke:api)
```

### Page sections and the files that render them

Rendered in this order by `src/pages/QbrDashboard.tsx`:

| On the page | File |
|---|---|
| Sticky nav | `QbrDashboard.tsx` (local `navItems` array) |
| Cover / hero | `components/qbr/CoverPage.tsx` |
| Today's Agenda | `components/qbr/AgendaOverview.tsx` |
| Your Team | `components/qbr/TeamSection.tsx` |
| Current State wrapper | `QbrDashboard.tsx` |
| — Feature Adoption | `components/qbr/FeatureAdoption.tsx` |
| — Team & Agent Overview | `components/qbr/TeamAgentOverview.tsx` |
| — Deep Dive Analysis | `components/qbr/DeepDive.tsx` |
| Tech Stack & Integrations | `components/qbr/IntegrationOpportunities.tsx` |
| Future State | `components/qbr/FutureState.tsx` |
| Product Roadmap | `components/qbr/ProductRoadmap.tsx` |
| New Feature Releases | `components/qbr/NewFeatures.tsx` |
| Next Steps | `components/qbr/NextSteps.tsx` |
| Thank You | `components/qbr/ThankYouSlide.tsx` |
| Footer | `QbrDashboard.tsx` |
| Admin editor overlay | `components/qbr/AdminPanel.tsx` |

**`components/qbr/UserEngagement.tsx` is not imported anywhere** — it is dead
code. The `licensedSeats`, `engagement`, and `trendData` fields in the data file
are therefore never rendered on the page, even though the admin panel lets you
edit them.

## How the data flows

```
GET /api/account?id=<customerId>      api/account.ts, runs on Vercel's servers
  -> fetchAccount()                   src/lib/fetchAccount.ts
  -> QbrProvider (React Query)        src/contexts/QbrContext.tsx
  -> useQbr()                         every section component
```

Components read everything from `useQbr()`; they never receive props and never
import the data file. That is what let the data source change without touching
a single section component.

The provider layers three things, in this order:

1. **The API response** (`AccountResponse` = `{ data: QbrData, meta }`) is the
   source of truth.
2. **If the API fails**, it falls back to `accountData` compiled into the bundle
   from `src/data/account.ts`, so a QBR being presented live never collapses to
   an error screen. `meta` is `null` and `isFallback` is true in that state.
3. **Saved admin edits** in `localStorage["qbr-<customerId>"]` are shallow-merged
   *over* whichever of the above applied.

While the first fetch is in flight the provider renders `QbrSkeleton` instead of
the page.

**Things to remember about the localStorage layer:**

- It is written **only when someone clicks Save in the admin panel** — not on
  every render. An earlier version wrote on every render, which meant a plain
  visit created a full override and would have masked the API's data
  permanently from the first page load onward.
- While an override exists it **wins over the server**, so live data can be
  masked. `AdminPanel` shows a "Reset to live data" button (two-step) whenever
  `hasLocalOverrides` is true. This is the interim design; the intended end
  state is to expire overrides against `meta.generatedAt` once HubSpot is live.
- Editing `src/data/account.ts` may appear to do nothing, both because the API
  now supplies the data and because a saved override may be on top. Clear the
  `qbr-<customerId>` key or use a private window when verifying a data change.
- The merge is shallow, so *new top-level fields* fall through correctly, but
  changes nested inside an existing field do not.

## Known gaps and rough edges

- **The admin password gate is client-side only and is a known security gap to
  fix later.** The panel appears when `?admin` is in the URL, and it compares
  the typed password against `data.adminPassword`, which ships inside the
  JavaScript bundle and is also readable and writable in localStorage. It keeps
  a casual viewer out of the editor; it is not access control. Do not treat it
  as protecting anything, and do not add more behind it, until it is replaced
  with a server-side check.
- **`UserEngagement.tsx` renders nowhere, but the admin panel still edits it.**
  The component is not imported by any file, so the `licensedSeats`,
  `engagement` (MAU/WAU/DAU) and `trendData` fields never appear on the page —
  yet `AdminPanel.tsx` presents forms for all of them, so an editor can spend
  time filling in numbers that no viewer will ever see. Either wire the section
  back into `QbrDashboard.tsx` or remove those forms; leaving it half-connected
  is the worst of the three options.
- **`ProductRoadmap.tsx` is hardcoded to 2026 quarters and breaks next year.**
  Grouping is driven by the literal quarter strings in `roadmapGroups`
  (`Q1 2026`, `Q2 2026`, `H2 2026`). A roadmap item in any other quarter
  matches no group and renders nowhere — it disappears silently, with no error
  and no gap on the page. As soon as the roadmap moves to 2027, every item
  vanishes until the quarters in `src/data/account.ts` are updated. The real
  fix is to derive the groups from the current date rather than list them.
- Several components key icons off content strings (team names in
  `TeamAgentOverview.tsx`, integration names in `IntegrationOpportunities.tsx`)
  or off array position (`FutureState.tsx`). Renaming or reordering content
  silently changes or drops icons.
- `README.md` is still the unedited Lovable template.

## Before pushing: `npm run verify`

**`vercel dev` is not equivalent to the real build. Run `npm run verify`
before every push.**

```bash
npm run verify
```

It runs, in order: `typecheck` -> `test` -> `build:vercel`
(`vercel build --prod`) -> `smoke:api` (loads and invokes the built function).
It needs you to be logged into the Vercel CLI. `lint` is deliberately not in
the chain because it currently exits 1 on pre-existing errors in generated
files; run it separately.

### Why this is required

On 2026-09-04 a push shipped a serverless function that returned 500 on every
request:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/src/data/account'
  imported from /var/task/api/account.js
```

`package.json` sets `"type": "module"`, so `api/account.ts` compiles to an ES
module, and Node's ESM loader will not resolve an *extensionless* relative
import at runtime. **Relative imports in `api/` must end in `.js`** (TypeScript
maps that specifier back to the `.ts` source).

Three separate things hid this, and each now has a guard:

| What hid it | Guard now in place |
|---|---|
| `vercel dev` resolves extensionless imports happily, so the function worked in every local test | `build:vercel` runs the real production build |
| `vercel build` **exits 0** — the failure is at *runtime*, not build time, so a green build proves nothing | `smoke:api` loads and invokes the built artifact, which is where the error actually fires |
| `tsconfig.api.json` used `"moduleResolution": "bundler"`, which permits extensionless imports; Vercel compiles functions with `nodenext`, which does not | `tsconfig.api.json` now uses `nodenext`, so `npm run typecheck` fails on a missing extension |

The lesson generalises: **a green build is not evidence a function runs.** Any
new file under `api/` should get a corresponding check in
`scripts/smoke-api.mjs`.

Note `tsconfig.api.json` uses `//` comments (valid in tsconfig), but a `"//"`
*key* inside `compilerOptions` is rejected with TS5023 - same trap as
`vercel.json` rejecting a `comment` key.

## Deployment config (`vercel.json`)

`vercel.json` holds one rewrite:

```json
{ "source": "/((?!api/|@|src/|node_modules/).*)", "destination": "/index.html" }
```

**What it does.** This is a single-page app: there is only one real HTML file,
and React Router decides what to show from the URL. Without this rule Vercel
looks for a file at `/qbr/acme`, finds none, and returns 404 — the route worked
in local dev but was broken in production. The rule says "serve `index.html`
and let the app route it."

**Why the exclusions.** `source` is a negative lookahead — match anything
*except* these prefixes:

| Excluded | Reason |
|---|---|
| `api/` | Serverless functions. Without this the fallback could serve HTML instead of running the function. |
| `@`, `src/`, `node_modules/` | Vite dev-server paths (`/@vite/client`, `/@react-refresh`, `/src/main.tsx`, `/node_modules/.vite/…`). **Local dev only** — see below. |

### Why the config has to accommodate local dev

This is the confusing part, so it is worth stating plainly.

**In production the catch-all is harmless**, because Vercel checks the
filesystem before applying rewrites — the docs say *"precedence is given to the
filesystem prior to rewrites being applied"*, and rewrites *"check the
filesystem by default"*. A request for `/assets/index-abc.js` finds a real
built file and never reaches the rewrite. Only URLs with no matching file —
exactly the client-side routes — fall through to `index.html`.

**Under `vercel dev` there is no built filesystem.** Vite generates modules on
the fly at paths like `/src/main.tsx` and `/@vite/client`; no such files exist
on disk. So the filesystem check finds nothing, the catch-all fires, and Vite's
JavaScript is replaced by `index.html`. The browser refuses to execute HTML as a
module script, React never boots, and you get a blank white page with failures
on `/src/main.tsx`, `/@vite/client` and `/@react-refresh`. The API is never
called, because nothing is running.

Excluding those three prefixes fixes local dev and costs production nothing: a
production build only ever emits `/assets/…`, `/index.html`, `/favicon.ico`,
`/robots.txt` and `/placeholder.svg`, none of which start with `@`, `src/` or
`node_modules/`. The only behaviour change is that a URL literally beginning
with one of those prefixes now returns a hard 404 instead of rendering the
app's NotFound page. No route in this app looks like that.

Verified by running `vercel dev` with and without each variant: with the plain
`/((?!api/).*)` pattern Vite's paths return `text/html` and the page is blank;
with the exclusions they return `text/javascript`, the page renders, and
`/api/account` is called for real. `{ "handle": "filesystem" }` does **not**
fix it — `vercel dev` does not treat the Vite dev server as the filesystem.

### `vercel.json` accepts no extra keys

Both the top level and each rewrite object are `additionalProperties: false` in
Vercel's schema, and JSON has no comment syntax, so there is nowhere in the file
to write an explanation — a stray `comment` key fails the build with
`Invalid vercel.json - rewrites[0] should NOT have additional property`.
Document rewrites here instead. Allowed keys on a rewrite are `source`,
`destination`, `has`, `missing`, `statusCode`, `env`, `transforms` and
`respectOriginCacheControl`; `$schema` is allowed at the top level. Validate a
change against `https://openapi.vercel.sh/vercel.json` before pushing.

Note also that `has` conditions silently do not work under `vercel dev`, though
they work when deployed — so anything relying on them cannot be tested locally.

## Security rules for this repo

- **API tokens must never appear in frontend code.** Nothing in `src/` is
  secret — every file under it is compiled into the bundle and served to
  anyone who loads the page. That includes `import.meta.env.VITE_*` variables,
  which Vite inlines at build time and are equally public.
- **Tokens belong in Vercel environment variables, read only by server-side
  functions.** When HubSpot work begins, the token is stored as a Vercel
  environment variable and read from inside a serverless function (an `/api`
  route), which calls HubSpot and returns only the fields the page needs. The
  browser talks to our function; only our function talks to HubSpot.
- Never commit a `.env` file or paste a real token into a source file, a test,
  or a commit message.

## Working with the repo owner

The owner is a **customer success professional who is non-technical but
learning to code**. Work accordingly:

- **Explain reasoning in plain language.** Skip unexplained jargon; when a
  technical term is necessary, define it once in a few words.
- **Break work into steps that can be verified.** Prefer a sequence of small
  changes the owner can run and eyeball over one large change.
- **Flag anything that risks breaking an existing section**, before doing it,
  and name the specific section at risk.
- **Be direct about problems rather than softening them.** If a plan is wrong,
  a premise is mistaken, or something is already broken, say so plainly and
  say what it means.
- **Do not commit or push unless explicitly asked.** The owner runs changes
  locally and confirms them first, and `main` auto-deploys to production.
- When changing data or layout, state explicitly whether the rendered page is
  expected to look identical afterward.

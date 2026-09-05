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
npm run dev      # local dev server
npm run build    # production build
npm run lint     # eslint
npm test         # vitest run
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
    QbrContext.tsx            QbrProvider + useQbr(); holds data, persists to localStorage
  data/
    mockQbr.ts                defaultQbrData — the Acme Corp content
  types/
    qbr.ts                    QbrData and all its sub-types
  components/
    qbr/                      one file per section of the QBR page
    ui/                       shadcn primitives — generated, don't hand-edit
    NavLink.tsx               router NavLink wrapper (currently unused)
  hooks/, lib/, test/
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

`src/data/mockQbr.ts` (`defaultQbrData`)
  -> `QbrProvider` in `src/contexts/QbrContext.tsx`
  -> `useQbr()` in each section component

Most account content is already centralized in `mockQbr.ts` and typed by
`QbrData` in `src/types/qbr.ts`. Components read it via `useQbr()`; they do not
receive props.

**localStorage overrides the data file.** `QbrProvider` reads
`localStorage["qbr-<customerId>"]` on mount and shallow-merges it over
`defaultQbrData`, then writes back on every change. Consequences to remember:

- Editing `mockQbr.ts` may appear to do nothing in a browser that has saved
  data. Clear the `qbr-<customerId>` key (or use a fresh profile) when
  verifying a data change.
- The merge is shallow, so *new top-level fields* fall through to the defaults
  correctly, but changes nested inside an existing field do not.

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

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
      DataSourceBadge.tsx     page-level: how fresh/trustworthy the whole page is
      SectionSourceNote.tsx   section-level, ADMIN ONLY: where a section came from
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
2. **If the API is unreachable**, it may fall back to `accountData` compiled
   into the bundle from `src/data/account.ts`, so a QBR being presented live
   never collapses to an error screen. Two conditions gate this — see
   "The bundled fallback is not a cache" below. `meta` is `null` and
   `isFallback` is true in that state.
3. **Saved admin edits** in `localStorage["qbr-<customerId>"]` are shallow-merged
   *over* whichever of the above applied.

While the first fetch is in flight the provider renders `QbrSkeleton` instead of
the page.

`DataSourceBadge` (nav bar and footer) says which of these applied. Four states,
**first match wins** — the order matters:

| Condition | Shows | Why |
|---|---|---|
| `isFallback` | ● Offline copy (amber) | API unreachable; figures may be stale |
| `hasLocalOverrides` | ● Local edits (grey) | Hand-edited in this browser |
| `meta.source !== "hubspot"` | ● Sample data (grey) | Untouched demo account |
| otherwise | Updated 2:31 PM | Live, from `meta.generatedAt` |

Overrides are checked **before** source deliberately: once a CSM has typed real
content into the admin panel the payload is still `source: "static"`, and
labelling a real curated QBR "Sample data" would be wrong.

### The bundled fallback is not a cache

`accountData` is **compiled into the JavaScript bundle**. Every visitor
downloads the whole Acme dataset as part of the app — grep a production bundle
for `sarah@vendor.io` and it is there. It is not localStorage, not a service
worker, and not a CDN cache, so clearing site data or using a fresh browser
does not affect it, and a server-side rejection cannot suppress it on its own.

That caused a real bug: `/qbr/acme` rendered the full Acme QBR labelled
"Offline copy" even though `/api/account?id=acme` correctly returned 400. The
client treated *any* failure as an outage and fell back.

Two rules now gate the fallback, decided by the pure, separately tested
`decideAccountView` in `src/lib/accountView.ts`:

1. **A 4xx is not an outage.** 400 and 404 are the server giving a definitive
   answer about *this id*. Falling back would override a decision the server
   deliberately made. Only a network failure, timeout or 5xx qualifies.
2. **Only the demo account may use the bundled copy**, because that copy *is*
   the demo account's content. Serving it under a minted id would show
   fictional Acme numbers under a real customer's URL — the same mistake
   `loadAccount` avoids on the server.

Otherwise `QbrUnavailable` renders, containing **no account content at all**.

Account id rules live in `src/lib/accountId.ts` and are imported by **both**
`api/account.ts` and `QbrContext`, so the two paths cannot drift. An
unacceptable id is never even fetched (`enabled: idIsAcceptable`).

Note the status is read from `query.error ?? query.failureReason`: while React
Query is paused between retries `error` is undefined but `failureReason` holds
the last failure, and without it a 404 is indistinguishable from an outage —
which is the one case allowed to fall back.

### The fallback depends on the query reaching an error state

`isFallback` is not simply `query.isError`. React Query may **pause** a failing
query (`fetchStatus: "paused"`) rather than failing it, which leaves `isError`
false and `status` `"pending"` indefinitely — parking the page on the loading
skeleton forever, which is worse than the error screen the fallback exists to
prevent. Observed with `@tanstack/react-query` 5.83.0 *even with*
`networkMode: "always"` set and both `navigator.onLine` and
`onlineManager.isOnline()` reporting `true`.

So the provider treats a stalled-after-failing query the same as a failed one,
and `fetchAccount` bounds every request with an 8-second timeout so a server
that accepts a connection and then hangs cannot park the page either.

**When testing the fallback, always use a fresh origin (a new localhost port).**
Pointing an already-visited origin at a failing API does *not* test the fallback:
`stale-while-revalidate` means the browser serves its cached 200 and the page
renders from that. An earlier fallback "verification" passed for exactly this
reason while the fallback was in fact broken.

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

## Visual language

Restyled 2026-09-05. Shape language from Dust's buttons (fully rounded pills,
generous padding); restraint from Linear and Notion (limited palette, real type
scale, subtle borders over shadows, no gradients). It should read as a business
document a CSM sends a customer, not a marketing page.

**Change it through tokens, not component by component.** The three files that
carry the design are `src/index.css` (colour, radii, shadow), `tailwind.config.ts`
(type scale, radius names) and `src/components/ui/button.tsx`. Retuning the base
`fontSize` scale there restyles every existing `text-sm`/`text-xs` in the app,
and `--radius` drives every `rounded-lg`.

| Token | Value | Notes |
|---|---|---|
| `--radius` | `0.875rem` (14px) | Containers: cards, panels, tables |
| `rounded-pill` | `9999px` | Anything clickable, plus status chips |
| `--radius-control` | `0.625rem` | Inputs and textareas |
| `--primary` | `234 42% 46%` | One accent, used sparingly |
| `--subtle-foreground` | `240 4% 58%` | Third text level for labels/metadata |
| `--shadow-subtle` | `0 1px 2px …/0.04` | Floating elements only; borders elsewhere |

Two decisions worth keeping:

- **`text-xs` stays at 12px** while the rest of the scale shrank. These decks
  get screenshared on video calls and labels have to survive that.
- **Status colour lives in the dot, never the text.** Feature Adoption used to
  render "High"/"Medium"/"Low" in green/amber/red, which was the loudest thing
  on a page a customer reads. The 6px dot keeps the colour; the word is neutral.
  The word alone already carried the meaning for colour-blind readers.

The cover inverts the old hierarchy: the customer's name is the display line and
"Quarterly Business Review" is a small eyebrow label above it.

The admin panel leads with a **Customer & sources** card holding Customer Name
and Customer Domain, because entering the domain is what triggers the HubSpot
and Gong lookup — it is the primary action, not one field among many. Remaining
fields sit in a plain "Basic info" card below. The header is sticky so Save
stays reachable in a long form, and the overlay is solid rather than
translucent: a document editor showing the page bleeding through reads as a
modal, not a workspace.

`AgendaOverview` and `TeamSection` use separate bordered cards with `gap-3`
rather than a `gap-px bg-border` hairline grid — with five items in a
three-column grid the old pattern left an empty grey cell in the last row.

## Customer domain and content provenance

### `customerDomain`

`QbrData.customerDomain` (e.g. `"acme.com"`) is an **identifier**, edited in the
admin panel under Basic Info between Customer Name and Logo URL. It is never
rendered on the customer-facing page. It is normalised on blur — scheme, `www.`,
path, query and trailing dots stripped, lowercased — so one customer has one
spelling and a lookup has a chance of matching.

**It is deliberately not a source of tech-stack information.** Services like
BuiltWith or Clearbit infer a stack from public web signals: DNS records, page
markup, job ads. That describes a marketing site, and it goes stale. It says
nothing about what a customer runs internally, which is what a QBR is about.
The domain is for finding a customer's *internal* records — CRM deal notes,
customer success plans, internal knowledge base docs. Do not wire a
public-web-inference vendor into this field.

### `provenance`

`QbrData.provenance` records where each sourced section's content came from,
keyed by `SourcedSection` (`features`, `integrations`, `roadmap`,
`newFeatures`). Everything is `{ kind: "manual" }` today; the extraction
pipeline will populate the rest.

`ContentProvenance` carries two dates and they mean different things:

- **`sourceDate`** — when the source material was written. This is the one
  displayed, and the only one staleness is measured against.
- **`extractedAt`** — when extraction ran. Bookkeeping; never displayed.

Conflating them defeats the purpose: an eighteen-month-old note extracted this
morning is still eighteen months stale, and stale internal context is exactly
the problem this is meant to solve.

### `SectionSourceNote`

Renders on the four sourced section headings. **Admin mode only** — it returns
null unless `?admin` is in the URL, the same gate `QbrDashboard.tsx` uses for
the admin panel. It answers a CSM's question while preparing a QBR, not a
customer's while reading one: "Manual" beside four headings tells a customer
nothing useful. `DataSourceBadge` remains the customer-facing honesty signal.
Revisit this once real sources exist and it reads "From deal notes, Mar 2026",
which is a trust signal rather than an admission.

| Situation | Shows |
|---|---|
| Manual (everything today) | `Manual` |
| Sourced, under 12 months | `From deal notes, Jun 2026` |
| Sourced, 12 months or older | ● `From success plan, Nov 2024` (amber) |
| Sourced, no date | ● `From internal docs, date unknown` (amber) |

An undated extracted source is flagged because unknown recency is itself a
risk — you cannot tell whether it is current.

It is quieter than `DataSourceBadge` on purpose: plain text rather than a
bordered pill, in the content rather than the page chrome, and a dot only when
there is something to act on. Four grey dots down the page would be noise.

Two implementation notes worth keeping:

- Dates are parsed with a local-time parser, not `new Date(iso)`. A date-only
  string like `"2026-03-01"` is parsed by `Date` as UTC midnight, which renders
  as the *previous month* in any negative-offset timezone.
- The four headings are wrapped in
  `flex flex-wrap items-center justify-between gap-3`, matching the pattern
  already used by `TeamAgentOverview.tsx`. Verified against the previous build:
  heading `x`, `y`, `height` and the total page height are unchanged; only the
  headings' box width changes from full-width to content-width, which has no
  visual effect. On a narrow screen the note wraps below the heading.

## Adoption metrics (tool-agnostic)

`AdoptionMetrics` in `src/types/adoption.ts` is the internal shape. The
dashboard never speaks Gainsight or Planhat: each tool gets an adapter in
`src/lib/adoption/` that maps its payload into this shape, so adding or
swapping a tool changes one adapter.

Two decisions worth keeping:

- **Health scores keep their original scale.** Gainsight scores 0-100, Planhat
  0-10. Both are normalised to `health.normalized` (0-100) so the UI renders one
  scale, but `raw`, `scaleMin` and `scaleMax` are kept, because "7.4" is
  meaningless without its scale and a CSM reconciling against the source tool
  needs the number they saw there.
- **Missing data is named, never defaulted.** Anything an adapter cannot supply
  is listed in `unavailable` (e.g. `"activity.dau"`, which Planhat does not
  report). In a QBR "0 logins" and "we do not know" are completely different
  statements, and a shape that cannot tell them apart will eventually put a
  confident zero in front of a customer.

`src/lib/adoption/fixtures.ts` holds synthetic payloads **modelled on each
vendor's published field names, not captured from a real tenant** — we have no
live access to either tool. They are enough to build and test the mapping
against; they are not evidence the mapping matches production data. Re-check
each adapter against a real payload before trusting it.

## Extraction pipeline (HubSpot + Gong -> Deep Dive)

`POST /api/extract { domain }` looks a customer up and drafts the Deep Dive.
Triggered automatically when a CSM leaves the Customer Domain field in the
admin panel.

**It returns a draft and saves nothing.** The CSM sees what matched — company,
note count, call count, newest source date, warnings — and presses Apply. A
wrong match would otherwise put another customer's material straight into this
QBR, which is then presented to them.

### Matching rules, and why

**Calls are matched by participant email domain only. There is deliberately no
company-name matching and no reliance on a HubSpot-Gong linkage.**

- Name matching cannot separate "Acme Corp" from "Acme Corporation" from "Acme
  Holdings". A false positive does not show an empty section, it pulls another
  customer's transcript into this QBR, silently. Returning nothing is always
  the better failure.
- The Gong-HubSpot linkage only exists if that integration is configured, so
  code assuming it will silently find nothing.
- Requiring a customer participant also excludes internal calls — pipeline
  reviews have only colleagues on them.
- Consumer email domains (`gmail.com` and friends) are rejected outright: such
  a record would match half the call library.
- Subdomains match (`eu.acme.com`), lookalikes do not (`acme.com.evil.net`,
  `acmecorp.com`). See `src/lib/matching.ts` and its tests.
- A 180-day recency window applies, and skipped older calls are reported rather
  than silently dropped.
- Multiple HubSpot companies on one domain (duplicates, subsidiaries, test
  records) are surfaced as a warning, not silently resolved to the first.

### Credentials

`HUBSPOT_TOKEN`, `GONG_TOKEN` and `ANTHROPIC_API_KEY` are Vercel environment
variables read only in `api/lib/env.ts`, inside serverless functions. If any is
missing the endpoint returns **503 naming exactly which**, rather than an empty
draft that reads like "this customer has nothing to report".

**The HubSpot and Gong clients are unverified against live tenants.** They were
written from each vendor's published API shapes with no token available to test
them. Treat the field mappings as a first draft.

## Known gaps and rough edges

- **There is no authentication. The editor is open to anyone with the URL.**
  The password gate was removed on 2026-09-05: `adminPassword` shipped in the
  bundle *and* in the public API response, so it protected nothing and its
  presence implied a security property that did not exist. Removing it deleted
  a bug, not a defence. The editor overlay opens whenever `?admin` is in the
  URL. `isEditorOpen` in `QbrContext` means "overlay is open", **not**
  "authenticated". Treat the whole app as single-user and internal, and do not
  put anything behind `?admin` that would matter if a stranger opened it.
- **Account ids are capability URLs, not access control.** `/api/account`
  accepts the public demo id `default` (fictional Acme data only) and otherwise
  requires a minted 24-64 character base36 id — mint one with
  `npm run new-account-id`. Guessable ids like `acme` are rejected with 400.
  This stops one customer discovering another's QBR by editing the URL. It does
  **not** stop a leaked or forwarded link being used, and `/api/account` still
  requires no credentials. Anyone holding the link can read that account, so
  share it like a password. Real authentication is still outstanding, and it is
  the thing to fix before genuinely sensitive extracted content lands here.
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

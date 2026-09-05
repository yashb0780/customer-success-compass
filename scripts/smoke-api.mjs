/**
 * Smoke-test the BUILT serverless function.
 *
 * Why this exists: `vercel build` succeeding is not enough. The 500 on
 * 2026-09-04 (ERR_MODULE_NOT_FOUND) came from a build that exited 0 and
 * produced a function that could not be loaded at runtime. This script loads
 * the compiled artifact the way Lambda does and invokes it, so that class of
 * failure is caught before pushing rather than in production.
 *
 * Run `npm run build:vercel` first; `npm run verify` does both.
 */
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const FUNC = ".vercel/output/functions/api/account.func/api/account.js";
const abs = resolve(process.cwd(), FUNC);

const fail = (msg) => {
  console.error(`\n  FAILED  ${msg}\n`);
  process.exit(1);
};

if (!existsSync(abs)) {
  fail(
    `No built function at ${FUNC}\n` +
      `          Run \`npm run build:vercel\` first (or \`npm run verify\`, which does both).`,
  );
}

// Loading is the step that failed in production: an ES module with an
// unresolvable relative import throws here, not at build time.
let handler;
try {
  const mod = await import(pathToFileURL(abs).href);
  handler = mod.default;
} catch (err) {
  fail(
    `The built function could not be loaded.\n` +
      `          This is exactly how the production 500 looked, and it does NOT\n` +
      `          show up under \`vercel dev\`.\n\n` +
      `          ${err.code ?? err.name}: ${err.message.split("\n")[0]}`,
  );
}

if (typeof handler !== "function") fail("The built function has no default export.");

function mockRes() {
  const r = { statusCode: 0, headers: {}, body: undefined };
  r.setHeader = (k, v) => ((r.headers[k.toLowerCase()] = v), r);
  r.status = (c) => ((r.statusCode = c), r);
  r.json = (b) => ((r.body = b), r);
  return r;
}

async function call(req) {
  const res = mockRes();
  await handler(req, res);
  return res;
}

const checks = [];
const check = (name, ok, detail = "") => {
  checks.push({ name, ok, detail });
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail && !ok ? ` — ${detail}` : ""}`);
};

console.log("\nSmoke-testing the built function:\n");

const ok = await call({ method: "GET", query: {} });
check("GET /api/account returns 200", ok.statusCode === 200, `got ${ok.statusCode}`);
check("response has data and meta", Boolean(ok.body?.data && ok.body?.meta));
check("payload is the full account", Object.keys(ok.body?.data ?? {}).length > 20,
  `${Object.keys(ok.body?.data ?? {}).length} fields`);
check("meta.generatedAt is a valid date", !Number.isNaN(Date.parse(ok.body?.meta?.generatedAt ?? "")));
check("CDN caches but browser revalidates",
  (ok.headers["cache-control"] ?? "").includes("max-age=0") &&
    (ok.headers["cache-control"] ?? "").includes("s-maxage="),
  ok.headers["cache-control"]);

check("payload carries customerDomain", typeof ok.body?.data?.customerDomain === "string",
  JSON.stringify(ok.body?.data?.customerDomain));
check(
  "payload carries provenance for all four sourced sections",
  ["features", "integrations", "roadmap", "newFeatures"].every(
    (k) => typeof ok.body?.data?.provenance?.[k]?.kind === "string",
  ),
  JSON.stringify(ok.body?.data?.provenance),
);

const demo = await call({ method: "GET", query: { id: "default" } });
check("?id=default echoes the customer id", demo.body?.meta?.customerId === "default");

// Guessable ids must be rejected: this is what stops one customer finding
// another's QBR by editing the URL.
for (const guessable of ["acme", "globex", "customer1"]) {
  const r = await call({ method: "GET", query: { id: guessable } });
  check(`guessable id "${guessable}" is rejected`, r.statusCode === 400, `got ${r.statusCode}`);
}
const minted = await call({ method: "GET", query: { id: "gtuydglmatr0gnz5rop9tdigo" } });
check("a minted id is accepted but has no account yet (404)", minted.statusCode === 404,
  `got ${minted.statusCode}`);
check("no adminPassword anywhere in the response",
  !JSON.stringify(ok.body).includes("adminPassword"));

const bad = await call({ method: "GET", query: { id: "bad id!" } });
check("a malformed id is rejected with 400", bad.statusCode === 400, `got ${bad.statusCode}`);
check("error responses are never cached", bad.headers["cache-control"] === "no-store");
check("error responses carry no data", bad.body?.data === undefined);

const post = await call({ method: "POST", query: {} });
check("POST is rejected with 405", post.statusCode === 405, `got ${post.statusCode}`);

// ---------------------------------------------------------------------------
// api/extract — every guard below is reachable WITHOUT credentials, which is
// the point: the endpoint must refuse clearly rather than return an empty
// draft that reads like "this customer has nothing to report".
// ---------------------------------------------------------------------------
const EXTRACT = ".vercel/output/functions/api/extract.func/api/extract.js";
const extractAbs = resolve(process.cwd(), EXTRACT);

if (!existsSync(extractAbs)) {
  fail(`No built function at ${EXTRACT}`);
}

let extract;
try {
  extract = (await import(pathToFileURL(extractAbs).href)).default;
} catch (err) {
  fail(`The built extract function could not be loaded.\n          ${err.code ?? err.name}: ${err.message.split("\n")[0]}`);
}

async function callExtract(req) {
  const res = mockRes();
  await extract(req, res);
  return res;
}

console.log("");
const wrongMethod = await callExtract({ method: "GET", body: {} });
check("extract rejects GET with 405", wrongMethod.statusCode === 405, `got ${wrongMethod.statusCode}`);

const noDomain = await callExtract({ method: "POST", body: {} });
check("extract requires a domain (400)", noDomain.statusCode === 400, `got ${noDomain.statusCode}`);

const freeMail = await callExtract({ method: "POST", body: { domain: "gmail.com" } });
check("extract refuses a consumer email domain", freeMail.statusCode === 400 &&
  freeMail.body?.error?.code === "free_email_domain", JSON.stringify(freeMail.body?.error));

const unconfigured = await callExtract({ method: "POST", body: { domain: "acme.com" } });
check("extract says which tokens are missing rather than returning an empty draft",
  unconfigured.statusCode === 503 && unconfigured.body?.error?.code === "not_configured",
  JSON.stringify(unconfigured.body?.error));
check("that message names the env vars to set",
  ["HUBSPOT_TOKEN", "GONG_TOKEN", "ANTHROPIC_API_KEY"].every((k) =>
    (unconfigured.body?.error?.message ?? "").includes(k)),
  unconfigured.body?.error?.message);
check("extract responses are never cached", unconfigured.headers["cache-control"] === "no-store");

const failed = checks.filter((c) => !c.ok);
if (failed.length) {
  console.error(`\n  ${failed.length} of ${checks.length} checks failed. Do not push.\n`);
  process.exit(1);
}
console.log(`\n  All ${checks.length} checks passed. The built function works.\n`);

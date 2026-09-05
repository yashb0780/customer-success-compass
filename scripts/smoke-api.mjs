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

const acme = await call({ method: "GET", query: { id: "acme" } });
check("?id=acme echoes the customer id", acme.body?.meta?.customerId === "acme");

const bad = await call({ method: "GET", query: { id: "bad id!" } });
check("a malformed id is rejected with 400", bad.statusCode === 400, `got ${bad.statusCode}`);
check("error responses are never cached", bad.headers["cache-control"] === "no-store");
check("error responses carry no data", bad.body?.data === undefined);

const post = await call({ method: "POST", query: {} });
check("POST is rejected with 405", post.statusCode === 405, `got ${post.statusCode}`);

const failed = checks.filter((c) => !c.ok);
if (failed.length) {
  console.error(`\n  ${failed.length} of ${checks.length} checks failed. Do not push.\n`);
  process.exit(1);
}
console.log(`\n  All ${checks.length} checks passed. The built function works.\n`);

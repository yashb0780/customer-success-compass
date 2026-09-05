/**
 * GET /api/account?id=<customerId>
 *
 * Returns the QBR content for one account, wrapped in an AccountResponse
 * envelope. `id` is optional: with no id we serve the single demo account, so
 * the same URL keeps working once real customer ids start being passed.
 *
 * This file runs on Vercel's servers, NOT in the browser. Nothing here is
 * shipped to visitors, which is why the HubSpot token will belong in this
 * file's environment (process.env) and never anywhere under src/.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
// NOTE: the ".js" extension is required, not optional. package.json sets
// "type": "module", so this compiles to an ES module and Node's ESM loader
// will not resolve an extensionless relative path at runtime — it fails with
// ERR_MODULE_NOT_FOUND. TypeScript maps the ".js" specifier back to the ".ts"
// source. `vercel dev` tolerates the extensionless form; the real build does not.
import { accountData } from "../src/data/account.js";
import type {
  AccountErrorResponse,
  AccountResponse,
  AccountSource,
  QbrData,
} from "../src/types/qbr.js";

/**
 * The one public, deliberately-guessable id. It serves ONLY the fictional Acme
 * demo account, which contains no real customer data.
 */
const DEMO_ACCOUNT_ID = "default";

/**
 * Real accounts use a minted, unguessable id (mint one with
 * `npm run new-account-id`). 24+ base36 characters is ~124 bits of entropy, so
 * the id cannot be found by guessing "acme", "globex" and so on.
 *
 * This is a capability URL, NOT authentication: anyone holding the link can
 * read that account. It stops customers discovering EACH OTHER's QBRs by
 * editing the URL. It does not stop a leaked link being used. See CLAUDE.md.
 */
const ACCOUNT_ID_PATTERN = /^[a-z0-9]{24,64}$/;

function isAcceptableAccountId(id: string): boolean {
  return id === DEMO_ACCOUNT_ID || ACCOUNT_ID_PATTERN.test(id);
}

/**
 * Cache at Vercel's CDN, not in the visitor's browser.
 *
 * s-maxage/stale-while-revalidate apply to the shared CDN cache, so a room
 * full of people opening the page does not become a room full of HubSpot
 * calls. max-age=0 keeps the BROWSER revalidating every time: without it a
 * visitor can be handed a stale payload for the whole stale-while-revalidate
 * window, so refreshing after a HubSpot edit would still show old numbers.
 */
const CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";

interface LoadedAccount {
  data: QbrData;
  source: AccountSource;
}

/**
 * The single seam that HubSpot will replace.
 *
 * Today: every id resolves to the one bundled demo account. Later: look the
 * customer up in HubSpot, map the response onto QbrData, and return
 * source: "hubspot". Returning null means "no such customer" (404).
 */
async function loadAccount(customerId: string): Promise<LoadedAccount | null> {
  if (customerId === DEMO_ACCOUNT_ID) {
    return { data: accountData, source: "static" };
  }
  // There is no account registry yet, so a well-formed id for a real account
  // resolves to nothing. Returning the demo account here instead would serve
  // fictional Acme numbers under a real customer's URL.
  return null;
}

function sendError(
  res: VercelResponse,
  status: number,
  code: AccountErrorResponse["error"]["code"],
  message: string,
) {
  // Never let an error response be cached — a transient HubSpot outage should
  // not stick around at the CDN for five minutes.
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json({ error: { code, message } } satisfies AccountErrorResponse);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "method_not_allowed", "Only GET is supported.");
  }

  // A repeated query string (?id=a&id=b) arrives as an array; take the first.
  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const customerId = rawId?.trim() || DEMO_ACCOUNT_ID;

  if (!isAcceptableAccountId(customerId)) {
    return sendError(
      res,
      400,
      "invalid_customer_id",
      "Account id must be a minted 24-64 character identifier. Short, guessable ids are rejected so that one customer cannot find another's QBR by editing the URL.",
    );
  }

  try {
    const loaded = await loadAccount(customerId);

    if (!loaded) {
      return sendError(res, 404, "not_found", `No account found for "${customerId}".`);
    }

    const body: AccountResponse = {
      data: loaded.data,
      meta: {
        customerId,
        source: loaded.source,
        generatedAt: new Date().toISOString(),
      },
    };

    res.setHeader("Cache-Control", CACHE_CONTROL);
    return res.status(200).json(body);
  } catch (err) {
    // Log the real reason server-side; send the caller something generic.
    console.error("[api/account] failed to load account", { customerId, err });
    return sendError(res, 502, "upstream_error", "Could not load account data.");
  }
}

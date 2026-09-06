/**
 * Account id rules — the SINGLE definition, used by both the serverless
 * function and the browser.
 *
 * It lives in src/lib so `api/account.ts` and `QbrContext` import the same
 * code. When these rules lived only on the server, the client happily rendered
 * a rejected id from the copy bundled into the page, so the server's decision
 * had no effect on what a visitor saw.
 */

/**
 * The one public, deliberately-guessable id. It serves ONLY the fictional Acme
 * demo account, which contains no real customer data.
 */
export const DEMO_ACCOUNT_ID = "default";

/**
 * Real accounts use a minted, unguessable id (`npm run new-account-id`).
 * 24+ base36 characters is ~124 bits of entropy, so an id cannot be found by
 * guessing "acme", "globex" and so on.
 *
 * A capability URL, NOT authentication: anyone holding the link can read that
 * account. It stops customers discovering EACH OTHER's QBRs by editing the URL.
 */
export const ACCOUNT_ID_PATTERN = /^[a-z0-9]{24,64}$/;

export function isAcceptableAccountId(id: string): boolean {
  return id === DEMO_ACCOUNT_ID || ACCOUNT_ID_PATTERN.test(id);
}

/** The bundled copy in src/data/account.ts is the DEMO account's content.
 *  It must never stand in for any other account. */
export function canUseBundledFallback(id: string): boolean {
  return id === DEMO_ACCOUNT_ID;
}

/**
 * Client-side half of the /api/account contract.
 *
 * Everything that knows the API's URL and body shape lives here, so the rest
 * of the app only ever deals with an AccountResponse.
 */
import type { AccountErrorResponse, AccountResponse } from "@/types/qbr";

/**
 * How long to wait before giving up and letting the page fall back to the
 * bundled copy. A QBR is presented live, so an unbounded wait is worse than
 * slightly stale content: without this, a server that accepts the connection
 * and then hangs would park the page on the loading skeleton indefinitely.
 */
const REQUEST_TIMEOUT_MS = 8000;

/** A failed account fetch, carrying enough detail to tell the user why. */
export class AccountFetchError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "AccountFetchError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Fetch one account. `customerId` is optional so the URL stays identical
 * whether or not we are passing a real id yet.
 */
export async function fetchAccount(customerId?: string, signal?: AbortSignal): Promise<AccountResponse> {
  const url = customerId
    ? `/api/account?id=${encodeURIComponent(customerId)}`
    : "/api/account";

  // Bound the request ourselves. Written with AbortController rather than
  // AbortSignal.timeout/any so it works in older browsers too.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    // The caller cancelled (React Query unmounting or refetching): propagate
    // that as-is so it is not reported to the user as a failure.
    if (signal?.aborted) throw err;
    if (timedOut) {
      throw new AccountFetchError(
        `The server did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds.`,
        0,
        "timeout",
      );
    }
    // Offline, DNS failure, connection refused — never reached the server.
    throw new AccountFetchError("Could not reach the server.", 0, "network_error");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }

  if (!res.ok) {
    // Try for the structured error body, but never let parsing it mask the
    // original failure.
    let message = `Request failed with status ${res.status}.`;
    let code = "http_error";
    try {
      const body = (await res.json()) as AccountErrorResponse;
      if (body?.error?.message) message = body.error.message;
      if (body?.error?.code) code = body.error.code;
    } catch {
      // Non-JSON error page; keep the generic message above.
    }
    throw new AccountFetchError(message, res.status, code);
  }

  const body = (await res.json()) as AccountResponse;

  // A 200 with the wrong shape would otherwise surface as a confusing crash
  // deep inside a section component.
  if (!body?.data || !body?.meta) {
    throw new AccountFetchError("Malformed account response.", res.status, "malformed_response");
  }

  return body;
}

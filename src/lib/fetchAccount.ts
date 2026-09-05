/**
 * Client-side half of the /api/account contract.
 *
 * Everything that knows the API's URL and body shape lives here, so the rest
 * of the app only ever deals with an AccountResponse.
 */
import type { AccountErrorResponse, AccountResponse } from "@/types/qbr";

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

  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (err) {
    // Offline, DNS failure, request aborted — never reached the server.
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new AccountFetchError("Could not reach the server.", 0, "network_error");
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

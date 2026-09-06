import { canUseBundledFallback, isAcceptableAccountId } from "./accountId";

/**
 * What the page should show for one account id and one fetch outcome.
 *
 * Pure and separately tested, because the wrong answer here is not a cosmetic
 * bug: it decides whether a stranger's URL renders another account's content.
 */
export type AccountView =
  | { kind: "loading" }
  | { kind: "live" }
  | { kind: "fallback" }
  | { kind: "unavailable"; reason: "invalid-id" | "not-found" | "unreachable" };

export function decideAccountView(input: {
  customerId: string;
  hasData: boolean;
  /** Query has failed, or stalled in a way it will not recover from. */
  stalled: boolean;
  /** HTTP status of the failure, when there was one. 0 for network errors. */
  status?: number;
}): AccountView {
  const { customerId, hasData, stalled, status } = input;

  // A rejected id must not reach the bundled copy, so this is checked first
  // and the fetch is never made.
  if (!isAcceptableAccountId(customerId)) {
    return { kind: "unavailable", reason: "invalid-id" };
  }

  if (hasData) return { kind: "live" };
  if (!stalled) return { kind: "loading" };

  // 4xx is the server giving a definitive answer about THIS id: it is invalid,
  // or there is no such account. That is not an outage, and falling back would
  // override a decision the server deliberately made.
  if (status !== undefined && status >= 400 && status < 500) {
    return { kind: "unavailable", reason: status === 404 ? "not-found" : "invalid-id" };
  }

  // A genuine outage — network failure, timeout, 5xx. Only the demo account may
  // use the bundled copy, because that copy IS the demo account's content.
  if (canUseBundledFallback(customerId)) return { kind: "fallback" };

  return { kind: "unavailable", reason: "unreachable" };
}

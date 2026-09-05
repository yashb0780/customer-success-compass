/**
 * Matching a customer to their records across HubSpot and Gong.
 *
 * Deliberately conservative. A false positive here does not produce an empty
 * section — it pulls ANOTHER customer's deal notes or call transcript into this
 * customer's QBR, which is then presented to them. Returning nothing is always
 * the better failure.
 *
 * So: match on email domain, never on company name. Name matching cannot
 * distinguish "Acme Corp" from "Acme Corporation" from "Acme Holdings", and it
 * fails silently.
 */

/** Consumer domains. A record carrying one of these matches half the world. */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "hotmail.com",
  "outlook.com", "live.com", "msn.com", "aol.com", "icloud.com", "me.com",
  "proton.me", "protonmail.com", "gmx.com", "mail.com", "zoho.com", "yandex.com",
  "qq.com", "163.com",
]);

/** Strip scheme, credentials, www., path, query, port and trailing dots. */
export function normalizeDomain(raw: string): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .replace(/^[^@/]*@/, "")
    .replace(/[/?#].*$/, "")
    .replace(/:\d+$/, "")
    .replace(/^www\./, "")
    .replace(/\.+$/, "");
}

export function isFreeEmailDomain(domain: string): boolean {
  return FREE_EMAIL_DOMAINS.has(normalizeDomain(domain));
}

/** The domain part of an email address, normalised. "" if unparseable. */
export function emailDomain(email: string): string {
  const at = String(email ?? "").lastIndexOf("@");
  return at === -1 ? "" : normalizeDomain(email.slice(at + 1));
}

/**
 * Does this email belong to the customer? True for the domain itself and for
 * subdomains (eu.acme.com), false for lookalikes (acme.com.evil.net,
 * notacme.com).
 */
export function emailBelongsToDomain(email: string, customerDomain: string): boolean {
  const target = normalizeDomain(customerDomain);
  if (!target || isFreeEmailDomain(target)) return false;
  const d = emailDomain(email);
  if (!d) return false;
  return d === target || d.endsWith(`.${target}`);
}

export interface CallParticipant {
  emailAddress?: string;
}

export interface CallLike {
  id?: string;
  title?: string;
  started?: string;
  parties?: CallParticipant[];
}

export interface CallSelection {
  /** Calls with at least one participant from the customer's domain, recent enough. */
  selected: CallLike[];
  /** Why each rejected call was rejected — surfaced so a CSM can see what was skipped. */
  rejected: { id: string; reason: "no-customer-participant" | "too-old" | "no-date" }[];
}

/**
 * Pick the calls that genuinely belong to this customer.
 *
 * A call qualifies only if someone from the customer's own email domain was on
 * it. That rules out internal pipeline reviews, which have only colleagues on
 * them, and it rules out other customers entirely.
 */
export function selectCallsForDomain(
  calls: CallLike[],
  customerDomain: string,
  opts: { maxAgeDays?: number; now?: Date } = {},
): CallSelection {
  const maxAgeDays = opts.maxAgeDays ?? 180;
  const now = opts.now ?? new Date();
  const cutoff = now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000;

  const selected: CallLike[] = [];
  const rejected: CallSelection["rejected"] = [];

  for (const call of calls ?? []) {
    const id = call?.id ?? "(no id)";
    const hasCustomer = (call?.parties ?? []).some((p) =>
      emailBelongsToDomain(p?.emailAddress ?? "", customerDomain),
    );
    if (!hasCustomer) {
      rejected.push({ id, reason: "no-customer-participant" });
      continue;
    }
    if (!call?.started) {
      rejected.push({ id, reason: "no-date" });
      continue;
    }
    const t = Date.parse(call.started);
    if (Number.isNaN(t) || t < cutoff) {
      rejected.push({ id, reason: Number.isNaN(t) ? "no-date" : "too-old" });
      continue;
    }
    selected.push(call);
  }

  selected.sort((a, b) => Date.parse(b.started ?? "") - Date.parse(a.started ?? ""));
  return { selected, rejected };
}

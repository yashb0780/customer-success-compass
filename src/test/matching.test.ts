import { describe, it, expect } from "vitest";
import {
  normalizeDomain, isFreeEmailDomain, emailBelongsToDomain, selectCallsForDomain,
} from "@/lib/matching";

describe("domain normalisation", () => {
  it("reduces messy input to one spelling", () => {
    for (const raw of ["https://www.Acme.com/about?x=1", "WWW.ACME.COM", "acme.com:443", "acme.com."]) {
      expect(normalizeDomain(raw)).toBe("acme.com");
    }
  });
});

describe("email to customer matching", () => {
  it("matches the domain and its subdomains", () => {
    expect(emailBelongsToDomain("sam@acme.com", "acme.com")).toBe(true);
    expect(emailBelongsToDomain("sam@eu.acme.com", "acme.com")).toBe(true);
  });

  it("rejects lookalikes that a name match would accept", () => {
    expect(emailBelongsToDomain("sam@notacme.com", "acme.com")).toBe(false);
    expect(emailBelongsToDomain("sam@acme.com.evil.net", "acme.com")).toBe(false);
    expect(emailBelongsToDomain("sam@acmecorp.com", "acme.com")).toBe(false);
  });

  it("never matches on a free email domain", () => {
    expect(isFreeEmailDomain("gmail.com")).toBe(true);
    expect(emailBelongsToDomain("sam@gmail.com", "gmail.com")).toBe(false);
  });
});

describe("call selection", () => {
  const now = new Date("2026-09-05T00:00:00Z");
  const call = (id: string, started: string, emails: string[]) => ({
    id, started, title: id, parties: emails.map((e) => ({ emailAddress: e })),
  });

  it("keeps only calls a customer participant attended", () => {
    const { selected, rejected } = selectCallsForDomain(
      [
        call("with-customer", "2026-08-01T10:00:00Z", ["csm@vendor.io", "ops@acme.com"]),
        call("internal-only", "2026-08-02T10:00:00Z", ["csm@vendor.io", "ae@vendor.io"]),
        call("other-customer", "2026-08-03T10:00:00Z", ["csm@vendor.io", "cto@globex.com"]),
      ],
      "acme.com",
      { now },
    );
    expect(selected.map((c) => c.id)).toEqual(["with-customer"]);
    expect(rejected.map((r) => r.id).sort()).toEqual(["internal-only", "other-customer"]);
  });

  it("drops calls older than the recency window", () => {
    const { selected, rejected } = selectCallsForDomain(
      [
        call("recent", "2026-08-01T10:00:00Z", ["ops@acme.com"]),
        call("ancient", "2024-01-01T10:00:00Z", ["ops@acme.com"]),
      ],
      "acme.com",
      { now, maxAgeDays: 180 },
    );
    expect(selected.map((c) => c.id)).toEqual(["recent"]);
    expect(rejected).toEqual([{ id: "ancient", reason: "too-old" }]);
  });

  it("returns nothing rather than guessing when the domain is unusable", () => {
    const calls = [call("c1", "2026-08-01T10:00:00Z", ["ops@acme.com"])];
    expect(selectCallsForDomain(calls, "", { now }).selected).toEqual([]);
    expect(selectCallsForDomain(calls, "gmail.com", { now }).selected).toEqual([]);
  });

  it("returns newest first", () => {
    const { selected } = selectCallsForDomain(
      [
        call("older", "2026-07-01T10:00:00Z", ["ops@acme.com"]),
        call("newer", "2026-08-20T10:00:00Z", ["ops@acme.com"]),
      ],
      "acme.com",
      { now },
    );
    expect(selected.map((c) => c.id)).toEqual(["newer", "older"]);
  });
});

import { describe, it, expect } from "vitest";
import { decideAccountView } from "@/lib/accountView";
import { isAcceptableAccountId, DEMO_ACCOUNT_ID } from "@/lib/accountId";

const MINTED = "gtuydglmatr0gnz5rop9tdigo";

describe("account id rules (shared by client and server)", () => {
  it("accepts the demo id and minted ids, rejects guessable ones", () => {
    expect(isAcceptableAccountId(DEMO_ACCOUNT_ID)).toBe(true);
    expect(isAcceptableAccountId(MINTED)).toBe(true);
    for (const bad of ["acme", "globex", "customer1", "ACME", "acme corp", ""]) {
      expect(isAcceptableAccountId(bad)).toBe(false);
    }
  });
});

describe("what the page shows", () => {
  it("a rejected id never renders account content, even offline", () => {
    // The regression: /qbr/acme rendered the bundled Acme copy as "Offline copy".
    for (const stalled of [true, false]) {
      for (const status of [undefined, 0, 400, 500]) {
        expect(decideAccountView({ customerId: "acme", hasData: false, stalled, status }))
          .toEqual({ kind: "unavailable", reason: "invalid-id" });
      }
    }
  });

  it("a 4xx is a decision about this id, not an outage — no fallback", () => {
    expect(decideAccountView({ customerId: DEMO_ACCOUNT_ID, hasData: false, stalled: true, status: 400 }))
      .toEqual({ kind: "unavailable", reason: "invalid-id" });
    expect(decideAccountView({ customerId: MINTED, hasData: false, stalled: true, status: 404 }))
      .toEqual({ kind: "unavailable", reason: "not-found" });
  });

  it("only the demo account may use the bundled copy during a real outage", () => {
    for (const status of [undefined, 0, 500, 502, 503]) {
      expect(decideAccountView({ customerId: DEMO_ACCOUNT_ID, hasData: false, stalled: true, status }))
        .toEqual({ kind: "fallback" });
      // A minted id is valid, but the bundled copy is the DEMO account's
      // content — serving it here would show Acme's data under someone else's URL.
      expect(decideAccountView({ customerId: MINTED, hasData: false, stalled: true, status }))
        .toEqual({ kind: "unavailable", reason: "unreachable" });
    }
  });

  it("still loads and still renders live data normally", () => {
    expect(decideAccountView({ customerId: MINTED, hasData: false, stalled: false }))
      .toEqual({ kind: "loading" });
    expect(decideAccountView({ customerId: MINTED, hasData: true, stalled: false }))
      .toEqual({ kind: "live" });
    // Data already in hand survives a later failed refetch.
    expect(decideAccountView({ customerId: MINTED, hasData: true, stalled: true, status: 500 }))
      .toEqual({ kind: "live" });
  });
});

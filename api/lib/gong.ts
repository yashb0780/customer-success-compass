/**
 * Gong lookup: recent calls, filtered to this customer, plus transcripts.
 *
 * UNVERIFIED AGAINST A LIVE TENANT. Written from Gong's published v2 API
 * shapes; no token has been available to test it.
 *
 * There is deliberately NO company-name matching and no reliance on a
 * HubSpot-Gong linkage. Calls are selected purely by participant email domain
 * (see src/lib/matching.ts) because a name match can attach another customer's
 * transcript to this QBR, and the linkage only exists if the customer's Gong
 * integration happens to be configured.
 */
import { getToken } from "./env.js";
import { selectCallsForDomain, type CallLike } from "../../src/lib/matching.js";

const BASE = "https://api.gong.io";
const TIMEOUT_MS = 15_000;

export interface GongCall extends CallLike {
  id?: string;
  title?: string;
  started?: string;
}

export interface GongTranscript {
  callId: string;
  title?: string;
  started?: string;
  text: string;
}

async function gong<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken("gong");
  if (!token) throw new Error("GONG_TOKEN is not set");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`Gong ${path} responded ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Recent calls that a participant from `domain` attended.
 *
 * `rejected` is returned alongside so the CSM can see what was skipped and
 * why — silence about excluded calls would be its own trap.
 */
export async function findCallsForDomain(
  domain: string,
  opts: { maxAgeDays?: number; limit?: number } = {},
) {
  const maxAgeDays = opts.maxAgeDays ?? 180;
  const fromDateTime = new Date(Date.now() - maxAgeDays * 86_400_000).toISOString();

  const json = await gong<{ calls?: GongCall[] }>("/v2/calls/extensive", {
    method: "POST",
    body: JSON.stringify({
      filter: { fromDateTime },
      contentSelector: { exposedFields: { parties: true } },
    }),
  });

  const { selected, rejected } = selectCallsForDomain(json.calls ?? [], domain, { maxAgeDays });
  return { calls: selected.slice(0, opts.limit ?? 10), rejected };
}

export async function getTranscripts(calls: GongCall[]): Promise<GongTranscript[]> {
  const ids = calls.map((c) => c.id).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return [];

  const json = await gong<{
    callTranscripts?: { callId?: string; transcript?: { sentences?: { text?: string }[] }[] }[];
  }>("/v2/calls/transcript", {
    method: "POST",
    body: JSON.stringify({ filter: { callIds: ids } }),
  });

  const byId = new Map(calls.map((c) => [c.id, c]));
  return (json.callTranscripts ?? []).map((t) => {
    const call = byId.get(t.callId ?? "");
    const text = (t.transcript ?? [])
      .flatMap((m) => (m.sentences ?? []).map((s) => s.text ?? ""))
      .filter(Boolean)
      .join(" ");
    return { callId: t.callId ?? "", title: call?.title, started: call?.started, text };
  });
}

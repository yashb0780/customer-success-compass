/**
 * HubSpot lookup: customer domain -> company -> notes.
 *
 * UNVERIFIED AGAINST A LIVE TENANT. Written from HubSpot's published v3 CRM
 * API shapes; no token has been available to test it. Treat the field mapping
 * as a first draft until it has run against a real portal.
 */
import { getToken } from "./env.js";

const BASE = "https://api.hubapi.com";
const TIMEOUT_MS = 10_000;

export interface HubSpotCompany {
  id: string;
  name?: string;
  domain?: string;
}

export interface HubSpotNote {
  id: string;
  body: string;
  /** ISO date the note was written — becomes ContentProvenance.sourceDate. */
  createdAt?: string;
}

async function hs<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken("hubspot");
  if (!token) throw new Error("HUBSPOT_TOKEN is not set");

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
    if (!res.ok) {
      throw new Error(`HubSpot ${path} responded ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Find companies by exact domain. Returns ALL matches rather than picking one:
 * duplicates, subsidiaries and test records are common, and silently choosing
 * the first would attach the wrong company's notes to a QBR.
 */
export async function findCompaniesByDomain(domain: string): Promise<HubSpotCompany[]> {
  const body = {
    filterGroups: [{ filters: [{ propertyName: "domain", operator: "EQ", value: domain }] }],
    properties: ["name", "domain"],
    limit: 10,
  };
  const json = await hs<{ results?: { id: string; properties?: Record<string, string> }[] }>(
    "/crm/v3/objects/companies/search",
    { method: "POST", body: JSON.stringify(body) },
  );
  return (json.results ?? []).map((r) => ({
    id: r.id,
    name: r.properties?.name,
    domain: r.properties?.domain,
  }));
}

/** Notes associated with a company, newest first. */
export async function getCompanyNotes(companyId: string, limit = 20): Promise<HubSpotNote[]> {
  const assoc = await hs<{ results?: { toObjectId?: string | number; id?: string }[] }>(
    `/crm/v4/objects/companies/${encodeURIComponent(companyId)}/associations/notes?limit=${limit}`,
  );
  const ids = (assoc.results ?? [])
    .map((r) => String(r.toObjectId ?? r.id ?? ""))
    .filter(Boolean);
  if (ids.length === 0) return [];

  const batch = await hs<{ results?: { id: string; properties?: Record<string, string> }[] }>(
    "/crm/v3/objects/notes/batch/read",
    {
      method: "POST",
      body: JSON.stringify({
        properties: ["hs_note_body", "hs_createdate"],
        inputs: ids.map((id) => ({ id })),
      }),
    },
  );

  return (batch.results ?? [])
    .map((n) => ({
      id: n.id,
      // HubSpot note bodies are HTML.
      body: stripHtml(n.properties?.hs_note_body ?? ""),
      createdAt: n.properties?.hs_createdate,
    }))
    .filter((n) => n.body.length > 0)
    .sort((a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""));
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

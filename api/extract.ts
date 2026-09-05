/**
 * POST /api/extract  { domain: string, customerName?: string }
 *
 * Looks a customer up across HubSpot and Gong from their domain, and drafts the
 * Deep Dive section from what it finds.
 *
 * It RETURNS a draft. It does not save anything. Extracted content only reaches
 * the QBR when the CSM approves it in the admin panel — a wrong match here
 * would put another customer's material in front of this one, so a human sees
 * what matched before it lands.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ENV_KEYS, missingIntegrations } from "./lib/env.js";
import { findCompaniesByDomain, getCompanyNotes } from "./lib/hubspot.js";
import { findCallsForDomain, getTranscripts } from "./lib/gong.js";
import { buildDeepDivePrompt, draftDeepDive } from "./lib/anthropic.js";
import { isFreeEmailDomain, normalizeDomain } from "../src/lib/matching.js";

const MAX_AGE_DAYS = 180;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: { code: "method_not_allowed", message: "Use POST." } });
  }

  const domain = normalizeDomain((req.body?.domain ?? "") as string);
  if (!domain || !domain.includes(".")) {
    return res.status(400).json({
      error: { code: "invalid_domain", message: "A customer domain is required, e.g. acme.com." },
    });
  }
  if (isFreeEmailDomain(domain)) {
    return res.status(400).json({
      error: {
        code: "free_email_domain",
        message: `"${domain}" is a consumer email domain and would match unrelated records.`,
      },
    });
  }

  // Fail loudly and specifically. An empty draft caused by a missing token
  // looks exactly like a customer with nothing to report.
  const missing = missingIntegrations(["hubspot", "gong", "anthropic"]);
  if (missing.length > 0) {
    return res.status(503).json({
      error: {
        code: "not_configured",
        message: `Not configured: ${missing.join(", ")}. Set these in Vercel (see ${ENV_KEYS.hubspot} in CLAUDE.md) and redeploy.`,
      },
    });
  }

  const warnings: string[] = [];

  try {
    const companies = await findCompaniesByDomain(domain);
    if (companies.length === 0) {
      return res.status(404).json({
        error: { code: "company_not_found", message: `No HubSpot company has the domain "${domain}".` },
      });
    }
    if (companies.length > 1) {
      warnings.push(
        `${companies.length} HubSpot companies share this domain. Used "${companies[0].name ?? companies[0].id}"; check this is the right record.`,
      );
    }

    const company = companies[0];
    const notes = await getCompanyNotes(company.id);
    if (notes.length === 0) warnings.push("No CRM notes found for this company.");

    const { calls, rejected } = await findCallsForDomain(domain, { maxAgeDays: MAX_AGE_DAYS });
    if (calls.length === 0) {
      warnings.push(`No Gong calls in the last ${MAX_AGE_DAYS} days had a participant from ${domain}.`);
    }
    const skippedOld = rejected.filter((r) => r.reason === "too-old").length;
    if (skippedOld > 0) warnings.push(`${skippedOld} older call(s) were outside the ${MAX_AGE_DAYS}-day window.`);

    const transcripts = await getTranscripts(calls);

    if (notes.length === 0 && transcripts.length === 0) {
      return res.status(422).json({
        error: {
          code: "no_source_material",
          message: "Found the company but no notes or recent calls to draft from.",
        },
        warnings,
      });
    }

    const draft = await draftDeepDive(
      buildDeepDivePrompt({
        customerName: (req.body?.customerName as string) || company.name || domain,
        notes,
        transcripts,
      }),
    );

    // The newest source we actually used becomes the provenance date, so the
    // section note reports how old the underlying material is.
    const dates = [...notes.map((n) => n.createdAt), ...transcripts.map((t) => t.started)]
      .filter((d): d is string => Boolean(d))
      .sort();
    const newest = dates[dates.length - 1];

    return res.status(200).json({
      draft,
      warnings,
      sources: {
        company: { id: company.id, name: company.name, domain: company.domain },
        noteCount: notes.length,
        callCount: transcripts.length,
        callTitles: transcripts.map((t) => t.title).filter(Boolean),
        newestSourceDate: newest ?? null,
      },
      provenance: {
        kind: transcripts.length > 0 && notes.length > 0
          ? "deal-notes"
          : transcripts.length > 0
            ? "internal-doc"
            : "deal-notes",
        label: [
          notes.length > 0 ? `${notes.length} CRM note(s)` : null,
          transcripts.length > 0 ? `${transcripts.length} Gong call(s)` : null,
        ].filter(Boolean).join(" and "),
        sourceDate: newest ?? undefined,
        extractedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/extract] failed", { domain, err });
    return res.status(502).json({
      error: {
        code: "upstream_error",
        message: err instanceof Error ? err.message : "Lookup failed.",
      },
      warnings,
    });
  }
}

import type { ContentProvenance } from "@/types/qbr";

/** What POST /api/extract returns on success. */
export interface ExtractResult {
  draft: { workingWell: string[]; toImprove: string[] };
  warnings: string[];
  sources: {
    company: { id: string; name?: string; domain?: string };
    noteCount: number;
    callCount: number;
    callTitles: string[];
    newestSourceDate: string | null;
  };
  provenance: ContentProvenance;
}

export class ExtractError extends Error {
  readonly code: string;
  readonly warnings: string[];
  constructor(message: string, code: string, warnings: string[] = []) {
    super(message);
    this.name = "ExtractError";
    this.code = code;
    this.warnings = warnings;
  }
}

/** Look a customer up across HubSpot and Gong and draft their Deep Dive.
 *  Returns a draft; saving is a separate, deliberate step by the CSM. */
export async function extractDeepDive(domain: string, customerName?: string): Promise<ExtractResult> {
  let res: Response;
  try {
    res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ domain, customerName }),
    });
  } catch {
    throw new ExtractError("Could not reach the server.", "network_error");
  }

  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {
    throw new ExtractError(`Lookup failed (${res.status}).`, "bad_response");
  }

  if (!res.ok) {
    const err = body.error as { code?: string; message?: string } | undefined;
    throw new ExtractError(
      err?.message ?? `Lookup failed (${res.status}).`,
      err?.code ?? "http_error",
      (body.warnings as string[]) ?? [],
    );
  }
  return body as unknown as ExtractResult;
}

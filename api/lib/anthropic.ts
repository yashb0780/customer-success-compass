/**
 * Claude, used to draft the Deep Dive from internal context.
 *
 * The key lives in a Vercel environment variable and is read only here, inside
 * a serverless function. It is never bundled into the page.
 */
import { getToken } from "./env.js";

const MODEL = "claude-sonnet-5";
const TIMEOUT_MS = 60_000;

export interface DeepDiveDraft {
  workingWell: string[];
  toImprove: string[];
}

/** Bound how much source text we send: cost, context limits, and the fact that
 *  a hundred stale transcripts make a worse draft, not a better one. */
const MAX_SOURCE_CHARS = 60_000;

export function buildDeepDivePrompt(input: {
  customerName: string;
  notes: { body: string; createdAt?: string }[];
  transcripts: { title?: string; started?: string; text: string }[];
}): string {
  const parts: string[] = [];
  for (const n of input.notes) {
    parts.push(`--- CRM NOTE (${n.createdAt ?? "date unknown"}) ---\n${n.body}`);
  }
  for (const t of input.transcripts) {
    parts.push(`--- CALL TRANSCRIPT: ${t.title ?? "untitled"} (${t.started ?? "date unknown"}) ---\n${t.text}`);
  }
  const source = parts.join("\n\n").slice(0, MAX_SOURCE_CHARS);

  return [
    `You are helping a Customer Success Manager prepare a Quarterly Business Review for ${input.customerName}.`,
    "",
    "Below are internal CRM notes and call transcripts about this customer.",
    "Draft the 'Deep Dive' section: what is working well, and what could be improved.",
    "",
    "Rules:",
    "- Use ONLY what is supported by the source material. Do not infer or embellish.",
    "- Each point must be a single specific sentence, ideally with a number or a concrete detail.",
    "- Write points that are safe to show the customer: factual, not internal commentary.",
    "- Omit anything about pricing negotiations, internal politics, or individuals' performance.",
    "- If the sources do not support a category, return fewer points rather than inventing any.",
    "",
    'Respond with ONLY a JSON object: {"workingWell": string[], "toImprove": string[]}',
    "",
    "SOURCE MATERIAL:",
    source,
  ].join("\n");
}

export async function draftDeepDive(prompt: string): Promise<DeepDiveDraft> {
  const key = getToken("anthropic");
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API responded ${res.status}`);

    const json = (await res.json()) as { content?: { type?: string; text?: string }[] };
    const text = (json.content ?? []).map((c) => c.text ?? "").join("").trim();
    return parseDraft(text);
  } finally {
    clearTimeout(timer);
  }
}

/** Pull the JSON object out of the reply, tolerating a code fence or preamble. */
export function parseDraft(text: string): DeepDiveDraft {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const candidate = fenced ? fenced[1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new Error("Claude did not return usable JSON");
  }
  const obj = parsed as { workingWell?: unknown; toImprove?: unknown };
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
  return { workingWell: list(obj.workingWell), toImprove: list(obj.toImprove) };
}

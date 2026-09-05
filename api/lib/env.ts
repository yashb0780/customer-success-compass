/**
 * Server-side credentials. Read ONLY here, inside serverless functions —
 * nothing under src/ may ever touch these. See "Security rules" in CLAUDE.md.
 */
export const ENV_KEYS = {
  hubspot: "HUBSPOT_TOKEN",
  gong: "GONG_TOKEN",
  anthropic: "ANTHROPIC_API_KEY",
} as const;

export type Integration = keyof typeof ENV_KEYS;

export function getToken(which: Integration): string | undefined {
  const v = process.env[ENV_KEYS[which]];
  return v && v.trim() ? v.trim() : undefined;
}

/** Which integrations are not configured. Used to fail loudly and specifically
 *  rather than producing an empty draft that looks like a real answer. */
export function missingIntegrations(required: Integration[]): string[] {
  return required.filter((k) => !getToken(k)).map((k) => ENV_KEYS[k]);
}

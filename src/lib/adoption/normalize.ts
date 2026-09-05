import type { HealthScore } from "@/types/adoption";

/** Rescale a health score onto 0-100 while keeping the original for display. */
export function toHealthScore(
  raw: number,
  scaleMin: number,
  scaleMax: number,
  extra: Partial<Pick<HealthScore, "band" | "trend">> = {},
): HealthScore {
  const span = scaleMax - scaleMin;
  const normalized =
    span === 0 ? 0 : Math.round(Math.min(100, Math.max(0, ((raw - scaleMin) / span) * 100)));
  return { normalized, raw, scaleMin, scaleMax, ...extra };
}

/** Bucket a 0-100 score for the coloured pills the dashboard already uses. */
export function bandFor(normalized: number): HealthScore["band"] {
  if (normalized >= 70) return "healthy";
  if (normalized >= 40) return "watch";
  return "at-risk";
}

/** A stable key from a display name, so renames in the source tool do not
 *  orphan a feature. */
export function featureKey(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Record a field the source tool did not provide, rather than defaulting it. */
export function markUnavailable(list: string[], path: string, value: unknown): boolean {
  const missing = value === undefined || value === null;
  if (missing) list.push(path);
  return missing;
}

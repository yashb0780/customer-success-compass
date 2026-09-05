import type { AdoptionAdapter, AdoptionFeature, AdoptionMetrics } from "@/types/adoption";
import type { TrendDirection } from "@/types/qbr";
import { bandFor, featureKey, markUnavailable, toHealthScore } from "./normalize";

/** Shape we read from Gainsight. Everything optional: real payloads vary by
 *  tenant configuration, and a missing field must not throw. */
export interface GainsightPayload {
  companyId?: string;
  companyName?: string;
  asOf?: string;
  /** `measures` is the per-category breakdown. Declared because real payloads
   *  carry it; we currently map only the overall score. */
  scorecard?: {
    overallScore?: number;
    trend?: string;
    measures?: { name?: string; score?: number }[];
  };
  licenses?: { purchased?: number; provisioned?: number };
  usage?: {
    activeUsers30d?: number;
    activeUsers7d?: number;
    activeUsers1d?: number;
    lastLoginDate?: string;
    avgWeeklyLoginsPerUser?: number;
  };
  featureUsage?: { featureName?: string; isAdopted?: boolean; activeUsers?: number; lastUsed?: string }[];
  surveys?: { nps?: number; csat?: number };
}

const TRENDS: Record<string, TrendDirection> = { up: "up", down: "down", flat: "flat" };

export const gainsightAdapter: AdoptionAdapter<GainsightPayload> = {
  source: "gainsight",

  toAdoptionMetrics(raw: GainsightPayload): AdoptionMetrics {
    const unavailable: string[] = [];
    const usage = raw?.usage ?? {};

    markUnavailable(unavailable, "seats.licensed", raw?.licenses?.purchased);
    markUnavailable(unavailable, "seats.provisioned", raw?.licenses?.provisioned);
    markUnavailable(unavailable, "activity.mau", usage.activeUsers30d);
    markUnavailable(unavailable, "activity.wau", usage.activeUsers7d);
    markUnavailable(unavailable, "activity.dau", usage.activeUsers1d);

    const score = raw?.scorecard?.overallScore;
    const hasHealth = !markUnavailable(unavailable, "health", score);

    const features: AdoptionFeature[] = (raw?.featureUsage ?? [])
      .filter((f) => typeof f?.featureName === "string")
      .map((f) => ({
        key: featureKey(f.featureName as string),
        name: f.featureName as string,
        adopted: Boolean(f.isAdopted),
        activeUsers: f.activeUsers,
        lastUsedAt: f.lastUsed,
      }));
    if (features.length === 0) unavailable.push("features");

    return {
      source: "gainsight",
      // Gainsight scorecards are 0-100, so raw and normalized coincide — but we
      // still record the scale, because Planhat's do not.
      capturedAt: raw?.asOf ?? new Date().toISOString(),
      seats: {
        licensed: raw?.licenses?.purchased,
        provisioned: raw?.licenses?.provisioned,
        active: usage.activeUsers30d,
      },
      activity: {
        dau: usage.activeUsers1d,
        wau: usage.activeUsers7d,
        mau: usage.activeUsers30d,
        loginsPerUserPerWeek: usage.avgWeeklyLoginsPerUser,
        lastLoginAt: usage.lastLoginDate,
      },
      features,
      health: hasHealth
        ? toHealthScore(score as number, 0, 100, {
            band: bandFor(score as number),
            trend: TRENDS[raw?.scorecard?.trend ?? ""],
          })
        : undefined,
      sentiment: { nps: raw?.surveys?.nps, csat: raw?.surveys?.csat },
      unavailable,
    };
  },
};

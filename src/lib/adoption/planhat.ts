import type { AdoptionAdapter, AdoptionFeature, AdoptionMetrics } from "@/types/adoption";
import type { TrendDirection } from "@/types/qbr";
import { bandFor, featureKey, markUnavailable, toHealthScore } from "./normalize";

/** Shape we read from Planhat. Note health is 0-10 here, not 0-100. */
export interface PlanhatPayload {
  /** Planhat's own record id. Not mapped; declared because payloads carry it. */
  _id?: string;
  name?: string;
  snapshotDate?: string;
  health?: number;
  healthTrend?: string;
  licenses?: number;
  usage?: { mau?: number; wau?: number; dau?: number; lastActivity?: string };
  modules?: { module?: string; active?: boolean; users?: number }[];
  tickets?: { opened?: number; closed?: number; avgResolutionHours?: number };
}

const TRENDS: Record<string, TrendDirection> = { up: "up", down: "down", flat: "flat" };

export const planhatAdapter: AdoptionAdapter<PlanhatPayload> = {
  source: "planhat",

  toAdoptionMetrics(raw: PlanhatPayload): AdoptionMetrics {
    const unavailable: string[] = [];
    const usage = raw?.usage ?? {};

    markUnavailable(unavailable, "seats.licensed", raw?.licenses);
    // Planhat does not report provisioned seats separately from licensed.
    markUnavailable(unavailable, "seats.provisioned", undefined);
    markUnavailable(unavailable, "activity.mau", usage.mau);
    markUnavailable(unavailable, "activity.wau", usage.wau);
    markUnavailable(unavailable, "activity.dau", usage.dau);
    markUnavailable(unavailable, "activity.loginsPerUserPerWeek", undefined);

    const health = raw?.health;
    const hasHealth = !markUnavailable(unavailable, "health", health);

    const features: AdoptionFeature[] = (raw?.modules ?? [])
      .filter((m) => typeof m?.module === "string")
      .map((m) => ({
        key: featureKey(m.module as string),
        name: m.module as string,
        adopted: Boolean(m.active),
        activeUsers: m.users,
      }));
    if (features.length === 0) unavailable.push("features");
    // Planhat's module list carries no per-module last-used date.
    unavailable.push("features[].lastUsedAt");

    const normalized = hasHealth ? Math.round(((health as number) / 10) * 100) : 0;

    return {
      source: "planhat",
      capturedAt: raw?.snapshotDate ?? new Date().toISOString(),
      seats: { licensed: raw?.licenses, active: usage.mau },
      activity: { mau: usage.mau, wau: usage.wau, dau: usage.dau, lastLoginAt: usage.lastActivity },
      features,
      // 0-10 rescaled to 0-100, with the original kept so a CSM can reconcile
      // against what Planhat shows them.
      health: hasHealth
        ? toHealthScore(health as number, 0, 10, {
            band: bandFor(normalized),
            trend: TRENDS[raw?.healthTrend ?? ""],
          })
        : undefined,
      support: {
        ticketsOpened: raw?.tickets?.opened,
        ticketsResolved: raw?.tickets?.closed,
        avgResolutionHours: raw?.tickets?.avgResolutionHours,
      },
      unavailable,
    };
  },
};

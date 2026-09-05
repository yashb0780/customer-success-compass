import type { TrendDirection, UsageLevel } from "./qbr.js";

/**
 * Tool-agnostic adoption metrics.
 *
 * The dashboard never speaks Gainsight or Planhat. Each tool gets an adapter
 * that maps its payload into this shape, so swapping tools — or running two —
 * changes one adapter rather than the dashboard.
 *
 * Design rule: almost everything is optional, and anything an adapter cannot
 * supply is named in `unavailable`. In a QBR "0 logins" and "we don't know how
 * many logins" are very different statements, and a shape that cannot tell
 * them apart will eventually put a confident zero in front of a customer.
 */

export type AdoptionSource = "gainsight" | "planhat" | "synthetic";

export interface HealthScore {
  /** Normalised to 0-100 so the UI renders one scale regardless of tool. */
  normalized: number;
  /**
   * The original value and its scale. Kept because "7" is meaningless without
   * knowing whether the tool scores out of 10 or out of 100 — and a CSM
   * checking against the source tool needs to see the number they saw there.
   */
  raw: number;
  scaleMin: number;
  scaleMax: number;
  band?: "healthy" | "watch" | "at-risk";
  trend?: TrendDirection;
}

export interface AdoptionFeature {
  /** Stable identifier, so a rename in the source tool does not orphan it. */
  key: string;
  name: string;
  adopted: boolean;
  usage?: UsageLevel;
  activeUsers?: number;
  /** ISO date. Drives "not touched since March" style observations. */
  lastUsedAt?: string;
}

export interface AdoptionMetrics {
  source: AdoptionSource;
  /** ISO timestamp of when the source tool produced these numbers. */
  capturedAt: string;
  /** The window the numbers describe, when the tool reports one. */
  periodStart?: string;
  periodEnd?: string;

  seats: {
    licensed?: number;
    provisioned?: number;
    active?: number;
  };

  activity: {
    dau?: number;
    wau?: number;
    mau?: number;
    loginsPerUserPerWeek?: number;
    lastLoginAt?: string;
  };

  features: AdoptionFeature[];

  health?: HealthScore;

  sentiment?: {
    nps?: number;
    csat?: number;
  };

  support?: {
    ticketsOpened?: number;
    ticketsResolved?: number;
    avgResolutionHours?: number;
  };

  /**
   * Dot-paths this adapter could not populate, e.g. "activity.dau". Lets the UI
   * say "not reported by Planhat" instead of rendering a misleading zero.
   */
  unavailable: string[];
}

/** Every tool integration implements this and nothing more. */
export interface AdoptionAdapter<TRaw = unknown> {
  readonly source: AdoptionSource;
  /** Map one tool's payload into the shared shape. Must not throw on missing
   *  fields — record them in `unavailable` instead. */
  toAdoptionMetrics(raw: TRaw): AdoptionMetrics;
}

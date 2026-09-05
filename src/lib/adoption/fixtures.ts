/**
 * Synthetic sample payloads.
 *
 * These are MODELLED on each vendor's published field names, not captured from
 * a real tenant — we have no live access to either tool. They are good enough
 * to build and test the mapping against; they are NOT proof the mapping matches
 * production data. Re-check each adapter against a real payload before trusting
 * it in front of a customer.
 */
import type { GainsightPayload } from "./gainsight";
import type { PlanhatPayload } from "./planhat";

// Typed against the adapter interfaces, so a fixture that drifts out of shape
// fails typecheck rather than silently testing something that cannot occur.
export const gainsightSample: GainsightPayload = {
  companyId: "1P02ABCDEF",
  companyName: "Acme Corp",
  asOf: "2026-09-01T00:00:00Z",
  scorecard: {
    overallScore: 74, // Gainsight scorecards are 0-100
    trend: "up",
    measures: [
      { name: "Adoption", score: 68 },
      { name: "Support", score: 81 },
    ],
  },
  licenses: { purchased: 150, provisioned: 141 },
  usage: {
    activeUsers30d: 128,
    activeUsers7d: 94,
    activeUsers1d: 71,
    lastLoginDate: "2026-08-31",
    avgWeeklyLoginsPerUser: 3.4,
  },
  featureUsage: [
    { featureName: "Alert Management", isAdopted: true, activeUsers: 120, lastUsed: "2026-08-31" },
    { featureName: "Workflow Automator", isAdopted: true, activeUsers: 46, lastUsed: "2026-08-20" },
    { featureName: "Cloud Orchestration", isAdopted: false, activeUsers: 3, lastUsed: "2026-05-02" },
  ],
  surveys: { nps: 41, csat: 4.6 },
};

export const planhatSample: PlanhatPayload = {
  _id: "5f8d0d55b54764421b7156c3",
  name: "Acme Corp",
  snapshotDate: "2026-09-01",
  health: 7.4, // Planhat health is 0-10
  healthTrend: "flat",
  licenses: 150,
  // Planhat reports no daily-active figure in this payload.
  usage: {
    mau: 128,
    wau: 94,
    lastActivity: "2026-08-31T14:02:00Z",
  },
  modules: [
    { module: "Alert Management", active: true, users: 120 },
    { module: "Workflow Automator", active: true, users: 46 },
    { module: "Cloud Orchestration", active: false, users: 3 },
  ],
  tickets: { opened: 62, closed: 58, avgResolutionHours: 9.5 },
};

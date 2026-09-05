import { describe, it, expect } from "vitest";
import { gainsightAdapter } from "@/lib/adoption/gainsight";
import { planhatAdapter } from "@/lib/adoption/planhat";
import { gainsightSample, planhatSample } from "@/lib/adoption/fixtures";

describe("adoption adapters", () => {
  it("both tools produce the same shape from different payloads", () => {
    const g = gainsightAdapter.toAdoptionMetrics(gainsightSample);
    const p = planhatAdapter.toAdoptionMetrics(planhatSample);
    expect(Object.keys(g).sort()).toEqual(
      expect.arrayContaining(["source", "capturedAt", "seats", "activity", "features", "unavailable"]),
    );
    expect(g.seats.licensed).toBe(150);
    expect(p.seats.licensed).toBe(150);
    expect(g.activity.mau).toBe(128);
    expect(p.activity.mau).toBe(128);
  });

  it("normalises different health scales to the same 0-100 value", () => {
    const g = gainsightAdapter.toAdoptionMetrics(gainsightSample); // 74 of 100
    const p = planhatAdapter.toAdoptionMetrics(planhatSample); // 7.4 of 10
    expect(g.health?.normalized).toBe(74);
    expect(p.health?.normalized).toBe(74);
    // ...while keeping the original, so "7.4" is still reconcilable with Planhat.
    expect(g.health?.raw).toBe(74);
    expect(g.health?.scaleMax).toBe(100);
    expect(p.health?.raw).toBe(7.4);
    expect(p.health?.scaleMax).toBe(10);
    expect(g.health?.band).toBe("healthy");
    expect(p.health?.band).toBe("healthy");
  });

  it("reports what a tool cannot supply instead of defaulting it to zero", () => {
    const p = planhatAdapter.toAdoptionMetrics(planhatSample);
    // The Planhat payload has no daily-active figure.
    expect(p.activity.dau).toBeUndefined();
    expect(p.unavailable).toContain("activity.dau");
    // Gainsight does report one, so it must not be listed.
    const g = gainsightAdapter.toAdoptionMetrics(gainsightSample);
    expect(g.activity.dau).toBe(71);
    expect(g.unavailable).not.toContain("activity.dau");
  });

  it("maps features to stable keys that survive a rename", () => {
    const g = gainsightAdapter.toAdoptionMetrics(gainsightSample);
    expect(g.features.map((f) => f.key)).toEqual([
      "alert-management",
      "workflow-automator",
      "cloud-orchestration",
    ]);
    expect(g.features[2].adopted).toBe(false);
    const p = planhatAdapter.toAdoptionMetrics(planhatSample);
    expect(p.features.map((f) => f.key)).toEqual(g.features.map((f) => f.key));
  });

  it("survives an empty payload rather than throwing", () => {
    for (const adapter of [gainsightAdapter, planhatAdapter]) {
      const out = adapter.toAdoptionMetrics({} as never);
      expect(out.features).toEqual([]);
      expect(out.health).toBeUndefined();
      expect(out.unavailable).toContain("features");
      expect(typeof out.capturedAt).toBe("string");
    }
  });

  it("clamps a score outside its declared scale", () => {
    const out = planhatAdapter.toAdoptionMetrics({ health: 99 } as never);
    expect(out.health?.normalized).toBe(100);
  });
});

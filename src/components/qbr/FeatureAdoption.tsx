import { useQbr } from "@/contexts/QbrContext";
import SectionSourceNote from "@/components/qbr/SectionSourceNote";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const usageLabels: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

export default function FeatureAdoption() {
  const { data } = useQbr();
  const pct = Math.round((data.featuresInUse / data.totalFeaturesOnPlan) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">Feature Adoption</h3>
        <SectionSourceNote section="features" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground">Features in Use</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{data.featuresInUse}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground">Adoption Rate</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{pct}%</p>
          <Progress value={pct} className="mt-3 h-1 rounded-pill" />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-3.5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground">Feature Usage Breakdown</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y">
          {data.features.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-muted/30">
              <p className="text-sm font-medium text-foreground leading-tight">{f.name}</p>
              {/* Bright dot as the mark, deep colour for the word. The word is
                  dark enough to read as type rather than a highlight (>5:1 on
                  white), and still carries meaning without colour. */}
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium",
                f.usage === "high" && "text-qbr-success-text",
                f.usage === "medium" && "text-qbr-warning-text",
                f.usage === "low" && "text-qbr-danger-text",
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full",
                  f.usage === "high" && "bg-qbr-success",
                  f.usage === "medium" && "bg-qbr-warning",
                  f.usage === "low" && "bg-qbr-danger",
                )} />
                {usageLabels[f.usage]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

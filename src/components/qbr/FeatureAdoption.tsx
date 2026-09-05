import { useQbr } from "@/contexts/QbrContext";
import SectionSourceNote from "@/components/qbr/SectionSourceNote";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Layers, TrendingUp } from "lucide-react";

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
        <div className="flex items-center gap-4 rounded-lg border bg-card p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Features in Use</p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">{data.featuresInUse}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-lg border bg-card p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Adoption Rate</p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">{pct}%</p>
            <Progress value={pct} className="mt-1.5 h-1.5" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-5 py-3">
          <p className="text-sm font-medium text-foreground">Feature Usage Breakdown</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y">
          {data.features.map((f) => (
            <div key={f.name} className="flex flex-col gap-1 px-4 py-3 hover:bg-muted/30 transition-colors">
              <p className="text-sm font-medium text-foreground leading-tight">{f.name}</p>
              <span className={cn("inline-flex items-center gap-1 text-xs font-medium",
                f.usage === "high" && "text-qbr-success",
                f.usage === "medium" && "text-qbr-warning",
                f.usage === "low" && "text-qbr-danger",
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

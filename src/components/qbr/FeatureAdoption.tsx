import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const usageColors: Record<string, string> = {
  high: "bg-qbr-success",
  medium: "bg-qbr-warning",
  low: "bg-qbr-danger",
};

const usageLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function FeatureAdoption() {
  const { data } = useQbr();
  const pct = Math.round((data.featuresInUse / data.totalFeaturesOnPlan) * 100);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">Feature Adoption</h3>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Features</p>
            <p className="text-3xl font-bold text-foreground">{data.totalFeaturesOnPlan}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">In Use</p>
            <p className="text-3xl font-bold text-primary">{data.featuresInUse}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-2">
            <p className="text-sm text-muted-foreground text-center">Adoption Rate</p>
            <p className="text-3xl font-bold text-center text-foreground">{pct}%</p>
            <Progress value={pct} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Feature Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.features.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-lg border p-3">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", usageColors[f.usage])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  {f.description && <p className="text-xs text-muted-foreground truncate">{f.description}</p>}
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                  f.usage === "high" && "bg-qbr-success/10 text-qbr-success",
                  f.usage === "medium" && "bg-qbr-warning/10 text-qbr-warning",
                  f.usage === "low" && "bg-qbr-danger/10 text-qbr-danger",
                )}>
                  {usageLabels[f.usage]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

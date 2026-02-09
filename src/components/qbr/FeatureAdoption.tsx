import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Layers, TrendingUp } from "lucide-react";

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
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-foreground">Feature Adoption</h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Layers className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Features in Use</p>
              <p className="text-4xl font-extrabold text-foreground">{data.featuresInUse}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-qbr-success/10 bg-gradient-to-br from-qbr-success/5 to-transparent">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-qbr-success/10 text-qbr-success">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Adoption Rate</p>
              <p className="text-4xl font-extrabold text-foreground">{pct}%</p>
              <Progress value={pct} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg font-bold">Feature Usage Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.features.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/50 transition-colors">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", usageColors[f.usage])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  {f.description && <p className="text-xs text-muted-foreground truncate">{f.description}</p>}
                </div>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full",
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

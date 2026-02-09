import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Lightbulb, CheckSquare } from "lucide-react";

export default function NextSteps() {
  const { data } = useQbr();
  const icons = [Target, Lightbulb, CheckSquare];

  return (
    <section id="next-steps" className="qbr-section px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Next Steps & Action Items</h2>
          <p className="mt-1 text-muted-foreground">Aligned priorities for the upcoming quarter</p>
        </div>

        <div className="space-y-6">
          {data.nextSteps.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {i === 0 ? "Desired Outcome" : i === 1 ? "Key Initiative" : "Action Plan"}
                    </span>
                  </div>
                  <div className="grid gap-0 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
                    <div className="p-5">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outcome</p>
                      <p className="text-sm text-foreground">{step.outcome}</p>
                    </div>
                    <div className="p-5">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Initiative</p>
                      <p className="text-sm text-foreground">{step.initiative}</p>
                    </div>
                    <div className="p-5">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action Points</p>
                      <ul className="space-y-1.5">
                        {step.actions.map((a, j) => (
                          <li key={j} className="flex gap-2 text-sm text-foreground">
                            <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-qbr-success" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

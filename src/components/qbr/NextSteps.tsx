import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Lightbulb, CheckSquare, ListChecks } from "lucide-react";

export default function NextSteps() {
  const { data } = useQbr();
  const icons = [Target, Lightbulb, CheckSquare];

  return (
    <section id="next-steps" className="qbr-section section-alt px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-foreground">Next Steps & Action Items</h2>
            <p className="mt-1 text-lg text-muted-foreground">Aligned priorities for the upcoming quarter</p>
          </div>
        </div>

        <div className="space-y-6">
          {data.nextSteps.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Card key={i} className="overflow-hidden shadow-lg border-2 border-transparent hover:border-primary/20 transition-all">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/5 to-transparent px-6 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">{i + 1}</span>
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {i === 0 ? "Desired Outcome" : i === 1 ? "Key Initiative" : "Action Plan"}
                    </span>
                  </div>
                  <div className="grid gap-0 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
                    <div className="p-6">
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Outcome</p>
                      <p className="text-sm text-foreground font-medium">{step.outcome}</p>
                    </div>
                    <div className="p-6">
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Initiative</p>
                      <p className="text-sm text-foreground font-medium">{step.initiative}</p>
                    </div>
                    <div className="p-6">
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Action Points</p>
                      <ul className="space-y-2">
                        {step.actions.map((a, j) => (
                          <li key={j} className="flex gap-2 text-sm text-foreground">
                            <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-qbr-success" />
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

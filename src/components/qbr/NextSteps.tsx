import { useQbr } from "@/contexts/QbrContext";
import { CheckSquare, ListChecks } from "lucide-react";

export default function NextSteps() {
  const { data } = useQbr();

  return (
    <section id="next-steps" className="qbr-section section-alt px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">Action Items</p>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Next Steps</h2>
        </div>

        <div className="space-y-3">
          {data.nextSteps.map((step, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center gap-3 border-b px-6 py-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary text-xs font-medium text-primary-foreground">{i + 1}</span>
                <span className="text-sm font-medium text-foreground">{step.outcome}</span>
              </div>
              <div className="grid gap-0 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
                <div className="px-6 py-5">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground mb-1">Outcome</p>
                  <p className="text-sm text-foreground">{step.outcome}</p>
                </div>
                <div className="px-6 py-5">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground mb-1">Initiative</p>
                  <p className="text-sm text-foreground">{step.initiative}</p>
                </div>
                <div className="px-6 py-5">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground mb-1">Actions</p>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

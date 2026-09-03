import { useQbr } from "@/contexts/QbrContext";
import { ArrowRight, TrendingUp, Clock, ThumbsUp, Zap, Rocket } from "lucide-react";
import { IconName } from "@/types/qbr";

const iconsByName: Partial<Record<IconName, React.ReactNode>> = {
  trending: <TrendingUp className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  thumbsup: <ThumbsUp className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
};

// Fallback for benefits that carry no icon of their own, preserving the
// original behaviour of picking an icon by position in the list.
const iconMap: Record<number, React.ReactNode> = {
  0: iconsByName.trending,
  1: iconsByName.clock,
  2: iconsByName.thumbsup,
  3: iconsByName.zap,
};

export default function FutureState() {
  const { data } = useQbr();
  const workflow = data.futureState ?? { workflowTitle: "", workflowSteps: [] };

  return (
    <section id="future-state" className="qbr-section px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Vision</p>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Future State</h2>
        </div>

        {/* Workflow */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-5 py-3">
            <p className="text-sm font-medium text-foreground">{workflow.workflowTitle}</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-0">
              {workflow.workflowSteps.map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="rounded-md border bg-muted/50 px-4 py-2.5 text-center text-xs font-medium text-foreground min-w-[120px]">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.benefits.map((b, i) => (
            <div key={b.title} className="rounded-lg border bg-card p-5 space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {(b.icon && iconsByName[b.icon]) || iconMap[i] || iconMap[0]}
              </div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">{b.metric}</p>
              <div>
                <p className="text-sm font-medium text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

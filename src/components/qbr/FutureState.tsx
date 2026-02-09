import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Clock, ThumbsUp, Zap } from "lucide-react";

const iconMap: Record<number, React.ReactNode> = {
  0: <TrendingUp className="h-6 w-6" />,
  1: <Clock className="h-6 w-6" />,
  2: <ThumbsUp className="h-6 w-6" />,
  3: <Zap className="h-6 w-6" />,
};

export default function FutureState() {
  const { data } = useQbr();

  return (
    <section id="future-state" className="qbr-section px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Future State</h2>
          <p className="mt-1 text-muted-foreground">Where we're headed together</p>
        </div>

        {/* Workflow diagram */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Optimized Support Flow</h3>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-0">
              {["Customer Query", "AI Triage", "Auto-Resolve / Route", "Agent Assist", "Resolution + CSAT"].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="rounded-lg border bg-primary/5 px-4 py-3 text-center text-sm font-medium text-foreground min-w-[130px]">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-primary hidden md:block" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.benefits.map((b, i) => (
            <Card key={b.title} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {iconMap[i] || iconMap[0]}
                </div>
                <p className="text-3xl font-bold text-foreground">{b.metric}</p>
                <p className="font-semibold text-foreground text-sm">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

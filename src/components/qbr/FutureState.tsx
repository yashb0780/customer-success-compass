import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Clock, ThumbsUp, Zap, Rocket } from "lucide-react";

const iconMap: Record<number, React.ReactNode> = {
  0: <TrendingUp className="h-7 w-7" />,
  1: <Clock className="h-7 w-7" />,
  2: <ThumbsUp className="h-7 w-7" />,
  3: <Zap className="h-7 w-7" />,
};

export default function FutureState() {
  const { data } = useQbr();

  return (
    <section id="future-state" className="qbr-section px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-qbr-info/10 text-qbr-info">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-foreground">Future State</h2>
            <p className="mt-1 text-lg text-muted-foreground">Where we're headed together</p>
          </div>
        </div>

        {/* Workflow diagram */}
        <Card className="shadow-lg border-2 border-primary/10 overflow-hidden">
          <CardContent className="p-8">
            <h3 className="mb-8 text-lg font-bold text-foreground">Optimized Support Flow</h3>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-0">
              {["Customer Query", "AI Triage", "Auto-Resolve / Route", "Agent Assist", "Resolution + CSAT"].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 px-5 py-4 text-center text-sm font-semibold text-foreground min-w-[140px] shadow-sm">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="h-5 w-5 shrink-0 text-primary hidden md:block" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.benefits.map((b, i) => (
            <Card key={b.title} className="text-center hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary">
                  {iconMap[i] || iconMap[0]}
                </div>
                <p className="text-4xl font-extrabold text-foreground">{b.metric}</p>
                <p className="font-bold text-foreground">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

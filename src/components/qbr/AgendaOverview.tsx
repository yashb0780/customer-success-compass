import { Users, BarChart3, Rocket, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const sections = [
  { id: "team", title: "Your Team", description: "Meet the team dedicated to your success", icon: Users },
  { id: "current-state", title: "Current State", description: "Adoption, engagement & deep dive analysis", icon: BarChart3 },
  { id: "future-state", title: "Future State", description: "Roadmap, new features & product vision", icon: Rocket },
  { id: "next-steps", title: "Next Steps", description: "Action items & desired outcomes", icon: ListChecks },
];

export default function AgendaOverview() {
  return (
    <section id="agenda" className="qbr-section px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-foreground">Agenda</h2>
        <p className="mb-10 text-center text-muted-foreground">Click any section to jump ahead</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{s.title}</CardTitle>
                    <CardDescription className="mt-1">{s.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

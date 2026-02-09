import { Users, BarChart3, Rocket, ListChecks, Plug } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const sections = [
  { id: "team", title: "Your Team", description: "Meet the team dedicated to your success", icon: Users, color: "bg-primary/10 text-primary" },
  { id: "current-state", title: "Current State", description: "Adoption, engagement & deep dive analysis", icon: BarChart3, color: "bg-qbr-success/10 text-qbr-success" },
  { id: "integrations", title: "Tech Stack", description: "Connected tools & integration opportunities", icon: Plug, color: "bg-qbr-warning/10 text-qbr-warning" },
  { id: "future-state", title: "Future State", description: "Roadmap, new features & product vision", icon: Rocket, color: "bg-qbr-info/10 text-qbr-info" },
  { id: "next-steps", title: "Next Steps", description: "Action items & desired outcomes", icon: ListChecks, color: "bg-accent/10 text-accent" },
];

export default function AgendaOverview() {
  return (
    <section id="agenda" className="qbr-section section-alt px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Overview</p>
          <h2 className="text-4xl font-extrabold text-foreground">Today's Agenda</h2>
          <p className="mt-3 text-lg text-muted-foreground">Click any section to jump ahead</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="group" style={{ animationDelay: `${i * 80}ms` }}>
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 border-2 border-transparent">
                <CardHeader className="flex flex-row items-start gap-4 p-6">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.color} transition-all group-hover:scale-110`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{s.title}</CardTitle>
                    <CardDescription className="mt-1 text-sm">{s.description}</CardDescription>
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

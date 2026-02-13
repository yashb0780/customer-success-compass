import { Users, BarChart3, Rocket, ListChecks, Plug } from "lucide-react";

const sections = [
  { id: "team", title: "Your Team", description: "Meet the team dedicated to your success", icon: Users },
  { id: "current-state", title: "Current State", description: "Adoption, engagement & deep dive analysis", icon: BarChart3 },
  { id: "integrations", title: "Tech Stack", description: "Connected tools & integration opportunities", icon: Plug },
  { id: "future-state", title: "Future State", description: "Roadmap, new features & product vision", icon: Rocket },
  { id: "next-steps", title: "Next Steps", description: "Action items & desired outcomes", icon: ListChecks },
];

export default function AgendaOverview() {
  return (
    <section id="agenda" className="qbr-section section-alt px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Overview</p>
          <h2 className="text-2xl font-semibold text-foreground">Today's Agenda</h2>
        </div>
        <div className="grid gap-px bg-border rounded-lg overflow-hidden border sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="group flex items-start gap-3 bg-card p-5 transition-colors hover:bg-muted/50">
              <s.icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <div>
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

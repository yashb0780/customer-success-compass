import { Users, BarChart3, Rocket, ListChecks, Plug } from "lucide-react";
import { useQbr } from "@/contexts/QbrContext";
import { IconName } from "@/types/qbr";

const icons: Partial<Record<IconName, React.ElementType>> = {
  users: Users,
  chart: BarChart3,
  plug: Plug,
  rocket: Rocket,
  checklist: ListChecks,
};

export default function AgendaOverview() {
  const { data } = useQbr();
  const sections = data.agendaSections ?? [];

  return (
    <section id="agenda" className="qbr-section section-alt px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">Overview</p>
          <h2 className="text-2xl font-semibold text-foreground">Today's Agenda</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => {
            const Icon = icons[s.icon] ?? Plug;
            return (
            <a key={s.id} href={`#${s.id}`} className="group flex items-start gap-3 rounded-lg border bg-card p-6 transition-colors hover:bg-muted/40">
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <div>
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="mt-1 text-xs text-subtle-foreground">{s.description}</p>
              </div>
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

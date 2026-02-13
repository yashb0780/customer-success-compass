import { useQbr } from "@/contexts/QbrContext";
import { Mail, User, Users } from "lucide-react";

export default function TeamSection() {
  const { data } = useQbr();

  return (
    <section id="team" className="qbr-section px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Team</p>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Your Team</h2>
        </div>
        <div className="grid gap-px bg-border rounded-lg overflow-hidden border sm:grid-cols-2 lg:grid-cols-3">
          {data.team.map((m) => (
            <div key={m.email} className="flex items-center gap-4 bg-card p-5">
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
                <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5">
                  <Mail className="h-3 w-3" /> {m.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

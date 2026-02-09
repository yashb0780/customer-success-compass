import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User } from "lucide-react";

export default function TeamSection() {
  const { data } = useQbr();

  return (
    <section id="team" className="qbr-section px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-3xl font-bold text-foreground">Your Team at {data.customerName}</h2>
        <p className="mb-8 text-muted-foreground">Dedicated to driving your success</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.team.map((m) => (
            <Card key={m.email} className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </div>
                <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Mail className="h-3 w-3" /> {m.email}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

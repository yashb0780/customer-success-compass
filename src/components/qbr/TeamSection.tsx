import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User, Users } from "lucide-react";

export default function TeamSection() {
  const { data } = useQbr();

  return (
    <section id="team" className="qbr-section px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-4xl font-extrabold text-foreground">Your Team</h2>
        </div>
        <p className="mb-10 text-lg text-muted-foreground ml-[52px]">Dedicated to driving your success at {data.customerName}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.team.map((m) => (
            <Card key={m.email} className="hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary ring-4 ring-primary/10">
                    <User className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-foreground">{m.name}</p>
                  <p className="text-sm text-muted-foreground font-medium">{m.role}</p>
                </div>
                <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                  <Mail className="h-3.5 w-3.5" /> {m.email}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

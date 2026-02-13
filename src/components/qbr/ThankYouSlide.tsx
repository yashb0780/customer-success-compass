import { useQbr } from "@/contexts/QbrContext";
import { Heart } from "lucide-react";

export default function ThankYouSlide() {
  const { data } = useQbr();

  return (
    <section className="qbr-section flex min-h-[60vh] flex-col items-center justify-center text-center px-6 py-20">
      <div className="space-y-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-card">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">Thank You</h2>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          We appreciate the partnership with {data.customerName}. Looking forward to continued success in {data.quarter} and beyond.
        </p>
        <div className="pt-4 space-y-1">
          {data.team.map((m) => (
            <p key={m.email} className="text-sm text-muted-foreground">
              {m.name} · <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useQbr } from "@/contexts/QbrContext";
import { Building2 } from "lucide-react";

export default function CoverPage() {
  const { data } = useQbr();

  return (
    <section id="cover" className="qbr-section flex min-h-[80vh] flex-col items-center justify-center text-center px-6 py-20">
      <div className="animate-fade-in space-y-8">
        {data.customerLogoUrl ? (
          <img src={data.customerLogoUrl} alt={data.customerName} className="mx-auto h-20 object-contain" />
        ) : (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
        )}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {data.qbrTitle}
          </h1>
          <p className="text-lg text-muted-foreground">
            {data.customerName} &middot; {data.date}
          </p>
        </div>
        <div className="pt-8">
          <a href="#agenda" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Get Started ↓
          </a>
        </div>
      </div>
    </section>
  );
}

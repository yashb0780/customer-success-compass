import { useQbr } from "@/contexts/QbrContext";
import { Building2, ArrowDown } from "lucide-react";

export default function CoverPage() {
  const { data } = useQbr();

  return (
    <section id="cover" className="qbr-section relative flex min-h-[80vh] flex-col items-center justify-center text-center px-6 py-20">
      <div className="space-y-8">
        {data.customerLogoUrl ? (
          <img src={data.customerLogoUrl} alt={data.customerName} className="mx-auto h-16 object-contain opacity-80" />
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border bg-card">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {data.qbrTitle}
          </h1>
          <p className="text-base text-muted-foreground">
            {data.customerName} · {data.date}
          </p>
        </div>
        <div className="pt-4">
          <a href="#agenda" className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Get Started
            <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

import { useQbr } from "@/contexts/QbrContext";
import { Building2, ChevronDown } from "lucide-react";

export default function CoverPage() {
  const { data } = useQbr();

  return (
    <section id="cover" className="qbr-section relative flex min-h-[85vh] flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative animate-fade-in space-y-10">
        {data.customerLogoUrl ? (
          <img src={data.customerLogoUrl} alt={data.customerName} className="mx-auto h-20 object-contain" />
        ) : (
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 shadow-lg shadow-primary/10">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
        )}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            {data.qbrTitle}
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            {data.customerName} &middot; {data.date}
          </p>
        </div>
        <div className="pt-6">
          <a href="#agenda" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
            Get Started
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

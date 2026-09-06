import { useQbr } from "@/contexts/QbrContext";
import { ArrowDown } from "lucide-react";

/**
 * The cover.
 *
 * The customer's name is the display line, not "Quarterly Business Review".
 * A customer opening this should see who it is about first; the document type
 * is a label, so it is set as one.
 */
export default function CoverPage() {
  const { data } = useQbr();

  return (
    <section
      id="cover"
      className="qbr-section relative flex min-h-[52vh] flex-col items-center justify-center px-6 py-20 text-center"
    >
      <div className="flex flex-col items-center gap-6">
        {data.customerLogoUrl && (
          <img
            src={data.customerLogoUrl}
            alt={data.customerName}
            className="h-8 object-contain"
          />
        )}

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
            {data.qbrTitle}
          </p>
          <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
            {data.customerName}
          </h1>
          <p className="text-base text-muted-foreground">
            {data.quarter} · {data.date}
          </p>
        </div>

        <a
          href="#agenda"
          className="group mt-2 inline-flex items-center gap-2 rounded-pill border bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Get started
          <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}

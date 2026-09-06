import { useQbr } from "@/contexts/QbrContext";
import { ArrowDown, Search } from "lucide-react";
import { isAdminMode } from "@/lib/adminMode";

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

        {/* Placeholder for the extraction flow — inert for now. Admin only, so
            a customer never sees an internal lookup control on their QBR. */}
        {isAdminMode() && (
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 rounded-pill border bg-card px-4 py-2.5 text-left shadow-subtle">
              <Search className="h-4 w-4 shrink-0 text-subtle-foreground" />
              <input
                type="search"
                disabled
                aria-label="Search by company name or domain"
                placeholder="Search by company name or domain"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none disabled:cursor-not-allowed"
              />
            </div>
            <p className="mt-2 text-xs text-subtle-foreground">
              Not connected yet · only visible in admin mode
            </p>
          </div>
        )}

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

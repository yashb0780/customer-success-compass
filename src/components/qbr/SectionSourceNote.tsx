import { useQbr } from "@/contexts/QbrContext";
import { ContentSourceKind, SourcedSection } from "@/types/qbr";

/**
 * Small note on a section heading saying where that section's content came
 * from, and how old the source is.
 *
 * ADMIN ONLY. This answers a CSM's question while preparing a QBR, not a
 * customer's while reading one — "Manual" beside four headings tells a customer
 * nothing useful. The page-level DataSourceBadge is the customer-facing honesty
 * signal. Revisit once real sources exist and this reads "From deal notes,
 * Mar 2026", which is a trust signal rather than an admission.
 *
 * Quieter than DataSourceBadge by design: plain text, no border, and a dot only
 * when there is something to act on.
 */

const KIND_LABELS: Record<ContentSourceKind, string> = {
  manual: "Manual",
  "deal-notes": "From deal notes",
  "success-plan": "From success plan",
  "internal-doc": "From internal docs",
  hubspot: "From HubSpot",
};

/** Extracted content older than this is flagged. A QBR is quarterly; a source
 *  over a year old may describe a customer that no longer exists. */
const STALE_AFTER_MONTHS = 12;

/**
 * Parse a source date. Date-only strings ("2026-03-01") are read as LOCAL
 * dates: `new Date("2026-03-01")` is parsed as UTC midnight, which renders as
 * the previous month in any negative-offset timezone.
 */
function parseSourceDate(iso: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return new Date(Number(y), Number(m) - 1, d ? Number(d) : 1);
  }
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const shortDate = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
const longDate = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

function monthsSince(d: Date): number {
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

export default function SectionSourceNote({ section }: { section: SourcedSection }) {
  const { data } = useQbr();

  // Same gate as the admin panel itself in QbrDashboard.tsx.
  const adminMode =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("admin");
  if (!adminMode) return null;

  const p = data.provenance?.[section];
  if (!p) return null;

  const kindLabel = KIND_LABELS[p.kind] ?? "Unknown source";
  const date = p.sourceDate ? parseSourceDate(p.sourceDate) : null;
  const isManual = p.kind === "manual";

  // Staleness only applies to extracted content. Hand-entered content carries
  // no source date yet — see CLAUDE.md, deferred with the rest of the pipeline.
  let stale = false;
  let datePart = "";

  if (isManual) {
    datePart = date ? shortDate(date) : "";
  } else if (!date) {
    // Unknown recency is itself a risk: we cannot tell whether this is current.
    stale = true;
    datePart = "date unknown";
  } else {
    datePart = shortDate(date);
    stale = monthsSince(date) >= STALE_AFTER_MONTHS;
  }

  const text = datePart ? `${kindLabel}, ${datePart}` : kindLabel;

  let tooltip: string;
  if (isManual) {
    tooltip = date
      ? `Entered by hand in the admin panel, ${longDate(date)}.`
      : "Entered by hand in the admin panel.";
  } else {
    const source = p.label ?? kindLabel.replace(/^From /, "");
    tooltip = date
      ? `Extracted from ${source}, dated ${longDate(date)}.`
      : `Extracted from ${source}.`;
    if (!date) {
      tooltip += " We could not determine when this source was written.";
    } else if (stale) {
      tooltip += ` This source is over ${STALE_AFTER_MONTHS} months old and may no longer reflect what the customer runs.`;
    }
  }
  tooltip += " Only visible in admin mode.";

  return (
    <span
      title={tooltip}
      aria-label={`Content source: ${text}. ${tooltip}`}
      className="inline-flex shrink-0 items-center gap-1.5 text-xs text-subtle-foreground"
    >
      {stale && (
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-qbr-warning" />
      )}
      {text}
    </span>
  );
}

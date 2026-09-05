import { useQbr } from "@/contexts/QbrContext";
import { cn } from "@/lib/utils";

/**
 * Says where the numbers on this page came from.
 *
 * A QBR is presented live to a customer, so this is deliberately understated:
 * a small dot and a few words, never a banner or an alarm colour. It exists
 * because the page silently falls back to the copy bundled into the build when
 * the API is unreachable — on 2026-09-04 that hid a real outage for two
 * minutes, with the page looking completely normal throughout.
 *
 * Four states, first match wins. Order matters: local edits are checked BEFORE
 * the source, because once a CSM has typed real content into the admin panel
 * the payload is still `source: "static"` but calling it "Sample data" would
 * be wrong.
 */

type Tone = "warn" | "muted";

interface State {
  label: string;
  /** Shown on hover, and to screen readers. */
  detail: string;
  tone: Tone;
  /** Live data needs no dot — it is a timestamp, not a status to act on. */
  showDot: boolean;
}

/** "2:31 PM" for today, otherwise "4 Sep" — a bare time is misleading on stale data. */
function formatGeneratedAt(iso: string): string | null {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;

  const now = new Date();
  const sameDay =
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate();

  return sameDay
    ? then.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : then.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function DataSourceBadge({ variant = "pill" }: { variant?: "pill" | "text" }) {
  const { meta, isFallback, hasLocalOverrides } = useQbr();

  let state: State;

  if (isFallback) {
    state = {
      label: "Offline copy",
      detail:
        "Live data could not be loaded, so this page is showing the copy built into it. The figures may be out of date.",
      tone: "warn",
      showDot: true,
    };
  } else if (hasLocalOverrides) {
    state = {
      label: "Local edits",
      detail:
        "This page is showing edits saved in this browser, not the data the server returned. Open the admin panel and choose Reset to live data to discard them.",
      tone: "muted",
      showDot: true,
    };
  } else if (meta && meta.source !== "hubspot") {
    state = {
      label: "Sample data",
      detail: "This account is not connected to a live data source yet.",
      tone: "muted",
      showDot: true,
    };
  } else {
    const when = meta ? formatGeneratedAt(meta.generatedAt) : null;
    state = {
      label: when ? `Updated ${when}` : "Live data",
      detail: "Showing live data from the connected source.",
      tone: "muted",
      showDot: false,
    };
  }

  if (variant === "text") {
    return (
      <span title={state.detail} aria-label={`${state.label}. ${state.detail}`}>
        {state.label}
      </span>
    );
  }

  return (
    <span
      title={state.detail}
      aria-label={`${state.label}. ${state.detail}`}
      className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground"
    >
      {state.showDot && (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            state.tone === "warn" ? "bg-qbr-warning" : "bg-muted-foreground/50",
          )}
        />
      )}
      {state.label}
    </span>
  );
}

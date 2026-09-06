import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { AccountMeta, QbrData } from "@/types/qbr";
import { accountData } from "@/data/account";
import { AccountFetchError, fetchAccount } from "@/lib/fetchAccount";
import { isAcceptableAccountId } from "@/lib/accountId";
import { decideAccountView } from "@/lib/accountView";
import QbrUnavailable from "@/components/qbr/QbrUnavailable";
import QbrSkeleton from "@/components/qbr/QbrSkeleton";

interface QbrContextType {
  data: QbrData;
  /** Where the payload came from, or null when we are on the bundled fallback. */
  meta: AccountMeta | null;
  setData: (data: QbrData) => void;
  /** True when admin edits saved in THIS browser are masking the server's data. */
  hasLocalOverrides: boolean;
  /** Discard those saved edits and show what the server returned. */
  resetToLiveData: () => void;
  /** True when the API could not be reached and the bundled copy is showing. */
  isFallback: boolean;
  /**
   * Whether the editor overlay is open. This is NOT authentication — there is
   * none. The editor is reachable by anyone who adds ?admin to the URL. See
   * "Known gaps" in CLAUDE.md.
   */
  isEditorOpen: boolean;
  setEditorOpen: (v: boolean) => void;
}

const QbrContext = createContext<QbrContextType | null>(null);

/** Saved admin edits for one customer, or null if this browser has none. */
function statusOf(err: unknown): number | undefined {
  return err instanceof AccountFetchError ? err.status : undefined;
}

function readOverrides(storageKey: string): QbrData | null {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? (parsed as QbrData) : null;
  } catch {
    return null;
  }
}

export function QbrProvider({ customerId, children }: { customerId: string; children: ReactNode }) {
  const storageKey = `qbr-${customerId}`;

  // Open by default: the overlay only renders when ?admin is in the URL.
  const [isEditorOpen, setEditorOpen] = useState(true);
  const [overrides, setOverrides] = useState<QbrData | null>(() => readOverrides(storageKey));

  // Switching customer means a different set of saved edits.
  useEffect(() => {
    setOverrides(readOverrides(storageKey));
  }, [storageKey]);

  // A rejected id is never fetched, and — crucially — never reaches the bundled
  // fallback below. See src/lib/accountView.ts.
  const idIsAcceptable = isAcceptableAccountId(customerId);

  const query = useQuery({
    enabled: idIsAcceptable,
    queryKey: ["account", customerId],
    queryFn: ({ signal }) => fetchAccount(customerId, signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 800,
    // Ask React Query not to pause a failing query. Note this is NOT sufficient
    // on its own: with 5.83.0 a failing query was observed sitting at
    // fetchStatus "paused" / isError false indefinitely even with this set and
    // with both navigator.onLine and onlineManager.isOnline() reporting true.
    // The fallback condition below is what actually protects the page.
    networkMode: "always",
  });

  // If the API is unreachable we fall back to the copy compiled into the page,
  // so a QBR being presented live never collapses to an error screen.
  // A failing query does not reliably reach the "error" state: React Query may
  // PAUSE it instead (fetchStatus "paused"), leaving isError false and status
  // "pending" indefinitely, which parks the page on the loading skeleton
  // forever. Treat a stalled-after-failing query the same as a failed one —
  // sitting on a skeleton is never the right answer when a usable copy is
  // compiled into the page.
  const stalled = query.isError || (query.fetchStatus === "paused" && query.failureCount > 0);

  const view = decideAccountView({
    customerId,
    hasData: query.data !== undefined,
    stalled,
    // failureReason as well as error: while React Query is PAUSED between
    // retries, `error` is undefined but `failureReason` holds the last failure.
    // Without it a 404 is indistinguishable from an outage, and an outage is
    // the one case allowed to fall back.
    status: statusOf(query.error) ?? statusOf(query.failureReason),
  });

  // "Fallback" specifically means we are showing the bundled copy. If a refetch
  // fails but we already have server data, we are not on the fallback — we are
  // on the last good response — and the badge should not claim otherwise.
  const isFallback = view.kind === "fallback";
  const base: QbrData | undefined = query.data?.data ?? (isFallback ? accountData : undefined);

  const data = useMemo<QbrData | null>(() => {
    if (!base) return null;
    if (!overrides) return base;

    // Saved edits win over the server (see CLAUDE.md: this is the interim
    // behaviour; once HubSpot is live these should expire against meta.generatedAt).
    const merged = { ...base, ...overrides };

    // Legacy fix carried over: very old saved data used an "Executive ..." title.
    if (overrides.qbrTitle && overrides.qbrTitle.toLowerCase().includes("executive")) {
      merged.qbrTitle = base.qbrTitle;
    }
    return merged;
  }, [base, overrides]);

  const setData = useCallback(
    (newData: QbrData) => {
      setOverrides(newData);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newData));
      } catch {
        // Private browsing or a full quota: the edit still applies for this
        // session, it just will not survive a reload.
      }
    },
    [storageKey],
  );

  const resetToLiveData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Nothing to clear; falling through to the server data below is enough.
    }
    setOverrides(null);
  }, [storageKey]);

  const value = useMemo<QbrContextType | null>(
    () =>
      data
        ? {
            data,
            meta: query.data?.meta ?? null,
            setData,
            hasLocalOverrides: overrides !== null,
            resetToLiveData,
            isFallback,
            isEditorOpen,
            setEditorOpen,
          }
        : null,
    [data, query.data?.meta, setData, overrides, resetToLiveData, isFallback, isEditorOpen],
  );

  // Every hook above runs unconditionally; only the render branches.
  if (view.kind === "unavailable") return <QbrUnavailable reason={view.reason} />;
  if (!value) return <QbrSkeleton />;

  return <QbrContext.Provider value={value}>{children}</QbrContext.Provider>;
}

export function useQbr() {
  const ctx = useContext(QbrContext);
  if (!ctx) throw new Error("useQbr must be used within QbrProvider");
  return ctx;
}

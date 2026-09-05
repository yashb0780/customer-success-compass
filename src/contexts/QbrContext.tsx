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
import { fetchAccount } from "@/lib/fetchAccount";
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
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
}

const QbrContext = createContext<QbrContextType | null>(null);

/** Saved admin edits for one customer, or null if this browser has none. */
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [overrides, setOverrides] = useState<QbrData | null>(() => readOverrides(storageKey));

  // Switching customer means a different set of saved edits.
  useEffect(() => {
    setOverrides(readOverrides(storageKey));
  }, [storageKey]);

  const query = useQuery({
    queryKey: ["account", customerId],
    queryFn: ({ signal }) => fetchAccount(customerId, signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // If the API is unreachable we fall back to the copy compiled into the page,
  // so a QBR being presented live never collapses to an error screen.
  const isFallback = query.isError;
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
            isAdmin,
            setIsAdmin,
          }
        : null,
    [data, query.data?.meta, setData, overrides, resetToLiveData, isFallback, isAdmin],
  );

  // Every hook above runs unconditionally; only the render branches.
  if (!value) return <QbrSkeleton />;

  return <QbrContext.Provider value={value}>{children}</QbrContext.Provider>;
}

export function useQbr() {
  const ctx = useContext(QbrContext);
  if (!ctx) throw new Error("useQbr must be used within QbrProvider");
  return ctx;
}

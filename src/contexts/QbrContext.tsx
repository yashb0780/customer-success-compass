import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { QbrData } from "@/types/qbr";
import { defaultQbrData } from "@/data/mockQbr";

interface QbrContextType {
  data: QbrData;
  setData: (data: QbrData) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
}

const QbrContext = createContext<QbrContextType | null>(null);

export function QbrProvider({ customerId, children }: { customerId: string; children: ReactNode }) {
  const storageKey = `qbr-${customerId}`;
  const [data, setDataState] = useState<QbrData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle missing fields from older saved data
        return { ...defaultQbrData, ...parsed };
      }
    } catch {
      // ignore parse errors
    }
    return defaultQbrData;
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const setData = (newData: QbrData) => {
    setDataState(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
  };

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey, data]);

  return (
    <QbrContext.Provider value={{ data, setData, isAdmin, setIsAdmin }}>
      {children}
    </QbrContext.Provider>
  );
}

export function useQbr() {
  const ctx = useContext(QbrContext);
  if (!ctx) throw new Error("useQbr must be used within QbrProvider");
  return ctx;
}

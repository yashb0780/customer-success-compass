import { useQbr } from "@/contexts/QbrContext";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";
import SectionSourceNote from "@/components/qbr/SectionSourceNote";

export default function DeepDive() {
  const { data } = useQbr();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Deep Dive Analysis</h3>
        </div>
        <SectionSourceNote section="deepDive" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-5 py-3">
            <CheckCircle2 className="h-4 w-4 text-qbr-success" />
            <p className="text-sm font-medium text-foreground">What's Working Well</p>
          </div>
          <ul className="divide-y">
            {data.workingWell.map((item, i) => (
              <li key={i} className="flex gap-3 px-5 py-3 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-qbr-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-qbr-warning" />
            <p className="text-sm font-medium text-foreground">What Can Be Improved</p>
          </div>
          <ul className="divide-y">
            {data.toImprove.map((item, i) => (
              <li key={i} className="flex gap-3 px-5 py-3 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-qbr-warning" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

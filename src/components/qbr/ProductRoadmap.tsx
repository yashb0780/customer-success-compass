import { useState } from "react";
import { useQbr } from "@/contexts/QbrContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FeatureStatus } from "@/types/qbr";
import { X, MousePointerClick } from "lucide-react";

const statusStyles: Record<FeatureStatus, string> = {
  live: "bg-qbr-success/10 text-qbr-success border-qbr-success/30",
  "public-beta": "bg-qbr-info/10 text-qbr-info border-qbr-info/30",
  "private-beta": "bg-qbr-warning/10 text-qbr-warning border-qbr-warning/30",
  upcoming: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<FeatureStatus, string> = {
  live: "Live",
  "public-beta": "Public Beta",
  "private-beta": "Private Beta",
  upcoming: "Upcoming",
};

export default function ProductRoadmap() {
  const { data } = useQbr();
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  const grouped = {
    current: data.roadmap.filter((r) => r.quarter.includes("Q1 2026")),
    next: data.roadmap.filter((r) => r.quarter.includes("Q2 2026")),
    future: data.roadmap.filter((r) => r.quarter.includes("H2")),
  };

  const renderGroup = (title: string, items: typeof data.roadmap) => (
    <div className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-widest text-primary">{title}</h4>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isFlipped = flippedCard === item.name;
          return (
            <div
              key={item.name}
              className={cn("flip-card cursor-pointer", isFlipped && "flipped")}
              style={{ minHeight: "260px" }}
              onClick={() => setFlippedCard(isFlipped ? null : item.name)}
            >
              <div className="flip-card-inner">
                {/* Front */}
                <div className="flip-card-front rounded-xl border-2 border-border bg-card shadow-md hover:shadow-xl hover:border-primary/30 transition-shadow p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h5 className="text-lg font-bold text-foreground leading-tight">{item.name}</h5>
                      <Badge className={cn("shrink-0 border text-xs font-semibold", statusStyles[item.status])}>
                        {statusLabels[item.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.impactTags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs font-medium">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-4 pt-3 border-t">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    Click to learn more
                  </div>
                </div>

                {/* Back */}
                <div className="flip-card-back rounded-xl border-2 border-primary/30 bg-card shadow-xl p-6 flex flex-col overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h5 className="text-lg font-bold text-foreground">{item.name}</h5>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFlippedCard(null); }}
                      className="shrink-0 rounded-full p-1 hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{item.description}</p>
                  {item.videoUrl && (
                    <div className="mt-4 aspect-video overflow-hidden rounded-lg border">
                      <iframe
                        src={item.videoUrl}
                        className="h-full w-full"
                        allowFullScreen
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <h3 className="text-2xl font-bold text-foreground">Product Roadmap</h3>
      {grouped.current.length > 0 && renderGroup("This Quarter", grouped.current)}
      {grouped.next.length > 0 && renderGroup("Next Quarter", grouped.next)}
      {grouped.future.length > 0 && renderGroup("Later This Year", grouped.future)}
    </div>
  );
}

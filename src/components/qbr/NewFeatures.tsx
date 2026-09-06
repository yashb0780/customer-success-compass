import { useState } from "react";
import { useQbr } from "@/contexts/QbrContext";
import SectionSourceNote from "@/components/qbr/SectionSourceNote";
import { cn } from "@/lib/utils";
import { FeatureStatus } from "@/types/qbr";
import { X } from "lucide-react";

const statusStyles: Record<FeatureStatus, string> = {
  live: "text-qbr-success bg-qbr-success/10",
  "public-beta": "text-primary bg-primary/10",
  "private-beta": "text-qbr-warning bg-qbr-warning/10",
  upcoming: "text-muted-foreground bg-muted",
};

const statusLabels: Record<FeatureStatus, string> = {
  live: "Live", "public-beta": "Public Beta", "private-beta": "Private Beta", upcoming: "Upcoming",
};

export default function NewFeatures() {
  const { data } = useQbr();
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">New Feature Releases</h3>
        <SectionSourceNote section="newFeatures" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.newFeatures.map((f) => {
          const isFlipped = flippedCard === f.title;
          return (
            <div
              key={f.title}
              className={cn("flip-card cursor-pointer", isFlipped && "flipped")}
              style={{ minHeight: "220px" }}
              onClick={() => setFlippedCard(isFlipped ? null : f.title)}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front rounded-lg border bg-card p-6 flex flex-col justify-between transition-colors hover:bg-muted/30">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-foreground">{f.title}</h4>
                      <span className={cn("shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium", statusStyles[f.status])}>{statusLabels[f.status]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.shortDescription}</p>
                  </div>
                  <p className="mt-3 text-xs text-subtle-foreground">Click to explore →</p>
                </div>

                <div className="flip-card-back rounded-lg border border-primary/20 bg-card p-6 flex flex-col overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium text-foreground">{f.title}</h4>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFlippedCard(null); }}
                      className="shrink-0 rounded-md p-1 hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{f.longDescription}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {f.impactTags.map((t) => (
                      <span key={t} className="rounded-pill bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  {f.videoUrl && (
                    <div className="mt-auto aspect-video overflow-hidden rounded-md border">
                      <iframe src={f.videoUrl} className="h-full w-full" allowFullScreen onClick={(e) => e.stopPropagation()} />
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
}

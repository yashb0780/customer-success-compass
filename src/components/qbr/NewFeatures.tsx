import { useState } from "react";
import { useQbr } from "@/contexts/QbrContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FeatureStatus, NewFeatureCard as FeatureCardType } from "@/types/qbr";
import { X, MousePointerClick } from "lucide-react";

const statusStyles: Record<FeatureStatus, string> = {
  live: "bg-qbr-success/10 text-qbr-success border-qbr-success/30",
  "public-beta": "bg-qbr-info/10 text-qbr-info border-qbr-info/30",
  "private-beta": "bg-qbr-warning/10 text-qbr-warning border-qbr-warning/30",
  upcoming: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<FeatureStatus, string> = {
  live: "Live", "public-beta": "Public Beta", "private-beta": "Private Beta", upcoming: "Upcoming",
};

export default function NewFeatures() {
  const { data } = useQbr();
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-foreground">New Feature Releases</h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.newFeatures.map((f) => {
          const isFlipped = flippedCard === f.title;
          return (
            <div
              key={f.title}
              className={cn("flip-card cursor-pointer", isFlipped && "flipped")}
              style={{ minHeight: "240px" }}
              onClick={() => setFlippedCard(isFlipped ? null : f.title)}
            >
              <div className="flip-card-inner">
                {/* Front */}
                <div className="flip-card-front rounded-xl border-2 border-border bg-card shadow-md hover:shadow-xl hover:border-primary/30 transition-shadow p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="text-lg font-bold text-foreground">{f.title}</h4>
                      <Badge className={cn("shrink-0 border text-xs font-semibold", statusStyles[f.status])}>{statusLabels[f.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{f.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-4 pt-3 border-t">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    Click to explore
                  </div>
                </div>

                {/* Back */}
                <div className="flip-card-back rounded-xl border-2 border-primary/30 bg-card shadow-xl p-6 flex flex-col overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="text-lg font-bold text-foreground">{f.title}</h4>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFlippedCard(null); }}
                      className="shrink-0 rounded-full p-1 hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{f.longDescription}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {f.impactTags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                  {f.videoUrl && (
                    <div className="mt-auto aspect-video overflow-hidden rounded-lg border">
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

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

export default function ProductRoadmap() {
  const { data } = useQbr();
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  const groups = (data.roadmapGroups ?? []).map((g) => ({
    title: g.title,
    items: data.roadmap.filter((r) => g.matchQuarters.includes(r.quarter)),
  }));

  const renderGroup = (title: string, items: typeof data.roadmap) => (
    <div key={title} className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isFlipped = flippedCard === item.name;
          return (
            <div
              key={item.name}
              className={cn("flip-card cursor-pointer", isFlipped && "flipped")}
              style={{ minHeight: "200px" }}
              onClick={() => setFlippedCard(isFlipped ? null : item.name)}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front rounded-lg border bg-card p-5 flex flex-col justify-between transition-colors hover:bg-muted/30">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h5 className="text-sm font-medium text-foreground leading-tight">{item.name}</h5>
                      <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-xs font-medium", statusStyles[item.status])}>
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.impactTags.map((t) => (
                        <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Click to learn more →</p>
                </div>

                <div className="flip-card-back rounded-lg border border-primary/20 bg-card p-5 flex flex-col overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h5 className="text-sm font-medium text-foreground">{item.name}</h5>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFlippedCard(null); }}
                      className="shrink-0 rounded-md p-1 hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{item.description}</p>
                  {item.videoUrl && (
                    <div className="mt-3 aspect-video overflow-hidden rounded-md border">
                      <iframe src={item.videoUrl} className="h-full w-full" allowFullScreen onClick={(e) => e.stopPropagation()} />
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">Product Roadmap</h3>
        <SectionSourceNote section="roadmap" />
      </div>
      {groups.map((g) => g.items.length > 0 && renderGroup(g.title, g.items))}
    </div>
  );
}

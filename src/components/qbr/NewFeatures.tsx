import { useState } from "react";
import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FeatureStatus, NewFeatureCard as FeatureCardType } from "@/types/qbr";
import { X, Play } from "lucide-react";

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
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">New Feature Releases</h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.newFeatures.map((f) => (
          <FeatureCard
            key={f.title}
            feature={f}
            isExpanded={expanded === f.title}
            onToggle={() => setExpanded(expanded === f.title ? null : f.title)}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ feature: f, isExpanded, onToggle }: { feature: FeatureCardType; isExpanded: boolean; onToggle: () => void }) {
  if (isExpanded) {
    return (
      <Card className="sm:col-span-2 lg:col-span-3 animate-scale-in border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xl font-bold text-foreground">{f.title}</h4>
                <Badge className={cn("border", statusStyles[f.status])}>{statusLabels[f.status]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{f.longDescription}</p>
              <div className="flex flex-wrap gap-1.5">
                {f.impactTags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
            <button onClick={onToggle} className="shrink-0 rounded-full p-1 hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          {f.videoUrl && (
            <div className="mt-4 aspect-video max-w-xl overflow-hidden rounded-lg border">
              <iframe src={f.videoUrl} className="h-full w-full" allowFullScreen />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5" onClick={onToggle}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground">{f.title}</h4>
          <Badge className={cn("shrink-0 border text-xs", statusStyles[f.status])}>{statusLabels[f.status]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{f.shortDescription}</p>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <Play className="h-3 w-3" /> Click to explore
        </div>
      </CardContent>
    </Card>
  );
}

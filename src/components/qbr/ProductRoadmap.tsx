import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureStatus } from "@/types/qbr";

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

  const grouped = {
    current: data.roadmap.filter((r) => r.quarter.includes("Q1 2026")),
    next: data.roadmap.filter((r) => r.quarter.includes("Q2 2026")),
    future: data.roadmap.filter((r) => r.quarter.includes("H2")),
  };

  const renderGroup = (title: string, items: typeof data.roadmap) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {items.map((item) => (
        <Collapsible key={item.name}>
          <Card>
            <CollapsibleTrigger className="w-full text-left">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {item.impactTags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
                <Badge className={cn("shrink-0 border", statusStyles[item.status])}>
                  {statusLabels[item.status]}
                </Badge>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.videoUrl && (
                  <div className="mt-3 aspect-video max-w-md overflow-hidden rounded-lg">
                    <iframe src={item.videoUrl} className="h-full w-full" allowFullScreen />
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-foreground">Product Roadmap</h3>
      {grouped.current.length > 0 && renderGroup("This Quarter", grouped.current)}
      {grouped.next.length > 0 && renderGroup("Next Quarter", grouped.next)}
      {grouped.future.length > 0 && renderGroup("Later This Year", grouped.future)}
    </div>
  );
}

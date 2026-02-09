import { useQbr } from "@/contexts/QbrContext";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plug, Mail, BarChart3, MessageSquare, Bug, TrendingUp, Headphones, Share2, Layers } from "lucide-react";
import { Integration } from "@/types/qbr";

const iconMap: Record<string, React.ElementType> = {
  Salesforce: TrendingUp,
  Email: Mail,
  Slack: MessageSquare,
  Jira: Bug,
  "Google Analytics": BarChart3,
  Zendesk: Headphones,
  HubSpot: Share2,
};

function IntegrationCard({ integration, connected }: { integration: Integration; connected: boolean }) {
  const Icon = iconMap[integration.name] || Plug;
  return (
    <Card className="flex flex-col items-center gap-3 p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${connected ? "bg-gradient-to-br from-qbr-success/15 to-qbr-success/5 text-qbr-success" : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"}`}>
        <Icon className="h-7 w-7" />
      </div>
      <span className="text-sm font-bold text-foreground">{integration.name}</span>
      {!connected && (
        <Badge className="bg-qbr-success/10 text-qbr-success border-qbr-success/30 hover:bg-qbr-success/15 font-semibold">
          Available
        </Badge>
      )}
    </Card>
  );
}

export default function IntegrationOpportunities() {
  const { data } = useQbr();
  const connected = data.connectedIntegrations || [];
  const available = data.availableIntegrations || [];
  return (
    <section id="integrations" className="qbr-section section-alt px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-qbr-warning/10 text-qbr-warning">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-foreground">Tech Stack & Integrations</h2>
            <p className="mt-1 text-lg text-muted-foreground">Connected tools &amp; available integrations</p>
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-xl font-bold text-foreground">Current Tech Stack</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {connected.map((i) => (
              <IntegrationCard key={i.name} integration={i} connected />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-xl font-bold text-foreground">Available Integrations</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {available.map((i) => (
              <IntegrationCard key={i.name} integration={i} connected={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

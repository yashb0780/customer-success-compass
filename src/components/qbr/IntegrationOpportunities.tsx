import { useQbr } from "@/contexts/QbrContext";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plug, Mail, BarChart3, MessageSquare, Bug, TrendingUp, Headphones, Share2 } from "lucide-react";
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
    <Card className="flex flex-col items-center gap-3 p-5 text-center">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${connected ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-500"}`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium text-foreground">{integration.name}</span>
      <Badge className={connected ? "bg-green-500/15 text-green-700 border-green-500/30 hover:bg-green-500/20" : "bg-orange-500/15 text-orange-700 border-orange-500/30 hover:bg-orange-500/20"}>
        {connected ? "Connected" : "Available"}
      </Badge>
    </Card>
  );
}

export default function IntegrationOpportunities() {
  const { data } = useQbr();
  return (
    <section id="integrations" className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Integration Opportunities</h2>
          <p className="mt-1 text-muted-foreground">Connected tools &amp; available integrations</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Connected Integrations</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {data.connectedIntegrations.map((i) => (
              <IntegrationCard key={i.name} integration={i} connected />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Integrations Available</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {data.availableIntegrations.map((i) => (
              <IntegrationCard key={i.name} integration={i} connected={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

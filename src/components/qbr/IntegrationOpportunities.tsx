import { useQbr } from "@/contexts/QbrContext";
import SectionSourceNote from "@/components/qbr/SectionSourceNote";
import { Plug, Mail, BarChart3, MessageSquare, Bug, TrendingUp, Headphones, Share2, Layers } from "lucide-react";
import { Integration, IconName } from "@/types/qbr";

const iconsByName: Partial<Record<IconName, React.ElementType>> = {
  trending: TrendingUp,
  mail: Mail,
  message: MessageSquare,
  bug: Bug,
  chart: BarChart3,
  headphones: Headphones,
  share: Share2,
  plug: Plug,
};

// Legacy fallback for integrations saved before icons were stored on the data itself.
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
  const Icon = (integration.icon && iconsByName[integration.icon]) || iconMap[integration.name] || Plug;
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-foreground flex-1">{integration.name}</span>
      {!connected && (
        <span className="rounded-pill border px-2 py-0.5 text-xs text-subtle-foreground">Available</span>
      )}
    </div>
  );
}

export default function IntegrationOpportunities() {
  const { data } = useQbr();
  const connected = data.connectedIntegrations || [];
  const available = data.availableIntegrations || [];
  return (
    <section id="integrations" className="qbr-section section-alt px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">Integrations</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-foreground">Tech Stack & Integrations</h2>
            <SectionSourceNote section="integrations" />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground">Current Tech Stack</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {connected.map((i) => (
              <IntegrationCard key={i.name} integration={i} connected />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle-foreground">Available Integrations</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {available.map((i) => (
              <IntegrationCard key={i.name} integration={i} connected={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

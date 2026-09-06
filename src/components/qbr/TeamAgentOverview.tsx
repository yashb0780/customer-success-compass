import { ReactNode } from "react";
import { useQbr } from "@/contexts/QbrContext";
import { TeamStatus, IconName } from "@/types/qbr";
import { Shield, Users, Briefcase, Scale, DollarSign, ShoppingCart, Building } from "lucide-react";

// borderColor reads the CSS variables rather than repeating literal hsl()
// values, which previously meant a token change left these stale — and broke
// dark mode, where the literals stayed light-mode colours.
const statusConfig: Record<TeamStatus, { label: string; color: string; borderColor: string }> = {
  active: { label: "Active", color: "text-qbr-success", borderColor: "hsl(var(--qbr-success))" },
  moderate: { label: "Moderate", color: "text-qbr-warning", borderColor: "hsl(var(--qbr-warning))" },
  new: { label: "New", color: "text-primary", borderColor: "hsl(var(--primary))" },
  planning: { label: "Planning", color: "text-muted-foreground", borderColor: "hsl(var(--muted-foreground))" },
};

const iconsByName: Partial<Record<IconName, ReactNode>> = {
  shield: <Shield className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  scale: <Scale className="h-4 w-4" />,
  dollar: <DollarSign className="h-4 w-4" />,
  cart: <ShoppingCart className="h-4 w-4" />,
  building: <Building className="h-4 w-4" />,
  briefcase: <Briefcase className="h-4 w-4" />,
};

// Legacy fallback for teams saved before icons were stored on the data itself.
const teamIcons: Record<string, ReactNode> = {
  "IT Support": <Shield className="h-4 w-4" />,
  HR: <Users className="h-4 w-4" />,
  Legal: <Scale className="h-4 w-4" />,
  Finance: <DollarSign className="h-4 w-4" />,
  "Sales Ops": <ShoppingCart className="h-4 w-4" />,
  Facilities: <Building className="h-4 w-4" />,
};

export default function TeamAgentOverview() {
  const { data } = useQbr();
  const teams = data.agentTeams ?? [];

  const totalAgents = teams.reduce((sum, t) => sum + t.agentCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Team & Agent Overview</h3>
        <span className="text-xs text-subtle-foreground">{totalAgents} agents across {teams.length} teams</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const cfg = statusConfig[team.status];
          const icon = (team.icon && iconsByName[team.icon]) ?? teamIcons[team.name] ?? <Briefcase className="h-4 w-4" />;

          return (
            <div
              key={team.name}
              className="rounded-lg border border-l-[3px] bg-card p-6 transition-colors hover:bg-muted/30"
              style={{ borderLeftColor: cfg.borderColor }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`${cfg.color}`}>{icon}</span>
                  <h4 className="text-sm font-medium text-foreground">{team.name}</h4>
                </div>
                <span className="rounded-pill bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {cfg.label}
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{team.agentCount}</p>
              <p className="mt-1 text-xs text-subtle-foreground">{team.agentCount} agents · {cfg.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

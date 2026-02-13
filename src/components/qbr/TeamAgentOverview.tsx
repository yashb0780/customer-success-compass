import { useQbr } from "@/contexts/QbrContext";
import { TeamStatus } from "@/types/qbr";
import { Shield, Users, Briefcase, Scale, DollarSign, ShoppingCart, Building } from "lucide-react";

const statusConfig: Record<TeamStatus, { label: string; color: string; borderColor: string }> = {
  active: { label: "Active", color: "text-qbr-success", borderColor: "hsl(142, 71%, 45%)" },
  moderate: { label: "Moderate", color: "text-qbr-warning", borderColor: "hsl(38, 92%, 50%)" },
  new: { label: "New", color: "text-primary", borderColor: "hsl(234, 56%, 58%)" },
  planning: { label: "Planning", color: "text-muted-foreground", borderColor: "hsl(240, 4%, 46%)" },
};

const teamIcons: Record<string, React.ReactNode> = {
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
        <span className="text-xs text-muted-foreground">{totalAgents} agents across {teams.length} teams</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const cfg = statusConfig[team.status];
          const icon = teamIcons[team.name] ?? <Briefcase className="h-4 w-4" />;

          return (
            <div
              key={team.name}
              className="rounded-lg border bg-card p-5 border-l-4 transition-colors hover:bg-muted/30"
              style={{ borderLeftColor: cfg.borderColor }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`${cfg.color}`}>{icon}</span>
                  <h4 className="text-sm font-medium text-foreground">{team.name}</h4>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${cfg.color} bg-muted`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">{team.agentCount}</p>
              <p className="text-xs text-muted-foreground mt-1">{team.agentCount} agents · {cfg.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

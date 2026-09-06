import { useQbr } from "@/contexts/QbrContext";
import { TrendingUp, TrendingDown, Minus, Users, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const trendIcons = {
  up: <TrendingUp className="h-3.5 w-3.5 text-qbr-success" />,
  down: <TrendingDown className="h-3.5 w-3.5 text-qbr-danger" />,
  flat: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
};

export default function UserEngagement() {
  const { data } = useQbr();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">User Engagement</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Licensed Seats</p>
          </div>
          <p className="text-2xl font-semibold text-foreground tabular-nums">{data.licensedSeats}</p>
        </div>
        {data.engagement.map((m) => (
          <div key={m.label} className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-foreground tabular-nums">{m.value}</p>
              {trendIcons[m.trend]}
            </div>
            {m.change && <p className="text-xs text-muted-foreground mt-1">{m.change} vs last quarter</p>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-3.5">
          <p className="text-sm font-medium text-foreground">Engagement Trend (Last 90 Days)</p>
        </div>
        <div className="p-5">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="mau" name="MAU" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="wau" name="WAU" stroke="hsl(var(--qbr-success))" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="dau" name="DAU" stroke="hsl(var(--qbr-warning))" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

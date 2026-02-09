import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Users, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const trendIcons = {
  up: <TrendingUp className="h-4 w-4 text-qbr-success" />,
  down: <TrendingDown className="h-4 w-4 text-qbr-danger" />,
  flat: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export default function UserEngagement() {
  const { data } = useQbr();

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-foreground">User Engagement</h3>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6 text-center space-y-1">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Licensed Seats</p>
            <p className="text-3xl font-extrabold text-foreground">{data.licensedSeats}</p>
          </CardContent>
        </Card>
        {data.engagement.map((m) => (
          <Card key={m.label} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-1">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-extrabold text-foreground">{m.value}</p>
                {trendIcons[m.trend]}
              </div>
              {m.change && <p className="text-xs text-muted-foreground font-medium">{m.change} vs last quarter</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-lg font-bold">Engagement Trend (Last 90 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
                <Legend />
                <Line type="monotone" dataKey="mau" name="MAU" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="wau" name="WAU" stroke="hsl(var(--qbr-success))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="dau" name="DAU" stroke="hsl(var(--qbr-warning))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

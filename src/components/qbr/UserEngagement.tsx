import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const trendIcons = {
  up: <TrendingUp className="h-4 w-4 text-qbr-success" />,
  down: <TrendingDown className="h-4 w-4 text-qbr-danger" />,
  flat: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export default function UserEngagement() {
  const { data } = useQbr();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">User Engagement</h3>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Licensed Seats</p>
            <p className="text-3xl font-bold text-foreground">{data.licensedSeats}</p>
          </CardContent>
        </Card>
        {data.engagement.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5 text-center space-y-1">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-bold text-foreground">{m.value}</p>
                {trendIcons[m.trend]}
              </div>
              {m.change && <p className="text-xs text-muted-foreground">{m.change} vs last quarter</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Engagement Trend (Last 90 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                <Legend />
                <Line type="monotone" dataKey="mau" name="MAU" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="wau" name="WAU" stroke="hsl(var(--qbr-success))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="dau" name="DAU" stroke="hsl(var(--qbr-warning))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

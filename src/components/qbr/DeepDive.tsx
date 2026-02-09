import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";

export default function DeepDive() {
  const { data } = useQbr();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-qbr-info/10 text-qbr-info">
          <Search className="h-5 w-5" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Deep Dive Analysis</h3>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-qbr-success/20 shadow-lg shadow-qbr-success/5">
          <CardHeader className="bg-qbr-success/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-qbr-success">
              <CheckCircle2 className="h-5 w-5" /> What's Working Well
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-3">
              {data.workingWell.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-qbr-success" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-qbr-warning/20 shadow-lg shadow-qbr-warning/5">
          <CardHeader className="bg-qbr-warning/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-qbr-warning">
              <AlertTriangle className="h-5 w-5" /> What Can Be Improved
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-3">
              {data.toImprove.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-qbr-warning" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

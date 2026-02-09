import { useQbr } from "@/contexts/QbrContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function DeepDive() {
  const { data } = useQbr();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">Deep Dive Analysis</h3>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-qbr-success/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-qbr-success">
              <CheckCircle2 className="h-5 w-5" /> What's Working Well
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        <Card className="border-qbr-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-qbr-warning">
              <AlertTriangle className="h-5 w-5" /> What Can Be Improved
            </CardTitle>
          </CardHeader>
          <CardContent>
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

import { useState } from "react";
import { useQbr } from "@/contexts/QbrContext";
import { QbrData, TeamMember, Feature, NewFeatureCard, NextStepRow, EngagementMetric, TrendDataPoint, BenefitCard, RoadmapItem, Integration } from "@/types/qbr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lock, Save, X } from "lucide-react";

export default function AdminPanel() {
  const { data, setData, isAdmin, setIsAdmin } = useQbr();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<QbrData>(data);

  if (!isAdmin) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-72 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Lock className="h-4 w-4" /> Admin Access</div>
            <Input type="password" placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button size="sm" className="w-full" onClick={() => {
              if (password === data.adminPassword) { setIsAdmin(true); setDraft(data); }
              else setError("Incorrect password");
            }}>Unlock</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const update = <K extends keyof QbrData>(key: K, val: QbrData[K]) => setDraft({ ...draft, [key]: val });

  const save = () => { setData(draft); setIsAdmin(false); };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Edit QBR Data</h2>
          <div className="flex gap-2">
            <Button onClick={save}><Save className="mr-1 h-4 w-4" /> Save</Button>
            <Button variant="ghost" onClick={() => setIsAdmin(false)}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Basic Info */}
        <Card><CardHeader><CardTitle className="text-lg">Basic Info</CardTitle></CardHeader><CardContent className="space-y-3">
          <div><Label>Customer Name</Label><Input value={draft.customerName} onChange={(e) => update("customerName", e.target.value)} /></div>
          <div><Label>Logo URL</Label><Input value={draft.customerLogoUrl} onChange={(e) => update("customerLogoUrl", e.target.value)} /></div>
          <div><Label>QBR Title</Label><Input value={draft.qbrTitle} onChange={(e) => update("qbrTitle", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quarter</Label><Input value={draft.quarter} onChange={(e) => update("quarter", e.target.value)} /></div>
            <div><Label>Date</Label><Input value={draft.date} onChange={(e) => update("date", e.target.value)} /></div>
          </div>
        </CardContent></Card>

        {/* Team */}
        <Card><CardHeader><CardTitle className="text-lg">Team</CardTitle></CardHeader><CardContent className="space-y-3">
          {draft.team.map((m, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <Input placeholder="Name" value={m.name} onChange={(e) => { const t = [...draft.team]; t[i] = { ...m, name: e.target.value }; update("team", t); }} />
              <Input placeholder="Role" value={m.role} onChange={(e) => { const t = [...draft.team]; t[i] = { ...m, role: e.target.value }; update("team", t); }} />
              <Input placeholder="Email" value={m.email} onChange={(e) => { const t = [...draft.team]; t[i] = { ...m, email: e.target.value }; update("team", t); }} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => update("team", [...draft.team, { name: "", role: "", email: "" }])}>+ Add Member</Button>
        </CardContent></Card>

        {/* Engagement */}
        <Card><CardHeader><CardTitle className="text-lg">Engagement Metrics</CardTitle></CardHeader><CardContent className="space-y-3">
          <div><Label>Licensed Seats</Label><Input type="number" value={draft.licensedSeats} onChange={(e) => update("licensedSeats", +e.target.value)} /></div>
          {draft.engagement.map((m, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <Input placeholder="Label" value={m.label} onChange={(e) => { const a = [...draft.engagement]; a[i] = { ...m, label: e.target.value }; update("engagement", a); }} />
              <Input type="number" placeholder="Value" value={m.value} onChange={(e) => { const a = [...draft.engagement]; a[i] = { ...m, value: +e.target.value }; update("engagement", a); }} />
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={m.trend} onChange={(e) => { const a = [...draft.engagement]; a[i] = { ...m, trend: e.target.value as any }; update("engagement", a); }}>
                <option value="up">↑ Up</option><option value="down">↓ Down</option><option value="flat">→ Flat</option>
              </select>
            </div>
          ))}
        </CardContent></Card>

        {/* Working Well / To Improve */}
        <Card><CardHeader><CardTitle className="text-lg">Deep Dive</CardTitle></CardHeader><CardContent className="space-y-3">
          <div><Label>What's Working Well (one per line)</Label>
            <Textarea rows={5} value={draft.workingWell.join("\n")} onChange={(e) => update("workingWell", e.target.value.split("\n").filter(Boolean))} />
          </div>
          <div><Label>What Can Be Improved (one per line)</Label>
            <Textarea rows={5} value={draft.toImprove.join("\n")} onChange={(e) => update("toImprove", e.target.value.split("\n").filter(Boolean))} />
          </div>
        </CardContent></Card>

        {/* Integrations */}
        <Card><CardHeader><CardTitle className="text-lg">Tech Stack & Integrations</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Connected Integrations (one per line)</Label>
            <Textarea rows={4} value={(draft.connectedIntegrations || []).map(i => i.name).join("\n")} onChange={(e) => update("connectedIntegrations", e.target.value.split("\n").filter(Boolean).map(name => ({ name })))} />
          </div>
          <div><Label>Available Integrations (one per line)</Label>
            <Textarea rows={4} value={(draft.availableIntegrations || []).map(i => i.name).join("\n")} onChange={(e) => update("availableIntegrations", e.target.value.split("\n").filter(Boolean).map(name => ({ name })))} />
          </div>
        </CardContent></Card>

        {/* Password */}
        <Card><CardHeader><CardTitle className="text-lg">Admin Password</CardTitle></CardHeader><CardContent>
          <Input value={draft.adminPassword} onChange={(e) => update("adminPassword", e.target.value)} />
        </CardContent></Card>

        <div className="flex gap-2 pb-8">
          <Button onClick={save} className="flex-1"><Save className="mr-1 h-4 w-4" /> Save Changes</Button>
          <Button variant="outline" onClick={() => setIsAdmin(false)}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

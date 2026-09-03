import { useState } from "react";
import { useQbr } from "@/contexts/QbrContext";
import { QbrData, RoadmapItem, FeatureStatus, AgentTeam, TeamStatus } from "@/types/qbr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lock, Save, X, Plus, Trash2 } from "lucide-react";

const statusOptions: { value: FeatureStatus; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "public-beta", label: "Public Beta" },
  { value: "private-beta", label: "Private Beta" },
  { value: "upcoming", label: "Upcoming" },
];

const teamStatusOptions: { value: TeamStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "moderate", label: "Moderate" },
  { value: "new", label: "New" },
  { value: "planning", label: "Planning" },
];

export default function AdminPanel() {
  const { data, setData, isAdmin, setIsAdmin } = useQbr();
  const impactTagOptions = data.impactTagOptions ?? [];
  // Quarter dropdown labels reuse the roadmap group titles, e.g. "Q1 2026 (This Quarter)".
  const quarterOptions = (data.quarterOptions ?? []).map((value) => ({
    value,
    label: `${value} (${(data.roadmapGroups ?? []).find((g) => g.matchQuarters.includes(value))?.title ?? ""})`,
  }));
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

  const updateRoadmapItem = (index: number, field: keyof RoadmapItem, value: any) => {
    const items = [...draft.roadmap];
    items[index] = { ...items[index], [field]: value };
    update("roadmap", items);
  };

  const addRoadmapItem = () => {
    update("roadmap", [...draft.roadmap, {
      name: "", quarter: "Q2 2026", status: "upcoming" as FeatureStatus,
      impactTags: [], description: "", videoUrl: "",
    }]);
  };

  const removeRoadmapItem = (index: number) => {
    update("roadmap", draft.roadmap.filter((_, i) => i !== index));
  };

  const toggleImpactTag = (index: number, tag: string) => {
    const items = [...draft.roadmap];
    const tags = items[index].impactTags.includes(tag)
      ? items[index].impactTags.filter(t => t !== tag)
      : [...items[index].impactTags, tag];
    items[index] = { ...items[index], impactTags: tags };
    update("roadmap", items);
  };

  const updateTeam = (index: number, field: keyof AgentTeam, value: any) => {
    const teams = [...(draft.agentTeams ?? [])];
    teams[index] = { ...teams[index], [field]: value };
    update("agentTeams", teams);
  };

  const addTeam = () => {
    update("agentTeams", [...(draft.agentTeams ?? []), { name: "", agentCount: 0, status: "planning" as TeamStatus }]);
  };

  const removeTeam = (index: number) => {
    update("agentTeams", (draft.agentTeams ?? []).filter((_, i) => i !== index));
  };

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

        {/* Teams & Agents */}
        <Card><CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Teams & Agents</CardTitle>
            <Button variant="outline" size="sm" onClick={addTeam}><Plus className="mr-1 h-3 w-3" /> Add Team</Button>
          </div>
        </CardHeader><CardContent className="space-y-4">
          {(draft.agentTeams ?? []).map((team, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder="Team name" className="flex-1" value={team.name} onChange={(e) => updateTeam(i, "name", e.target.value)} />
              <Input type="number" placeholder="Agents" className="w-20" value={team.agentCount} onChange={(e) => updateTeam(i, "agentCount", +e.target.value)} />
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={team.status} onChange={(e) => updateTeam(i, "status", e.target.value)}>
                {teamStatusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <Button variant="ghost" size="sm" onClick={() => removeTeam(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
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

        {/* Deep Dive */}
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

        {/* Product Roadmap */}
        <Card><CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Product Roadmap</CardTitle>
            <Button variant="outline" size="sm" onClick={addRoadmapItem}><Plus className="mr-1 h-3 w-3" /> Add Item</Button>
          </div>
        </CardHeader><CardContent className="space-y-6">
          {draft.roadmap.map((item, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Item {i + 1}</Label>
                <Button variant="ghost" size="sm" onClick={() => removeRoadmapItem(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Feature Name</Label><Input value={item.name} onChange={(e) => updateRoadmapItem(i, "name", e.target.value)} /></div>
                <div><Label>Quarter</Label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={item.quarter} onChange={(e) => updateRoadmapItem(i, "quarter", e.target.value)}>
                    {quarterOptions.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Status</Label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={item.status} onChange={(e) => updateRoadmapItem(i, "status", e.target.value)}>
                  {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div><Label>Business Impact Tags</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {impactTagOptions.map(tag => (
                    <button key={tag} type="button"
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${item.impactTags.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      onClick={() => toggleImpactTag(i, tag)}
                    >{tag}</button>
                  ))}
                </div>
              </div>
              <div><Label>Demo Video URL</Label><Input placeholder="YouTube, Loom embed, or direct .mp4 URL" value={item.videoUrl || ""} onChange={(e) => updateRoadmapItem(i, "videoUrl", e.target.value)} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={item.description} onChange={(e) => updateRoadmapItem(i, "description", e.target.value)} /></div>
            </div>
          ))}
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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Briefcase, Building2, Mail, Phone, ExternalLink, RefreshCw,
  Plus, Trash2, Search, Calendar, Download,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Stage = "qualified" | "outreach" | "meeting" | "proposal" | "won" | "lost";

interface ScoutLead {
  id: string;
  source_partner_id: string | null;
  company_name: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source_url: string | null;
  opportunity_type: string[] | null;
  priority_score: number | null;
  stage: Stage;
  assigned_to: string | null;
  next_action: string | null;
  next_action_at: string | null;
  notes: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

const STAGE_COLORS: Record<Stage, string> = {
  qualified: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  outreach: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  meeting: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  proposal: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  won: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  lost: "bg-muted text-muted-foreground border-border",
};

const STAGES: Stage[] = ["qualified", "outreach", "meeting", "proposal", "won", "lost"];

const emptyForm = {
  company_name: "",
  industry: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  source_url: "",
  next_action: "",
  next_action_at: "",
  notes: "",
};

export default function PartnershipScoutLeadsManager() {
  const [leads, setLeads] = useState<ScoutLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [running, setRunning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("partnership_scout_leads")
      .select("*")
      .order("priority_score", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching leads", description: error.message, variant: "destructive" });
    } else {
      setLeads((data || []) as unknown as ScoutLead[]);
    }
    setLoading(false);
  };

  const runScout = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("partnership-scout", {
        body: { action: "scout" },
      });
      if (error) throw error;
      toast({
        title: "Scout complete",
        description: `${data?.leads_inserted ?? 0} new partner(s) ingested into raw queue.`,
      });
    } catch (err: any) {
      toast({ title: "Scout failed", description: err.message || String(err), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const updateStage = async (id: string, stage: Stage) => {
    const { error } = await supabase
      .from("partnership_scout_leads")
      .update({ stage })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error } = await supabase.from("partnership_scout_leads").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else setLeads(prev => prev.filter(l => l.id !== id));
  };

  const createLead = async () => {
    if (!form.company_name.trim()) {
      toast({ title: "Company name required", variant: "destructive" });
      return;
    }
    const payload: any = {
      company_name: form.company_name.trim(),
      industry: form.industry || null,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      source_url: form.source_url || null,
      next_action: form.next_action || null,
      next_action_at: form.next_action_at || null,
      notes: form.notes || null,
      stage: "qualified",
    };
    const { data, error } = await supabase
      .from("partnership_scout_leads")
      .insert(payload)
      .select()
      .single();
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads(prev => [data as unknown as ScoutLead, ...prev]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "Lead created" });
  };

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matches = !q ||
      l.company_name.toLowerCase().includes(q) ||
      (l.industry || "").toLowerCase().includes(q) ||
      (l.contact_name || "").toLowerCase().includes(q);
    const stageOk = stageFilter === "all" || l.stage === stageFilter;
    return matches && stageOk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Curated Partnership Pipeline
          </h2>
          <p className="text-muted-foreground mt-1">
            Promoted scout leads — track outreach through close
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={runScout} disabled={running}>
            <RefreshCw className={`w-4 h-4 mr-2 ${running ? "animate-spin" : ""}`} />
            Run Scout
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Partnership Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Company *</Label>
                  <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Industry</Label>
                    <Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
                  </div>
                  <div>
                    <Label>Source URL</Label>
                    <Input value={form.source_url} onChange={e => setForm({ ...form, source_url: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Contact name</Label>
                    <Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Contact email</Label>
                    <Input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Contact phone</Label>
                  <Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Next action</Label>
                    <Input value={form.next_action} onChange={e => setForm({ ...form, next_action: e.target.value })} />
                  </div>
                  <div>
                    <Label>Next action at</Label>
                    <Input type="datetime-local" value={form.next_action_at} onChange={e => setForm({ ...form, next_action_at: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={createLead}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search company, industry, contact..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={leads.length} />
        <StatCard label="In outreach" value={leads.filter(l => l.stage === "outreach" || l.stage === "meeting").length} />
        <StatCard label="Proposals" value={leads.filter(l => l.stage === "proposal").length} />
        <StatCard label="Won" value={leads.filter(l => l.stage === "won").length} valueClass="text-emerald-500" />
      </div>

      {/* Pipeline */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
          No curated leads yet. Run the scout or add a lead manually.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <div key={lead.id} className="bg-card rounded-lg border p-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold truncate">{lead.company_name}</h3>
                    <Badge className={STAGE_COLORS[lead.stage]}>
                      {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                    </Badge>
                    {lead.priority_score != null && (
                      <Badge variant="outline">
                        Score {Number(lead.priority_score).toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {lead.industry && (
                      <Badge variant="outline">
                        <Building2 className="w-3 h-3 mr-1" />{lead.industry}
                      </Badge>
                    )}
                    {(lead.opportunity_type || []).map(t => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {lead.contact_name && <span>{lead.contact_name}</span>}
                    {lead.contact_email && (
                      <a href={`mailto:${lead.contact_email}`} className="flex items-center gap-1 hover:text-foreground">
                        <Mail className="w-3.5 h-3.5" />{lead.contact_email}
                      </a>
                    )}
                    {lead.contact_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />{lead.contact_phone}
                      </span>
                    )}
                    {lead.next_action_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />{new Date(lead.next_action_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {lead.next_action && (
                    <p className="text-sm mt-2"><span className="text-muted-foreground">Next: </span>{lead.next_action}</p>
                  )}
                  {lead.notes && (
                    <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{lead.notes}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 lg:w-[160px]">
                  <Select value={lead.stage} onValueChange={(v) => updateStage(lead.id, v as Stage)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {lead.source_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={lead.source_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />Source
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteLead(lead.id)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, valueClass = "" }: { label: string; value: number; valueClass?: string }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Pause, Play, TrendingUp, Sparkles, Check, X, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Campaign {
  id: string; name: string; status: string; objective: string | null;
  daily_budget: number | null; spend: number; impressions: number; clicks: number;
  ctr: number; cpl: number; leads_count: number; last_synced_at: string | null;
}
interface OptAction {
  id: string; target_type: string; target_id: string; action_type: string;
  reasoning: string; proposed_value: Record<string, unknown>; status: string; created_at: string;
}

export default function MetaAdsPanel() {
  const [tab, setTab] = useState<"campaigns" | "recommendations">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [actions, setActions] = useState<OptAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [budgetEdits, setBudgetEdits] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: c }, { data: a }] = await Promise.all([
      supabase.from("meta_campaigns").select("*").order("spend", { ascending: false }),
      supabase.from("mia_optimizer_actions").select("*").eq("status", "suggested").order("created_at", { ascending: false }),
    ]);
    if (c) setCampaigns(c as Campaign[]);
    if (a) setActions(a as OptAction[]);
  };

  useEffect(() => { load(); }, []);

  const sync = async () => {
    setSyncing(true);
    const { error } = await supabase.functions.invoke("meta-sync");
    setSyncing(false);
    if (error) toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Meta data synced" }); load(); }
  };

  const runOptimizer = async () => {
    setOptimizing(true);
    const { error } = await supabase.functions.invoke("mia-ad-optimizer");
    setOptimizing(false);
    if (error) toast({ title: "Optimizer failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Mia generated recommendations" }); load(); }
  };

  const subscribePage = async () => {
    const { data, error } = await supabase.functions.invoke("meta-ads-manager", { body: { action: "subscribe_page", params: {} } });
    if (error) toast({ title: "Subscribe failed", description: error.message, variant: "destructive" });
    else toast({ title: "Page subscribed", description: JSON.stringify(data) });
  };

  const callManager = async (action: string, params: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("meta-ads-manager", { body: { action, params } });
    if (error || data?.error) {
      toast({ title: "Action failed", description: error?.message ?? JSON.stringify(data?.error), variant: "destructive" });
      return false;
    }
    return true;
  };

  const toggleCampaign = async (c: Campaign) => {
    const ok = await callManager(c.status === "ACTIVE" ? "pause_campaign" : "resume_campaign", { campaign_id: c.id });
    if (ok) { toast({ title: `Campaign ${c.status === "ACTIVE" ? "paused" : "resumed"}` }); sync(); }
  };

  const updateBudget = async (c: Campaign) => {
    const v = budgetEdits[c.id];
    if (!v) return;
    const ok = await callManager("update_budget", { campaign_id: c.id, daily_budget: Number(v) });
    if (ok) { toast({ title: "Budget updated" }); sync(); setBudgetEdits((p) => ({ ...p, [c.id]: "" })); }
  };

  const applyAction = async (a: OptAction) => {
    let ok = false;
    if (a.action_type === "pause") ok = await callManager(a.target_type === "campaign" ? "pause_campaign" : "pause_ad", { campaign_id: a.target_id, ad_id: a.target_id });
    else if (a.action_type === "resume") ok = await callManager(a.target_type === "campaign" ? "resume_campaign" : "resume_ad", { campaign_id: a.target_id, ad_id: a.target_id });
    else if (a.action_type === "increase_budget" || a.action_type === "decrease_budget") {
      const newBudget = a.proposed_value?.daily_budget;
      if (!newBudget) { toast({ title: "No budget value in recommendation", variant: "destructive" }); return; }
      ok = await callManager("update_budget", { campaign_id: a.target_id, daily_budget: newBudget });
    }
    if (ok) {
      await supabase.from("mia_optimizer_actions").update({ status: "applied", applied_at: new Date().toISOString() }).eq("id", a.id);
      toast({ title: "Action applied" });
      load();
    }
  };

  const rejectAction = async (a: OptAction) => {
    await supabase.from("mia_optimizer_actions").update({ status: "rejected" }).eq("id", a.id);
    load();
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <h2 className="font-display text-xl text-foreground">Meta Ads</h2>
          <Badge variant="outline" className="border-border text-[10px]">{campaigns.length} campaigns</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={subscribePage} className="gap-2 border-border"><Link2 size={14} />Subscribe Page</Button>
          <Button size="sm" variant="outline" onClick={sync} disabled={syncing} className="gap-2 border-border">
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Sync
          </Button>
          <Button size="sm" onClick={runOptimizer} disabled={optimizing} className="bg-gradient-gold text-primary-foreground gap-2">
            {optimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Run Mia Optimizer
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border pb-3">
        <Button variant={tab === "campaigns" ? "default" : "ghost"} size="sm" onClick={() => setTab("campaigns")}
          className={tab === "campaigns" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground"}>
          Campaigns
        </Button>
        <Button variant={tab === "recommendations" ? "default" : "ghost"} size="sm" onClick={() => setTab("recommendations")}
          className={tab === "recommendations" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground"}>
          Mia Recommendations <Badge variant="outline" className="ml-2 border-border text-[10px]">{actions.length}</Badge>
        </Button>
      </div>

      {tab === "campaigns" ? (
        campaigns.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <TrendingUp size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No campaigns synced yet. Press Sync.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-foreground truncate">{c.name}</span>
                      <Badge variant="outline" className={`text-[9px] tracking-widest uppercase ${c.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                        {c.status}
                      </Badge>
                      {c.objective && <Badge variant="outline" className="text-[9px] tracking-widest uppercase border-border">{c.objective}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                      <span>Spend ${fmt(c.spend)}</span>
                      <span>Leads {c.leads_count}</span>
                      <span>CPL ${fmt(c.cpl)}</span>
                      <span>CTR {fmt(c.ctr)}%</span>
                      <span>Impr {fmt(c.impressions)}</span>
                      <span>Clicks {fmt(c.clicks)}</span>
                      <span>Budget ${c.daily_budget ?? "—"}/day</span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number" placeholder="New $/day"
                      value={budgetEdits[c.id] ?? ""}
                      onChange={(e) => setBudgetEdits((p) => ({ ...p, [c.id]: e.target.value }))}
                      className="h-8 w-28 text-xs bg-background border-border"
                    />
                    <Button size="sm" variant="outline" onClick={() => updateBudget(c)} className="h-8 border-border text-xs">Set</Button>
                    <Button size="sm" variant="outline" onClick={() => toggleCampaign(c)} className="h-8 border-border">
                      {c.status === "ACTIVE" ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : actions.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Sparkles size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No pending recommendations. Run Mia Optimizer.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] tracking-widest uppercase">{a.action_type.replace("_", " ")}</Badge>
                    <Badge variant="outline" className="border-border text-[9px] tracking-widest uppercase">{a.target_type}</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{a.target_id}</span>
                  </div>
                  <p className="text-sm text-foreground">{a.reasoning}</p>
                  {a.proposed_value && Object.keys(a.proposed_value).length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">{JSON.stringify(a.proposed_value)}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => applyAction(a)} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 gap-1 h-8">
                    <Check size={14} /> Apply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectAction(a)} className="border-border h-8 gap-1">
                    <X size={14} /> Reject
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

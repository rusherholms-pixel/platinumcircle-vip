import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MiaLead {
  id: string;
  lead_name: string;
  email: string | null;
  phone: string | null;
  interest: string | null;
  timeline: string | null;
  group_size: string | null;
  conversation_summary: string | null;
  escalation_reason: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  converted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function MiaLeadsManager() {
  const [leads, setLeads] = useState<MiaLead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase
      .from("mia_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLeads(data as MiaLead[]);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("mia_leads").update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast({ title: `Lead status updated to ${status}` });
  };

  const saveNotes = async (id: string) => {
    const notes = editingNotes[id];
    if (notes === undefined) return;
    await supabase.from("mia_leads").update({ notes }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
    toast({ title: "Notes saved" });
  };

  const filtered = leads.filter((l) =>
    l.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-primary" />
        <h2 className="font-display text-xl text-foreground">Mia Leads</h2>
        <Badge variant="outline" className="border-border text-[10px]">{leads.length}</Badge>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads…"
          className="h-10 pl-9 bg-card border-border"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Sparkles size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No leads from Mia yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-foreground">{lead.lead_name}</span>
                    <Badge variant="outline" className={`${STATUS_COLORS[lead.status]} text-[9px] tracking-widest uppercase`}>
                      {lead.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.interest || "No interest specified"} · {lead.email || lead.phone || "No contact"}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</span>
                {expandedId === lead.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              {expandedId === lead.id && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Email</p>
                      <p className="text-foreground">{lead.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Phone</p>
                      <p className="text-foreground">{lead.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Interest</p>
                      <p className="text-foreground">{lead.interest || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Timeline</p>
                      <p className="text-foreground">{lead.timeline || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Group Size</p>
                      <p className="text-foreground">{lead.group_size || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Escalation Reason</p>
                      <p className="text-foreground">{lead.escalation_reason || "—"}</p>
                    </div>
                  </div>

                  {lead.conversation_summary && (
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Conversation Summary</p>
                      <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{lead.conversation_summary}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Notes</p>
                    <Textarea
                      value={editingNotes[lead.id] ?? lead.notes ?? ""}
                      onChange={(e) => setEditingNotes((p) => ({ ...p, [lead.id]: e.target.value }))}
                      placeholder="Add follow-up notes…"
                      className="text-sm bg-background border-border resize-none h-20"
                    />
                    <Button size="sm" onClick={() => saveNotes(lead.id)} className="mt-2 text-xs">
                      Save Notes
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mr-2">Status:</p>
                    <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                      <SelectTrigger className="h-8 text-xs w-32 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

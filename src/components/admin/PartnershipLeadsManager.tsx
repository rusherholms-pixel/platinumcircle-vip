import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Briefcase, Building2, Phone, Clock, RefreshCw, Download, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PartnershipLead {
  id: string;
  company_name: string;
  industry: string;
  opportunity_type: string[];
  priority_score: number;
  contact_hint: string;
  status: "new" | "researching" | "contacted" | "negotiating" | "closed";
  extracted_at: string;
  raw_opportunity: {
    title: string;
    summary: string;
    link: string;
    keywords_matched: string[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  researching: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  negotiating: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  closed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default function PartnershipLeadsManager() {
  const [leads, setLeads] = useState<PartnershipLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchLeads, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("partners_raw")
        .select("*")
        .eq("source_route", "platinum_circle")
        .order("priority_score", { ascending: false })
        .order("extracted_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeads((data || []) as unknown as PartnershipLead[]);
    } catch (err) {
      toast({ title: "Error fetching leads", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from("partners_raw")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
      toast({ title: "Status updated" });
    } catch (err) {
      toast({ title: "Update failed", description: String(err), variant: "destructive" });
    }
  };

  const promoteLead = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("partnership-scout", {
        body: { action: "promote", partner_id: id },
      });
      if (error) throw error;
      toast({ title: "Promoted to pipeline", description: data?.lead?.company_name });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: "researching" as any } : l));
    } catch (err: any) {
      toast({ title: "Promote failed", description: err.message || String(err), variant: "destructive" });
    }
  };

  const exportLeads = () => {
    const csv = leads.map(l => 
      `${l.company_name},${l.industry},"${l.opportunity_type.join('; ')}",${l.priority_score},${l.status}`
    ).join("\n");
    const blob = new Blob([`Company,Industry,Type,Priority,Status\n${csv}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partnership-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = !searchQuery || 
      l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityLabel = (score: number) => {
    if (score >= 0.8) return "high";
    if (score >= 0.6) return "medium";
    return "low";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Partnership Leads
          </h2>
          <p className="text-muted-foreground mt-1">
            Insurance &amp; Relocation Opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLeads}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? null : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="researching">Researching</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{leads.length}</div>
          <div className="text-sm text-muted-foreground">Total Leads</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-500">
            {leads.filter(l => l.priority_score >= 0.8).length}
          </div>
          <div className="text-sm text-muted-foreground">High Priority</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-500">
            {leads.filter(l => l.status !== "new").length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-emerald-500">
            {leads.filter(l => {
              const daysAgo = (Date.now() - new Date(l.extracted_at).getTime()) / 86400000;
              return daysAgo <= 7;
            }).length}
          </div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No leads found. Run the scout agent to populate data.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-card rounded-lg border p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{lead.company_name}</h3>
                    <Badge className={PRIORITY_COLORS[getPriorityLabel(lead.priority_score)]}>
                      {getPriorityLabel(lead.priority_score)} Priority
                    </Badge>
                    <Badge className={STATUS_COLORS[lead.status]}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">
                      <Building2 className="w-3 h-3 mr-1" />
                      {lead.industry}
                    </Badge>
                    {lead.opportunity_type?.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm font-medium">{lead.raw_opportunity?.title}</p>
                  <p className="text-sm text-muted-foreground">{lead.raw_opportunity?.summary}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {lead.contact_hint?.split(";")[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(lead.extracted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="default" size="sm" onClick={() => promoteLead(lead.id)}>
                    <Star className="w-3.5 h-3.5 mr-1.5" />
                    Promote
                  </Button>
                  {lead.raw_opportunity?.link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={lead.raw_opportunity.link} target="_blank" rel="noopener noreferrer">
                        View Source
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

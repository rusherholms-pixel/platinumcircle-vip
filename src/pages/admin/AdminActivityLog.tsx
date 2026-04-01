import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  admin_id: string;
  action_type: string;
  action_description: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  admin_name?: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-400 border-red-500/20",
  status_change: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  login: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  role_change: "bg-primary/10 text-primary border-primary/20",
};

const PAGE_SIZE = 25;

export default function AdminActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [actionTypes, setActionTypes] = useState<string[]>([]);

  const fetchLogs = async () => {
    setLoading(true);

    let query = (supabase.from("admin_activity_logs" as any) as any)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filterType !== "all") {
      query = query.eq("action_type", filterType);
    }
    if (search.trim()) {
      query = query.ilike("action_description", `%${search.trim()}%`);
    }

    const { data, count } = await query;
    setTotal(count || 0);

    if (data && data.length > 0) {
      const adminIds = [...new Set(data.map((d: any) => d.admin_id))] as string[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", adminIds);

      const enriched = data.map((log: any) => ({
        ...log,
        admin_name: profiles?.find((p) => p.id === log.admin_id)?.full_name || "Unknown",
      }));
      setLogs(enriched);
    } else {
      setLogs([]);
    }
    setLoading(false);
  };

  const fetchActionTypes = async () => {
    const { data } = await (supabase.from("admin_activity_logs" as any) as any)
      .select("action_type")
      .order("action_type");
    if (data) {
      const unique = [...new Set(data.map((d: any) => d.action_type))] as string[];
      setActionTypes(unique);
    }
  };

  useEffect(() => { fetchActionTypes(); }, []);
  useEffect(() => { fetchLogs(); }, [page, filterType, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getActionColor = (type: string) => {
    const key = Object.keys(ACTION_COLORS).find((k) => type.includes(k));
    return key ? ACTION_COLORS[key] : "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all admin actions across the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search activity..."
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actionTypes.map((t) => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Log list */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            {total} {total === 1 ? "entry" : "entries"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No activity recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{log.action_description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-[9px] tracking-wider uppercase ${getActionColor(log.action_type)}`}>
                        {log.action_type.replace(/_/g, " ")}
                      </Badge>
                      {log.target_type && (
                        <span className="text-[10px] text-muted-foreground">
                          {log.target_type}{log.target_id ? ` #${log.target_id.slice(0, 8)}` : ""}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">by {log.admin_name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {format(new Date(log.created_at), "MMM d, yyyy · h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

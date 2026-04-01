import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Home, Users, FileText, ClipboardList, Sparkles, MessageSquare,
  TrendingUp, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Stats {
  activeListings: number;
  totalMembers: number;
  pendingApplications: number;
  openRequests: number;
  newLeads24h: number;
  unreadMessages: number;
}

interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  type: "listing" | "member" | "booking" | "lead" | "message";
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [listings, profiles, apps, bookings, leads, conversations] = await Promise.all([
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("mia_leads").select("id, created_at", { count: "exact" }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]);

    setStats({
      activeListings: listings.count || 0,
      totalMembers: profiles.count || 0,
      pendingApplications: apps.count || 0,
      openRequests: bookings.count || 0,
      newLeads24h: leads.count || 0,
      unreadMessages: conversations.count || 0,
    });

    // Build recent activity from multiple sources
    const items: ActivityItem[] = [];

    const { data: recentBookings } = await supabase
      .from("booking_requests")
      .select("id, service_title, service_type, created_at")
      .order("created_at", { ascending: false })
      .limit(4);
    recentBookings?.forEach((b) =>
      items.push({
        id: b.id,
        action: "New booking request",
        detail: `${b.service_title} (${b.service_type})`,
        timestamp: b.created_at,
        type: "booking",
      })
    );

    const { data: recentLeads } = await supabase
      .from("mia_leads")
      .select("id, lead_name, interest, created_at")
      .order("created_at", { ascending: false })
      .limit(3);
    recentLeads?.forEach((l) =>
      items.push({
        id: l.id,
        action: "Mia lead captured",
        detail: `${l.lead_name} — ${l.interest || "General inquiry"}`,
        timestamp: l.created_at,
        type: "lead",
      })
    );

    const { data: recentApps } = await supabase
      .from("applications")
      .select("id, full_name, applicant_type, created_at")
      .order("created_at", { ascending: false })
      .limit(3);
    recentApps?.forEach((a) =>
      items.push({
        id: a.id,
        action: `New ${a.applicant_type} application`,
        detail: a.full_name,
        timestamp: a.created_at,
        type: "member",
      })
    );

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivity(items.slice(0, 10));
    setLoading(false);
  };

  const statCards = stats
    ? [
        { label: "Active Listings", value: stats.activeListings, icon: Home, cls: "text-primary" },
        { label: "Members", value: stats.totalMembers, icon: Users, cls: "text-emerald-500" },
        { label: "Pending Applications", value: stats.pendingApplications, icon: FileText, cls: "text-yellow-500" },
        { label: "Open Requests", value: stats.openRequests, icon: ClipboardList, cls: "text-blue-500" },
        { label: "Mia Leads (24h)", value: stats.newLeads24h, icon: Sparkles, cls: "text-purple-500" },
        { label: "Unread Messages", value: stats.unreadMessages, icon: MessageSquare, cls: "text-rose-500" },
      ]
    : [];

  const typeIcons: Record<string, React.ElementType> = {
    listing: Home,
    member: Users,
    booking: ClipboardList,
    lead: Sparkles,
    message: MessageSquare,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 flex items-center gap-2">
          <TrendingUp size={14} /> Overview
        </p>
        <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 bg-card border border-border rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.cls} />
              <span className="text-[10px] tracking-widest uppercase text-muted-foreground">{s.label}</span>
            </div>
            <p className={`font-display text-3xl ${s.cls}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          <h2 className="font-display text-lg text-foreground">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity</p>
          ) : (
            activity.map((item) => {
              const Icon = typeIcons[item.type] || Activity;
              return (
                <div key={`${item.type}-${item.id}`} className="px-5 py-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(item.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

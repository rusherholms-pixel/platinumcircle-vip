import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ClipboardList, Search, Filter, Home, Shield, Car, Sparkles,
  Calendar, Users, ChevronDown, ChevronUp, Loader2, MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface BookingRequest {
  id: string;
  user_id: string;
  service_type: string;
  service_title: string;
  check_in: string | null;
  check_out: string | null;
  num_guests: number;
  special_requests: string | null;
  preferred_contact: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

const serviceIcons: Record<string, React.ElementType> = {
  housing: Home, security: Shield, drivers: Car, experiences: Sparkles,
};

const statusOptions = ["pending", "confirmed", "completed", "cancelled"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BookingRequestsManager() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [profilesMap, setProfilesMap] = useState<Record<string, Profile>>({});

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      const bookingsData = data as BookingRequest[];
      setBookings(bookingsData);

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(bookingsData.map((b) => b.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", userIds);
        if (profiles) {
          const map: Record<string, Profile> = {};
          (profiles as Profile[]).forEach((p) => { map[p.id] = p; });
          setProfilesMap(map);
        }
      }
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const notes = editNotes[id];
    const updateObj: Record<string, unknown> = { status: newStatus };
    if (notes !== undefined) updateObj.admin_notes = notes;

    const booking = bookings.find((b) => b.id === id);
    const { error } = await supabase.from("booking_requests").update(updateObj).eq("id", id);
    setUpdatingId(null);

    if (error) {
      toast({ title: "Error updating booking", variant: "destructive" });
    } else {
      toast({ title: `Booking ${newStatus}` });
      setBookings((prev) => prev.map((b) =>
        b.id === id ? { ...b, status: newStatus, admin_notes: notes ?? b.admin_notes } : b
      ));

      // Send confirmation email when status changes to confirmed
      if (newStatus === "confirmed" && booking) {
        const profile = profilesMap[booking.user_id];
        if (profile?.email) {
          supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "booking-confirmation",
              recipientEmail: profile.email,
              idempotencyKey: `booking-confirm-${id}`,
              templateData: {
                memberName: profile.full_name || undefined,
                serviceTitle: booking.service_title,
                serviceType: booking.service_type,
                checkIn: booking.check_in || undefined,
                checkOut: booking.check_out || undefined,
                numGuests: booking.num_guests,
                adminNotes: (notes ?? booking.admin_notes) || undefined,
              },
            },
          }).then(({ error: emailError }) => {
            if (emailError) console.error("Failed to send confirmation email", emailError);
          });
        }
      }
    }
  };

  const saveNotes = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from("booking_requests").update({ admin_notes: editNotes[id] || "" }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Error saving notes", variant: "destructive" });
    } else {
      toast({ title: "Notes saved" });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, admin_notes: editNotes[id] || "" } : b));
    }
  };

  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const profile = profilesMap[b.user_id];
    const matchesSearch = !q ||
      b.service_title.toLowerCase().includes(q) ||
      profile?.full_name?.toLowerCase().includes(q) ||
      profile?.email?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesType = typeFilter === "all" || b.service_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: ClipboardList, cls: "text-foreground" },
          { label: "Pending", value: stats.pending, icon: Calendar, cls: "text-yellow-500" },
          { label: "Confirmed", value: stats.confirmed, icon: Calendar, cls: "text-emerald-500" },
          { label: "Completed", value: stats.completed, icon: Calendar, cls: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.cls} />
              <span className="text-xs tracking-widest uppercase text-muted-foreground">{s.label}</span>
            </div>
            <p className={`font-display text-2xl ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, email, or service..." className="bg-card border-border h-11 pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-card border-border h-11 w-40">
            <Filter size={14} className="mr-2 text-muted-foreground" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-card border-border h-11 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="housing">Housing</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="drivers">Drivers</SelectItem>
            <SelectItem value="experiences">Experiences</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Booking list */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <ClipboardList size={40} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No booking requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => {
            const Icon = serviceIcons[booking.service_type] || ClipboardList;
            const isExpanded = expandedId === booking.id;
            const profile = profilesMap[booking.user_id];
            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0"><Icon size={18} className="text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-display text-lg text-foreground truncate">{booking.service_title}</h3>
                      <Badge variant="outline" className="border-border text-[10px] tracking-widest uppercase">{booking.service_type}</Badge>
                      <Badge variant="outline" className={`${statusColors[booking.status]} text-[10px] tracking-widest uppercase`}>{booking.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {profile?.full_name || "Unknown"} · {profile?.email || "—"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block shrink-0">{new Date(booking.created_at).toLocaleDateString()}</span>
                  {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                </div>

                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <Detail label="Member" value={profile?.full_name || "Unknown"} />
                      <Detail label="Email" value={profile?.email || "—"} />
                      <Detail label="Phone" value={profile?.phone || "—"} />
                      <Detail label="Dates" value={
                        booking.check_in
                          ? `${new Date(booking.check_in).toLocaleDateString()}${booking.check_out ? ` — ${new Date(booking.check_out).toLocaleDateString()}` : ""}`
                          : "—"
                      } />
                      <Detail label="Guests" value={String(booking.num_guests)} />
                      <Detail label="Preferred Contact" value={booking.preferred_contact || "email"} />
                    </div>

                    {booking.special_requests && (
                      <div className="border-t border-border pt-4">
                        <Detail label="Special Requests" value={booking.special_requests} />
                      </div>
                    )}

                    {/* Admin notes */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <label className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                        <MessageSquare size={12} /> Admin Notes
                      </label>
                      <Textarea
                        value={editNotes[booking.id] ?? booking.admin_notes ?? ""}
                        onChange={(e) => setEditNotes({ ...editNotes, [booking.id]: e.target.value })}
                        placeholder="Add internal notes about this booking..."
                        className="bg-secondary border-border resize-none"
                        rows={2}
                        maxLength={1000}
                      />
                      {editNotes[booking.id] !== undefined && editNotes[booking.id] !== (booking.admin_notes ?? "") && (
                        <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => saveNotes(booking.id)} disabled={updatingId === booking.id}>
                          {updatingId === booking.id ? <Loader2 size={12} className="animate-spin mr-1" /> : null} Save Notes
                        </Button>
                      )}
                    </div>

                    {/* Status actions */}
                    <div className="border-t border-border pt-4">
                      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.filter((s) => s !== booking.status).map((s) => {
                          const btnColors: Record<string, string> = {
                            confirmed: "bg-emerald-600 hover:bg-emerald-700 text-foreground",
                            completed: "bg-primary hover:bg-primary/90 text-primary-foreground",
                            cancelled: "bg-destructive/80 hover:bg-destructive text-destructive-foreground",
                            pending: "bg-yellow-600 hover:bg-yellow-700 text-foreground",
                          };
                          return (
                            <Button
                              key={s} size="sm"
                              className={`${btnColors[s]} text-xs tracking-widest uppercase gap-1.5`}
                              onClick={() => updateStatus(booking.id, s)}
                              disabled={updatingId === booking.id}
                            >
                              {updatingId === booking.id ? <Loader2 size={12} className="animate-spin" /> : null}
                              {s === "confirmed" ? "Confirm" : s === "completed" ? "Complete" : s === "cancelled" ? "Cancel" : "Set Pending"}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">{label}</p>
    <p className="text-foreground">{value}</p>
  </div>
);

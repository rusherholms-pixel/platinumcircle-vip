import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Users, Search, Filter, UserPlus, ShieldAlert, Trash2, MessageSquare,
  Eye, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  account_status: string;
  restriction_type: string | null;
  restriction_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  avatar_url: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  restricted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-muted text-muted-foreground border-border",
};

export default function AdminMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  // Create member
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: "", email: "", country: "", city: "" });
  const [creating, setCreating] = useState(false);

  // Restrict member
  const [restrictId, setRestrictId] = useState<string | null>(null);
  const [restrictType, setRestrictType] = useState("booking_restricted");
  const [restrictReason, setRestrictReason] = useState("");

  // Delete member
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");

  // Notes
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    // Get all member role user IDs
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "member");

    if (!roleData?.length) { setLoading(false); return; }

    const memberIds = roleData.map((r) => r.user_id);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("id", memberIds)
      .order("created_at", { ascending: false });

    if (data) setMembers(data as Member[]);
    setLoading(false);
  };

  const handleRestrict = async () => {
    if (!restrictId) return;
    await supabase.from("profiles").update({
      account_status: "restricted",
      restriction_type: restrictType,
      restriction_reason: restrictReason,
    }).eq("id", restrictId);
    setMembers((prev) =>
      prev.map((m) => m.id === restrictId ? { ...m, account_status: "restricted", restriction_type: restrictType, restriction_reason: restrictReason } : m)
    );
    toast({ title: "Member restricted" });
    setRestrictId(null);
    setRestrictReason("");
  };

  const handleUnrestrict = async (id: string) => {
    await supabase.from("profiles").update({
      account_status: "active",
      restriction_type: null,
      restriction_reason: null,
      restriction_expires_at: null,
    }).eq("id", id);
    setMembers((prev) =>
      prev.map((m) => m.id === id ? { ...m, account_status: "active", restriction_type: null, restriction_reason: null } : m)
    );
    toast({ title: "Member unrestricted" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const member = members.find((m) => m.id === deleteId);
    if (deleteConfirmEmail !== member?.email) {
      toast({ title: "Email does not match", variant: "destructive" });
      return;
    }
    // Delete role and profile (cascade would handle auth user in real setup)
    await supabase.from("user_roles").delete().eq("user_id", deleteId);
    await supabase.from("profiles").delete().eq("id", deleteId);
    setMembers((prev) => prev.filter((m) => m.id !== deleteId));
    toast({ title: "Member deleted" });
    setDeleteId(null);
    setDeleteConfirmEmail("");
  };

  const saveNotes = async (id: string) => {
    await supabase.from("profiles").update({ admin_notes: editingNotes[id] || "" }).eq("id", id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, admin_notes: editingNotes[id] || "" } : m));
    toast({ title: "Notes saved" });
  };

  const filtered = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || (m.account_status || "active") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 flex items-center gap-2">
            <Users size={14} /> Members
          </p>
          <h1 className="font-display text-3xl text-foreground">Member Management</h1>
        </div>
        <Button className="bg-gradient-gold text-primary-foreground gap-2" onClick={() => setCreateOpen(true)}>
          <UserPlus size={16} /> Create Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email…" className="bg-card border-border h-11 pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-card border-border h-11 w-40">
            <Filter size={14} className="mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <Users size={40} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No members found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((member, i) => {
            const isExpanded = expandedId === member.id;
            const status = member.account_status || "active";
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : member.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">{member.full_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-foreground truncate">{member.full_name}</span>
                      <Badge variant="outline" className={`${STATUS_COLORS[status]} text-[9px] tracking-widest uppercase`}>{status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{member.email} · {[member.city, member.country].filter(Boolean).join(", ") || "—"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{new Date(member.created_at).toLocaleDateString()}</span>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <Detail label="Email" value={member.email} />
                      <Detail label="Phone" value={member.phone || "—"} />
                      <Detail label="Country" value={member.country || "—"} />
                      <Detail label="City" value={member.city || "—"} />
                      <Detail label="Joined" value={new Date(member.created_at).toLocaleDateString()} />
                      <Detail label="Status" value={status} />
                    </div>

                    {member.restriction_type && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                        <p className="text-xs text-yellow-500 font-semibold mb-1">Restriction: {member.restriction_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{member.restriction_reason || "No reason specified"}</p>
                      </div>
                    )}

                    {/* Admin notes */}
                    <div>
                      <Label className="text-[10px] tracking-widest uppercase text-muted-foreground">Admin Notes (internal only)</Label>
                      <Textarea
                        value={editingNotes[member.id] ?? member.admin_notes ?? ""}
                        onChange={(e) => setEditingNotes((p) => ({ ...p, [member.id]: e.target.value }))}
                        className="bg-secondary border-border mt-1 text-sm resize-none h-16"
                        placeholder="Internal notes about this member…"
                      />
                      {editingNotes[member.id] !== undefined && editingNotes[member.id] !== (member.admin_notes ?? "") && (
                        <Button size="sm" variant="outline" className="mt-2 text-xs border-border" onClick={() => saveNotes(member.id)}>
                          Save Notes
                        </Button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {status === "active" ? (
                        <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-500 gap-1.5 text-xs" onClick={() => setRestrictId(member.id)}>
                          <ShieldAlert size={12} /> Restrict
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-500 gap-1.5 text-xs" onClick={() => handleUnrestrict(member.id)}>
                          Unrestrict
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive gap-1.5 text-xs" onClick={() => { setDeleteId(member.id); setDeleteConfirmEmail(""); }}>
                        <Trash2 size={12} /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="border-border text-xs">Previous</Button>
          <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="border-border text-xs">Next</Button>
        </div>
      )}

      {/* Create Member dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Create Member Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name *</Label>
              <Input value={createForm.full_name} onChange={(e) => setCreateForm((p) => ({ ...p, full_name: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} className="bg-secondary border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Country *</Label>
                <Input value={createForm.country} onChange={(e) => setCreateForm((p) => ({ ...p, country: e.target.value }))} className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">City *</Label>
                <Input value={createForm.city} onChange={(e) => setCreateForm((p) => ({ ...p, city: e.target.value }))} className="bg-secondary border-border mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-border" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-gold text-primary-foreground"
              disabled={creating || !createForm.full_name || !createForm.email}
              onClick={async () => {
                setCreating(true);
                // Create profile entry (actual auth invite would need admin API)
                const { error } = await supabase.from("profiles").insert({
                  id: crypto.randomUUID(),
                  full_name: createForm.full_name,
                  email: createForm.email,
                  country: createForm.country,
                  city: createForm.city,
                });
                setCreating(false);
                if (error) {
                  toast({ title: "Failed to create member", description: error.message, variant: "destructive" });
                } else {
                  toast({ title: "Member profile created" });
                  setCreateOpen(false);
                  setCreateForm({ full_name: "", email: "", country: "", city: "" });
                  fetchMembers();
                }
              }}
            >
              {creating && <Loader2 size={14} className="animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restrict dialog */}
      <Dialog open={!!restrictId} onOpenChange={(open) => !open && setRestrictId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Restrict Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Restriction Type</Label>
              <Select value={restrictType} onValueChange={setRestrictType}>
                <SelectTrigger className="border-border mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking_restricted">Booking Restricted</SelectItem>
                  <SelectItem value="read_only">Read-Only Access</SelectItem>
                  <SelectItem value="login_restricted">Login Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reason (internal)</Label>
              <Textarea value={restrictReason} onChange={(e) => setRestrictReason(e.target.value)} className="bg-secondary border-border mt-1" placeholder="Reason for restriction…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-border" onClick={() => setRestrictId(null)}>Cancel</Button>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-foreground" onClick={handleRestrict}>Apply Restriction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Member Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Type the member's email to confirm deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmEmail}
            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            placeholder="Type member email to confirm…"
            className="bg-secondary border-border"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmEmail !== members.find((m) => m.id === deleteId)?.email}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">{label}</p>
    <p className="text-foreground text-sm">{value}</p>
  </div>
);

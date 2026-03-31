import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users, FileText, CheckCircle, XCircle, Clock, LogOut,
  ChevronDown, ChevronUp, Search, Filter, LayoutDashboard, Image, MessageSquare, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import HomepageContentManager from "@/components/admin/HomepageContentManager";
import BookingRequestsManager from "@/components/admin/BookingRequestsManager";
import ConciergeInbox from "@/components/admin/ConciergeInbox";
import MiaLeadsManager from "@/components/admin/MiaLeadsManager";

interface Application {
  id: string;
  applicant_type: string;
  status: string;
  reference_number: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  traveler_status: string[];
  personal_statement: string | null;
  heard_about_us: string | null;
  preferred_services: string[];
  travel_frequency: string | null;
  travel_party_size: string | null;
  service_categories: string[];
  years_experience: number | null;
  business_type: string | null;
  business_name: string | null;
  service_countries: string[];
  service_cities: string | null;
  service_description: string | null;
  portfolio_url: string | null;
  created_at: string;
}

type AdminTab = "applications" | "homepage" | "bookings" | "inbox" | "mia-leads";

const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("applications");

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionDialog, setActionDialog] = useState<{ id: string; action: "approved" | "declined" } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .eq("role", "admin")
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      fetchApplications();
    }
    setChecking(false);
  };

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setApplications(data as Application[]);
    setLoading(false);
  };

  const handleAction = async (id: string, action: "approved" | "declined") => {
    const { error } = await supabase
      .from("applications")
      .update({ status: action, reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${action}` });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: action } : a)));
    }
    setActionDialog(null);
  };

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reference_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesType = typeFilter === "all" || a.applicant_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    declined: applications.filter((a) => a.status === "declined").length,
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have admin privileges.</p>
          <Link to="/"><Button variant="outline" className="border-border">Return Home</Button></Link>
        </div>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      declined: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <Badge variant="outline" className={`${map[status]} text-[10px] tracking-widest uppercase`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-wider text-gradient-gold">
            Platinum Circle
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px] tracking-widest uppercase">
              Admin
            </Badge>
            <Button
              variant="ghost" size="icon"
              onClick={() => { signOut(); navigate("/"); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans flex items-center gap-2">
            <Users size={14} /> Admin Panel
          </p>
          <h1 className="font-display text-4xl text-foreground">Dashboard</h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          <Button
            variant={activeTab === "applications" ? "default" : "ghost"}
            className={activeTab === "applications" ? "bg-gradient-gold text-primary-foreground gap-2" : "text-muted-foreground gap-2"}
            onClick={() => setActiveTab("applications")}
          >
            <LayoutDashboard size={16} /> Applications
          </Button>
          <Button
            variant={activeTab === "homepage" ? "default" : "ghost"}
            className={activeTab === "homepage" ? "bg-gradient-gold text-primary-foreground gap-2" : "text-muted-foreground gap-2"}
            onClick={() => setActiveTab("homepage")}
          >
            <Image size={16} /> Homepage Content
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            className={activeTab === "bookings" ? "bg-gradient-gold text-primary-foreground gap-2" : "text-muted-foreground gap-2"}
            onClick={() => setActiveTab("bookings")}
          >
            <FileText size={16} /> Booking Requests
          </Button>
          <Button
            variant={activeTab === "inbox" ? "default" : "ghost"}
            className={activeTab === "inbox" ? "bg-gradient-gold text-primary-foreground gap-2" : "text-muted-foreground gap-2"}
            onClick={() => setActiveTab("inbox")}
          >
            <MessageSquare size={16} /> Concierge Inbox
          </Button>
          <Button
            variant={activeTab === "mia-leads" ? "default" : "ghost"}
            className={activeTab === "mia-leads" ? "bg-gradient-gold text-primary-foreground gap-2" : "text-muted-foreground gap-2"}
            onClick={() => setActiveTab("mia-leads")}
          >
            <Sparkles size={16} /> Mia Leads
          </Button>
        </div>

        {activeTab === "inbox" ? (
          <ConciergeInbox />
        ) : activeTab === "mia-leads" ? (
          <MiaLeadsManager />
        ) : activeTab === "bookings" ? (
          <BookingRequestsManager />
        ) : activeTab === "homepage" ? (
          <HomepageContentManager />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", value: stats.total, icon: FileText, cls: "text-foreground" },
                { label: "Pending", value: stats.pending, icon: Clock, cls: "text-yellow-500" },
                { label: "Approved", value: stats.approved, icon: CheckCircle, cls: "text-emerald-500" },
                { label: "Declined", value: stats.declined, icon: XCircle, cls: "text-destructive" },
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
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, or reference..."
                  className="bg-card border-border h-11 pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-card border-border h-11 w-40">
                  <Filter size={14} className="mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-card border-border h-11 w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="member">Members</SelectItem>
                  <SelectItem value="provider">Providers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Applications list */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-lg">
                <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg text-foreground truncate">{app.full_name}</h3>
                          <Badge variant="outline" className="border-border text-[10px] tracking-widest uppercase">
                            {app.applicant_type}
                          </Badge>
                          {statusBadge(app.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.email} · {app.city}, {app.country} · {app.reference_number}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                      {expandedId === app.id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                    </div>

                    {expandedId === app.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="border-t border-border p-4 space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <Detail label="Phone" value={app.phone} />
                          <Detail label="Traveler Status" value={app.traveler_status?.join(", ") || "—"} />
                          <Detail label="Heard About Us" value={app.heard_about_us || "—"} />
                          {app.personal_statement && (
                            <div className="sm:col-span-2"><Detail label="Personal Statement" value={app.personal_statement} /></div>
                          )}
                        </div>

                        {app.applicant_type === "member" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                            <Detail label="Preferred Services" value={app.preferred_services?.join(", ") || "—"} />
                            <Detail label="Travel Frequency" value={app.travel_frequency || "—"} />
                            <Detail label="Party Size" value={app.travel_party_size || "—"} />
                          </div>
                        )}

                        {app.applicant_type === "provider" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                            <Detail label="Service Categories" value={app.service_categories?.join(", ") || "—"} />
                            <Detail label="Years Experience" value={app.years_experience?.toString() || "—"} />
                            <Detail label="Business Type" value={app.business_type || "—"} />
                            {app.business_name && <Detail label="Business Name" value={app.business_name} />}
                            <Detail label="Service Countries" value={app.service_countries?.join(", ") || "—"} />
                            <Detail label="Service Cities" value={app.service_cities || "—"} />
                            {app.service_description && (
                              <div className="sm:col-span-2"><Detail label="Service Description" value={app.service_description} /></div>
                            )}
                            {app.portfolio_url && (
                              <Detail
                                label="Portfolio"
                                value={<a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{app.portfolio_url}</a>}
                              />
                            )}
                          </div>
                        )}

                        {app.status === "pending" && (
                          <div className="flex gap-3 pt-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-foreground gap-2 text-xs tracking-widest uppercase"
                              onClick={() => setActionDialog({ id: app.id, action: "approved" })}
                            >
                              <CheckCircle size={14} /> Approve
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 text-xs tracking-widest uppercase"
                              onClick={() => setActionDialog({ id: app.id, action: "declined" })}
                            >
                              <XCircle size={14} /> Decline
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Confirm dialog */}
      <AlertDialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {actionDialog?.action === "approved" ? "Approve" : "Decline"} Application?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog?.action === "approved"
                ? "The applicant will be notified and granted access."
                : "The applicant will be notified of the decision."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionDialog && handleAction(actionDialog.id, actionDialog.action)}
              className={actionDialog?.action === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}
            >
              {actionDialog?.action === "approved" ? "Approve" : "Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">{label}</p>
    <p className="text-foreground">{value}</p>
  </div>
);

export default AdminDashboard;

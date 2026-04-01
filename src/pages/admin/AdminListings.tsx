import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, ToggleLeft, ToggleRight,
  Home, Car, CarFront, Sparkles, Shield, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logAdminActivity } from "@/lib/activityLogger";
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

const CATEGORY_LABELS: Record<string, string> = {
  homes: "Homes",
  drivers: "Drivers",
  car_fleets: "Car Fleets",
  experiences: "Experiences",
  security: "Security",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  homes: Home,
  drivers: Car,
  car_fleets: CarFront,
  experiences: Sparkles,
  security: Shield,
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  pending_review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  inactive: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Listing {
  id: string;
  title: string;
  status: string;
  short_description: string | null;
  country: string | null;
  city: string | null;
  cover_image: string | null;
  primary_rate: number | null;
  currency: string;
  is_featured: boolean;
  created_at: string;
}

export default function AdminListings() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const cat = category || "homes";
  const Icon = CATEGORY_ICONS[cat] || Home;

  useEffect(() => {
    fetchListings();
  }, [cat]);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, status, short_description, country, city, cover_image, primary_rate, currency, is_featured, created_at")
      .eq("category", cat)
      .order("created_at", { ascending: false });
    if (!error && data) setListings(data);
    setLoading(false);
  };

  const toggleStatus = async (id: string, current: string) => {
    setToggling(id);
    const newStatus = current === "active" ? "inactive" : "active";
    const { error } = await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    if (!error) {
      const listing = listings.find((l) => l.id === id);
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      toast({ title: `Listing ${newStatus}` });
      logAdminActivity({ actionType: "status_change", description: `Set listing "${listing?.title}" to ${newStatus}`, targetType: "listing", targetId: id });
    }
    setToggling(null);
  };

  const deleteListing = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("listings").delete().eq("id", deleteId);
    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== deleteId));
      toast({ title: "Listing deleted" });
    }
    setDeleteId(null);
  };

  const filtered = listings.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || l.title.toLowerCase().includes(q) || l.city?.toLowerCase().includes(q) || l.country?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 flex items-center gap-2">
            <Icon size={14} /> Listings
          </p>
          <h1 className="font-display text-3xl text-foreground">{CATEGORY_LABELS[cat]}</h1>
        </div>
        <Link to={`/admin/listings/${cat}/new`}>
          <Button className="bg-gradient-gold text-primary-foreground gap-2">
            <Plus size={16} /> Create New
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or location…"
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <Icon size={40} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No {CATEGORY_LABELS[cat]?.toLowerCase()} listings yet</p>
          <Link to={`/admin/listings/${cat}/new`}>
            <Button variant="outline" className="border-border gap-2">
              <Plus size={14} /> Create your first listing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
            >
              {/* Cover */}
              <div className="w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden">
                {listing.cover_image ? (
                  <img src={listing.cover_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="font-display text-base text-foreground truncate">{listing.title}</h3>
                  <Badge variant="outline" className={`${STATUS_COLORS[listing.status]} text-[9px] tracking-widest uppercase`}>
                    {listing.status.replace("_", " ")}
                  </Badge>
                  {listing.is_featured && (
                    <Badge className="bg-primary/10 text-primary text-[9px] border-primary/20">Featured</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {[listing.city, listing.country].filter(Boolean).join(", ") || "No location"}
                  {listing.primary_rate ? ` · ${listing.currency} ${listing.primary_rate.toLocaleString()}` : ""}
                </p>
              </div>

              {/* Date */}
              <span className="text-[10px] text-muted-foreground hidden sm:block shrink-0">
                {new Date(listing.created_at).toLocaleDateString()}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => navigate(`/admin/listings/${cat}/edit/${listing.id}`)}
                  title="Edit"
                >
                  <Pencil size={14} className="text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => toggleStatus(listing.id, listing.status)}
                  disabled={toggling === listing.id}
                  title={listing.status === "active" ? "Deactivate" : "Activate"}
                >
                  {toggling === listing.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : listing.status === "active" ? (
                    <ToggleRight size={14} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={14} className="text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => setDeleteId(listing.id)}
                  title="Delete"
                >
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The listing will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteListing} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

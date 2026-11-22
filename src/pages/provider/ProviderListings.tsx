import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Home, Car, CarFront, Sparkles, Shield, Loader2, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { SERVICE_CATEGORIES, getApprovedProviderCategories, categoryShort } from "@/lib/providerServices";

interface Listing {
  id: string;
  category: string;
  title: string;
  status: string;
  country: string | null;
  city: string | null;
  currency: string | null;
  primary_rate: number | null;
  cover_image: string | null;
  category_data: Record<string, unknown> | null;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  homes: Home,
  drivers: Car,
  car_fleets: CarFront,
  experiences: Sparkles,
  security: Shield,
};

const ProviderListings = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const cats = await getApprovedProviderCategories(user.id);
      setCategories(cats ?? SERVICE_CATEGORIES.map((c) => c.key));
    })();
  }, [user]);

  useEffect(() => {
    if (user) fetchListings();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase.from("listings").select("*").eq("created_by", user!.id);
    if (activeCat !== "all") query = query.eq("category", activeCat);
    const { data } = await query.order("created_at", { ascending: false });
    setListings(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchListings();
  }, [activeCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing deleted" });
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const filtered = activeCat === "all"
    ? listings
    : listings.filter((l) => l.category === activeCat);

  const renderListing = (listing: Listing, index: number) => {
    const rate = listing.primary_rate
      ? `${listing.currency || "USD"} ${listing.primary_rate.toLocaleString()}`
      : "Custom quote";
    return (
      <motion.div
        key={listing.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/20 transition-colors"
      >
        <div className="hidden sm:block w-20 h-16 rounded-md overflow-hidden flex-shrink-0">
          <img src={listing.cover_image || "/placeholder.svg"} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-lg text-foreground truncate">{listing.title}</h3>
            <Badge className="bg-gradient-gold text-primary-foreground border-0 text-[9px] tracking-widest uppercase">{listing.category.replace(/_/g, " ")}</Badge>
            <Badge variant="outline" className="border-border text-[9px] tracking-widest uppercase">{listing.status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {listing.city || "—"}, {listing.country || "—"} · {rate}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link to={`/provider/listings/edit/${listing.id}`}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Pencil size={16} /></Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Delete listing?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently remove <strong>{listing.title}</strong>.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteListing(listing.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Listings</p>
          <h1 className="font-display text-3xl text-foreground">My Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the offerings across every service you're approved to provide.</p>
        </div>
        <Link to={`/provider/listings/new/${activeCat === "all" ? categories[0] || "homes" : activeCat}`}>
          <Button className="h-11 gap-2 bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold hover:opacity-90 rounded-sm">
            <Plus size={16} /> Add Listing
          </Button>
        </Link>
      </motion.div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCat("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${activeCat === "all" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          All Services
        </button>
        {categories.map((key) => {
          const Icon = CATEGORY_ICONS[key] || Home;
          return (
            <button
              key={key}
              onClick={() => setActiveCat(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${activeCat === key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={12} /> {categoryShort(key)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-border rounded-lg">
          {(() => { const Icon = activeCat === "all" ? Home : CATEGORY_ICONS[activeCat] || Home; return <Icon size={40} className="mx-auto text-muted-foreground mb-4" />; })()}
          <p className="text-muted-foreground text-lg mb-2">No {activeCat === "all" ? "" : categoryShort(activeCat).toLowerCase() + " "}listings yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first {activeCat === "all" ? "service" : categoryShort(activeCat).toLowerCase()} offering.</p>
          <Link to={`/provider/listings/new/${activeCat === "all" ? categories[0] || "homes" : activeCat}`}>
            <Button className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold hover:opacity-90 rounded-sm gap-2">
              <Plus size={16} /> Add {activeCat === "all" ? "Listing" : categoryShort(activeCat)}
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">{filtered.map(renderListing)}</div>
      )}
    </div>
  );
};

export default ProviderListings;

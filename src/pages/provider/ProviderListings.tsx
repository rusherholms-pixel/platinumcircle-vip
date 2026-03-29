import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Home, Star, Eye } from "lucide-react";
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

interface Property {
  id: string;
  title: string;
  city: string;
  country: string;
  price_per_night: number;
  bedrooms: number;
  property_type: string;
  rating: number | null;
  review_count: number | null;
  is_featured: boolean | null;
  images: string[] | null;
  created_at: string;
}

const ProviderListings = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("host_id", user!.id)
      .order("created_at", { ascending: false });
    setProperties(data ?? []);
    setLoading(false);
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Property deleted" });
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Listings</p>
          <h1 className="font-display text-3xl text-foreground">My Properties</h1>
        </div>
        <Link to="/provider/listings/new">
          <Button className="h-11 gap-2 bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold hover:opacity-90 rounded-sm">
            <Plus size={16} /> Add Listing
          </Button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : properties.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-border rounded-lg">
          <Home size={40} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No listings yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first luxury property listing.</p>
          <Link to="/provider/listings/new">
            <Button className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold hover:opacity-90 rounded-sm gap-2">
              <Plus size={16} /> Add Property
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/20 transition-colors"
            >
              <div className="hidden sm:block w-20 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img src={property.images?.[0] || "/placeholder.svg"} alt={property.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg text-foreground truncate">{property.title}</h3>
                  {property.is_featured && (
                    <Badge className="bg-gradient-gold text-primary-foreground border-0 text-[9px] tracking-widest uppercase">Featured</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {property.city}, {property.country} · {property.bedrooms} bed · ${property.price_per_night.toLocaleString()}/night
                </p>
              </div>
              <div className="hidden md:flex items-center gap-1 text-sm text-primary">
                <Star size={14} fill="currentColor" /> {property.rating ?? "—"}
                <span className="text-muted-foreground">({property.review_count ?? 0})</span>
              </div>
              <div className="flex items-center gap-1">
                <Link to={`/provider/listings/edit/${property.id}`}>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Pencil size={16} />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">Delete listing?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove <strong>{property.title}</strong>.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteProperty(property.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderListings;

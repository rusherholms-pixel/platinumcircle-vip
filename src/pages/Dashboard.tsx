import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Pencil, Trash2, LogOut, Home, Eye, Star, DollarSign, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  rating: number;
  review_count: number;
  is_featured: boolean;
  images: string[];
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("host_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) setProperties(data);
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

  const totalRevenue = properties.reduce((sum, p) => sum + p.price_per_night, 0);
  const avgRating = properties.length
    ? (properties.reduce((sum, p) => sum + (p.rating || 0), 0) / properties.length).toFixed(1)
    : "—";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-display text-2xl tracking-wider text-gradient-gold">
            Platinum Circle
          </a>
          <div className="flex items-center gap-3">
            <Link to="/properties">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 text-xs tracking-wider uppercase">
                <Eye size={16} /> Browse
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { signOut(); navigate("/"); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans flex items-center gap-2">
              <LayoutDashboard size={14} /> Host Dashboard
            </p>
            <h1 className="font-display text-4xl text-foreground">Your Listings</h1>
          </div>
          <Link to="/dashboard/new">
            <Button className="h-11 gap-2 bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold hover:opacity-90 rounded-sm">
              <Plus size={16} /> Add Property
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Listings", value: properties.length, icon: Home },
            { label: "Avg. Nightly Rate", value: properties.length ? `$${Math.round(totalRevenue / properties.length).toLocaleString()}` : "—", icon: DollarSign },
            { label: "Avg. Rating", value: avgRating, icon: Star },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={16} className="text-primary" />
                <span className="text-xs tracking-widest uppercase text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-3xl text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Listings table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-border rounded-lg"
          >
            <Home size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No listings yet</p>
            <p className="text-sm text-muted-foreground mb-6">Create your first luxury property listing.</p>
            <Link to="/dashboard/new">
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
                {/* Thumbnail */}
                <div className="hidden sm:block w-20 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={property.images?.[0] || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg text-foreground truncate">{property.title}</h3>
                    {property.is_featured && (
                      <Badge className="bg-gradient-gold text-primary-foreground border-0 text-[9px] tracking-widest uppercase">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {property.city}, {property.country} · {property.bedrooms} bed · ${property.price_per_night.toLocaleString()}/night
                  </p>
                </div>

                {/* Rating */}
                <div className="hidden md:flex items-center gap-1 text-sm text-primary">
                  <Star size={14} fill="currentColor" /> {property.rating}
                  <span className="text-muted-foreground">({property.review_count})</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link to={`/dashboard/edit/${property.id}`}>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Pencil size={16} />
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display">Delete listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove <strong>{property.title}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProperty(property.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

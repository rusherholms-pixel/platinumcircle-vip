import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Home, DollarSign, ClipboardList, UserCircle, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SERVICE_CATEGORIES, getApprovedProviderCategories } from "@/lib/providerServices";

interface Listing {
  id: string;
  title: string;
  category: string;
  status: string;
  currency: string | null;
  primary_rate: number | null;
}

const ProviderOverview = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [listingRes, cats] = await Promise.all([
        supabase
          .from("listings")
          .select("id, title, category, status, currency, primary_rate")
          .eq("created_by", user.id),
        getApprovedProviderCategories(user.id),
      ]);
      setListings(listingRes.data ?? []);
      setCategories(cats ?? SERVICE_CATEGORIES.map((c) => c.key));
      setLoading(false);
    })();
  }, [user]);

  const activeListings = listings.filter((l) => l.status === "active").length;
  const rates = listings.filter((l) => l.primary_rate);
  const avgRate = rates.length
    ? Math.round(rates.reduce((s, l) => s + (l.primary_rate || 0), 0) / rates.length)
    : 0;
  const currencies = new Set(listings.map((l) => l.currency).filter(Boolean));

  // Profile completion mock (can be replaced with real logic)
  const profileCompletion = 65;

  const stats = [
    { label: "Active Listings", value: activeListings, icon: Home, color: "text-primary" },
    { label: "Pending Requests", value: 0, icon: ClipboardList, color: "text-primary", badge: null },
    { label: "Avg. Rate", value: activeListings ? `${[...currencies][0] || "USD"} ${avgRate.toLocaleString()}` : "—", icon: DollarSign, color: "text-primary" },
    { label: "Services Offered", value: categories.length, icon: Sparkles, color: "text-primary" },
    { label: "This Month", value: "$0", icon: TrendingUp, color: "text-primary" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Dashboard</p>
        <h1 className="font-display text-3xl lg:text-4xl text-foreground">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
        </h1>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 bg-card border border-border rounded-lg hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs tracking-widest uppercase text-muted-foreground">{stat.label}</span>
              </div>
              {stat.badge !== undefined && stat.badge !== null && (
                <Badge className="bg-primary text-primary-foreground text-[9px]">{stat.badge}</Badge>
              )}
            </div>
            <p className="font-display text-3xl text-foreground">{stat.value}</p>
          </motion.div>
        ))}

        {/* Profile Completion Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <UserCircle size={16} className="text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Profile</span>
          </div>
          <p className="font-display text-3xl text-foreground mb-3">{profileCompletion}%</p>
          <Progress value={profileCompletion} className="h-1.5 mb-2" />
          <Link to="/provider/profile">
            <Button variant="link" className="p-0 h-auto text-xs text-primary">
              Complete your profile →
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Services offered */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="p-5 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Services You Offer</span>
          </div>
          <Link to="/provider/listings">
            <Button variant="link" className="p-0 h-auto text-xs text-primary">Manage →</Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services assigned yet.</p>
          ) : (
            categories.map((key) => {
              const cat = SERVICE_CATEGORIES.find((c) => c.key === key);
              const count = listings.filter((l) => l.category === key).length;
              return (
                <Link
                  key={key}
                  to={`/provider/listings`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-secondary/40 text-sm hover:border-primary/40 transition-colors"
                >
                  <span className="capitalize">{cat?.short ?? key.replace(/_/g, " ")}</span>
                  <Badge variant="outline" className="border-border text-[10px]">{count}</Badge>
                </Link>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        <Link to="/provider/listings">
          <Button className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold hover:opacity-90 rounded-sm">
            Manage Listings
          </Button>
        </Link>
        <Link to="/provider/bookings">
          <Button variant="outline" className="text-xs tracking-[0.2em] uppercase font-semibold rounded-sm border-border">
            View Requests
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default ProviderOverview;

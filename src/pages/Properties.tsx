import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { Search, SlidersHorizontal, LogOut, X, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import PropertyCard from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  property_type: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
}

const Properties = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [minBedrooms, setMinBedrooms] = useState("any");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*");

    if (!error && data) {
      setProperties(data);
    }
    setLoading(false);
  };

  const filtered = properties
    .filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.city.toLowerCase().includes(q) &&
          !p.country.toLowerCase().includes(q)
        )
          return false;
      }
      if (propertyType !== "all" && p.property_type !== propertyType) return false;
      if (p.price_per_night < priceRange[0] || p.price_per_night > priceRange[1]) return false;
      if (minBedrooms !== "any" && p.bedrooms < parseInt(minBedrooms)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price_per_night - b.price_per_night;
        case "price-desc": return b.price_per_night - a.price_per_night;
        case "rating": return b.rating - a.rating;
        case "featured": return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        default: return 0;
      }
    });

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
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 text-xs tracking-wider uppercase">
                <LayoutDashboard size={16} /> Dashboard
              </Button>
            </Link>
            <span className="hidden sm:block text-sm text-muted-foreground">
              {user?.email}
            </span>
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
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">
            Exclusive Collection
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
            Luxury Properties
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Hand-selected estates and residences for the most discerning guests.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card border-border"
            />
          </div>
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12 bg-card border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="h-12 gap-2 border-border"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
              Filters
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-card border border-border rounded-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">
                  Property Type
                </label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="mansion">Mansion</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="chalet">Chalet</SelectItem>
                    <SelectItem value="estate">Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">
                  Min Bedrooms
                </label>
                <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                    <SelectItem value="6">6+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">
                  Price Range: ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={15000}
                  step={500}
                  className="mt-2"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No properties match your criteria.</p>
            <Button
              variant="ghost"
              className="mt-4 text-primary"
              onClick={() => {
                setSearchQuery("");
                setPropertyType("all");
                setPriceRange([0, 15000]);
                setMinBedrooms("any");
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                title={property.title}
                location={property.location}
                city={property.city}
                country={property.country}
                pricePerNight={property.price_per_night}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                maxGuests={property.max_guests}
                amenities={property.amenities}
                images={property.images}
                propertyType={property.property_type}
                rating={property.rating}
                reviewCount={property.review_count}
                isFeatured={property.is_featured}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Properties;

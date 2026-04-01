import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import PropertyCard from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

interface HomeListing {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  neighbourhood: string | null;
  city: string | null;
  country: string | null;
  primary_rate: number | null;
  currency: string;
  cover_image: string | null;
  gallery_images: string[];
  is_featured: boolean;
  category_data: Record<string, any> | null;
}

export default function MemberHousing() {
  const [listings, setListings] = useState<HomeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [minBedrooms, setMinBedrooms] = useState("any");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("category", "homes")
      .eq("status", "active");
    if (data) setListings(data as unknown as HomeListing[]);
    setLoading(false);
  };

  const getField = (l: HomeListing, key: string) => (l.category_data as any)?.[key];

  const filtered = listings
    .filter((l) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !l.title.toLowerCase().includes(q) &&
          !(l.city || "").toLowerCase().includes(q) &&
          !(l.country || "").toLowerCase().includes(q)
        ) return false;
      }
      const pType = getField(l, "property_type") || "";
      if (propertyType !== "all" && pType.toLowerCase() !== propertyType.toLowerCase()) return false;
      const rate = l.primary_rate || 0;
      if (rate < priceRange[0] || rate > priceRange[1]) return false;
      if (minBedrooms !== "any" && (getField(l, "bedrooms") || 0) < parseInt(minBedrooms)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return (a.primary_rate || 0) - (b.primary_rate || 0);
        case "price-desc": return (b.primary_rate || 0) - (a.primary_rate || 0);
        default: return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

  return (
    <div className="space-y-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Exclusive Collection</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Luxury Housing</h1>
        <p className="text-muted-foreground mt-2">Hand-selected estates and residences for the most discerning guests.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, city, or country..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 bg-card border-border" />
        </div>
        <div className="flex gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-12 bg-card border-border"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured First</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-12 gap-2 border-border" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />} Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-6 bg-card border border-border rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Property Type</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Penthouse">Penthouse</SelectItem>
                  <SelectItem value="Private Estate">Private Estate</SelectItem>
                  <SelectItem value="Chalet">Chalet</SelectItem>
                  <SelectItem value="Yacht">Yacht</SelectItem>
                  <SelectItem value="Boutique Property">Boutique Property</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Min Bedrooms</label>
              <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Price: ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}</label>
              <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={15000} step={500} className="mt-2" />
            </div>
          </div>
        </motion.div>
      )}

      <p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "property" : "properties"} found</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4"><Skeleton className="aspect-[4/3] rounded-lg" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No properties match your criteria.</p>
          <Button variant="ghost" className="mt-4 text-primary" onClick={() => { setSearchQuery(""); setPropertyType("all"); setPriceRange([0, 15000]); setMinBedrooms("any"); }}>Clear all filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((l) => {
            const catData = (l.category_data || {}) as Record<string, any>;
            const images = l.cover_image
              ? [l.cover_image, ...(l.gallery_images || [])]
              : (l.gallery_images || []);
            return (
              <PropertyCard
                key={l.id}
                id={l.id}
                title={l.title}
                location={l.neighbourhood || ""}
                city={l.city || ""}
                country={l.country || ""}
                pricePerNight={l.primary_rate || 0}
                bedrooms={catData.bedrooms || 0}
                bathrooms={catData.bathrooms || 0}
                maxGuests={catData.max_guests || 0}
                amenities={[]}
                images={images}
                propertyType={catData.property_type || "Home"}
                rating={0}
                reviewCount={0}
                isFeatured={l.is_featured || false}
                showBooking
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

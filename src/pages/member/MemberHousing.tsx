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

interface Property {
  id: string; title: string; description: string; location: string; city: string;
  country: string; price_per_night: number; bedrooms: number; bathrooms: number;
  max_guests: number; amenities: string[]; images: string[]; property_type: string;
  rating: number; review_count: number; is_featured: boolean;
}

export default function MemberHousing() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [minBedrooms, setMinBedrooms] = useState("any");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const { data } = await supabase.from("properties").select("*");
    if (data) setProperties(data);
    setLoading(false);
  };

  const filtered = properties
    .filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q) && !p.country.toLowerCase().includes(q)) return false;
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
              <SelectItem value="rating">Highest Rated</SelectItem>
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
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="mansion">Mansion</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="chalet">Chalet</SelectItem>
                  <SelectItem value="estate">Estate</SelectItem>
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
          {filtered.map((p) => (
            <PropertyCard key={p.id} id={p.id} title={p.title} location={p.location} city={p.city} country={p.country}
              pricePerNight={p.price_per_night} bedrooms={p.bedrooms} bathrooms={p.bathrooms}
              maxGuests={p.max_guests} amenities={p.amenities} images={p.images}
              propertyType={p.property_type} rating={p.rating} reviewCount={p.review_count} isFeatured={p.is_featured} showBooking />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

interface PropertyFormProps {
  propertyId?: string;
}

const PROPERTY_TYPES = [
  { value: "villa", label: "Villa" },
  { value: "mansion", label: "Mansion" },
  { value: "penthouse", label: "Penthouse" },
  { value: "chalet", label: "Chalet" },
  { value: "estate", label: "Estate" },
];

const PropertyForm = ({ propertyId }: PropertyFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!propertyId;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [maxGuests, setMaxGuests] = useState("2");
  const [propertyType, setPropertyType] = useState("villa");
  const [isFeatured, setIsFeatured] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing) loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId!)
      .single();

    if (error || !data) {
      toast({ title: "Property not found", variant: "destructive" });
      navigate("/provider/listings");
      return;
    }

    setTitle(data.title);
    setDescription(data.description || "");
    setLocation(data.location);
    setCity(data.city);
    setCountry(data.country);
    setPricePerNight(String(data.price_per_night));
    setBedrooms(String(data.bedrooms));
    setBathrooms(String(data.bathrooms));
    setMaxGuests(String(data.max_guests));
    setPropertyType(data.property_type);
    setIsFeatured(data.is_featured || false);
    setAmenities(data.amenities || []);
    setImages(data.images || []);
    setLoading(false);
  };

  const addAmenity = () => {
    const trimmed = amenityInput.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities([...amenities, trimmed]);
      setAmenityInput("");
    }
  };

  const addImage = () => {
    const trimmed = imageInput.trim();
    if (trimmed && !images.includes(trimmed)) {
      setImages([...images, trimmed]);
      setImageInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const payload = {
      title,
      description,
      location,
      city,
      country,
      price_per_night: parseFloat(pricePerNight),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      max_guests: parseInt(maxGuests),
      property_type: propertyType,
      is_featured: isFeatured,
      amenities,
      images,
      host_id: user.id,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", propertyId!));
    } else {
      ({ error } = await supabase.from("properties").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error saving property", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEditing ? "Property updated" : "Property created" });
      navigate("/provider/listings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
        <button
          onClick={() => navigate("/provider/listings")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            {isEditing ? "Edit Property" : "Add New Property"}
          </h1>
          <p className="text-muted-foreground mb-10">
            {isEditing ? "Update your listing details below." : "Fill in the details to create a new luxury listing."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section className="space-y-5">
              <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                Basic Information
              </h2>
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Villa Paradiso" required className="bg-card border-border h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A breathtaking property..." rows={4} className="bg-card border-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-card border-border h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Price / Night (USD)</Label>
                  <Input type="number" min="0" step="100" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} placeholder="4500" required className="bg-card border-border h-12" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label className="text-sm text-muted-foreground">Mark as Featured</Label>
              </div>
            </section>

            {/* Location */}
            <section className="space-y-5">
              <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Neighbourhood</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Amalfi Coast" required className="bg-card border-border h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Positano" required className="bg-card border-border h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Italy" required className="bg-card border-border h-12" />
                </div>
              </div>
            </section>

            {/* Capacity */}
            <section className="space-y-5">
              <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                Capacity
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Bedrooms</Label>
                  <Input type="number" min="1" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="bg-card border-border h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Bathrooms</Label>
                  <Input type="number" min="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="bg-card border-border h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Max Guests</Label>
                  <Input type="number" min="1" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className="bg-card border-border h-12" />
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section className="space-y-5">
              <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                Amenities
              </h2>
              <div className="flex gap-2">
                <Input
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  placeholder="e.g. Infinity Pool"
                  className="bg-card border-border h-12"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
                />
                <Button type="button" variant="outline" className="h-12 border-border" onClick={addAmenity}>
                  <Plus size={18} />
                </Button>
              </div>
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-sm text-foreground rounded-sm">
                      {a}
                      <button type="button" onClick={() => setAmenities(amenities.filter((x) => x !== a))} className="text-muted-foreground hover:text-destructive">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Images */}
            <section className="space-y-5">
              <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                Images
              </h2>
              <ImageUpload images={images} onImagesChange={setImages} maxImages={10} />
            </section>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 rounded-sm"
              >
                {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {saving ? "Saving..." : isEditing ? "Update Property" : "Create Property"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 border-border"
                onClick={() => navigate("/provider/listings")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
    </div>
  );
};

export default PropertyForm;

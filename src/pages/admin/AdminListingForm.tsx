import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save, Loader2, ArrowLeft, Upload, Trash2, X, CheckCircle, Circle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logAdminActivity } from "@/lib/activityLogger";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "CHF", "CAD", "AUD"];

const CATEGORY_FIELDS: Record<string, { label: string; rateLabel: string; fields: { key: string; label: string; type: string; options?: string[] }[] }> = {
  homes: {
    label: "Homes",
    rateLabel: "Nightly Rate",
    fields: [
      { key: "property_type", label: "Property Type", type: "select", options: ["Villa", "Penthouse", "Private Estate", "Serviced Apartment", "Boutique Property", "Yacht", "Chalet", "Other"] },
      { key: "bedrooms", label: "Bedrooms", type: "number" },
      { key: "bathrooms", label: "Bathrooms", type: "number" },
      { key: "max_guests", label: "Maximum Guests", type: "number" },
      { key: "weekly_rate", label: "Weekly Rate", type: "number" },
      { key: "monthly_rate", label: "Monthly Rate", type: "number" },
      { key: "minimum_stay", label: "Minimum Stay (nights)", type: "number" },
      { key: "cancellation_policy", label: "Cancellation Policy", type: "select", options: ["Flexible", "Moderate", "Strict", "Non-refundable"] },
    ],
  },
  drivers: {
    label: "Drivers",
    rateLabel: "Hourly Rate",
    fields: [
      { key: "driver_name", label: "Driver Full Name", type: "text" },
      { key: "years_experience", label: "Years of Experience", type: "number" },
      { key: "languages", label: "Languages Spoken", type: "text" },
      { key: "bio", label: "Short Bio", type: "textarea" },
      { key: "half_day_rate", label: "Half Day (4hr) Rate", type: "number" },
      { key: "full_day_rate", label: "Full Day (8hr) Rate", type: "number" },
      { key: "airport_rate", label: "Airport Transfer Rate", type: "number" },
    ],
  },
  car_fleets: {
    label: "Car Fleets",
    rateLabel: "Daily Rate",
    fields: [
      { key: "fleet_type", label: "Fleet Type", type: "select", options: ["Executive Fleet", "Exotic and Supercar Fleet", "SUV Fleet", "Armored Fleet", "Classic Fleet", "Event Fleet", "Mixed Fleet"] },
      { key: "minimum_rental", label: "Minimum Rental Period", type: "text" },
      { key: "driver_included", label: "Driver Included", type: "toggle" },
      { key: "delivery_available", label: "Delivery Available", type: "toggle" },
      { key: "insurance_included", label: "Insurance Included", type: "toggle" },
    ],
  },
  experiences: {
    label: "Experiences",
    rateLabel: "Price Per Person",
    fields: [
      { key: "experience_category", label: "Experience Category", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "min_guests", label: "Minimum Guests", type: "number" },
      { key: "max_guests", label: "Maximum Guests", type: "number" },
      { key: "whats_included", label: "What Is Included", type: "textarea" },
      { key: "advance_booking", label: "Advance Booking Required", type: "select", options: ["24h", "48h", "72h", "1 week", "2 weeks", "Custom"] },
    ],
  },
  security: {
    label: "Security",
    rateLabel: "Hourly Rate",
    fields: [
      { key: "provider_name", label: "Provider / Team Name", type: "text" },
      { key: "service_types", label: "Security Service Types", type: "text" },
      { key: "team_size", label: "Team Size Available", type: "select", options: ["Solo officer", "2-person team", "4-person team", "Full detail (6+)", "Custom on request"] },
      { key: "armed_unarmed", label: "Armed or Unarmed", type: "select", options: ["Armed", "Unarmed", "Both"] },
      { key: "response_time", label: "Response Time", type: "select", options: ["Under 2 hours", "2-4 hours", "Same day", "Next day"] },
      { key: "day_rate", label: "8-Hour Day Rate", type: "number" },
      { key: "24h_rate", label: "24-Hour Rate", type: "number" },
      { key: "weekly_rate", label: "Weekly Rate", type: "number" },
    ],
  },
};

const SECTIONS = ["Details", "Media", "Pricing", "Category Fields", "Review"];

export default function AdminListingForm() {
  const { category, id } = useParams<{ category: string; id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cat = category || "homes";
  const isEdit = !!id;
  const config = CATEGORY_FIELDS[cat] || CATEGORY_FIELDS.homes;

  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    status: "draft" as string,
    short_description: "",
    full_description: "",
    country: "",
    city: "",
    neighbourhood: "",
    currency: "USD",
    primary_rate: "",
    secondary_rate: "",
    custom_quote_available: false,
    is_featured: false,
    cover_image: "",
    gallery_images: [] as string[],
    video_url: "",
    category_data: {} as Record<string, any>,
  });

  // Auto-save ref
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    if (isEdit) loadListing();
  }, [id]);

  // Auto-save every 60s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (formRef.current.title) saveDraft(formRef.current);
    }, 60000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [id]);

  const loadListing = async () => {
    const { data } = await supabase.from("listings").select("*").eq("id", id!).single();
    if (data) {
      setForm({
        title: data.title || "",
        status: data.status || "draft",
        short_description: data.short_description || "",
        full_description: data.full_description || "",
        country: data.country || "",
        city: data.city || "",
        neighbourhood: data.neighbourhood || "",
        currency: data.currency || "USD",
        primary_rate: data.primary_rate?.toString() || "",
        secondary_rate: data.secondary_rate?.toString() || "",
        custom_quote_available: data.custom_quote_available || false,
        is_featured: data.is_featured || false,
        cover_image: data.cover_image || "",
        gallery_images: data.gallery_images || [],
        video_url: data.video_url || "",
        category_data: (data.category_data as Record<string, any>) || {},
      });
    }
  };

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
  const setCatData = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, category_data: { ...prev.category_data, [key]: value } }));

  const saveDraft = async (formData: typeof form) => {
    const payload = {
      category: cat,
      title: formData.title || "Untitled",
      status: formData.status,
      short_description: formData.short_description || null,
      full_description: formData.full_description || null,
      country: formData.country || null,
      city: formData.city || null,
      neighbourhood: formData.neighbourhood || null,
      currency: formData.currency,
      primary_rate: formData.primary_rate ? Number(formData.primary_rate) : null,
      secondary_rate: formData.secondary_rate ? Number(formData.secondary_rate) : null,
      custom_quote_available: formData.custom_quote_available,
      is_featured: formData.is_featured,
      cover_image: formData.cover_image || null,
      gallery_images: formData.gallery_images,
      video_url: formData.video_url || null,
      category_data: formData.category_data,
      created_by: user?.id,
    };

    if (isEdit) {
      await supabase.from("listings").update(payload).eq("id", id!);
    } else {
      // For new, don't auto-save (let user explicitly save)
      return;
    }
    setLastSaved(new Date());
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      category: cat,
      title: form.title,
      status: form.status,
      short_description: form.short_description || null,
      full_description: form.full_description || null,
      country: form.country || null,
      city: form.city || null,
      neighbourhood: form.neighbourhood || null,
      currency: form.currency,
      primary_rate: form.primary_rate ? Number(form.primary_rate) : null,
      secondary_rate: form.secondary_rate ? Number(form.secondary_rate) : null,
      custom_quote_available: form.custom_quote_available,
      is_featured: form.is_featured,
      cover_image: form.cover_image || null,
      gallery_images: form.gallery_images,
      video_url: form.video_url || null,
      category_data: form.category_data,
      created_by: user?.id,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("listings").update(payload).eq("id", id!));
    } else {
      ({ error } = await supabase.from("listings").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setLastSaved(new Date());
      toast({ title: isEdit ? "Listing updated" : "Listing created" });
      if (!isEdit) navigate(`/admin/listings/${cat}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "cover" | "gallery") => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 12 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 12MB", variant: "destructive" });
        continue;
      }
      const ext = file.name.split(".").pop();
      const path = `listings/${cat}/${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage.from("homepage-assets").upload(path, file, { upsert: true });
      if (error) {
        toast({ title: "Upload failed", variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("homepage-assets").getPublicUrl(path);
      if (target === "cover") {
        set("cover_image", urlData.publicUrl);
      } else {
        setForm((prev) => ({ ...prev, gallery_images: [...prev.gallery_images, urlData.publicUrl] }));
      }
    }
    setUploading(false);
  };

  const removeGalleryImage = (idx: number) => {
    setForm((prev) => ({ ...prev, gallery_images: prev.gallery_images.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/listings/${cat}`)}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-primary">{config.label}</p>
            <h1 className="font-display text-2xl text-foreground">{isEdit ? "Edit Listing" : "Create Listing"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-[10px] text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" className="border-border gap-2" onClick={() => { set("status", "draft"); handleSave(); }}>
            Save Draft
          </Button>
          <Button className="bg-gradient-gold text-primary-foreground gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveSection(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              i === activeSection
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {i < activeSection ? <CheckCircle size={12} className="text-emerald-500" /> : <Circle size={12} />}
            {s}
          </button>
        ))}
      </div>

      {/* Section 0: Details */}
      {activeSection === 0 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <h2 className="font-display text-lg text-foreground">Basic Details</h2>

          <div className="space-y-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Title <span className="text-primary">*</span></Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-secondary border-border mt-1" placeholder="Listing title" />
            </div>

            <div className="flex items-center gap-4">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="w-40 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-xs text-muted-foreground">Featured</Label>
                <Switch checked={form.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
              </div>
            </div>

            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Short Description <span className="text-muted-foreground/60">(150 chars)</span></Label>
              <Input value={form.short_description} onChange={(e) => set("short_description", e.target.value.slice(0, 150))} className="bg-secondary border-border mt-1" maxLength={150} />
            </div>

            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Full Description</Label>
              <Textarea value={form.full_description} onChange={(e) => set("full_description", e.target.value.slice(0, 1500))} className="bg-secondary border-border mt-1 min-h-[120px]" maxLength={1500} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Country</Label>
                <Input value={form.country} onChange={(e) => set("country", e.target.value)} className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">City</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Neighbourhood</Label>
                <Input value={form.neighbourhood} onChange={(e) => set("neighbourhood", e.target.value)} className="bg-secondary border-border mt-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(1)}>Next: Media →</Button>
          </div>
        </div>
      )}

      {/* Section 1: Media */}
      {activeSection === 1 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <h2 className="font-display text-lg text-foreground">Media</h2>

          {/* Cover image */}
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Cover Image <span className="text-primary">*</span></Label>
            {form.cover_image ? (
              <div className="relative rounded-lg overflow-hidden aspect-video mt-2 bg-muted max-w-md">
                <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
                <button onClick={() => set("cover_image", "")} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 mt-2">
                <Upload size={24} className="text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Upload cover image (max 12MB)</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "cover")} />
              </label>
            )}
          </div>

          {/* Gallery */}
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Gallery Images ({form.gallery_images.length}/40)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
              {form.gallery_images.map((url, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden aspect-square bg-muted group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} className="text-destructive" />
                  </button>
                </div>
              ))}
              {form.gallery_images.length < 40 && (
                <label className="flex items-center justify-center border-2 border-dashed border-border rounded-lg aspect-square cursor-pointer hover:border-primary/50">
                  <Upload size={20} className="text-muted-foreground" />
                  <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload(e, "gallery")} />
                </label>
              )}
            </div>
          </div>

          {/* Video */}
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Video URL (optional)</Label>
            <Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} className="bg-secondary border-border mt-1" placeholder="YouTube or Vimeo URL" />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(0)}>← Details</Button>
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(2)}>Next: Pricing →</Button>
          </div>
        </div>
      )}

      {/* Section 2: Pricing */}
      {activeSection === 2 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <h2 className="font-display text-lg text-foreground">Pricing</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Currency</Label>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger className="border-border mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">{config.rateLabel}</Label>
              <Input type="number" value={form.primary_rate} onChange={(e) => set("primary_rate", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Secondary Rate</Label>
              <Input type="number" value={form.secondary_rate} onChange={(e) => set("secondary_rate", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="text-xs text-muted-foreground">Custom Quote Available</Label>
            <Switch checked={form.custom_quote_available} onCheckedChange={(v) => set("custom_quote_available", v)} />
            <span className="text-xs text-muted-foreground">(Hides price, shows "Request Quote")</span>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(1)}>← Media</Button>
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(3)}>Next: {config.label} Fields →</Button>
          </div>
        </div>
      )}

      {/* Section 3: Category-specific fields */}
      {activeSection === 3 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <h2 className="font-display text-lg text-foreground">{config.label} Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.fields.map((field) => {
              if (field.type === "toggle") {
                return (
                  <div key={field.key} className="flex items-center gap-3">
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground">{field.label}</Label>
                    <Switch
                      checked={!!form.category_data[field.key]}
                      onCheckedChange={(v) => setCatData(field.key, v)}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.key}>
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground">{field.label}</Label>
                    <Select value={form.category_data[field.key] || ""} onValueChange={(v) => setCatData(field.key, v)}>
                      <SelectTrigger className="border-border mt-1">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.key} className="sm:col-span-2">
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground">{field.label}</Label>
                    <Textarea value={form.category_data[field.key] || ""} onChange={(e) => setCatData(field.key, e.target.value)} className="bg-secondary border-border mt-1" />
                  </div>
                );
              }

              return (
                <div key={field.key}>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">{field.label}</Label>
                  <Input
                    type={field.type}
                    value={form.category_data[field.key] || ""}
                    onChange={(e) => setCatData(field.key, field.type === "number" ? e.target.value : e.target.value)}
                    className="bg-secondary border-border mt-1"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(2)}>← Pricing</Button>
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(4)}>Review →</Button>
          </div>
        </div>
      )}

      {/* Section 4: Review */}
      {activeSection === 4 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <h2 className="font-display text-lg text-foreground">Review & Publish</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Title" value={form.title || "—"} />
            <Detail label="Status" value={form.status} />
            <Detail label="Location" value={[form.city, form.country].filter(Boolean).join(", ") || "—"} />
            <Detail label="Rate" value={form.primary_rate ? `${form.currency} ${form.primary_rate}` : "—"} />
            <Detail label="Featured" value={form.is_featured ? "Yes" : "No"} />
            <Detail label="Custom Quote" value={form.custom_quote_available ? "Yes" : "No"} />
            <Detail label="Cover Image" value={form.cover_image ? "Uploaded" : "None"} />
            <Detail label="Gallery" value={`${form.gallery_images.length} images`} />
          </div>

          {Object.keys(form.category_data).length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">{config.label} Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(form.category_data).filter(([, v]) => v !== "" && v !== null && v !== undefined).map(([k, v]) => (
                  <Detail key={k} label={k.replace(/_/g, " ")} value={String(v)} />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" className="border-border" onClick={() => setActiveSection(3)}>← Back</Button>
            <Button className="bg-gradient-gold text-primary-foreground gap-2 px-8" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEdit ? "Update Listing" : "Publish Listing"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">{label}</p>
    <p className="text-foreground capitalize">{value}</p>
  </div>
);

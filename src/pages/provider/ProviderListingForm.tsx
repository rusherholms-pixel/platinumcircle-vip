import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Upload, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CATEGORY_FIELDS, CURRENCIES } from "@/lib/listingFields";
import { categoryLabel } from "@/lib/providerServices";

interface ListingFormState {
  title: string;
  status: string;
  short_description: string;
  full_description: string;
  country: string;
  city: string;
  neighbourhood: string;
  currency: string;
  primary_rate: string;
  secondary_rate: string;
  custom_quote_available: boolean;
  is_featured: boolean;
  cover_image: string;
  gallery_images: string[];
  category_data: Record<string, unknown>;
}

const emptyForm = (): ListingFormState => ({
  title: "",
  status: "active",
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
  gallery_images: [],
  category_data: {},
});

const ProviderListingForm = () => {
  const { category, id } = useParams<{ category: string; id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const catParam = category || "homes";
  const isEdit = !!id;
  const [cat, setCat] = useState(catParam);

  const [form, setForm] = useState<ListingFormState>(emptyForm());
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id!).single();
      if (data) {
        if (data.category) setCat(data.category);
        setForm({
          title: data.title || "",
          status: data.status || "active",
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
          category_data: (data.category_data as Record<string, unknown>) || {},
        });
      }
      setLoading(false);
    })();
  }, [id, isEdit]);

  const set = (key: keyof ListingFormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const setCatData = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, category_data: { ...prev.category_data, [key]: value } }));

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
      if (target === "cover") set("cover_image", urlData.publicUrl);
      else set("gallery_images", [...form.gallery_images, urlData.publicUrl]);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
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
      category_data: form.category_data,
      created_by: user.id,
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
      toast({ title: isEdit ? "Listing updated" : "Listing created" });
      navigate("/provider/listings");
    }
  };

  const inputCls = "bg-secondary border-border mt-1";

  const renderField = (f: { key: string; label: string; type: string; options?: string[] }) => {
    const value = form.category_data[f.key] ?? "";
    switch (f.type) {
      case "select":
        return (
          <div key={f.key}>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">{f.label}</Label>
            <Select value={String(value)} onValueChange={(v) => setCatData(f.key, v)}>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {(f.options || []).map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "textarea":
        return (
          <div key={f.key} className="sm:col-span-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">{f.label}</Label>
            <Textarea value={String(value)} onChange={(e) => setCatData(f.key, e.target.value)} className={`${inputCls} min-h-[80px]`} />
          </div>
        );
      case "toggle":
        return (
          <div key={f.key} className="flex items-center gap-3">
            <Switch checked={Boolean(value)} onCheckedChange={(v) => setCatData(f.key, v)} />
            <Label className="text-sm text-muted-foreground">{f.label}</Label>
          </div>
        );
      default:
        return (
          <div key={f.key}>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">{f.label}</Label>
            <Input type={f.type === "number" ? "number" : "text"} value={String(value)} onChange={(e) => setCatData(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} className={inputCls} />
          </div>
        );
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }

  const activeConfig = CATEGORY_FIELDS[cat] || CATEGORY_FIELDS.homes;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/provider/listings")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-primary">{activeConfig.label}</p>
            <h1 className="font-display text-2xl text-foreground">{isEdit ? "Edit Listing" : "New Listing"}</h1>
          </div>
        </div>
        <Button className="bg-gradient-gold text-primary-foreground gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>

      {/* Basic */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <h2 className="font-display text-lg text-foreground">Basic Details</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Title <span className="text-primary">*</span></Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="e.g. Maybach S-Class with Chauffeur" />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Short Description <span className="text-muted-foreground/60">(150 chars)</span></Label>
            <Input value={form.short_description} onChange={(e) => set("short_description", e.target.value.slice(0, 150))} className={inputCls} maxLength={150} />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Full Description</Label>
            <Textarea value={form.full_description} onChange={(e) => set("full_description", e.target.value.slice(0, 1500))} className={`${inputCls} min-h-[120px]`} maxLength={1500} />
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="w-40 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Country</Label>
              <Input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Neighbourhood</Label>
              <Input value={form.neighbourhood} onChange={(e) => set("neighbourhood", e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <h2 className="font-display text-lg text-foreground">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Currency</Label>
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">{activeConfig.rateLabel}</Label>
            <Input type="number" min="0" value={form.primary_rate} onChange={(e) => set("primary_rate", e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Secondary Rate</Label>
            <Input type="number" min="0" value={form.secondary_rate} onChange={(e) => set("secondary_rate", e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.custom_quote_available} onCheckedChange={(v) => set("custom_quote_available", v)} />
          <Label className="text-sm text-muted-foreground">Custom Quote Available</Label>
        </div>
      </div>

      {/* Category fields */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <h2 className="font-display text-lg text-foreground">{activeConfig.label} Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeConfig.fields.map(renderField)}
        </div>
      </div>

      {/* Media */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <h2 className="font-display text-lg text-foreground">Media</h2>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">Cover Image</Label>
          {form.cover_image ? (
            <div className="relative rounded-lg overflow-hidden aspect-video mt-2 bg-muted max-w-md">
              <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => set("cover_image", "")} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="mt-2 flex items-center gap-2 cursor-pointer">
              <Button asChild variant="outline" className="border-border" size="sm">
                <span>{uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload cover</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
            </label>
          )}
        </div>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">Gallery</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.gallery_images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => set("gallery_images", form.gallery_images.filter((_, x) => x !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-md border border-dashed border-border flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, "gallery")} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderListingForm;

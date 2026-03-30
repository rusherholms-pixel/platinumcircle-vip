import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Image, Upload, Video, Type, Trash2, GripVertical,
  Save, Plus, Eye, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useHomepageContent, useHomepageGallery, HomepageSection, GalleryImage } from "@/hooks/useHomepageContent";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const SECTION_LABELS: Record<string, string> = {
  global_hero: "Global Hero (Top of Page)",
  homes: "Luxury Homes",
  drivers: "Elite Drivers",
  experiences: "Experiences",
  security: "Personal Security",
};

const BUCKET = "homepage-assets";

const HomepageContentManager = () => {
  const { data: sections, isLoading } = useHomepageContent();
  const { data: allGallery } = useHomepageGallery();
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState("global_hero");
  const [saving, setSaving] = useState(false);

  // Local edit state
  const [editData, setEditData] = useState<Partial<HomepageSection>>({});
  const activeSection = sections?.find((s) => s.section_key === activeKey);

  useEffect(() => {
    if (activeSection) {
      setEditData({
        headline: activeSection.headline ?? "",
        subheadline: activeSection.subheadline ?? "",
        cta_label: activeSection.cta_label ?? "",
        use_video: activeSection.use_video,
        hero_image_url: activeSection.hero_image_url,
        video_url: activeSection.video_url,
      });
    }
  }, [activeSection]);

  const galleryImages = (allGallery ?? [])
    .filter((g) => g.section_key === activeKey)
    .sort((a, b) => a.display_order - b.display_order);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const validTypes = ["image/jpeg", "image/webp", "image/png"];
    const isVideo = file.type === "video/mp4";
    const maxSize = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;

    if (!validTypes.includes(file.type) && !isVideo) {
      toast({ title: "Invalid format", description: "Use JPG, WebP, PNG, or MP4.", variant: "destructive" });
      return null;
    }
    if (file.size > maxSize) {
      toast({ title: "File too large", description: `Max ${isVideo ? "50MB" : "8MB"}.`, variant: "destructive" });
      return null;
    }

    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const deleteOldFile = async (url: string | null | undefined) => {
    if (!url) return;
    try {
      const pathMatch = url.split(`${BUCKET}/`)[1];
      if (pathMatch) await supabase.storage.from(BUCKET).remove([pathMatch]);
    } catch { /* ignore cleanup errors */ }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, `hero/${activeKey}`);
    if (url) {
      await deleteOldFile(editData.hero_image_url);
      setEditData((prev) => ({ ...prev, hero_image_url: url }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, `video/${activeKey}`);
    if (url) {
      await deleteOldFile(editData.video_url);
      setEditData((prev) => ({ ...prev, video_url: url }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("homepage_content")
      .update({
        headline: editData.headline || null,
        subheadline: editData.subheadline || null,
        cta_label: editData.cta_label || null,
        hero_image_url: editData.hero_image_url || null,
        video_url: editData.video_url || null,
        use_video: editData.use_video ?? false,
      })
      .eq("section_key", activeKey);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["homepage-content"] });
    }
    setSaving(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentCount = galleryImages.length;
    if (currentCount + files.length > 6) {
      toast({ title: "Max 6 gallery images", variant: "destructive" });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], `gallery/${activeKey}`);
      if (url) {
        await supabase.from("homepage_gallery_images").insert({
          section_key: activeKey,
          image_url: url,
          display_order: currentCount + i,
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["homepage-gallery"] });
  };

  const handleDeleteGallery = async (img: GalleryImage) => {
    await deleteOldFile(img.image_url);
    await supabase.from("homepage_gallery_images").delete().eq("id", img.id);
    queryClient.invalidateQueries({ queryKey: ["homepage-gallery"] });
  };

  const handleCaptionUpdate = async (id: string, caption: string) => {
    await supabase.from("homepage_gallery_images").update({ caption }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["homepage-gallery"] });
  };

  if (isLoading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SECTION_LABELS).map(([key, label]) => (
          <Button
            key={key}
            variant={activeKey === key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveKey(key)}
            className={activeKey === key ? "bg-gradient-gold text-primary-foreground" : "border-border"}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Hero image section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Image size={16} className="text-primary" />
          <h3 className="font-display text-lg text-foreground">Hero Image</h3>
          {activeSection?.updated_at && (
            <Badge variant="outline" className="ml-auto text-[10px] text-muted-foreground border-border">
              Updated {new Date(activeSection.updated_at).toLocaleDateString()}
            </Badge>
          )}
        </div>

        {editData.hero_image_url ? (
          <div className="relative rounded-lg overflow-hidden aspect-video bg-secondary">
            <img src={editData.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <label className="cursor-pointer">
                <input type="file" className="hidden" accept="image/jpeg,image/webp,image/png" onChange={handleHeroImageUpload} />
                <Button variant="outline" size="sm" className="border-foreground/30 text-foreground gap-2" asChild>
                  <span><Upload size={14} /> Replace</span>
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:border-primary/50 transition-colors">
            <Upload size={32} className="text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Upload hero image (1920×1080+, JPG/WebP, max 8MB)</span>
            <input type="file" className="hidden" accept="image/jpeg,image/webp,image/png" onChange={handleHeroImageUpload} />
          </label>
        )}

        {/* Video upload (global hero only) */}
        {activeKey === "global_hero" && (
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <Video size={16} className="text-primary" />
              <span className="text-sm text-foreground">Hero Video (optional)</span>
              <div className="ml-auto flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Use video</Label>
                <Switch
                  checked={editData.use_video ?? false}
                  onCheckedChange={(v) => setEditData((prev) => ({ ...prev, use_video: v }))}
                />
              </div>
            </div>
            {editData.video_url ? (
              <div className="relative rounded-lg overflow-hidden aspect-video bg-secondary">
                <video src={editData.video_url} className="w-full h-full object-cover" muted loop />
                <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" accept="video/mp4" onChange={handleVideoUpload} />
                    <Button variant="outline" size="sm" className="border-foreground/30 text-foreground gap-2" asChild>
                      <span><Upload size={14} /> Replace</span>
                    </Button>
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                <Video size={24} className="text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Upload MP4 (max 30s, max 50MB)</span>
                <input type="file" className="hidden" accept="video/mp4" onChange={handleVideoUpload} />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Text overlay fields */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Type size={16} className="text-primary" />
          <h3 className="font-display text-lg text-foreground">Overlay Text</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Headline</Label>
            <Input
              value={editData.headline ?? ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, headline: e.target.value }))}
              className="bg-secondary border-border mt-1"
              placeholder="e.g. Arrive in Style"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Subheadline</Label>
            <Input
              value={editData.subheadline ?? ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, subheadline: e.target.value }))}
              className="bg-secondary border-border mt-1"
              placeholder="e.g. Private drivers in every city"
            />
          </div>
        </div>
        {activeKey === "global_hero" && (
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">CTA Button Label</Label>
            <Input
              value={editData.cta_label ?? ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, cta_label: e.target.value }))}
              className="bg-secondary border-border mt-1 max-w-xs"
              placeholder="e.g. Apply for Membership"
            />
          </div>
        )}
      </div>

      {/* Gallery images */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Image size={16} className="text-primary" />
            <h3 className="font-display text-lg text-foreground">Gallery Images</h3>
            <span className="text-xs text-muted-foreground">({galleryImages.length}/6)</span>
          </div>
          {galleryImages.length < 6 && (
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept="image/jpeg,image/webp,image/png" multiple onChange={handleGalleryUpload} />
              <Button variant="outline" size="sm" className="border-border gap-2" asChild>
                <span><Plus size={14} /> Add Images</span>
              </Button>
            </label>
          )}
        </div>

        {galleryImages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No gallery images yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryImages.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border bg-secondary">
                <img src={img.image_url} alt={img.caption ?? ""} className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="destructive" size="icon" className="h-8 w-8"
                    onClick={() => handleDeleteGallery(img)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="p-2">
                  <Input
                    defaultValue={img.caption ?? ""}
                    placeholder="Caption..."
                    className="bg-card border-border text-xs h-7"
                    onBlur={(e) => handleCaptionUpdate(img.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-gold text-primary-foreground gap-2 px-8"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Publish Changes
        </Button>
      </div>
    </div>
  );
};

export default HomepageContentManager;

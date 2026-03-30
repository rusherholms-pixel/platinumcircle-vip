import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomepageSection {
  id: string;
  section_key: string;
  hero_image_url: string | null;
  video_url: string | null;
  use_video: boolean;
  headline: string | null;
  subheadline: string | null;
  cta_label: string | null;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  section_key: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

export const useHomepageContent = () => {
  return useQuery({
    queryKey: ["homepage-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .order("section_key");
      if (error) throw error;
      return data as HomepageSection[];
    },
    staleTime: 60_000,
  });
};

export const useHomepageGallery = (sectionKey?: string) => {
  return useQuery({
    queryKey: ["homepage-gallery", sectionKey],
    queryFn: async () => {
      let q = supabase
        .from("homepage_gallery_images")
        .select("*")
        .order("display_order");
      if (sectionKey) q = q.eq("section_key", sectionKey);
      const { data, error } = await q;
      if (error) throw error;
      return data as GalleryImage[];
    },
    staleTime: 60_000,
  });
};

export const useSection = (key: string) => {
  const { data: sections, isLoading } = useHomepageContent();
  const section = sections?.find((s) => s.section_key === key);
  return { section, isLoading };
};

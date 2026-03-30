import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  tags: string[];
  description: string | null;
  who_its_for: string | null;
  included_items: string[];
  addon_options: string[];
  hero_image_url: string | null;
  gallery_images: string[] | null;
  starting_price: string | null;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  is_featured: boolean;
  featured_order: number;
  featured_card_image: string | null;
  featured_description: string | null;
  display_order: number;
}

export const useBundles = () => {
  return useQuery({
    queryKey: ["bundles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as Bundle[];
    },
    staleTime: 60_000,
  });
};

export const useFeaturedBundles = () => {
  return useQuery({
    queryKey: ["bundles-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("featured_order")
        .limit(4);
      if (error) throw error;
      return data as Bundle[];
    },
    staleTime: 60_000,
  });
};

export const useBundle = (slug: string) => {
  return useQuery({
    queryKey: ["bundle", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as Bundle | null;
    },
    enabled: !!slug,
  });
};

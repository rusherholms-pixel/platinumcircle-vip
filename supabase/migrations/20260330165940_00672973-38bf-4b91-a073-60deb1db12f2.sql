
-- Homepage content sections table
CREATE TABLE public.homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL, -- 'global_hero', 'homes', 'drivers', 'experiences', 'security'
  hero_image_url text,
  video_url text,
  use_video boolean NOT NULL DEFAULT false,
  headline text,
  subheadline text,
  cta_label text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Gallery images per section
CREATE TABLE public.homepage_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL REFERENCES public.homepage_content(section_key) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_gallery_images ENABLE ROW LEVEL SECURITY;

-- Everyone can read homepage content (public pages)
CREATE POLICY "Anyone can view homepage content" ON public.homepage_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage homepage content" ON public.homepage_content FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view gallery images" ON public.homepage_gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage gallery images" ON public.homepage_gallery_images FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default section rows
INSERT INTO public.homepage_content (section_key, headline, subheadline) VALUES
  ('global_hero', 'Luxury Without Limits', 'Connecting you with elite homes, private chauffeurs, curated experiences, and personal security.'),
  ('homes', 'Luxury Homes', 'Private villas, penthouses & estates curated for the discerning traveler.'),
  ('drivers', 'Elite Drivers', 'Vetted chauffeurs with premium vehicles, available on demand.'),
  ('experiences', 'Experiences', 'VIP access to clubs, restaurants, spas & exclusive events.'),
  ('security', 'Personal Security', 'Discreet, professional protection for complete peace of mind.');

-- Storage bucket for homepage assets
INSERT INTO storage.buckets (id, name, public) VALUES ('homepage-assets', 'homepage-assets', true);

-- Storage policies
CREATE POLICY "Anyone can view homepage assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'homepage-assets');
CREATE POLICY "Admins can upload homepage assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'homepage-assets' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update homepage assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'homepage-assets' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete homepage assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'homepage-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER homepage_content_updated_at BEFORE UPDATE ON public.homepage_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

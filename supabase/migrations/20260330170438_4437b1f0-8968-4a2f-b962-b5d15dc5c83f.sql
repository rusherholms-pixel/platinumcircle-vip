
-- Bundles table
CREATE TABLE public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  tags text[] NOT NULL DEFAULT '{}',
  description text,
  who_its_for text,
  included_items jsonb NOT NULL DEFAULT '[]',
  addon_options jsonb NOT NULL DEFAULT '[]',
  hero_image_url text,
  gallery_images text[] DEFAULT '{}',
  starting_price text,
  testimonial_quote text,
  testimonial_author text,
  is_featured boolean DEFAULT false,
  featured_order integer DEFAULT 0,
  featured_card_image text,
  featured_description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Bundle customization requests
CREATE TABLE public.bundle_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES public.bundles(id),
  bundle_name text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  num_guests integer,
  destination_city text,
  destination_country text,
  travel_date_start date,
  travel_date_end date,
  selected_addons text[] DEFAULT '{}',
  special_requests text,
  budget_range text,
  preferred_contact text DEFAULT 'email',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can view active bundles
CREATE POLICY "Anyone can view bundles" ON public.bundles FOR SELECT TO anon, authenticated USING (is_active = true);
-- Admins can manage bundles
CREATE POLICY "Admins can manage bundles" ON public.bundles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can submit requests
CREATE POLICY "Anyone can submit bundle requests" ON public.bundle_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Admins can view/manage requests
CREATE POLICY "Admins can manage bundle requests" ON public.bundle_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER bundles_updated_at BEFORE UPDATE ON public.bundles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

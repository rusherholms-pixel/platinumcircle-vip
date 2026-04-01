
-- Listings table: a unified table for all listing categories
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('homes', 'drivers', 'car_fleets', 'experiences', 'security')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'pending_review', 'inactive')),
  short_description TEXT,
  full_description TEXT,
  country TEXT,
  city TEXT,
  neighbourhood TEXT,
  currency TEXT DEFAULT 'USD',
  primary_rate NUMERIC,
  secondary_rate NUMERIC,
  custom_quote_available BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  video_url TEXT,
  category_data JSONB DEFAULT '{}'::jsonb,
  verification_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all listings" ON public.listings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active listings" ON public.listings
  FOR SELECT TO authenticated
  USING (status = 'active');

-- Update trigger
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add account_status to profiles for member management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS restriction_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS restriction_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS restriction_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

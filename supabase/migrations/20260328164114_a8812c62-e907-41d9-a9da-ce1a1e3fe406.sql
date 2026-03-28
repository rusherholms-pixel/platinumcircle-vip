-- Create properties table for luxury listings
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  price_per_night NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  max_guests INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  property_type TEXT NOT NULL DEFAULT 'villa',
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view properties
CREATE POLICY "Authenticated users can view properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (true);

-- Hosts can insert their own properties
CREATE POLICY "Hosts can insert properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Hosts can update their own properties
CREATE POLICY "Hosts can update their properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Hosts can delete their own properties
CREATE POLICY "Hosts can delete their properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
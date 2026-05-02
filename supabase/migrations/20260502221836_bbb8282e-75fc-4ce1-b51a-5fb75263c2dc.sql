CREATE TABLE public.rental_deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company text,
  phone_number text,
  city text,
  insurance_type text,
  manager_name text,
  relocation_service text,
  source_id text,
  source_table text DEFAULT 'processed_data',
  parsed_by text DEFAULT 'rule_based',
  raw_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rental_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rental deals"
ON public.rental_deals
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_rental_deals_updated_at
BEFORE UPDATE ON public.rental_deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_rental_deals_source_id ON public.rental_deals(source_id);
CREATE INDEX idx_rental_deals_created_at ON public.rental_deals(created_at DESC);
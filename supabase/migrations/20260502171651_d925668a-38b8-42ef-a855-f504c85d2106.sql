-- Add scout workflow columns to partners_raw
ALTER TABLE public.partners_raw
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS contacted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS follow_up_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS last_contact_channel text;

CREATE INDEX IF NOT EXISTS idx_partners_raw_assigned_to ON public.partners_raw(assigned_to);
CREATE INDEX IF NOT EXISTS idx_partners_raw_follow_up_at ON public.partners_raw(follow_up_at);

-- Create a dedicated curated table for promoted scout leads
CREATE TABLE IF NOT EXISTS public.partnership_scout_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_partner_id uuid REFERENCES public.partners_raw(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  industry text,
  contact_name text,
  contact_email text,
  contact_phone text,
  source_url text,
  opportunity_type text[] DEFAULT '{}',
  priority_score numeric(3,2) CHECK (priority_score >= 0 AND priority_score <= 1),
  stage text NOT NULL DEFAULT 'qualified'
    CHECK (stage IN ('qualified','outreach','meeting','proposal','won','lost')),
  assigned_to uuid,
  next_action text,
  next_action_at timestamp with time zone,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pscout_stage ON public.partnership_scout_leads(stage);
CREATE INDEX IF NOT EXISTS idx_pscout_assigned ON public.partnership_scout_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pscout_priority ON public.partnership_scout_leads(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_pscout_next_action ON public.partnership_scout_leads(next_action_at);

ALTER TABLE public.partnership_scout_leads ENABLE ROW LEVEL SECURITY;

-- Admins manage everything
CREATE POLICY "Admins can manage partnership_scout_leads"
  ON public.partnership_scout_leads
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Service role insert (edge function ingestion)
CREATE POLICY "Service role can insert partnership_scout_leads"
  ON public.partnership_scout_leads
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_partnership_scout_leads_updated_at ON public.partnership_scout_leads;
CREATE TRIGGER update_partnership_scout_leads_updated_at
  BEFORE UPDATE ON public.partnership_scout_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
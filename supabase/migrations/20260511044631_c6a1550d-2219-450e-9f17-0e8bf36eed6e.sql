
-- meta_campaigns
CREATE TABLE public.meta_campaigns (
  id text PRIMARY KEY,
  name text NOT NULL,
  objective text,
  status text,
  daily_budget numeric,
  lifetime_budget numeric,
  spend numeric DEFAULT 0,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpl numeric DEFAULT 0,
  leads_count integer DEFAULT 0,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meta_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage meta_campaigns" ON public.meta_campaigns FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts meta_campaigns" ON public.meta_campaigns FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service updates meta_campaigns" ON public.meta_campaigns FOR UPDATE TO public
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- meta_ads
CREATE TABLE public.meta_ads (
  id text PRIMARY KEY,
  campaign_id text REFERENCES public.meta_campaigns(id) ON DELETE CASCADE,
  adset_id text,
  name text NOT NULL,
  status text,
  creative_summary text,
  spend numeric DEFAULT 0,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  leads_count integer DEFAULT 0,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meta_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage meta_ads" ON public.meta_ads FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts meta_ads" ON public.meta_ads FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service updates meta_ads" ON public.meta_ads FOR UPDATE TO public
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- meta_lead_forms
CREATE TABLE public.meta_lead_forms (
  id text PRIMARY KEY,
  page_id text,
  name text NOT NULL,
  questions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meta_lead_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage meta_lead_forms" ON public.meta_lead_forms FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts meta_lead_forms" ON public.meta_lead_forms FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

-- meta_webhook_log
CREATE TABLE public.meta_webhook_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  payload jsonb,
  processed boolean DEFAULT false,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meta_webhook_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view meta_webhook_log" ON public.meta_webhook_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts meta_webhook_log" ON public.meta_webhook_log FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

-- mia_optimizer_actions
CREATE TABLE public.mia_optimizer_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target_id text NOT NULL,
  action_type text NOT NULL,
  reasoning text,
  proposed_value jsonb,
  status text NOT NULL DEFAULT 'suggested',
  admin_id uuid,
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mia_optimizer_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage mia_optimizer_actions" ON public.mia_optimizer_actions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts mia_optimizer_actions" ON public.mia_optimizer_actions FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

-- Extend mia_leads
ALTER TABLE public.mia_leads
  ADD COLUMN IF NOT EXISTS meta_lead_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS meta_form_id text,
  ADD COLUMN IF NOT EXISTS meta_campaign_id text,
  ADD COLUMN IF NOT EXISTS meta_ad_id text,
  ADD COLUMN IF NOT EXISTS messenger_psid text,
  ADD COLUMN IF NOT EXISTS quality_score text,
  ADD COLUMN IF NOT EXISTS mia_first_reply text,
  ADD COLUMN IF NOT EXISTS mia_handoff_state text;

-- triggers for updated_at
CREATE TRIGGER trg_meta_campaigns_updated BEFORE UPDATE ON public.meta_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_meta_ads_updated BEFORE UPDATE ON public.meta_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meta_ads_campaign ON public.meta_ads(campaign_id);
CREATE INDEX idx_mia_leads_meta_campaign ON public.mia_leads(meta_campaign_id);
CREATE INDEX idx_mia_optimizer_status ON public.mia_optimizer_actions(status);

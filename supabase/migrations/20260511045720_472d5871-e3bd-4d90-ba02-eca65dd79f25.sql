
CREATE TABLE public.mia_lead_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.mia_leads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('mia','lead','admin','system')),
  channel text NOT NULL DEFAULT 'messenger',
  content text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mia_lead_messages_lead ON public.mia_lead_messages(lead_id, created_at);

ALTER TABLE public.mia_lead_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage mia lead messages"
ON public.mia_lead_messages
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service inserts mia lead messages"
ON public.mia_lead_messages
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.mia_leads
  ADD COLUMN IF NOT EXISTS handoff_at timestamptz,
  ADD COLUMN IF NOT EXISTS handoff_admin_id uuid;

ALTER PUBLICATION supabase_realtime ADD TABLE public.mia_lead_messages;

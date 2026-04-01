
CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type text NOT NULL,
  action_description text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity logs"
ON public.admin_activity_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs (created_at DESC);
CREATE INDEX idx_admin_activity_logs_admin_id ON public.admin_activity_logs (admin_id);
CREATE INDEX idx_admin_activity_logs_action_type ON public.admin_activity_logs (action_type);

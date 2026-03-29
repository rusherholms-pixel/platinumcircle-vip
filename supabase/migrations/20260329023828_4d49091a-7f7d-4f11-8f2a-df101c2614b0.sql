
-- Tighten the applications insert policy to only allow specific fields
DROP POLICY "Anyone can submit applications" ON public.applications;
CREATE POLICY "Anyone can submit applications"
ON public.applications FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL);

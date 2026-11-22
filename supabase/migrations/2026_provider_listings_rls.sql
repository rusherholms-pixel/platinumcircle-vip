-- Allow approved providers to create & manage listings under categories they
-- selected at signup. Providers are authenticated; ownership is enforced by
-- created_by = auth.uid(), and the category gate checks the provider's own
-- approved 'provider' application (service_categories).
-- Additive/idempotent: DROP POLICY IF EXISTS guards allow safe re-runs.

-- 1) Provider can view their own listings (incl. drafts/future states).
DROP POLICY IF EXISTS "Providers can view own listings" ON public.listings;
CREATE POLICY "Providers can view own listings"
  ON public.listings FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
  );

-- 2) Provider can insert a listing into a category they were approved for.
DROP POLICY IF EXISTS "Providers can insert own listings" ON public.listings;
CREATE POLICY "Providers can insert own listings"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      category IS NULL
      OR category = ANY (ARRAY(
        SELECT unnest(service_categories)
        FROM public.applications
        WHERE user_id = auth.uid()
          AND applicant_type = 'provider'
          AND status = 'approved'
      ))
    )
  );

-- 3) Provider can update their own listings.
DROP POLICY IF EXISTS "Providers can update own listings" ON public.listings;
CREATE POLICY "Providers can update own listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 4) Provider can delete their own listings.
DROP POLICY IF EXISTS "Providers can delete own listings" ON public.listings;
CREATE POLICY "Providers can delete own listings"
  ON public.listings FOR DELETE TO authenticated
  USING (created_by = auth.uid());

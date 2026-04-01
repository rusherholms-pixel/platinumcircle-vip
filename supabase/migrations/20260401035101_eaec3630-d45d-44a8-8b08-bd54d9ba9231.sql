
-- Allow admins to insert profiles (for creating members)
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete profiles (for deleting members)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

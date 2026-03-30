
-- Private inquiries table
CREATE TABLE public.private_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text NOT NULL,
  looking_for text,
  preferred_contact text DEFAULT 'email',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.private_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit inquiries" ON public.private_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can manage inquiries" ON public.private_inquiries
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE,
  referred_email text,
  referred_user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  credit_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT TO authenticated USING (referrer_id = auth.uid());

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

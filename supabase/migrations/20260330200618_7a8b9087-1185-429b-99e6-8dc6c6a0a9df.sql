
-- Create booking_requests table
CREATE TABLE public.booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'housing', 'security', 'drivers', 'experiences'
  service_title TEXT NOT NULL,
  service_id UUID, -- optional reference to property/bundle
  check_in DATE,
  check_out DATE,
  num_guests INTEGER DEFAULT 1,
  special_requests TEXT,
  preferred_contact TEXT DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Members can create their own requests
CREATE POLICY "Members can create booking requests"
  ON public.booking_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Members can view their own requests
CREATE POLICY "Members can view own booking requests"
  ON public.booking_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all requests
CREATE POLICY "Admins can manage all booking requests"
  ON public.booking_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

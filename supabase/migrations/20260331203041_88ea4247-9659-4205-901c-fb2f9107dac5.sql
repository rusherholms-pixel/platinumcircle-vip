
-- Conversations table (one per member)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'open',
  is_priority boolean NOT NULL DEFAULT false,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  attachment_url text,
  attachment_name text,
  attachment_type text,
  is_internal_note boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Mia leads table
CREATE TABLE public.mia_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_name text NOT NULL,
  email text,
  phone text,
  interest text,
  timeline text,
  group_size text,
  conversation_summary text,
  escalation_reason text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'mia_ai',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Concierge status table (singleton)
CREATE TABLE public.concierge_status (
  id integer PRIMARY KEY DEFAULT 1,
  status text NOT NULL DEFAULT 'online',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.concierge_status (id, status) VALUES (1, 'online');

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mia_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_status ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
CREATE POLICY "Members can view own conversation" ON public.conversations
  FOR SELECT TO authenticated USING (member_id = auth.uid());
CREATE POLICY "Members can create own conversation" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (member_id = auth.uid());
CREATE POLICY "Admins can manage all conversations" ON public.conversations
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Messages RLS
CREATE POLICY "Members can view own messages (non-internal)" ON public.messages
  FOR SELECT TO authenticated USING (
    is_internal_note = false AND
    conversation_id IN (SELECT id FROM public.conversations WHERE member_id = auth.uid())
  );
CREATE POLICY "Members can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND
    is_internal_note = false AND
    conversation_id IN (SELECT id FROM public.conversations WHERE member_id = auth.uid())
  );
CREATE POLICY "Admins can manage all messages" ON public.messages
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Notifications RLS
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Mia leads - admin only
CREATE POLICY "Admins can manage mia leads" ON public.mia_leads
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Service can insert leads" ON public.mia_leads
  FOR INSERT TO public WITH CHECK (auth.role() = 'service_role');

-- Concierge status - anyone can read
CREATE POLICY "Anyone can view concierge status" ON public.concierge_status
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update concierge status" ON public.concierge_status
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Updated_at triggers
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mia_leads_updated_at BEFORE UPDATE ON public.mia_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create private storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', false);

-- Storage RLS for message attachments
CREATE POLICY "Members can upload msg attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Members can view own msg attachments" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins can view all msg attachments" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'message-attachments' AND public.has_role(auth.uid(), 'admin'));

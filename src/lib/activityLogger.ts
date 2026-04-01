import { supabase } from "@/integrations/supabase/client";

type ActivityParams = {
  actionType: string;
  description: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export async function logAdminActivity({
  actionType,
  description,
  targetType,
  targetId,
  metadata,
}: ActivityParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("admin_activity_logs" as any).insert({
    admin_id: user.id,
    action_type: actionType,
    action_description: description,
    target_type: targetType || null,
    target_id: targetId || null,
    metadata: metadata || {},
  });
}

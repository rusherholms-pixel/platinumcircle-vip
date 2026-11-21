import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for where a signed-in user should land after
 * authentication, based on their roles in `public.user_roles`.
 *
 * A fresh account always carries at least the auto-assigned `member` role
 * (handled by the `handle_new_user_role` trigger), so this never returns empty.
 * Returns the app route path for the user's highest-privilege role.
 */
export async function getRoleRedirectPath(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error || !data || data.length === 0) {
      return "/member/dashboard";
    }

    const roleSet = new Set(data.map((r) => r.role as string));

    if (roleSet.has("admin")) return "/admin";
    if (roleSet.has("provider")) return "/provider/dashboard";
    return "/member/dashboard";
  } catch {
    return "/member/dashboard";
  }
}

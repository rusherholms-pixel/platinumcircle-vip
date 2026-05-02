import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { limit = 100, offset = 0 } = await req.json().catch(() => ({}));
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    const externalUrl = "https://vraxmojlnkxlddenfrjv.supabase.co";
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY');

    if (!externalKey) {
      throw new Error('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    const externalSupabase = createClient(externalUrl, externalKey);

    const { data, error, count } = await externalSupabase
      .from("partnership_scout_leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (error) {
      console.error('External DB error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const total = count ?? 0;
    const returned = (data || []).length;
    const hasMore = safeOffset + returned < total;

    return new Response(
      JSON.stringify({
        leads: data || [],
        total,
        offset: safeOffset,
        limit: safeLimit,
        returned,
        has_more: hasMore,
        next_offset: hasMore ? safeOffset + returned : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

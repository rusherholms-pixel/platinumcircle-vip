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
    const { limit = 50 } = await req.json().catch(() => ({}));

    // External Supabase credentials
    const externalUrl = "https://vraxmojlnkxlddenfrjv.supabase.co";
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY');

    if (!externalKey) {
      throw new Error('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    // Create external Supabase client
    const externalSupabase = createClient(externalUrl, externalKey);

    // Fetch data from external database
    // You'll need to adjust the table name based on your actual schema
    const { data, error } = await externalSupabase
      .from("leads") // Change this to your actual table name
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error('External DB error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ leads: data || [] }),
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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const GRAPH = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Admin auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (!claims?.claims?.sub) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: roleCheck } = await admin.from("user_roles").select("role").eq("user_id", claims.claims.sub).eq("role", "admin").maybeSingle();
  if (!roleCheck) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

  const { action, params } = await req.json();
  const AD_ACCOUNT = Deno.env.get("META_AD_ACCOUNT_ID")!;
  const TOKEN = Deno.env.get("META_ACCESS_TOKEN")!;

  try {
    let url = "";
    let method: "GET" | "POST" = "GET";
    const form = new URLSearchParams();

    switch (action) {
      case "list_campaigns":
        url = `${GRAPH}/${AD_ACCOUNT}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${TOKEN}`;
        break;
      case "list_ads":
        url = `${GRAPH}/${AD_ACCOUNT}/ads?fields=id,name,status,campaign_id&access_token=${TOKEN}`;
        break;
      case "pause_campaign":
        url = `${GRAPH}/${params.campaign_id}`;
        method = "POST";
        form.set("status", "PAUSED");
        form.set("access_token", TOKEN);
        break;
      case "resume_campaign":
        url = `${GRAPH}/${params.campaign_id}`;
        method = "POST";
        form.set("status", "ACTIVE");
        form.set("access_token", TOKEN);
        break;
      case "pause_ad":
        url = `${GRAPH}/${params.ad_id}`;
        method = "POST";
        form.set("status", "PAUSED");
        form.set("access_token", TOKEN);
        break;
      case "resume_ad":
        url = `${GRAPH}/${params.ad_id}`;
        method = "POST";
        form.set("status", "ACTIVE");
        form.set("access_token", TOKEN);
        break;
      case "update_budget":
        url = `${GRAPH}/${params.campaign_id}`;
        method = "POST";
        form.set("daily_budget", String(Math.round(Number(params.daily_budget) * 100)));
        form.set("access_token", TOKEN);
        break;
      case "create_campaign":
        url = `${GRAPH}/${AD_ACCOUNT}/campaigns`;
        method = "POST";
        form.set("name", params.name);
        form.set("objective", params.objective ?? "LEAD_GENERATION");
        form.set("status", params.status ?? "PAUSED");
        form.set("special_ad_categories", "[]");
        if (params.daily_budget) form.set("daily_budget", String(Math.round(Number(params.daily_budget) * 100)));
        form.set("access_token", TOKEN);
        break;
      case "subscribe_page": {
        const PAGE_ID = Deno.env.get("META_PAGE_ID")!;
        const PAGE_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN") || TOKEN;
        url = `${GRAPH}/${PAGE_ID}/subscribed_apps`;
        method = "POST";
        form.set("subscribed_fields", "leadgen,messages");
        form.set("access_token", PAGE_TOKEN);
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const r = await fetch(url, { method, body: method === "POST" ? form : undefined });
    const data = await r.json();
    return new Response(JSON.stringify(data), { status: r.ok ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

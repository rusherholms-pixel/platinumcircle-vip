import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { data: campaigns } = await supabase.from("meta_campaigns").select("*").order("spend", { ascending: false });
    if (!campaigns?.length) {
      return new Response(JSON.stringify({ ok: true, message: "No campaigns to analyze" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const summary = campaigns.map((c) => ({
      id: c.id, name: c.name, status: c.status,
      daily_budget: c.daily_budget, spend: c.spend,
      impressions: c.impressions, clicks: c.clicks,
      ctr: c.ctr, cpl: c.cpl, leads: c.leads_count,
    }));

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are Mia, an expert Meta Ads optimizer for Platinum Circle (luxury VIP concierge).
Analyze last-7-day campaign data. Recommend concrete actions ONLY where data is strong enough.
Rules: pause if spend > $50 and 0 leads; raise budget 25% on winners (cpl < $30 and leads >= 3); lower budget 25% on underperformers (cpl > $80); duplicate top performers.`,
          },
          { role: "user", content: `Campaign performance (last 7 days):\n${JSON.stringify(summary, null, 2)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_actions",
            description: "Return prioritized optimizer actions",
            parameters: {
              type: "object",
              properties: {
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      target_type: { type: "string", enum: ["campaign", "ad"] },
                      target_id: { type: "string" },
                      action_type: { type: "string", enum: ["pause", "resume", "increase_budget", "decrease_budget", "duplicate"] },
                      reasoning: { type: "string" },
                      proposed_value: { type: "object", description: "e.g. {daily_budget: 100}" },
                    },
                    required: ["target_type", "target_id", "action_type", "reasoning"],
                  },
                },
              },
              required: ["actions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_actions" } },
      }),
    });

    if (!aiRes.ok) throw new Error(`AI gateway ${aiRes.status}`);
    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const { actions = [] } = toolCall ? JSON.parse(toolCall.function.arguments) : { actions: [] };

    let inserted = 0;
    for (const a of actions) {
      await supabase.from("mia_optimizer_actions").insert({
        target_type: a.target_type,
        target_id: a.target_id,
        action_type: a.action_type,
        reasoning: a.reasoning,
        proposed_value: a.proposed_value ?? {},
        status: "suggested",
      });
      inserted++;
    }

    // Notify admins
    if (inserted > 0) {
      const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      for (const adm of admins ?? []) {
        await supabase.from("notifications").insert({
          user_id: adm.user_id,
          title: "Mia ad recommendations ready",
          body: `${inserted} optimization action${inserted > 1 ? "s" : ""} awaiting your review`,
          link: "/admin/meta-ads",
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, actions_created: inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("mia-ad-optimizer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: corsHeaders });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lead_id } = await req.json();
    if (!lead_id) return new Response(JSON.stringify({ error: "lead_id required" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: lead } = await supabase.from("mia_leads").select("*").eq("id", lead_id).single();
    if (!lead) return new Response(JSON.stringify({ error: "lead not found" }), { status: 404, headers: corsHeaders });

    // Pull ad/campaign context for richer scoring
    let adContext = "";
    if (lead.meta_ad_id) {
      const { data: ad } = await supabase.from("meta_ads").select("name, creative_summary").eq("id", lead.meta_ad_id).maybeSingle();
      if (ad) adContext = `Ad: ${ad.name}. Creative: ${ad.creative_summary ?? "n/a"}`;
    }

    // Lovable AI structured scoring
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are Mia, the Platinum Circle concierge. Score and triage incoming leads from Meta Ads.
Brand: VIP luxury concierge — nightlife, bachelor parties, F1 weekend, elite homes, security, drivers.
Rules: 2-3 sentence first reply max. NEVER use exclamation marks. NEVER invent prices. Direct, warm, discreet.`,
          },
          {
            role: "user",
            content: `New lead from Meta Ads.
Name: ${lead.lead_name}
Email: ${lead.email ?? "n/a"}
Phone: ${lead.phone ?? "n/a"}
Interest: ${lead.interest ?? "n/a"}
Form fields: ${lead.conversation_summary ?? "n/a"}
${adContext}

Score quality (hot = ready to book / clear intent / premium fit; warm = curious / partial info; cold = vague / unqualified).
Write a personalized 2-3 sentence first reply addressed to them.`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "triage_lead",
            description: "Score the lead and craft the first reply",
            parameters: {
              type: "object",
              properties: {
                quality_score: { type: "string", enum: ["hot", "warm", "cold"] },
                summary: { type: "string", description: "1-2 sentence summary of who this lead is and what they want" },
                first_reply: { type: "string", description: "Mia's first reply, 2-3 sentences, no exclamation marks" },
                recommended_action: { type: "string" },
              },
              required: ["quality_score", "summary", "first_reply", "recommended_action"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "triage_lead" } },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, txt);
      throw new Error(`AI gateway ${aiRes.status}`);
    }
    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const triage = toolCall ? JSON.parse(toolCall.function.arguments) : { quality_score: "warm", summary: "", first_reply: "", recommended_action: "" };

    // Update lead
    await supabase.from("mia_leads").update({
      quality_score: triage.quality_score,
      conversation_summary: triage.summary || lead.conversation_summary,
      mia_first_reply: triage.first_reply,
      mia_handoff_state: "engaging",
      escalation_reason: triage.quality_score === "hot" ? "High-quality Meta Ads lead" : null,
    }).eq("id", lead_id);

    // Seed the conversation thread with Mia's opening reply
    if (triage.first_reply) {
      await supabase.from("mia_lead_messages").insert({
        lead_id, role: "mia", channel: lead.messenger_psid ? "messenger" : "internal", content: triage.first_reply,
      });
    }

    // If Messenger PSID present, send first reply
    if (lead.messenger_psid && triage.first_reply) {
      const PAGE_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN");
      if (PAGE_TOKEN) {
        try {
          await fetch(`${GRAPH}/me/messages?access_token=${PAGE_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: lead.messenger_psid },
              messaging_type: "RESPONSE",
              message: { text: triage.first_reply },
            }),
          });
        } catch (e) { console.error("Messenger send failed:", e); }
      }
    }

    // Hot leads → admin notification + escalation email
    if (triage.quality_score === "hot") {
      const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      for (const a of admins ?? []) {
        await supabase.from("notifications").insert({
          user_id: a.user_id,
          title: "🔥 Hot Meta Ads lead",
          body: `${lead.lead_name} — ${triage.summary}`,
          link: "/admin/mia-leads",
        });
      }
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            template: "mia-escalation",
            to: "support@platinumcircle.vip",
            data: {
              lead_name: lead.lead_name,
              email: lead.email,
              phone: lead.phone,
              interest: lead.interest,
              summary: triage.summary,
              quality_score: triage.quality_score,
              source: "Meta Ads",
            },
          },
        });
      } catch (e) { console.error("email failed:", e); }
    }

    return new Response(JSON.stringify({ ok: true, triage }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("mia-process-lead error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: corsHeaders });
  }
});

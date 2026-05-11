import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

const MIA_SYSTEM = `You are Mia, the AI concierge for Platinum Circle — an invitation-only VIP luxury concierge marketplace (private homes, drivers, security, experiences, signature bundles).

CONVERSATION STYLE
- Warm, confident, refined. Never pushy.
- Maximum 2-3 sentences per reply. Concise and elevated.
- Never use exclamation marks. Never use words like cheap, deal, discount, affordable.
- Use: curated, bespoke, tailored, discreet, seamless.
- Address the lead by first name when known.

GOAL OF EVERY CONVERSATION
1. Qualify: destination, dates, group size, occasion, services of interest.
2. Capture missing contact (email or WhatsApp/phone) if not already in the lead record.
3. Build excitement around the right bundle/service.
4. Hand off to a senior concierge once intent is clear, budget is sizeable, dates are within 14 days, or the lead asks to speak to a human.

PRICING
Never invent prices. Say: "Pricing is fully bespoke — our concierge will prepare a tailored proposal."

HANDOFF SIGNAL
When ready to hand off, end your reply with the EXACT token <<HANDOFF>> on its own line.
Trigger handoff when: lead explicitly asks for a human, budget appears >$10k, booking within 14 days, group of 10+, celebrity/VIP, or after qualifying details are captured.

If asked if you are an AI, answer honestly: "I am Mia, an AI concierge for Platinum Circle. Every arrangement is then personally handled by our team."`;

async function sendMessenger(psid: string, text: string) {
  const token = Deno.env.get("META_PAGE_ACCESS_TOKEN");
  if (!token) return;
  try {
    await fetch(`${GRAPH}/me/messages?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: psid },
        messaging_type: "RESPONSE",
        message: { text },
      }),
    });
  } catch (e) {
    console.error("Messenger send failed:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lead_id, inbound_text, channel = "messenger", psid, admin_text } = await req.json();
    if (!lead_id && !psid) {
      return new Response(JSON.stringify({ error: "lead_id or psid required" }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Resolve lead (by id or by messenger PSID)
    let { data: lead } = lead_id
      ? await supabase.from("mia_leads").select("*").eq("id", lead_id).maybeSingle()
      : await supabase.from("mia_leads").select("*").eq("messenger_psid", psid).maybeSingle();

    // Create a lead shell if a Messenger user wrote in without a known lead
    if (!lead && psid) {
      const { data: created } = await supabase.from("mia_leads").insert({
        lead_name: "Messenger Lead",
        source: "meta_messenger",
        status: "new",
        messenger_psid: psid,
        mia_handoff_state: "engaging",
      }).select().single();
      lead = created;
    }
    if (!lead) return new Response(JSON.stringify({ error: "lead not found" }), { status: 404, headers: corsHeaders });

    // Admin send: just record + forward to Messenger, no AI
    if (admin_text) {
      await supabase.from("mia_lead_messages").insert({
        lead_id: lead.id, role: "admin", channel: lead.messenger_psid ? "messenger" : "internal", content: admin_text,
      });
      if (lead.messenger_psid) await sendMessenger(lead.messenger_psid, admin_text);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Stop if already handed off — store message for admin but do not auto-reply
    if (lead.mia_handoff_state === "handed_off") {
      if (inbound_text) {
        await supabase.from("mia_lead_messages").insert({
          lead_id: lead.id, role: "lead", channel, content: inbound_text,
        });
        // Notify admins of new inbound after handoff
        const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
        for (const a of admins ?? []) {
          await supabase.from("notifications").insert({
            user_id: a.user_id,
            title: "New message on handed-off Mia lead",
            body: `${lead.lead_name}: ${inbound_text.substring(0, 120)}`,
            link: "/admin/mia-leads",
          });
        }
      }
      return new Response(JSON.stringify({ ok: true, skipped: "handed_off" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Store inbound lead message
    if (inbound_text) {
      await supabase.from("mia_lead_messages").insert({
        lead_id: lead.id, role: "lead", channel, content: inbound_text,
      });
    }

    // Build conversation history
    const { data: history } = await supabase
      .from("mia_lead_messages")
      .select("role, content")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: true })
      .limit(40);

    const leadContext = `Lead profile:
- Name: ${lead.lead_name}
- Email: ${lead.email ?? "unknown"}
- Phone: ${lead.phone ?? "unknown"}
- Interest: ${lead.interest ?? "unknown"}
- Source: ${lead.source}
- Quality so far: ${lead.quality_score ?? "unscored"}`;

    const messages = [
      { role: "system", content: MIA_SYSTEM },
      { role: "system", content: leadContext },
      ...(history ?? []).map((m) => ({
        role: m.role === "mia" ? "assistant" : m.role === "lead" ? "user" : "system",
        content: m.content,
      })),
    ];

    // Call Lovable AI
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_KEY) throw new Error("LOVABLE_API_KEY missing");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });
    if (!aiRes.ok) {
      console.error("AI gateway:", aiRes.status, await aiRes.text());
      throw new Error(`AI gateway ${aiRes.status}`);
    }
    const aiJson = await aiRes.json();
    let reply: string = aiJson.choices?.[0]?.message?.content ?? "";

    // Detect handoff signal
    const handoff = /<<HANDOFF>>/.test(reply);
    reply = reply.replace(/<<HANDOFF>>/g, "").trim();

    // Save Mia reply
    if (reply) {
      await supabase.from("mia_lead_messages").insert({
        lead_id: lead.id, role: "mia", channel, content: reply,
      });
      if (lead.messenger_psid && channel === "messenger") {
        await sendMessenger(lead.messenger_psid, reply);
      }
    }

    // Update lead state
    const updates: Record<string, unknown> = { mia_handoff_state: handoff ? "ready_for_handoff" : "engaging" };
    if (handoff) {
      updates.status = "qualified";
      updates.escalation_reason = "Mia signaled handoff after qualifying conversation";
    }
    await supabase.from("mia_leads").update(updates).eq("id", lead.id);

    if (handoff) {
      const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      for (const a of admins ?? []) {
        await supabase.from("notifications").insert({
          user_id: a.user_id,
          title: "🤝 Mia ready to hand off lead",
          body: `${lead.lead_name} — qualified by Mia and ready for senior concierge takeover.`,
          link: "/admin/mia-leads",
        });
      }
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "mia-escalation",
            recipientEmail: "support@platinumcircle.vip",
            idempotencyKey: `mia-handoff-${lead.id}`,
            templateData: {
              leadName: lead.lead_name,
              email: lead.email,
              phone: lead.phone,
              interest: lead.interest,
              escalationReason: "Mia qualified the lead and signaled handoff.",
            },
          },
        });
      } catch (e) { console.error("handoff email failed:", e); }
    }

    return new Response(JSON.stringify({ ok: true, reply, handoff }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("mia-converse error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: corsHeaders });
  }
});

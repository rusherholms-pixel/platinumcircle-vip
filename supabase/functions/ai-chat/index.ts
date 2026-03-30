import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for external AI agent webhook URL
    const agentWebhookUrl = Deno.env.get("AI_CHAT_WEBHOOK_URL");

    if (agentWebhookUrl) {
      // Forward to external AI agent (e.g. Mia from You.com)
      const agentResponse = await fetch(agentWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      if (agentResponse.ok) {
        const agentData = await agentResponse.json();
        return new Response(
          JSON.stringify({ reply: agentData.reply ?? agentData.response ?? agentData.text ?? agentData.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fallback: use Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY) {
      const systemPrompt = `You are Mia, the personal AI concierge for Platinum Circle — an ultra-premium luxury concierge service in Montreal. You help potential and existing members with inquiries about:
- Luxury housing and private villas
- Elite chauffeur services (Maybach, Escalade, limousines)
- Curated experiences (nightlife, bachelor/bachelorette parties, VIP club access)
- Personal security services
- Group travel packages

Be warm, professional, and discreet. Speak with elegance. Keep responses concise (2-3 sentences max unless detail is requested). If asked about pricing, explain that all packages are custom-tailored and invite them to submit a request or speak with the team. Never reveal internal operations or technology details.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...(history ?? []),
        { role: "user", content: message },
      ];

      const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const reply = aiData.choices?.[0]?.message?.content ?? "Thank you for reaching out. A member of our concierge team will follow up shortly.";
        return new Response(
          JSON.stringify({ reply }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Final fallback
    return new Response(
      JSON.stringify({
        reply: "Thank you for your interest in Platinum Circle. Our concierge team will be in touch with you shortly.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-chat error:", error);
    return new Response(
      JSON.stringify({ reply: "I apologize for the inconvenience. Please try again in a moment." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

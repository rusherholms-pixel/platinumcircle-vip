import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify shared secret
  const expected = Deno.env.get("INBOUND_WEBHOOK_SECRET");
  const provided = req.headers.get("x-webhook-secret");
  if (!expected || provided !== expected) {
    console.warn("Webhook auth failed");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    console.log("Incoming webhook payload:", JSON.stringify(payload).slice(0, 500));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Map payload -> rental_deals row. Adjust fields as your sender supplies them.
    const row = {
      company: payload.company ?? null,
      phone_number: payload.phone_number ?? payload.phone ?? null,
      city: payload.city ?? null,
      insurance_type: payload.insurance_type ?? null,
      manager_name: payload.manager_name ?? payload.contact_name ?? null,
      relocation_service: payload.relocation_service ?? null,
      source_id: payload.id ? String(payload.id) : null,
      source_table: payload.source_table ?? "webhook",
      parsed_by: "webhook",
      raw_data: payload,
    };

    const { error } = await supabase.from("rental_deals").insert(row);
    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("incoming-webhook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

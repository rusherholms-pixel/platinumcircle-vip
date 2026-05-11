import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

const GRAPH = "https://graph.facebook.com/v21.0";

async function verifySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature?.startsWith("sha256=")) return false;
  const provided = signature.slice(7);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === provided;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN")!;
  const APP_SECRET = Deno.env.get("META_APP_SECRET")!;
  const PAGE_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN") || Deno.env.get("META_ACCESS_TOKEN")!;

  // GET = verification challenge
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("forbidden", { status: 403 });
  }

  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const raw = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  if (!(await verifySignature(raw, sig, APP_SECRET))) {
    console.error("Invalid Meta webhook signature");
    return new Response("invalid signature", { status: 401 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const payload = JSON.parse(raw);

  await supabase.from("meta_webhook_log").insert({ event_type: payload.object, payload });

  // Process leadgen events
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;
      const v = change.value;
      const leadId = v.leadgen_id;
      if (!leadId) continue;

      // Fetch full lead from Graph API
      const leadRes = await fetch(
        `${GRAPH}/${leadId}?fields=field_data,campaign_id,adset_id,ad_id,form_id,created_time&access_token=${PAGE_TOKEN}`,
      );
      const lead = await leadRes.json();
      if (lead.error) {
        console.error("Graph fetch error:", lead.error);
        continue;
      }

      const fields: Record<string, string> = {};
      for (const f of lead.field_data ?? []) {
        fields[f.name?.toLowerCase()] = f.values?.[0] ?? "";
      }
      const lead_name = fields.full_name || fields.name || fields.first_name || "Meta Lead";
      const email = fields.email || null;
      const phone = fields.phone_number || fields.phone || null;
      const interest = fields.what_are_you_interested_in || fields.interest || fields.service || null;

      // Insert into mia_leads (idempotent via unique meta_lead_id)
      const { data: inserted, error } = await supabase
        .from("mia_leads")
        .upsert({
          meta_lead_id: leadId,
          meta_form_id: lead.form_id ?? v.form_id,
          meta_campaign_id: lead.campaign_id,
          meta_ad_id: lead.ad_id,
          lead_name,
          email,
          phone,
          interest,
          source: "meta_ads",
          status: "new",
          conversation_summary: JSON.stringify(fields),
        }, { onConflict: "meta_lead_id" })
        .select()
        .single();

      if (error) {
        console.error("Lead insert error:", error);
        continue;
      }

      // Trigger Mia processing
      try {
        await supabase.functions.invoke("mia-process-lead", { body: { lead_id: inserted.id } });
      } catch (e) {
        console.error("mia-process-lead invoke failed:", e);
      }
    }
  }

  return new Response("ok", { headers: corsHeaders });
});

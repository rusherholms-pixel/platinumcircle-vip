import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const GRAPH = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const PAGE_ID = Deno.env.get("META_PAGE_ID")!;
  const AD_ACCOUNT = Deno.env.get("META_AD_ACCOUNT_ID")!;
  const PAGE_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN") || Deno.env.get("META_ACCESS_TOKEN")!;
  const AD_TOKEN = Deno.env.get("META_ACCESS_TOKEN")!;
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const result: Record<string, unknown> = { leads_synced: 0, campaigns_synced: 0, ads_synced: 0, errors: [] as string[] };

  try {
    // 1) Sync lead forms + recent leads
    const formsRes = await fetch(`${GRAPH}/${PAGE_ID}/leadgen_forms?fields=id,name,questions,status&access_token=${PAGE_TOKEN}`);
    const formsJson = await formsRes.json();
    for (const form of formsJson.data ?? []) {
      await supabase.from("meta_lead_forms").upsert({
        id: form.id, page_id: PAGE_ID, name: form.name, questions: form.questions ?? [], is_active: form.status === "ACTIVE",
      });
      const since = Math.floor(Date.now() / 1000) - 30 * 60;
      const leadsRes = await fetch(
        `${GRAPH}/${form.id}/leads?fields=id,created_time,field_data,campaign_id,adset_id,ad_id,form_id&filtering=[{"field":"time_created","operator":"GREATER_THAN","value":${since}}]&access_token=${PAGE_TOKEN}`,
      );
      const leadsJson = await leadsRes.json();
      for (const lead of leadsJson.data ?? []) {
        const fields: Record<string, string> = {};
        for (const f of lead.field_data ?? []) fields[f.name?.toLowerCase()] = f.values?.[0] ?? "";
        const { data: existing } = await supabase.from("mia_leads").select("id").eq("meta_lead_id", lead.id).maybeSingle();
        if (existing) continue;
        const { data: inserted } = await supabase.from("mia_leads").insert({
          meta_lead_id: lead.id,
          meta_form_id: lead.form_id ?? form.id,
          meta_campaign_id: lead.campaign_id,
          meta_ad_id: lead.ad_id,
          lead_name: fields.full_name || fields.name || "Meta Lead",
          email: fields.email || null,
          phone: fields.phone_number || fields.phone || null,
          interest: fields.what_are_you_interested_in || fields.interest || null,
          source: "meta_ads",
          status: "new",
          conversation_summary: JSON.stringify(fields),
        }).select().single();
        if (inserted) {
          result.leads_synced = (result.leads_synced as number) + 1;
          try { await supabase.functions.invoke("mia-process-lead", { body: { lead_id: inserted.id } }); } catch (_e) { /* ignore */ }
        }
      }
    }

    // 2) Sync campaigns + insights
    const campRes = await fetch(
      `${GRAPH}/${AD_ACCOUNT}/campaigns?fields=id,name,objective,status,daily_budget,lifetime_budget,insights.date_preset(last_7d){spend,impressions,clicks,ctr,cost_per_action_type,actions}&limit=50&access_token=${AD_TOKEN}`,
    );
    const campJson = await campRes.json();
    for (const c of campJson.data ?? []) {
      const ins = c.insights?.data?.[0] ?? {};
      const cplAction = (ins.cost_per_action_type ?? []).find((a: { action_type: string; value: string }) => a.action_type === "lead");
      const leadsAction = (ins.actions ?? []).find((a: { action_type: string; value: string }) => a.action_type === "lead");
      await supabase.from("meta_campaigns").upsert({
        id: c.id,
        name: c.name,
        objective: c.objective,
        status: c.status,
        daily_budget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
        lifetime_budget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
        spend: Number(ins.spend ?? 0),
        impressions: Number(ins.impressions ?? 0),
        clicks: Number(ins.clicks ?? 0),
        ctr: Number(ins.ctr ?? 0),
        cpl: cplAction ? Number(cplAction.value) : 0,
        leads_count: leadsAction ? Number(leadsAction.value) : 0,
        last_synced_at: new Date().toISOString(),
      });
      result.campaigns_synced = (result.campaigns_synced as number) + 1;
    }

    // 3) Sync ads
    const adsRes = await fetch(
      `${GRAPH}/${AD_ACCOUNT}/ads?fields=id,name,status,campaign_id,adset_id,creative{title,body},insights.date_preset(last_7d){spend,impressions,clicks,actions}&limit=100&access_token=${AD_TOKEN}`,
    );
    const adsJson = await adsRes.json();
    for (const a of adsJson.data ?? []) {
      const ins = a.insights?.data?.[0] ?? {};
      const leadsAction = (ins.actions ?? []).find((x: { action_type: string; value: string }) => x.action_type === "lead");
      await supabase.from("meta_ads").upsert({
        id: a.id,
        campaign_id: a.campaign_id,
        adset_id: a.adset_id,
        name: a.name,
        status: a.status,
        creative_summary: [a.creative?.title, a.creative?.body].filter(Boolean).join(" — "),
        spend: Number(ins.spend ?? 0),
        impressions: Number(ins.impressions ?? 0),
        clicks: Number(ins.clicks ?? 0),
        leads_count: leadsAction ? Number(leadsAction.value) : 0,
        last_synced_at: new Date().toISOString(),
      });
      result.ads_synced = (result.ads_synced as number) + 1;
    }
  } catch (e) {
    console.error("meta-sync error:", e);
    (result.errors as string[]).push(e instanceof Error ? e.message : String(e));
  }

  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});

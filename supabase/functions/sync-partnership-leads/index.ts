import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTERNAL_URL = "https://vraxmojlnkxlddenfrjv.supabase.co";

const INSURANCE = ["insurance", "insurer", "coverage", "policy", "underwriting", "claims", "premium", "broker"];
const RELOCATION = ["relocation", "relocating", "moving", "expatriate", "expat", "global mobility"];
const PARTNERSHIP = ["partnership", "collaboration", "joint venture", "alliance", "merger", "acquisition"];
const LUXURY = ["luxury", "vip", "concierge", "white glove", "bespoke", "exclusive", "premium", "executive"];

function score(text: string): number {
  const t = text.toLowerCase();
  let s = 0;
  for (const k of [...INSURANCE, ...RELOCATION, ...PARTNERSHIP, ...LUXURY]) {
    if (t.includes(k)) s += 0.15;
  }
  if (INSURANCE.some(k => t.includes(k)) && RELOCATION.some(k => t.includes(k))) s += 0.3;
  if (LUXURY.some(k => t.includes(k))) s += 0.2;
  return Math.min(s, 0.95);
}

function extractCompany(text: string): string {
  const m =
    text.match(/([A-Z][a-zA-Z\s]+(?:Corp|Inc|Ltd|LLC|Group|Company|Services))/) ||
    text.match(/([A-Z][a-zA-Z]+(?:Insurance|Relocation|Moving|Global))/);
  return m ? m[1].trim() : "Unknown Company";
}

function industryOf(text: string): string {
  const t = text.toLowerCase();
  if (INSURANCE.some(k => t.includes(k))) return "Insurance";
  if (RELOCATION.some(k => t.includes(k))) return "Relocation";
  if (LUXURY.some(k => t.includes(k))) return "Luxury Services";
  return "Corporate";
}

function opportunityTypes(text: string): string[] {
  const t = text.toLowerCase();
  const types: string[] = [];
  if (INSURANCE.some(k => t.includes(k))) types.push("insurance");
  if (RELOCATION.some(k => t.includes(k))) types.push("relocation");
  if (PARTNERSHIP.some(k => t.includes(k))) types.push("partnership");
  if (LUXURY.some(k => t.includes(k))) types.push("luxury");
  return types;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { limit = 100, offset = 0, min_score = 0.4 } = await req.json().catch(() => ({}));
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
    if (!externalKey) throw new Error("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY not configured");

    const externalDb = createClient(EXTERNAL_URL, externalKey);
    const internalDb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error: readErr } = await externalDb
      .from("processed_data")
      .select("*")
      .order("created_at", { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (readErr) {
      return new Response(JSON.stringify({ error: readErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let inserted = 0;
    let skipped_low_score = 0;
    let skipped_duplicate = 0;

    for (const row of rows ?? []) {
      const title = row.title || row.headline || "";
      const summary = row.summary || row.description || row.content || "";
      const link = row.url || row.link || row.source_url || null;
      const text = `${title} ${summary}`.trim();
      if (!text) continue;

      const priority = score(text);
      if (priority < min_score) { skipped_low_score++; continue; }

      // Dedupe by source_url when available
      if (link) {
        const { data: existing } = await internalDb
          .from("partnership_scout_leads")
          .select("id")
          .eq("source_url", link)
          .maybeSingle();
        if (existing) { skipped_duplicate++; continue; }
      }

      const { error: insErr } = await internalDb
        .from("partnership_scout_leads")
        .insert({
          company_name: extractCompany(title),
          industry: industryOf(text),
          opportunity_type: opportunityTypes(text),
          priority_score: priority,
          source_url: link,
          notes: summary,
          stage: "qualified",
          metadata: {
            source_route: "processed_data",
            extracted_at: row.published_at || row.created_at || new Date().toISOString(),
            raw_opportunity: { title, summary, link },
          },
        });

      if (insErr) {
        console.error("Insert error:", insErr);
      } else {
        inserted++;
      }
    }

    return new Response(JSON.stringify({
      read: rows?.length ?? 0,
      inserted,
      skipped_low_score,
      skipped_duplicate,
      offset: safeOffset,
      limit: safeLimit,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("sync-partnership-leads error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

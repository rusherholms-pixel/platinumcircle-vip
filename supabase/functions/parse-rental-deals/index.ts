import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTERNAL_URL = "https://vraxmojlnkxlddenfrjv.supabase.co";

// ---------- Rule-based parser (fallback) ----------
function pick(obj: Record<string, any>, keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  const lower: Record<string, any> = {};
  for (const k of Object.keys(obj)) lower[k.toLowerCase()] = obj[k];
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return null;
}

function extractPhone(text: string): string | null {
  const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return m ? m[1].trim() : null;
}

function ruleBasedParse(row: any) {
  // Merge top-level row + any nested data/payload object
  const candidates: Record<string, any> = { ...row };
  for (const key of ["data", "payload", "parsed", "content", "fields", "raw"]) {
    if (row[key] && typeof row[key] === "object") Object.assign(candidates, row[key]);
  }
  const flat = JSON.stringify(candidates);

  return {
    company:
      pick(candidates, ["company", "company_name", "business", "agency", "provider", "name"]),
    phone_number:
      pick(candidates, ["phone_number", "phone", "phoneNumber", "tel", "telephone", "mobile", "contact_phone"]) ||
      extractPhone(flat),
    city: pick(candidates, ["city", "town", "location_city", "municipality"]),
    insurance_type:
      pick(candidates, ["insurance_type", "insurance", "type_of_insurance", "insuranceType", "coverage"]),
    manager_name:
      pick(candidates, ["manager_name", "manager", "contact_name", "agent", "representative", "contact"]),
    relocation_service:
      pick(candidates, ["relocation_service", "relocation", "rellocation_service", "moving_service", "relocation_offered"]),
  };
}

// ---------- External AI parser ----------
async function aiParse(row: any, externalKey: string): Promise<any | null> {
  const fnName = Deno.env.get("EXTERNAL_AI_FUNCTION_NAME");
  if (!fnName) return null;

  try {
    const res = await fetch(`${EXTERNAL_URL}/functions/v1/${fnName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${externalKey}`,
        apikey: externalKey,
      },
      body: JSON.stringify({
        row,
        schema: {
          company: "string",
          phone_number: "string",
          city: "string",
          insurance_type: "string",
          manager_name: "string",
          relocation_service: "string",
        },
      }),
    });
    if (!res.ok) {
      console.warn("External AI returned", res.status);
      return null;
    }
    const data = await res.json();
    // Accept either {result: {...}} or direct fields
    return data.result ?? data.parsed ?? data;
  } catch (e) {
    console.warn("External AI call failed:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { limit = 100, offset = 0 } = await req.json().catch(() => ({}));
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
    if (!externalKey) throw new Error("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY not configured");

    const externalDb = createClient(EXTERNAL_URL, externalKey);
    const internalDb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Read from external processed_data
    const { data: rows, error: readErr } = await externalDb
      .from("processed_data")
      .select("*")
      .order("created_at", { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (readErr) {
      console.error("External read error:", readErr);
      return new Response(JSON.stringify({ error: readErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceRows = rows ?? [];
    let aiCount = 0;
    let ruleCount = 0;

    const toInsert = await Promise.all(
      sourceRows.map(async (row: any) => {
        let parsed = await aiParse(row, externalKey);
        let parsedBy: "ai" | "rule_based" = "ai";
        if (!parsed || typeof parsed !== "object") {
          parsed = ruleBasedParse(row);
          parsedBy = "rule_based";
          ruleCount++;
        } else {
          // Fill any missing fields with rule-based fallback
          const fallback = ruleBasedParse(row);
          parsed = { ...fallback, ...parsed };
          aiCount++;
        }

        return {
          company: parsed.company ?? null,
          phone_number: parsed.phone_number ?? null,
          city: parsed.city ?? null,
          insurance_type: parsed.insurance_type ?? null,
          manager_name: parsed.manager_name ?? null,
          relocation_service: parsed.relocation_service ?? null,
          source_id: row.id ? String(row.id) : null,
          source_table: "processed_data",
          parsed_by: parsedBy,
          raw_data: row,
        };
      }),
    );

    // 2. Insert into internal rental_deals
    let inserted = 0;
    if (toInsert.length > 0) {
      const { error: insertErr, count } = await internalDb
        .from("rental_deals")
        .insert(toInsert, { count: "exact" });

      if (insertErr) {
        console.error("Insert error:", insertErr);
        return new Response(
          JSON.stringify({ error: insertErr.message, attempted: toInsert.length }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      inserted = count ?? toInsert.length;
    }

    return new Response(
      JSON.stringify({
        read: sourceRows.length,
        inserted,
        parsed_with_ai: aiCount,
        parsed_with_rules: ruleCount,
        offset: safeOffset,
        limit: safeLimit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("parse-rental-deals error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

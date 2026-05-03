import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsItem {
  title: string
  summary: string
  link: string
  source: string
  published_at: string
}

const INSURANCE_KEYWORDS = ["insurance","insurer","coverage","policy","underwriting","claims","risk management","actuarial","premium","broker"]
const RELOCATION_KEYWORDS = ["relocation","relocating","moving","corporate move","expatriate","expat","international assignment","moving services","global mobility"]
const PARTNERSHIP_KEYWORDS = ["partnership","collaboration","joint venture","strategic alliance","merger","acquisition","investment opportunity","venture capital"]
const LUXURY_KEYWORDS = ["luxury","vip","concierge","white glove","bespoke","exclusive","high-end","premium service","executive"]

function calculatePriorityScore(text: string): number {
  const t = text.toLowerCase()
  let score = 0
  const all = [...INSURANCE_KEYWORDS, ...RELOCATION_KEYWORDS, ...PARTNERSHIP_KEYWORDS, ...LUXURY_KEYWORDS]
  all.forEach(k => { if (t.includes(k)) score += 0.15 })
  const hasIns = INSURANCE_KEYWORDS.some(k => t.includes(k))
  const hasRel = RELOCATION_KEYWORDS.some(k => t.includes(k))
  if (hasIns && hasRel) score += 0.3
  if (LUXURY_KEYWORDS.some(k => t.includes(k))) score += 0.2
  return Math.min(score, 0.95)
}

function extractCompanyName(text: string): string {
  const patterns = [
    /([A-Z][a-zA-Z\s]+(?:Corp|Inc|Ltd|LLC|Group|Company|Services))/,
    /([A-Z][a-zA-Z]+(?:Insurance|Relocation|Moving|Global))/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1].trim()
  }
  return "Unknown Company"
}

function determineIndustry(text: string): string {
  const t = text.toLowerCase()
  if (INSURANCE_KEYWORDS.some(k => t.includes(k))) return "Insurance"
  if (RELOCATION_KEYWORDS.some(k => t.includes(k))) return "Relocation"
  if (LUXURY_KEYWORDS.some(k => t.includes(k))) return "Luxury Services"
  return "Corporate"
}

function determineOpportunityType(text: string): string[] {
  const types: string[] = []
  const t = text.toLowerCase()
  if (INSURANCE_KEYWORDS.some(k => t.includes(k))) types.push("insurance")
  if (RELOCATION_KEYWORDS.some(k => t.includes(k))) types.push("relocation")
  if (PARTNERSHIP_KEYWORDS.some(k => t.includes(k))) types.push("partnership")
  if (LUXURY_KEYWORDS.some(k => t.includes(k))) types.push("luxury")
  return types
}

async function fetchPartnershipNews(): Promise<NewsItem[]> {
  return [
    {
      title: "Global Insurance Corp announces VIP concierge partnerships for high-net-worth clients",
      summary: "Looking for white-glove relocation and insurance bundle partners",
      link: "https://example.com/news/1",
      source: "Insurance Weekly",
      published_at: new Date().toISOString()
    },
    {
      title: "Executive Relocation Services seeking insurance partners for corporate clients",
      summary: "Corporate relocation benefits package needs comprehensive coverage",
      link: "https://example.com/news/2",
      source: "Relocation Today",
      published_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      title: "Luxury Living International expands VIP services, seeks insurance partners",
      summary: "High-end property management seeking exclusive insurance partnerships",
      link: "https://example.com/news/3",
      source: "Luxury Real Estate",
      published_at: new Date().toISOString()
    }
  ]
}

async function runScout(supabase: any) {
  const newsItems = await fetchPartnershipNews()
  const inserted: any[] = []
  for (const item of newsItems) {
    const text = `${item.title} ${item.summary}`
    const priority_score = calculatePriorityScore(text)
    if (priority_score < 0.4) continue

    const company_name = extractCompanyName(item.title)
    const industry = determineIndustry(text)
    const opportunity_type = determineOpportunityType(text)

    const { data: existing } = await supabase
      .from('partnership_scout_leads')
      .select('id')
      .eq('source_url', item.link)
      .maybeSingle()
    if (existing) continue

    const lead = {
      company_name, industry, opportunity_type, priority_score,
      source_url: item.link,
      notes: item.summary,
      stage: 'qualified',
      metadata: {
        raw_opportunity: { title: item.title, summary: item.summary, link: item.link, keywords_matched: opportunity_type },
        contact_hint: `Source: ${item.source}`,
        source_route: 'platinum_circle',
        extracted_at: item.published_at,
      },
    }

    const { data, error } = await supabase.from('partnership_scout_leads').insert(lead).select().single()
    if (!error) inserted.push(data)
    else console.error('Insert error:', error)
  }
  return {
    status: 'success',
    leads_found: newsItems.length,
    leads_inserted: inserted.length,
    high_priority: inserted.filter(l => l.priority_score >= 0.7).length,
    leads: inserted,
  }
}

async function promoteLead(supabase: any, partnerId: string, overrides: Record<string, any> = {}) {
  // Lead is already in partnership_scout_leads; just advance the stage.
  const { data, error } = await supabase
    .from('partnership_scout_leads')
    .update({
      stage: overrides.stage ?? 'outreach',
      next_action: overrides.next_action ?? 'Initial outreach',
      updated_at: new Date().toISOString(),
    })
    .eq('id', partnerId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    let action = 'scout'
    let body: any = {}
    if (req.method === 'POST') {
      try { body = await req.json() } catch (_) { body = {} }
      action = body.action || 'scout'
    } else {
      const url = new URL(req.url)
      action = url.searchParams.get('action') || 'scout'
    }

    if (action === 'promote') {
      if (!body.partner_id) {
        return new Response(JSON.stringify({ error: 'partner_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      const lead = await promoteLead(supabase, body.partner_id, body.overrides || {})
      return new Response(JSON.stringify({ status: 'success', lead }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const report = await runScout(supabase)
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Scout error:', error)
    return new Response(JSON.stringify({ status: 'error', error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

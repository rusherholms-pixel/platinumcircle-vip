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

// Keywords for insurance and relocation
const INSURANCE_KEYWORDS = [
  "insurance", "insurer", "coverage", "policy", "underwriting",
  "claims", "risk management", "actuarial", "premium", "broker"
]

const RELOCATION_KEYWORDS = [
  "relocation", "relocating", "moving", "corporate move",
  "expatriate", "expat", "international assignment",
  "moving services", "global mobility"
]

const PARTNERSHIP_KEYWORDS = [
  "partnership", "collaboration", "joint venture", "strategic alliance",
  "merger", "acquisition", "investment opportunity", "venture capital"
]

const LUXURY_KEYWORDS = [
  "luxury", "vip", "concierge", "white glove", "bespoke",
  "exclusive", "high-end", "premium service", "executive"
]

function calculatePriorityScore(text: string): number {
  const text_lower = text.toLowerCase()
  let score = 0
  
  // Base score for any relevant keyword
  const allKeywords = [
    ...INSURANCE_KEYWORDS,
    ...RELOCATION_KEYWORDS, 
    ...PARTNERSHIP_KEYWORDS,
    ...LUXURY_KEYWORDS
  ]
  
  const matchedKeywords: string[] = []
  
  allKeywords.forEach(keyword => {
    if (text_lower.includes(keyword.toLowerCase())) {
      score += 0.15
      matchedKeywords.push(keyword)
    }
  })
  
  // Bonus for insurance + relocation combo
  const hasInsurance = INSURANCE_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))
  const hasRelocation = RELOCATION_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))
  
  if (hasInsurance && hasRelocation) {
    score += 0.3
  }
  
  // Bonus for luxury context
  if (LUXURY_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    score += 0.2
  }
  
  // Cap at 0.95
  return Math.min(score, 0.95)
}

function extractCompanyName(text: string): string {
  // Simple extraction - look for capitalized company patterns
  const patterns = [
    /([A-Z][a-zA-Z\s]+(?:Corp|Inc|Ltd|LLC|Group|Company|Services))/,
    /([A-Z][a-zA-Z]+(?:Insurance|Relocation|Moving|Global))/,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  
  return "Unknown Company"
}

function determineIndustry(text: string): string {
  const text_lower = text.toLowerCase()
  
  if (INSURANCE_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    return "Insurance"
  }
  if (RELOCATION_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    return "Relocation"
  }
  if (LUXURY_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    return "Luxury Services"
  }
  return "Corporate"
}

function determineOpportunityType(text: string): string[] {
  const types: string[] = []
  const text_lower = text.toLowerCase()
  
  if (INSURANCE_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    types.push("insurance")
  }
  if (RELOCATION_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    types.push("relocation")
  }
  if (PARTNERSHIP_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    types.push("partnership")
  }
  if (LUXURY_KEYWORDS.some(k => text_lower.includes(k.toLowerCase()))) {
    types.push("luxury")
  }
  
  return types
}

// Mock data source - replace with real RSS/API feeds
async function fetchPartnershipNews(): Promise<NewsItem[]> {
  // In production, fetch from:
  // - RSS feeds (insurance industry news)
  // - Corporate press releases
  // - LinkedIn company updates
  // - Industry newsletters
  
  // For now, return sample data
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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('Starting Partnership Scout cycle...')
    
    // Fetch news
    const newsItems = await fetchPartnershipNews()
    console.log(`Found ${newsItems.length} potential leads`)
    
    const processedLeads = []
    
    for (const item of newsItems) {
      const text = `${item.title} ${item.summary}`
      const priorityScore = calculatePriorityScore(text)
      
      // Only process high-value leads
      if (priorityScore < 0.4) {
        console.log(`Skipping low-priority item: ${item.title}`)
        continue
      }
      
      const companyName = extractCompanyName(item.title)
      const industry = determineIndustry(text)
      const opportunityTypes = determineOpportunityType(text)
      
      // Check if lead already exists
      const { data: existing } = await supabase
        .from('partners_raw')
        .select('id')
        .eq('raw_opportunity->>link', item.link)
        .maybeSingle()
      
      if (existing) {
        console.log(`Lead already exists: ${companyName}`)
        continue
      }
      
      // Insert new lead
      const lead = {
        source_route: 'platinum_circle',
        company_name: companyName,
        industry: industry,
        opportunity_type: opportunityTypes,
        priority_score: priorityScore,
        contact_hint: `Source: ${item.source}`,
        raw_opportunity: {
          title: item.title,
          summary: item.summary,
          link: item.link,
          keywords_matched: opportunityTypes
        },
        status: 'new',
        extracted_at: item.published_at,
        created_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('partners_raw')
        .insert(lead)
      
      if (error) {
        console.error('Insert error:', error)
      } else {
        processedLeads.push(lead)
        console.log(`Inserted lead: ${companyName} (score: ${priorityScore.toFixed(2)})`)
      }
    }
    
    // Generate report
    const report = {
      status: 'success',
      timestamp: new Date().toISOString(),
      leads_found: newsItems.length,
      leads_inserted: processedLeads.length,
      high_priority: processedLeads.filter(l => l.priority_score >= 0.7).length,
      leads: processedLeads.map(l => ({
        company: l.company_name,
        industry: l.industry,
        score: l.priority_score,
        types: l.opportunity_type
      }))
    }
    
    console.log('Scout cycle complete:', report)
    
    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Scout error:', error)
    return new Response(
      JSON.stringify({ status: 'error', error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

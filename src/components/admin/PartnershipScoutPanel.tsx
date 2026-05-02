import { useState } from "react";
import { motion } from "motion/react";
import { Play, Loader2, Target, CheckCircle, AlertCircle, TrendingUp, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScoutResult {
  company: string;
  industry: string;
  score: number;
  types: string[];
}

interface ScoutReport {
  status: string;
  timestamp: string;
  leads_found: number;
  leads_inserted: number;
  high_priority: number;
  leads: ScoutResult[];
}

interface NewsItem {
  title: string;
  summary: string;
  link: string;
  source: string;
  published_at: string;
}

// Keywords for insurance and relocation
const INSURANCE_KEYWORDS = [
  "insurance", "insurer", "coverage", "policy", "underwriting",
  "claims", "risk management", "actuarial", "premium", "broker"
];

const RELOCATION_KEYWORDS = [
  "relocation", "relocating", "moving", "corporate move",
  "expatriate", "expat", "international assignment",
  "moving services", "global mobility"
];

const PARTNERSHIP_KEYWORDS = [
  "partnership", "collaboration", "joint venture", "strategic alliance",
  "merger", "acquisition", "investment opportunity", "venture capital"
];

const LUXURY_KEYWORDS = [
  "luxury", "vip", "concierge", "white glove", "bespoke",
  "exclusive", "high-end", "premium service", "executive"
];

// Mock data source - replace with real RSS/API feeds
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
    },
    {
      title: "Corporate Mobility Solutions partners with premium insurance provider",
      summary: "Executive relocation and insurance bundle for multinational corporations",
      link: "https://example.com/news/4",
      source: "Business Travel News",
      published_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      title: "Bespoke Insurance Group launches VIP concierge program",
      summary: "White-glove insurance services for high-net-worth individuals",
      link: "https://example.com/news/5",
      source: "Insurance Times",
      published_at: new Date().toISOString()
    }
  ];
}

function calculatePriorityScore(text: string): number {
  const textLower = text.toLowerCase();
  let score = 0;

  const allKeywords = [
    ...INSURANCE_KEYWORDS,
    ...RELOCATION_KEYWORDS,
    ...PARTNERSHIP_KEYWORDS,
    ...LUXURY_KEYWORDS
  ];

  allKeywords.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      score += 0.15;
    }
  });

  const hasInsurance = INSURANCE_KEYWORDS.some(k => textLower.includes(k.toLowerCase()));
  const hasRelocation = RELOCATION_KEYWORDS.some(k => textLower.includes(k.toLowerCase()));

  if (hasInsurance && hasRelocation) {
    score += 0.3;
  }

  if (LUXURY_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    score += 0.2;
  }

  return Math.min(score, 0.95);
}

function extractCompanyName(text: string): string {
  const patterns = [
    /([A-Z][a-zA-Z\s]+(?:Corp|Inc|Ltd|LLC|Group|Company|Services))/,
    /([A-Z][a-zA-Z]+(?:Insurance|Relocation|Moving|Global))/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return "Unknown Company";
}

function determineIndustry(text: string): string {
  const textLower = text.toLowerCase();

  if (INSURANCE_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    return "Insurance";
  }
  if (RELOCATION_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    return "Relocation";
  }
  if (LUXURY_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    return "Luxury Services";
  }
  return "Corporate";
}

function determineOpportunityType(text: string): string[] {
  const types: string[] = [];
  const textLower = text.toLowerCase();

  if (INSURANCE_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    types.push("insurance");
  }
  if (RELOCATION_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    types.push("relocation");
  }
  if (PARTNERSHIP_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    types.push("partnership");
  }
  if (LUXURY_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
    types.push("luxury");
  }

  return types;
}

interface LeadData {
  source_route: string;
  company_name: string;
  industry: string;
  opportunity_type: string[];
  priority_score: number;
  contact_hint: string;
  raw_opportunity: {
    title: string;
    summary: string;
    link: string;
    keywords_matched: string[];
  };
  status: string;
  extracted_at: string;
  created_at: string;
}

export default function PartnershipScoutPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastReport, setLastReport] = useState<ScoutReport | null>(null);
  const [scoutedLeads, setScoutedLeads] = useState<LeadData[]>([]);

  const runScout = async () => {
    setIsRunning(true);
    toast({ title: "Running Partnership Scout...", description: "Scanning for new opportunities" });

    try {
      const newsItems = await fetchPartnershipNews();
      const processedLeads: LeadData[] = [];

      for (const item of newsItems) {
        const text = `${item.title} ${item.summary}`;
        const priorityScore = calculatePriorityScore(text);

        if (priorityScore < 0.4) {
          continue;
        }

        const companyName = extractCompanyName(item.title);
        const industry = determineIndustry(text);
        const opportunityTypes = determineOpportunityType(text);

        const { data: existing } = await supabase
          .from("partners_raw")
          .select("id")
          .eq("raw_opportunity->>link", item.link)
          .maybeSingle();

        if (existing) {
          continue;
        }

        const lead: LeadData = {
          source_route: "platinum_circle",
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
          status: "new",
          extracted_at: item.published_at,
          created_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("partners_raw")
          .insert(lead);

        if (!error) {
          processedLeads.push(lead);
        }
      }

      const report: ScoutReport = {
        status: "success",
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
      };

      setLastReport(report);
      setScoutedLeads(processedLeads);

      toast({
        title: "Scout Complete!",
        description: `Found ${processedLeads.length} new partnership opportunities`,
      });
    } catch (error) {
      console.error("Scout error:", error);
      toast({
        title: "Scout Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
            <Target className="text-primary" size={24} />
            Partnership Scout
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Discover insurance and relocation partnership opportunities
          </p>
        </div>

        <Button
          onClick={runScout}
          disabled={isRunning}
          className="bg-gradient-gold text-primary-foreground gap-2"
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Running Scout...
            </>
          ) : (
            <>
              <Play size={18} />
              Run Scout
            </>
          )}
        </Button>
      </motion.div>

      {lastReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
                Leads Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl text-foreground">{lastReport.leads_found}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
                New Inserted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl text-emerald-500">{lastReport.leads_inserted}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl text-primary">{lastReport.high_priority}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
                Last Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-lg text-foreground">
                {new Date(lastReport.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(lastReport.timestamp).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {scoutedLeads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display text-xl text-foreground flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            New Partnership Opportunities
          </h3>

          <div className="grid gap-4">
            {scoutedLeads.map((lead, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 size={16} className="text-primary" />
                          <h4 className="font-display text-lg text-foreground">
                            {lead.company_name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] tracking-widest uppercase ${
                              lead.priority_score >= 0.7
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {lead.priority_score >= 0.7 ? "High Priority" : "Standard"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {lead.raw_opportunity.summary}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px]">
                            <Briefcase size={10} className="mr-1" />
                            {lead.industry}
                          </Badge>
                          {lead.opportunity_type.map((type: string) => (
                            <Badge
                              key={type}
                              variant="outline"
                              className="text-[10px] capitalize"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Source: {lead.contact_hint}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Priority Score:</span>
                          <span className={`font-display text-lg ${
                            lead.priority_score >= 0.7 ? "text-primary" : "text-muted-foreground"
                          }`}>
                            {(lead.priority_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          <CheckCircle size={10} className="mr-1" />
                          Saved to Database
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!lastReport && !isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border border-dashed border-border rounded-lg"
        >
          <Target size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">No Scout Run Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Click "Run Scout" to scan for new insurance and relocation partnership opportunities.
            Results will be saved to your partners database.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Insurance</Badge>
            <Badge variant="outline">Relocation</Badge>
            <Badge variant="outline">Luxury Services</Badge>
            <Badge variant="outline">Partnerships</Badge>
          </div>
        </motion.div>
      )}

      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Loader2 size={48} className="mx-auto text-primary mb-4 animate-spin" />
          <h3 className="font-display text-xl text-foreground mb-2">Scanning for Opportunities...</h3>
          <p className="text-muted-foreground">Analyzing partnership signals and saving new leads</p>
        </motion.div>
      )}
    </div>
  );
}

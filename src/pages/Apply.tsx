import { useState } from "react";
import { motion } from "motion/react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const COUNTRIES = [
  "United States", "United Kingdom", "France", "Italy", "Switzerland",
  "United Arab Emirates", "Monaco", "Spain", "Germany", "Canada",
  "Australia", "Singapore", "Japan", "Brazil", "South Africa",
  "Netherlands", "Sweden", "Norway", "Austria", "Greece",
  "Portugal", "Mexico", "Thailand", "Indonesia", "Maldives",
  "Turkey", "Saudi Arabia", "Qatar", "Bahrain", "Kuwait", "Other",
];

const TRAVELER_STATUSES = [
  "Business Traveler", "Leisure Traveler", "Visitor", "Resident",
];

const HEARD_OPTIONS = [
  "Social Media", "Friend or Colleague", "Online Search",
  "Press / Media", "Event / Conference", "Other",
];

const MEMBER_SERVICES = [
  "Luxury Housing", "Personal Security", "Private Drivers",
  "Curated Experiences", "All of the Above",
];

const PROVIDER_CATEGORIES = [
  "Luxury Housing", "Personal Security", "Private Drivers",
  "Curated Experiences",
];

const TRAVEL_FREQUENCIES = [
  "Occasional (1-3 trips/year)",
  "Regular (4-8 trips/year)",
  "Frequent (9+ trips/year)",
  "Constant",
];

const PARTY_SIZES = [
  "Solo", "Couple", "Small Group (3-6)", "Large Group (7+)",
];

const Apply = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") === "provider" ? "provider" : "member";

  const [applicantType, setApplicantType] = useState<"member" | "provider">(initialType);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  // Shared fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [travelerStatus, setTravelerStatus] = useState<string[]>([]);
  const [personalStatement, setPersonalStatement] = useState("");
  const [heardAboutUs, setHeardAboutUs] = useState("");

  // Member fields
  const [preferredServices, setPreferredServices] = useState<string[]>([]);
  const [travelFrequency, setTravelFrequency] = useState("");
  const [travelPartySize, setTravelPartySize] = useState("");

  // Provider fields
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [serviceCountries, setServiceCountries] = useState<string[]>([]);
  const [serviceCities, setServiceCities] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: Record<string, any> = {
      applicant_type: applicantType,
      full_name: fullName,
      email,
      phone,
      country,
      city,
      traveler_status: travelerStatus,
      personal_statement: personalStatement || null,
      heard_about_us: heardAboutUs || null,
    };

    if (applicantType === "member") {
      payload.preferred_services = preferredServices;
      payload.travel_frequency = travelFrequency || null;
      payload.travel_party_size = travelPartySize || null;
    } else {
      payload.service_categories = serviceCategories;
      payload.years_experience = yearsExperience ? parseInt(yearsExperience) : null;
      payload.business_type = businessType || null;
      payload.business_name = businessName || null;
      payload.service_countries = serviceCountries;
      payload.service_cities = serviceCities || null;
      payload.service_description = serviceDescription || null;
      payload.portfolio_url = portfolioUrl || null;
    }

    const { data, error } = await supabase
      .from("applications")
      .insert([payload])
      .select("reference_number")
      .single();

    setSubmitting(false);

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setRefNumber(data.reference_number);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg text-center"
        >
          <CheckCircle size={56} className="mx-auto text-primary mb-6" />
          <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-4">
            Application Received
          </h1>
          <p className="text-muted-foreground mb-2 leading-relaxed">
            Our team reviews all applications personally. You will receive an
            email within <span className="text-foreground font-medium">48–72 hours</span> with
            your access decision.
          </p>
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
              Reference Number
            </p>
            <p className="font-display text-2xl text-foreground">{refNumber}</p>
          </div>
          <Link
            to="/"
            className="inline-block mt-8 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground";
  const inputCls = "bg-card border-border h-12";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="font-display text-2xl tracking-wider text-gradient-gold">
            Platinum Circle
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-2">
            {applicantType === "member" ? "Apply for Membership" : "Become a Provider"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {applicantType === "member"
              ? "Join an exclusive network of discerning travelers."
              : "Partner with Platinum Circle to offer your services to elite clientele."}
          </p>

          {/* Type toggle */}
          <div className="flex gap-2 mb-10">
            {(["member", "provider"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setApplicantType(type)}
                className={`px-5 py-2.5 text-xs tracking-widest uppercase font-semibold rounded-sm transition-all ${
                  applicantType === type
                    ? "bg-gradient-gold text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "member" ? "Member" : "Provider"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shared fields */}
            <section className="space-y-5">
              <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelCls}>Full Name *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} placeholder="you@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelCls}>Phone (with country code) *</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder="+1 555 000 0000" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Country of Residence *</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger className={inputCls}><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelCls}>City of Residence *</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required className={inputCls} placeholder="Dubai" />
              </div>

              <div className="space-y-3">
                <Label className={labelCls}>Traveler Status</Label>
                <div className="flex flex-wrap gap-3">
                  {TRAVELER_STATUSES.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={travelerStatus.includes(s)}
                        onCheckedChange={() => toggleArrayItem(travelerStatus, setTravelerStatus, s)}
                      />
                      <span className="text-sm text-foreground">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelCls}>
                  Personal Statement <span className="text-muted-foreground/60">(optional, max 300 chars)</span>
                </Label>
                <Textarea
                  value={personalStatement}
                  onChange={(e) => setPersonalStatement(e.target.value.slice(0, 300))}
                  maxLength={300}
                  rows={3}
                  className="bg-card border-border"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-muted-foreground text-right">{personalStatement.length}/300</p>
              </div>

              <div className="space-y-2">
                <Label className={labelCls}>How did you hear about us?</Label>
                <Select value={heardAboutUs} onValueChange={setHeardAboutUs}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Select option" /></SelectTrigger>
                  <SelectContent>
                    {HEARD_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Member-specific fields */}
            {applicantType === "member" && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-5"
              >
                <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                  Membership Preferences
                </h2>
                <div className="space-y-3">
                  <Label className={labelCls}>Preferred Services</Label>
                  <div className="flex flex-wrap gap-3">
                    {MEMBER_SERVICES.map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={preferredServices.includes(s)}
                          onCheckedChange={() => toggleArrayItem(preferredServices, setPreferredServices, s)}
                        />
                        <span className="text-sm text-foreground">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={labelCls}>Travel Frequency</Label>
                    <Select value={travelFrequency} onValueChange={setTravelFrequency}>
                      <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {TRAVEL_FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelCls}>Travel Party Size</Label>
                    <Select value={travelPartySize} onValueChange={setTravelPartySize}>
                      <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {PARTY_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Provider-specific fields */}
            {applicantType === "provider" && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-5"
              >
                <h2 className="text-xs tracking-[0.3em] uppercase text-primary font-sans border-b border-border pb-3">
                  Service Details
                </h2>
                <div className="space-y-3">
                  <Label className={labelCls}>Service Categories *</Label>
                  <div className="flex flex-wrap gap-3">
                    {PROVIDER_CATEGORIES.map((c) => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={serviceCategories.includes(c)}
                          onCheckedChange={() => toggleArrayItem(serviceCategories, setServiceCategories, c)}
                        />
                        <span className="text-sm text-foreground">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={labelCls}>Years of Experience</Label>
                    <Input type="number" min="0" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={inputCls} placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelCls}>Business Type</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Provider</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {businessType === "business" && (
                  <div className="space-y-2">
                    <Label className={labelCls}>Business Name *</Label>
                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputCls} placeholder="Your company name" required />
                  </div>
                )}
                <div className="space-y-3">
                  <Label className={labelCls}>Countries Where Services Are Offered</Label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {COUNTRIES.filter((c) => c !== "Other").map((c) => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={serviceCountries.includes(c)}
                          onCheckedChange={() => toggleArrayItem(serviceCountries, setServiceCountries, c)}
                        />
                        <span className="text-sm text-foreground">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Cities Where Services Are Offered</Label>
                  <Input value={serviceCities} onChange={(e) => setServiceCities(e.target.value)} className={inputCls} placeholder="Dubai, London, Monaco (comma separated)" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>
                    Description of Services <span className="text-muted-foreground/60">(max 500 chars)</span>
                  </Label>
                  <Textarea
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value.slice(0, 500))}
                    maxLength={500}
                    rows={4}
                    className="bg-card border-border"
                    placeholder="Describe the services you offer..."
                  />
                  <p className="text-xs text-muted-foreground text-right">{serviceDescription.length}/500</p>
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Portfolio / Website URL</Label>
                  <Input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={inputCls} placeholder="https://yoursite.com" />
                </div>
              </motion.section>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 rounded-sm"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default Apply;

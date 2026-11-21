"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, Loader2, Eye, EyeOff, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  SERVICE_CATEGORIES, PROVIDER_BUSINESS_TYPES, type ServiceCategory,
} from "@/lib/providerServices";

// Apply for a service-provider account. Submits an `applications` row with
// applicant_type='provider' + status='pending'. The provider is NOT granted
// dashboard access until an admin vets & approves the application
// (see ProviderLayout gate + AdminApplications approve path).
const ProviderApply = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Provider / business
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [serviceCountries, setServiceCountries] = useState("");
  const [serviceCities, setServiceCities] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [country, setCountry] = useState("");
  const [heardAboutUs, setHeardAboutUs] = useState("");

  const toggleCategory = (key: string) =>
    setCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (categories.length === 0) {
      toast({ title: "Select at least one service category", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const { data: signup, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/provider/apply`,
        },
      });
      if (signupError) throw signupError;

      const app = {
        applicant_type: "provider",
        status: "pending",
        full_name: fullName,
        email,
        phone,
        country: country || "—",
        city: serviceCities || "—",
        personal_statement: serviceDescription,
        heard_about_us: heardAboutUs || null,
        service_categories: categories,
        years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
        business_type: businessType || null,
        business_name: businessName || null,
        service_countries: serviceCountries
          ? serviceCountries.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        service_cities: serviceCities || null,
        service_description: serviceDescription || null,
        portfolio_url: portfolioUrl || null,
        user_id: signup.user?.id ?? null,
      };

      const { error: insertError } = await supabase.from("applications").insert(app);
      if (insertError) throw insertError;

      // Notify admin of new provider application
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "new-application-alert",
          recipientEmail: "slusere@yahoo.com",
          idempotencyKey: `new-provider-app-${signup.user?.id || Date.now()}`,
          templateData: {
            applicantName: fullName,
            applicantEmail: email,
            applicantPhone: phone,
            applicantType: "provider",
            serviceCategories: categories.join(", "),
          },
        },
      });

      toast({
        title: "Application submitted",
        description: "Our team will review your application. You'll be able to access your dashboard once approved.",
      });
      navigate("/provider/dashboard");
    } catch (err) {
      toast({ title: "Application failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground";
  const inputCls = "bg-card border-border h-12";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Join as a Provider — Platinum Circle"
        description="Become a vetted Platinum Circle service provider. Offer luxury homes, chauffeurs, experiences and security to an exclusive member base."
      />
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
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <ShieldCheck size={18} />
            <span className="text-xs tracking-[0.3em] uppercase">Vetted Partners</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-2">
            Join as a Provider
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Offer your services to an exclusive, invitation-only member base. Every provider is
            personally reviewed and approved before listing services.
          </p>

          <div className="mb-8 p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg text-sm text-foreground">
            <p className="font-medium mb-1">Review process</p>
            <p className="text-muted-foreground">
              Once submitted, your application enters our vetting queue. You'll be notified when
              it's approved or declined — and only <span className="text-foreground font-medium">approved</span>{" "}
              providers can access the service dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account */}
            <fieldset className="space-y-4">
              <legend className="font-display text-lg text-foreground mb-2">Your Account</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelCls}>Full Name *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Phone *</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder="+1 555 000 0000" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} placeholder="Canada" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Password *</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={`${inputCls} pr-12`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Confirm Password *</Label>
                  <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={inputCls} placeholder="••••••••" />
                </div>
              </div>
            </fieldset>

            {/* Business / service */}
            <fieldset className="space-y-4">
              <legend className="font-display text-lg text-foreground mb-2">Your Service</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelCls}>Business Name</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputCls} placeholder="Acme Concierge Ltd." />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="bg-card border-border h-12"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {PROVIDER_BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Years of Experience</Label>
                  <Input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={inputCls} placeholder="5" />
                </div>
                <div className="space-y-2">
                  <Label className={labelCls}>Regions / Cities Served</Label>
                  <Input value={serviceCities} onChange={(e) => setServiceCities(e.target.value)} className={inputCls} placeholder="Montréal, Toronto" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelCls}>Service Categories *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_CATEGORIES.map((cat: ServiceCategory) => (
                    <label
                      key={cat.key}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${categories.includes(cat.key) ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"}`}
                    >
                      <Checkbox checked={categories.includes(cat.key)} onCheckedChange={() => toggleCategory(cat.key)} className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium text-foreground">{cat.label}</span>
                        <span className="block text-xs text-muted-foreground">{cat.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelCls}>Countries Served (comma-separated)</Label>
                <Input value={serviceCountries} onChange={(e) => setServiceCountries(e.target.value)} className={inputCls} placeholder="Canada, United States, France" />
              </div>

              <div className="space-y-2">
                <Label className={labelCls}>Service Description</Label>
                <Textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} rows={4} className="bg-card border-border" placeholder="Describe the services you offer, your experience, and how you delivery a luxury-standard experience." />
              </div>

              <div className="space-y-2">
                <Label className={labelCls}>Portfolio / Website</Label>
                <Input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={inputCls} placeholder="https://yourportfolio.com" />
              </div>

              <div className="space-y-2">
                <Label className={labelCls}>How did you hear about us?</Label>
                <Input value={heardAboutUs} onChange={(e) => setHeardAboutUs(e.target.value)} className={inputCls} placeholder="Optional" />
              </div>
            </fieldset>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 rounded-sm"
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                "Submit for Review"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Already applied?{" "}
              <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default ProviderApply;

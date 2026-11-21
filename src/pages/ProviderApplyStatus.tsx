import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, ShieldCheck, XCircle, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

interface ProviderApplication {
  id: string;
  status: string;
  reference_number: string;
  full_name: string;
  service_categories: string[];
  reviewed_at: string | null;
  created_at: string;
}

// Shows a signed-in (or just-applied) user the status of their provider
// application. Drives the vetting gate messaging.
const ProviderApplyStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [app, setApp] = useState<ProviderApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, status, reference_number, full_name, service_categories, reviewed_at, created_at")
        .eq("applicant_type", "provider")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setApp(data as ProviderApplication | null);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isApproved = app?.status === "approved";
  const isPending = app?.status === "pending";
  const isDeclined = app?.status === "declined";

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Application Status — Platinum Circle" noindex />
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="font-display text-2xl tracking-wider text-gradient-gold">Platinum Circle</Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-14 max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-8 text-center"
        >
          {isApproved && (
            <>
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl text-foreground mb-2">Application Approved</h1>
              <p className="text-muted-foreground mb-6">
                Welcome to the Platinum Circle provider network. Your dashboard is ready.
              </p>
              <Button onClick={() => navigate("/provider/dashboard")} className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold rounded-sm">
                Go to Provider Dashboard
              </Button>
            </>
          )}

          {isPending && (
            <>
              <Clock className="h-14 w-14 text-yellow-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl text-foreground mb-2">Under Review</h1>
              <p className="text-muted-foreground mb-4">
                Thanks{app?.full_name ? `, ${app.full_name}` : ""}. Your application is being vetted by our membership team.
              </p>
              {app && (
                <div className="mb-4 rounded-lg bg-secondary/40 p-3 text-sm">
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Reference</p>
                  <p className="text-foreground font-mono text-base">{app.reference_number}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Approval usually takes 1–3 business days. We'll email you the moment you're cleared.
              </p>
            </>
          )}

          {isDeclined && (
            <>
              <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
              <h1 className="font-display text-2xl text-foreground mb-2">Application Not Approved</h1>
              <p className="text-muted-foreground">
                We're unable to approve your application at this time. Please reach out to our team for more information.
              </p>
            </>
          )}

          {!app && (
            <>
              <ShieldCheck className="h-14 w-14 text-primary mx-auto mb-4" />
              <h1 className="font-display text-2xl text-foreground mb-2">No Application Found</h1>
              <p className="text-muted-foreground mb-6">
                You haven't submitted a provider application yet.
              </p>
              <Button onClick={() => navigate("/provider/apply")} variant="outline" className="border-border text-xs tracking-[0.2em] uppercase font-semibold rounded-sm">
                Apply to be a Provider
              </Button>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ProviderApplyStatus;

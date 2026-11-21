import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProviderSidebar } from "./ProviderSidebar";
import { Clock, ShieldCheck, XCircle, Hourglass } from "lucide-react";

type GateState =
  | { status: "loading" }
  | { status: "no-provider-role" }
  | { status: "no-application" }
  | { status: "pending" }
  | { status: "declined" }
  | { status: "approved" };

/**
 * Vetting gate for the /provider/* portal. A user may only enter the provider
 * dashboard once their provider application has been *approved* by an admin —
 * meaning they hold a `provider` role in user_roles. Pending / declined /
 * non-applicants are shown the relevant status screen (never the dashboard).
 */
export default function ProviderLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [gate, setGate] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    let active = true;
    (async () => {
      // 1) Does the user already hold the provider role? (set at admin approval)
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "provider")
        .maybeSingle();

      if (role) {
        if (active) setGate({ status: "approved" });
        return;
      }

      // 2) Else, look up their provider application for status messaging.
      const { data: app } = await supabase
        .from("applications")
        .select("id, status")
        .eq("applicant_type", "provider")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app) {
        if (active) setGate({ status: "no-application" });
        return;
      }
      if (active) {
        if (app.status === "approved") setGate({ status: "approved" });
        else if (app.status === "declined") setGate({ status: "declined" });
        else setGate({ status: "pending" });
      }
    })();

    return () => {
      active = false;
    };
  }, [user, authLoading, navigate]);

  if (authLoading || gate.status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  // ---- Gate screens (never render the dashboard for unvetted users) ----
  if (gate.status === "no-application" || gate.status === "no-provider-role") {
    return (
      <GateShell icon={<ShieldCheck className="h-12 w-12 text-primary mx-auto" />}
        title="Not a Provider Yet"
        body="You need to apply and be approved as a Platinum Circle provider to access this dashboard.">
        <Link to="/provider/apply">
          <span className="inline-flex items-center justify-center px-8 py-3 text-xs tracking-[0.25em] uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm hover:opacity-90">
            Apply to Become a Provider
          </span>
        </Link>
      </GateShell>
    );
  }

  if (gate.status === "pending") {
    return (
      <GateShell icon={<Hourglass className="h-12 w-12 text-yellow-500 mx-auto" />}
        title="Application Under Review"
        body="Your provider application is being vetted by our membership team. You'll be able to use the dashboard once approved. Approval usually takes 1–3 business days.">
        <Link to="/provider/apply/status">
          <span className="inline-flex items-center justify-center px-8 py-3 text-xs tracking-[0.25em] uppercase font-semibold border border-primary/40 text-primary rounded-sm hover:border-primary hover:bg-primary/5">
            View Application Status
          </span>
        </Link>
      </GateShell>
    );
  }

  if (gate.status === "declined") {
    return (
      <GateShell icon={<XCircle className="h-12 w-12 text-destructive mx-auto" />}
        title="Application Not Approved"
        body="We're unable to approve your provider application at this time. Please contact our team for more information.">
        <Link to="/" className="text-sm text-primary hover:underline">Return to Home</Link>
      </GateShell>
    );
  }

  // ---- Approved: render the real dashboard ----
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ProviderSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40 px-4">
            <SidebarTrigger className="text-muted-foreground" />
          </header>
          <main className="flex-1 p-6 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function GateShell({ icon, title, body, children }: {
  icon: React.ReactNode; title: string; body: string; children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-5">{icon}</div>
        <h1 className="font-display text-3xl text-gradient-gold mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">{body}</p>
        <div className="flex flex-col items-center gap-3">{children}</div>
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/60">
          <Clock size={12} /> Vetting queue
        </div>
      </div>
    </div>
  );
}

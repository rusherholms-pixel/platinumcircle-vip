import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, MailX } from "lucide-react";
import SEO from "@/components/SEO";

type State = "loading" | "valid" | "already" | "invalid" | "success" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    const validate = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) { setState("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") { setState("already"); return; }
        setState("valid");
      } catch { setState("error"); }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) { setState("error"); }
      else if (data?.success) { setState("success"); }
      else if (data?.reason === "already_unsubscribed") { setState("already"); }
      else { setState("error"); }
    } catch { setState("error"); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <SEO title="Email Preferences" description="Manage your Platinum Circle email subscription." noindex />
      <div className="max-w-md w-full text-center space-y-6">
        {state === "loading" && <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />}

        {state === "valid" && (
          <>
            <MailX className="mx-auto h-12 w-12 text-primary" />
            <h1 className="font-display text-2xl text-foreground">Unsubscribe</h1>
            <p className="text-muted-foreground">Click below to unsubscribe from future emails.</p>
            <Button onClick={handleUnsubscribe} disabled={submitting} className="bg-gradient-gold text-primary-foreground">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Unsubscribe
            </Button>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="font-display text-2xl text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground">You've been successfully unsubscribed.</p>
          </>
        )}

        {state === "already" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="font-display text-2xl text-foreground">Already Unsubscribed</h1>
            <p className="text-muted-foreground">You're already unsubscribed from our emails.</p>
          </>
        )}

        {(state === "invalid" || state === "error") && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="font-display text-2xl text-foreground">
              {state === "invalid" ? "Invalid Link" : "Something Went Wrong"}
            </h1>
            <p className="text-muted-foreground">
              {state === "invalid" ? "This unsubscribe link is invalid or expired." : "Please try again later."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const Apply = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // Notify admin of new application
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "new-application-alert",
          recipientEmail: "slusere@yahoo.com",
          idempotencyKey: `new-app-${data.user?.id || Date.now()}`,
          templateData: {
            applicantName: fullName,
            applicantEmail: email,
            applicantPhone: phone,
            applicantType: "member",
          },
        },
      });

      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please verify your email to continue.",
        });
      } else if (data.session) {
        // Auto-confirmed — redirect
        navigate("/properties");
      }
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground";
  const inputCls = "bg-card border-border h-12";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Join Platinum Circle — Member Access"
        description="Join Platinum Circle for instant access to luxury homes, elite drivers, and curated VIP experiences worldwide."
      />
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="font-display text-2xl tracking-wider text-gradient-gold">
            Platinum Circle
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-2">
            Create Your Account
          </h1>
          <p className="text-muted-foreground mb-8">
            Join Platinum Circle and unlock access to luxury homes, drivers, experiences, and more.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className={labelCls}>Full Name *</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={inputCls}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Phone (optional)</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
                placeholder="+1 555 000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`${inputCls} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Confirm Password *</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 rounded-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Apply;

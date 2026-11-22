import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRoleRedirectPath } from "@/lib/authRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

/**
 * Dedicated login portal for Platinum Circle service providers.
 * Signs the user in, resolves their highest role, and routes them to the
 * provider dashboard (or the closest dashboard for their role). The
 * /provider/* vetting gate still enforces approval server-side, so an
 * approved provider lands on the live dashboard and everyone else sees the
 * pending/declined screens.
 */
const ProviderLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Unable to sign you in.");

      const path = await getRoleRedirectPath(data.user.id);
      if (path === "/admin") navigate("/provider/dashboard"); // admin can still access provider portal
      else navigate(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground";
  const inputCls = "bg-card border-border h-12";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Provider Login — Platinum Circle"
        description="Sign in to your Platinum Circle provider dashboard. Manage listings, bookings, earnings and more."
        noindex
      />
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="font-display text-2xl tracking-wider text-gradient-gold">Platinum Circle</Link>
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
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <ShieldCheck size={18} />
            <span className="text-xs tracking-[0.3em] uppercase">Provider Portal</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-2">Provider Login</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sign in to manage your listings, bookings, earnings and provider profile.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className={labelCls}>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={`${inputCls} pr-12`}
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

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 rounded-sm"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Forgot your password?{" "}
            <Link to="/auth" className="text-primary hover:underline">Reset it here</Link>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Not a provider yet?{" "}
            <Link to="/provider/apply" className="text-primary hover:underline">Apply to become one</Link>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-8">
            Member login?{" "}
            <Link to="/auth" className="text-primary hover:underline">Sign in to your member account</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default ProviderLogin;

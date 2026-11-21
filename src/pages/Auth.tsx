import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // AuthRedirect (the wrapper on /auth) resolves the role-based home from the
  // session once `user` is set, so no manual redirect is needed here — having
  // one here caused a double-navigation race after login.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // AuthRedirect observes `user` and navigates to the role's home.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage("Check your email for a password reset link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <SEO
        title="Sign In — Platinum Circle Members"
        description="Access your Platinum Circle member dashboard for VIP concierge services, luxury bookings, and private experiences."
        noindex
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back to home
        </a>

        <h1 className="font-display text-4xl text-gradient-gold mb-2">
          {isForgotPassword ? "Reset Password" : "Welcome Back"}
        </h1>
        <p className="text-muted-foreground font-sans mb-10">
          {isForgotPassword
            ? "Enter your email and we'll send you a reset link."
            : "Sign in to access your dashboard."}
        </p>

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-card border-border focus:border-primary h-12"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
            {message && <p className="text-primary text-sm">{message}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 rounded-sm"
            >
              {loading ? "Please wait..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                  setMessage("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Back to sign in
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-card border-border focus:border-primary h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs tracking-widest uppercase text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-card border-border focus:border-primary h-12 pr-12"
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
            {message && <p className="text-primary text-sm">{message}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 rounded-sm"
            >
              {loading ? "Please wait..." : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError("");
                  setMessage("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-muted-foreground text-center mt-8">
          Don't have an account?{" "}
          <a href="/apply" className="text-primary hover:underline">
            Create an account
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;

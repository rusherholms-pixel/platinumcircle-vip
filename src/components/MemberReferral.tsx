import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Gift, Copy, Check, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Referral {
  id: string;
  referral_code: string;
  referred_email: string | null;
  status: string;
  credit_amount: number;
  created_at: string;
}

const MemberReferral = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) fetchReferrals();
  }, [user]);

  const fetchReferrals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user!.id)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setReferralCode(data[0].referral_code);
      setReferrals(data);
    }
    setLoading(false);
  };

  const generateCode = async () => {
    const code = `PC-${user!.id.slice(0, 8).toUpperCase()}`;
    const { error } = await supabase.from("referrals").insert({
      referrer_id: user!.id,
      referral_code: code,
    });

    if (error && error.code === "23505") {
      // Code already exists, just use it
      setReferralCode(code);
    } else if (error) {
      toast({ title: "Error generating link", variant: "destructive" });
    } else {
      setReferralCode(code);
      toast({ title: "Referral link created!" });
    }
  };

  const referralUrl = referralCode
    ? `${window.location.origin}/apply?ref=${referralCode}`
    : null;

  const copyLink = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const convertedCount = referrals.filter((r) => r.status === "converted").length;
  const totalCredits = referrals.reduce((sum, r) => sum + (r.credit_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <Gift size={20} className="text-primary" />
        <h3 className="font-display text-xl text-foreground">Invite a Friend</h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Share your exclusive referral link. When a referred guest is approved as a member,
        you'll receive a complimentary service credit.
      </p>

      {referralUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground font-mono truncate">
              {referralUrl}
            </div>
            <Button variant="outline" size="icon" onClick={copyLink} className="border-border shrink-0">
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-4 text-center">
              <Users size={16} className="mx-auto text-primary mb-1" />
              <p className="font-display text-2xl text-foreground">{convertedCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Approved Referrals</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <Gift size={16} className="mx-auto text-primary mb-1" />
              <p className="font-display text-2xl text-foreground">${totalCredits}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Credits Earned</p>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={generateCode} className="bg-gradient-gold text-primary-foreground gap-2 text-xs tracking-[0.2em] uppercase">
          <Gift size={16} /> Generate Referral Link
        </Button>
      )}
    </motion.div>
  );
};

export default MemberReferral;

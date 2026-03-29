import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { UserCircle, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const ProviderProfile = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setCountry(data.country || "");
      }
      setLoading(false);
    })();
  }, [user]);

  const filledFields = [fullName, email, phone, city, country].filter(Boolean).length;
  const completion = Math.round((filledFields / 5) * 100);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, city, country })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }
  };

  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground";
  const inputCls = "bg-card border-border h-12";

  return (
    <div className="space-y-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Profile</p>
        <h1 className="font-display text-3xl text-foreground">Profile & Verification</h1>
      </motion.div>

      <div className="p-5 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <UserCircle size={16} className="text-primary" />
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Profile Completion</span>
        </div>
        <p className="font-display text-2xl text-foreground mb-3">{completion}%</p>
        <Progress value={completion} className="h-1.5" />
      </div>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelCls}>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-2">
              <Label className={labelCls}>Email</Label>
              <Input value={email} disabled className={`${inputCls} opacity-60`} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelCls}>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+1 555 000 0000" />
            </div>
            <div className="space-y-2">
              <Label className={labelCls}>Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelCls}>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold hover:opacity-90 rounded-sm gap-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ProviderProfile;

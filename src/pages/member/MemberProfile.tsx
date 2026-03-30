import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { UserCircle, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function MemberProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "", city: "", country: "" });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
    if (data) setProfile({ full_name: data.full_name, email: data.email, phone: data.phone || "", city: data.city || "", country: data.country || "" });
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, phone: profile.phone, city: profile.city, country: profile.country,
    }).eq("id", user!.id);
    setSaving(false);
    if (error) toast({ title: "Error saving profile", variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Account</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">My Profile</h1>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><UserCircle size={20} className="text-primary" /> Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Full Name</label>
              <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Email</label>
              <Input value={profile.email} disabled className="bg-secondary border-border opacity-60" />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Phone</label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">City</label>
              <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Country</label>
              <Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="bg-secondary border-border" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { motion } from "motion/react";
import { Home, Shield, Car, Sparkles, ClipboardList, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  { title: "Luxury Housing", desc: "Browse exclusive estates & residences", icon: Home, url: "/member/housing", color: "from-primary/20 to-primary/5" },
  { title: "Personal Security", desc: "Elite protection services", icon: Shield, url: "/member/security", color: "from-primary/20 to-primary/5" },
  { title: "Elite Drivers", desc: "Private chauffeurs & luxury vehicles", icon: Car, url: "/member/drivers", color: "from-primary/20 to-primary/5" },
  { title: "Experiences", desc: "Curated packages & nightlife", icon: Sparkles, url: "/member/experiences", color: "from-primary/20 to-primary/5" },
  { title: "My Bookings", desc: "Track your reservations", icon: ClipboardList, url: "/member/bookings", color: "from-secondary to-secondary/50" },
  { title: "Referrals", desc: "Invite friends & earn credits", icon: Gift, url: "/member/referrals", color: "from-secondary to-secondary/50" },
];

export default function MemberOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Member Portal</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2">Browse our exclusive services or manage your account.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link, i) => (
          <motion.div key={link.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={link.url}>
              <Card className="group hover:border-primary/40 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${link.color}`}>
                    <link.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

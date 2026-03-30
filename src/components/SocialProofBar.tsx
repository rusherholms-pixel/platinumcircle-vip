import { motion } from "motion/react";
import { Shield, Lock, Clock, Users, Sparkles } from "lucide-react";

const signals = [
  { icon: Shield, text: "Vetted Providers Only" },
  { icon: Lock, text: "100% Private & Discreet" },
  { icon: Clock, text: "24/7 Concierge" },
  { icon: Users, text: "Members Only Access" },
  { icon: Sparkles, text: "Fully Customizable" },
];

const SocialProofBar = () => {
  return (
    <section className="py-8 bg-secondary/50 border-y border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {signals.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <s.icon size={14} className="text-primary" />
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-sans">
                {s.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofBar;

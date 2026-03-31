import { Shield, Lock, EyeOff } from "lucide-react";
import { motion } from "motion/react";

const DiscretionCommitment = () => (
  <section className="py-10 md:py-16 bg-secondary/50 border-t border-border">
    <div className="container mx-auto px-6 max-w-3xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Lock size={28} className="mx-auto text-primary mb-3" />
        <h2 className="font-display text-xl md:text-2xl text-foreground mb-3">Our Discretion Commitment</h2>
        <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
          Everything arranged through our platform is handled with complete discretion.
          Member identities, bookings, and preferences are never shared or disclosed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: Shield, label: "End-to-End Privacy", desc: "All communications encrypted and confidential" },
            { icon: EyeOff, label: "Anonymous Bookings", desc: "Your identity is never shared with third parties" },
            { icon: Lock, label: "Secure Data", desc: "Enterprise-grade security for all personal information" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <item.icon size={20} className="text-primary" />
              <span className="font-display text-sm text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default DiscretionCommitment;

import { motion } from "motion/react";
import { Link } from "react-router-dom";

const GroupCalloutSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Dark luxury background */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans"
        >
          Group Experiences
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-medium text-foreground mb-6"
        >
          Montreal This Summer?
          <br />
          <span className="text-gradient-gold">We've Got You.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Bachelor parties, VIP nightlife, private drivers, bachelorette getaways &
          exclusive group packages — one concierge handles everything.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/experiences/bundles"
            className="px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            Explore Group Packages
          </Link>
          <Link
            to="/apply?type=member"
            className="px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold border border-primary/30 text-foreground rounded-sm hover:border-primary/60 transition-colors"
          >
            Speak to a Concierge
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GroupCalloutSection;

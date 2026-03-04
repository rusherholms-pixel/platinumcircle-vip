import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section id="contact" className="py-32 bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans">
            Exclusive Access
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-6">
            Ready for the
            <br />
            <span className="text-gradient-gold">Ultimate Experience?</span>
          </h2>
          <p className="font-sans text-muted-foreground mb-10 leading-relaxed">
            ThePlugs is invite-only. Request access and our team will review your application within 24 hours.
          </p>
          <a
            href="#"
            className="inline-block px-12 py-4 text-xs tracking-[0.3em] uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            Request Invitation
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

import { motion } from "motion/react";

const CTASection = () => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">
            Exclusive Access
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground mb-4 md:mb-6">
            Ready for the
            <br />
            <span className="text-gradient-gold">Ultimate Experience?</span>
          </h2>
          <p className="font-sans text-muted-foreground mb-8 md:mb-10 leading-relaxed text-base">
            Create your free account and unlock access to luxury homes, private drivers, curated experiences, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/apply"
              className="inline-flex items-center justify-center px-12 py-4 text-xs tracking-[0.3em] uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm hover:opacity-90 transition-opacity min-h-[48px]"
            >
              Join Now
            </a>
            <a
              href="/apply"
              className="inline-flex items-center justify-center px-12 py-4 text-xs tracking-[0.3em] uppercase font-semibold border border-primary/40 text-primary rounded-sm hover:border-primary hover:bg-primary/5 transition-colors min-h-[48px]"
            >
              Join as a Provider
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

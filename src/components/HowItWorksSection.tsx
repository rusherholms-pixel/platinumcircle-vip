import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up in seconds and gain instant access to our curated network of luxury services.",
  },
  {
    number: "02",
    title: "Tell Us What You Need",
    description: "Share your preferences — from accommodation style to experience type. Our concierge handles the rest.",
  },
  {
    number: "03",
    title: "Get Matched",
    description: "We connect you with vetted hosts, drivers, and experience providers tailored to your exact requirements.",
  },
  {
    number: "04",
    title: "Enjoy Seamlessly",
    description: "Book, pay, and communicate — all within the platform. Real-time support, every step of the way.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">
            How It Works
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground">
            Simplicity Meets
            <br />
            <span className="text-gradient-gold">Sophistication</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <span className="font-display text-5xl md:text-6xl font-bold text-gradient-gold opacity-30">
                {step.number}
              </span>
              <h3 className="font-display text-lg md:text-xl text-foreground mt-3 mb-2">
                {step.title}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 w-px h-16 bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

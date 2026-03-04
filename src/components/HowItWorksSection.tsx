import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Request Access",
    description: "Apply for membership with a brief verification process. We ensure every guest meets our standards of discretion.",
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
    <section id="how-it-works" className="py-32 bg-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans">
            How It Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">
            Simplicity Meets
            <br />
            <span className="text-gradient-gold">Sophistication</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              <span className="font-display text-6xl font-bold text-gradient-gold opacity-30">
                {step.number}
              </span>
              <h3 className="font-display text-xl text-foreground mt-4 mb-3">
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

import { motion } from "motion/react";
import { Home, Car, Sparkles, Shield } from "lucide-react";
import heroVilla from "@/assets/hero-villa.webp";
import serviceDrivers from "@/assets/service-drivers.webp";
import serviceExperiences from "@/assets/service-experiences.webp";
import serviceSecurity from "@/assets/service-security.webp";

const services = [
  {
    icon: Home,
    title: "Luxury Homes",
    description: "Private villas, penthouses & estates curated for the discerning traveler.",
    image: heroVilla,
  },
  {
    icon: Car,
    title: "Elite Drivers",
    description: "Vetted chauffeurs with premium vehicles, available on demand.",
    image: serviceDrivers,
  },
  {
    icon: Sparkles,
    title: "Experiences",
    description: "VIP access to clubs, restaurants, spas & exclusive events.",
    image: serviceExperiences,
  },
  {
    icon: Shield,
    title: "Personal Security",
    description: "Discreet, professional protection for complete peace of mind.",
    image: serviceSecurity,
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans">
            Our Services
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">
            Everything You Need,
            <br />
            <span className="text-gradient-gold">Nothing You Don't</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <service.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-2xl text-foreground">{service.title}</h3>
                </div>
                <p className="font-sans text-muted-foreground text-sm leading-relaxed max-w-md">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

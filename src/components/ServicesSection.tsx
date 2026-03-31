import { motion } from "motion/react";
import { Home, Car, Sparkles, Shield } from "lucide-react";
import { useHomepageContent, useHomepageGallery } from "@/hooks/useHomepageContent";
import heroVilla from "@/assets/hero-villa.webp";
import serviceDrivers from "@/assets/service-drivers.webp";
import serviceExperiences from "@/assets/service-experiences.webp";
import serviceSecurity from "@/assets/service-security.webp";

const CATEGORY_META = [
  { key: "homes", icon: Home, fallbackImage: heroVilla, fallbackTitle: "Luxury Homes", fallbackDesc: "Private villas, penthouses & estates curated for the discerning traveler." },
  { key: "drivers", icon: Car, fallbackImage: serviceDrivers, fallbackTitle: "Elite Drivers", fallbackDesc: "Vetted chauffeurs with premium vehicles, available on demand." },
  { key: "experiences", icon: Sparkles, fallbackImage: serviceExperiences, fallbackTitle: "Experiences", fallbackDesc: "VIP access to clubs, restaurants, spas & exclusive events." },
  { key: "security", icon: Shield, fallbackImage: serviceSecurity, fallbackTitle: "Personal Security", fallbackDesc: "Discreet, professional protection for complete peace of mind." },
];

const ServicesSection = () => {
  const { data: sections } = useHomepageContent();
  const { data: gallery } = useHomepageGallery();

  const getSection = (key: string) => sections?.find((s) => s.section_key === key);

  return (
    <section id="services" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">
            Our Services
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground">
            Everything You Need,
            <br />
            <span className="text-gradient-gold">Nothing You Don't</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {CATEGORY_META.map((cat, index) => {
            const section = getSection(cat.key);
            const image = section?.hero_image_url || cat.fallbackImage;
            const title = section?.headline || cat.fallbackTitle;
            const desc = section?.subheadline || cat.fallbackDesc;

            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
              >
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                  <div className="flex items-center gap-3 mb-2 md:mb-3">
                    <cat.icon className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-display text-lg md:text-2xl text-foreground">{title}</h3>
                  </div>
                  <p className="font-sans text-muted-foreground text-xs md:text-sm leading-relaxed max-w-md">
                    {desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Gallery grids per category */}
        {CATEGORY_META.map((cat) => {
          const catGallery = (gallery ?? []).filter((g) => g.section_key === cat.key).sort((a, b) => a.display_order - b.display_order);
          if (catGallery.length === 0) return null;

          return (
            <motion.div
              key={`gallery-${cat.key}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {catGallery.map((img) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden aspect-[4/3]">
                    <img src={img.image_url} alt={img.caption ?? ""} className="w-full h-full object-cover" loading="lazy" />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/80 to-transparent">
                        <p className="text-xs text-foreground">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;

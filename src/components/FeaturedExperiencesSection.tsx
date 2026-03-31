import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import bundleNightlife from "@/assets/bundle-nightlife.jpg";
import bundleBachelor from "@/assets/bundle-bachelor.jpg";
import bundleBachelorette from "@/assets/bundle-bachelorette.jpg";
import bundleLimousine from "@/assets/bundle-limousine.jpg";
import bundleEscalade from "@/assets/bundle-escalade.jpg";
import bundleVipLounge from "@/assets/bundle-vip-lounge.jpg";
import bundleMaybach from "@/assets/bundle-maybach.jpg";
import bundleEliteHome from "@/assets/bundle-elite-home.jpg";

const experiences = [
  {
    image: bundleBachelor,
    title: "Bachelor Parties",
    subtitle: "The ultimate send-off — rooftop lounges, VIP clubs & private chauffeurs.",
    link: "/experiences/bundles",
    featured: true,
  },
  {
    image: bundleNightlife,
    title: "VIP Nightlife",
    subtitle: "Skip the line. Bottle service, private tables & the city's best venues.",
    link: "/experiences/bundles",
    featured: true,
  },
  {
    image: bundleBachelorette,
    title: "Bachelorette Escapes",
    subtitle: "Champagne towers, spa days & glamorous nights out.",
    link: "/experiences/bundles",
  },
  {
    image: bundleLimousine,
    title: "Limousine Service",
    subtitle: "Arrive in style — stretch limos for groups up to 14.",
    link: "/experiences/bundles",
  },
  {
    image: bundleEscalade,
    title: "Escalade Transfers",
    subtitle: "Black-on-black Cadillac Escalade with professional chauffeur.",
    link: "/experiences/bundles",
  },
  {
    image: bundleMaybach,
    title: "Maybach Experience",
    subtitle: "The pinnacle of luxury ground transportation.",
    link: "/experiences/bundles",
  },
  {
    image: bundleVipLounge,
    title: "Private VIP Lounges",
    subtitle: "Exclusive access to the most coveted private rooms in the city.",
    link: "/experiences/bundles",
  },
];

const FeaturedExperiencesSection = () => {
  const featured = experiences.filter((e) => e.featured);
  const rest = experiences.filter((e) => !e.featured);

  return (
    <section className="py-24 bg-card border-t border-border">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans">
            Montreal's Premier Experiences
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-4">
            Your Night,
            <br />
            <span className="text-gradient-gold">Your Rules</span>
          </h2>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
            Bachelor weekends, VIP nightlife, private chauffeurs & bottle service —
            every detail handled so you don't have to lift a finger.
          </p>
        </motion.div>

        {/* Season badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] tracking-[0.3em] uppercase font-semibold">
            🔥 Summer 2026 — Montreal Is Calling
          </span>
        </motion.div>

        {/* Two featured large cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {featured.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                to={exp.link}
                className="group relative block overflow-hidden rounded-lg aspect-[16/10]"
              >
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  width={1280}
                  height={720}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-display text-3xl text-foreground mb-2 group-hover:text-primary transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-3">
                    {exp.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary font-semibold">
                    Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Remaining experiences — smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
          {rest.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={exp.link}
                className="group relative block overflow-hidden rounded-lg aspect-[3/4]"
              >
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  width={640}
                  height={853}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="font-display text-sm text-foreground group-hover:text-primary transition-colors">
                    {exp.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-1 line-clamp-2">
                    {exp.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/experiences/bundles"
            className="inline-flex items-center gap-3 px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            View All Packages <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedExperiencesSection;

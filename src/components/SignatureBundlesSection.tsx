import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useFeaturedBundles } from "@/hooks/useBundles";
import BundleCard from "@/components/bundles/BundleCard";

const SignatureBundlesSection = () => {
  const { data: bundles } = useFeaturedBundles();

  if (!bundles || bundles.length === 0) return null;

  return (
    <section className="py-32 bg-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans flex items-center justify-center gap-2">
            <Sparkles size={14} /> Signature Experiences
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-4">
            Fully Bespoke
            <br />
            <span className="text-gradient-gold">Group Packages</span>
          </h2>
          <p className="font-sans text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Fully bespoke group packages for those who expect nothing but the best
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {bundles.map((bundle, i) => (
            <BundleCard key={bundle.id} bundle={bundle} index={i} variant="featured" />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/experiences/bundles"
            className="inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase font-semibold text-primary hover:text-foreground transition-colors"
          >
            View All Packages <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default SignatureBundlesSection;

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BundleCard from "@/components/bundles/BundleCard";
import { useBundles } from "@/hooks/useBundles";
import { Skeleton } from "@/components/ui/skeleton";

const BundlesPage = () => {
  const { data: bundles, isLoading } = useBundles();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans flex items-center justify-center gap-2"
          >
            <Sparkles size={14} /> Signature Bundles
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-medium text-foreground mb-6"
          >
            Bespoke Group
            <br />
            <span className="text-gradient-gold">Experiences</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Every detail curated. Every moment unforgettable. Fully customizable luxury packages
            for bachelor parties, corporate retreats, milestone celebrations, and more.
          </motion.p>
        </div>
      </section>

      {/* Bundles grid */}
      <section className="pb-32">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundles?.map((bundle, i) => (
                <BundleCard key={bundle.id} bundle={bundle} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-foreground mb-4">
            Don't see what you're looking for?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Every package is fully customizable. Tell us your vision and we'll build it for you.
          </p>
          <Link
            to="/apply?type=member"
            className="inline-block px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            Speak to a Concierge
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BundlesPage;

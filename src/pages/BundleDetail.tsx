import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Plus, Sparkles, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBundle } from "@/hooks/useBundles";
import BundleRequestForm from "@/components/bundles/BundleRequestForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const BundleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: bundle, isLoading } = useBundle(slug ?? "");
  const [requestOpen, setRequestOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 pt-32">
          <Skeleton className="h-[400px] rounded-lg mb-8" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 pt-32 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Bundle Not Found</h1>
          <Link to="/experiences/bundles">
            <Button variant="outline" className="border-border gap-2">
              <ArrowLeft size={16} /> Back to Bundles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          {bundle.hero_image_url ? (
            <img src={bundle.hero_image_url} alt={bundle.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-16">
          <Link
            to="/experiences/bundles"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={14} /> All Bundles
          </Link>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {bundle.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] tracking-widest uppercase border-primary/20 text-primary">
                {tag}
              </Badge>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-medium text-foreground mb-4"
          >
            {bundle.name}
          </motion.h1>

          {bundle.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-sans text-xl text-muted-foreground max-w-2xl mb-6"
            >
              {bundle.tagline}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button
              onClick={() => setRequestOpen(true)}
              className="bg-gradient-gold text-primary-foreground px-10 py-6 text-xs tracking-[0.3em] uppercase font-semibold"
            >
              Request This Package
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              {bundle.description && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">About This Package</p>
                  <p className="text-foreground leading-relaxed text-lg">{bundle.description}</p>
                </motion.div>
              )}

              {/* Who it's for */}
              {bundle.who_its_for && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">Who It's For</p>
                  <p className="text-muted-foreground leading-relaxed">{bundle.who_its_for}</p>
                </motion.div>
              )}

              {/* What's included */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans">What's Included</p>
                <div className="space-y-3">
                  {bundle.included_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg">
                      <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Add-on options */}
              {bundle.addon_options.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans">Available Add-Ons</p>
                  <div className="space-y-2">
                    {bundle.addon_options.map((addon, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 border border-border/50 rounded-lg">
                        <Plus size={16} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground text-sm">{addon}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Testimonial */}
              {bundle.testimonial_quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-lg p-8"
                >
                  <Quote size={24} className="text-primary/40 mb-4" />
                  <p className="text-foreground italic text-lg leading-relaxed mb-4">
                    "{bundle.testimonial_quote}"
                  </p>
                  {bundle.testimonial_author && (
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">
                      — {bundle.testimonial_author}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* CTA card */}
                <div className="bg-card border border-border rounded-lg p-6 text-center">
                  <Sparkles size={24} className="text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl text-foreground mb-2">Fully Customizable</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Every element of this package is fully customizable. Tell us your vision and we will build it for you.
                  </p>
                  <Button
                    onClick={() => setRequestOpen(true)}
                    className="w-full bg-gradient-gold text-primary-foreground py-5 text-xs tracking-[0.3em] uppercase font-semibold"
                  >
                    Request This Package
                  </Button>
                  {bundle.starting_price && (
                    <p className="text-xs text-muted-foreground mt-3">{bundle.starting_price}</p>
                  )}
                </div>

                {/* Quick facts */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Quick Facts</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Included Items</span>
                      <span className="text-foreground font-medium">{bundle.included_items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add-On Options</span>
                      <span className="text-foreground font-medium">{bundle.addon_options.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customizable</span>
                      <span className="text-primary font-medium">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="text-foreground font-medium">Within 24h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {bundle.gallery_images && bundle.gallery_images.length > 0 && (
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-6">
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-6 font-sans text-center">Gallery</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bundle.gallery_images.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden aspect-[4/3]">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Request form */}
      <BundleRequestForm bundle={bundle} open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
};

export default BundleDetail;

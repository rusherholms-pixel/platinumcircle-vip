import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Plus, Sparkles, Quote, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBundle } from "@/hooks/useBundles";
import { useAuth } from "@/contexts/AuthContext";
import BundleRequestForm from "@/components/bundles/BundleRequestForm";
import BookingRequestDialog from "@/components/member/BookingRequestDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

const BundleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: bundle, isLoading } = useBundle(slug ?? "");
  const { user } = useAuth();
  const [requestOpen, setRequestOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 pt-28 md:pt-32">
          <Skeleton className="h-[300px] md:h-[400px] rounded-lg mb-8" />
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
        <div className="container mx-auto px-6 pt-28 md:pt-32 text-center">
          <h1 className="font-display text-2xl md:text-3xl text-foreground mb-4">Bundle Not Found</h1>
          <Link to="/experiences/bundles">
            <Button variant="outline" className="border-border gap-2 min-h-[44px]">
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
      <section className="relative pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          {bundle.hero_image_url ? (
            <img src={bundle.hero_image_url} alt={bundle.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-12 md:pt-16">
          <Link
            to="/experiences/bundles"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-6 md:mb-8 min-h-[44px]"
          >
            <ArrowLeft size={14} /> All Bundles
          </Link>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {bundle.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] tracking-widest uppercase border-primary/20 text-primary">
                {tag}
              </Badge>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl sm:text-4xl md:text-6xl font-medium text-foreground mb-3 md:mb-4"
          >
            {bundle.name}
          </motion.h1>

          {bundle.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-sans text-base md:text-xl text-muted-foreground max-w-2xl mb-5 md:mb-6"
            >
              {bundle.tagline}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3"
          >
            <Button
              onClick={() => setRequestOpen(true)}
              className="bg-gradient-gold text-primary-foreground px-8 md:px-10 py-5 md:py-6 text-xs tracking-[0.3em] uppercase font-semibold w-full sm:w-auto"
            >
              Request This Package
            </Button>
            {user && (
              <BookingRequestDialog
                serviceType="experiences"
                serviceTitle={bundle.name}
                serviceId={bundle.id}
                trigger={
                  <Button variant="outline" className="border-primary/30 text-primary px-6 md:px-8 py-5 md:py-6 text-xs tracking-[0.2em] uppercase gap-2 w-full sm:w-auto">
                    <CalendarDays size={14} /> Book Directly
                  </Button>
                }
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              {bundle.description && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">About This Package</p>
                  <p className="text-foreground leading-relaxed text-base md:text-lg">{bundle.description}</p>
                </motion.div>
              )}

              {bundle.who_its_for && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Who It's For</p>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{bundle.who_its_for}</p>
                </motion.div>
              )}

              {/* What's included */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">What's Included</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {bundle.included_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Add-ons */}
              {bundle.addon_options.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans">Available Add-Ons</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  className="bg-card border border-border rounded-lg p-6 md:p-8"
                >
                  <Quote size={24} className="text-primary/40 mb-3" />
                  <p className="text-foreground italic text-base md:text-lg leading-relaxed mb-3">
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
            <div className="space-y-4 md:space-y-6">
              <div className="sticky top-20 space-y-4 md:space-y-6">
                <div className="bg-card border border-border rounded-lg p-5 md:p-6 text-center">
                  <Sparkles size={24} className="text-primary mx-auto mb-3" />
                  <h3 className="font-display text-lg md:text-xl text-foreground mb-2">Fully Customizable</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    Every element of this package is fully customizable. Tell us your vision and we will build it for you.
                  </p>
                  <Button
                    onClick={() => setRequestOpen(true)}
                    className="w-full bg-gradient-gold text-primary-foreground py-5 text-xs tracking-[0.3em] uppercase font-semibold"
                  >
                    Request This Package
                  </Button>
                  {user && (
                    <BookingRequestDialog
                      serviceType="experiences"
                      serviceTitle={bundle.name}
                      serviceId={bundle.id}
                      trigger={
                        <Button variant="outline" className="w-full border-primary/30 text-primary py-5 text-xs tracking-[0.2em] uppercase gap-2 mt-3">
                          <CalendarDays size={14} /> Book Directly
                        </Button>
                      }
                    />
                  )}
                </div>

                <div className="bg-card border border-border rounded-lg p-5 md:p-6">
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Quick Facts</p>
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
        <section className="py-10 md:py-16 bg-card border-t border-border">
          <div className="container mx-auto px-6">
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4 md:mb-6 font-sans text-center">Gallery</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bundle.gallery_images.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden aspect-[4/3]">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <BundleRequestForm bundle={bundle} open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
};

export default BundleDetail;

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Flag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface F1Listing {
  id: string;
  category: string;
  title: string;
  city: string | null;
  country: string | null;
  short_description: string | null;
  cover_image: string | null;
  gallery_images: string[] | null;
  is_featured: boolean | null;
}

const useF1Listings = () => {
  return useQuery({
    queryKey: ["f1-weekend-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, category, title, city, country, short_description, cover_image, gallery_images, is_featured")
        .eq("status", "active")
        .ilike("city", "%montreal%")
        .in("category", ["homes", "experiences"])
        .order("is_featured", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as F1Listing[];
    },
    staleTime: 60_000,
  });
};

const F1WeekendSection = () => {
  const { data: listings } = useF1Listings();

  if (!listings || listings.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-3 font-sans flex items-center gap-2">
              <Flag size={14} /> Grand Prix Weekend · June 2026
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground mb-2">
              F1 in Montreal,
              <br />
              <span className="text-gradient-gold">Lived in Luxury</span>
            </h2>
            <p className="font-sans text-muted-foreground max-w-xl leading-relaxed text-sm md:text-base mt-3">
              Penthouses with skyline views, private chauffeurs, and trackside experiences —
              curated for the world's most anticipated race weekend.
            </p>
          </div>
          <Link
            to="/auth"
            className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase font-semibold text-primary hover:text-foreground transition-colors whitespace-nowrap"
          >
            Inquire for Availability <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Airbnb-style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {listings.slice(0, 8).map((listing, i) => {
            const images = [listing.cover_image, ...(listing.gallery_images ?? [])].filter(
              Boolean,
            ) as string[];
            const heroImg = images[0];
            const isHome = listing.category === "homes";

            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group"
              >
                <Link to="/auth" className="block">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-secondary mb-3">
                    {heroImg && (
                      <img
                        src={heroImg}
                        alt={listing.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {/* F1 badge */}
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm border border-primary/30 px-2.5 py-1 rounded-full">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold flex items-center gap-1.5">
                        <Flag size={10} /> F1 Weekend
                      </span>
                    </div>
                    {listing.is_featured && (
                      <div className="absolute top-3 right-3 bg-gradient-gold px-2.5 py-1 rounded-full">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground font-semibold">
                          Featured
                        </span>
                      </div>
                    )}
                    {/* Bottom overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base md:text-lg text-foreground leading-tight line-clamp-1">
                        {listing.title}
                      </h3>
                    </div>
                    <p className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={11} /> {listing.city}
                      {listing.country ? `, ${listing.country}` : ""}
                    </p>
                    {listing.short_description && (
                      <p className="font-sans text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed pt-1">
                        {listing.short_description}
                      </p>
                    )}
                    <p className="font-sans text-xs text-primary pt-2 flex items-center gap-1.5">
                      <Calendar size={11} />
                      {isHome ? "Available race weekend" : "Reserve early"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 md:hidden"
        >
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase font-semibold text-primary"
          >
            Inquire for Availability <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default F1WeekendSection;

import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, ArrowRight, Home, Car, Shield, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useBundles } from "@/hooks/useBundles";
import SEO from "@/components/SEO";

const CITIES: Record<string, { name: string; country: string; tagline: string; description: string; heroKeyword: string }> = {
  dubai: {
    name: "Dubai",
    country: "UAE",
    tagline: "Where Opulence Meets the Desert Sky",
    description: "Experience unparalleled luxury in the city of superlatives — from private yacht cruises along the Marina to exclusive desert retreats and world-class nightlife.",
    heroKeyword: "luxury",
  },
  paris: {
    name: "Paris",
    country: "France",
    tagline: "Elegance, Refined",
    description: "Discover the City of Light through the lens of true exclusivity — private château dinners, after-hours museum tours, and Michelin-starred experiences curated just for you.",
    heroKeyword: "elegance",
  },
  montreal: {
    name: "Montreal",
    country: "Canada",
    tagline: "European Charm, North American Energy",
    description: "A vibrant fusion of French sophistication and cosmopolitan flair — from Old Port penthouses to VIP access at the city's most coveted venues.",
    heroKeyword: "vibrant",
  },
  toronto: {
    name: "Toronto",
    country: "Canada",
    tagline: "The Pinnacle of Canadian Luxury",
    description: "Canada's cultural capital offers world-class dining, exclusive rooftop experiences, and lakefront luxury — all curated for the discerning traveler.",
    heroKeyword: "modern",
  },
  tulum: {
    name: "Tulum",
    country: "Mexico",
    tagline: "Barefoot Luxury on the Riviera Maya",
    description: "Where jungle meets the Caribbean Sea — private cenote experiences, beachfront villas, and wellness retreats in one of the world's most magnetic destinations.",
    heroKeyword: "tropical",
  },
  mykonos: {
    name: "Mykonos",
    country: "Greece",
    tagline: "Island Life, Elevated",
    description: "The jewel of the Aegean awaits — private villa compounds, yacht-hopping itineraries, and legendary nightlife curated for your group.",
    heroKeyword: "island",
  },
  "new-york": {
    name: "New York",
    country: "USA",
    tagline: "The Capital of Everything",
    description: "From penthouse suites overlooking Central Park to private dining with celebrity chefs and VIP access to the city's most exclusive events.",
    heroKeyword: "iconic",
  },
};

const SERVICES = [
  { icon: Home, label: "Luxury Residences", desc: "Curated villas, penthouses & private estates" },
  { icon: Car, label: "Private Drivers", desc: "Chauffeurs & luxury fleet available 24/7" },
  { icon: Shield, label: "Personal Security", desc: "Vetted protection for total peace of mind" },
  { icon: Sparkles, label: "Curated Experiences", desc: "Nightlife, dining, wellness & adventure" },
];

const CityExperiences = () => {
  const { city: citySlug } = useParams<{ city: string }>();
  const { data: bundles } = useBundles();
  const city = citySlug ? CITIES[citySlug] : undefined;

  if (!city) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">City Not Found</h1>
          <p className="text-muted-foreground mb-6">We haven't expanded to this destination yet.</p>
          <Link to="/">
            <Button className="bg-gradient-gold text-primary-foreground">Return Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const activeBundles = bundles ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Luxury Experiences in ${city.name}, ${city.country}`}
        description={`${city.tagline}. ${city.description}`}
        keywords={`luxury ${city.name}, VIP concierge ${city.name}, private experiences ${city.name}, elite travel ${city.country}`}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative py-32 bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin size={16} className="text-primary" />
              <span className="text-xs tracking-[0.4em] uppercase text-primary">{city.country}</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">{city.name}</h1>
            <p className="font-display text-xl text-primary mb-6">{city.tagline}</p>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{city.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Services available */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground text-center mb-12">Services in {city.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc, i) => (
              <motion.div
                key={svc.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary/30 transition-colors"
              >
                <svc.icon size={28} className="mx-auto text-primary mb-3" />
                <h3 className="font-display text-lg text-foreground mb-1">{svc.label}</h3>
                <p className="text-xs text-muted-foreground">{svc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundles available */}
      {activeBundles.length > 0 && (
        <section className="py-20 bg-secondary/30 border-t border-border">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-3xl text-foreground text-center mb-4">Signature Packages</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Fully bespoke group experiences available in {city.name}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBundles.slice(0, 6).map((bundle, i) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/experiences/bundles/${bundle.slug}`}
                    className="block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors group"
                  >
                    <div className="aspect-[16/9] bg-secondary overflow-hidden">
                      {bundle.hero_image_url ? (
                        <img src={bundle.hero_image_url} alt={bundle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles size={32} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg text-foreground mb-1">{bundle.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{bundle.tagline}</p>
                      <span className="text-xs text-primary flex items-center gap-1">
                        Discover <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/experiences/bundles">
                <Button variant="outline" className="border-primary text-primary gap-2 text-xs tracking-[0.2em] uppercase">
                  View All Packages <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-foreground mb-4">Ready to Experience {city.name}?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Apply for membership and unlock access to our curated network of luxury services.
          </p>
          <Link to="/apply">
            <Button className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold px-8 h-12">
              Apply for Membership
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CityExperiences;

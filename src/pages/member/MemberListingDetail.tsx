import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, MapPin, Bed, Bath, Users, Star, ChevronLeft, ChevronRight,
  Calendar, Shield, X, Home, Car, User, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import BookingRequestDialog from "@/components/member/BookingRequestDialog";

interface Listing {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  neighbourhood: string | null;
  city: string | null;
  country: string | null;
  primary_rate: number | null;
  secondary_rate: number | null;
  currency: string;
  cover_image: string | null;
  gallery_images: string[];
  is_featured: boolean;
  category: string;
  category_data: Record<string, any> | null;
  video_url: string | null;
  custom_quote_available: boolean | null;
}

const CATEGORY_ICONS: Record<string, any> = {
  homes: Home,
  drivers: User,
  car_fleets: Car,
  experiences: Sparkles,
  security: Shield,
};

export default function MemberListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id!)
      .eq("status", "active")
      .single();
    if (data) setListing(data as unknown as Listing);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[16/9] w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20 max-w-5xl">
        <p className="text-muted-foreground text-lg">Listing not found.</p>
        <Button variant="ghost" className="mt-4 text-primary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  const catData = (listing.category_data || {}) as Record<string, any>;
  const allImages = [
    ...(listing.cover_image ? [listing.cover_image] : []),
    ...(listing.gallery_images || []),
  ];

  const nextImage = () => setActiveImage((p) => (p + 1) % allImages.length);
  const prevImage = () => setActiveImage((p) => (p - 1 + allImages.length) % allImages.length);

  const serviceTypeMap: Record<string, string> = {
    homes: "housing",
    drivers: "driver",
    car_fleets: "car_fleet",
    experiences: "experience",
    security: "security",
  };

  const formatRate = (rate: number | null) =>
    rate ? `$${rate.toLocaleString()}` : null;

  const rateLabels: Record<string, string> = {
    homes: "/ night",
    drivers: "/ hour",
    car_fleets: "/ day",
    experiences: "/ person",
    security: "/ day",
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </Button>
      </motion.div>

      {/* Image Gallery */}
      {allImages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {/* Main image */}
          <div
            className="relative aspect-[16/9] md:aspect-[2.2/1] rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={allImages[activeImage]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

            {listing.is_featured && (
              <Badge className="absolute top-4 left-4 bg-gradient-gold text-primary-foreground border-0 text-[10px] tracking-widest uppercase">
                Featured
              </Badge>
            )}

            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm hover:bg-background/80 h-10 w-10 rounded-full"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm hover:bg-background/80 h-10 w-10 rounded-full"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight size={20} />
                </Button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-background/60 backdrop-blur-sm rounded-full text-xs text-foreground">
              {activeImage + 1} / {allImages.length}
            </div>
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeImage ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
                {catData.property_type || listing.category}
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">{listing.title}</h1>
            {(listing.city || listing.country) && (
              <p className="flex items-center gap-2 text-muted-foreground mt-2">
                <MapPin size={16} className="text-primary" />
                {[listing.neighbourhood, listing.city, listing.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {/* Quick stats for homes */}
          {listing.category === "homes" && (
            <div className="flex flex-wrap gap-6 py-4 border-y border-border">
              {catData.bedrooms && (
                <div className="flex items-center gap-2 text-foreground">
                  <Bed size={18} className="text-primary" />
                  <span className="font-medium">{catData.bedrooms}</span>
                  <span className="text-muted-foreground text-sm">Bedrooms</span>
                </div>
              )}
              {catData.bathrooms && (
                <div className="flex items-center gap-2 text-foreground">
                  <Bath size={18} className="text-primary" />
                  <span className="font-medium">{catData.bathrooms}</span>
                  <span className="text-muted-foreground text-sm">Bathrooms</span>
                </div>
              )}
              {catData.max_guests && (
                <div className="flex items-center gap-2 text-foreground">
                  <Users size={18} className="text-primary" />
                  <span className="font-medium">{catData.max_guests}</span>
                  <span className="text-muted-foreground text-sm">Guests</span>
                </div>
              )}
              {catData.minimum_stay && (
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar size={18} className="text-primary" />
                  <span className="font-medium">{catData.minimum_stay}</span>
                  <span className="text-muted-foreground text-sm">Min. nights</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {listing.short_description && (
            <div>
              <p className="text-muted-foreground leading-relaxed">{listing.short_description}</p>
            </div>
          )}

          {listing.full_description && (
            <div>
              <h2 className="font-display text-xl text-foreground mb-3">About This Property</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {listing.full_description}
              </div>
            </div>
          )}

          {/* Category-specific details */}
          {listing.category === "homes" && (
            <>
              {catData.cancellation_policy && (
                <div>
                  <h3 className="font-display text-lg text-foreground mb-2">Cancellation Policy</h3>
                  <Badge variant="secondary" className="text-xs tracking-wider uppercase">
                    {catData.cancellation_policy}
                  </Badge>
                </div>
              )}
            </>
          )}

          {listing.category === "drivers" && (
            <div className="space-y-4">
              {catData.driver_name && (
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Driver</h3>
                  <p className="text-foreground font-medium">{catData.driver_name}</p>
                </div>
              )}
              {catData.years_experience && (
                <p className="text-muted-foreground">{catData.years_experience} years of experience</p>
              )}
              {catData.languages && (
                <p className="text-muted-foreground">Languages: {catData.languages}</p>
              )}
              {catData.bio && (
                <p className="text-muted-foreground leading-relaxed">{catData.bio}</p>
              )}
            </div>
          )}

          {listing.category === "car_fleets" && (
            <div className="space-y-3">
              {catData.fleet_type && (
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Fleet Type</h3>
                  <p className="text-muted-foreground">{catData.fleet_type}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {catData.driver_included && (
                  <Badge variant="secondary" className="text-xs">Driver Included</Badge>
                )}
                {catData.delivery_available && (
                  <Badge variant="secondary" className="text-xs">Delivery Available</Badge>
                )}
                {catData.insurance_included && (
                  <Badge variant="secondary" className="text-xs">Insurance Included</Badge>
                )}
              </div>
            </div>
          )}

          {/* Video */}
          {listing.video_url && (
            <div>
              <h2 className="font-display text-xl text-foreground mb-3">Video Tour</h2>
              <div className="aspect-video rounded-lg overflow-hidden bg-card">
                <iframe
                  src={listing.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Right column - Booking sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="sticky top-6 p-6 bg-card border border-border rounded-xl space-y-5">
            {/* Pricing */}
            <div>
              {listing.primary_rate ? (
                <p className="font-display text-3xl text-foreground">
                  {listing.currency === "USD" ? "$" : listing.currency}{" "}
                  {listing.primary_rate.toLocaleString()}
                  <span className="text-sm text-muted-foreground font-sans">
                    {" "}{rateLabels[listing.category] || ""}
                  </span>
                </p>
              ) : listing.custom_quote_available ? (
                <p className="font-display text-xl text-foreground">Custom Quote</p>
              ) : null}

              {/* Secondary rates */}
              {listing.category === "homes" && (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {catData.weekly_rate && (
                    <p>${Number(catData.weekly_rate).toLocaleString()} / week</p>
                  )}
                  {catData.monthly_rate && (
                    <p>${Number(catData.monthly_rate).toLocaleString()} / month</p>
                  )}
                </div>
              )}

              {listing.category === "drivers" && (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {catData.half_day_rate && (
                    <p>${Number(catData.half_day_rate).toLocaleString()} / half day</p>
                  )}
                  {catData.full_day_rate && (
                    <p>${Number(catData.full_day_rate).toLocaleString()} / full day</p>
                  )}
                  {catData.airport_rate && (
                    <p>${Number(catData.airport_rate).toLocaleString()} / airport transfer</p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <BookingRequestDialog
              serviceType={serviceTypeMap[listing.category] || listing.category}
              serviceTitle={listing.title}
              serviceId={listing.id}
              trigger={
                <Button className="w-full h-12 bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase font-medium">
                  Request Booking
                </Button>
              }
            />

            <p className="text-[11px] text-center text-muted-foreground">
              You won't be charged yet. Our concierge team will confirm availability.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-foreground z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={24} />
            </Button>

            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/50 hover:bg-card"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/50 hover:bg-card"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}

            <img
              src={allImages[activeImage]}
              alt={listing.title}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeImage ? "bg-primary w-6" : "bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

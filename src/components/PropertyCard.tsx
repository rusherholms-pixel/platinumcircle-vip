import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Bed, Bath, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookingRequestDialog from "@/components/member/BookingRequestDialog";

interface PropertyCardProps {
  id?: string;
  title: string;
  location: string;
  city: string;
  country: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  propertyType: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  showBooking?: boolean;
}

const PropertyCard = ({
  id,
  title,
  city,
  country,
  pricePerNight,
  bedrooms,
  bathrooms,
  maxGuests,
  amenities,
  images,
  propertyType,
  rating,
  reviewCount,
  isFeatured,
  showBooking = false,
}: PropertyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group rounded-lg overflow-hidden bg-card border border-border hover:border-primary/30 transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={images[0] || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

        {isFeatured && (
          <Badge className="absolute top-4 left-4 bg-gradient-gold text-primary-foreground border-0 text-[10px] tracking-widest uppercase">
            Featured
          </Badge>
        )}

        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-background/60 backdrop-blur-sm border-border text-foreground text-[10px] tracking-wider uppercase">
            {propertyType}
          </Badge>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-4 left-4">
          <p className="text-foreground font-display text-2xl">
            ${pricePerNight.toLocaleString()}
            <span className="text-sm text-muted-foreground font-sans"> / night</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-display text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            {city}, {country}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Bed size={14} /> {bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={14} /> {bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} /> {maxGuests}
          </span>
          <span className="flex items-center gap-1.5 ml-auto text-primary">
            <Star size={14} fill="currentColor" /> {rating}
            <span className="text-muted-foreground">({reviewCount})</span>
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="px-2.5 py-1 text-[10px] tracking-wider uppercase bg-secondary text-muted-foreground rounded-sm"
            >
              {amenity}
            </span>
          ))}
          {amenities.length > 3 && (
            <span className="px-2.5 py-1 text-[10px] tracking-wider uppercase text-primary">
              +{amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Booking button */}
        {showBooking && (
          <BookingRequestDialog
            serviceType="housing"
            serviceTitle={title}
            serviceId={id}
            trigger={
              <Button className="w-full bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase">
                Request Booking
              </Button>
            }
          />
        )}
      </div>
    </motion.div>
  );
};

export default PropertyCard;

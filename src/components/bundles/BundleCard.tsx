import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Bundle } from "@/hooks/useBundles";

interface BundleCardProps {
  bundle: Bundle;
  index?: number;
  variant?: "default" | "featured";
}

const BundleCard = ({ bundle, index = 0, variant = "default" }: BundleCardProps) => {
  const image = variant === "featured"
    ? (bundle.featured_card_image || bundle.hero_image_url)
    : bundle.hero_image_url;

  const description = variant === "featured"
    ? (bundle.featured_description || bundle.tagline)
    : bundle.tagline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        to={`/experiences/bundles/${bundle.slug}`}
        className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-500"
      >
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          {image ? (
            <img
              src={image}
              alt={bundle.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles size={48} className="text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {bundle.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[9px] tracking-widest uppercase border-primary/20 text-primary"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
            {bundle.name}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>

          <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary font-semibold">
            Discover <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default BundleCard;

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useBundles } from "@/hooks/useBundles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemberExperiences() {
  const { data: bundles, isLoading } = useBundles();

  return (
    <div className="space-y-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Curated Packages</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Signature Experiences</h1>
        <p className="text-muted-foreground mt-2">Handcrafted bundles for bachelor parties, VIP nightlife, and luxury group adventures.</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4"><Skeleton className="aspect-[4/3] rounded-lg" /><Skeleton className="h-6 w-3/4" /></div>
          ))}
        </div>
      ) : !bundles?.length ? (
        <Card className="border-dashed border-border">
          <CardContent className="p-12 text-center">
            <Sparkles size={28} className="text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">No experience packages available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle, i) => (
            <motion.div key={bundle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/experiences/bundles/${bundle.slug}`}>
                <Card className="group overflow-hidden hover:border-primary/40 transition-all duration-300 cursor-pointer h-full">
                  {(bundle.featured_card_image || bundle.hero_image_url) && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={bundle.featured_card_image || bundle.hero_image_url || ""}
                        alt={bundle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">{bundle.name}</h3>
                    {bundle.tagline && <p className="text-sm text-muted-foreground line-clamp-2">{bundle.tagline}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {bundle.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] tracking-wider uppercase">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

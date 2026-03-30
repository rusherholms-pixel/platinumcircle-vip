import { motion } from "motion/react";
import { Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MemberDrivers() {
  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Private Fleet</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Elite Drivers</h1>
        <p className="text-muted-foreground mt-2">Professional chauffeurs with luxury vehicles at your service.</p>
      </motion.div>

      <Card className="border-dashed border-border">
        <CardContent className="p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Car size={28} className="text-primary" />
          </div>
          <h3 className="font-display text-xl text-foreground">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our fleet of luxury vehicles and professional drivers is being curated. Contact our concierge for immediate transportation arrangements.
          </p>
          <Button asChild className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase mt-2">
            <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer">
              <Car size={14} className="mr-2" /> Contact Concierge
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

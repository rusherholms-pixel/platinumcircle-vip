import { motion } from "motion/react";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingRequestDialog from "@/components/member/BookingRequestDialog";

export default function MemberSecurity() {
  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Protection Services</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Personal Security</h1>
        <p className="text-muted-foreground mt-2">Vetted professionals providing discreet, world-class protection.</p>
      </motion.div>

      <Card className="border-dashed border-border">
        <CardContent className="p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield size={28} className="text-primary" />
          </div>
          <h3 className="font-display text-xl text-foreground">Providers Being Onboarded</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our vetted security professionals are being onboarded. Submit a request and our concierge will arrange protection services for you.
          </p>
          <BookingRequestDialog
            serviceType="security"
            serviceTitle="Personal Security Detail"
            trigger={
              <Button className="bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase mt-2">
                <Shield size={14} className="mr-2" /> Request Security
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

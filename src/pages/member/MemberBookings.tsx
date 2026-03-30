import { motion } from "motion/react";
import { ClipboardList, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MemberBookings() {
  // Future: fetch from a bookings table
  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Your Reservations</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-2">Track all your reservations, requests, and past experiences.</p>
      </motion.div>

      <Card className="border-dashed border-border">
        <CardContent className="p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardList size={28} className="text-primary" />
          </div>
          <h3 className="font-display text-xl text-foreground">No Bookings Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your booking history will appear here once you reserve a property, request a driver, or book an experience package.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { motion } from "motion/react";
import { ClipboardList } from "lucide-react";

const ProviderBookings = () => (
  <div className="space-y-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Bookings</p>
      <h1 className="font-display text-3xl text-foreground">Bookings & Requests</h1>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 border border-dashed border-border rounded-lg"
    >
      <ClipboardList size={40} className="mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg mb-2">No booking requests yet</p>
      <p className="text-sm text-muted-foreground">
        When members request your services, they'll appear here.
      </p>
    </motion.div>
  </div>
);

export default ProviderBookings;

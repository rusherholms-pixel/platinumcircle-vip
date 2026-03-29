import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";

const ProviderCalendar = () => (
  <div className="space-y-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Calendar</p>
      <h1 className="font-display text-3xl text-foreground">Availability Management</h1>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 border border-dashed border-border rounded-lg"
    >
      <CalendarDays size={40} className="mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg mb-2">Calendar coming soon</p>
      <p className="text-sm text-muted-foreground">
        Manage your availability, block dates, and view upcoming bookings here.
      </p>
    </motion.div>
  </div>
);

export default ProviderCalendar;

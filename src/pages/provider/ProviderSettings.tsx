import { motion } from "motion/react";
import { Settings } from "lucide-react";

const ProviderSettings = () => (
  <div className="space-y-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Settings</p>
      <h1 className="font-display text-3xl text-foreground">Account Settings</h1>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 border border-dashed border-border rounded-lg"
    >
      <Settings size={40} className="mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg mb-2">Settings coming soon</p>
      <p className="text-sm text-muted-foreground">
        Notification preferences, payout methods, and account security will be available here.
      </p>
    </motion.div>
  </div>
);

export default ProviderSettings;

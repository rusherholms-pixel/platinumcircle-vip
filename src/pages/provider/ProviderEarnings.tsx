import { motion } from "motion/react";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const ProviderEarnings = () => (
  <div className="space-y-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Earnings</p>
      <h1 className="font-display text-3xl text-foreground">Revenue & Payouts</h1>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "This Month", value: "$0", icon: TrendingUp, change: null },
        { label: "Last Month", value: "$0", icon: DollarSign, change: null },
        { label: "Pending Payout", value: "$0", icon: DollarSign, change: null },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-5 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <stat.icon size={16} className="text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{stat.label}</span>
          </div>
          <p className="font-display text-3xl text-foreground">{stat.value}</p>
        </motion.div>
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 border border-dashed border-border rounded-lg"
    >
      <DollarSign size={40} className="mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg mb-2">No transactions yet</p>
      <p className="text-sm text-muted-foreground">Your earnings history will appear here once you start receiving bookings.</p>
    </motion.div>
  </div>
);

export default ProviderEarnings;

import { motion } from "motion/react";
import MemberReferral from "@/components/MemberReferral";

export default function MemberReferrals() {
  return (
    <div className="space-y-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Earn Credits</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Referral Program</h1>
        <p className="text-muted-foreground mt-2">Share your exclusive link and earn complimentary service credits when your friends join.</p>
      </motion.div>

      <MemberReferral />
    </div>
  );
}

import { motion } from "motion/react";
import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DiscretionCommitment from "@/components/DiscretionCommitment";

export default function MemberSettings() {
  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Preferences</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Settings</h1>
      </motion.div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">Notification settings will be available soon. All communications are handled with complete discretion.</p>
        </CardContent>
      </Card>

      <DiscretionCommitment />
    </div>
  );
}

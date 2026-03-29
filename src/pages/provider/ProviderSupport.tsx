import { motion } from "motion/react";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProviderSupport = () => (
  <div className="space-y-8 max-w-2xl">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2 font-sans">Support</p>
      <h1 className="font-display text-3xl text-foreground">Help & Support</h1>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card border border-border rounded-lg"
      >
        <Mail size={24} className="text-primary mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Email Support</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Reach our dedicated provider support team for any account or listing inquiries.
        </p>
        <Button variant="outline" className="text-xs tracking-[0.2em] uppercase rounded-sm border-border">
          Contact Us
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-6 bg-card border border-border rounded-lg"
      >
        <MessageSquare size={24} className="text-primary mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Live Chat</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Chat with a concierge specialist in real-time during business hours.
        </p>
        <Button variant="outline" className="text-xs tracking-[0.2em] uppercase rounded-sm border-border">
          Start Chat
        </Button>
      </motion.div>
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-card border border-border rounded-lg"
    >
      <HelpCircle size={24} className="text-primary mb-4" />
      <h3 className="font-display text-lg text-foreground mb-2">Frequently Asked Questions</h3>
      <div className="space-y-3 mt-4">
        {[
          "How do I update my listing availability?",
          "When will I receive my payout?",
          "How do I respond to booking requests?",
          "Can I list in multiple categories?",
        ].map((q) => (
          <div key={q} className="flex items-center gap-3 p-3 border border-border rounded-md hover:border-primary/20 transition-colors cursor-pointer">
            <span className="text-sm text-foreground">{q}</span>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default ProviderSupport;

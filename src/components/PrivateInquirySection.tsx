import { useState } from "react";
import { motion } from "motion/react";
import { Shield, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const inquirySchema = z.object({
  first_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  looking_for: z.string().trim().max(600).optional(),
  preferred_contact: z.string().optional(),
});

const PrivateInquirySection = () => {
  const [form, setForm] = useState({ first_name: "", email: "", looking_for: "", preferred_contact: "email" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please check your details", description: parsed.error.errors[0]?.message, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("private_inquiries").insert([parsed.data]);
    setSubmitting(false);

    if (error) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Inquiry received", description: "A concierge will be in touch shortly." });
    }
  };

  if (submitted) {
    return (
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <Shield size={40} className="mx-auto text-primary mb-4" />
          <h3 className="font-display text-2xl text-foreground mb-2">Thank You</h3>
          <p className="text-muted-foreground">A dedicated concierge will reach out to you within 24 hours.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card border-t border-border">
      <div className="container mx-auto px-6 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Shield size={28} className="mx-auto text-primary mb-4" />
          <h2 className="font-display text-3xl text-foreground mb-3">Private Inquiry</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Prefer to speak with someone before applying? Share a few details and a concierge will reach out discreetly.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
            className="bg-secondary border-border"
            required
          />
          <Input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="bg-secondary border-border"
            required
          />
          <Textarea
            placeholder="What are you looking for? (optional)"
            value={form.looking_for}
            onChange={(e) => setForm((p) => ({ ...p, looking_for: e.target.value }))}
            className="bg-secondary border-border resize-none"
            maxLength={600}
            rows={3}
          />
          <Select
            value={form.preferred_contact}
            onValueChange={(v) => setForm((p) => ({ ...p, preferred_contact: v }))}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Preferred contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-gold text-primary-foreground gap-2 text-xs tracking-[0.2em] uppercase font-semibold"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Inquiry
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            All inquiries are handled with complete discretion.
          </p>
        </form>
      </div>
    </section>
  );
};

export default PrivateInquirySection;

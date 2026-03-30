import { useState } from "react";
import { motion } from "motion/react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Bundle } from "@/hooks/useBundles";

interface BundleRequestFormProps {
  bundle: Bundle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BUDGET_RANGES = [
  "Under $10,000",
  "$10,000 – $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000+",
  "Prefer not to say",
];

const BundleRequestForm = ({ bundle, open, onOpenChange }: BundleRequestFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    num_guests: "",
    destination_city: "",
    destination_country: "",
    travel_date_start: "",
    travel_date_end: "",
    special_requests: "",
    budget_range: "",
    preferred_contact: "email",
  });
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const toggleAddon = (addon: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bundle_requests").insert({
      bundle_id: bundle.id,
      bundle_name: bundle.name,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      num_guests: form.num_guests ? parseInt(form.num_guests) : null,
      destination_city: form.destination_city || null,
      destination_country: form.destination_country || null,
      travel_date_start: form.travel_date_start || null,
      travel_date_end: form.travel_date_end || null,
      selected_addons: selectedAddons,
      special_requests: form.special_requests || null,
      budget_range: form.budget_range || null,
      preferred_contact: form.preferred_contact,
    });

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request submitted!", description: "Our concierge team will be in touch within 24 hours." });
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  const updateField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            Request This Package
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {bundle.name} — every element is fully customizable. Tell us your vision.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Bundle name (read-only) */}
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Package</Label>
            <Input value={bundle.name} readOnly className="bg-secondary border-border mt-1 text-muted-foreground" />
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} className="bg-secondary border-border mt-1" required />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="bg-secondary border-border mt-1" required />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Phone</Label>
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="bg-secondary border-border mt-1" placeholder="+1 ..." />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Number of Guests</Label>
              <Input type="number" min="1" value={form.num_guests} onChange={(e) => updateField("num_guests", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>

          {/* Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Destination City</Label>
              <Input value={form.destination_city} onChange={(e) => updateField("destination_city", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Destination Country</Label>
              <Input value={form.destination_country} onChange={(e) => updateField("destination_country", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>

          {/* Travel dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Start Date</Label>
              <Input type="date" value={form.travel_date_start} onChange={(e) => updateField("travel_date_start", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">End Date</Label>
              <Input type="date" value={form.travel_date_end} onChange={(e) => updateField("travel_date_end", e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>

          {/* Add-ons */}
          {bundle.addon_options.length > 0 && (
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-3 block">
                Interested Add-Ons
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bundle.addon_options.map((addon) => (
                  <label key={addon} className="flex items-start gap-2 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                    <Checkbox
                      checked={selectedAddons.includes(addon)}
                      onCheckedChange={() => toggleAddon(addon)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-foreground leading-tight">{addon}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special requests */}
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Special Requests or Vision</Label>
            <Textarea
              value={form.special_requests}
              onChange={(e) => updateField("special_requests", e.target.value)}
              className="bg-secondary border-border mt-1 min-h-[100px]"
              placeholder="Describe your ideal experience..."
              maxLength={2000}
            />
          </div>

          {/* Budget & contact preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Budget Range</Label>
              <Select value={form.budget_range} onValueChange={(v) => updateField("budget_range", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Preferred Contact</Label>
              <Select value={form.preferred_contact} onValueChange={(v) => updateField("preferred_contact", v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-gradient-gold text-primary-foreground gap-2 py-6 text-xs tracking-widest uppercase">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BundleRequestForm;

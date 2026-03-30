import { useState } from "react";
import { CalendarDays, Users, MessageSquare, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface BookingRequestDialogProps {
  serviceType: "housing" | "security" | "drivers" | "experiences";
  serviceTitle: string;
  serviceId?: string;
  trigger: React.ReactNode;
}

export default function BookingRequestDialog({ serviceType, serviceTitle, serviceId, trigger }: BookingRequestDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    numGuests: "1",
    specialRequests: "",
    preferredContact: "email",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in to make a booking request", variant: "destructive" });
      return;
    }

    if (!form.checkIn) {
      toast({ title: "Please select a start date", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const bookingId = crypto.randomUUID();
    const { error } = await supabase.from("booking_requests").insert({
      id: bookingId,
      user_id: user.id,
      service_type: serviceType,
      service_title: serviceTitle.slice(0, 200),
      service_id: serviceId || null,
      check_in: form.checkIn,
      check_out: form.checkOut || null,
      num_guests: parseInt(form.numGuests) || 1,
      special_requests: form.specialRequests.slice(0, 1000) || null,
      preferred_contact: form.preferredContact,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to submit request", description: "Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Request submitted!", description: "Our concierge team will reach out shortly." });
      setOpen(false);
      setForm({ checkIn: "", checkOut: "", numGuests: "1", specialRequests: "", preferredContact: "email" });

      // Notify admin of new booking request
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "new-booking-alert",
          idempotencyKey: `new-booking-alert-${bookingId}`,
          templateData: {
            memberName: user.user_metadata?.full_name || user.email,
            memberEmail: user.email,
            serviceTitle: serviceTitle.slice(0, 200),
            serviceType,
            checkIn: form.checkIn,
            checkOut: form.checkOut || undefined,
            numGuests: parseInt(form.numGuests) || 1,
            specialRequests: form.specialRequests || undefined,
            preferredContact: form.preferredContact,
          },
        },
      });
    }
  };

  const labels: Record<string, { dateLabel: string; guestLabel: string }> = {
    housing: { dateLabel: "Check-in", guestLabel: "Guests" },
    security: { dateLabel: "Start Date", guestLabel: "People to Cover" },
    drivers: { dateLabel: "Pickup Date", guestLabel: "Passengers" },
    experiences: { dateLabel: "Experience Date", guestLabel: "Group Size" },
  };

  const { dateLabel, guestLabel } = labels[serviceType];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Request Booking</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{serviceTitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                <CalendarDays size={12} /> {dateLabel}
              </label>
              <Input
                type="date"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="bg-secondary border-border"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">
                {serviceType === "housing" ? "Check-out" : "End Date"}
              </label>
              <Input
                type="date"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="bg-secondary border-border"
                min={form.checkIn || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                <Users size={12} /> {guestLabel}
              </label>
              <Select value={form.numGuests} onValueChange={(v) => setForm({ ...form, numGuests: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">
                Preferred Contact
              </label>
              <Select value={form.preferredContact} onValueChange={(v) => setForm({ ...form, preferredContact: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
              <MessageSquare size={12} /> Special Requests
            </label>
            <Textarea
              value={form.specialRequests}
              onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
              placeholder="Any special requirements or preferences..."
              className="bg-secondary border-border resize-none"
              rows={3}
              maxLength={1000}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

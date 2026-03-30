import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ClipboardList, Loader2, Home, Shield, Car, Sparkles, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingRequest {
  id: string;
  service_type: string;
  service_title: string;
  check_in: string | null;
  check_out: string | null;
  num_guests: number;
  special_requests: string | null;
  status: string;
  created_at: string;
}

const serviceIcons: Record<string, React.ElementType> = {
  housing: Home, security: Shield, drivers: Car, experiences: Sparkles,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MemberBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("booking_requests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setBookings(data as BookingRequest[]);
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2">Your Reservations</p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-2">Track all your reservations, requests, and past experiences.</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList size={28} className="text-primary" />
            </div>
            <h3 className="font-display text-xl text-foreground">No Bookings Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your booking history will appear here once you reserve a property, request a driver, or book an experience package.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, i) => {
            const Icon = serviceIcons[booking.service_type] || ClipboardList;
            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg text-foreground truncate">{booking.service_title}</h3>
                          <p className="text-xs tracking-widest uppercase text-muted-foreground mt-0.5">{booking.service_type}</p>
                        </div>
                        <Badge variant="outline" className={`shrink-0 text-[10px] tracking-wider uppercase ${statusColors[booking.status] || ""}`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {booking.check_in && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            {new Date(booking.check_in).toLocaleDateString()}
                            {booking.check_out && ` — ${new Date(booking.check_out).toLocaleDateString()}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Users size={13} /> {booking.num_guests}
                        </span>
                      </div>
                      {booking.special_requests && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">"{booking.special_requests}"</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

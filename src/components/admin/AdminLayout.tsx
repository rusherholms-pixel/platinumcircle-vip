import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Home, Car, CarFront, Sparkles, Shield,
  Users, FileText, ClipboardList, MessageSquare, Settings,
  LogOut, ChevronDown, ChevronRight, Menu, X, Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoEmblem from "@/assets/logo-emblem.svg";

const listingSubItems = [
  { label: "Homes", path: "/admin/listings/homes", icon: Home },
  { label: "Drivers", path: "/admin/listings/drivers", icon: Car },
  { label: "Car Fleets", path: "/admin/listings/car_fleets", icon: CarFront },
  { label: "Experiences", path: "/admin/listings/experiences", icon: Sparkles },
  { label: "Security", path: "/admin/listings/security", icon: Shield },
];

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Listings", path: "/admin/listings", icon: Home, children: listingSubItems },
  { label: "Members", path: "/admin/members", icon: Users },
  { label: "Applications", path: "/admin/applications", icon: FileText },
  { label: "Concierge Requests", path: "/admin/bookings", icon: ClipboardList },
  { label: "Mia Leads", path: "/admin/mia-leads", icon: Sparkles },
  { label: "Messages", path: "/admin/messages", icon: MessageSquare },
  { label: "Homepage", path: "/admin/homepage", icon: Settings },
  { label: "Team", path: "/admin/team", icon: Users },
];

export default function AdminLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [listingsOpen, setListingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => {
          if (data) setIsAdmin(true);
          else navigate("/member/dashboard");
          setChecking(false);
        });
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin/listings")) setListingsOpen(true);
  }, [location.pathname]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-3">
          <img src={logoEmblem} alt="PC" className="h-8 w-8" />
          <span className="font-display text-sm tracking-wider text-gradient-gold">Platinum Circle</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setListingsOpen(!listingsOpen)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {listingsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {listingsOpen && (
                  <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-3">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                          isActive(sub.path)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <sub.icon size={14} />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {user?.user_metadata?.full_name?.[0] || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || "Admin"}
            </p>
            <Badge variant="outline" className="border-primary/30 text-primary text-[9px] tracking-widest uppercase mt-0.5">
              Admin
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => { signOut(); navigate("/"); }}
          >
            <LogOut size={14} />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-border bg-card flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-foreground">
            <Menu size={20} />
          </button>
          <span className="font-display text-sm text-gradient-gold">Platinum Circle</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

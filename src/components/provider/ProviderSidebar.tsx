import {
  LayoutDashboard, Home, CalendarDays, DollarSign, ClipboardList,
  UserCircle, Settings, Eye, HelpCircle, LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainNav = [
  { title: "Overview", url: "/provider/dashboard", icon: LayoutDashboard },
  { title: "My Listings", url: "/provider/listings", icon: Home },
  { title: "Bookings & Requests", url: "/provider/bookings", icon: ClipboardList },
  { title: "Earnings", url: "/provider/earnings", icon: DollarSign },
  { title: "Calendar", url: "/provider/calendar", icon: CalendarDays },
];

const accountNav = [
  { title: "Profile & Verification", url: "/provider/profile", icon: UserCircle },
  { title: "Settings", url: "/provider/settings", icon: Settings },
  { title: "Support", url: "/provider/support", icon: HelpCircle },
];

export function ProviderSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        {/* Brand */}
        {!collapsed && (
          <div className="px-4 pb-4 mb-2 border-b border-border">
            <a href="/" className="font-display text-xl tracking-wider text-gradient-gold">
              Platinum Circle
            </a>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
              Provider Portal
            </p>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* View Platform */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/properties"
                    className="hover:bg-muted/50 text-muted-foreground"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {!collapsed && <span>View as Member</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => { signOut(); navigate("/"); }}
          className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
        >
          <LogOut className={collapsed ? "" : "mr-2"} size={16} />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

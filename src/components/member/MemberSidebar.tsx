import {
  LayoutDashboard, Home, Shield, Car, Sparkles, ClipboardList,
  Gift, UserCircle, Settings, LogOut, MessageSquare,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const browseNav = [
  { title: "Overview", url: "/member/dashboard", icon: LayoutDashboard },
  { title: "Luxury Housing", url: "/member/housing", icon: Home },
  { title: "Personal Security", url: "/member/security", icon: Shield },
  { title: "Elite Drivers", url: "/member/drivers", icon: Car },
  { title: "Experiences", url: "/member/experiences", icon: Sparkles },
];

const accountNav = [
  { title: "My Bookings", url: "/member/bookings", icon: ClipboardList },
  { title: "Messages", url: "/member/messages", icon: MessageSquare },
  { title: "Referrals", url: "/member/referrals", icon: Gift },
  { title: "Profile", url: "/member/profile", icon: UserCircle },
  { title: "Settings", url: "/member/settings", icon: Settings },
];

export function MemberSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        {!collapsed && (
          <div className="px-4 pb-4 mb-2 border-b border-border">
            <a href="/member/dashboard" className="font-display text-xl tracking-wider text-gradient-gold">
              Platinum Circle
            </a>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
              Member Portal
            </p>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Browse Services
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {browseNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
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
            My Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => { signOut(); navigate("/auth"); }}
          className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
        >
          <LogOut className={collapsed ? "" : "mr-2"} size={16} />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

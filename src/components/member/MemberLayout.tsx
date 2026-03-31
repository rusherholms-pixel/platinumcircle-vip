import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MemberSidebar } from "./MemberSidebar";
import { NotificationBell } from "./NotificationBell";
import { FloatingConciergeButton } from "./FloatingConciergeButton";
import { toast } from "@/hooks/use-toast";

export default function MemberLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Session expired",
        description: "Your session has expired. Please sign in to continue.",
      });
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MemberSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40 px-4">
            <SidebarTrigger className="text-muted-foreground" />
            <NotificationBell />
          </header>
          <main className="flex-1 px-6 py-8 lg:px-12 lg:py-10">
            <Outlet />
          </main>
          <FloatingConciergeButton />
        </div>
      </div>
    </SidebarProvider>
  );
}

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleRedirectPath } from "@/lib/authRole";

/**
 * Wraps a public-only page. If the user is authenticated, resolves their
 * role-based home (admin → /admin, provider → /provider/dashboard, else
 * member) and redirects there — the public page never renders for a
 * signed-in user. Uses AuthContext so the same session identity is used
 * everywhere.
 */
export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [home, setHome] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (user) {
      getRoleRedirectPath(user.id).then((path) => {
        if (active) setHome(path);
      });
    }
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || (user && !home)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  if (user && home) {
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}

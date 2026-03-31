import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps a public-only page. If the user is authenticated,
 * redirects to /member/dashboard immediately — the public
 * page never renders in the DOM.
 */
export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/member/dashboard" replace />;
  }

  return <>{children}</>;
}

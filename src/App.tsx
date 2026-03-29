import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Apply from "./pages/Apply";
import Properties from "./pages/Properties";
import PropertyNew from "./pages/PropertyNew";
import PropertyEdit from "./pages/PropertyEdit";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// Provider dashboard
import ProviderLayout from "./components/provider/ProviderLayout";
import ProviderOverview from "./pages/provider/ProviderOverview";
import ProviderListings from "./pages/provider/ProviderListings";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderEarnings from "./pages/provider/ProviderEarnings";
import ProviderCalendar from "./pages/provider/ProviderCalendar";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderSettings from "./pages/provider/ProviderSettings";
import ProviderSupport from "./pages/provider/ProviderSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Legacy dashboard redirect */}
            <Route path="/dashboard" element={<Navigate to="/provider/dashboard" replace />} />
            <Route path="/dashboard/new" element={<Navigate to="/provider/listings/new" replace />} />
            <Route path="/dashboard/edit/:id" element={<Navigate to="/provider/listings/edit/:id" replace />} />

            {/* Provider dashboard */}
            <Route path="/provider" element={<ProviderLayout />}>
              <Route path="dashboard" element={<ProviderOverview />} />
              <Route path="listings" element={<ProviderListings />} />
              <Route path="listings/new" element={<PropertyNew />} />
              <Route path="listings/edit/:id" element={<PropertyEdit />} />
              <Route path="bookings" element={<ProviderBookings />} />
              <Route path="earnings" element={<ProviderEarnings />} />
              <Route path="calendar" element={<ProviderCalendar />} />
              <Route path="profile" element={<ProviderProfile />} />
              <Route path="settings" element={<ProviderSettings />} />
              <Route path="support" element={<ProviderSupport />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

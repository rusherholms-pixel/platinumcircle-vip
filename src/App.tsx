import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthRedirect from "@/components/AuthRedirect";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Apply from "./pages/Apply";
import Properties from "./pages/Properties";
import PropertyNew from "./pages/PropertyNew";
import PropertyEdit from "./pages/PropertyEdit";
import BundlesPage from "./pages/BundlesPage";
import BundleDetail from "./pages/BundleDetail";
import CityExperiences from "./pages/CityExperiences";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";

// Admin dashboard
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminListings from "./pages/admin/AdminListings";
import AdminListingForm from "./pages/admin/AdminListingForm";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminApplications from "./pages/admin/AdminApplications";
import BookingRequestsManager from "./components/admin/BookingRequestsManager";
import ConciergeInbox from "./components/admin/ConciergeInbox";
import MiaLeadsManager from "./components/admin/MiaLeadsManager";
import PartnershipLeadsManager from "./components/admin/PartnershipLeadsManager";
import HomepageContentManager from "./components/admin/HomepageContentManager";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminActivityLog from "./pages/admin/AdminActivityLog";

// Member dashboard
import MemberLayout from "./components/member/MemberLayout";
import MemberOverview from "./pages/member/MemberOverview";
import MemberHousing from "./pages/member/MemberHousing";
import MemberListingDetail from "./pages/member/MemberListingDetail";
import MemberSecurity from "./pages/member/MemberSecurity";
import MemberDrivers from "./pages/member/MemberDrivers";
import MemberExperiences from "./pages/member/MemberExperiences";
import MemberBookings from "./pages/member/MemberBookings";
import MemberReferrals from "./pages/member/MemberReferrals";
import MemberProfile from "./pages/member/MemberProfile";
import MemberSettings from "./pages/member/MemberSettings";
import MemberMessages from "./pages/member/MemberMessages";

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
            {/* Public pages — redirect to dashboard if logged in */}
            <Route path="/" element={<AuthRedirect><Index /></AuthRedirect>} />
            <Route path="/auth" element={<AuthRedirect><Auth /></AuthRedirect>} />
            <Route path="/apply" element={<AuthRedirect><Apply /></AuthRedirect>} />

            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/experiences/bundles" element={<BundlesPage />} />
            <Route path="/experiences/bundles/:slug" element={<BundleDetail />} />
            <Route path="/experiences/:city" element={<CityExperiences />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />

            {/* Legacy redirects */}
            <Route path="/dashboard" element={<Navigate to="/member/dashboard" replace />} />
            <Route path="/properties" element={<Navigate to="/member/housing" replace />} />

            {/* Admin portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="listings/:category" element={<AdminListings />} />
              <Route path="listings/:category/new" element={<AdminListingForm />} />
              <Route path="listings/:category/edit/:id" element={<AdminListingForm />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="bookings" element={<BookingRequestsManager />} />
              <Route path="mia-leads" element={<MiaLeadsManager />} />
              <Route path="partnership-leads" element={<PartnershipLeadsManager />} />
              <Route path="messages" element={<ConciergeInbox />} />
              <Route path="homepage" element={<HomepageContentManager />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="activity" element={<AdminActivityLog />} />
            </Route>

            {/* Member portal */}
            <Route path="/member" element={<MemberLayout />}>
              <Route path="dashboard" element={<MemberOverview />} />
              <Route path="housing" element={<MemberHousing />} />
              <Route path="listing/:id" element={<MemberListingDetail />} />
              <Route path="security" element={<MemberSecurity />} />
              <Route path="drivers" element={<MemberDrivers />} />
              <Route path="experiences" element={<MemberExperiences />} />
              <Route path="bookings" element={<MemberBookings />} />
              <Route path="referrals" element={<MemberReferrals />} />
              <Route path="profile" element={<MemberProfile />} />
              <Route path="settings" element={<MemberSettings />} />
              <Route path="messages" element={<MemberMessages />} />
            </Route>

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

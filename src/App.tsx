import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToast } from "react-hot-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import { Web3Provider } from "@/providers/Web3Provider";
import RequireWallet from "@/components/auth/RequireWallet";
import ConnectWallet from "./pages/ConnectWallet";
import LandingPage from "./pages/LandingPage";
import RoleSelection from "./pages/RoleSelection";
import PatientOnboarding from "./pages/onboarding/PatientOnboarding";
import ProviderOnboarding from "./pages/onboarding/ProviderOnboarding";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import HealthInsights from "./pages/HealthInsights";
import AuditTrail from "./pages/AuditTrail";
import MedicationManager from "./pages/MedicationManager";
import HealthTimeline from "./pages/HealthTimeline";
import FamilyHealthHub from "./pages/FamilyHealthHub";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isLoading } = useAuthStore();

  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HotToast position="top-right" />
          {isLoading && <LoadingSpinner />}
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/connect" replace />} />
              <Route path="/connect" element={<ConnectWallet />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Protected Routes - Require wallet connection */}
              <Route path="/role-selection" element={
                <RequireWallet><RoleSelection /></RequireWallet>
              } />
              <Route path="/onboarding/patient" element={
                <RequireWallet><PatientOnboarding /></RequireWallet>
              } />
              <Route path="/onboarding/provider" element={
                <RequireWallet><ProviderOnboarding /></RequireWallet>
              } />
              <Route path="/dashboard/patient" element={
                <RequireWallet><PatientDashboard /></RequireWallet>
              } />
              <Route path="/dashboard/provider" element={
                <RequireWallet><ProviderDashboard /></RequireWallet>
              } />
              <Route path="/health-insights" element={
                <RequireWallet><HealthInsights /></RequireWallet>
              } />
              <Route path="/audit-trail" element={
                <RequireWallet><AuditTrail /></RequireWallet>
              } />
              <Route path="/medication-manager" element={
                <RequireWallet><MedicationManager /></RequireWallet>
              } />
              <Route path="/health-timeline" element={
                <RequireWallet><HealthTimeline /></RequireWallet>
              } />
              <Route path="/family-health-hub" element={
                <RequireWallet><FamilyHealthHub /></RequireWallet>
              } />
              <Route path="/provider-dashboard" element={
                <RequireWallet><ProviderDashboard /></RequireWallet>
              } />
              <Route path="/notifications" element={
                <RequireWallet><Notifications /></RequireWallet>
              } />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Web3Provider>
  );
};

export default App;

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
import RoleSelection from "./pages/RoleSelection";
import PatientOnboarding from "./pages/onboarding/PatientOnboarding";
import ProviderOnboarding from "./pages/onboarding/ProviderOnboarding";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
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

              {/* Protected Routes - Require wallet connection */}
              <Route path="/role-selection" element={<RoleSelection />} />
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

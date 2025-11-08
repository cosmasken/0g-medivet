import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToast } from "react-hot-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import { Web3Provider } from "@/providers/Web3Provider";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isLoading, currentUser } = useAuthStore();

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
              {/* Auth Route - handles wallet connection and role selection */}
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard/patient" element={
                currentUser?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/" />
              } />
              <Route path="/dashboard/provider" element={
                currentUser?.role === 'provider' ? <ProviderDashboard /> : <Navigate to="/" />
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

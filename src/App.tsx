import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import PatientDashboard from "./pages/patient/Dashboard";
import PatientProfile from "./pages/patient/Profile";
import ProviderDashboard from "./pages/provider/Dashboard";
import Marketplace from "./pages/Marketplace";
import RecordDetail from "./pages/RecordDetail";
import AdminPanel from "./pages/admin/AdminPanel";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToast position="top-right" />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute><PatientDashboard /></ProtectedRoute>
            } />
            <Route path="/patient/profile" element={
              <ProtectedRoute><PatientProfile /></ProtectedRoute>
            } />
            
            {/* Provider Routes */}
            <Route path="/provider/dashboard" element={
              <ProtectedRoute><ProviderDashboard /></ProtectedRoute>
            } />
            
            {/* Shared Routes */}
            <Route path="/marketplace" element={
              <ProtectedRoute><Marketplace /></ProtectedRoute>
            } />
            <Route path="/record/:id" element={
              <ProtectedRoute><RecordDetail /></ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute><AdminPanel /></ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

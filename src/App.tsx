import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { Web3Provider } from "@/providers/Web3Provider";
import { NetworkProvider } from "@/providers/NetworkProvider";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ConnectWallet from "./pages/ConnectWallet";
import RequireWallet from "@/components/auth/RequireWallet";
import PatientDashboard from "./pages/patient/Dashboard";
import PatientProfile from "./pages/patient/Profile";
import PatientBilling from "./pages/patient/Billing";
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderProfile from "./pages/provider/Profile";
import ProviderPurchased from "./pages/provider/Purchased";
import Marketplace from "./pages/Marketplace";
import RecordDetail from "./pages/RecordDetail";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminProfile from "./pages/admin/Profile";
import AdminUsers from "./pages/admin/Users";
import AuditLog from "./pages/AuditLog";

// Authentication now handled through wallet connection and role selection

const App = () => (
  <Web3Provider>
    <NetworkProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToast position="top-right" />
        <BrowserRouter>
          <Layout>
          <Routes>
            {/* Public Routes - Redirect to connect page */}
            <Route path="/" element={<Navigate to="/connect" replace />} />
            <Route path="/connect" element={<ConnectWallet />} />
            
            {/* Protected Routes - Require wallet connection */}
            <Route path="/patient/dashboard" element={
              <RequireWallet><PatientDashboard /></RequireWallet>
            } />
            <Route path="/patient/profile" element={
              <RequireWallet><PatientProfile /></RequireWallet>
            } />
            <Route path="/patient/billing" element={
              <RequireWallet><PatientBilling /></RequireWallet>
            } />
            
            <Route path="/provider/dashboard" element={
              <RequireWallet><ProviderDashboard /></RequireWallet>
            } />
            <Route path="/provider/profile" element={
              <RequireWallet><ProviderProfile /></RequireWallet>
            } />
            <Route path="/provider/purchased" element={
              <RequireWallet><ProviderPurchased /></RequireWallet>
            } />
            
            <Route path="/marketplace" element={
              <RequireWallet><Marketplace /></RequireWallet>
            } />
            <Route path="/record/:id" element={
              <RequireWallet><RecordDetail /></RequireWallet>
            } />
            <Route path="/audit-log" element={
              <RequireWallet><AuditLog /></RequireWallet>
            } />
            
            <Route path="/admin" element={
              <RequireWallet><AdminPanel /></RequireWallet>
            } />
            <Route path="/admin/profile" element={
              <RequireWallet><AdminProfile /></RequireWallet>
            } />
            <Route path="/admin/users" element={
              <RequireWallet><AdminUsers /></RequireWallet>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </NetworkProvider>
  </Web3Provider>
);

export default App;
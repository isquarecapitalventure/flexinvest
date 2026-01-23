import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { DashboardOverview, InvestmentsPage } from "./pages/Dashboard";
import { FundWalletPage } from "./pages/FundWallet";
import { WithdrawPage } from "./pages/Withdraw";
import { TransactionsPage } from "./pages/Transactions";
import { SupportPage } from "./pages/Support";
import { AdminLoginPage, AdminDashboard, AdminUsersPage, AdminDepositsPage } from "./pages/Admin";
import { AdminWithdrawalsPage, AdminInvestmentsPage, AdminComplaintsPage } from "./pages/AdminPages";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Protected Route
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* User Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
      <Route path="/dashboard/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
      <Route path="/dashboard/fund" element={<ProtectedRoute><FundWalletPage /></ProtectedRoute>} />
      <Route path="/dashboard/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
      <Route path="/dashboard/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/dashboard/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/deposits" element={<AdminRoute><AdminDepositsPage /></AdminRoute>} />
      <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawalsPage /></AdminRoute>} />
      <Route path="/admin/investments" element={<AdminRoute><AdminInvestmentsPage /></AdminRoute>} />
      <Route path="/admin/complaints" element={<AdminRoute><AdminComplaintsPage /></AdminRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from '@qrdine/ui';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BranchesPage } from './pages/BranchesPage';
import { MenuPage } from './pages/MenuPage';
import { TablesPage } from './pages/TablesPage';
import { OrdersPage } from './pages/OrdersPage';
import { StaffPage } from './pages/StaffPage';
import { SettingsPage } from './pages/SettingsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { QRCodesPage } from './pages/QRCodesPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireOnboarded?: boolean }> = ({ 
  children, 
  requireOnboarded = true 
}) => {
  const { user, restaurantId, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
        <span className="text-xs uppercase tracking-wider text-slate-500">Checking credentials...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is onboarded but trying to access onboarding, send to dashboard
  if (user && restaurantId && !requireOnboarded) {
    return <Navigate to="/" replace />;
  }

  // If user is NOT onboarded but trying to access dashboard/menu/etc., send to onboarding
  if (user && !restaurantId && requireOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Onboarding Flow */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarded={false}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Console Panel */}
            <Route
              path="/"
              element={
                <ProtectedRoute requireOnboarded={true}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="restaurant" element={<PlaceholderPage title="Restaurant Details" description="Manage root restaurant slug, classifications, and parameters" />} />
              <Route path="branches" element={<BranchesPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="qr-codes" element={<QRCodesPage />} />
              <Route path="kitchen" element={<PlaceholderPage title="Kitchen Display System" description="Real-time order tickets console for kitchen operations" />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="customers" element={<PlaceholderPage title="Customer Directory" description="Track dining history, profiles, and order preferences" />} />
              <Route path="offers" element={<PlaceholderPage title="Offers Management" description="Setup branch-wide discounts and promotions" />} />
              <Route path="coupons" element={<PlaceholderPage title="Coupon Codes" description="Generate single-use or restaurant-wide coupon parameters" />} />
              <Route path="analytics" element={<PlaceholderPage title="Sales Analytics" description="Track revenue, orders, and branch operations metrics" />} />
              <Route path="ai" element={<PlaceholderPage title="AI Insights" description="DeepMind smart menu ranking and demand forecasting tools" />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="printer" element={<PlaceholderPage title="Thermal Printer Setup" description="Configure ESC/POS thermal printing integrations" />} />
              <Route path="subscription" element={<PlaceholderPage title="SaaS Subscriptions" description="Manage plan subscriptions, usage limits, and invoices" />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};
export default App;

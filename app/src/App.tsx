import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Customers } from '@/pages/sales/Customers';
import { Sites } from '@/pages/sales/Sites';
import { Leads } from '@/pages/sales/Leads';
import { Quotations } from '@/pages/marketing/Quotations';
import { QuotationBuilder } from '@/pages/marketing/QuotationBuilder';
import { Pricing } from '@/pages/marketing/Pricing';
import { Products } from '@/pages/marketing/Products';
import { Approvals } from '@/pages/approver/Approvals';
import { Jobs } from '@/pages/planner/Jobs';
import { Inventory } from '@/pages/planner/Inventory';
import { TechnicianJobs } from '@/pages/technician/TechnicianJobs';
import { JobExecution } from '@/pages/technician/JobExecution';
import { QRScanner } from '@/pages/technician/QRScanner';
import { Contracts } from '@/pages/sales/Contracts';
import { Users } from '@/pages/admin/Users';
import { Settings } from '@/pages/settings/Settings';
import { QuotationTemplateSettings } from '@/pages/settings/QuotationTemplateSettings';
import type { UserRole } from '@/types';

// Protected Route Component
function ProtectedRoute({
  children,
  requiredRoles
}: {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        {/* Dashboard - All authenticated users */}
        <Route path="/" element={<Dashboard />} />

        {/* Sales Routes */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute requiredRoles={['sales', 'admin']}>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sites"
          element={
            <ProtectedRoute requiredRoles={['sales', 'admin']}>
              <Sites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute requiredRoles={['sales', 'marketing', 'admin']}>
              <Leads />
            </ProtectedRoute>
          }
        />

        {/* Marketing Routes */}
        <Route
          path="/quotations"
          element={
            <ProtectedRoute requiredRoles={['sales', 'marketing', 'admin']}>
              <Quotations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/new"
          element={
            <ProtectedRoute requiredRoles={['sales', 'marketing', 'admin']}>
              <QuotationBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/:id"
          element={
            <ProtectedRoute requiredRoles={['sales', 'marketing', 'admin']}>
              <QuotationBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute requiredRoles={['marketing', 'admin']}>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute requiredRoles={['marketing', 'admin']}>
              <Products />
            </ProtectedRoute>
          }
        />

        {/* Approver Routes */}
        <Route
          path="/approvals"
          element={
            <ProtectedRoute requiredRoles={['approver', 'admin']}>
              <Approvals />
            </ProtectedRoute>
          }
        />

        {/* Planner Routes */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute requiredRoles={['planner', 'technician', 'admin']}>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute requiredRoles={['planner', 'admin']}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* Technician Routes */}
        <Route
          path="/technician/jobs"
          element={
            <ProtectedRoute requiredRoles={['technician', 'admin']}>
              <TechnicianJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/jobs/:id"
          element={
            <ProtectedRoute requiredRoles={['technician', 'admin']}>
              <JobExecution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/scan"
          element={
            <ProtectedRoute requiredRoles={['technician', 'admin']}>
              <QRScanner />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRoles={['admin', 'sales', 'marketing']}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/contracts"
          element={
            <ProtectedRoute requiredRoles={['sales', 'planner', 'approver', 'admin']}>
              <Contracts />
            </ProtectedRoute>
          }
        />

        {/* Settings Routes */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/quotation-template"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <QuotationTemplateSettings />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

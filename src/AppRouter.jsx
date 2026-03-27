import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { TenantsPage } from '@/pages/TenantsPage'
import { UtilitiesPage } from '@/pages/UtilitiesPage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { Spinner } from '@/components/shared'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="utilities" element={<UtilitiesPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="maintenance" element={<ComingSoon title="Maintenance" />} />
        <Route path="leases" element={<ComingSoon title="Leases" />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
      </Route>
    </Routes>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 text-sm">This module is coming soon.</p>
    </div>
  )
}

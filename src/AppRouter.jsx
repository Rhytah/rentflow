import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { TenantsPage } from '@/pages/TenantsPage'
import { UtilitiesPage } from '@/pages/UtilitiesPage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { LeasesPage } from '@/pages/LeasesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { Spinner } from '@/components/shared'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
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
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="leases" element={<LeasesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

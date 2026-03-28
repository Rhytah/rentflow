import { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, Zap, Users, Building2,
  Wrench, FileText, Settings, LogOut, X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Avatar } from '@/components/shared'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Payments', icon: CreditCard, to: '/payments', badge: 3 },
  { label: 'Utilities', icon: Zap, to: '/utilities' },
  { label: 'Tenants', icon: Users, to: '/tenants' },
  { label: 'Properties', icon: Building2, to: '/properties' },
  { label: 'Maintenance', icon: Wrench, to: '/maintenance', badge: 2 },
  { label: 'Leases', icon: FileText, to: '/leases' },
]

const tenantNav = [
  { label: 'My Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Pay Rent', icon: CreditCard, to: '/payments' },
  { label: 'My Lease', icon: FileText, to: '/leases' },
  { label: 'Maintenance', icon: Wrench, to: '/maintenance' },
]

export function Sidebar({ mobileNavOpen, onMobileClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isTenant = profile?.role === 'tenant'
  const items = isTenant ? tenantNav : navItems

  useEffect(() => {
    onMobileClose()
  }, [location.pathname, onMobileClose])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onMobileClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen, onMobileClose])

  const linkClass = ({ isActive }) =>
    `sidebar-item ${isActive ? 'active' : ''}`

  const navBody = (
    <>
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-gray-100 dark:border-gray-800 lg:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate">RentFlow</span>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <span className="pill pill-blue capitalize text-[10px]">
          {profile?.role?.replace('_', ' ') ?? 'Loading...'}
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {items.map(({ label, icon: Icon, to, badge }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
            <Icon size={15} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 rounded-full w-4 h-4 flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={15} />
          Settings
        </NavLink>
        <button
          type="button"
          onClick={async () => { await signOut(); navigate('/login') }}
          className="sidebar-item w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      {profile && (
        <div className="flex items-center gap-2.5 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <Avatar name={profile.full_name} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{profile.full_name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{profile.email}</p>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <div
        className={`
          fixed inset-0 z-[45] bg-black/40 transition-opacity duration-200 lg:hidden
          ${mobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onMobileClose}
        role="presentation"
        aria-hidden={!mobileNavOpen}
      />

      <aside
        className={`
          flex flex-col w-[min(18rem,88vw)] max-w-[18rem] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transition-transform duration-200 ease-out
          min-h-screen min-h-[100dvh] max-h-[100dvh] lg:max-h-none
          ${mobileNavOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
        `}
      >
        {navBody}
      </aside>
    </>
  )
}

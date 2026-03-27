import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, Zap, Users, Building2,
  Wrench, FileText, Settings, LogOut, ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Avatar } from '@/components/shared'

const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, to: '/' },
  { label: 'Payments',    icon: CreditCard,       to: '/payments',    badge: 3 },
  { label: 'Utilities',   icon: Zap,              to: '/utilities' },
  { label: 'Tenants',     icon: Users,            to: '/tenants' },
  { label: 'Properties',  icon: Building2,        to: '/properties' },
  { label: 'Maintenance', icon: Wrench,           to: '/maintenance', badge: 2 },
  { label: 'Leases',      icon: FileText,         to: '/leases' },
]

const tenantNav = [
  { label: 'My Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Pay Rent',      icon: CreditCard,      to: '/payments' },
  { label: 'My Lease',      icon: FileText,        to: '/leases' },
  { label: 'Maintenance',   icon: Wrench,          to: '/maintenance' },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isTenant = profile?.role === 'tenant'
  const items = isTenant ? tenantNav : navItems

  return (
    <aside className="w-52 bg-white border-r border-gray-100 flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={14} className="text-white" />
        </div>
        <span className="text-[15px] font-semibold text-gray-900">RentFlow</span>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2 border-b border-gray-100">
        <span className="pill pill-blue capitalize text-[10px]">
          {profile?.role?.replace('_', ' ') ?? 'Loading...'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {items.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={15} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[10px] font-medium bg-red-100 text-red-700 rounded-full w-4 h-4 flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
        <NavLink to="/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Settings size={15} />
          Settings
        </NavLink>
        <button
          onClick={async () => { await signOut(); navigate('/login') }}
          className="sidebar-item w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      {/* User */}
      {profile && (
        <div className="flex items-center gap-2.5 px-4 py-3 border-t border-gray-100">
          <Avatar name={profile.full_name} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{profile.full_name}</p>
            <p className="text-[10px] text-gray-400 truncate">{profile.email}</p>
          </div>
        </div>
      )}
    </aside>
  )
}

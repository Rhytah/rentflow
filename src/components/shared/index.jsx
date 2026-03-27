import { Loader2 } from 'lucide-react'
import { classNames } from '@/lib/utils'

// ── STATUS PILL ───────────────────────────────────────────────
const pillMap = {
  paid: 'pill-green',
  overdue: 'pill-red',
  partial: 'pill-amber',
  pending: 'pill-blue',
  upcoming: 'pill-gray',
}

export function StatusPill({ status }) {
  return (
    <span className={`pill ${pillMap[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ── AVATAR ────────────────────────────────────────────────────
const avatarColors = [
  'bg-brand-50 text-brand-800',
  'bg-green-50 text-green-800',
  'bg-amber-50 text-amber-800',
  'bg-rose-50 text-rose-800',
  'bg-teal-50 text-teal-800',
]

export function Avatar({ name, size = 'sm' }) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  const colorIdx = name.charCodeAt(0) % avatarColors.length
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-base' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
  return (
    <div className={classNames('rounded-full flex items-center justify-center font-medium flex-shrink-0', avatarColors[colorIdx], sizeClass)}>
      {initials}
    </div>
  )
}

// ── LOADING SPINNER ────────────────────────────────────────────
export function Spinner({ className }) {
  return <Loader2 className={classNames('animate-spin text-brand-600', className ?? 'w-5 h-5')} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-8 h-8" />
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-gray-300 mb-3">{icon}</div>}
      <p className="font-medium text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── METRIC CARD ───────────────────────────────────────────────
export function MetricCard({ label, value, sub, subColor }) {
  const subClass = subColor === 'green' ? 'text-green-600' : subColor === 'red' ? 'text-red-600' : subColor === 'amber' ? 'text-amber-600' : 'text-gray-400'
  return (
    <div className="metric-card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-medium text-gray-900">{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${subClass}`}>{sub}</p>}
    </div>
  )
}

// ── SECTION CARD ──────────────────────────────────────────────
export function Card({ children, className, onClick }) {
  return (
    <div className={classNames('card', className)} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-800">{title}</h3>
      {action}
    </div>
  )
}

// ── MODAL ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-medium text-gray-900 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// ── PROGRESS BAR ──────────────────────────────────────────────
export function ProgressBar({ pct, color = 'brand' }) {
  const fill = color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-400' : color === 'amber' ? 'bg-amber-400' : 'bg-brand-600'
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={classNames('h-full rounded-full transition-all', fill)} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

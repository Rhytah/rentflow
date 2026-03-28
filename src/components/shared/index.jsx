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
  'bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-300',
  'bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-300',
  'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
  'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
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
  return <Loader2 className={classNames('animate-spin text-brand-600 dark:text-brand-400', className ?? 'w-5 h-5')} />
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
      {icon && <div className="text-gray-300 dark:text-gray-600 mb-3">{icon}</div>}
      <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {description && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── METRIC CARD ───────────────────────────────────────────────
export function MetricCard({ label, value, sub, subColor }) {
  const subClass = subColor === 'green'
    ? 'text-green-600 dark:text-green-400'
    : subColor === 'red'
      ? 'text-red-600 dark:text-red-400'
      : subColor === 'amber'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-gray-400 dark:text-gray-500'
  return (
    <div className="metric-card">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-medium text-gray-900 dark:text-gray-100">{value}</p>
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
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 min-w-0">{title}</h3>
      {action}
    </div>
  )
}

// ── MODAL ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      <div
        className="relative bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[92dvh] sm:max-h-[90dvh] overflow-y-auto p-4 sm:p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// ── PROGRESS BAR ──────────────────────────────────────────────
export function ProgressBar({ pct, color = 'brand' }) {
  const fill = color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-400' : color === 'amber' ? 'bg-amber-400' : 'bg-brand-600'
  return (
    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className={classNames('h-full rounded-full transition-all', fill)} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

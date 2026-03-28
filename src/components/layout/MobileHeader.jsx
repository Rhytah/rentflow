import { Menu, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export function MobileHeader({ onOpenMenu }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 lg:hidden safe-area-pt">
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 -ml-1"
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={2} />
      </button>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">RentFlow</span>
      </div>
      <ThemeToggle variant="icon" />
    </header>
  )
}

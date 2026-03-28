import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { classNames } from '@/lib/utils'

export function ThemeToggle({ variant = 'sidebar' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={classNames(
          'flex h-10 w-10 items-center justify-center rounded-lg shrink-0 -mr-1',
          'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="sidebar-item w-full text-left"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="flex-1">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}

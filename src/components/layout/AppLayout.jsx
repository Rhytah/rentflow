import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileNavOpen])

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-gray-950">
      <MobileHeader onOpenMenu={() => setMobileNavOpen(true)} />
      <Sidebar mobileNavOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}

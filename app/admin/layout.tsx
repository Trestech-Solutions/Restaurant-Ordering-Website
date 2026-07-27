'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { useLogout } from '@/api/client/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  UserCog,
  LogOut,
  Search,
  Bell,
  Settings,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard',     href: '/admin',              icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Master Groups', href: '/admin/master-groups', icon: <Users className="w-5 h-5" /> },
  { label: 'Restaurants',   href: '/admin/restaurants',  icon: <UtensilsCrossed className="w-5 h-5" /> },
  { label: 'All Users',     href: '/admin/users',        icon: <UserCog className="w-5 h-5" /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout: clearSession, getRefreshToken } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { logout: logoutMutation, isPending: loggingOut } = useLogout({
    onSuccess: () => clearSession(),
    onError:   () => clearSession(),
  })

  const handleLogout = () => {
    const refresh = getRefreshToken()
    if (refresh) logoutMutation({ refresh })
    else clearSession()
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user) {
        router.push('/login')
      } else if (!user.is_staff) {
        // Non-staff users should go to their own dashboard
        router.push('/dashboard')
      }
    }
  }, [mounted, isLoading, user, router])

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!user || !user.is_staff) return null

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-blue-700 flex-shrink-0">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">Trestech</span>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              isActive(item.href)
                ? 'bg-sky-50 text-sky-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className={isActive(item.href) ? 'text-sky-600' : 'text-gray-400'}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — desktop: fixed, mobile: slide-over ── */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200
          flex flex-col overflow-hidden z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Topbar ── */}
      <header className="fixed right-0 top-0 left-0 lg:left-64 h-16 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30">

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mr-2"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search restaurants, groups..."
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button className="hidden sm:flex rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-blue-700 text-white font-bold text-xs flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
              {displayName}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="lg:ml-64 pt-20 lg:pt-20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

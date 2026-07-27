'use client'

import { Search, Bell, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/context/AuthContext'
import { NotificationsPanel } from './NotificationsPanel'
import { useSidebar } from '@/lib/context/SidebarContext'

export function Topbar() {
  const [searchValue, setSearchValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const { collapsed } = useSidebar()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const avatarUrl = 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-25.webp'

  return (
    <header className={`fixed right-0 top-0 h-20 border-b border-border bg-card px-8 flex items-center justify-between transition-all duration-200 ${collapsed ? 'left-20' : 'left-64'}`}>
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search orders, menu items..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setNotifOpen(true)}
          className="relative rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red"></span>
        </button>

        <button className="rounded-lg p-2 hover:bg-muted transition-colors">
          <Settings className="h-5 w-5 text-foreground" />
        </button>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-colors"
            >
              <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden">
                <Image src={avatarUrl} alt={user.username ?? user.email} fill className="object-cover" />
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                {user.username ?? user.email}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.username ?? user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.username === 'restaurant' ? 'Manager' : 'Admin'}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
    </header>
  )
}
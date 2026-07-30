// components/website/UserDropdown.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserCircle, ChevronDown, Package, MapPin, LogOut, User } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'

export function UserDropdown({ onLoginClick }: { onLoginClick: () => void }) {
  const { user, setUser } = useCart()
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)
  const router            = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const handleSignOut = () => {
    setUser(null)
    setOpen(false)
    router.push('/')
  }

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-1.5 text-sm font-medium hover:underline"
        aria-label="Sign in or Register"
      >
        <User size={16} />
        <span className="hidden sm:inline">Sign in / Register</span>
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
      >
        <UserCircle size={18} />
        <span className="hidden sm:inline">{user.name}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white shadow-xl border border-neutral-100 z-[999] overflow-hidden">
          <Link
            href="/website/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <UserCircle size={16} className="text-neutral-400" />
            My Profile
          </Link>
          <Link
            href="/website/profile/myOrders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Package size={16} className="text-neutral-400" />
            My Orders
          </Link>
          <Link
            href="/website/profile/addresses"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <MapPin size={16} className="text-neutral-400" />
            My Addresses
          </Link>
          <div className="border-t border-neutral-100" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[#c8102e] hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
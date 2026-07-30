'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import type { LoginResponse } from '@/api/client/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthUser = LoginResponse['user']

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  /** Persist login response from the API */
  persistLogin: (data: LoginResponse) => void
  /** Clear session and redirect to /login */
  logout: () => void
  /** Read the stored refresh token (needed by useLogout hook) */
  getRefreshToken: () => string | null
}

// ─── Storage helpers (centralised so keys are never scattered) ────────────────

const KEYS = {
  token:   'trestech_token',
  refresh: 'trestech_refresh_token',
  user:    'trestech_user',
} as const

function saveSession(data: LoginResponse) {
  localStorage.setItem(KEYS.token,   data.access)
  localStorage.setItem(KEYS.refresh, data.refresh)
  localStorage.setItem(KEYS.user,    JSON.stringify(data.user))
  // Cookie for Next.js middleware route protection
  document.cookie = `user=${JSON.stringify({ id: data.user.id, is_staff: data.user.is_staff })}; path=/; max-age=86400`
}

function clearSession() {
  localStorage.removeItem(KEYS.token)
  localStorage.removeItem(KEYS.refresh)
  localStorage.removeItem(KEYS.user)
  document.cookie = 'user=; path=/; max-age=0'
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEYS.user)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount (runs client-side only)
  useEffect(() => {
    setUser(loadUser())
    setIsLoading(false)
  }, [])

  const persistLogin = useCallback((data: LoginResponse) => {
    saveSession(data)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    router.push('/')
  }, [router])

  const getRefreshToken = useCallback(
    () => localStorage.getItem(KEYS.refresh),
    []
  )

  return (
    <AuthContext.Provider value={{ user, isLoading, persistLogin, logout, getRefreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

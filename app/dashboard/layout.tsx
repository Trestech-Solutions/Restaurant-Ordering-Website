'use client'

import { Sidebar } from '@/components/shared/Sidebar'
import { Topbar } from '@/components/shared/Topbar'
import { PlatformProvider } from '@/lib/context/PlatformContext'
import { SidebarProvider, useSidebar } from '@/lib/context/SidebarContext'
import { AuthProvider } from '@/lib/context/AuthContext'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function DashboardLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isLoading } = useAuth()
  const { collapsed } = useSidebar()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.is_staff) {
        router.push('/admin')
      }
    }
  }, [mounted, user, isLoading, router])

  if (!mounted || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.is_staff) {
    return null
  }

  return (
    <PlatformProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Topbar />
        <main
          className={`pt-20 p-8 transition-all duration-200 ${
            collapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </PlatformProvider>
  )
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </SidebarProvider>
    </AuthProvider>
  )
}

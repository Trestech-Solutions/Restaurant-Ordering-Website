'use client'

import { CartProvider } from '@/lib/context/CartContext'
import { CartDrawer } from '@/components/website/CartDrawer'
import { WebsiteBootstrap } from '@/components/website/WebsiteBootstrap'

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {/* Shows OrderTypeModal on first visit */}
      <WebsiteBootstrap />
      {/* Slide-in cart drawer */}
      <CartDrawer />
      {children}
    </CartProvider>
  )
}

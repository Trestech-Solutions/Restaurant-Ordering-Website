'use client'

import { CartProvider } from '@/lib/context/CartContext'
import { CartDrawer } from '@/components/website/CartDrawer'
import { WebsiteBootstrap } from '@/components/website/WebsiteBootstrap'

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div
        style={{
          backgroundImage: `url("https://assets.indolj.io/upload/1693394669-Final-Pattern.png")`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
      >
        <WebsiteBootstrap />
        <CartDrawer />
        {children}
      </div>
    </CartProvider>
  )
}

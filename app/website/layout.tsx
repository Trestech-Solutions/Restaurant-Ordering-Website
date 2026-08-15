'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { CartProvider, useCart } from '@/lib/hooks/useCart'
import { ReduxProvider } from '@/redux/Provider'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartBar } from '@/components/cart/CartBar'
import { WebsiteBootstrap } from '@/components/website/WebsiteBootstrap'
import { WebsiteNavbar } from '@/components/website/WebsiteNavbar'
import { WebsiteFooter } from '@/components/website/WebsiteFooter'
import { AuthModal } from '@/components/auth/AuthModal'
import { CorporateOrderModal } from '@/components/website/CorporateOrderModal'
import { MenuDrawer } from '@/components/website/MenuDrawer'
import { OrderTypeModal } from '@/components/website/OrderTypeModal'

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <CartProvider>
        <WebsiteLayoutInner>{children}</WebsiteLayoutInner>
      </CartProvider>
    </ReduxProvider>
  )
}

function WebsiteLayoutInner({ children }: { children: React.ReactNode }) {
  const { locationModalOpen, closeLocationModal } = useCart()
  const [authModalOpen, setAuthModalOpen]           = useState(false)
  const [corporateModalOpen, setCorporateModalOpen] = useState(false)
  const [menuOpen, setMenuOpen]                     = useState(false)

  return (
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

      <WebsiteNavbar
        onLoginClick={() => setAuthModalOpen(true)}
        onCorporateClick={() => setCorporateModalOpen(true)}
        onMenuClick={() => setMenuOpen(true)}
      />

      {children}

      <CartBar />
      <WebsiteFooter />

      <a
        href="https://wa.me/923366655786"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle size={26} fill="white" />
      </a>

      {locationModalOpen && (
        <OrderTypeModal onClose={closeLocationModal} />
      )}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onGuestContinue={() => setAuthModalOpen(false)}
        />
      )}
      {corporateModalOpen && (
        <CorporateOrderModal onClose={() => setCorporateModalOpen(false)} />
      )}
      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLoginClick={() => setAuthModalOpen(true)}
      />
    </div>
  )
}

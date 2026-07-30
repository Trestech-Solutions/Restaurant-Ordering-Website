'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { CartProvider } from '@/lib/context/CartContext'
import { CartDrawer } from '@/components/website/CartDrawer'
import { CartBar } from '@/components/website/CartBar'
import { WebsiteBootstrap } from '@/components/website/WebsiteBootstrap'
import { WebsiteNavbar } from '@/components/website/WebsiteNavbar'
import { WebsiteFooter } from '@/components/website/WebsiteFooter'
import { AuthModal } from '@/components/website/AuthModal'
import { CorporateOrderModal } from '@/components/website/CorporateOrderModal'
import { MenuDrawer } from '@/components/website/MenuDrawer'

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [authModalOpen, setAuthModalOpen]           = useState(false)
  const [corporateModalOpen, setCorporateModalOpen] = useState(false)
  const [menuOpen, setMenuOpen]                     = useState(false)

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
    </CartProvider>
  )
}

'use client'

import { X } from 'lucide-react'

const MENU_ITEMS = [
  { label: 'About Us',         href: '/website/about' },
  { label: 'Blog',             href: '/website/blog' },
  { label: 'Contact Us',       href: '/website/contact' },
  { label: 'Our Locations',    href: '/website/locations' },
  { label: 'Submit Complaint', href: '/website/complaint' },
]

interface MenuDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
      )}

      {/* Drawer — slides in from right */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-[#c8102e] shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-3 px-5 pt-2">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="rounded-lg bg-[#f7c948] px-5 py-3.5 text-sm font-bold text-neutral-900 hover:bg-yellow-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-5 pb-6">
          <p className="text-center text-xs text-white/60">
            Powered by{' '}
            <span className="font-bold text-white/80">Trestech</span>
          </p>
        </div>
      </div>
    </>
  )
}

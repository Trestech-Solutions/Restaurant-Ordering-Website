// components/website/WebsiteNavbar.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MapPin, Phone, Menu, ShoppingCart,
} from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { UserDropdown } from '@/components/website/UserDropdown'

interface WebsiteNavbarProps {
  onLoginClick: () => void
  onCorporateClick: () => void
  onMenuClick: () => void
}

export function WebsiteNavbar({
  onLoginClick,
  onCorporateClick,
  onMenuClick,
}: WebsiteNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, openCart, location, openLocationModal } = useCart()

  const isCheckout = pathname === '/website/checkout'

  const handleLocationClick = () => {
    if (isCheckout) {
      router.push('/')
    } else {
      openLocationModal()
    }
  }

  const isHome = pathname === '/' || pathname === '/website/home'
  const isAbout = pathname === '/website/about'

  const isOverlap = !isAbout
  const logoSize = isOverlap
    ? 'h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24'
    : 'h-14 w-14 sm:h-16 sm:w-16'

  const logoImgSize = isOverlap ? 96 : 64
  const logoBottom = isOverlap
    ? '-bottom-6 sm:-bottom-8 lg:-bottom-10 xl:-bottom-12'
    : ''

  const LogoContent = (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-40 flex ${logoSize} items-center justify-center rounded-full shadow-xl overflow-hidden ${logoBottom}`}
    >
      <Image
        src="/web/logo.webp"
        alt="United King"
        width={logoImgSize}
        height={logoImgSize}
        className="object-contain"
      />
    </div>
  )

  return (
    <header className="relative bg-black text-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 md:gap-4 md:px-8 md:py-2.5">

        {/* Location */}
        <button
          onClick={handleLocationClick}
          className="flex items-center gap-1.5 rounded bg-white px-2 py-1 text-[10px] font-semibold text-neutral-900 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          <MapPin size={14} className="sm:hidden" />
          <MapPin size={16} className="hidden sm:block" />

          <span className="hidden text-left leading-tight sm:block">
            Change Location<br />
            <span className="font-normal">
              {location || 'NED University'}
            </span>
          </span>

          <span className="max-w-[110px] truncate text-left leading-tight sm:hidden">
            {location || 'NED University'}
          </span>
        </button>

        {/* Phone Number */}
        <a
          href="tel:021111022022"
          className="hidden items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-black sm:flex"
        >
          <Phone size={16} className="text-black" />
          <span className="text-black">
            021-111-022-022
          </span>
        </a>

        {/* Logo */}
        {isHome ? LogoContent : <Link href="/">{LogoContent}</Link>}

        <div className="flex-1" />

    
        {/* Cart */}
        <button
          onClick={openCart}
          aria-label="Open cart"
          className="relative rounded-full p-1.5 transition-colors hover:bg-white/10 sm:p-2"
        >
          <ShoppingCart size={20} className="sm:hidden" />
          <ShoppingCart size={22} className="hidden sm:block" />

          {totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-neutral-900 sm:h-5 sm:w-5 sm:text-[10px]">
              {totalItems}
            </span>
          )}
        </button>

        {/* Menu */}
        <button
          aria-label="Open menu"
          onClick={onMenuClick}
          className="rounded-full p-1 hover:bg-white/10 sm:p-0"
        >
          <Menu size={20} className="sm:hidden" />
          <Menu size={22} className="hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
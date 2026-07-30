'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MapPin, Phone, Menu, ShoppingCart,
} from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
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
  const { totalItems, openCart, location, openLocationModal } = useCart()

  const isHome  = pathname === '/website/home'
  const isAbout = pathname === '/website/about'

  const isOverlap = !isAbout
  const logoSize  = isOverlap ? 'h-24 w-24' : 'h-16 w-16'
  const logoImgSize = isOverlap ? 96 : 64
  const logoBottom = isOverlap ? '-bottom-12' : ''

  const LogoContent = (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-40 flex ${logoSize} items-center justify-center rounded-full bg-white shadow-xl overflow-hidden border-4 border-white ${logoBottom}`}
    >
      <Image
        src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
        alt="United King"
        width={logoImgSize}
        height={logoImgSize}
        className="object-contain"
      />
    </div>
  )

  return (
    <header className="bg-[#c8102e] text-white relative relative">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2.5 md:px-8">
        <button
          onClick={openLocationModal}
          className="flex items-center gap-2 rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900"
        >
          <MapPin size={16} />
          <span className="text-left leading-tight">
            Change Location<br />
            <span className="font-normal">{location || 'NED University'}</span>
          </span>
        </button>

        <a
          href="tel:021111022022"
          className="hidden items-center gap-2 text-sm font-medium sm:flex"
        >
          <Phone size={16} />
          021-111-022-022
        </a>

        {isHome ? LogoContent : <Link href="/website/home">{LogoContent}</Link>}

        <div className="flex-1" />

        <div className="hidden items-center gap-4 text-sm md:flex">
          <UserDropdown onLoginClick={onLoginClick} />
          <span className="text-white/50">|</span>
          <button
            onClick={onCorporateClick}
            className="rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900"
          >
            Corporate &amp; Special Event Orders
          </button>
        </div>

        <button
          onClick={openCart}
          aria-label="Open cart"
          className="relative rounded-full p-2 hover:bg-white/10 transition-colors"
        >
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f7c948] text-[10px] font-bold text-neutral-900">
              {totalItems}
            </span>
          )}
        </button>

        <button aria-label="Open menu" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Phone, User, Menu, ShoppingCart,
  Search, ArrowUp, MessageCircle,
} from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { AuthModal } from '@/components/website/AuthModal'
import { CorporateOrderModal } from '@/components/website/CorporateOrderModal'
import { MenuDrawer } from '@/components/website/MenuDrawer'

// ─── Branch Data ─────────────────────────────────────────────────────────────
const BRANCHES = [
  {
    name: 'SHAH FAISAL BRANCH',
    address: 'Plot No. BP-26, Block-2, Shah Faisal Colony, Colony Chowrangi, Co. Bin Qasim, Karachi-75210, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Shah+Faisal+Colony+Karachi',
  },
  {
    name: 'DHORAJI BRANCH',
    address: '40/C, Dhoraji Colony, Near Muncipal Busway, Society Cut, Brehmin Yan, Karachi-75700.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Dhoraji+Colony+Karachi',
  },
  {
    name: 'GULSHAN-E-MAYMAR BRANCH',
    address: 'Grand Parade, Sector A-2, Sector-Sector A, Gulshan-e-Maymar, Karachi-75340, Sindh, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Gulshan+e+Maymar+Karachi',
  },
  {
    name: 'NORTH NAZIMABAD BRANCH',
    address: 'L-8, Fateh, Chowrangi, Nazimabad Branch, 1058, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=North+Nazimabad+Karachi',
  },
  {
    name: 'SAFOORAH BRANCH',
    address: 'Near Dastoor-eh-Qafaeen University Road.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Safoorah+Karachi',
  },
  {
    name: 'FAIZAN-E-MADINA BRANCH',
    address: '141, Bahadur Madina Road, Peera Ganj, Karachi Karachi City, Sindh.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Faizan+e+Madina+Karachi',
  },
  {
    name: 'CLIFTON BRANCH',
    address: 'Clifton Old Aristocratic House, Near Talwar, Clifton Branch, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Clifton+Karachi',
  },
  {
    name: 'DHA BRANCH',
    address: 'DHA Phase-4, Commanders, Street 10, Defence Phase-4, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=DHA+Phase+4+Karachi',
  },
  {
    name: 'GARDEN EAST BRANCH',
    address: 'Garden Cast Street No. 6, Al Yamani Region DY, Near Row Tone Super Mart, Near Old Bone, Karachi.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Garden+East+Karachi',
  },
  {
    name: 'GULSHAN IQBAL BRANCH',
    address: 'Amo Court, 11/C, Main Road, Gulshan Iqbal, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Gulshan+Iqbal+Karachi',
  },
  {
    name: 'KARIMABAD BRANCH',
    address: 'Address: Federal B Area Karimabad, Block-1, Goldena Town, Karimabad, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Karimabad+Karachi',
  },
  {
    name: 'MASKAN BRANCH',
    address: 'Plot No. 70-71 IN, Block 1, Block Scheme, Maskan, Gulberg Iqbal, Sector-1, Maskan, Orangiabad.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Maskan+Karachi',
  },
  {
    name: 'NORTH KARACHI BRANCH',
    address: 'Shop No. 11/19, Sector-11C-1, North Karachi, North of Road.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=North+Karachi',
  },
  {
    name: 'SHARFABAD BRANCH',
    address: 'No. 54, Hydra Phase-1, Sharfabad, Karachi Area, Sindh.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Sharfabad+Karachi',
  },
  {
    name: 'NATIONAL STADIUM BRANCH',
    address: 'D/P Park Muhammad Ali Perenting, DY Park 1, D/A Bowling Club, D/A Gadafi Park Edge, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=National+Stadium+Karachi',
  },
  {
    name: 'JINNAH AVENUE BRANCH',
    address: 'W/26A-D/9, Jinnah Ave. Male, Colony Town, Malir 7, Colony Town, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Jinnah+Avenue+Karachi',
  },
  {
    name: 'AIRPORT (DOMESTIC ARRIVAL/DEPARTURE)',
    address: 'Jinnah International Airport Karachi, Pakistan, Airside.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Jinnah+International+Airport+Karachi',
  },
  {
    name: 'AIRPORT (INTERNATIONAL DEPARTURE)',
    address: 'Jinnah International Airport, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Jinnah+International+Airport+Karachi',
  },
]

export default function LocationsPage() {
  const { totalItems, openCart, location } = useCart()
  const [authModalOpen, setAuthModalOpen]           = useState(false)
  const [corporateModalOpen, setCorporateModalOpen] = useState(false)
  const [menuOpen, setMenuOpen]                     = useState(false)
  const [search, setSearch]                         = useState('')

  const filtered = BRANCHES.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="bg-[#c8102e] text-white sticky top-0 z-30 relative">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2.5 md:px-8">
          <Link href="/website/home">
            <button className="flex items-center gap-2 rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900">
              <MapPin size={16} />
              <span className="text-left leading-tight">
                Change Location<br />
                <span className="font-normal">{location || 'NED University'}</span>
              </span>
            </button>
          </Link>

          <a href="tel:021111022022" className="hidden items-center gap-2 text-sm font-medium sm:flex">
            <Phone size={16} />
            021-111-022-022
          </a>

          {/* Logo */}
          <Link
            href="/website/home"
            className="absolute left-1/2 -translate-x-1/2 -bottom-12 z-40 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl overflow-hidden border-4 border-white"
          >
            <Image
              src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
              alt="United King"
              width={96}
              height={96}
              className="object-contain"
            />
          </Link>

          <div className="flex-1" />

          <div className="hidden items-center gap-4 text-sm md:flex">
            <button onClick={() => setAuthModalOpen(true)} className="flex items-center gap-1.5 hover:underline">
              <User size={16} />
              Sign in / Register
            </button>
            <span className="text-white/50">|</span>
            <button
              onClick={() => setCorporateModalOpen(true)}
              className="rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900"
            >
              Corporate &amp; Special Event Orders
            </button>
          </div>

          <button onClick={openCart} aria-label="Open cart" className="relative rounded-full p-2 hover:bg-white/10 transition-colors">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f7c948] text-[10px] font-bold text-neutral-900">
                {totalItems}
              </span>
            )}
          </button>

          <button aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 pt-16 pb-6 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-4xl">
            Find Our Stores
          </h1>
          <p className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
            UAN: 021-111-022-022
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mt-5 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branch or area..."
            className="w-full rounded border border-neutral-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
          />
        </div>
      </section>

      {/* ── Branch Grid ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 pb-14 md:px-8">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400">No branches found for "{search}".</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((branch) => (
              <div
                key={branch.name}
                className="flex flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Branch name */}
                <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-neutral-900">
                  {branch.name}
                </h2>

                {/* Address */}
                <p className="flex-1 text-xs leading-relaxed text-neutral-500 mb-4">
                  {branch.address}
                </p>

                {/* Phone */}
                <a
                  href={`tel:${branch.phone.replace(/-/g, '')}`}
                  className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-[#c8102e] px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                >
                  <Phone size={12} />
                  {branch.phone}
                </a>

                {/* View on map */}
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start rounded border border-neutral-300 px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#c8102e] hover:text-[#c8102e] transition-colors"
                >
                  <MapPin size={12} />
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative overflow-visible bg-[#c8102e] pt-16 text-white rounded-tl-3xl rounded-tr-3xl">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pb-10 md:grid-cols-4 md:px-8">
          <div>
            <div className="mb-3 overflow-hidden rounded-full w-16 h-16 border-2 border-[#f7c948]">
              <Image src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg" alt="United King" width={64} height={64} className="object-contain" />
            </div>
            <p className="text-xs italic text-[#f7c948]">the Food Kingdom</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold">Information</h4>
            <p className="mb-3 text-sm">021-111-022-022</p>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link href="/website/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/website/complaint" className="hover:underline">Submit Complaint</Link></li>
              <li><Link href="/website/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          <div className="flex justify-center md:justify-start">
          <div className="relative flex justify-center md:justify-start">
            <div className="absolute -top-16 w-28 sm:w-36">
              <Image
                src="https://unitedkingonline.com/_next/image?url=%2Fassets%2Fimages%2Funitedking%2Fmobile-mockup.png&w=2048&q=75"
                alt="App preview"
                width={144}
                height={280}
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>
            <div className="h-44 w-28 sm:w-36" />
          </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-bold">Get The App!</h4>
            <p className="mb-4 text-sm text-white/90">Easy, Fast and Convenient.</p>
            <div className="flex flex-col gap-2">
              <a href="https://apps.apple.com/us/app/united-king/id1616868468" target="_blank" rel="noopener noreferrer" className="rounded-md bg-black px-4 py-2 text-left text-xs text-white hover:bg-neutral-800 transition-colors">Download on App Store</a>
              <a href="https://play.google.com/store/apps/details?id=com.indolj.unitedking" target="_blank" rel="noopener noreferrer" className="rounded-md bg-black px-4 py-2 text-left text-xs text-white hover:bg-neutral-800 transition-colors">GET IT ON Google Play</a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/20 px-4 py-4 text-xs text-white/80 md:px-8">
          <button aria-label="Search" className="rounded-full bg-white/10 p-2"><Search size={16} /></button>
          <p className="text-center">
            Powered by Trestech &nbsp;|&nbsp;
            <a href="#" className="hover:underline">Privacy</a> &nbsp;
            <a href="#" className="hover:underline">Faqs</a>
          </p>
          <button
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-full bg-white/10 p-2"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a href="#" aria-label="WhatsApp" className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform">
        <MessageCircle size={26} fill="white" />
      </a>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} onGuestContinue={() => setAuthModalOpen(false)} />}
      {corporateModalOpen && <CorporateOrderModal onClose={() => setCorporateModalOpen(false)} />}
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

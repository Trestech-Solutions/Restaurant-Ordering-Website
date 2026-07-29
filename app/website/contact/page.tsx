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

export default function ContactUsPage() {
  const { totalItems, openCart, location } = useCart()
  const [authModalOpen, setAuthModalOpen]           = useState(false)
  const [corporateModalOpen, setCorporateModalOpen] = useState(false)
  const [menuOpen, setMenuOpen]                     = useState(false)

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

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
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 hover:underline"
            >
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

          <button aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ── Contact Form ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[860px] px-4 py-20 md:px-8">
        <h1 className="text-center text-4xl font-bold text-neutral-800 mb-3">Contact Us</h1>
        <p className="text-center text-sm text-neutral-500 mb-10">
          Please fill the form and our team will be in touch with you as soon as possible.
        </p>

        {submitted ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-10 text-center">
            <p className="text-2xl font-bold text-green-700 mb-2">Thank you!</p>
            <p className="text-sm text-green-600">
              Your message has been received. We will get back to you shortly.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }) }}
              className="mt-6 rounded-full bg-[#c8102e] px-8 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1 — Name / Email / Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name *"
                className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
              />
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email *"
                className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
              />
              <input
                required
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone *"
                className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
              />
            </div>

            {/* Row 2 — Message */}
            <textarea
              required
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              rows={5}
              className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition resize-y"
            />

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded bg-[#c8102e] px-8 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative overflow-visible bg-[#c8102e] pt-16 text-white rounded-tl-3xl rounded-tr-3xl">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pb-10 md:grid-cols-4 md:px-8">
          <div>
            <div className="mb-3 overflow-hidden rounded-full w-16 h-16 border-2 border-[#f7c948]">
              <Image
                src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
                alt="United King"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <p className="text-xs italic text-[#f7c948]">the Food Kingdom</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold">Information</h4>
            <p className="mb-3 text-sm">021-111-022-022</p>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link href="/website/about" className="hover:underline">About Us</Link></li>
              <li><a href="#" className="hover:underline">Submit Complaint</a></li>
              <li><Link href="/website/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

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
      <a
        href="#"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle size={26} fill="white" />
      </a>

      {/* Modals */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onGuestContinue={() => setAuthModalOpen(false)}
        />
      )}
      {corporateModalOpen && (
        <CorporateOrderModal onClose={() => setCorporateModalOpen(false)} />
      )}
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

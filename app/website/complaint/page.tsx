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

type ComplaintType = 'Takeaway' | 'Delivery'
type DeliveryMethod = 'Food Panda' | 'Website, Phone or Facebook'
type Title = 'Mr.' | 'Mrs.' | 'Ms.' | 'Dr.'

const TITLES: Title[] = ['Mr.', 'Mrs.', 'Ms.', 'Dr.']

export default function SubmitComplaintPage() {
  const { totalItems, openCart, location } = useCart()
  const [authModalOpen, setAuthModalOpen]           = useState(false)
  const [corporateModalOpen, setCorporateModalOpen] = useState(false)
  const [menuOpen, setMenuOpen]                     = useState(false)

  // complaint type toggle
  const [complaintType, setComplaintType] = useState<ComplaintType>('Takeaway')
  // delivery method (only shown when Delivery is selected)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)

  // form fields
  const [title, setTitle]           = useState<Title>('Mr.')
  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [orderCode, setOrderCode]   = useState('')
  const [branch, setBranch]         = useState('')
  const [dateOfVisit, setDateOfVisit] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted]   = useState(false)

  const showFoodPandaMsg =
    complaintType === 'Delivery' && deliveryMethod === 'Food Panda'

  const showForm =
    complaintType === 'Takeaway' ||
    (complaintType === 'Delivery' && deliveryMethod === 'Website, Phone or Facebook')

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

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative h-56 overflow-hidden sm:h-72">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=1600&auto=format&fit=crop"
          alt="We are here to help"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Yellow diagonal overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(105deg, #f7c948 0%, #f7c948 52%, transparent 52%)',
          }}
        />

        {/* Headline */}
        <div className="absolute inset-0 z-20 flex items-center px-8 md:px-16">
          <h1 className="text-4xl font-extrabold uppercase leading-tight text-neutral-900 sm:text-5xl md:text-6xl">
            WE ARE<br />HERE TO HELP
          </h1>
        </div>
      </section>

      {/* ── Form Section ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[900px] px-4 py-10 md:px-8">

        {submitted ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-10 text-center">
            <p className="text-2xl font-bold text-green-700 mb-2">Complaint Submitted!</p>
            <p className="text-sm text-green-600">
              Thank you for reaching out. Our team will review your complaint and get back to you shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setName(''); setPhone(''); setOrderCode(''); setBranch(''); setDateOfVisit(''); setDescription('')
                setComplaintType('Takeaway'); setDeliveryMethod(null)
              }}
              className="mt-6 rounded-full bg-[#c8102e] px-8 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <>
            {/* ── Complaint Type Toggle ──────────────────────────────── */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-bold text-neutral-800">Complaint relating to:</p>
              <div className="flex gap-3">
                {(['Takeaway', 'Delivery'] as ComplaintType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setComplaintType(t); setDeliveryMethod(null) }}
                    className={`rounded px-6 py-2 text-sm font-semibold border transition-colors ${
                      complaintType === t
                        ? 'border-[#c8102e] text-[#c8102e] bg-white'
                        : 'border-neutral-300 text-neutral-700 bg-white hover:border-[#c8102e]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Delivery Method (only when Delivery selected) ─────── */}
            {complaintType === 'Delivery' && (
              <div className="mb-8">
                <p className="mb-3 text-sm font-bold text-neutral-800">
                  Please Select the Method Of Delivery:
                </p>
                <div className="flex flex-wrap gap-3">
                  {(['Food Panda', 'Website, Phone or Facebook'] as DeliveryMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setDeliveryMethod(m)}
                      className={`rounded px-6 py-2 text-sm font-semibold border transition-colors ${
                        deliveryMethod === m
                          ? 'border-[#c8102e] text-[#c8102e] bg-white'
                          : 'border-neutral-300 text-neutral-700 bg-white hover:border-[#c8102e]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Food Panda message */}
                {showFoodPandaMsg && (
                  <p className="mt-5 text-sm text-neutral-700">
                    kindly contact Foodpanda on their help center.
                  </p>
                )}
              </div>
            )}

            {/* ── Main Form ─────────────────────────────────────────── */}
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Customer Name */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Customer Name
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value as Title)}
                        className="rounded border border-neutral-300 px-2 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                      >
                        {TITLES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                      />
                    </div>
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Customer Phone
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                </div>

                {/* Order Code / Branch */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Order Code <span className="font-normal text-neutral-400">(if available)</span>
                    </label>
                    <input
                      type="text"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">Branch</label>
                    <input
                      required
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                </div>

                {/* Date of Visit / Complaint Description */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Date of Visit
                    </label>
                    <input
                      required
                      type="date"
                      value={dateOfVisit}
                      onChange={(e) => setDateOfVisit(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                    <p className="mt-1 text-xs text-neutral-400">(require receipt or proof of visit / sale)</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Complaint Description
                    </label>
                    <input
                      required
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded bg-[#c8102e] px-10 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </>
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
          <button aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="rounded-full bg-white/10 p-2">
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

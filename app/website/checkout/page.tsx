'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Gift,
  Bike,
  ShoppingBag,
  Phone,
  MapPin,
  User,
  Mail,
  FileText,
  Landmark,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'

// ─── Constants ────────────────────────────────────────────────────────────────
const TAX_RATE = 0.15
const DELIVERY_FEE = 100
const FREE_DELIVERY_THRESHOLD = 1500

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.']

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckoutForm {
  title: string
  fullName: string
  mobile: string
  alternateMobile: string
  address: string
  landmark: string
  email: string
  instructions: string
}

const EMPTY_FORM: CheckoutForm = {
  title: 'Mr.',
  fullName: '',
  mobile: '',
  alternateMobile: '',
  address: '',
  landmark: '',
  email: '',
  instructions: '',
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const { items, orderType, location, subtotal, clearCart } = useCart()
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM)
  const [isGift, setIsGift] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)
  const [placed, setPlaced] = useState(false)

  const deliveryFee =
    orderType === 'delivery' && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0
  const tax = Math.round(subtotal * TAX_RATE)
  const grandTotal = subtotal + tax + deliveryFee

  const set = (field: keyof CheckoutForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const isValid =
    form.fullName.trim() !== '' &&
    form.mobile.trim().length >= 10 &&
    (orderType === 'pickup' || form.address.trim() !== '')

  const handlePlaceOrder = async () => {
    if (!isValid || items.length === 0) return
    setIsPlacing(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    setIsPlacing(false)
    setPlaced(true)
    clearCart()
  }

  // ── Order placed success screen ───────────────────────────────────────────
  if (placed) {
    return <OrderSuccessScreen onContinue={() => router.push('/website/home')} />
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-8">
          <Link
            href="/website/home"
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#c8102e] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to menu
          </Link>

          {/* Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#c8102e] bg-white">
            <span className="text-center text-[9px] font-extrabold leading-tight text-[#c8102e]">
              UNITED<br />KING
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs text-neutral-400">Need help?</p>
            <a href="tel:021111022022" className="flex items-center gap-1 text-sm font-semibold text-[#c8102e]">
              <Phone size={13} />
              021-111-022-022
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── LEFT — Checkout form ──────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
              <button
                onClick={() => setIsGift((v) => !v)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isGift
                    ? 'border-[#c8102e] bg-[#c8102e]/5 text-[#c8102e]'
                    : 'border-neutral-300 text-neutral-600 hover:border-[#c8102e] hover:text-[#c8102e]'
                }`}
              >
                <Gift size={15} />
                Send as a Gift
              </button>
            </div>

            {/* Order type badge */}
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
              <Bike size={28} className="text-[#c8102e] shrink-0" />
              <div>
                <p className="text-sm text-neutral-600">
                  This is a{' '}
                  <span className="inline-flex items-center rounded-full bg-[#c8102e] px-3 py-0.5 text-xs font-bold uppercase text-white">
                    {orderType} Order
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Just a last step, please enter your details.
                </p>
              </div>
            </div>

            {/* ── Form card ───────────────────────────────────────────────── */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">

              {/* Title + Full Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_1fr]">
                <FormField label="Title">
                  <div className="relative">
                    <select
                      value={form.title}
                      onChange={set('title')}
                      className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-8 text-sm text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e]"
                    >
                      {TITLE_OPTIONS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">▾</span>
                  </div>
                </FormField>

                <FormField label="Full Name" required>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={set('fullName')}
                    className={inputCls}
                  />
                </FormField>
              </div>

              {/* Mobile + Alternate */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Mobile Number" required icon={<Phone size={14} />}>
                  <input
                    type="tel"
                    placeholder="03xx-xxxxxxx"
                    value={form.mobile}
                    onChange={set('mobile')}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Alternate Mobile Number" icon={<Phone size={14} />}>
                  <input
                    type="tel"
                    placeholder="03xx-xxxxxxx"
                    value={form.alternateMobile}
                    onChange={set('alternateMobile')}
                    className={inputCls}
                  />
                </FormField>
              </div>

              {/* Delivery address — only for delivery */}
              {orderType === 'delivery' && (
                <FormField label="Delivery Address" required icon={<MapPin size={14} />}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your complete address"
                      value={form.address}
                      onChange={set('address')}
                      className={`${inputCls} flex-1`}
                    />
                    {location && (
                      <span className="flex shrink-0 items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-xs font-medium text-neutral-600">
                        {location.split(',')[0]}
                      </span>
                    )}
                  </div>
                </FormField>
              )}

              {/* Landmark + Email */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nearest Landmark" icon={<Landmark size={14} />}>
                  <input
                    type="text"
                    placeholder="Any famous place nearby"
                    value={form.landmark}
                    onChange={set('landmark')}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Email Address" icon={<Mail size={14} />}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={set('email')}
                    className={inputCls}
                  />
                </FormField>
              </div>

              {/* Delivery instructions */}
              <FormField label="Delivery Instructions" icon={<FileText size={14} />}>
                <textarea
                  rows={3}
                  placeholder="Any special instructions for delivery..."
                  value={form.instructions}
                  onChange={set('instructions')}
                  className={`${inputCls} resize-none`}
                />
              </FormField>
            </div>
          </div>

          {/* ── RIGHT — Order summary ─────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Item list */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-700">
                <ShoppingBag size={16} className="text-[#c8102e]" />
                Order Summary
              </h2>

              {items.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-400">Your cart is empty</p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <li key={`${item.id}-${item.selectedOption}`} className="flex items-center gap-3 py-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-100">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold text-neutral-900">
                          <span className="mr-1 text-neutral-500">{item.quantity}x</span>
                          {item.name}
                        </p>
                        {item.selectedOption && (
                          <p className="text-[10px] text-neutral-400">{item.selectedOption}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-bold text-neutral-900">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price breakdown */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
              <PriceRow
                icon={<ShoppingCart size={14} className="text-[#c8102e]" />}
                label="Total"
                value={`Rs. ${subtotal.toLocaleString()}`}
              />
              <PriceRow
                icon={<span className="text-[#c8102e] text-xs font-bold">%</span>}
                label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`}
                value={`Rs. ${tax.toLocaleString()}`}
              />
              <PriceRow
                icon={<Bike size={14} className="text-[#c8102e]" />}
                label="Delivery Fee"
                value={
                  deliveryFee === 0
                    ? 'Free'
                    : `Rs. ${deliveryFee}`
                }
                valueClass={deliveryFee === 0 ? 'text-green-600 font-semibold' : undefined}
              />

              <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
                <span className="font-bold text-neutral-900">Grand Total</span>
                <span className="text-lg font-bold text-[#c8102e]">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={!isValid || items.length === 0 || isPlacing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlacing ? (
                <>
                  <Spinner />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Place Order
                </>
              )}
            </button>

            {/* Back to menu link */}
            <Link
              href="/website/home"
              className="flex items-center justify-center gap-1 text-sm font-medium text-neutral-500 hover:text-[#c8102e] transition-colors"
            >
              <ArrowLeft size={14} />
              continue to add more items
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e] transition-colors'

function FormField({
  label,
  required,
  icon,
  children,
}: {
  label: string
  required?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center justify-between text-xs font-semibold text-neutral-700">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {required && <span className="text-[#c8102e]">*Required</span>}
      </label>
      {children}
    </div>
  )
}

function PriceRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-neutral-600">
        {icon}
        {label}
      </span>
      <span className={valueClass ?? 'font-medium text-neutral-800'}>{value}</span>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function OrderSuccessScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 size={44} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Order Placed!</h2>
        <p className="mt-3 text-sm text-neutral-500">
          Your order has been received. We&apos;ll start preparing it shortly.
        </p>
        <button
          onClick={onContinue}
          className="mt-8 w-full rounded-xl bg-[#c8102e] py-3 text-sm font-bold text-white hover:bg-[#a80d26] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Phone, ShoppingCart,
  Gift, Bike, FileText, CheckCircle, Circle, Plus,
  User, Mail, Store, Clock, Printer, ArrowLeft,
} from 'lucide-react'
import { useCart, type CartItem } from '@/lib/context/CartContext'
import { UK_BRANCHES } from '@/components/website/OrderTypeModal'
import { Navigation } from 'lucide-react'

const TAX_RATE     = 0.18
const DELIVERY_FEE = 200

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']
const UK_PHONE = '021-111-022-022'

interface OrderSnapshot {
  orderNo: string; placedAt: string; deliveryAt: string
  customerName: string; customerPhone: string; customerEmail: string
  deliveryAddress: string; branchName: string; orderType: string; payment: string
  items: CartItem[]; subtotal: number; discount: number; fee: number; tax: number; grandTotal: number
}

function makeOrderNo() { return Math.random().toString(36).substring(2, 8).toUpperCase() }
function fmtDateTime(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] placeholder:text-neutral-400'
const labelClass = 'mb-2 block text-sm font-semibold text-neutral-700'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, orderType, user, addresses, addAddress, branch, location, subtotal, clearCart } = useCart()

  // ─── Guest checkout form state ──────────────────────────────────────────────
  const [title, setTitle]                       = useState('Mr.')
  const [guestFullName, setGuestFullName]       = useState('')
  const [guestMobile, setGuestMobile]           = useState('')
  const [guestAltMobile, setGuestAltMobile]     = useState('')
  const [guestAddress, setGuestAddress]         = useState('')
  const [guestLandmark, setGuestLandmark]       = useState('')
  const [guestEmail, setGuestEmail]             = useState('')

  // ─── Logged-in user address state ───────────────────────────────────────────
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddrForm, setShowAddrForm]           = useState(false)
  const [newAddrLine, setNewAddrLine]             = useState('')
  const [newAddrCity, setNewAddrCity]             = useState('Karachi')

  // ─── Shared state ───────────────────────────────────────────────────────────
  const [instructions, setInstructions]         = useState('')
  const [payment, setPayment]                   = useState<'cod' | 'online'>('cod')
  const [changeAmount, setChangeAmount]         = useState('500')
  const [voucher, setVoucher]                   = useState('')
  const [discount, setDiscount]                 = useState(0)
  const [isGift, setIsGift]                     = useState(false)
  const [isPlacing, setIsPlacing]               = useState(false)
  const [order, setOrder]                       = useState<OrderSnapshot | null>(null)

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) setSelectedAddressId(addresses[0].id)
  }, [addresses]) // eslint-disable-line react-hooks/exhaustive-deps

  const tax        = Math.round(subtotal * TAX_RATE)
  const fee        = orderType === 'delivery' ? DELIVERY_FEE : 0
  const grandTotal = subtotal + tax + fee - discount
  const selectedAddr = addresses.find((a) => a.id === selectedAddressId)

  // canPlace rules — different for guest vs logged in
  const guestReady =
    guestFullName.trim() !== '' &&
    guestMobile.trim() !== '' &&
    (orderType === 'pickup' || guestAddress.trim() !== '')
  const userReady = items.length > 0 && (orderType === 'pickup' || !!selectedAddressId)
  const canPlace = items.length > 0 && (user ? userReady : guestReady)

  const handleApplyVoucher = () =>
    setDiscount(voucher.trim().toUpperCase() === 'UK10' ? Math.round(subtotal * 0.1) : 0)

  const handleAddAddress = () => {
    if (!newAddrLine.trim()) return
    addAddress({ line1: newAddrLine.trim(), city: newAddrCity })
    setNewAddrLine(''); setNewAddrCity('Karachi'); setShowAddrForm(false)
  }

  const handlePlaceOrder = async () => {
    if (!canPlace) return
    setIsPlacing(true)
    await new Promise((r) => setTimeout(r, 1500))
    const now = new Date()

    // Customer info: logged-in user OR guest entered values
    let customerName  = 'Guest'
    let customerPhone = '—'
    let customerEmail = '—'
    let deliveryAddr  = '—'

    if (user) {
      customerName  = user.name
      customerPhone = user.phone ? `+92${user.phone.replace(/^0/, '')}` : '—'
      customerEmail = user.email ?? '—'
      deliveryAddr  = selectedAddr ? `${selectedAddr.line1}, ${selectedAddr.city}` : '—'
    } else {
      customerName  = `${title} ${guestFullName}`.trim()
      customerPhone = guestMobile
        ? guestMobile.startsWith('+') ? guestMobile : `+92${guestMobile.replace(/^0/, '')}`
        : '—'
      customerEmail = guestEmail || '—'
      const landmark = guestLandmark.trim() ? ` (Near: ${guestLandmark.trim()})` : ''
      deliveryAddr  = orderType === 'pickup' ? 'Pickup' : `${guestAddress}${landmark}`
    }

    const snap: OrderSnapshot = {
      orderNo: makeOrderNo(), placedAt: fmtDateTime(now),
      deliveryAt: fmtDateTime(new Date(now.getTime() + 60 * 60 * 1000)),
      customerName, customerPhone, customerEmail,
      deliveryAddress: deliveryAddr,
      branchName: branch ? `United King ${branch.charAt(0).toUpperCase() + branch.slice(1)}` : 'United King',
      orderType, payment: payment === 'cod' ? 'Cash' : 'Online',
      items: [...items], subtotal, discount, fee, tax, grandTotal,
    }
    clearCart(); setIsPlacing(false); setOrder(snap)
  }

  if (order) return <OrderReceipt order={order} onPlaceAnother={() => router.push('/')} />

  const branchLabel = location || branch
    ? (location ? location : (branch ? `United King ${branch.charAt(0).toUpperCase() + branch.slice(1)}` : ''))
    : 'NED University'
  const branchShort = branchLabel.length > 10 ? branchLabel.slice(0, 10) + '...' : branchLabel

  // Find branch info for pickup details
  const currentBranch = UK_BRANCHES.find((b) => b.id === branch) ?? UK_BRANCHES[1] ?? {
    id: 'maskan',
    name: 'United King Maskan',
    address: 'FL 6, Block 7 Gulshan-e-Iqbal, Karachi, Sindh',
    mapsUrl: 'https://maps.google.com/?q=United+King+Maskan+Karachi',
  }

  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* ── Main content ── */}
      <main className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">

          {/* LEFT */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-6">
            {/* Hello greeting — LOGGED-IN users see this on BOTH pickup + delivery */}
            {user && (
              <p className="text-sm text-neutral-600">
                Hello,{' '}
                <span className="font-bold text-[#c8102e] uppercase">
                  {user.name.toUpperCase()},
                </span>
              </p>
            )}

            {/* Heading: Takeaway card for pickup / Delivery badge for delivery */}
            {orderType === 'pickup' ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-100 p-5 space-y-2">
                <p className="text-sm text-neutral-700">
                  This is a <span className="font-bold text-neutral-900 uppercase">Takeaway Order 📦</span>
                </p>
                <p className="text-sm text-neutral-700">You have to collect your order from</p>
                <p className="text-sm font-bold text-neutral-900">{currentBranch.name}</p>
                <div className="space-y-1 pt-1">
                  <p className="text-sm text-neutral-700">
                    <span className="font-semibold">Location:</span> {currentBranch.address}
                  </p>
                  <a
                    href={currentBranch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Location <Navigation size={12} />
                  </a>
                </div>
                <p className="text-sm text-neutral-700 pt-1">
                  <span className="font-semibold">Phone:</span>{' '}
                  <a href={`tel:${UK_PHONE.replace(/-/g, '')}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                    {UK_PHONE}
                  </a>
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  This is a{' '}
                  <span className="inline-flex items-center gap-1">
                    <Bike size={13} />Delivery Order 🛵
                  </span>
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">Just a last step, please enter your details:</p>
              </div>
            )}

            {orderType === 'pickup' && (
              <p className="text-sm font-bold uppercase tracking-wide text-neutral-800">
                Just a last step, please fill your information below
              </p>
            )}

            <hr className="border-neutral-100" />

            {!user ? (
              // ═══════════════════════════════════════════════════════════════════
              //  GUEST CHECKOUT FORM (without login)
              // ═══════════════════════════════════════════════════════════════════
              <>
                {/* Title + Full Name */}
                <div className="grid grid-cols-[110px_1fr] gap-4">
                  <div>
                    <label className={labelClass}>Title</label>
                    <select value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass}>
                      {TITLE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-neutral-700">Full Name</label>
                      <span className="text-xs font-bold text-[#c8102e]">*Required</span>
                    </div>
                    <input
                      value={guestFullName}
                      onChange={(e) => setGuestFullName(e.target.value)}
                      placeholder="Full Name"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Mobile + Alt Mobile */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-neutral-700">Mobile Number</label>
                      <span className="text-xs font-bold text-[#c8102e]">*Required</span>
                    </div>
                    <input
                      value={guestMobile}
                      onChange={(e) => setGuestMobile(e.target.value)}
                      placeholder="03xx-xxxxxxx"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alternate Mobile Number</label>
                    <input
                      value={guestAltMobile}
                      onChange={(e) => setGuestAltMobile(e.target.value)}
                      placeholder="03xx-xxxxxxx"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Delivery Address + Nearest Landmark — only for delivery */}
                {orderType === 'delivery' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-neutral-700">Delivery Address</label>
                        <span className="text-xs font-bold text-[#c8102e]">*Required</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={guestAddress}
                          onChange={(e) => setGuestAddress(e.target.value)}
                          placeholder="Enter your complete address"
                          className={inputClass}
                        />
                        <span className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-semibold text-neutral-600 max-w-[140px] truncate">
                          {branchShort}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Nearest Landmark</label>
                      <input
                        value={guestLandmark}
                        onChange={(e) => setGuestLandmark(e.target.value)}
                        placeholder="any famous place nearby"
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>

                {/* Delivery / Pickup Instructions */}
                <div>
                  <label className={labelClass}>
                    {orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}
                  </label>
                  <input
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}
                    className={inputClass}
                  />
                </div>

                {/* Payment */}
                <PaymentSection
                  payment={payment}
                  setPayment={setPayment}
                  changeAmount={changeAmount}
                  setChangeAmount={setChangeAmount}
                  orderType={orderType}
                />
              </>
            ) : (
              // ═══════════════════════════════════════════════════════════════════
              //  LOGGED-IN USER CHECKOUT (with login)
              // ═══════════════════════════════════════════════════════════════════
              <>
                {/* Address selection — only for delivery */}
                {orderType === 'delivery' && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-neutral-700">Please Select an address from the list shown</p>
                    {addresses.map((addr) => {
                      const sel = selectedAddressId === addr.id
                      return (
                        <button key={addr.id} onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                            sel
                              ? 'border-green-600 bg-white text-green-700'
                              : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                          }`}>
                          <span>{addr.line1}, {addr.city}</span>
                          {sel
                            ? <CheckCircle size={18} className="shrink-0 text-green-600 fill-green-600 text-white" />
                            : <Circle size={18} className="shrink-0 text-neutral-400" />}
                        </button>
                      )
                    })}
                    {showAddrForm && (
                      <div className="space-y-2 rounded-lg border border-dashed border-neutral-300 p-4">
                        <input value={newAddrLine} onChange={(e) => setNewAddrLine(e.target.value)} placeholder="Street address, area, landmark"
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                        <select value={newAddrCity} onChange={(e) => setNewAddrCity(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600">
                          {['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad'].map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={handleAddAddress} className="flex-1 rounded-lg bg-[#c8102e] py-2 text-xs font-bold text-white hover:bg-red-700">Save</button>
                          <button onClick={() => setShowAddrForm(false)} className="flex-1 rounded-lg border border-neutral-300 py-2 text-xs font-semibold text-neutral-600">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery/Pickup Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-neutral-700">
                      {orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}
                    </label>
                    {orderType === 'delivery' && !showAddrForm && (
                      <button
                        onClick={() => setShowAddrForm(true)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Plus size={14} /> Add New Address
                      </button>
                    )}
                  </div>
                  <input
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}
                    className={inputClass}
                  />
                </div>

                {/* Payment */}
                <PaymentSection
                  payment={payment}
                  setPayment={setPayment}
                  changeAmount={changeAmount}
                  setChangeAmount={setChangeAmount}
                  orderType={orderType}
                />
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {/* Items */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm divide-y divide-neutral-100">
              {items.length === 0
                ? <p className="py-4 text-center text-sm text-neutral-400">Your cart is empty</p>
                : items.map((item) => (
                  <div key={`${item.id}-${item.selectedOption}`} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-neutral-700">{item.quantity} x {item.name}{item.selectedOption ? ` (${item.selectedOption})` : ''}</span>
                    <span className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))
              }
            </div>

            {/* Price summary */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
              <h2 className="font-bold text-neutral-800">Your Order</h2>
              <PriceRow label="Total"        value={`Rs. ${subtotal.toLocaleString()}`} />
              <PriceRow label="Tax 18%"      value={`Rs. ${tax.toLocaleString()}`} />
              {orderType === 'delivery' && (
                <PriceRow label="Delivery Fee" value={`Rs. ${fee.toLocaleString()}`} />
              )}
              {discount > 0 && <PriceRow label="Discount" value={`Rs. ${discount.toLocaleString()}`} valueClass="text-[#f7c948] font-semibold" />}
              <div className="border-t border-neutral-200 pt-3 flex items-center justify-between font-bold text-neutral-900 text-sm">
                <span>Grand Total</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <input value={voucher} onChange={(e) => setVoucher(e.target.value)} placeholder="Enter Voucher / Promo code"
                  className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]" />
                <button
                  onClick={handleApplyVoucher}
                  className="rounded-lg bg-neutral-500 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={!canPlace || isPlacing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-50">
              {isPlacing ? <><Spinner />Placing Order...</> : <>Place Order</>}
            </button>

            <Link href="/" className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold">
              <ArrowLeft size={14} />← continue to add more items
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Reusable: Payment section (COD / Online) + Change Request
// ═════════════════════════════════════════════════════════════════════════════
interface PaymentSectionProps {
  payment: 'cod' | 'online'
  setPayment: (p: 'cod' | 'online') => void
  changeAmount: string
  setChangeAmount: (v: string) => void
  orderType: string
}

function PaymentSection({ payment, setPayment, changeAmount, setChangeAmount, orderType }: PaymentSectionProps) {
  const firstLabel = orderType === 'pickup' ? 'Pay at Pickup' : 'Cash on Delivery'
  const selClass = 'border-green-600 bg-white'
  const unselClass = 'border-neutral-200 bg-white'
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-neutral-700">Payment Information</p>
      <div className="flex gap-3">
        <button onClick={() => setPayment('cod')}
          className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 py-4 transition-colors ${payment === 'cod' ? selClass : unselClass}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">●</span>
          <span className="text-xs font-semibold text-neutral-700">{firstLabel}</span>
        </button>
        <button onClick={() => setPayment('online')}
          className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 py-4 transition-colors ${payment === 'online' ? selClass : unselClass}`}>
          <div className="flex gap-1">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/800px-Visa_Inc._logo.svg.png" alt="Visa" width={32} height={20} className="object-contain" />
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/800px-Mastercard-logo.svg.png" alt="MC" width={28} height={20} className="object-contain" />
          </div>
          <span className="text-xs font-semibold text-neutral-700">Online Payment</span>
        </button>
      </div>
      {payment === 'cod' && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-neutral-700">Change Request</p>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5">
            <span className="text-sm font-bold text-neutral-500">Rs.</span>
            <input type="number" value={changeAmount} onChange={(e) => setChangeAmount(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none" placeholder="500" />
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Order Receipt
// ═════════════════════════════════════════════════════════════════════════════
function OrderReceipt({ order, onPlaceAnother }: { order: OrderSnapshot; onPlaceAnother: () => void }) {
  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans py-8 px-4">
      <div className="mx-auto max-w-[680px] space-y-4">
        <div className="flex justify-center mb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#c8102e] bg-white overflow-hidden shadow">
            <Image src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg" alt="United King" width={64} height={64} className="object-contain" />
          </div>
        </div>
        <div className="rounded-xl bg-green-600 px-6 py-5 text-center text-white">
          <h1 className="text-2xl font-bold">Thank You!</h1>
          <p className="mt-1 text-sm text-green-100">Your order has been placed successfully</p>
        </div>
        <div className="rounded-xl bg-white px-6 py-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Order No: <span className="font-bold text-neutral-900">{order.orderNo}</span></span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Status:</span>
              <span className="rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold text-neutral-900">Received</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#c8102e] animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-neutral-500">Your order has been received, we might call you for confirmation or address details if required.</p>
        </div>
        <ReceiptSection icon={<User size={16} />} title="Customer Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem icon={<User size={14} />}  label="Customer Name"  value={order.customerName} />
            <InfoItem icon={<Phone size={14} />} label="Mobile Number"  value={order.customerPhone} />
            <InfoItem icon={<Mail size={14} />}  label="email"          value={order.customerEmail} />
          </div>
        </ReceiptSection>
        <ReceiptSection icon={<Bike size={16} />} title="Delivery Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem icon={<MapPin size={14} />} label="Delivery Address"     value={order.deliveryAddress} />
            <InfoItem icon={<Store size={14} />}  label="Branch Name"          value={order.branchName} />
            <InfoItem icon={<Bike size={14} />}   label="Order Type"           value={order.orderType} />
            <InfoItem icon={<Clock size={14} />}  label="Order Date & time"    value={order.placedAt} />
            <InfoItem icon={<Clock size={14} />}  label="Delivery Date & time" value={order.deliveryAt} />
          </div>
        </ReceiptSection>
        <ReceiptSection icon={<ShoppingCart size={16} />} title="Product">
          <div className="divide-y divide-neutral-100">
            {order.items.map((item) => (
              <div key={`${item.id}-${item.selectedOption}`} className="flex items-start justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{item.name}{item.selectedOption ? ` (${item.selectedOption})` : ''}</p>
                  <p className="text-xs text-neutral-400">Quantity: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </ReceiptSection>
        <ReceiptSection icon={<ShoppingCart size={16} />} title="Payment Type"
          badge={<span className="flex items-center gap-1 rounded-full bg-[#c8102e] px-3 py-1 text-xs font-bold text-white"><ShoppingCart size={11} />{order.payment}</span>}>
          <div className="space-y-2 text-sm">
            <PriceRow label="Total"        value={`Rs. ${order.subtotal.toLocaleString()}`} />
            {order.discount > 0 && <PriceRow label="Discount" value={`Rs. ${order.discount.toLocaleString()}`} valueClass="text-[#f7c948] font-semibold" />}
            <PriceRow label="Delivery Fee" value={`Rs. ${order.fee.toLocaleString()}`} />
            <PriceRow label="Tax 18.00%"   value={`Rs. ${order.tax.toLocaleString()}`} />
            <div className="border-t border-neutral-200 pt-2 flex items-center justify-between font-bold text-neutral-900">
              <span>Grand Total</span><span>Rs. {order.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </ReceiptSection>
        <div className="flex justify-center">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-[#c8102e] px-8 py-2.5 text-sm font-bold text-white hover:bg-red-700">
            <Printer size={15} /> Print
          </button>
        </div>
        <div className="text-center text-sm text-neutral-600">
          <p className="font-semibold">Need Support ?</p>
          <p>Question regarding your order ? <a href="tel:021111022022" className="font-bold text-neutral-900 hover:underline">Call us: 021-111-022-022</a></p>
        </div>
        <button onClick={onPlaceAnother} className="w-full rounded-xl bg-[#c8102e] py-4 text-sm font-bold text-white hover:bg-red-700">
          Place another order
        </button>
        <p className="text-center text-xs text-neutral-400 pb-4">Powered by <span className="font-bold text-neutral-600">Trestech</span></p>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Shared helpers
// ═════════════════════════════════════════════════════════════════════════════
function ReceiptSection({ icon, title, badge, children }: { icon: React.ReactNode; title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between bg-neutral-100 px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800"><span className="text-[#c8102e]">{icon}</span>{title}</h2>
        {badge}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-neutral-400">{icon}</span>
      <div>
        <p className="text-[11px] text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-800">{value}</p>
      </div>
    </div>
  )
}

function PriceRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className={valueClass ?? 'font-medium text-neutral-800'}>{value}</span>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

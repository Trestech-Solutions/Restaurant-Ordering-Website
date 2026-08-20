'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { CheckCircle, Circle, Plus, Bike, ArrowLeft, Navigation, Loader2 } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/hooks/useCart'
import { useStoreLocation } from '@/lib/hooks/useStoreLocation'
import { UK_BRANCHES } from '@/components/website/OrderTypeModal'
import { useCheckout, buildCheckoutPayload } from '@/api/client/checkout'
import { useGetAddresses, useAddAddress } from '@/api/client/customer'
import { PaymentSection } from '@/components/checkout/PaymentSection'
import type { CheckoutFormValues } from '@/components/checkout/types'

const TAX_RATE     = 0.18
const DELIVERY_FEE = 200
const UK_PHONE     = '021-111-022-022'

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] placeholder:text-neutral-400'
const labelClass = 'mb-2 block text-sm font-semibold text-neutral-700'

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']

// ─── Order snapshot shown on receipt ──────────────────────────────────────────

interface OrderSnapshot {
  orderId: number
  orderType: string
  status: string
  customerName: string
  customerPhone: string
  customerAddress: string
  branchName: string
  subtotal: string
  deliveryCharge: string
  grandTotal: string
  items: CartItem[]
}

export default function CheckoutPage() {
  const router = useRouter()
  const {
    items, orderType, user, addAddress: addLocalAddress,
    branch, location, subtotal, clearCart, cartToken: liveCartToken,
  } = useCart()

  // ─── form ──────────────────────────────────────────────────────────────────
  const { register, control, handleSubmit, watch, setValue, getValues } =
    useForm<CheckoutFormValues>({
      defaultValues: {
        title: 'Mr.',
        guestFullName: '',
        guestMobile: '',
        guestAltMobile: '',
        guestAddress: '',
        guestLandmark: '',
        guestEmail: '',
        instructions: '',
        payment: 'cod',
        changeAmount: '500',
        voucher: '',
        isGift: false,
        selectedAddressId: '',
        newAddrLine: '',
        newAddrCity: 'Karachi',
      },
    })
  const formValues = watch()

  // ─── API addresses (logged-in) ─────────────────────────────────────────────
  const { data: apiAddresses = [], isLoading: loadingAddresses } = useGetAddresses()
  const apiAddrAdder = useAddAddress({
    onSuccess(newAddr) {
      setValue('selectedAddressId', String(newAddr.id))
      setShowAddrForm(false)
      setValue('newAddrLine', '')
      setValue('newAddrCity', 'Karachi')
    },
  })

  // ─── local state ──────────────────────────────────────────────────────────
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [order, setOrder]               = useState<OrderSnapshot | null>(null)
  const [errorMsg, setErrorMsg]         = useState('')

  // auto-select first API address
  useEffect(() => {
    if (apiAddresses.length > 0 && !formValues.selectedAddressId) {
      setValue('selectedAddressId', String(apiAddresses[0].id))
    }
  }, [apiAddresses]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── derived ──────────────────────────────────────────────────────────────
  const tax        = Math.round(subtotal * TAX_RATE)
  const fee        = orderType === 'delivery' ? DELIVERY_FEE : 0
  const grandTotal = subtotal + tax + fee

  const selectedAddr = apiAddresses.find(
    (a) => String(a.id) === formValues.selectedAddressId
  )

  const guestReady =
    formValues.guestFullName.trim() !== '' &&
    formValues.guestMobile.trim() !== '' &&
    (orderType === 'pickup' || formValues.guestAddress.trim() !== '')
  const userReady  = items.length > 0 && (orderType === 'pickup' || !!selectedAddr)
  const canPlace   = items.length > 0 && (user ? userReady : guestReady)

  const handleAddAddress = () => {
    const line = getValues('newAddrLine')
    const city = getValues('newAddrCity')
    if (!line.trim()) return
    if (user) {
      apiAddrAdder.addAddress({ address: line.trim(), city })
    } else {
      addLocalAddress({ line1: line.trim(), city })
      setValue('newAddrLine', ''); setValue('newAddrCity', 'Karachi'); setShowAddrForm(false)
    }
  }

  // ─── checkout ──────────────────────────────────────────────────────────────
  const checkoutMutation = useCheckout({
    onSuccess(res) {
      setOrder({
        orderId:       res.id,
        orderType:     res.order_type,
        status:        res.status,
        customerName:  res.customer_name,
        customerPhone: res.customer_phone,
        customerAddress: res.customer_address || '',
        branchName:    res.branch_name || 'United King',
        subtotal:      res.subtotal,
        deliveryCharge: res.delivery_charge,
        grandTotal:    res.grand_total,
        items:         [...items],
      })
      clearCart()
    },
    onError(msg) { setErrorMsg(msg || 'Failed to place order') },
  })

  const isPlacing = checkoutMutation.isPending

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!canPlace) return
    setErrorMsg('')

    const resolvedToken = liveCartToken
    if (!resolvedToken) {
      setErrorMsg('Unable to create cart. Please make sure a branch is selected and try again.')
      return
    }

    // Build the minimal payload the backend expects
    const customerName  = user ? user.name : values.guestFullName.trim()
    const customerPhone = user ? user.phone : values.guestMobile.trim()
    const customerAddr  = user
      ? (selectedAddr ? `${selectedAddr.address}, ${selectedAddr.city}` : '')
      : (orderType === 'delivery' ? values.guestAddress.trim() : '')
    const customerCity  = user
      ? (selectedAddr?.city || '')
      : (orderType === 'delivery' ? (location?.split(', ').pop() || '') : '')

    const payload = buildCheckoutPayload({
      cart_token:             resolvedToken,
      order_type:             orderType as 'delivery' | 'pickup',
      customer_name:          customerName,
      customer_phone:         customerPhone,
      customer_address:       customerAddr || undefined,
      customer_city:          customerCity || undefined,
      customer_landmark:      (user ? undefined : values.guestLandmark) || undefined,
      customer_instructions:  values.instructions || undefined,
    })

    checkoutMutation.checkout(payload)
  }

  // ─── receipt ──────────────────────────────────────────────────────────────
  if (order) return <OrderReceipt order={order} onPlaceAnother={() => { router.push('/') }} />

  // ─── branch info ──────────────────────────────────────────────────────────
  const currentBranch =
    UK_BRANCHES.find((b) => b.id === branch) ?? UK_BRANCHES[0] ?? {
      id: '1', name: 'United King', address: '', mapsUrl: '#',
    }

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans text-neutral-800">
      <main className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 md:px-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
        >
          {/* ── LEFT ── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6 md:p-8">

            {user && (
              <p className="text-sm text-neutral-600">
                Hello, <span className="font-bold text-[#000000] uppercase">{user.name}</span>
              </p>
            )}

            {/* Order type banner */}
            {orderType === 'pickup' ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-1.5">
                <p className="text-sm font-bold text-neutral-900 uppercase">Takeaway Order 📦</p>
                <p className="text-sm text-neutral-600">
                  Collect from <span className="font-semibold">{currentBranch.name}</span>
                </p>
                <p className="text-xs text-neutral-500">{currentBranch.address}</p>
                <div className="flex items-center gap-4 pt-1">
                  <a href={currentBranch.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                    <Navigation size={11} /> View on Maps
                  </a>
                  <a href={`tel:${UK_PHONE.replace(/-/g, '')}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    📞 {UK_PHONE}
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
                <p className="mt-1 text-sm text-neutral-500 flex items-center gap-1">
                  <Bike size={13} /> Delivery Order 🛵
                </p>
              </div>
            )}

            <hr className="border-neutral-100" />

            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* ── GUEST FORM ── */}
            {!user ? (
              <div className="space-y-4">
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <div>
                    <label className={labelClass}>Title</label>
                    <select {...register('title')} className={inputClass}>
                      {TITLE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-neutral-700">Full Name</label>
                      <span className="text-xs font-bold text-[#000000]">*Required</span>
                    </div>
                    <input {...register('guestFullName')} placeholder="Full Name" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-neutral-700">Mobile</label>
                      <span className="text-xs font-bold text-[#000000]">*Required</span>
                    </div>
                    <input {...register('guestMobile')} placeholder="03xx-xxxxxxx" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Alternate Mobile</label>
                    <input {...register('guestAltMobile')} placeholder="03xx-xxxxxxx" className={inputClass} />
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-neutral-700">Delivery Address</label>
                        <span className="text-xs font-bold text-[#000000]">*Required</span>
                      </div>
                      <input {...register('guestAddress')} placeholder="Enter your complete address" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Nearest Landmark</label>
                      <input {...register('guestLandmark')} placeholder="Any famous place nearby" className={inputClass} />
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClass}>Email (optional)</label>
                  <input type="email" {...register('guestEmail')} placeholder="Enter your email" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>{orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}</label>
                  <input {...register('instructions')} placeholder="Any special instructions…" className={inputClass} />
                </div>

                <PaymentSection control={control} register={register} orderType={orderType} />
              </div>
            ) : (
              /* ── LOGGED-IN FORM ── */
              <div className="space-y-4">
                {orderType === 'delivery' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-700">Select Delivery Address</p>
                      {!showAddrForm && (
                        <button type="button" onClick={() => setShowAddrForm(true)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#000000] hover:text-red-700">
                          <Plus size={14} /> Add New
                        </button>
                      )}
                    </div>

                    {loadingAddresses && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Loader2 size={13} className="animate-spin text-[#000000]" /> Loading addresses…
                      </div>
                    )}

                    <div className="space-y-2">
                      {apiAddresses.map((addr) => {
                        const sel = formValues.selectedAddressId === String(addr.id)
                        return (
                          <button key={addr.id} type="button"
                            onClick={() => setValue('selectedAddressId', String(addr.id))}
                            className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                              sel ? 'border-green-600 bg-green-50 text-green-800'
                                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                            }`}>
                            <div>
                              <span className="font-medium">{addr.address}</span>
                              {addr.city && <span className="text-neutral-400">, {addr.city}</span>}
                            </div>
                            {sel
                              ? <CheckCircle size={18} className="shrink-0 text-green-600" />
                              : <Circle size={18} className="shrink-0 text-neutral-300" />}
                          </button>
                        )
                      })}
                      {!loadingAddresses && apiAddresses.length === 0 && !showAddrForm && (
                        <p className="text-sm text-neutral-400 py-2">No saved addresses. Add one below.</p>
                      )}
                    </div>

                    {showAddrForm && (
                      <div className="space-y-2 rounded-lg border border-dashed border-neutral-300 p-4">
                        <input {...register('newAddrLine')} placeholder="Street address, area, landmark"
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000]" />
                        <select {...register('newAddrCity')}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000]">
                          {['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad'].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button type="button" onClick={handleAddAddress} disabled={apiAddrAdder.isPending}
                            className="flex-1 rounded-lg bg-black py-2 text-xs font-bold text-[#ffffff] hover:bg-red-700 disabled:opacity-50">
                            {apiAddrAdder.isPending ? 'Saving…' : 'Save Address'}
                          </button>
                          <button type="button" onClick={() => setShowAddrForm(false)}
                            className="flex-1 rounded-lg border border-neutral-300 py-2 text-xs font-semibold text-neutral-600">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className={labelClass}>{orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}</label>
                  <input {...register('instructions')} placeholder="Any special instructions…" className={inputClass} />
                </div>

                <PaymentSection control={control} register={register} orderType={orderType} />
              </div>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-4">
            {/* Items */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm divide-y divide-neutral-100">
              <h2 className="pb-3 font-bold text-neutral-800">Your Items</h2>
              {items.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-400">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.selectedOption}`}
                    className="flex items-center justify-between py-3 text-sm">
                    <span className="text-neutral-700">
                      {item.quantity} × {item.name}
                      {item.selectedOption ? ` (${item.selectedOption})` : ''}
                    </span>
                    <span className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            {/* Price summary */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
              <h2 className="font-bold text-neutral-800">Order Summary</h2>
              <PriceRow label="Subtotal"  value={`Rs. ${subtotal.toLocaleString()}`} />
              <PriceRow label="Tax 18%"   value={`Rs. ${tax.toLocaleString()}`} />
              {orderType === 'delivery' && (
                <PriceRow label="Delivery Fee" value={`Rs. ${fee.toLocaleString()}`} />
              )}
              <div className="border-t border-neutral-200 pt-3 flex items-center justify-between font-bold text-neutral-900 text-sm">
                <span>Grand Total</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" disabled={!canPlace || isPlacing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#000000] py-4 text-sm font-bold text-[#ffffff] shadow-md transition-all hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-50">
              {isPlacing
                ? <><Loader2 size={16} className="animate-spin" />Placing Order…</>
                : 'Place Order'}
            </button>

            <Link href="/" className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold">
              <ArrowLeft size={14} /> Back to menu
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

// ─── Price row ─────────────────────────────────────────────────────────────────

function PriceRow({ label, value, valueClass = 'font-semibold' }: {
  label: string; value: string; valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm text-neutral-600">
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

// ─── Order receipt ─────────────────────────────────────────────────────────────

function OrderReceipt({ order, onPlaceAnother }: {
  order: OrderSnapshot; onPlaceAnother: () => void
}) {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="mx-auto max-w-[560px] space-y-4">
        <div className="rounded-2xl bg-green-600 px-6 py-8 text-center text-white shadow">
          <CheckCircle size={48} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Order Placed!</h1>
          <p className="mt-1 text-green-100 text-sm">Order #{order.orderId}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-3 text-sm">
          <DetailRow label="Customer"    value={order.customerName} />
          <DetailRow label="Phone"       value={order.customerPhone} />
          <DetailRow label="Order Type"  value={order.orderType} />
          <DetailRow label="Branch"      value={order.branchName} />
          {order.customerAddress && <DetailRow label="Address" value={order.customerAddress} />}
          <DetailRow label="Status"      value={order.status} />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm divide-y divide-neutral-100">
          <h2 className="pb-3 font-bold text-neutral-800">Items</h2>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-neutral-700">
                {item.quantity} × {item.name}
              </span>
              <span className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-2 text-sm">
          <PriceRow label="Subtotal"      value={`Rs. ${parseFloat(order.subtotal).toLocaleString()}`} />
          {parseFloat(order.deliveryCharge) > 0 && (
            <PriceRow label="Delivery Charge" value={`Rs. ${parseFloat(order.deliveryCharge).toLocaleString()}`} />
          )}
          <div className="border-t border-neutral-200 pt-3 flex items-center justify-between font-bold text-neutral-900">
            <span>Grand Total</span>
            <span>Rs. {parseFloat(order.grandTotal).toLocaleString()}</span>
          </div>
        </div>

        <button onClick={onPlaceAnother}
          className="w-full rounded-xl bg-black py-4 text-sm font-bold text-[#ffffff] hover:bg-red-700 transition-colors">
          Place Another Order
        </button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-neutral-500 shrink-0">{label}</span>
      <span className="font-semibold text-neutral-800 text-right">{value}</span>
    </div>
  )
}

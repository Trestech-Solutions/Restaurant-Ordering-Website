'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import {
  CheckCircle, Circle, Plus, Bike, ArrowLeft, Navigation,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/hooks/useCart'
import { UK_BRANCHES } from '@/components/website/OrderTypeModal'
import {
  useCheckoutGuest,
  useCheckoutLoggedIn,
  buildGuestPayload,
  buildLoggedInPayload,
} from '@/api/client/checkout'
import { useGetOrder } from '@/api/client/checkout'
import { useAddToCart } from '@/api/client/cart'
import { useGetAddresses, useAddAddress } from '@/api/client/customer'
import { setCartToken } from '@/api/utils'
import { PaymentSection } from '@/components/checkout/PaymentSection'
import type { CheckoutFormValues } from '@/components/checkout/types'
import type { Order } from '@/api/types'
import { fmtDateTime } from '@/utils/general'
import PriceRow from '@/components/checkout/price-row'
import OrderReceipt from '@/components/checkout/OrderReceipt'

const TAX_RATE     = 0.18
const DELIVERY_FEE = 200

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']
const UK_PHONE      = '021-111-022-022'

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] placeholder:text-neutral-400'
const labelClass = 'mb-2 block text-sm font-semibold text-neutral-700'

// ─── Order snapshot shown after successful placement ──────────────────────────



// ─── Main page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const {
    items,
    orderType,
    user,
    addAddress: addLocalAddress,
    branch,
    location,
    subtotal,
    clearCart,
    areaId,
    cartToken: liveCartToken,
  } = useCart()

  const numericBranch = branch ? Number(branch) : undefined
  const numericArea   = areaId ?? undefined

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
  const [discount, setDiscount]         = useState(0)
  const [order, setOrder]               = useState<OrderSnapshot | null>(null)
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null)
  const [errorMsg, setErrorMsg]         = useState('')

  // auto-select first API address
  useEffect(() => {
    if (apiAddresses.length > 0 && !formValues.selectedAddressId) {
      setValue('selectedAddressId', String(apiAddresses[0].id))
    }
  }, [apiAddresses]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── derived values ────────────────────────────────────────────────────────
  const tax        = Math.round(subtotal * TAX_RATE)
  const fee        = orderType === 'delivery' ? DELIVERY_FEE : 0
  const grandTotal = subtotal + tax + fee - discount
  const selectedAddr = apiAddresses.find(
    (a) => String(a.id) === formValues.selectedAddressId
  )

  const guestReady =
    formValues.guestFullName.trim() !== '' &&
    formValues.guestMobile.trim() !== '' &&
    (orderType === 'pickup' || formValues.guestAddress.trim() !== '')
  const userReady  = items.length > 0 && (orderType === 'pickup' || !!formValues.selectedAddressId)
  const canPlace   = items.length > 0 && (user ? userReady : guestReady)

  // ─── voucher ──────────────────────────────────────────────────────────────
  const handleApplyVoucher = () => {
    const code = getValues('voucher').trim().toUpperCase()
    setDiscount(code === 'UK10' ? Math.round(subtotal * 0.1) : 0)
  }

  // ─── add address inline ───────────────────────────────────────────────────
  const handleAddAddress = () => {
    const line = getValues('newAddrLine')
    const city = getValues('newAddrCity')
    if (!line.trim()) return
    if (user) {
      apiAddrAdder.addAddress({ address: line.trim(), city })
    } else {
      addLocalAddress({ line1: line.trim(), city })
      setValue('newAddrLine', '')
      setValue('newAddrCity', 'Karachi')
      setShowAddrForm(false)
    }
  }

  // ─── checkout mutations ───────────────────────────────────────────────────
  const checkoutGuest = useCheckoutGuest({
    onSuccess(res) {
      if (res?.order) { setPlacedOrderId(res.order.id); populateFromOrder(res.order) }
      clearCart(); setCartToken(null)
    },
    onError(msg) { setErrorMsg(msg || 'Failed to place order') },
  })

  const checkoutLoggedIn = useCheckoutLoggedIn({
    onSuccess(res) {
      if (res?.order) { setPlacedOrderId(res.order.id); populateFromOrder(res.order) }
      clearCart(); setCartToken(null)
    },
    onError(msg) { setErrorMsg(msg || 'Failed to place order') },
  })

  function populateFromOrder(o: Order) {
    const cartItems: CartItem[] = (o.items ?? []).map((i) => ({
      id: String(i.product),
      productId: typeof i.product === 'number' ? i.product : null,
      cartItemId: typeof i.id === 'number' ? i.id : null,
      name: i.product_name,
      price: Math.round(parseFloat(String(i.unit_price))),
      image: i.product_image || '',
      quantity: i.quantity,
      selectedOption: i.variant_name || undefined,
      variantId: null,
    }))
    setOrder({
      orderNo: o.order_no,
      placedAt: fmtDateTime(o.placed_at),
      deliveryAt: o.estimated_delivery_at ? fmtDateTime(o.estimated_delivery_at) : '—',
      customerName: o.customer_name || (user ? user.name : 'Guest'),
      customerPhone: o.customer_phone || '—',
      customerEmail: o.customer_email || '—',
      deliveryAddress: o.delivery_address || '—',
      branchName: o.branch_name || 'United King',
      orderType: o.order_type === 'pickup' ? 'Pickup' : 'Delivery',
      payment: o.payment_method,
      items: cartItems.length > 0 ? cartItems : [...items],
      subtotal: Math.round(parseFloat(String(o.subtotal))),
      discount: Math.round(parseFloat(String(o.discount || 0))),
      fee: Math.round(parseFloat(String(o.delivery_fee || 0))),
      tax: Math.round(parseFloat(String(o.tax || 0))),
      grandTotal: Math.round(parseFloat(String(o.total))),
    })
  }

  // ─── cart sync ────────────────────────────────────────────────────────────
  const addToCartMutation = useAddToCart()
  const isPlacing =
    checkoutGuest.isPending || checkoutLoggedIn.isPending || addToCartMutation.isPending

  async function ensureCartToken(): Promise<string> {
    if (liveCartToken) return liveCartToken

    const syncable = items.filter(
      (i) => i.productId !== null && !isNaN(Number(i.productId))
    )
    if (syncable.length === 0) return ''

    let resolvedToken = ''
    for (const item of syncable) {
      try {
        const res = await addToCartMutation.addToCartAsync({
          product: item.productId as number,
          quantity: item.quantity,
          variant: item.variantId ?? undefined,
          cart_token: resolvedToken || undefined,
          branch: numericBranch,
          area: numericArea,
        })
        const asCart = res as import('@/api/types').Cart
        const asAny  = res as any
        const token  = asCart?.token || asAny?.cart_token || asAny?.cart?.token || ''
        if (token && !resolvedToken) {
          resolvedToken = token
          setCartToken(resolvedToken)
        }
      } catch {
        break
      }
    }
    return resolvedToken
  }

  // ─── submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: CheckoutFormValues) => {
    if (!canPlace) return
    setErrorMsg('')

    const resolvedToken = await ensureCartToken()
    if (!resolvedToken) {
      setErrorMsg('Unable to create cart. Please try adding items again.')
      return
    }

    const common = {
      order_type:           orderType as 'delivery' | 'pickup',
      payment_method:       values.payment as 'cod' | 'card' | 'online' | 'wallet',
      branch:               numericBranch,
      area:                 numericArea,
      subtotal,
      tax,
      delivery_fee:         fee,
      discount,
      total:                grandTotal,
      special_instructions: values.instructions || undefined,
      voucher_code:         values.voucher.trim() || undefined,
      change_amount:        values.changeAmount || undefined,
      is_gift:              values.isGift,
    }

    if (user) {
      const payload = buildLoggedInPayload({
        ...common,
        customer_name:  user.name,
        customer_phone: user.phone,
        address_id:     selectedAddr ? Number(selectedAddr.id) : undefined,
        address:        selectedAddr
          ? `${selectedAddr.address}, ${selectedAddr.city}`
          : undefined,
        city: selectedAddr?.city,
      })
      checkoutLoggedIn.checkoutLoggedIn({ ...payload, cart_token: resolvedToken })
    } else {
      const nameParts = values.guestFullName.trim().split(' ')
      const payload = buildGuestPayload({
        ...common,
        title:      values.title,
        first_name: nameParts[0] || 'Customer',
        last_name:  nameParts.slice(1).join(' ') || undefined,
        phone:      values.guestMobile,
        alt_phone:  values.guestAltMobile || undefined,
        email:      values.guestEmail || undefined,
        address:    orderType === 'delivery' ? values.guestAddress : undefined,
        landmark:   values.guestLandmark || undefined,
        city:       orderType === 'delivery'
          ? (location?.split(', ').pop() || 'Karachi')
          : undefined,
      })
      checkoutGuest.checkoutGuest({ ...payload, cart_token: resolvedToken })
    }
  }

  // fetch order details after placement
  useGetOrder({ orderId: placedOrderId })

  // ─── receipt ──────────────────────────────────────────────────────────────
  if (order) return <OrderReceipt order={order} onPlaceAnother={() => router.push('/')} />

  // ─── branch info ──────────────────────────────────────────────────────────
  const currentBranch =
    UK_BRANCHES.find((b) => b.id === branch) ??
    UK_BRANCHES[0] ?? {
      id: '1',
      name: 'United King Maskan',
      address: 'FL 6, Block 7 Gulshan-e-Iqbal, Karachi, Sindh',
      mapsUrl: 'https://maps.google.com/?q=United+King+Maskan+Karachi',
    }
  const branchLabel =
    location || (branch ? `United King ${branch}` : 'United King')
  const branchShort =
    branchLabel.length > 12 ? branchLabel.slice(0, 12) + '…' : branchLabel

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

            {/* Greeting */}
            {user && (
              <p className="text-sm text-neutral-600">
                Hello,{' '}
                <span className="font-bold text-[#c8102e] uppercase">{user.name}</span>
              </p>
            )}

            {/* Order type banner */}
            {orderType === 'pickup' ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-1.5">
                <p className="text-sm font-bold text-neutral-900 uppercase">
                  Takeaway Order 📦
                </p>
                <p className="text-sm text-neutral-600">
                  Collect from{' '}
                  <span className="font-semibold text-neutral-800">
                    {currentBranch.name}
                  </span>
                </p>
                <p className="text-xs text-neutral-500">{currentBranch.address}</p>
                <div className="flex items-center gap-4 pt-1">
                  <a
                    href={currentBranch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Navigation size={11} /> View on Maps
                  </a>
                  <a
                    href={`tel:${UK_PHONE.replace(/-/g, '')}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
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

            {/* Error banner */}
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* ── GUEST FORM ── */}
            {!user ? (
              <div className="space-y-4">
                {/* Title + Name */}
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <div>
                    <label className={labelClass}>Title</label>
                    <select {...register('title')} className={inputClass}>
                      {TITLE_OPTIONS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-neutral-700">
                        Full Name
                      </label>
                      <span className="text-xs font-bold text-[#c8102e]">*Required</span>
                    </div>
                    <input
                      {...register('guestFullName')}
                      placeholder="Full Name"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-neutral-700">
                        Mobile
                      </label>
                      <span className="text-xs font-bold text-[#c8102e]">*Required</span>
                    </div>
                    <input
                      {...register('guestMobile')}
                      placeholder="03xx-xxxxxxx"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alternate Mobile</label>
                    <input
                      {...register('guestAltMobile')}
                      placeholder="03xx-xxxxxxx"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Delivery address */}
                {orderType === 'delivery' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-neutral-700">
                          Delivery Address
                        </label>
                        <span className="text-xs font-bold text-[#c8102e]">*Required</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          {...register('guestAddress')}
                          placeholder="Enter your complete address"
                          className={inputClass}
                        />
                        <span className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-semibold text-neutral-500 max-w-[130px] truncate">
                          {branchShort}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Nearest Landmark</label>
                      <input
                        {...register('guestLandmark')}
                        placeholder="Any famous place nearby"
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label className={labelClass}>Email (optional)</label>
                  <input
                    type="email"
                    {...register('guestEmail')}
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className={labelClass}>
                    {orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}
                  </label>
                  <input
                    {...register('instructions')}
                    placeholder={
                      orderType === 'pickup' ? 'Any notes…' : 'Any delivery instructions…'
                    }
                    className={inputClass}
                  />
                </div>

                <PaymentSection
                  control={control}
                  register={register}
                  orderType={orderType}
                />
              </div>
            ) : (
              /* ── LOGGED-IN FORM ── */
              <div className="space-y-4">
                {orderType === 'delivery' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-700">
                        Select Delivery Address
                      </p>
                      {!showAddrForm && (
                        <button
                          type="button"
                          onClick={() => setShowAddrForm(true)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#c8102e] hover:text-red-700"
                        >
                          <Plus size={14} /> Add New
                        </button>
                      )}
                    </div>

                    {loadingAddresses && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Loader2 size={13} className="animate-spin text-[#c8102e]" />
                        Loading addresses…
                      </div>
                    )}

                    <Controller
                      name="selectedAddressId"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          {apiAddresses.map((addr) => {
                            const sel = field.value === String(addr.id)
                            return (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => field.onChange(String(addr.id))}
                                className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                                  sel
                                    ? 'border-green-600 bg-green-50 text-green-800'
                                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                                }`}
                              >
                                <div>
                                  <span className="font-medium">{addr.address}</span>
                                  {addr.city && (
                                    <span className="text-neutral-400">, {addr.city}</span>
                                  )}
                                </div>
                                {sel ? (
                                  <CheckCircle
                                    size={18}
                                    className="shrink-0 text-green-600"
                                  />
                                ) : (
                                  <Circle
                                    size={18}
                                    className="shrink-0 text-neutral-300"
                                  />
                                )}
                              </button>
                            )
                          })}
                          {!loadingAddresses && apiAddresses.length === 0 && !showAddrForm && (
                            <p className="text-sm text-neutral-400 py-2">
                              No saved addresses. Add one below.
                            </p>
                          )}
                        </div>
                      )}
                    />

                    {showAddrForm && (
                      <div className="space-y-2 rounded-lg border border-dashed border-neutral-300 p-4">
                        <input
                          {...register('newAddrLine')}
                          placeholder="Street address, area, landmark"
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                        />
                        <select
                          {...register('newAddrCity')}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                        >
                          {[
                            'Karachi',
                            'Lahore',
                            'Islamabad',
                            'Rawalpindi',
                            'Faisalabad',
                          ].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddAddress}
                            disabled={apiAddrAdder.isPending}
                            className="flex-1 rounded-lg bg-[#c8102e] py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {apiAddrAdder.isPending ? 'Saving…' : 'Save Address'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddrForm(false)}
                            className="flex-1 rounded-lg border border-neutral-300 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions */}
                <div>
                  <label className={labelClass}>
                    {orderType === 'pickup' ? 'Pickup Notes' : 'Delivery Instructions'}
                  </label>
                  <input
                    {...register('instructions')}
                    placeholder={
                      orderType === 'pickup' ? 'Any notes…' : 'Any delivery instructions…'
                    }
                    className={inputClass}
                  />
                </div>

                <PaymentSection
                  control={control}
                  register={register}
                  orderType={orderType}
                />
              </div>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-4">
            {/* Cart items */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm divide-y divide-neutral-100">
              <h2 className="pb-3 font-bold text-neutral-800">Your Items</h2>
              {items.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-400">
                  Your cart is empty
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedOption}`}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="text-neutral-700">
                      {item.quantity} × {item.name}
                      {item.selectedOption ? ` (${item.selectedOption})` : ''}
                    </span>
                    <span className="font-semibold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Price summary */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
              <h2 className="font-bold text-neutral-800">Order Summary</h2>
              <PriceRow label="Subtotal" value={`Rs. ${subtotal.toLocaleString()}`} />
              <PriceRow label="Tax 18%" value={`Rs. ${tax.toLocaleString()}`} />
              {orderType === 'delivery' && (
                <PriceRow
                  label="Delivery Fee"
                  value={`Rs. ${fee.toLocaleString()}`}
                />
              )}
              {discount > 0 && (
                <PriceRow
                  label="Discount"
                  value={`− Rs. ${discount.toLocaleString()}`}
                  valueClass="font-semibold text-green-600"
                />
              )}
              <div className="border-t border-neutral-200 pt-3 flex items-center justify-between font-bold text-neutral-900 text-sm">
                <span>Grand Total</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>

              {/* Voucher */}
              <div className="flex gap-2 pt-1">
                <input
                  {...register('voucher')}
                  placeholder="Voucher / Promo code"
                  className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="rounded-lg bg-neutral-500 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canPlace || isPlacing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlacing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Placing Order…
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              <ArrowLeft size={14} /> Back to menu
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}






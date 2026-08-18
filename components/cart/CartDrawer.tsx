'use client'

import { useRef } from 'react'
import { X, Plus, Minus, Trash2, ArrowRight, ChevronLeft, ChevronRight, Plus as PlusIcon, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/hooks/useCart'
import { useStoreLocation } from '@/lib/hooks/useStoreLocation'
import { useGetMenu } from '@/api/client/browse'

const TAX_RATE     = 0.18
const DELIVERY_FEE = 200
const PLACEHOLDER  = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop'

function fmtDateTimeDelivery() {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return { date, time }
}

export function CartDrawer() {
  const {
    isCartOpen, closeCart, items, removeItem, updateQuantity, addItem,
    subtotal, orderType,
  } = useCart()
  const { branchId, areaId } = useStoreLocation()

  const { data: menuData } = useGetMenu({ branchId, areaId })

  const popularItems = (menuData?.menu ?? [])
    .flatMap((cat) => cat.items ?? [])
    .filter((it) => it.status !== false && it.status !== 0)
    .slice(0, 8)

  const scrollRef   = useRef<HTMLDivElement>(null)
  const tax         = Math.round(subtotal * TAX_RATE)
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0
  const grandTotal  = subtotal + tax + deliveryFee
  const { date, time } = fmtDateTimeDelivery()

  const scrollPopular = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' })
  }

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={closeCart} />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-bold text-neutral-900">Your Cart</h2>
          <button onClick={closeCart} aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8102e] text-white hover:bg-[#a80d26] transition-colors shadow-sm">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length > 0 ? (
            <div className="px-5 pb-2">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.id}-${item.selectedOption ?? ''}`}
                  item={item}
                  onRemove={() => removeItem(item)}
                  onIncrease={() => updateQuantity(item, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item, item.quantity - 1)}
                />
              ))}
            </div>
          ) : (
            <EmptyCart />
          )}

          {items.length > 0 && popularItems.length > 0 && (
            <div className="px-5 pb-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-bold text-neutral-800">Popular with your order</p>
                  <p className="text-xs text-neutral-500">Customers often buy these together</p>
                </div>
                <div className="flex gap-1.5 pt-0.5">
                  <button onClick={() => scrollPopular('left')} aria-label="Scroll left"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-[#c8102e] hover:text-[#c8102e] transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => scrollPopular('right')} aria-label="Scroll right"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-[#c8102e] hover:text-[#c8102e] transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
                {popularItems.map((prod) => {
                  const price = Math.round(parseFloat(prod.price_at_branch || prod.front_price || '0'))
                  return (
                    <div key={prod.id} className="shrink-0 w-[110px]">
                      <div className="relative w-[110px] h-[110px] rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50">
                        <Image
                          src={prod.feature_image || PLACEHOLDER}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => addItem({
                            id:        String(prod.id),
                            productId: prod.id,
                            name:      prod.name,
                            price,
                            image:     prod.feature_image || PLACEHOLDER,
                          })}
                          aria-label={`Add ${prod.name}`}
                          className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#c8102e] shadow-md hover:bg-[#c8102e] hover:text-white transition-colors border border-neutral-200"
                        >
                          <PlusIcon size={14} strokeWidth={3} />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-neutral-800">Rs. {price.toLocaleString()}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{prod.name}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="px-5 pb-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Subtotal</span>
                  <span className="font-semibold text-neutral-800">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Tax 18%</span>
                  <span className="text-neutral-600">Rs. {tax.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Delivery Fee</span>
                  <span className="text-neutral-600">
                    {orderType === 'pickup' ? '—' : `Rs. ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t border-neutral-200 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">Grand Total</span>
                    <span className="font-bold text-neutral-900">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-100 bg-white px-5 pt-4 pb-6 space-y-3">
            <Link
              href="/website/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-between rounded-xl bg-[#c8102e] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#a80d26] transition-colors shadow-md"
            >
              <span className="pl-2">Checkout</span>
              <ArrowRight size={18} className="text-[#f7c948]" />
            </Link>

            {orderType === 'delivery' && (
              <div className="rounded-lg bg-sky-50 border border-sky-100 px-4 py-3">
                <p className="text-sm leading-relaxed text-neutral-700">
                  Your order will be delivered approximately in 60 minutes on{' '}
                  <span className="font-bold text-sky-700">{date}</span> at{' '}
                  <span className="font-bold text-sky-700">{time}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}

function EmptyCart() {
  const router = useRouter()
  const { closeCart } = useCart()

  const handleStart = () => {
    closeCart()
    router.push('/')
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center px-6 py-8">
      <ShoppingBag size={100} strokeWidth={1.2} className="text-[#c8102e]" />
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-[#c8102e]">Your Cart is Empty</h3>
        <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-neutral-500">
          Looks like you haven&apos;t added anything yet. Browse the menu to get started!
        </p>
      </div>
      <button
        onClick={handleStart}
        className="mt-2 rounded-md bg-[#c8102e] px-6 py-2.5 text-sm font-semibold text-[#f7c948] hover:bg-[#a80d26] transition-colors shadow-sm"
      >
        Browse Menu
      </button>
    </div>
  )
}

interface CartItemRowProps {
  item: ReturnType<typeof useCart>['items'][number]
  onRemove: () => void
  onIncrease: () => void
  onDecrease: () => void
}

function CartItemRow({ item, onRemove, onIncrease, onDecrease }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-2">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-neutral-100 flex items-center justify-center text-neutral-300 text-xs">
            No img
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 leading-tight truncate">
            {item.name}{item.selectedOption ? ` (${item.selectedOption})` : ''}
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-900">
            Rs. {(item.price * item.quantity).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center shrink-0 rounded-md border border-[#c8102e] overflow-hidden">
          <button onClick={onDecrease} aria-label="Decrease or remove"
            className="flex h-7 w-7 items-center justify-center bg-white text-[#c8102e] hover:bg-[#c8102e] hover:text-white transition-colors">
            {item.quantity <= 1 ? <Trash2 size={13} /> : <Minus size={13} strokeWidth={3} />}
          </button>
          <span className="w-7 text-center text-sm font-semibold text-neutral-900 bg-white">
            {item.quantity}
          </span>
          <button onClick={onIncrease} aria-label="Increase quantity"
            className="flex h-7 w-7 items-center justify-center bg-white text-[#c8102e] hover:bg-[#c8102e] hover:text-white transition-colors">
            <Plus size={13} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
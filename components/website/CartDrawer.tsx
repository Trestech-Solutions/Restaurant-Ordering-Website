'use client'

import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'

// ─── Delivery fee config ──────────────────────────────────────────────────────
const DELIVERY_FEE = 99
const FREE_DELIVERY_THRESHOLD = 1500

export function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
    orderType,
  } = useCart()

  const deliveryFee = orderType === 'delivery' && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0
  const total = subtotal + deliveryFee

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#c8102e]" />
            <h2 className="text-base font-bold text-neutral-900">
              Your Cart
              {totalItems > 0 && (
                <span className="ml-2 rounded-full bg-[#c8102e] px-2 py-0.5 text-xs font-semibold text-white">
                  {totalItems}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Order type pill */}
        <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-2">
          <span className="text-xs text-neutral-500">
            Order type:{' '}
            <span className="font-semibold capitalize text-[#c8102e]">{orderType}</span>
          </span>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.id}-${item.selectedOption}`}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Checkout section — only when cart has items */}
        {items.length > 0 && (
          <CheckoutSection
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            orderType={orderType}
            freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
          />
        )}
      </aside>
    </>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
        <ShoppingBag size={36} className="text-neutral-300" />
      </div>
      <div>
        <p className="font-semibold text-neutral-700">Your cart is empty</p>
        <p className="mt-1 text-sm text-neutral-400">Add items to get started</p>
      </div>
    </div>
  )
}

// ─── Single cart item row ─────────────────────────────────────────────────────

interface CartItemRowProps {
  item: ReturnType<typeof useCart>['items'][number]
  onRemove: () => void
  onIncrease: () => void
  onDecrease: () => void
}

function CartItemRow({ item, onRemove, onIncrease, onDecrease }: CartItemRowProps) {
  return (
    <li className="flex gap-3">
      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-100">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-neutral-900 leading-tight">{item.name}</p>
            {item.selectedOption && (
              <p className="mt-0.5 text-xs text-neutral-400">{item.selectedOption}</p>
            )}
          </div>
          <button
            onClick={onRemove}
            aria-label="Remove item"
            className="mt-0.5 rounded p-0.5 text-neutral-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-neutral-900">
            Rs. {(item.price * item.quantity).toLocaleString()}
          </span>
          {/* Quantity stepper */}
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-1 py-0.5">
            <button
              onClick={onDecrease}
              aria-label="Decrease quantity"
              className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center text-sm font-semibold text-neutral-900">
              {item.quantity}
            </span>
            <button
              onClick={onIncrease}
              aria-label="Increase quantity"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c8102e] text-white hover:bg-[#a80d26] transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

// ─── Checkout section ─────────────────────────────────────────────────────────

interface CheckoutSectionProps {
  subtotal: number
  deliveryFee: number
  total: number
  orderType: string
  freeDeliveryThreshold: number
}

function CheckoutSection({
  subtotal,
  deliveryFee,
  total,
  orderType,
  freeDeliveryThreshold,
}: CheckoutSectionProps) {
  const remaining = freeDeliveryThreshold - subtotal

  return (
    <div className="border-t border-neutral-200 bg-white px-5 py-5">
      {/* Free delivery progress */}
      {orderType === 'delivery' && subtotal < freeDeliveryThreshold && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs text-neutral-500">
            Add{' '}
            <span className="font-semibold text-[#c8102e]">
              Rs. {remaining.toLocaleString()}
            </span>{' '}
            more for free delivery
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-[#c8102e] transition-all duration-300"
              style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Price breakdown */}
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Delivery fee</span>
          <span>
            {deliveryFee === 0 ? (
              <span className="font-semibold text-green-600">Free</span>
            ) : (
              `Rs. ${deliveryFee}`
            )}
          </span>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-neutral-900">
          <span>Total</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Checkout CTA */}
      <Link
        href="/website/checkout"
        onClick={() => {}}
        className="flex w-full items-center justify-between rounded-xl bg-[#c8102e] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#a80d26] transition-colors"
      >
        <span>Proceed to Checkout</span>
        <div className="flex items-center gap-1">
          <span>Rs. {total.toLocaleString()}</span>
          <ChevronRight size={16} />
        </div>
      </Link>
    </div>
  )
}

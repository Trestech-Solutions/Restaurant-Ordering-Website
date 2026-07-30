'use client'

import { useCart } from '@/lib/context/CartContext'

export function CartBar() {
  const { totalItems, subtotal, openCart } = useCart()

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 pointer-events-none flex justify-center">
      <div className="max-w-[380px] w-full pointer-events-auto">
        <button
          onClick={openCart}
          className="flex w-full items-center justify-between rounded-xl bg-[#c8102e] px-4 py-3.5 text-white shadow-2xl hover:bg-[#a80d26] transition-colors"
        >
          {/* Left — count badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#c8102e]">
              {totalItems}
            </span>
            <span className="text-sm font-bold">View Cart</span>
          </div>

          {/* Right — total */}
          <span className="text-sm font-bold text-[#f7c948]">Rs. {subtotal.toLocaleString()}</span>
        </button>
      </div>
    </div>
  )
}
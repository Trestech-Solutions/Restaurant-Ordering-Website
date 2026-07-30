'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Share2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import type { ProductData } from './ProductCard'

interface ProductDetailModalProps {
  product: ProductData
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart()

  const [selectedOption, setSelectedOption] = useState(product.options[0] ?? '')
  const [qty, setQty]                       = useState(1)
  const [instructions, setInstructions]     = useState('')
  const [sharing, setSharing] = useState(false)
  const [added, setAdded]     = useState(false)

  const handleShare = async () => {
    if (sharing || !navigator.share) return
    setSharing(true)
    try {
      await navigator.share({ title: product.name, url: window.location.href })
    } catch (e: unknown) {
      // AbortError = user cancelled — safe to ignore
      if (e instanceof Error && e.name !== 'AbortError') console.error(e)
    } finally {
      setSharing(false)
    }
  }

  const unitPrice = parseInt(product.price, 10)
  const total     = unitPrice * qty

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: unitPrice,
        image: product.image,
        selectedOption: selectedOption || undefined,
      })
    }
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 900)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative flex w-full max-w-[860px] overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]">

        {/* ── Left — image ─────────────────────────────────────────── */}
        <div className="relative hidden w-[420px] shrink-0 sm:block">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {product.tag && (
            <span className="absolute left-3 top-3 rounded bg-[#f7c948] px-2.5 py-1 text-[11px] font-bold text-neutral-900">
              {product.tag}
            </span>
          )}
          {product.discount && (
            <span className="absolute right-3 top-3 rounded bg-[#c8102e] px-2.5 py-1 text-[11px] font-bold text-white">
              {product.discount}
            </span>
          )}
        </div>

        {/* ── Right — details ───────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-y-auto">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-8 pt-7 pb-4">
            <h2 className="text-xl font-bold text-neutral-900 leading-snug">{product.name}</h2>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                aria-label="Share"
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8102e] text-white hover:bg-red-700 transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 px-8 pb-3">
            {product.originalPrice && (
              <span className="text-sm text-neutral-400 line-through">Rs. {product.originalPrice}</span>
            )}
            <span className="text-xl font-bold text-neutral-900">Rs. {product.price}</span>
          </div>

          {/* Description */}
          <p className="px-8 pb-5 text-sm leading-relaxed text-neutral-600">{product.description}</p>

          {/* Options */}
          {product.options.length > 0 && (
            <div className="px-8 pb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      selectedOption === opt
                        ? 'border-[#c8102e] bg-[#c8102e] text-white'
                        : 'border-neutral-300 text-neutral-600 hover:border-[#c8102e] hover:text-[#c8102e]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="px-8 pb-5">
            <label className="mb-2 block text-sm font-semibold text-neutral-700">Special Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => {
                if (e.target.value.length <= 500) setInstructions(e.target.value)
              }}
              placeholder="Please enter instructions about this item"
              rows={4}
              className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition-colors"
            />
            <p className="mt-1 text-right text-[11px] text-neutral-400">{instructions.length}/500</p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer — qty + add to cart */}
          <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-100 bg-white px-8 py-4">
            {/* Qty */}
            <div className="flex items-center gap-2 rounded-full border border-neutral-300 px-2 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Decrease"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-bold text-neutral-900">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Increase"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              className={`flex flex-1 items-center justify-between rounded-full px-6 py-3 text-sm font-bold text-white transition-all ${
                added ? 'bg-green-600' : 'bg-[#c8102e] hover:bg-[#a80d26]'
              }`}
            >
              <span>{added ? 'Added to Cart!' : 'Add to Cart'}</span>
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold">
                Rs. {total.toLocaleString()}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

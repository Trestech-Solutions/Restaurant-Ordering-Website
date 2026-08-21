'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Share2, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import type { ProductData } from '../product/ProductCard'

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

  // ── Size-level price/discount resolution ──────────────────────────────────
  const hasSizes = !!product.sizes && product.sizes.length > 0
  const selectedSize = hasSizes
    ? product.sizes!.find((s) => s.sizeName === selectedOption) ?? product.sizes![0]!
    : undefined

  const unitPrice = selectedSize ? selectedSize.price : (parseInt(product.price, 10) || 0)
  const displayOriginal = selectedSize
    ? (selectedSize.originalPrice != null ? selectedSize.originalPrice : undefined)
    : (product.originalPrice ? parseInt(product.originalPrice, 10) : undefined)
  const displayDiscount = selectedSize
    ? (selectedSize.hasDiscountTag ? selectedSize.discountLabel : undefined)
    : product.discount

  const hasPrice    = Number.isFinite(unitPrice) && unitPrice > 0
  const isOrderable = hasPrice &&
                      product.productId !== null && product.productId !== undefined &&
                      Number.isFinite(Number(product.productId)) && Number(product.productId) > 0

  const handleShare = async () => {
    if (sharing || !navigator.share) return
    setSharing(true)
    try {
      await navigator.share({ title: product.name, url: window.location.href })
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') console.error(e)
    } finally {
      setSharing(false)
    }
  }

  const total = unitPrice * qty

  const handleAdd = () => {
    if (!isOrderable) return
    addItem({
      id: product.id,
      productId: product.productId,
      name: product.name,
      price: unitPrice,
      image: product.image,
      selectedOption: selectedOption || undefined,
      variantId: selectedSize ? selectedSize.sizeId : undefined,
      specialInstructions: instructions || undefined,
      quantity: qty,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 900)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative flex w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[95vh] sm:max-h-[90vh] sm:flex-row">

        {/* ── Left — image with name overlay ──────────────────────── */}
        <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-[45%] lg:w-[440px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />

          {product.tag && (
            <span className="absolute left-3 top-3 rounded bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-900">
              {product.tag}
            </span>
          )}
          {displayDiscount && (
            <span className="absolute right-3 top-3 rounded bg-[#f2c14e] px-2.5 py-1 text-[11px] font-bold text-neutral-900">
              {displayDiscount}
            </span>
          )}

          {/* Name overlay — gradient at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-4 pt-14 sm:px-6 sm:pb-6 sm:pt-20">
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
              {product.name}
            </h2>
          </div>
        </div>

        {/* ── Right — details ───────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-y-auto">

          {/* Header: price + share/close */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 sm:px-8 sm:pt-7 sm:pb-5">
            {isOrderable ? (
              <div className="flex items-baseline gap-2">
                {product.fromLabel && <span className="text-xs text-neutral-500 sm:text-sm">From</span>}
                <span className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
                  Rs. {unitPrice.toLocaleString()}
                </span>
                {displayOriginal != null && displayOriginal > unitPrice && (
                  <span className="text-sm text-neutral-400 line-through sm:text-lg">
                    Rs. {displayOriginal.toLocaleString()}
                  </span>
                )}
              </div>
            ) : <div />}

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#000000] text-white hover:bg-[#1f1f1f] transition-colors disabled:opacity-50 sm:h-10 sm:w-10"
                aria-label="Share"
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#000000] text-white hover:bg-red-700 transition-colors sm:h-10 sm:w-10"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="px-5 pb-4 text-xs leading-relaxed text-neutral-500 sm:px-8 sm:pb-5 sm:text-sm">
              {product.description}
            </p>
          )}

          {/* Options / Sizes */}
          {product.options.length > 0 && (
            <div className="px-5 pb-4 sm:px-8 sm:pb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 sm:text-xs">Select Size</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.options.map((opt) => {
                  const sizeMeta = product.sizes?.find((s) => s.sizeName === opt)
                  const priceBadge = sizeMeta ? ` · Rs.${sizeMeta.price.toLocaleString()}` : ''
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedOption(opt)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors sm:px-4 sm:py-1.5 sm:text-xs ${
                        selectedOption === opt
                          ? 'border-[#000000] bg-[#000000] text-white'
                          : 'border-neutral-300 text-neutral-600 hover:border-[#000000] hover:text-[#000000]'
                      }`}
                    >
                      {opt}{priceBadge}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="px-5 pb-4 sm:px-8 sm:pb-5">
            <label className="mb-2 block text-sm font-semibold text-neutral-900">Special Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => {
                if (e.target.value.length <= 500) setInstructions(e.target.value)
              }}
              placeholder="Please enter instructions about this item"
              rows={6}
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] transition-colors"
            />
            <p className="mt-1 text-right text-[11px] text-neutral-400">{instructions.length}/500</p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer — qty (trash/minus) + add to cart pill */}
          {isOrderable ? (
            <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-100 bg-white px-5 py-4 sm:px-8 sm:py-5">
              {/* Qty */}
              <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-1.5 py-1.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9 ${
                    qty <= 1
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-label={qty <= 1 ? 'Remove' : 'Decrease'}
                >
                  {qty <= 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                </button>
                <span className="w-5 text-center text-sm font-bold text-neutral-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#000000] text-white hover:bg-[#1f1f1f] transition-colors sm:h-9 sm:w-9"
                  aria-label="Increase"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all sm:px-8 ${
                  added ? 'bg-green-600' : 'bg-[#000000] hover:bg-[#1f1f1f]'
                }`}
              >
                <span>{added ? 'Added!' : `Rs. ${total.toLocaleString()}`}</span>
                {!added && (
                  <>
                    <span className="text-white/50">|</span>
                    <span>Add to Cart</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-5 py-4 sm:px-8 sm:py-5">
              <div className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-xs font-semibold text-neutral-600 sm:text-sm">
                Coming Soon — This item is not available for ordering yet.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
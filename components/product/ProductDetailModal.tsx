'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Share2, Minus, Plus, Trash2, ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import type { ProductData } from '../product/ProductCard'

interface ProductDetailModalProps {
  product: ProductData
  onClose: () => void
}

// ── PKT time-window check ─────────────────────────────────────────────────
function getPKTNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }))
}

function toMinutes(raw: string): number | null {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = m[2] ? parseInt(m[2], 10) : 0
  const ap = m[3]?.toLowerCase()
  if (ap === 'pm' && h !== 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

function isWindowActiveNow(timeWindow?: string): boolean | null {
  if (!timeWindow) return null
  const parts = timeWindow.split(/-|to/i).map((p) => p.trim())
  if (parts.length !== 2) return null
  const start = toMinutes(parts[0])
  const end = toMinutes(parts[1])
  if (start === null || end === null) return null

  const now = getPKTNow()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  if (start <= end) return nowMin >= start && nowMin <= end
  // overnight window (e.g. 10 PM - 2 AM)
  return nowMin >= start || nowMin <= end
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart()

  const [selectedOption, setSelectedOption] = useState(product.options[0] ?? '')
  const [qty, setQty]                       = useState(1)
  const [instructions, setInstructions]     = useState('')
  const [sharing, setSharing]               = useState(false)
  const [added, setAdded]                   = useState(false)

  const [groupSelections, setGroupSelections] = useState<Record<number, Set<number>>>({})

  const isDeal   = !!product.dealType
  const isFixed  = product.dealType === 'fixed_deal'
  const isOnSpot = product.dealType === 'on_spot_deal'
  const dealMeta = product.dealMeta

  const hasSizes    = !!product.sizes && product.sizes.length > 0
  const selectedSize = hasSizes
    ? product.sizes!.find((s) => s.sizeName === selectedOption) ?? product.sizes![0]!
    : undefined

  const unitPrice = isDeal
    ? (Math.round(parseFloat(dealMeta?.finalPrice ?? product.price)) || 0)
    : (selectedSize ? selectedSize.price : (parseInt(product.price, 10) || 0))

  const displayOriginal = isDeal
    ? (parseFloat(product.price) > unitPrice ? parseInt(product.price, 10) : undefined)
    : (selectedSize
        ? (selectedSize.originalPrice != null ? selectedSize.originalPrice : undefined)
        : (product.originalPrice ? parseInt(product.originalPrice, 10) : undefined))

  const displayDiscount = isDeal
    ? product.discount
    : (selectedSize
        ? (selectedSize.hasDiscountTag ? selectedSize.discountLabel : undefined)
        : product.discount)

  const hasPrice = Number.isFinite(unitPrice) && unitPrice > 0

  // Independently verify against PKT clock; fall back to server-provided flag if unparseable
  const computedAvailable = isOnSpot ? isWindowActiveNow(dealMeta?.timeWindow ?? undefined) : null
  const isAvailableNow = isOnSpot
    ? (computedAvailable !== null ? computedAvailable : dealMeta?.isAvailableNow !== false)
    : true

  const isOrderable =
    hasPrice &&
    (isDeal
      ? isAvailableNow
      : (product.productId !== null && product.productId !== undefined &&
         Number.isFinite(Number(product.productId)) && Number(product.productId) > 0))

  const toggleGroupOption = (groupIdx: number, optionId: number, selectQty: number) => {
    setGroupSelections((prev) => {
      const current = new Set(prev[groupIdx] ?? [])
      if (current.has(optionId)) {
        current.delete(optionId)
      } else {
        if (current.size >= selectQty) {
          const first = current.values().next().value as number
          current.delete(first)
        }
        current.add(optionId)
      }
      return { ...prev, [groupIdx]: current }
    })
  }

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

        {/* ── LEFT — image ────────────────────────────────────────── */}
        <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-[42%] lg:w-[400px]">
          <Image src={product.image} alt={product.name} fill className="object-cover" priority />

          {displayDiscount && (
            <span className="absolute right-3 top-3 rounded bg-[#f2c14e] px-2.5 py-1 text-[11px] font-bold text-neutral-900">
              {displayDiscount}
            </span>
          )}
          {!isDeal && product.tag && (
            <span className="absolute left-3 top-3 rounded bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-900">
              {product.tag}
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-24">
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
              {product.name}
            </h2>
            {product.description && (
              <p className="mt-1 text-xs text-white/80 line-clamp-2 sm:text-sm">{product.description}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT — details ──────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-y-auto">

          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 sm:px-8 sm:pt-6">
            {hasPrice ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
                  Rs. {unitPrice.toLocaleString()}
                </span>
                {displayOriginal != null && displayOriginal > unitPrice && (
                  <span className="text-sm text-neutral-400 line-through sm:text-base">
                    Rs. {displayOriginal.toLocaleString()}
                  </span>
                )}
              </div>
            ) : <div />}

            <div className="flex shrink-0 items-center gap-2">
              <button onClick={handleShare} disabled={sharing} aria-label="Share"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors disabled:opacity-50 sm:h-10 sm:w-10">
                <Share2 size={15} />
              </button>
              <button onClick={onClose} aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-black transition-colors sm:h-10 sm:w-10">
                <X size={16} />
              </button>
            </div>
          </div>

          {isOnSpot && dealMeta?.timeWindow && (
            <div className={`mx-5 mb-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium sm:mx-8 ${
              !isAvailableNow ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <Clock size={14} className="shrink-0" />
              <span>
                Available: <span className="font-semibold">{dealMeta.timeWindow}</span>
                {!isAvailableNow && (
                  <span className="ml-1.5 font-normal opacity-70">· not available right now (PKT)</span>
                )}
              </span>
            </div>
          )}

          {isFixed && dealMeta?.includedItems && dealMeta.includedItems.length > 0 && (
            <div className="px-5 pb-3 sm:px-8">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Included in this deal
              </p>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 overflow-hidden divide-y divide-neutral-100">
                {dealMeta.includedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-neutral-800 font-medium">{item.name}</span>
                    <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                      × {item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isOnSpot && dealMeta?.includedItems && dealMeta.includedItems.length > 0 && (
            <div className="px-5 pb-3 sm:px-8">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Always included
              </p>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 overflow-hidden divide-y divide-neutral-100">
                {dealMeta.includedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-neutral-800 font-medium">{item.name}</span>
                    <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                      × {item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isOnSpot && dealMeta?.groups && dealMeta.groups.map((group, gi) => {
            const selected = groupSelections[gi] ?? new Set<number>()
            const isFull   = selected.size >= group.selectQty
            return (
              <div key={gi} className="px-5 pb-4 sm:px-8">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-sm font-bold text-neutral-900">{group.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                      Required
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isFull ? 'bg-amber-400 text-neutral-900' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      Select {group.selectQty}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
                  {group.options.map((opt) => {
                    const isSelected = selected.has(opt.id)
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          isSelected ? 'bg-amber-50' : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isSelected ? 'border-amber-500 bg-amber-500' : 'border-neutral-300'
                        }`}>
                          {isSelected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                        </div>

                        <span className="flex-1 text-sm font-medium text-neutral-800">{opt.name}</span>

                        <button
                          onClick={() => toggleGroupOption(gi, opt.id, group.selectQty)}
                          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400 text-neutral-900'
                              : 'border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                          }`}
                        >
                          {isSelected ? (
                            <>Added <X size={10} /></>
                          ) : (
                            <>Add <Plus size={10} /></>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {!isDeal && product.options.length > 0 && (
            <div className="px-5 pb-4 sm:px-8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 sm:text-xs">Select Size</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.options.map((opt) => {
                  const sizeMeta   = product.sizes?.find((s) => s.sizeName === opt)
                  const priceBadge = sizeMeta ? ` · Rs.${sizeMeta.price.toLocaleString()}` : ''
                  return (
                    <button key={opt} onClick={() => setSelectedOption(opt)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors sm:px-4 sm:py-1.5 sm:text-xs ${
                        selectedOption === opt
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                      }`}>
                      {opt}{priceBadge}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="px-5 pb-4 sm:px-8">
            <label className="mb-2 block text-sm font-semibold text-neutral-900">Special Instructions</label>
            <textarea value={instructions}
              onChange={(e) => { if (e.target.value.length <= 500) setInstructions(e.target.value) }}
              placeholder="Any special requests or notes…"
              rows={4}
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors" />
            <p className="mt-1 text-right text-[11px] text-neutral-400">{instructions.length}/500</p>
          </div>

          {/* ── FOOTER ───────────────────────────────────────────── */}
          {hasPrice && isOrderable ? (
            <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-100 bg-white px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-1.5 py-1.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={qty <= 1 ? 'Remove' : 'Decrease'}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9 ${
                    qty <= 1 ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}>
                  {qty <= 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                </button>
                <span className="w-5 text-center text-sm font-bold text-neutral-900">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-black transition-colors sm:h-9 sm:w-9">
                  <Plus size={15} />
                </button>
              </div>
              <button onClick={handleAdd}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all sm:px-8 ${
                  added ? 'bg-green-600' : 'bg-neutral-900 hover:bg-black'
                }`}>
                <span>{added ? 'Added!' : `Rs. ${total.toLocaleString()}`}</span>
                {!added && (
                  <>
                    <span className="text-white/40">|</span>
                    <span>Add to Cart</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

          ) : hasPrice && isDeal && !isAvailableNow ? (
            <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-100 bg-white px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white sm:px-8">
                <span>Rs. {unitPrice.toLocaleString()}</span>
                <span className="text-white/40">|</span>
                <span>Available {dealMeta?.timeWindow ?? 'at specific hours'}</span>
              </div>
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
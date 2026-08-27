'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'

export interface SizeMeta {
  sizeId: number                  // size_prices.id — cart variantId PK
  sizeFk: number                  // size_prices.size — Size table FK
  sizeName: string                // size_prices.size_name e.g. "Large"
  price: number                   // size_prices.price (after discount)
  originalPrice?: number          // derived from size_prices.discount
  discountLabel?: string          // e.g. "20% OFF" or "Save 20"
  hasDiscountTag?: boolean        // whether to render a discount badge for this size
}

export interface ProductData {
  id: string
  productId: number | null   // null = display-only (Dish), not orderable
  name: string
  description: string
  price: string              // price_at_branch or front_price — '' means "no price set"
                             // When size_prices exist this is the *default/first* size price.
  originalPrice?: string
  fromLabel?: boolean
  options: string[]          // size names (size_prices.size_name) OR legacy option names
  tag?: string
  discount?: string          // item-level discount label (or default size discount)
  image: string
  // Size-level metadata — populated when menu API returns size_prices[] on an Item.
  // NOTE: size selection UI lives only in ProductDetailModal — the card always
  // shows the default (first) size's price and never lets the user switch here.
  sizes?: SizeMeta[]
  // Deal metadata — set when this card represents a Fixed Deal or On Spot Deal
  dealType?: 'fixed_deal' | 'on_spot_deal'
  dealMeta?: {
    dealId: number
    finalPrice: string
    timeWindow?: string | null      // "HH:MM – HH:MM" for on_spot
    groups?: { name: string; selectQty: number; optionNames: string[] }[]
    isAvailableNow?: boolean
  }
}

interface ProductCardProps {
  product: ProductData
  onOpen?: (product: ProductData) => void
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart()
  const [added, setAdded] = useState(false)

  // Default size is always the first one — no in-card size switching.
  const hasSizes = !!product.sizes && product.sizes.length > 0
  const defaultSize = hasSizes ? product.sizes![0]! : undefined
  const defaultOption = product.options[0] ?? ''

  const displayPriceNum = defaultSize
    ? defaultSize.price
    : (parseInt(product.price, 10) || 0)
  const displayPriceStr = String(displayPriceNum)
  const displayOriginal = defaultSize
    ? (defaultSize.originalPrice != null ? String(defaultSize.originalPrice) : undefined)
    : product.originalPrice
  const displayDiscount = defaultSize
    ? (defaultSize.hasDiscountTag ? defaultSize.discountLabel : undefined)
    : product.discount

  const hasPrice    = displayPriceStr !== '' && displayPriceNum > 0
  const isOrderable = hasPrice && product.productId !== null && product.productId !== undefined
  const price       = displayPriceNum

  const cartItem = items.find(
    (i) => i.id === product.id && (i.selectedOption ?? '') === (defaultOption ?? '')
  )
  const cartQty = cartItem?.quantity ?? 0

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOrderable) return
    addItem({
      id:             product.id,
      productId:      product.productId,
      name:           product.name,
      price,
      image:          product.image,
      selectedOption: defaultOption || undefined,
      variantId:      defaultSize ? defaultSize.sizeId : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (cartItem) updateQuantity(cartItem, cartItem.quantity + 1)
  }

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!cartItem) return
    if (cartItem.quantity <= 1) removeItem(cartItem)
    else updateQuantity(cartItem, cartItem.quantity - 1)
  }

  return (
    <div
      onClick={() => onOpen?.(product)}
      className={`group relative flex items-stretch gap-2 overflow-hidden rounded-2xl bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:gap-4 sm:p-4 ${onOpen ? 'cursor-pointer' : ''}`}
    >
      {/* Left: text content */}
      <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
        <div>
          {/* Deal type badge */}
          {product.dealType && (
            <span className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:text-[10px] ${
              product.dealType === 'on_spot_deal'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-sky-100 text-sky-700'
            }`}>
              {product.dealType === 'on_spot_deal' ? '⚡ On Spot Deal' : '🎁 Fixed Deal'}
            </span>
          )}
          <h3 className="text-base font-bold text-neutral-900 leading-snug sm:text-lg">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400 sm:mt-2 sm:text-sm">
              {product.description}
            </p>
          )}
          {/* On Spot time window */}
          {product.dealMeta?.timeWindow && (
            <p className="mt-1 text-[10px] font-medium text-amber-600 sm:text-xs">
              🕐 {product.dealMeta.timeWindow}
              {product.dealMeta.isAvailableNow === false && (
                <span className="ml-1 text-neutral-400">(not available now)</span>
              )}
            </p>
          )}
          {/* Choice groups summary */}
          {product.dealMeta?.groups && product.dealMeta.groups.length > 0 && (
            <p className="mt-1 text-[10px] text-neutral-500 sm:text-xs">
              {product.dealMeta.groups.map((g) => `${g.name} (pick ${g.selectQty})`).join(' • ')}
            </p>
          )}
        </div>

        {/* Price */}
        {isOrderable && (
          <div className="mt-2 flex items-baseline gap-1.5 sm:mt-3 sm:gap-2">
            {product.fromLabel && (
              <span className="text-xs text-neutral-500 sm:text-sm">From</span>
            )}
            {displayOriginal && (
              <span className="text-xs text-neutral-400 line-through sm:text-sm">
                Rs.{parseInt(displayOriginal, 10).toLocaleString()}
              </span>
            )}
            <span className="text-base font-bold text-neutral-900 sm:text-lg">
              Rs. {price.toLocaleString()}
            </span>
          </div>
        )}
        {/* Deal non-orderable price display */}
        {!isOrderable && product.dealMeta && (
          <div className="mt-2 flex items-baseline gap-1.5 sm:mt-3 sm:gap-2">
            {product.dealMeta.finalPrice && parseFloat(product.dealMeta.finalPrice) !== parseFloat(product.price) && (
              <span className="text-xs text-neutral-400 line-through sm:text-sm">
                Rs.{Math.round(parseFloat(product.price)).toLocaleString()}
              </span>
            )}
            <span className="text-base font-bold text-neutral-900 sm:text-lg">
              Rs. {Math.round(parseFloat(product.dealMeta.finalPrice)).toLocaleString()}
            </span>
          </div>
        )}

        {/* Cart controls (only shown once added, since + sits on image otherwise) */}
        {isOrderable && cartQty > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2 flex w-fit items-center gap-1.5 rounded-full border-2 border-[#000000] px-1.5 py-1 sm:gap-2 sm:px-2 sm:py-1"
          >
            <button
              onClick={handleDecrease}
              aria-label="Decrease"
              className="flex h-6 w-6 items-center justify-center rounded-full text-[#000000] hover:bg-[#000000]/10 transition-colors sm:h-7 sm:w-7"
            >
              <Minus size={12} className="sm:hidden" />
              <Minus size={14} className="hidden sm:block" />
            </button>
            <span className="w-5 text-center text-xs font-bold text-neutral-900 sm:w-6 sm:text-sm">
              {cartQty}
            </span>
            <button
              onClick={handleIncrease}
              aria-label="Increase"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#000000] text-white hover:bg-[#1f1f1f] transition-colors sm:h-7 sm:w-7"
            >
              <Plus size={12} className="sm:hidden" />
              <Plus size={14} className="hidden sm:block" />
            </button>
          </div>
        )}
      </div>

      {/* Right: image with overlapping + button and discount tag */}
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-50 sm:h-36 sm:w-36 md:h-40 md:w-40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {product.tag && (
          <span className="absolute left-1.5 top-1.5 rounded bg-white px-2 py-0.5 text-[9px] font-bold text-neutral-900 shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]">
            {product.tag}
          </span>
        )}
        {displayDiscount && (
          <span className="absolute right-1.5 top-1.5 rounded bg-[#f2c14e] px-2 py-0.5 text-[9px] font-bold text-neutral-900 shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]">
            {displayDiscount}
          </span>
        )}
        {!isOrderable && !product.dealMeta && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-neutral-700 shadow">
              Coming Soon
            </span>
          </span>
        )}

        {/* Overlapping ADD (+) button — bottom-right corner of image */}
        {isOrderable && cartQty === 0 && (
          <button
            onClick={handleAdd}
            aria-label="Add to cart"
            className={`absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all sm:h-9 sm:w-9 ${
              added ? 'bg-green-600 text-white' : 'bg-[#000000] text-white hover:bg-[#1f1f1f]'
            }`}
          >
            {added ? (
              <Check size={16} />
            ) : (
              <Plus size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
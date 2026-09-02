'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Minus, Plus } from 'lucide-react'
import { useCart, useStoreSettings } from '@/lib/hooks/useCart'

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
    isAvailableNow?: boolean
    includedItems?: { name: string; qty: number }[]   // fixed_deal items_detail
    groups?: {                                         // on_spot groups_detail
      name: string
      isRequired: boolean
      selectQty: number
      options: {
        id: number | null      // null for addon_items options
        name: string
        qty: number
        maxQty: number | null  // null = capped only by group's selectQty
      }[]
    }[]
  }
}

interface ProductCardProps {
  product: ProductData
  onOpen?: (product: ProductData) => void
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart()
  const { settings } = useStoreSettings()
  const [added, setAdded] = useState(false)

  // ─── Visual overrides from settings ──────────────────────────────────────
  const priceBg = settings.item_price_background
  const priceFg = settings.item_price_text_color
  const priceBorder = settings.item_price_border_color
  const discountBg = settings.discount_background_color
  const discountFg = settings.discount_text_color
  const stackTagBg = settings.stack_tag_background_color
  const stackTagFg = settings.stack_tag_color
  const priceRoundedCenter = Boolean(settings.price_rounder_center)
  const showStackTag = Boolean(settings.show_stack_tag_on_item)
  // If item not available and policy is 'hide' — bail out completely
  if (!product.productId && !product.dealMeta && settings.if_item_not_available === 'hide') {
    return null
  }

  // Default size is always the first one — no in-card size switching.
  const hasSizes = !!product.sizes && product.sizes.length > 0
  const defaultSize = hasSizes ? product.sizes![0]! : undefined
  const defaultOption = product.options[0] ?? ''

  // Quick-add only works when there's nothing to choose — a single size/option
  // and no deal groups. Anything requiring a choice must go through the modal.
  const needsSelection =
    !!product.dealMeta ||
    (hasSizes && product.sizes!.length > 1) ||
    (!hasSizes && product.options.length > 1)

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

  const cartItem = items.find((i) =>
    hasSizes
      ? i.id === product.id && i.variantId === defaultSize!.sizeId
      : i.id === product.id && (i.selectedOption ?? '') === (defaultOption ?? '')
  )
  const cartQty = cartItem?.quantity ?? 0

  const handleCardClick = () => onOpen?.(product)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOrderable) return
    if (needsSelection) {
      onOpen?.(product)
      return
    }
    addItem({
      id:             product.id,
      productId:      product.productId,
      name:           product.name,
      price,
      image:          product.image,
      selectedOption: defaultOption || undefined,
      variantId:      defaultSize ? defaultSize.sizeId : undefined,
      sizeFk:         defaultSize ? defaultSize.sizeFk : undefined,
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
      onClick={handleCardClick}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onOpen(product)
        }
      }}
      className={`group relative flex h-full items-stretch gap-2 overflow-hidden rounded-2xl bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:gap-4 sm:p-4 ${
        onOpen ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2' : ''
      }`}
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
              {product.dealType === 'on_spot_deal' ? '⚡ On Spot Deal' : 'Fixed Deal'}
            </span>
          )}
          <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2 sm:text-lg">
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
        </div>

        {/* Price */}
        {isOrderable && (
          <div className={`mt-2 flex items-baseline gap-1.5 sm:mt-3 sm:gap-2 ${
            priceRoundedCenter ? 'justify-center rounded-2xl px-3 py-2 border' : ''
          }`} style={{
            ...(priceRoundedCenter && priceBg ? { backgroundColor: priceBg } : {}),
            ...(priceRoundedCenter && priceFg ? { color: priceFg } : {}),
            ...(priceRoundedCenter && priceBorder ? { borderColor: priceBorder } : {}),
            ...(priceRoundedCenter && !priceBorder ? { borderColor: 'rgba(0,0,0,0.08)' } : {}),
          }}>
            {product.fromLabel && (
              <span className={`text-xs sm:text-sm ${priceFg ? '' : 'text-neutral-500'}`}
                style={priceFg ? { color: priceFg, opacity: 0.85 } : undefined}>
                From
              </span>
            )}
            {displayOriginal && (
              <span className={`text-xs line-through sm:text-sm ${priceFg ? '' : 'text-neutral-400'}`}
                style={priceFg ? { color: priceFg, opacity: 0.55 } : undefined}>
                Rs.{parseInt(displayOriginal, 10).toLocaleString()}
              </span>
            )}
            <span className={`text-base font-bold sm:text-lg ${priceFg ? '' : 'text-neutral-900'}`}
              style={priceFg ? { color: priceFg } : undefined}>
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
        {isOrderable && !needsSelection && cartQty > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2 flex w-fit items-center gap-1.5 rounded-full border-2 border-neutral-900 px-1.5 py-1 sm:gap-2 sm:px-2 sm:py-1"
          >
            <button
              type="button"
              onClick={handleDecrease}
              aria-label="Decrease quantity"
              className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-900/10 transition-colors sm:h-7 sm:w-7"
            >
              <Minus size={12} className="sm:hidden" />
              <Minus size={14} className="hidden sm:block" />
            </button>
            <span className="w-5 text-center text-xs font-bold text-neutral-900 sm:w-6 sm:text-sm">
              {cartQty}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase quantity"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors sm:h-7 sm:w-7"
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
          sizes="(min-width: 768px) 160px, (min-width: 640px) 144px, 112px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {product.tag && showStackTag ? (
          <span
            className="absolute left-1.5 top-1.5 rounded px-2 py-0.5 text-[9px] font-bold shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]"
            style={{
              backgroundColor: stackTagBg || '#ffffff',
              color: stackTagFg || '#000000',
            }}
          >
            {product.tag}
          </span>
        ) : product.tag && !showStackTag ? (
          <span className="absolute left-1.5 top-1.5 rounded bg-white px-2 py-0.5 text-[9px] font-bold text-neutral-900 shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]">
            {product.tag}
          </span>
        ) : null}
        {displayDiscount && (
          <span
            className="absolute right-1.5 top-1.5 rounded px-2 py-0.5 text-[9px] font-bold shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]"
            style={{
              backgroundColor: discountBg || '#f2c14e',
              color: discountFg || '#000000',
            }}
          >
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

        {/* Overlapping ADD (+) button — bottom-right corner of image.
           Opens the modal instead of adding directly when a choice is needed. */}
        {isOrderable && (needsSelection || cartQty === 0) && (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={needsSelection ? 'Choose options' : 'Add to cart'}
            className={`absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all sm:h-9 sm:w-9 ${
              added ? 'bg-green-600 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {added ? <Check size={16} /> : <Plus size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}
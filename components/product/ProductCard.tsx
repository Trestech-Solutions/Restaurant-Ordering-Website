'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'

export interface ProductData {
  id: string
  productId: number | null   // null = display-only (Dish), not orderable
  name: string
  description: string
  price: string              // price_at_branch or front_price — '' means "no price set"
  originalPrice?: string
  fromLabel?: boolean
  options: string[]
  tag?: string
  discount?: string
  image: string
}

interface ProductCardProps {
  product: ProductData
  onOpen?: (product: ProductData) => void
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart()
  const [selectedOption, setSelectedOption] = useState<string>(product.options[0] ?? '')
  const [added, setAdded] = useState(false)

  const hasPrice    = product.price !== '' && product.price !== undefined && product.price !== null
  const isOrderable = hasPrice &&
                       product.productId !== null && product.productId !== undefined
  const price       = hasPrice ? (parseInt(product.price, 10) || 0) : 0

  const cartItem = items.find(
    (i) => i.id === product.id && (i.selectedOption ?? '') === (selectedOption ?? '')
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
      selectedOption: selectedOption || undefined,
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

  const handleOptionClick = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation()
    setSelectedOption(opt)
  }

  return (
    <div
      onClick={() => onOpen?.(product)}
      className={`group relative flex items-stretch gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:gap-4 sm:p-4 ${onOpen ? 'cursor-pointer' : ''}`}
    >
      {/* Left: text content */}
      <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
        <div>
          <h3 className="text-base font-bold text-neutral-900 leading-snug sm:text-lg">
            {product.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400 sm:mt-2 sm:text-sm">
            {product.description}
          </p>
        </div>

        {/* Options */}
        {product.options.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
            {product.options.map((opt) => (
              <button
                key={opt}
                onClick={(e) => handleOptionClick(e, opt)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors sm:px-3.5 sm:py-1 sm:text-xs ${
                  selectedOption === opt
                    ? 'border-[#000000] bg-[#000000] text-white'
                    : 'border-neutral-300 text-neutral-600 hover:border-[#000000] hover:text-[#000000]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Price */}
        {isOrderable && (
          <div className="mt-2 flex items-baseline gap-1.5 sm:mt-3 sm:gap-2">
            {product.fromLabel && (
              <span className="text-xs text-neutral-500 sm:text-sm">From</span>
            )}
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through sm:text-sm">
                Rs.{product.originalPrice}
              </span>
            )}
            <span className="text-base font-bold text-neutral-900 sm:text-lg">
              Rs. {price.toLocaleString()}
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
        {product.discount && (
          <span className="absolute right-1.5 top-1.5 rounded bg-[#f2c14e] px-2 py-0.5 text-[9px] font-bold text-neutral-900 shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]">
            {product.discount}
          </span>
        )}
        {!isOrderable && (
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
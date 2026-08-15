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
  price: string              // price_at_branch or front_price
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

  const isOrderable = product.productId !== null && product.productId !== undefined
  const price       = parseInt(product.price, 10) || 0

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
      className={`group overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-sm transition-all duration-300 hover:border-[#c8102e] hover:shadow-xl ${onOpen ? 'cursor-pointer' : ''}`}
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden sm:h-48 md:h-52 lg:h-56">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-2 top-2 rounded bg-[#f7c948] px-2 py-0.5 text-[10px] font-bold text-neutral-900 sm:px-2.5 sm:py-1 sm:text-[11px]">
            {product.tag}
          </span>
        )}
        {product.discount && (
          <span className="absolute right-2 top-2 rounded bg-[#c8102e] px-2 py-0.5 text-[10px] font-bold text-white sm:px-2.5 sm:py-1 sm:text-[11px]">
            {product.discount}
          </span>
        )}
        {!isOrderable && (
          <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-neutral-700">
              Coming Soon
            </span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col items-center px-3 pb-5 pt-3 text-center flex-1 sm:px-5 sm:pb-6 sm:pt-4">
        <h3 className="text-base font-bold text-neutral-900 leading-snug sm:text-lg">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500 sm:mt-2 sm:text-sm">
          {product.description}
        </p>

        {/* Options */}
        {product.options.length > 0 && (
          <div className="mt-3 min-h-[28px] flex flex-wrap justify-center gap-1.5 sm:mt-4 sm:gap-2">
            {product.options.map((opt) => (
              <button
                key={opt}
                onClick={(e) => handleOptionClick(e, opt)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors sm:px-3.5 sm:py-1 sm:text-xs ${
                  selectedOption === opt
                    ? 'border-[#c8102e] bg-[#c8102e] text-white'
                    : 'border-neutral-300 text-neutral-600 hover:border-[#c8102e] hover:text-[#c8102e]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Price */}
        {isOrderable && (
          <div className="mt-3.5 flex items-baseline justify-center gap-1.5 sm:mt-5 sm:gap-2">
            {product.fromLabel && <span className="text-xs text-neutral-500 sm:text-sm">From</span>}
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through sm:text-sm">
                Rs. {product.originalPrice}
              </span>
            )}
            <span className="text-sm font-bold text-neutral-900 sm:text-base">
              Rs. {price.toLocaleString()}
            </span>
          </div>
        )}

        {/* Cart controls */}
        {isOrderable && (
          cartQty > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex items-center gap-1.5 rounded-full border-2 border-[#c8102e] px-1.5 py-1 sm:mt-4 sm:gap-2 sm:px-2 sm:py-1"
            >
              <button onClick={handleDecrease} aria-label="Decrease"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[#c8102e] hover:bg-[#c8102e]/10 transition-colors sm:h-7 sm:w-7">
                <Minus size={12} className="sm:hidden" />
                <Minus size={14} className="hidden sm:block" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-neutral-900 sm:w-6 sm:text-sm">{cartQty}</span>
              <button onClick={handleIncrease} aria-label="Increase"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c8102e] text-white hover:bg-[#a80d26] transition-colors sm:h-7 sm:w-7">
                <Plus size={12} className="sm:hidden" />
                <Plus size={14} className="hidden sm:block" />
              </button>
            </div>
          ) : (
            <button onClick={handleAdd}
              className={`mt-3 flex items-center justify-center gap-1.5 rounded-full px-7 py-2 text-xs font-bold transition-all sm:mt-4 sm:gap-2 sm:px-10 sm:py-2.5 sm:text-sm ${
                added ? 'bg-green-600 text-white' : 'bg-[#c8102e] text-white hover:bg-[#a80d26]'
              }`}
            >
              {added ? (
                <><Check size={13} className="sm:hidden" /><Check size={15} className="hidden sm:block" />Added!</>
              ) : 'ADD'}
            </button>
          )
        )}
      </div>
    </div>
  )
}

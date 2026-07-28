'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'

export interface ProductData {
  id: string
  name: string
  description: string
  price: string
  originalPrice?: string
  fromLabel?: boolean
  options: string[]
  tag?: string
  discount?: string
  image: string
}

interface ProductCardProps {
  product: ProductData
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [selectedOption, setSelectedOption] = useState<string>(product.options[0] ?? '')
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseInt(product.price, 10),
      image: product.image,
      selectedOption: selectedOption || undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-sm transition-all duration-300 hover:border-[#c8102e] hover:shadow-xl">
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
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

      {/* Body */}
      <div className="flex flex-col items-center px-5 pb-6 pt-4 text-center">
        <h3 className="text-lg font-bold text-neutral-900 leading-snug">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {product.description}
        </p>

        {/* Size / option selector */}
        {product.options.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {product.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${
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

        {/* Price row */}
        <div className="mt-5 flex items-baseline justify-center gap-2">
          {product.fromLabel && (
            <span className="text-sm text-neutral-500">From</span>
          )}
          {product.originalPrice && (
            <span className="text-sm text-neutral-400 line-through">
              Rs. {product.originalPrice}
            </span>
          )}
          <span className="text-base font-bold text-neutral-900">
            Rs. {product.price}
          </span>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          className={`mt-4 flex items-center justify-center gap-2 rounded-full px-10 py-2.5 text-sm font-bold transition-all ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-[#c8102e] text-white hover:bg-[#a80d26]'
          }`}
        >
          {added ? (
            <>
              <Check size={15} />
              Added!
            </>
          ) : (
            'ADD'
          )}
        </button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'

export interface ProductData {
  id: string
  name: string
  description: string
  price: string          // e.g. "1148"
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

    // Brief "added" feedback
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-2 top-2 rounded bg-[#f7c948] px-2 py-0.5 text-[10px] font-bold text-neutral-900">
            {product.tag}
          </span>
        )}
        {product.discount && (
          <span className="absolute right-2 top-2 rounded bg-[#c8102e] px-2 py-0.5 text-[10px] font-bold text-white">
            {product.discount}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-neutral-900 leading-snug">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
          {product.description}
        </p>

        {/* Size / option selector */}
        {product.options.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
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
        <div className="mt-3 flex items-baseline gap-2">
          {product.fromLabel && (
            <span className="text-xs text-neutral-500">From</span>
          )}
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">
              Rs. {product.originalPrice}
            </span>
          )}
          <span className="text-sm font-bold text-neutral-900">
            Rs. {product.price}
          </span>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
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
            <>
              <Plus size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}

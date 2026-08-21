'use client'

import { useState } from 'react'
import { ProductCard, type ProductData } from './ProductCard'
import { ProductDetailModal } from './ProductDetailModal'
import { ShoppingBag } from 'lucide-react'

interface ProductGridProps {
  products: ProductData[]
  searchQuery: string
}

export function ProductGrid({ products, searchQuery }: ProductGridProps) {
  const [selected, setSelected] = useState<ProductData | null>(null)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center sm:py-20">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 sm:mb-4 sm:h-16 sm:w-16">
          <ShoppingBag size={22} className="text-neutral-400 sm:hidden" />
          <ShoppingBag size={28} className="text-neutral-400 hidden sm:block" />
        </div>
        <p className="font-semibold text-neutral-700 text-sm sm:text-base">No products found</p>
        <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
          {searchQuery ? `No results for "${searchQuery}"` : 'No products in this category yet'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={setSelected} />
        ))}
      </div>

      {selected && (
        <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
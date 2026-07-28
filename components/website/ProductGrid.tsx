'use client'

import { ProductCard, type ProductData } from './ProductCard'
import { ShoppingBag } from 'lucide-react'

interface ProductGridProps {
  products: ProductData[]
  searchQuery: string
}

export function ProductGrid({ products, searchQuery }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingBag size={28} className="text-neutral-400" />
        </div>
        <p className="font-semibold text-neutral-700">No products found</p>
        <p className="mt-1 text-sm text-neutral-400">
          {searchQuery
            ? `No results for "${searchQuery}"`
            : 'No products in this category yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

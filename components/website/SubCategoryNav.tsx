'use client'

import type { SubCategory } from '@/lib/data/website-products'

interface SubCategoryNavProps {
  subCategories: SubCategory[]
  activeSubCategoryId: string
  onSelect: (subCategoryId: string) => void
}

export function SubCategoryNav({ subCategories, activeSubCategoryId, onSelect }: SubCategoryNavProps) {
  return (
    <div className="bg-white py-4 sticky top-[120px] z-20">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex justify-center gap-3 overflow-x-auto scrollbar-hide">
          {subCategories.map((sub) => {
            const isActive = sub.id === activeSubCategoryId
            return (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className={`shrink-0 rounded-xl px-6 py-3 text-base font-bold transition-all ${
                  isActive
                    ? 'bg-[#f7c948] text-neutral-900'
                    : 'bg-[#fdf1d3] text-[#c8102e]'
                }`}
              >
                {sub.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
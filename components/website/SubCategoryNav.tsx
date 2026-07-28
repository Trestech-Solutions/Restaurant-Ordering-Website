'use client'

import type { SubCategory } from '@/lib/data/website-products'

interface SubCategoryNavProps {
  subCategories: SubCategory[]
  activeSubCategoryId: string
  onSelect: (subCategoryId: string) => void
}

export function SubCategoryNav({ subCategories, activeSubCategoryId, onSelect }: SubCategoryNavProps) {
  return (
    <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm py-3 sticky top-0 z-10">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {subCategories.map((sub) => {
            const isActive = sub.id === activeSubCategoryId
            return (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className={`shrink-0 rounded-full px-5 py-1.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#f7c948] text-neutral-900 shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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

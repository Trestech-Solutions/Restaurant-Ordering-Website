'use client'

import { Icon } from '@iconify/react'
import type { Category } from '@/lib/data/website-products'

interface CategoryNavProps {
  categories: Category[]
  activeCategoryId: string
  onSelect: (categoryId: string) => void
}

export function CategoryNav({ categories, activeCategoryId, onSelect }: CategoryNavProps) {
  return (
    <nav className="bg-[#c8102e] sticky top-0 z-30">
      <div className="mx-auto flex max-w-[1400px] overflow-x-auto scrollbar-hide">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`relative flex flex-1 min-w-[130px] flex-col items-center justify-center gap-2 px-4 py-5 text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-[#f7c948] text-neutral-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {cat.badge && (
                <span className="absolute left-0 top-0 rounded-br-md bg-white px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-[#c8102e]">
                  {cat.badge}
                </span>
              )}
              <Icon icon={cat.icon} width={48} height={48} />
              <span className="text-center leading-tight whitespace-nowrap">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
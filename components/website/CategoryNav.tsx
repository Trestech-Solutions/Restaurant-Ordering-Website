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
    <nav className="bg-[#c8102e]">
      <div className="mx-auto flex max-w-[1400px] overflow-x-auto scrollbar-hide">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`relative flex flex-1 min-w-[100px] flex-col items-center gap-2 px-3 py-4 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-[#f7c948] text-neutral-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {cat.badge && (
                <span className="absolute left-1 top-1 rounded bg-white px-1 py-0.5 text-[8px] font-bold text-[#c8102e]">
                  {cat.badge}
                </span>
              )}
              <Icon icon={cat.icon} width={32} height={32} />
              <span className="text-center leading-tight whitespace-nowrap">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

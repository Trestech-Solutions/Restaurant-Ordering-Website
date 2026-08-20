'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'

type CategoryIcon = { type: 'image'; value: string } | { type: 'iconify'; value: string }

interface CategoryNavProps {
  categories: {
    id: string
    label: string
    icon: CategoryIcon
    badge?: string
  }[]
  activeCategoryId: string
  onSelect: (categoryId: string) => void
}

export function CategoryNav({ categories, activeCategoryId, onSelect }: CategoryNavProps) {
  return (
    <nav className="bg-black sticky top-0 z-30">
      <div className="mx-auto flex max-w-[1400px] overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`snap-start relative flex min-w-[90px] flex-col items-center justify-center gap-1.5 px-2 py-3 text-xs font-bold transition-colors sm:min-w-[110px] sm:gap-2 sm:px-3 sm:py-4 sm:text-sm md:min-w-[130px] md:px-4 md:py-5 md:text-base ${
                isActive
                  ? 'bg-[#ffffff] text-neutral-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {cat.badge && (
                <span className="absolute left-0 top-0 rounded-br-md bg-[#ffffff] px-1 py-0.5 text-[8px] font-extrabold uppercase text-black sm:px-1.5 sm:py-0.5 sm:text-[9px]">
                  {cat.badge}
                </span>
              )}

              <div className="relative flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10 md:h-12 md:w-12">
                {cat.icon.type === 'image' ? (
                  <Image
                    src={cat.icon.value}
                    alt={cat.label}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                ) : (
                  <Icon icon={cat.icon.value} width="100%" height="100%" />
                )}
              </div>

              <span className="text-center leading-tight whitespace-nowrap">
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
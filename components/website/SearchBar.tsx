'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search products...' }: SearchBarProps) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-6 md:px-8">
      <div className="flex items-center overflow-hidden rounded-full border border-neutral-300 bg-white shadow-sm transition-shadow focus-within:shadow-md focus-within:border-[#c8102e]">
        <Search className="ml-4 h-4 w-4 shrink-0 text-neutral-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="mr-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
        <button
          aria-label="Search"
          className="mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c8102e] text-white hover:bg-[#a80d26] transition-colors"
        >
          <Search size={15} />
        </button>
      </div>
    </div>
  )
}

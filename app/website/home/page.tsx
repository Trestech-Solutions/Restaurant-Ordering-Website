'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { CategoryNav } from '@/components/website/CategoryNav'
import { SubCategoryNav } from '@/components/website/SubCategoryNav'
import { SearchBar } from '@/components/website/SearchBar'
import { ProductGrid } from '@/components/website/ProductGrid'
import { CATEGORIES, ALL_PRODUCTS } from '@/lib/data/website-products'

const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: 'https://assets.indolj.io/upload/1780653167-Mango---Webslider-jpg.jpeg?ver=10',
    title: "mango"

  },
  {
    id: 'slide-2',
    image: 'https://assets.indolj.io/upload/1780130149-Sweet2-jpg.jpeg?ver=10',
    title: "mango"
  },
]

export default function HomePage() {
  const { branch } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id)
  const [activeSubCategoryId, setActiveSubCategoryId] = useState(CATEGORIES[0].subCategories[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((index + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])

  const handleCategoryChange = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId)!
    setActiveCategoryId(catId)
    setActiveSubCategoryId(cat.subCategories[0].id)
    setSearchQuery('')
  }

  const handleSubCategoryChange = (subId: string) => {
    setActiveSubCategoryId(subId)
    setSearchQuery('')
  }

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategoryId)!,
    [activeCategoryId]
  )

  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => {
      const matchCat    = p.categoryId === activeCategoryId
      const matchSub    = p.subCategoryId === activeSubCategoryId
      const matchBranch = !branch || p.branchIds === '*' || p.branchIds.includes(branch)
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSub && matchBranch && matchSearch
    })
  }, [activeCategoryId, activeSubCategoryId, searchQuery, branch])

  return (
    <div className="min-h-screen font-sans text-neutral-800">
      {/* Hero carousel — responsive height */}
      <section className="relative overflow-hidden h-[30vh] sm:h-[40vh] md:h-[55vh] lg:h-[70vh] xl:h-[80vh]">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image src={s.image} alt={s.title} fill priority={i === 0} className="object-cover object-center" />
          </div>
        ))}

        {/* Prev / Next arrows — responsive sizing */}
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 -translate-y-1/2 items-center justify-center bg-[#f7c948] text-neutral-900 shadow hover:bg-yellow-400 transition-colors"
        >
          <ChevronLeft size={18} className="sm:hidden" />
          <ChevronLeft size={20} className="hidden sm:block md:hidden" />
          <ChevronLeft size={24} className="hidden md:block" />
        </button>
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 -translate-y-1/2 items-center justify-center bg-[#f7c948] text-neutral-900 shadow hover:bg-yellow-400 transition-colors"
        >
          <ChevronRight size={18} className="sm:hidden" />
          <ChevronRight size={20} className="hidden sm:block md:hidden" />
          <ChevronRight size={24} className="hidden md:block" />
        </button>

        {/* Secure payments badge — hide on xs, show sm+ */}
        <div className="absolute bottom-2 right-2 z-20 hidden rounded-md bg-white/95 px-2 py-1 shadow-md sm:bottom-6 sm:right-6 sm:flex sm:flex-col sm:gap-1 sm:px-4 sm:py-2">
          <span className="text-[8px] font-bold tracking-wide text-neutral-700 sm:text-[10px]">SECURE PAYMENTS</span>
          <div className="flex gap-1 sm:gap-2">
            <span className="rounded border border-neutral-300 px-1.5 py-0.5 text-[8px] font-bold text-blue-700 sm:px-2 sm:text-[10px]">VISA</span>
            <span className="rounded border border-neutral-300 px-1.5 py-0.5 text-[8px] font-bold text-orange-600 sm:px-2 sm:text-[10px]">MasterCard</span>
          </div>
        </div>
      </section>

      {/* Category nav — sticks right below hero */}
      <CategoryNav
        categories={CATEGORIES}
        activeCategoryId={activeCategoryId}
        onSelect={handleCategoryChange}
      />

      <SubCategoryNav
        subCategories={activeCategory.subCategories}
        activeSubCategoryId={activeSubCategoryId}
        onSelect={handleSubCategoryChange}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={`Search in ${activeCategory.label}...`}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{activeCategory.label}</h2>
            <p className="text-sm text-neutral-500">
              {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        <ProductGrid products={filteredProducts} searchQuery={searchQuery} />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
        <h3 className="font-serif text-2xl font-bold text-neutral-900 sm:text-3xl">
          Discover the Delightful Range at United King
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600">
          United King is Karachi&apos;s premier bakery, offering a wide selection of cakes,
          sweets, mithai, frozen food and fast food.
        </p>
      </section>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  MapPin, Phone, User, Menu, Search,
  ChevronLeft, ChevronRight, MessageCircle, ArrowUp, ShoppingCart,
} from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { CategoryNav } from '@/components/website/CategoryNav'
import { SubCategoryNav } from '@/components/website/SubCategoryNav'
import { SearchBar } from '@/components/website/SearchBar'
import { ProductGrid } from '@/components/website/ProductGrid'
import { AuthModal } from '@/components/website/AuthModal'
import { CorporateOrderModal } from '@/components/website/CorporateOrderModal'
import { MenuDrawer } from '@/components/website/MenuDrawer'
import { CATEGORIES, ALL_PRODUCTS } from '@/lib/data/website-products'
import { title } from 'process'

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
  const { totalItems, openCart, location } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id)
  const [activeSubCategoryId, setActiveSubCategoryId] = useState(CATEGORIES[0].subCategories[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [corporateModalOpen, setCorporateModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
      const matchCat = p.categoryId === activeCategoryId
      const matchSub = p.subCategoryId === activeSubCategoryId
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSub && matchSearch
    })
  }, [activeCategoryId, activeSubCategoryId, searchQuery])

  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* Topbar */}
      <header className="bg-[#c8102e] text-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2.5 md:px-8">
          <button className="flex items-center gap-2 rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900">
            <MapPin size={16} />
            <span className="text-left leading-tight">
              Change Location<br />
              <span className="font-normal">{location || 'NED University'}</span>
            </span>
          </button>

          <a href="tel:021111022022" className="hidden items-center gap-2 text-sm font-medium sm:flex">
            <Phone size={16} />
            021-111-022-022
          </a>

          <div className="flex flex-1 justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white overflow-hidden">
              <Image
                src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
                alt="United King"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          </div>

          <div className="hidden items-center gap-4 text-sm md:flex">
            <a href="#" onClick={(e) => { e.preventDefault(); setAuthModalOpen(true) }} className="flex items-center gap-1.5 hover:underline">
              <User size={16} />
              Sign in / Register
            </a>
            <span className="text-white/50">|</span>
            <button
              onClick={() => setCorporateModalOpen(true)}
              className="rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900">
              Corporate &amp; Special Event Orders
            </button>
          </div>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative rounded-full p-2 hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f7c948] text-[10px] font-bold text-neutral-900">
                {totalItems}
              </span>
            )}
          </button>

          <button aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
        </div>
      </header>

      {/* Hero carousel — full viewport height minus topbar */}
      <section className="relative overflow-hidden" style={{ height: 'calc(80vh - 57px)' }}>
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

        {/* Prev / Next arrows */}
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-[#f7c948] text-neutral-900 shadow hover:bg-yellow-400 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-[#f7c948] text-neutral-900 shadow hover:bg-yellow-400 transition-colors"
        >
          <ChevronRight size={24} />
        </button>

        {/* Secure payments badge */}
        <div className="absolute bottom-6 right-6 z-20 hidden rounded-md bg-white/95 px-4 py-2 shadow-md sm:flex sm:flex-col sm:gap-1">
          <span className="text-[10px] font-bold tracking-wide text-neutral-700">SECURE PAYMENTS</span>
          <div className="flex gap-2">
            <span className="rounded border border-neutral-300 px-2 py-0.5 text-[10px] font-bold text-blue-700">VISA</span>
            <span className="rounded border border-neutral-300 px-2 py-0.5 text-[10px] font-bold text-orange-600">MasterCard</span>
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

      <footer className="relative bg-[#c8102e] pt-12 text-white rounded-tl-3xl rounded-tr-3xl">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pb-10 md:grid-cols-4 md:px-8">
          <div>
            <div className="mb-3 overflow-hidden rounded-full w-16 h-16 border-2 border-[#f7c948]">
              <Image src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg" alt="United King" width={64} height={64} className="object-contain" />
            </div>
            <p className="text-xs italic text-[#f7c948]">the Food Kingdom</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold">Information</h4>
            <p className="mb-3 text-sm">021-111-022-022</p>
            <ul className="space-y-2 text-sm text-white/90">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Submit Complaint</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
            </ul>
          </div>

          <div className="flex justify-center md:justify-start">
            <div className="h-52 w-28 rounded-2xl border-4 border-neutral-900 bg-neutral-900 shadow-xl sm:h-64 sm:w-36">
              <div className="h-full w-full overflow-hidden rounded-xl bg-white">
                <Image src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
                  alt="App preview" width={144} height={256} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-bold">Get The App!</h4>
            <p className="mb-4 text-sm text-white/90">Easy, Fast and Convenient.</p>
            <div className="flex flex-col gap-2">
              <button className="rounded-md bg-black px-4 py-2 text-left text-xs">Download on App Store</button>
              <button className="rounded-md bg-black px-4 py-2 text-left text-xs">GET IT ON Google Play</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/20 px-4 py-4 text-xs text-white/80 md:px-8">
          <button aria-label="Search" className="rounded-full bg-white/10 p-2"><Search size={16} /></button>
          <p className="text-center">
            Powered by Trestech &nbsp;|&nbsp;
            <a href="#" className="hover:underline">Privacy</a> &nbsp;
            <a href="#" className="hover:underline">Faqs</a>
          </p>
          <button aria-label="Top" className="rounded-full bg-white/10 p-2"><ArrowUp size={16} /></button>
        </div>
      </footer>

      <a href="#" aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform">
        <MessageCircle size={26} fill="white" />
      </a>

      {/* Auth modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onGuestContinue={() => setAuthModalOpen(false)}
        />
      )}

      {/* Corporate order modal */}
      {corporateModalOpen && (
        <CorporateOrderModal onClose={() => setCorporateModalOpen(false)} />
      )}

      {/* Menu drawer */}
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

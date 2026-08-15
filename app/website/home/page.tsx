'use client'

import { useState, useEffect as reactUseEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useCart, useRegisterProductId } from '@/lib/hooks/useCart'
import { useStoreLocation } from '@/lib/hooks/useStoreLocation'
import { CategoryNav } from '@/components/website/CategoryNav'
import { SubCategoryNav } from '@/components/website/SubCategoryNav'
import { SearchBar } from '@/components/website/SearchBar'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CATEGORIES as FALLBACK_CATS, ALL_PRODUCTS as FALLBACK_PRODS, type Category } from '@/lib/data/website-products'
import { useGetMenu } from '@/api/client/browse'
import type { ProductData } from '@/components/product/ProductCard'
import type { MenuResponse, MenuItem } from '@/api/types'

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

const DEFAULT_ICON = 'solar:cup-hot-bold-duotone'
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop'

/**
 * Convert an Item (from the menu API) into a ProductData for the UI.
 * `item.id` is the ID to send as `item` when calling POST /storefront/cart/items/.
 * `price_at_branch` is used when available (branch override), else `front_price`.
 */
function itemToProduct(
  item: MenuItem,
  categoryId: string,
  idPairs: Array<{ clientId: string; numericId: number }>,
  products: (ProductData & { categoryId: string; subCategoryId: string; branchIds: string[] | '*' })[]
) {
  const clientId   = String(item.id)
  const rawPrice   = item.price_at_branch || item.front_price || '0'
  const priceFloat = parseFloat(rawPrice)
  const priceInt   = isNaN(priceFloat) ? 0 : Math.round(priceFloat)

  idPairs.push({ clientId, numericId: item.id })
  products.push({
    id:            clientId,
    productId:     item.id,        // ← this is the `item` field for the cart API
    categoryId,
    subCategoryId: categoryId,
    branchIds:     '*',            // availability is already filtered server-side
    name:          item.name,
    description:   '',
    price:         String(priceInt),
    originalPrice: item.front_price && item.price_at_branch && item.front_price !== item.price_at_branch
      ? String(Math.round(parseFloat(item.front_price)))
      : undefined,
    fromLabel:     false,
    options:       [],
    tag:           undefined,
    discount:      item.item_discount && item.item_discount !== '0.00' ? item.item_discount : undefined,
    image:         item.feature_image || PLACEHOLDER_IMAGE,
  })
}

function transformMenu(menu: MenuResponse | undefined): {
  categories: Category[]
  products: (ProductData & { categoryId: string; subCategoryId: string; branchIds: string[] | '*' })[]
  idPairs: Array<{ clientId: string; numericId: number }>
} {
  const menuArr = menu?.menu ?? menu?.categories ?? []

  if (menuArr.length === 0) {
    const idPairs        = FALLBACK_PRODS.map((p, i) => ({ clientId: p.id, numericId: p.productId ?? i + 1 }))
    const productsWithId = FALLBACK_PRODS.map((p, i) => ({ ...p, productId: p.productId ?? i + 1 }))
    return { categories: FALLBACK_CATS, products: productsWithId, idPairs }
  }

  const products: (ProductData & { categoryId: string; subCategoryId: string; branchIds: string[] | '*' })[] = []
  const idPairs: Array<{ clientId: string; numericId: number }> = []

  const categories: Category[] = menuArr
    .filter((cat) => cat.status !== false && cat.hide_category !== true)
    .map((cat) => {
      const catId = String(cat.id)

      // ── PRIMARY: use `items[]` — Item records injected by MenuView ──────────
      const itemRecords = cat.items ?? []
      if (itemRecords.length > 0) {
        itemRecords
          .filter((it) => it.status !== false && it.status !== 0)
          .forEach((it) => itemToProduct(it, catId, idPairs, products))

        return {
          id:            catId,
          label:         cat.name,
          icon:          typeof cat.icon === 'string' ? cat.icon : DEFAULT_ICON,
          badge:         cat.badge || undefined,
          subCategories: [{ id: catId, label: 'All Items' }],
        }
      }

      // ── FALLBACK A: dish_detail[] — show Dish names as placeholder cards ──
      // These are display-only; they have no price so cannot be added to cart.
      // They will be replaced once Item objects are linked to this category.
      const dishes = cat.dish_detail ?? []
      if (dishes.length > 0) {
        dishes
          .filter((d) => d.status !== false)
          .forEach((d) => {
            const clientId = String(d.id)
            idPairs.push({ clientId, numericId: d.id })
            products.push({
              id:            clientId,
              productId:     null as unknown as number, // no Item ID — not orderable
              categoryId:    catId,
              subCategoryId: catId,
              branchIds:     '*' as const,
              name:          d.name,
              description:   d.description || '',
              price:         '0',              // no price — display only
              options:       [],
              image:         PLACEHOLDER_IMAGE,
            })
          })

        return {
          id:            catId,
          label:         cat.name,
          icon:          typeof cat.icon === 'string' ? cat.icon : DEFAULT_ICON,
          badge:         cat.badge || undefined,
          subCategories: [{ id: catId, label: 'All Items' }],
        }
      }

      // ── FALLBACK: legacy sub_categories shape ─────────────────────────────
      const subCats: Category['subCategories'] = (cat.sub_categories ?? []).map((sc) => {
        const subId = sc.slug || String(sc.id)
        ;(sc.products ?? []).forEach((p) => {
          const clientId   = p.slug || String(p.id)
          const priceFloat = parseFloat(p.base_price || '0')
          const priceInt   = isNaN(priceFloat) ? 0 : Math.round(priceFloat)
          idPairs.push({ clientId, numericId: p.id })
          products.push({
            id: clientId, productId: p.id, categoryId: catId, subCategoryId: subId,
            branchIds: p.branch_ids === '*' || !p.branch_ids ? '*' : (p.branch_ids as (string | number)[]).map(String),
            name: p.name, description: p.description || '',
            price: String(priceInt),
            originalPrice: p.original_price ? String(Math.round(parseFloat(String(p.original_price)))) : undefined,
            fromLabel: !!p.from_label,
            options: (p.options ?? []).map((o) => o.name),
            tag: p.tag || undefined, discount: p.discount || undefined,
            image: p.image || PLACEHOLDER_IMAGE,
          })
        })
        return { id: subId, label: sc.name }
      })

      return {
        id:            catId,
        label:         cat.name,
        icon:          typeof cat.icon === 'string' ? cat.icon : DEFAULT_ICON,
        badge:         cat.badge || undefined,
        subCategories: subCats.length > 0 ? subCats : [{ id: `${catId}-all`, label: 'All Items' }],
      }
    })

  return { categories, products, idPairs }
}

export default function HomePage() {
  const { branch } = useCart()
  const { branchId: reduxBranchId, areaId: reduxAreaId } = useStoreLocation()
  const registerProductId = useRegisterProductId()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Use storeLocationSlice as canonical source for branchId/areaId
  const numericBranch = reduxBranchId ?? (branch ? Number(branch) : null)
  const numericArea   = reduxAreaId

  const { data: menu } = useGetMenu({
    branchId: numericBranch,
    areaId: numericArea,
  })

  const { categories, products, idPairs } = useMemo(() => transformMenu(menu), [menu])

  // Register product IDs after render — never during render
  reactUseEffect(() => {
    idPairs.forEach(({ clientId, numericId }) => registerProductId(clientId, numericId))
  }, [idPairs, registerProductId])

  const [activeCategoryId, setActiveCategoryId] = useState<string>(() =>
    categories[0]?.id ?? FALLBACK_CATS[0].id
  )
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>(() =>
    categories[0]?.subCategories?.[0]?.id ?? FALLBACK_CATS[0].subCategories[0].id
  )

  reactUseEffect(() => {
    if (categories.length === 0) return
    const c = categories.find((cc) => cc.id === activeCategoryId)
    if (!c) {
      setActiveCategoryId(categories[0].id)
      setActiveSubCategoryId(categories[0].subCategories[0].id)
    } else if (!c.subCategories.some((sc) => sc.id === activeSubCategoryId)) {
      setActiveSubCategoryId(c.subCategories[0].id)
    }
  }, [categories, activeCategoryId, activeSubCategoryId])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((index + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  reactUseEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return
    setActiveCategoryId(catId)
    setActiveSubCategoryId(cat.subCategories[0].id)
    setSearchQuery('')
  }

  const handleSubCategoryChange = (subId: string) => {
    setActiveSubCategoryId(subId)
    setSearchQuery('')
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? categories[0] ?? FALLBACK_CATS[0],
    [categories, activeCategoryId]
  )

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat    = p.categoryId === activeCategoryId
      const matchSub    = p.subCategoryId === activeSubCategoryId
      const matchBranch = !numericBranch || p.branchIds === '*' || p.branchIds.includes(String(numericBranch))
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSub && matchBranch && matchSearch
    })
  }, [activeCategoryId, activeSubCategoryId, searchQuery, branch, products])

  return (
    <div className="min-h-screen font-sans text-neutral-800">
      {/* Hero carousel — responsive height */}
      <section className="relative overflow-hidden h-[20vh] sm:h-[40vh] md:h-[55vh] lg:h-[70vh] xl:h-[80vh]">
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
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelect={handleCategoryChange}
      />

      <SubCategoryNav
        subCategories={activeCategory?.subCategories ?? []}
        activeSubCategoryId={activeSubCategoryId}
        onSelect={handleSubCategoryChange}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={`Search in ${activeCategory?.label ?? ''}...`}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{activeCategory?.label ?? ''}</h2>
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

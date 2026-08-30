'use client'

import Image from 'next/image'
import { Clock, Tag, Users } from 'lucide-react'
import { useGetFixedDeals, useGetOnSpotDeals } from '@/api/client/browse'
import type { FixedDeal, OnSpotDeal } from '@/api/types'

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? ''

function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path || path.trim() === '') return undefined
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) {
    const base = MEDIA_BASE
    if (!base) return undefined
    const origin = base.replace(/\/+$/, '').replace(/\/api$/i, '')
    return `${origin}${path}`
  }
  return path
}

function formatPrice(price: string): string {
  const n = parseFloat(price)
  return isNaN(n) ? price : `Rs. ${Math.round(n).toLocaleString()}`
}

function formatValidity(from?: string | null, to?: string | null): string | null {
  if (!from && !to) return null
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  if (from && to) return `${fmt(from)} – ${fmt(to)}`
  return fmt((from || to)!)
}

// ─── Fixed Deal Card ──────────────────────────────────────────────────────────

function FixedDealCard({ deal }: { deal: FixedDeal }) {
  // backend field is feature_image (not image)
  const image    = resolveMediaUrl(deal.feature_image)
  const validity = formatValidity(deal.valid_from_date, deal.valid_to_date)
  const hasDiscount =
    deal.discount && parseFloat(deal.discount) > 0 &&
    deal.final_price !== deal.price

  // item names from nested item_detail (new shape) with fallback to item id
  const itemNames = (deal.items_detail ?? []).map((i) =>
    i.item_detail?.name ?? `Item ${i.item}`
  )

  return (
    <div className="flex-shrink-0 w-56 sm:w-64 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-36 sm:h-40 w-full bg-neutral-100">
        {image ? (
          <Image
            src={image}
            alt={deal.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 224px, 256px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Tag size={32} className="text-neutral-300" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 right-2 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
            DEAL
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <h3 className="text-sm font-bold text-neutral-900 line-clamp-1">{deal.name}</h3>
        {deal.description && (
          <p className="text-[11px] text-neutral-500 line-clamp-2">{deal.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-1.5">
          <div>
            <p className="text-base font-bold text-neutral-900">{formatPrice(deal.final_price)}</p>
            {hasDiscount && (
              <p className="text-[11px] text-neutral-400 line-through">{formatPrice(deal.price)}</p>
            )}
          </div>
          {validity && (
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
              <Clock size={10} /> {validity}
            </span>
          )}
        </div>

        {itemNames.length > 0 && (
          <p className="text-[10px] text-neutral-400 border-t border-neutral-100 pt-1.5 mt-0.5 line-clamp-1">
            Includes: {itemNames.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── On Spot Deal Card ────────────────────────────────────────────────────────

function OnSpotDealCard({ deal }: { deal: OnSpotDeal }) {
  // backend field is feature_image (not image)
  const image    = resolveMediaUrl(deal.feature_image)
  const validity = formatValidity(deal.valid_from_date, deal.valid_to_date)
  const timeWindow =
    deal.start_time && deal.end_time
      ? `${deal.start_time.slice(0, 5)} – ${deal.end_time.slice(0, 5)}`
      : null
  const hasDiscount =
    deal.discount && parseFloat(deal.discount) > 0 &&
    deal.final_price !== deal.price

  // group count — all groups regardless of type
  const groupCount = deal.groups_detail?.length ?? 0

  return (
    <div className="flex-shrink-0 w-56 sm:w-64 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-36 sm:h-40 w-full bg-neutral-100">
        {image ? (
          <Image
            src={image}
            alt={deal.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 224px, 256px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users size={32} className="text-neutral-300" />
          </div>
        )}
        {timeWindow && (
          <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {timeWindow}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 right-2 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
            ON SPOT
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <h3 className="text-sm font-bold text-neutral-900 line-clamp-1">{deal.name}</h3>
        {deal.description && (
          <p className="text-[11px] text-neutral-500 line-clamp-2">{deal.description}</p>
        )}

        {groupCount > 0 && (
          <p className="text-[10px] text-sky-600 font-medium">
            {groupCount} choice group{groupCount > 1 ? 's' : ''}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-1.5">
          <div>
            <p className="text-base font-bold text-neutral-900">{formatPrice(deal.final_price)}</p>
            {hasDiscount && (
              <p className="text-[11px] text-neutral-400 line-through">{formatPrice(deal.price)}</p>
            )}
          </div>
          {validity && (
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
              <Clock size={10} /> {validity}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section skeleton ─────────────────────────────────────────────────────────

function DealsSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-shrink-0 w-56 sm:w-64 rounded-2xl border border-neutral-200 bg-white">
          <div className="h-36 sm:h-40 w-full bg-neutral-100 animate-pulse rounded-t-2xl" />
          <div className="p-3 space-y-2">
            <div className="h-3.5 w-3/4 bg-neutral-200 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-neutral-200 rounded animate-pulse mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main exported component ──────────────────────────────────────────────────

export function DealsSection() {
  const { data: fixedDeals, isLoading: loadingFixed } = useGetFixedDeals()
  const { data: onSpotDeals, isLoading: loadingOnSpot } = useGetOnSpotDeals()

  // status is now int (1=active, 0=inactive) — filter accordingly
  const activeFixed   = (fixedDeals ?? []).filter((d) => d.status === 1)
  const activeOnSpot  = (onSpotDeals ?? []).filter((d) => d.status === 1)
  const hasFixed      = activeFixed.length > 0
  const hasOnSpot     = activeOnSpot.length > 0
  const isLoading     = loadingFixed || loadingOnSpot

  // Don't render if no deals and not loading
  if (!isLoading && !hasFixed && !hasOnSpot) return null

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
      {/* Fixed Deals */}
      {(hasFixed || loadingFixed) && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900">
              <Tag size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">Fixed Deals</h2>
              <p className="text-xs text-neutral-500">Great value bundles</p>
            </div>
          </div>
          {loadingFixed ? (
            <DealsSkeleton />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {activeFixed.map((deal) => (
                <FixedDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* On Spot Deals */}
      {(hasOnSpot || loadingOnSpot) && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">On Spot Deals</h2>
              <p className="text-xs text-neutral-500">Available for limited hours</p>
            </div>
          </div>
          {loadingOnSpot ? (
            <DealsSkeleton />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {activeOnSpot.map((deal) => (
                <OnSpotDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

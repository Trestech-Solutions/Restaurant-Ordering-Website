'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navigation, ChevronDown, X, Loader2 } from 'lucide-react'
import { useCart, type OrderType } from '@/lib/hooks/useCart'
import { useStoreLocation } from '@/lib/hooks/useStoreLocation'
import {
  useGetCities,
  useGetAreasByCity,
  useGetAreaDetail,
  fetchAreaDetail,
  resolveBranchId,
  locate,
} from '@/api/client/browse'
import type { Area, City } from '@/api/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BranchInfo {
  id: string
  numericId: number
  name: string
  address: string
  mapsUrl: string
  lat?: number
  lng?: number
}

export const FALLBACK_BRANCHES: BranchInfo[] = [
  {
    id: '1',
    numericId: 1,
    name: 'United King Maskan',
    address: 'FL 6, Block 7 Gulshan-e-Iqbal, Karachi, Sindh',
    mapsUrl: 'https://maps.google.com/?q=United+King+Maskan+Karachi',
  },
]

export const UK_BRANCHES = FALLBACK_BRANCHES

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R    = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderTypeModalProps {
  onClose: () => void
}

export function OrderTypeModal({ onClose }: OrderTypeModalProps) {
  const {
    orderType, setOrderType, setLocation, setBranch, setAreaId,
  } = useCart()
  const { setStoreLocation } = useStoreLocation()

  // ── Cities (always loaded — no branch filter since branch comes from area) ─
  const { data: cities, isLoading: loadingCities } = useGetCities()
  const cityList: City[] = cities ?? []
  const sortedCities = [...cityList].sort((a, b) => a.name.localeCompare(b.name))

  // ── Local UI state ────────────────────────────────────────────────────────
  const [selectedCityId, setSelectedCityId] = useState<string>('')
  const [selectedAreaId, setSelectedAreaId] = useState<string>('')
  const [geoLoading,    setGeoLoading]    = useState(false)
  const [geoError,      setGeoError]      = useState('')
  const [confirming,    setConfirming]    = useState(false)

  const selectedCityObj = sortedCities.find((c) => String(c.id) === selectedCityId)

  // ── Areas — loaded only when a city is selected ───────────────────────────
  const {
    data: cityAreas,
    isLoading: loadingCityAreas,
  } = useGetAreasByCity({
    cityId: selectedCityId || null,
  })

  const areaList: Area[] = cityAreas ?? []
  const selectedAreaObj = areaList.find((a) => String(a.id) === selectedAreaId)

  // ── Area Detail — loaded when an area is picked (canonical source of branch_id) ─
  const {
    data: areaDetail,
    isLoading: loadingAreaDetail,
  } = useGetAreaDetail(selectedAreaId || null)

  // Auto-select first city when cities load
  useEffect(() => {
    if (sortedCities.length > 0 && !selectedCityId) {
      setSelectedCityId(String(sortedCities[0].id))
    }
  }, [sortedCities.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // When selected city changes, reset area + auto-select first area
  useEffect(() => {
    setSelectedAreaId('')
    if (areaList.length > 0) {
      setSelectedAreaId(String(areaList[0].id))
    }
  }, [selectedCityId, areaList.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Geolocation ───────────────────────────────────────────────────────────
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    setGeoLoading(true)
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords

        try {
          const result = await locate(latitude, longitude)

          if (result.success) {
            if (result.city_id) {
              setSelectedCityId(String(result.city_id))
            }
            if (result.area_id) {
              // Defer area selection one tick so the areas list for this city
              // has a chance to populate (city change effect above will run)
              setTimeout(() => setSelectedAreaId(String(result.area_id)), 0)
            }
            setGeoLoading(false)
            return
          }
        } catch (_err) {
          // Fall through to Haversine fallback
        }

        // Haversine fallback — find nearest city by lat/lng
        const citiesWithCoords = sortedCities.filter(
          (c) => c.latitude != null && c.longitude != null
        )
        if (citiesWithCoords.length > 0) {
          const nearest = citiesWithCoords.reduce((best, c) =>
            distanceKm(
              latitude, longitude,
              parseFloat(String(c.latitude)),
              parseFloat(String(c.longitude))
            ) <
            distanceKm(
              latitude, longitude,
              parseFloat(String(best.latitude)),
              parseFloat(String(best.longitude))
            )
              ? c : best
          )
          setSelectedCityId(String(nearest.id))
        }
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Please select manually.'
            : 'Could not get location. Please select manually.'
        )
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  // ── Confirm ────────────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!selectedCityId || !selectedAreaId || !selectedAreaObj) return

    setConfirming(true)
    setGeoError('')

    try {
      // ── Canonical step per user flow: call /storefront/areas/<id>/ to read branch_id ──
      const detail = await fetchAreaDetail(selectedAreaId)

      const resolvedBranchId = resolveBranchId(detail)
      if (resolvedBranchId === undefined) {
        setGeoError('Could not determine branch for this area. Please try again.')
        return
      }

      const areaIdNum: number   = detail.id
      const branchIdNum: number = resolvedBranchId
      const cityName:  string   = (detail as any).city_name  ?? selectedCityObj?.name ?? ''
      const branchName: string  = (detail as any).branch_name ?? ''
      const areaName:   string  = detail.name
      const displayLabel = orderType === 'pickup'
        ? branchName || `${areaName}, ${cityName}`
        : `${areaName}, ${cityName}`

      // Redux: store location slice (human-readable data)
      setStoreLocation({
        branchId:   branchIdNum,
        branchName: branchName,
        cityId:     selectedCityObj?.id ?? Number(selectedCityId),
        cityName,
        areaId:     areaIdNum,
        areaName,
        displayLabel,
      })

      // Redux: order slice (the canonical branch/area IDs consumed by menu API)
      // Menu API call pattern: /storefront/menu/?branch=<branchId>&area=<areaId>
      setLocation(displayLabel)
      setAreaId(areaIdNum)
      setBranch(branchIdNum)

      onClose()
    } catch (_err) {
      setGeoError('Failed to load area details. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  const canConfirm = !!selectedCityId && !!selectedAreaId && !!selectedAreaObj && !confirming

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors sm:right-4 sm:top-4 z-10"
          aria-label="Close"
        >
          <X size={16} className="sm:hidden" />
          <X size={18} className="hidden sm:block" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center pt-6 pb-1 sm:pt-8 sm:pb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#000000] bg-white shadow-md overflow-hidden sm:h-20 sm:w-20">
            <Image
              src="/web/logo.webp"
              alt="United King"
              width={80}
              height={80}
              className="h-full w-full object-contain"
              loading="eager"
              priority
            />
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <h2 className="mb-4 text-center text-base font-bold text-neutral-800 sm:mb-5 sm:text-lg">
            Select your order type
          </h2>

          {/* Delivery / Pickup toggle */}
          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="flex rounded-full border border-neutral-300 bg-neutral-100 p-1 gap-1">
              {(['delivery', 'pickup'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setOrderType(type); setGeoError('') }}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all sm:px-6 sm:py-2 sm:text-xs ${
                    orderType === type
                      ? 'bg-[#000000] text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {type === 'pickup' ? 'Pick-Up' : 'Delivery'}
                </button>
              ))}
            </div>
          </div>

          {geoError && (
            <p className="mb-3 text-center text-xs text-red-600">{geoError}</p>
          )}

          {/* ── COMMON SECTION: City + Area (same for delivery & pickup) ── */}
          <p className="mb-3 text-center text-sm font-medium text-neutral-600">
            {orderType === 'pickup'
              ? 'Please select your city and area to find the nearest outlet'
              : 'Please select your delivery location'}
          </p>

          <div className="mb-3.5 flex justify-center sm:mb-4">
            <button
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="flex items-center gap-1.5 rounded-full bg-[#000000] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1f1f1f] disabled:opacity-60 transition-colors sm:gap-2 sm:px-5 sm:py-2 sm:text-xs"
            >
              {geoLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
              {geoLoading ? 'Detecting...' : 'Use Current Location'}
            </button>
          </div>

          {/* City */}
          <div className="relative mb-2.5 sm:mb-3">
            {loadingCities ? (
              <div className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-[#000000]" />
              </div>
            ) : (
              <select
                value={selectedCityId}
                onChange={(e) => { setSelectedCityId(e.target.value); setSelectedAreaId('') }}
                className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-xs text-neutral-700 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000] sm:px-4 sm:py-3 sm:text-sm"
              >
                <option value="">Select City</option>
                {sortedCities.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            )}
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>

          {/* Area */}
          <div className="relative mb-2.5 sm:mb-3">
            {!selectedCityId ? (
              <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 pr-10 text-xs text-neutral-400 sm:px-4 sm:py-3 sm:text-sm">
                Select a city first
              </div>
            ) : loadingCityAreas ? (
              <div className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-[#000000]" />
              </div>
            ) : (
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                disabled={!selectedCityId || areaList.length === 0}
                className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-xs text-neutral-700 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 sm:px-4 sm:py-3 sm:text-sm"
              >
                <option value="">
                  {areaList.length === 0 ? 'No areas available' : 'Select your area'}
                </option>
                {areaList.map((a: Area) => (
                  <option key={a.id} value={String(a.id)}>{a.name}</option>
                ))}
              </select>
            )}
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>

          {/* Branch preview — shows which branch is assigned by the area (from detail API) */}
          {selectedAreaObj && (
            <div className="mb-5 rounded-lg bg-neutral-50 px-3 py-3 space-y-1.5 border border-neutral-100">
              <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold sm:text-xs">
                Assigned Outlet
              </p>
              {loadingAreaDetail && !(areaDetail ?? selectedAreaObj)?.branch_name ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#000000]" />
                  <span className="text-xs text-neutral-500">Loading outlet…</span>
                </div>
              ) : (
                <p className="text-sm font-bold text-neutral-800">
                  {(areaDetail ?? selectedAreaObj)?.branch_name || '—'}
                </p>
              )}
              {orderType === 'delivery' && (
                <p className="text-[11px] sm:text-xs text-neutral-500">
                  Serving area: {selectedAreaObj.name}, {(areaDetail ?? selectedAreaObj)?.city_name ?? selectedCityObj?.name}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full rounded-xl bg-[#000000] py-2.5 text-xs font-bold text-white transition-all hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-sm flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Confirming…</span>
              </>
            ) : (
              'Confirm Location'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

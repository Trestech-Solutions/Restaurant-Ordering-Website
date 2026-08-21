'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navigation, ChevronDown, X, ExternalLink, Loader2 } from 'lucide-react'
import { useCart, type OrderType } from '@/lib/hooks/useCart'
import { useStoreLocation } from '@/lib/hooks/useStoreLocation'
import { useGetBranches, useGetAreas, useGetCities, locate } from '@/api/client/browse'
import type { Branch, Area, City } from '@/api/types'

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

function branchToInfo(b: Branch): BranchInfo {
  const name    = b.branch_name || b.name || 'Branch'
  const address = b.address || b.location || ''
  const q       = encodeURIComponent(`${name} ${address}`.trim())

  let lat: number | undefined
  let lng: number | undefined
  if (b.map_location) {
    const [latStr, lngStr] = b.map_location.split(',')
    lat = latStr ? parseFloat(latStr.trim()) : undefined
    lng = lngStr ? parseFloat(lngStr.trim()) : undefined
  } else if (b.latitude && b.longitude) {
    lat = parseFloat(String(b.latitude))
    lng = parseFloat(String(b.longitude))
  }

  return {
    id:        String(b.id),
    numericId: b.id,
    name,
    address,
    mapsUrl:   `https://maps.google.com/?q=${q}`,
    lat,
    lng,
  }
}

// ─── Haversine distance in km ─────────────────────────────────────────────────

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

// ─── City centres for geolocation fallback ────────────────────────────────────

const CITY_CENTRES: Record<string, { lat: number; lng: number }> = {
  Karachi:    { lat: 24.8607, lng: 67.0011 },
  Lahore:     { lat: 31.5204, lng: 74.3587 },
  Islamabad:  { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.6007, lng: 73.0679 },
  Faisalabad: { lat: 31.4504, lng: 73.1350 },
  Multan:     { lat: 30.1575, lng: 71.5249 },
  Hyderabad:  { lat: 25.3960, lng: 68.3578 },
  Peshawar:   { lat: 34.0151, lng: 71.5249 },
  Quetta:     { lat: 30.1798, lng: 66.9750 },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderTypeModalProps {
  onClose: () => void
}

export function OrderTypeModal({ onClose }: OrderTypeModalProps) {
  const { orderType, setOrderType, setLocation, setBranch, setAreaId } = useCart()
  const { setStoreLocation } = useStoreLocation()

  // ── API data ──────────────────────────────────────────────────────────────
  const { data: branches, isLoading: loadingBranches } = useGetBranches()
  const { data: cities, isLoading: loadingCities } = useGetCities()
  const { data: allAreas, isLoading: loadingAllAreas } = useGetAreas()

  const branchList: BranchInfo[] = (branches ?? []).map(branchToInfo)
  const finalBranchList = branchList.length > 0 ? branchList : FALLBACK_BRANCHES

  const cityList: City[] = cities ?? []
  const uniqueCities = Array.from(
    new Map(cityList.map((c) => [String(c.id), c])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const areaList: Area[] = allAreas ?? []

  // ── Local UI state ────────────────────────────────────────────────────────
  const [selectedBranchId, setSelectedBranchId] = useState<string>(finalBranchList[0].id)
  const [selectedCityId, setSelectedCityId]     = useState<string>('')
  const [selectedAreaId, setSelectedAreaId]     = useState<string>('')
  const [geoLoading, setGeoLoading]             = useState(false)
  const [geoError, setGeoError]                 = useState('')

  const activeBranch = finalBranchList.find((b) => b.id === selectedBranchId) ?? finalBranchList[0]
  const selectedCityObj = uniqueCities.find((c) => String(c.id) === selectedCityId)

  // ── Areas filtered by selected branch (pickup mode) ───────────────────────
  const branchAreas = areaList.filter(
    (a) => orderType === 'pickup' && a.branch === activeBranch.numericId
  )
  const loadingBranchAreas = loadingAllAreas && orderType === 'pickup'

  // ── Areas filtered by selected city's branch (delivery mode) ──────────────
  const cityAreas = selectedCityObj
    ? areaList.filter((a) => a.branch === selectedCityObj.branch)
    : []
  const loadingCityAreas = loadingAllAreas && orderType === 'delivery' && !!selectedCityObj

  // Auto-set first branchId when branches load
  useEffect(() => {
    if (finalBranchList.length > 0 && selectedBranchId === FALLBACK_BRANCHES[0].id) {
      setSelectedBranchId(finalBranchList[0].id)
    }
  }, [finalBranchList.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // When selected city changes, reset area and auto-select first area if exists
  useEffect(() => {
    if (orderType === 'delivery') {
      setSelectedAreaId('')
      if (cityAreas.length > 0) {
        setSelectedAreaId(String(cityAreas[0].id))
      }
    }
  }, [selectedCityId, cityAreas.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Geolocation — first try locate API, fallback to Haversine ─────────────
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
            if (orderType === 'pickup') {
              if (result.branch_id) {
                const match = finalBranchList.find(
                  (b) => b.numericId === result.branch_id
                )
                if (match) setSelectedBranchId(match.id)
              }
            } else {
              if (result.city_id) {
                const cityMatch = uniqueCities.find(
                  (c) => c.id === result.city_id
                )
                if (cityMatch) {
                  setSelectedCityId(String(cityMatch.id))
                }
              }
              if (result.area_id) {
                setSelectedAreaId(String(result.area_id))
              }
            }
            setGeoLoading(false)
            return
          }
        } catch (_err) {
          // Fall through to Haversine fallback if API call fails
        }

        // ── Fallback: Haversine distance (local calculation) ──────────────
        if (orderType === 'pickup') {
          const withCoords = finalBranchList.filter((b) => b.lat && b.lng)
          if (withCoords.length > 0) {
            const nearest = withCoords.reduce((best, b) =>
              distanceKm(latitude, longitude, b.lat!, b.lng!) <
              distanceKm(latitude, longitude, best.lat!, best.lng!)
                ? b : best
            )
            setSelectedBranchId(nearest.id)
          }
        } else {
          const citiesWithCoords = uniqueCities.filter(
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
          } else {
            const nearestCityName = Object.entries(CITY_CENTRES).reduce(
              (best, [city, coords]) =>
                distanceKm(latitude, longitude, coords.lat, coords.lng) <
                distanceKm(latitude, longitude, CITY_CENTRES[best].lat, CITY_CENTRES[best].lng)
                  ? city : best,
              Object.keys(CITY_CENTRES)[0]
            )
            const byName = uniqueCities.find(
              (c) => c.name.toLowerCase() === nearestCityName.toLowerCase()
            )
            if (byName) setSelectedCityId(String(byName.id))
          }
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
  const handleConfirm = () => {
    if (orderType === 'pickup') {
      const firstArea = (branchAreas ?? [])[0] ?? null

      setStoreLocation({
        branchId:     activeBranch.numericId,
        branchName:   activeBranch.name,
        areaId:       firstArea?.id ?? null,
        areaName:     firstArea?.name ?? '',
        displayLabel: activeBranch.name,
      })

      setLocation(activeBranch.name)
      setBranch(activeBranch.id)
      setAreaId(firstArea?.id ?? null)
      onClose()
    } else {
      if (!selectedCityId || !selectedAreaId) return
      const areaObj = areaList.find((a) => String(a.id) === selectedAreaId)
      if (!areaObj) return
      const cityName = selectedCityObj?.name ?? ''

      setStoreLocation({
        branchId:     areaObj.branch ?? selectedCityObj?.branch ?? null,
        branchName:   '',
        areaId:       areaObj.id,
        areaName:     areaObj.name,
        displayLabel: `${areaObj.name}, ${cityName}`,
      })

      setLocation(`${areaObj.name}, ${cityName}`)
      setAreaId(areaObj.id)
      setBranch(areaObj.branch ? String(areaObj.branch) : '')
      onClose()
    }
  }

  const canConfirm =
    orderType === 'pickup' || (!!selectedCityId && !!selectedAreaId)

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

          {/* ── PICKUP ── */}
          {orderType === 'pickup' && (
            <>
              <p className="mb-3 text-center text-sm font-medium text-neutral-600">
                Which outlet would you like to pick up from?
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

              {/* Branch select */}
              <div className="relative mb-2.5 sm:mb-3">
                {loadingBranches ? (
                  <div className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-[#000000]" />
                  </div>
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-xs text-neutral-700 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000] sm:px-4 sm:py-3 sm:text-sm"
                  >
                    {finalBranchList.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>

              {/* Branch info + area from branch */}
              <div className="mb-5 rounded-lg bg-neutral-50 px-3 py-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-800 sm:text-xs">
                      {activeBranch.address || 'Address not available'}
                    </p>
                    {loadingBranchAreas ? (
                      <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Loading area…
                      </p>
                    ) : branchAreas && branchAreas.length > 0 ? (
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Area: {branchAreas.map((a) => a.name).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <a
                    href={activeBranch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-[#000000] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Directions <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            </>
          )}

          {/* ── DELIVERY ── */}
          {orderType === 'delivery' && (
            <>
              <p className="mb-3 text-center text-sm font-medium text-neutral-600">
                Please select your delivery location
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
                    {uniqueCities.map((c) => (
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
                    disabled={!selectedCityId || cityAreas.length === 0}
                    className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-xs text-neutral-700 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <option value="">
                      {cityAreas.length === 0 ? 'No areas available for this city' : 'Select your area'}
                    </option>
                    {cityAreas.map((a: Area) => (
                      <option key={a.id} value={String(a.id)}>{a.name}</option>
                    ))}
                  </select>
                )}
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </>
          )}

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full rounded-xl bg-[#000000] py-2.5 text-xs font-bold text-white transition-all hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-sm"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  )
}

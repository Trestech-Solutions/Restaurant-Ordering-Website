'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Navigation, ChevronDown, X, ExternalLink } from 'lucide-react'
import { useCart, type OrderType } from '@/lib/context/CartContext'
import { useGetBranches, useGetAreas } from '@/api/client/browse'
import type { Branch, Area } from '@/api/types'
import { Loader2 } from 'lucide-react'

export interface BranchInfo {
  id: string
  name: string
  address: string
  mapsUrl: string
}

export const FALLBACK_BRANCHES: BranchInfo[] = [
  { id: '1', name: 'United King Maskan', address: 'FL 6, Block 7 Gulshan-e-Iqbal, Karachi, Sindh', mapsUrl: 'https://maps.google.com/?q=United+King+Maskan+Karachi' },
]

export const UK_BRANCHES = FALLBACK_BRANCHES

function branchToInfo(b: Branch): BranchInfo {
  const q = encodeURIComponent(b.address || b.name)
  return {
    id: String(b.id),
    name: b.name,
    address: b.address || b.city,
    mapsUrl: `https://maps.google.com/?q=${q}`,
  }
}

const DELIVERY_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad']

interface OrderTypeModalProps {
  onClose: () => void
}

export function OrderTypeModal({ onClose }: OrderTypeModalProps) {
  const { orderType, setOrderType, setLocation, setBranch, setAreaId } = useCart()

  const { data: branches, isLoading: loadingBranches } = useGetBranches()
  const { data: areas, isLoading: loadingAreas } = useGetAreas()

  const branchList: BranchInfo[] = (branches ?? []).map(branchToInfo)
  const finalBranchList = branchList.length > 0 ? branchList : FALLBACK_BRANCHES

  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('')

  const [selectedBranchId, setSelectedBranchId] = useState<string>(finalBranchList[0].id)
  const activeBranch = finalBranchList.find((b) => b.id === selectedBranchId) ?? finalBranchList[0]

  const cityAreas = (areas ?? []).filter((a) => {
    if (!selectedCity) return false
    return (a.city || '').toLowerCase() === selectedCity.toLowerCase()
  })

  const handleUseCurrentLocation = () => {
    if (orderType === 'pickup') {
      setSelectedBranchId(finalBranchList[0].id)
    } else {
      setSelectedCity('Karachi')
      const defaultArea = (areas ?? []).find((a) => (a.city || '').toLowerCase() === 'karachi')
      if (defaultArea) setSelectedArea(String(defaultArea.id))
    }
  }

  const handleConfirm = () => {
    if (orderType === 'pickup') {
      setLocation(activeBranch.name)
      setBranch(activeBranch.id)
      setAreaId(null)
      onClose()
    } else {
      if (!selectedCity || !selectedArea) return
      const areaObj = (areas ?? []).find((a) => String(a.id) === selectedArea)
      if (areaObj) {
        setLocation(`${areaObj.name}, ${areaObj.city}`)
        setAreaId(areaObj.id)
        setBranch(areaObj.branch ? String(areaObj.branch) : '')
      }
      onClose()
    }
  }

  const canConfirm = orderType === 'pickup' || (!!selectedCity && !!selectedArea)

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

        <div className="flex flex-col items-center pt-6 pb-1 sm:pt-8 sm:pb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#c8102e] bg-white shadow-md overflow-hidden sm:h-20 sm:w-20">
            <Image
              src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
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

          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="flex rounded-full border border-neutral-300 bg-neutral-100 p-1 gap-1">
              {(['delivery', 'pickup'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all sm:px-6 sm:py-2 sm:text-xs ${
                    orderType === type
                      ? 'bg-[#c8102e] text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {type === 'pickup' ? 'Pick-Up' : 'Delivery'}
                </button>
              ))}
            </div>
          </div>

          {orderType === 'pickup' && (
            <>
              <p className="mb-3 text-center text-sm font-medium text-neutral-600">
                Which outlet would you like to pick-up from?
              </p>

              <div className="mb-3.5 flex justify-center sm:mb-4">
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1.5 rounded-full bg-[#c8102e] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#a80d26] transition-colors sm:gap-2 sm:px-5 sm:py-2 sm:text-xs"
                >
                  <Navigation size={12} className="sm:hidden" />
                  <Navigation size={13} className="hidden sm:block" />
                  Use Current Location
                </button>
              </div>

              <div className="relative mb-2.5 sm:mb-3">
                {loadingBranches ? (
                  <div className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 flex items-center justify-center sm:px-4 sm:py-3">
                    <Loader2 size={16} className="animate-spin text-[#c8102e]" />
                  </div>
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-xs text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e] sm:px-4 sm:py-3 sm:text-sm"
                  >
                    {finalBranchList.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 sm:hidden" />
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hidden sm:block" />
              </div>

              <div className="mb-5 flex items-start justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2">
                <p className="text-[11px] leading-relaxed text-neutral-600 sm:px-3 sm:py-2.5 sm:text-xs">
                  <span className="font-semibold text-neutral-800">Location: </span>
                  {activeBranch.address}
                </p>
                <a
                  href={activeBranch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-[#c8102e] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-700 transition-colors sm:px-3 sm:py-1 sm:text-[11px]"
                >
                  Get Directions
                  <ExternalLink size={9} className="sm:hidden" />
                  <ExternalLink size={10} className="hidden sm:block" />
                </a>
              </div>
            </>
          )}

          {orderType === 'delivery' && (
            <>
              <p className="mb-3 text-center text-sm font-medium text-neutral-600">
                Please select your location
              </p>

              <div className="mb-3.5 flex justify-center sm:mb-4">
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1.5 rounded-full bg-[#c8102e] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#a80d26] transition-colors sm:gap-2 sm:px-5 sm:py-2 sm:text-xs"
                >
                  <Navigation size={12} className="sm:hidden" />
                  <Navigation size={13} className="hidden sm:block" />
                  Use Current Location
                </button>
              </div>

              <div className="relative mb-2.5 sm:mb-3">
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setSelectedArea('') }}
                  className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-xs text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e] sm:px-4 sm:py-3 sm:text-sm"
                >
                  <option value="">Select City</option>
                  {DELIVERY_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 sm:hidden" />
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hidden sm:block" />
              </div>

              <div className="relative mb-2.5 sm:mb-3">
                {loadingAreas ? (
                  <div className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 flex items-center justify-center sm:px-4 sm:py-3">
                    <Loader2 size={16} className="animate-spin text-[#c8102e]" />
                  </div>
                ) : (
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    disabled={!selectedCity}
                    className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-xs text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <option value="">Please select your location</option>
                    {cityAreas.map((a: Area) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                )}
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 sm:hidden" />
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hidden sm:block" />
              </div>

              <div className="mb-1" />
            </>
          )}

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full rounded-xl bg-[#c8102e] py-2.5 text-xs font-bold text-white transition-all hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-sm"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

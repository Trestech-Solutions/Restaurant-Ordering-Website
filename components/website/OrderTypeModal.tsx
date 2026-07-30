'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Navigation, ChevronDown, X, ExternalLink } from 'lucide-react'
import { useCart, type OrderType } from '@/lib/context/CartContext'

// ─── Branch data ──────────────────────────────────────────────────────────────

export interface BranchInfo {
  id: string
  name: string
  address: string
  mapsUrl: string
}

export const UK_BRANCHES: BranchInfo[] = [
  { id: 'sharfabad',        name: 'United King Sharfabad',        address: 'No. 54, Hydra Phase-1, Sharfabad, Karachi',            mapsUrl: 'https://maps.google.com/?q=United+King+Sharfabad' },
  { id: 'karimabad',        name: 'United King Karimabad Branch', address: 'Federal B Area Karimabad, Block-1, Karachi',            mapsUrl: 'https://maps.google.com/?q=United+King+Karimabad' },
  { id: 'national-stadium', name: 'United King National Stadium', address: 'Near National Stadium, Karachi',                        mapsUrl: 'https://maps.google.com/?q=United+King+National+Stadium+Karachi' },
  { id: 'gulshan-iqbal',    name: 'United King Gulshan Branch',   address: 'Main Road, Gulshan-e-Iqbal, Karachi',                  mapsUrl: 'https://maps.google.com/?q=United+King+Gulshan+Iqbal' },
  { id: 'maskan',           name: 'United King Maskan',           address: 'FL 6, Block 7 Gulshan-e-Iqbal, Karachi, Sindh',        mapsUrl: 'https://maps.google.com/?q=United+King+Maskan+Karachi' },
  { id: 'dha',              name: 'United King DHA',              address: 'DHA Phase-4, Commanders Street 10, Karachi',           mapsUrl: 'https://maps.google.com/?q=United+King+DHA+Karachi' },
  { id: 'clifton',          name: 'United King Clifton',          address: 'Near Talwar Chowk, Clifton, Karachi',                  mapsUrl: 'https://maps.google.com/?q=United+King+Clifton+Karachi' },
  { id: 'north-karachi',    name: 'United King North Karachi',    address: 'Sector 11-C-1, North Karachi',                         mapsUrl: 'https://maps.google.com/?q=United+King+North+Karachi' },
  { id: 'bahadurabad',      name: 'United King Bahadurabad',      address: 'Bahadurabad, Karachi',                                 mapsUrl: 'https://maps.google.com/?q=United+King+Bahadurabad' },
  { id: 'north-nazimabad',  name: 'United King North Nazimabad',  address: 'L-8, North Nazimabad, Karachi',                        mapsUrl: 'https://maps.google.com/?q=United+King+North+Nazimabad' },
  { id: 'dhoraji',          name: 'United King Dhoraji',          address: '40/C, Dhoraji Colony, Karachi',                        mapsUrl: 'https://maps.google.com/?q=United+King+Dhoraji+Karachi' },
  { id: 'gulshan-maymar',   name: 'United King Gulshan-e-Maymar', address: 'Grand Parade, Sector A-2, Gulshan-e-Maymar, Karachi',  mapsUrl: 'https://maps.google.com/?q=United+King+Gulshan+e+Maymar' },
  { id: 'garden-east',      name: 'United King Garden East',      address: 'Garden East Street No. 6, Karachi',                   mapsUrl: 'https://maps.google.com/?q=United+King+Garden+East+Karachi' },
  { id: 'shah-faisal',      name: 'United King Shah Faisal',      address: 'Plot BP-26, Block-2, Shah Faisal Colony, Karachi',     mapsUrl: 'https://maps.google.com/?q=United+King+Shah+Faisal+Karachi' },
  { id: 'jinnah-avenue',    name: 'United King Jinnah Avenue',    address: 'Jinnah Avenue, Malir, Karachi',                        mapsUrl: 'https://maps.google.com/?q=United+King+Jinnah+Avenue+Karachi' },
]

const DELIVERY_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad']
const DELIVERY_AREAS: Record<string, string[]> = {
  Karachi:    ['Bahadurabad', 'Gulshan-e-Iqbal', 'Defence', 'North Nazimabad', 'Clifton', 'NED University'],
  Lahore:     ['Gulberg', 'DHA', 'Model Town', 'Johar Town'],
  Islamabad:  ['F-7', 'F-10', 'G-11'],
  Rawalpindi: ['Saddar', 'Bahria Town'],
  Faisalabad: ['D-Ground', 'Peoples Colony'],
}

// Map delivery area → nearest branch ID (for product filtering)
const AREA_TO_BRANCH: Record<string, string> = {
  // Karachi
  'Bahadurabad':     'bahadurabad',
  'Gulshan-e-Iqbal': 'gulshan-iqbal',
  'Defence':         'dha',
  'North Nazimabad': 'north-nazimabad',
  'Clifton':         'clifton',
  'NED University':  'north-nazimabad',   // NED is nearest to North Nazimabad branch
  // Lahore — no branches yet, show all
  'Gulberg':         '',
  'DHA':             '',
  'Model Town':      '',
  'Johar Town':      '',
  // Islamabad
  'F-7':             '',
  'F-10':            '',
  'G-11':            '',
  // Rawalpindi
  'Saddar':          '',
  'Bahria Town':     '',
  // Faisalabad
  'D-Ground':        '',
  'Peoples Colony':  '',
}

interface OrderTypeModalProps {
  onClose: () => void
}

export function OrderTypeModal({ onClose }: OrderTypeModalProps) {
  const { orderType, setOrderType, setLocation, setBranch } = useCart()

  // Delivery state
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState('')

  // Pickup state
  const [selectedBranchId, setSelectedBranchId] = useState(UK_BRANCHES[0].id)
  const activeBranch = UK_BRANCHES.find((b) => b.id === selectedBranchId) ?? UK_BRANCHES[0]

  const handleUseCurrentLocation = () => {
    if (orderType === 'pickup') {
      setSelectedBranchId('maskan')
    } else {
      setSelectedCity('Karachi')
      setSelectedArea('NED University')
    }
  }

  const handleConfirm = () => {
    if (orderType === 'pickup') {
      setLocation(activeBranch.name)
      setBranch(activeBranch.id)
      onClose()
    } else {
      if (!selectedCity || !selectedArea) return
      setLocation(`${selectedArea}, ${selectedCity}`)
      // Set nearest branch so products filter correctly; empty string = show all
      setBranch(AREA_TO_BRANCH[selectedArea] ?? '')
      onClose()
    }
  }

  const canConfirm = orderType === 'pickup' || (!!selectedCity && !!selectedArea)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#c8102e] bg-white shadow-md overflow-hidden">
            <Image
              src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
              alt="United King"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Title */}
          <h2 className="mb-5 text-center text-lg font-bold text-neutral-800">
            Select your order type
          </h2>

          {/* Delivery / Pickup pill toggle */}
          <div className="mb-6 flex justify-center">
            <div className="flex rounded-full border border-neutral-300 bg-neutral-100 p-1 gap-1">
              {(['delivery', 'pickup'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
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

          {/* ── PICKUP ──────────────────────────────────────────────────── */}
          {orderType === 'pickup' && (
            <>
              <p className="mb-3 text-center text-sm font-medium text-neutral-600">
                Which outlet would you like to pick-up from?
              </p>

              {/* Use Current Location */}
              <div className="mb-4 flex justify-center">
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-2 rounded-full bg-[#c8102e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#a80d26] transition-colors"
                >
                  <Navigation size={13} />
                  Use Current Location
                </button>
              </div>

              {/* Branch dropdown */}
              <div className="relative mb-3">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e]"
                >
                  {UK_BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>

              {/* Address + Get Directions */}
              <div className="mb-5 flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2.5">
                <p className="text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-800">Location: </span>
                  {activeBranch.address}
                </p>
                <a
                  href={activeBranch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-full bg-[#c8102e] px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Get Directions
                  <ExternalLink size={10} />
                </a>
              </div>
            </>
          )}

          {/* ── DELIVERY ────────────────────────────────────────────────── */}
          {orderType === 'delivery' && (
            <>
              <p className="mb-3 text-center text-sm font-medium text-neutral-600">
                Please select your location
              </p>

              {/* Use Current Location */}
              <div className="mb-4 flex justify-center">
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-2 rounded-full bg-[#c8102e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#a80d26] transition-colors"
                >
                  <Navigation size={13} />
                  Use Current Location
                </button>
              </div>

              {/* City dropdown */}
              <div className="relative mb-3">
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setSelectedArea('') }}
                  className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e]"
                >
                  <option value="">Select City</option>
                  {DELIVERY_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>

              {/* Area dropdown */}
              <div className="relative mb-3">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  disabled={!selectedCity}
                  className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
                >
                  <option value="">Please select your location</option>
                  {(DELIVERY_AREAS[selectedCity] ?? []).map((a) => <option key={a}>{a}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>

              {/* Nearest branch strip — shown when area has a mapped branch */}
              {(() => {
                const nearestId = selectedArea ? (AREA_TO_BRANCH[selectedArea] ?? '') : ''
                const nearestBranch = UK_BRANCHES.find((b) => b.id === nearestId)
                if (!nearestBranch) return null
                return (
                  <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2.5">
                    <p className="text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-800">Nearest Branch: </span>
                      {nearestBranch.address}
                    </p>
                    <a
                      href={nearestBranch.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 rounded-full bg-[#c8102e] px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Get Directions
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )
              })()}

              <div className="mb-1" />
            </>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full rounded-xl bg-[#c8102e] py-3 text-sm font-bold text-white transition-all hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

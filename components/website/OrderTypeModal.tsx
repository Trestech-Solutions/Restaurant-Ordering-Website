'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, Navigation, ChevronDown, X } from 'lucide-react'
import { useCart, type OrderType } from '@/lib/context/CartContext'

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad']

const BRANCHES: Record<string, string[]> = {
  Karachi: ['Bahadurabad', 'Gulshan-e-Iqbal', 'Defence', 'North Nazimabad', 'Clifton'],
  Lahore: ['Gulberg', 'DHA', 'Model Town', 'Johar Town'],
  Islamabad: ['F-7', 'F-10', 'G-11'],
  Rawalpindi: ['Saddar', 'Bahria Town'],
  Faisalabad: ['D-Ground', 'Peoples Colony'],
}

interface OrderTypeModalProps {
  onClose: () => void
}

export function OrderTypeModal({ onClose }: OrderTypeModalProps) {
  const { orderType, setOrderType, setLocation } = useCart()
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')

  const handleConfirm = () => {
    if (!selectedCity || !selectedBranch) return
    setLocation(`${selectedBranch}, ${selectedCity}`)
    onClose()
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(() => {
      setSelectedCity('Karachi')
      setSelectedBranch('Bahadurabad')
    })
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Logo area */}
        <div className="flex flex-col items-center pt-8 pb-4">
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

          {/* Order type toggle */}
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
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location label */}
          <p className="mb-3 text-center text-sm font-medium text-neutral-600">
            Please select your location
          </p>

          {/* Use current location */}
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
              onChange={(e) => {
                setSelectedCity(e.target.value)
                setSelectedBranch('')
              }}
              className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e]"
            >
              <option value="">Select City</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>

          {/* Branch dropdown */}
          <div className="relative mb-6">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={!selectedCity}
              className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm text-neutral-700 focus:border-[#c8102e] focus:outline-none focus:ring-1 focus:ring-[#c8102e] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
            >
              <option value="">Please select your location</option>
              {(BRANCHES[selectedCity] ?? []).map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedCity || !selectedBranch}
            className="w-full rounded-xl bg-[#c8102e] py-3 text-sm font-bold text-white transition-all hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

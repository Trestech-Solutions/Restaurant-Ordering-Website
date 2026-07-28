'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AuthModalProps {
  onClose: () => void
  onGuestContinue: () => void
}

const COUNTRY_CODES = [
  { code: '+92', flag: '🇵🇰', label: 'PK' },
  { code: '+1',  flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'GB' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
]

export function AuthModal({ onClose, onGuestContinue }: AuthModalProps) {
  const [countryCode, setCountryCode] = useState('+92')
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')

  const fullNumber = `${countryCode.replace('+', '')}${mobile}`

  const handleLoginRegister = () => {
    if (mobile.trim().length < 9) {
      setError('Please enter a valid mobile number')
      return
    }
    setError('')
    // TODO: hook up to auth API
    console.log('Login/Register with:', fullNumber)
    onClose()
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
        >
          <X size={14} />
        </button>

        <div className="px-8 py-8">
          {/* Title */}
          <h2 className="mb-1 text-xl font-bold text-neutral-900">Enter your Mobile Number</h2>
          <p className="mb-6 text-sm text-neutral-500">
            Please confirm your country code and enter your mobile number
          </p>

          {/* Mobile input */}
          <div className="flex overflow-hidden rounded-lg border border-neutral-300 focus-within:border-[#c8102e] focus-within:ring-1 focus-within:ring-[#c8102e] transition-all">
            {/* Country code selector */}
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="border-r border-neutral-300 bg-neutral-50 px-2 py-3 text-sm text-neutral-700 outline-none"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>

            {/* Number input */}
            <input
              type="tel"
              placeholder="3000000000"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, ''))
                setError('')
              }}
              className="flex-1 bg-white px-4 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            />
          </div>

          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

          {/* Login / Register CTA */}
          <button
            onClick={handleLoginRegister}
            className="mt-5 w-full rounded-lg bg-[#c8102e] py-3.5 text-sm font-bold text-white hover:bg-[#a80d26] transition-colors"
          >
            Login / Register
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 border-t border-neutral-200" />
            <span className="text-xs text-neutral-400">Or</span>
            <div className="flex-1 border-t border-neutral-200" />
          </div>

          {/* Guest CTA */}
          <button
            onClick={onGuestContinue}
            className="w-full rounded-lg border-2 border-[#f7c948] bg-[#f7c948]/10 py-3.5 text-sm font-bold text-[#b8860b] hover:bg-[#f7c948]/20 transition-colors"
          >
            Order as Guest
          </button>
        </div>
      </div>
    </div>
  )
}

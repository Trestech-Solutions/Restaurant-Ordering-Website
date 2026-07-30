'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, AlertCircle } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'

// ─── Static credentials ───────────────────────────────────────────────────────
const VALID_PHONE = '03366655786'
const VALID_OTP   = '123456'
const MOCK_USER   = { name: 'Syed', phone: VALID_PHONE }

const COUNTRY_CODES = [
  { code: '+92', flag: '🇵🇰' },
  { code: '+1',  flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+971', flag: '🇦🇪' },
]

type Step = 'phone' | 'otp'

interface AuthModalProps {
  onClose: () => void
  onGuestContinue: () => void
}

export function AuthModal({ onClose, onGuestContinue }: AuthModalProps) {
  const { setUser } = useCart()

  const [step, setStep]           = useState<Step>('phone')
  const [countryCode, setCC]      = useState('+92')
  const [mobile, setMobile]       = useState('')
  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [error, setError]         = useState('')
  const [sending, setSending]     = useState(false)
  const [countdown, setCountdown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Auto-focus first OTP box when step changes
  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus()
  }, [step])

  const handleSendOtp = () => {
    const cleaned = mobile.replace(/\D/g, '')
    if (cleaned.length < 10) {
      setError('Please enter a valid mobile number')
      return
    }
    setError('')
    setSending(true)
    // Simulate API delay
    setTimeout(() => {
      setSending(false)
      setStep('otp')
      setCountdown(44)
    }, 800)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    setError('')
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = () => {
    const entered = otp.join('')
    if (entered.length < 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    if (entered !== VALID_OTP) {
      setError('Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      return
    }
    setUser(MOCK_USER)
    onClose()
  }

  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    setCountdown(44)
    otpRefs.current[0]?.focus()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
        >
          <X size={14} />
        </button>

        {/* ── PHONE STEP ──────────────────────────────────────────────── */}
        {step === 'phone' && (
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <h2 className="mb-1 text-lg font-bold text-neutral-900 sm:text-xl">Enter your Mobile Number</h2>
            <p className="mb-5 text-xs text-neutral-500 sm:mb-6 sm:text-sm">
              Please confirm your country code and enter your mobile number
            </p>

            {/* Mobile input */}
            <div className="flex overflow-hidden rounded-lg border border-neutral-300 focus-within:border-[#c8102e] focus-within:ring-1 focus-within:ring-[#c8102e] transition-all">
              <select
                value={countryCode}
                onChange={(e) => setCC(e.target.value)}
                className="border-r border-neutral-300 bg-neutral-50 px-2 py-2.5 text-xs text-neutral-700 outline-none sm:px-2 sm:py-3 sm:text-sm"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="3366655786"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                className="flex-1 bg-white px-3 py-2.5 text-xs text-neutral-800 outline-none placeholder:text-neutral-400 sm:px-4 sm:py-3 sm:text-sm"
              />
            </div>

            {error && <p className="mt-2 text-[11px] text-red-500 sm:text-xs">{error}</p>}

            <button
              onClick={handleSendOtp}
              disabled={sending}
              className="mt-4 w-full rounded-lg bg-[#c8102e] py-2.5 text-xs font-bold text-white hover:bg-[#a80d26] disabled:opacity-60 transition-colors sm:mt-5 sm:py-3.5 sm:text-sm"
            >
              {sending ? 'Sending OTP...' : 'Login / Register'}
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 border-t border-neutral-200" />
              <span className="text-[11px] text-neutral-400 sm:text-xs">Or</span>
              <div className="flex-1 border-t border-neutral-200" />
            </div>

            <button
              onClick={onGuestContinue}
              className="w-full rounded-lg border-2 border-[#f7c948] bg-[#f7c948]/10 py-2.5 text-xs font-bold text-[#b8860b] hover:bg-[#f7c948]/20 transition-colors sm:py-3.5 sm:text-sm"
            >
              Order as Guest
            </button>
          </div>
        )}

        {/* ── OTP STEP ────────────────────────────────────────────────── */}
        {step === 'otp' && (
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <h2 className="mb-3 text-base font-bold text-neutral-900 sm:mb-4 sm:text-lg">
              Please enter the verification code
            </h2>

            {/* Info banner */}
            <div className="mb-5 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-[11px] text-blue-700 sm:mb-6 sm:px-4 sm:py-3 sm:text-xs">
              <AlertCircle size={13} className="mt-0.5 shrink-0 sm:hidden" />
              <AlertCircle size={14} className="mt-0.5 shrink-0 hidden sm:block" />
              <p>
                Hello, an OTP has been sent to your Phone Number. Please verify the OTP to
                retrieve your name, number and address.
              </p>
            </div>

            {/* 6-box OTP input */}
            <div className="mb-2 flex justify-center gap-1.5 sm:gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-10 w-8 rounded-lg border border-neutral-300 text-center text-base font-bold text-neutral-800 outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition-all sm:h-12 sm:w-10 sm:text-lg"
                />
              ))}
            </div>

            {/* Countdown */}
            <p className="mb-4 text-center text-[11px] text-neutral-500 sm:text-xs">
              {countdown > 0 ? (
                <>({countdown})</>
              ) : (
                <button onClick={handleResend} className="text-[#c8102e] font-semibold hover:underline">
                  Resend OTP
                </button>
              )}
            </p>

            {error && (
              <p className="mb-3 text-center text-[11px] text-red-500 sm:text-xs">{error}</p>
            )}

            <button
              onClick={handleVerifyOtp}
              className="w-full rounded-xl bg-[#c8102e] py-2.5 text-xs font-bold text-white hover:bg-[#a80d26] transition-colors sm:py-3 sm:text-sm"
            >
              Verify OTP
            </button>

            <button
              onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError('') }}
              className="mt-3 w-full text-center text-[11px] text-neutral-400 hover:text-neutral-600 sm:text-xs"
            >
              ← Change number
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

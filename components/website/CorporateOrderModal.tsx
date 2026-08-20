'use client'

import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'

interface CorporateOrderModalProps {
  onClose: () => void
}

interface BookingForm {
  name: string
  email: string
  mobile: string
  date: string
  time: string
  instructions: string
}

const EMPTY: BookingForm = {
  name: '', email: '', mobile: '', date: '', time: '', instructions: '',
}

export function CorporateOrderModal({ onClose }: CorporateOrderModalProps) {
  const [form, setForm] = useState<BookingForm>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const set = (field: keyof BookingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const isValid = form.name.trim() && form.email.trim() && form.mobile.trim() && form.date && form.time

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
        >
          <X size={14} />
        </button>

        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={44} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Booking Received!</h2>
            <p className="mt-3 max-w-sm text-sm text-neutral-500">
              Thank you! Our team will contact you shortly to confirm your corporate order.
            </p>
            <button
              onClick={onClose}
              className="mt-8 rounded-xl bg-[#000000] px-8 py-3 text-sm font-bold text-white hover:bg-[#1f1f1f] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div className="px-6 py-8 sm:px-10">
            <h2 className="mb-8 text-center text-2xl font-bold text-neutral-900 tracking-tight">
              Order Booking
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Name*"
                  value={form.name}
                  onChange={set('name')}
                  required
                  className={inputCls}
                />
                <input
                  type="email"
                  placeholder="Email*"
                  value={form.email}
                  onChange={set('email')}
                  required
                  className={inputCls}
                />
              </div>

              {/* Mobile */}
              <input
                type="tel"
                placeholder="Mobile*"
                value={form.mobile}
                onChange={set('mobile')}
                required
                className={inputCls}
              />

              {/* Date + Time */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="date"
                  placeholder="Date of Booking*"
                  value={form.date}
                  onChange={set('date')}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls}
                />
                <input
                  type="time"
                  placeholder="Time*"
                  value={form.time}
                  onChange={set('time')}
                  required
                  className={inputCls}
                />
              </div>

              {/* Instructions */}
              <textarea
                placeholder="Your Instructions"
                value={form.instructions}
                onChange={set('instructions')}
                rows={5}
                className={`${inputCls} resize-none`}
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#000000] py-3.5 text-sm font-bold text-white hover:bg-[#1f1f1f] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#000000] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#000000] transition-colors'

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

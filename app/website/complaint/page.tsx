'use client'

import { useState } from 'react'
import Image from 'next/image'

type ComplaintType = 'Takeaway' | 'Delivery'
type DeliveryMethod = 'Food Panda' | 'Website, Phone or Facebook'
type Title = 'Mr.' | 'Mrs.' | 'Ms.' | 'Dr.'

const TITLES: Title[] = ['Mr.', 'Mrs.', 'Ms.', 'Dr.']

export default function SubmitComplaintPage() {
  // complaint type toggle
  const [complaintType, setComplaintType] = useState<ComplaintType>('Takeaway')
  // delivery method (only shown when Delivery is selected)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)

  // form fields
  const [title, setTitle]           = useState<Title>('Mr.')
  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [orderCode, setOrderCode]   = useState('')
  const [branch, setBranch]         = useState('')
  const [dateOfVisit, setDateOfVisit] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted]   = useState(false)

  const showFoodPandaMsg =
    complaintType === 'Delivery' && deliveryMethod === 'Food Panda'

  const showForm =
    complaintType === 'Takeaway' ||
    (complaintType === 'Delivery' && deliveryMethod === 'Website, Phone or Facebook')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative h-56 overflow-hidden sm:h-72">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=1600&auto=format&fit=crop"
          alt="We are here to help"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Yellow diagonal overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(105deg, #f7c948 0%, #f7c948 52%, transparent 52%)',
          }}
        />

        {/* Headline */}
        <div className="absolute inset-0 z-20 flex items-center px-8 md:px-16">
          <h1 className="text-4xl font-extrabold uppercase leading-tight text-neutral-900 sm:text-5xl md:text-6xl">
            WE ARE<br />HERE TO HELP
          </h1>
        </div>
      </section>

      {/* ── Form Section ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[900px] px-4 py-10 md:px-8">

        {submitted ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-10 text-center">
            <p className="text-2xl font-bold text-green-700 mb-2">Complaint Submitted!</p>
            <p className="text-sm text-green-600">
              Thank you for reaching out. Our team will review your complaint and get back to you shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setName(''); setPhone(''); setOrderCode(''); setBranch(''); setDateOfVisit(''); setDescription('')
                setComplaintType('Takeaway'); setDeliveryMethod(null)
              }}
              className="mt-6 rounded-full bg-[#c8102e] px-8 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <>
            {/* ── Complaint Type Toggle ──────────────────────────────── */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-bold text-neutral-800">Complaint relating to:</p>
              <div className="flex gap-3">
                {(['Takeaway', 'Delivery'] as ComplaintType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setComplaintType(t); setDeliveryMethod(null) }}
                    className={`rounded px-6 py-2 text-sm font-semibold border transition-colors ${
                      complaintType === t
                        ? 'border-[#c8102e] text-[#c8102e] bg-white'
                        : 'border-neutral-300 text-neutral-700 bg-white hover:border-[#c8102e]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Delivery Method (only when Delivery selected) ─────── */}
            {complaintType === 'Delivery' && (
              <div className="mb-8">
                <p className="mb-3 text-sm font-bold text-neutral-800">
                  Please Select the Method Of Delivery:
                </p>
                <div className="flex flex-wrap gap-3">
                  {(['Food Panda', 'Website, Phone or Facebook'] as DeliveryMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setDeliveryMethod(m)}
                      className={`rounded px-6 py-2 text-sm font-semibold border transition-colors ${
                        deliveryMethod === m
                          ? 'border-[#c8102e] text-[#c8102e] bg-white'
                          : 'border-neutral-300 text-neutral-700 bg-white hover:border-[#c8102e]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Food Panda message */}
                {showFoodPandaMsg && (
                  <p className="mt-5 text-sm text-neutral-700">
                    kindly contact Foodpanda on their help center.
                  </p>
                )}
              </div>
            )}

            {/* ── Main Form ─────────────────────────────────────────── */}
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Customer Name */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Customer Name
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value as Title)}
                        className="rounded border border-neutral-300 px-2 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                      >
                        {TITLES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                      />
                    </div>
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Customer Phone
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                </div>

                {/* Order Code / Branch */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Order Code <span className="font-normal text-neutral-400">(if available)</span>
                    </label>
                    <input
                      type="text"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">Branch</label>
                    <input
                      required
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                </div>

                {/* Date of Visit / Complaint Description */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Date of Visit
                    </label>
                    <input
                      required
                      type="date"
                      value={dateOfVisit}
                      onChange={(e) => setDateOfVisit(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                    <p className="mt-1 text-xs text-neutral-400">(require receipt or proof of visit / sale)</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      Complaint Description
                    </label>
                    <input
                      required
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded bg-[#c8102e] px-10 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  )
}

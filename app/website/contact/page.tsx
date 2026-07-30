'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, ArrowUp, MessageCircle,
} from 'lucide-react'

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* ── Contact Form ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[860px] px-4 py-20 md:px-8">
        <h1 className="text-center text-4xl font-bold text-neutral-800 mb-3">Contact Us</h1>
        <p className="text-center text-sm text-neutral-500 mb-10">
          Please fill the form and our team will be in touch with you as soon as possible.
        </p>

        {submitted ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-10 text-center">
            <p className="text-2xl font-bold text-green-700 mb-2">Thank you!</p>
            <p className="text-sm text-green-600">
              Your message has been received. We will get back to you shortly.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }) }}
              className="mt-6 rounded-full bg-[#c8102e] px-8 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1 — Name / Email / Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name *"
                className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
              />
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email *"
                className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
              />
              <input
                required
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone *"
                className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
              />
            </div>

            {/* Row 2 — Message */}
            <textarea
              required
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              rows={5}
              className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition resize-y"
            />

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded bg-[#c8102e] px-8 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

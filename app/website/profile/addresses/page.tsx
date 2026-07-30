'use client'

import { useState } from 'react'
import { MapPin, Plus, X, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { ProfileLayout } from '@/components/website/ProfileLayout'

export default function AddressesPage() {
  const { user, addresses, addAddress, removeAddress } = useCart()

  const [showForm, setShowForm] = useState(false)
  const [line1, setLine1]       = useState('')
  const [city, setCity]         = useState('Karachi')

  if (!user) return null

  const handleSave = () => {
    if (!line1.trim()) return
    addAddress({ line1: line1.trim(), city })
    setLine1('')
    setCity('Karachi')
    setShowForm(false)
  }

  return (
    <ProfileLayout>
      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
          <MapPin size={20} className="text-[#c8102e]" />
          Addresses
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-[#c8102e] hover:text-[#c8102e] transition-colors"
          aria-label={showForm ? 'Cancel' : 'Add address'}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-5 rounded-xl border border-[#c8102e]/30 bg-white p-5 shadow-sm space-y-3">
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Street address, area, landmark"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
          />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
          >
            {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            className="w-full rounded-lg bg-[#c8102e] py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
          >
            Save Address
          </button>
        </div>
      )}

      {/* Address grid */}
      {addresses.length === 0 && !showForm ? (
        <p className="py-10 text-center text-sm text-neutral-400">No addresses saved yet. Click + to add one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <p className="pr-6 text-sm font-semibold text-neutral-800">{addr.line1}</p>
              <p className="mt-0.5 text-xs text-neutral-400">{addr.city},</p>
              <button
                onClick={() => removeAddress(addr.id)}
                aria-label="Delete address"
                className="absolute bottom-4 right-4 text-[#c8102e] hover:text-red-700 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  )
}

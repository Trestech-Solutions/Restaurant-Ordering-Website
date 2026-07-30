'use client'

import { useState, useEffect } from 'react'
import { Pencil, RefreshCw } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { ProfileLayout } from '@/components/website/ProfileLayout'

export default function ProfilePage() {
  const { user, setUser } = useCart()

  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [gender, setGender] = useState<'Male' | 'Female'>('Male')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email ?? '')
      setGender(user.gender ?? 'Male')
    }
  }, [user])

  if (!user) return null

  const handleUpdate = () => {
    setUser({ ...user, name, email, gender })
  }

  return (
    <ProfileLayout>
      <h1 className="mb-6 text-center text-2xl font-bold text-neutral-900">Profile</h1>

      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-5">

        {/* Full Name */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Full Name</label>
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
            />
            <Pencil size={15} className="shrink-0 text-neutral-400" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Email Address</label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
            />
            <button className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#c8102e] hover:underline whitespace-nowrap">
              <RefreshCw size={12} /> Update Email
            </button>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700">Gender</label>
          <div className="flex gap-6">
            {(['Male', 'Female'] as const).map((g) => (
              <label key={g} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <input
                  type="radio"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="accent-[#c8102e]"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Mobile — read-only */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Mobile Number</label>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2.5">
            <span className="text-sm text-neutral-400">🇵🇰 +92</span>
            <span className="text-sm text-neutral-700">{user.phone.replace(/^0/, '')}</span>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          className="w-full rounded-xl bg-[#c8102e] py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors"
        >
          Update Profile
        </button>
      </div>
    </ProfileLayout>
  )
}

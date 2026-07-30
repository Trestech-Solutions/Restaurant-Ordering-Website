'use client'

import { useState } from 'react'
import { useCart } from '@/lib/context/CartContext'
import { ProfileLayout } from '@/components/website/ProfileLayout'

const MOCK_ACTIVE_ORDERS = [
  {
    id: '#UxSDTz',
    date: 'July 30, 2026',
    status: 'Accepted',
    eta: 'ASAP (60 min)',
    payment: 'COD',
    total: 'Rs. 1348',
  },
]

const MOCK_PAST_ORDERS = [
  {
    id: '#ORD-000',
    date: 'July 10, 2026',
    status: 'Delivered',
    eta: '—',
    payment: 'COD',
    total: 'Rs. 1,610',
  },
  {
    id: '#ORD-099',
    date: 'Dec 5, 2025',
    status: 'Delivered',
    eta: '—',
    payment: 'Online',
    total: 'Rs. 1,800',
  },
]

export default function MyOrdersPage() {
  const { user } = useCart()
  const [tab, setTab] = useState<'active' | 'past'>('active')

  if (!user) return null

  const orders = tab === 'active' ? MOCK_ACTIVE_ORDERS : MOCK_PAST_ORDERS

  return (
    <ProfileLayout>
      {/* Active / Past tabs */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm mb-4">
        {(['active', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-4 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? 'bg-[#c8102e] text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            {t === 'active' ? 'Active Orders' : 'Past Orders'}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#c8102e]">order not found!</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {orders.map((o) => (
              <div key={o.id} className="px-6 py-5 space-y-1.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-neutral-900">Order {o.id}</p>
                    <p className="text-sm text-neutral-400">{o.date}</p>
                  </div>
                  <span
                    className={`mt-1 rounded px-3 py-1 text-xs font-bold ${
                      o.status === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                {o.eta !== '—' && (
                  <p className="text-sm text-neutral-700">
                    <span className="font-semibold">ETA:</span> {o.eta}
                  </p>
                )}
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold">Payment Type:</span> {o.payment}
                </p>
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold">Total Amount:</span> {o.total}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  )
}

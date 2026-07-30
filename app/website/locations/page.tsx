'use client'

import { useState } from 'react'
import { MapPin, Phone, Search } from 'lucide-react'

// ─── Branch Data ─────────────────────────────────────────────────────────────
const BRANCHES = [
  {
    name: 'SHAH FAISAL BRANCH',
    address: 'Plot No. BP-26, Block-2, Shah Faisal Colony, Colony Chowrangi, Co. Bin Qasim, Karachi-75210, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Shah+Faisal+Colony+Karachi',
  },
  {
    name: 'DHORAJI BRANCH',
    address: '40/C, Dhoraji Colony, Near Muncipal Busway, Society Cut, Brehmin Yan, Karachi-75700.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Dhoraji+Colony+Karachi',
  },
  {
    name: 'GULSHAN-E-MAYMAR BRANCH',
    address: 'Grand Parade, Sector A-2, Sector-Sector A, Gulshan-e-Maymar, Karachi-75340, Sindh, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Gulshan+e+Maymar+Karachi',
  },
  {
    name: 'NORTH NAZIMABAD BRANCH',
    address: 'L-8, Fateh, Chowrangi, Nazimabad Branch, 1058, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=North+Nazimabad+Karachi',
  },
  {
    name: 'SAFOORAH BRANCH',
    address: 'Near Dastoor-eh-Qafaeen University Road.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Safoorah+Karachi',
  },
  {
    name: 'FAIZAN-E-MADINA BRANCH',
    address: '141, Bahadur Madina Road, Peera Ganj, Karachi Karachi City, Sindh.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Faizan+e+Madina+Karachi',
  },
  {
    name: 'CLIFTON BRANCH',
    address: 'Clifton Old Aristocratic House, Near Talwar, Clifton Branch, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Clifton+Karachi',
  },
  {
    name: 'DHA BRANCH',
    address: 'DHA Phase-4, Commanders, Street 10, Defence Phase-4, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=DHA+Phase+4+Karachi',
  },
  {
    name: 'GARDEN EAST BRANCH',
    address: 'Garden Cast Street No. 6, Al Yamani Region DY, Near Row Tone Super Mart, Near Old Bone, Karachi.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Garden+East+Karachi',
  },
  {
    name: 'GULSHAN IQBAL BRANCH',
    address: 'Amo Court, 11/C, Main Road, Gulshan Iqbal, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Gulshan+Iqbal+Karachi',
  },
  {
    name: 'KARIMABAD BRANCH',
    address: 'Address: Federal B Area Karimabad, Block-1, Goldena Town, Karimabad, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Karimabad+Karachi',
  },
  {
    name: 'MASKAN BRANCH',
    address: 'Plot No. 70-71 IN, Block 1, Block Scheme, Maskan, Gulberg Iqbal, Sector-1, Maskan, Orangiabad.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Maskan+Karachi',
  },
  {
    name: 'NORTH KARACHI BRANCH',
    address: 'Shop No. 11/19, Sector-11C-1, North Karachi, North of Road.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=North+Karachi',
  },
  {
    name: 'SHARFABAD BRANCH',
    address: 'No. 54, Hydra Phase-1, Sharfabad, Karachi Area, Sindh.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Sharfabad+Karachi',
  },
  {
    name: 'NATIONAL STADIUM BRANCH',
    address: 'D/P Park Muhammad Ali Perenting, DY Park 1, D/A Bowling Club, D/A Gadafi Park Edge, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=National+Stadium+Karachi',
  },
  {
    name: 'JINNAH AVENUE BRANCH',
    address: 'W/26A-D/9, Jinnah Ave. Male, Colony Town, Malir 7, Colony Town, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Jinnah+Avenue+Karachi',
  },
  {
    name: 'AIRPORT (DOMESTIC ARRIVAL/DEPARTURE)',
    address: 'Jinnah International Airport Karachi, Pakistan, Airside.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Jinnah+International+Airport+Karachi',
  },
  {
    name: 'AIRPORT (INTERNATIONAL DEPARTURE)',
    address: 'Jinnah International Airport, Karachi, Pakistan.',
    phone: '021-111022022',
    mapUrl: 'https://maps.google.com/?q=Jinnah+International+Airport+Karachi',
  },
]

export default function LocationsPage() {
  const [search, setSearch] = useState('')

  const filtered = BRANCHES.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 pt-16 pb-6 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-4xl">
            Find Our Stores
          </h1>
          <p className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
            UAN: 021-111-022-022
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mt-5 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branch or area..."
            className="w-full rounded border border-neutral-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] transition"
          />
        </div>
      </section>

      {/* ── Branch Grid ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 pb-14 md:px-8">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400">No branches found for "{search}".</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((branch) => (
              <div
                key={branch.name}
                className="flex flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Branch name */}
                <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-neutral-900">
                  {branch.name}
                </h2>

                {/* Address */}
                <p className="flex-1 text-xs leading-relaxed text-neutral-500 mb-4">
                  {branch.address}
                </p>

                {/* Phone */}
                <a
                  href={`tel:${branch.phone.replace(/-/g, '')}`}
                  className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-[#c8102e] px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                >
                  <Phone size={12} />
                  {branch.phone}
                </a>

                {/* View on map */}
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start rounded border border-neutral-300 px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#c8102e] hover:text-[#c8102e] transition-colors"
                >
                  <MapPin size={12} />
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

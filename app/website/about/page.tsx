'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Star, Award, Users, Globe,
} from 'lucide-react'

// ─── Timeline milestones ────────────────────────────────────────────────────
const MILESTONES = [
  {
    year: '1984',
    title: 'The Beginning',
    description:
      'United King started its journey in Karachi under the brand umbrella of United Sweets Bakers and Nimco — from a small space in Karimabad.',
  },
  {
    year: '1998',
    title: 'A Brand is Born',
    description:
      'The first branch bearing the "United King" name opened in Bahadurabad, officially launching one of Karachi\'s most beloved bakery brands.',
  },
  {
    year: '2009',
    title: 'Brand of the Year',
    description:
      'United King won the prestigious Brand of the Year award — recognition it has earned consecutively year after year since.',
  },
  {
    year: '2015+',
    title: 'Going International',
    description:
      "United King's packaged products crossed borders, now exported to over 15 countries. Distribution across Pakistan also began, reaching leading stores nationwide.",
  },
]

// ─── Stats ───────────────────────────────────────────────────────────────────
const STATS = [
  { icon: Star,   value: '250+', label: 'Menu Items' },
  { icon: Award,  value: '15+',  label: 'Countries Exported To' },
  { icon: Users,  value: '40+',  label: 'Years of Trust' },
  { icon: Globe,  value: '50+',  label: 'Outlets in Karachi' },
]

export default function AboutUsPage() {
  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative h-64 overflow-hidden sm:h-80">
        <Image
          src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=1600&auto=format&fit=crop"
          alt="United King bakery"
          fill
          priority
          className="object-cover object-center brightness-50"
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#f7c948] mb-2">
            Est. 1984 · Karachi
          </p>
          <h1 className="text-4xl font-extrabold sm:text-5xl drop-shadow-lg">
            Brand Story of United King
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/80">
            Four decades of quality, culture, and the finest flavours — all under one roof.
          </p>
        </div>
      </section>

      {/* ── Brand Story ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[860px] px-4 py-14 md:px-8">
        <div className="space-y-5 text-[15px] leading-relaxed text-neutral-700">
          <p>
            United King — as we see it today — began its journey in the City of Lights three decades
            back under the brand umbrella of <strong>United Sweets Bakers and Nimco</strong>, from a
            small space in Karimabad back in 1984.
          </p>
          <p>
            Being so famous for their exceptional quality of food, United Sweets Bakers and Nimco
            faced a harsh challenge from other bakeries trying to use their reputation and name. Hence
            they decided to change the name to <strong>"United King"</strong> and registered it as a
            brand to protect their rights.
          </p>
          <p>
            The first branch with the name United King was opened at Bahadurabad in 1998 — the
            official birth of the "United King" brand. Since then, United King has come a long way in
            terms of its outlets, products, and services, sharing its quality of food across Karachi.
          </p>
          <p>
            Starting from an assortment of a few sweets and bakery items, United King gradually added
            to their menu and now makes and sells <strong>more than 250 food items</strong> — ranging
            from sweets and bakery items to breakfast and fast food — all under one roof.
          </p>
          <p>
            The growth in United King&apos;s likeability and customer base has only made a positive impact
            on quality. They have put great emphasis on maintaining their standards, which is why
            United King has won the <strong>prestigious Brand of the Year award</strong> consecutively
            since 2009 to 2013.
          </p>
          <p>
            With decades of continuous growth, United King&apos;s packaged products outgrew the
            confines of Karachi stores and went international — exported to over{' '}
            <strong>15 countries</strong>. More recently, United King started distribution across
            Pakistan; soon their products will be available at all leading stores nationwide.
          </p>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="bg-[#c8102e] py-14">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-4 text-center text-white sm:grid-cols-4 md:px-8">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7c948] text-neutral-900">
                <Icon size={26} />
              </div>
              <p className="text-3xl font-extrabold">{value}</p>
              <p className="text-sm font-medium text-white/80">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[860px] px-4 py-14 md:px-8">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-neutral-900">
          Our Journey
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-[#c8102e]/20 md:left-1/2 md:-translate-x-0.5" />

          <div className="space-y-10">
            {MILESTONES.map((m, i) => (
              <div
                key={m.year}
                className={`relative flex gap-6 md:gap-0 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 top-4 z-10 h-5 w-5 rounded-full border-4 border-[#c8102e] bg-white md:left-1/2 md:-translate-x-2.5" />

                {/* Content card */}
                <div
                  className={`ml-14 flex-1 rounded-xl bg-white p-5 shadow-md md:ml-0 md:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? 'md:mr-auto md:pr-10' : 'md:ml-auto md:pl-10'
                  }`}
                >
                  <span className="inline-block rounded-full bg-[#f7c948] px-3 py-0.5 text-xs font-bold text-neutral-900 mb-2">
                    {m.year}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#f7c948] py-14 text-center">
        <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
          Taste the Legacy
        </h2>
        <p className="mt-3 text-sm text-neutral-700">
          Over 250 delicious items crafted with 40+ years of passion.
        </p>
        <Link href="/website/home">
          <button className="mt-6 rounded-full bg-[#c8102e] px-8 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors">
            Order Now
          </button>
        </Link>
      </section>
    </div>
  )
}

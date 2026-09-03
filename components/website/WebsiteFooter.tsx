'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useStoreSettings } from '@/lib/hooks/useCart'

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? ''
const FALLBACK_LOGO = '/web/logo.webp'

function resolveMediaUrl(path?: string | null): string {
  if (!path || path.trim() === '') return FALLBACK_LOGO
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) {
    const base = MEDIA_BASE.replace(/\/+$/, '').replace(/\/api$/i, '')
    return base ? `${base}${path}` : FALLBACK_LOGO
  }
  return FALLBACK_LOGO
}

export function WebsiteFooter() {
  const [expanded, setExpanded] = useState(false)
  const { settings } = useStoreSettings()
  const androidIcon = resolveMediaUrl(settings.android_icon)
  const iosIcon     = resolveMediaUrl(settings.ios_icon)
  const androidLink = settings.android_app_link?.trim() || ''
  const iosLink     = settings.ios_app_link?.trim() || ''
  const showApps = (androidLink || iosLink) && Boolean(settings.android_icon || settings.ios_icon)
  const merchantLogo = resolveMediaUrl(settings.merchant_logo)

  return (
    <footer className="bg-white pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5 md:px-8">

        {/* SEO content block */}
        <div className="rounded-2xl bg-neutral-50 p-5 sm:p-7 md:p-10">
          <h2 className="text-xl font-bold text-neutral-800 sm:text-2xl md:text-3xl">
            Discover Authentic BBQ, Karahi &amp; Matka Biryani in Karachi – Angeethi PK
          </h2>
          <h3 className="mt-3 text-lg font-bold text-neutral-800 sm:mt-4 sm:text-xl md:text-2xl">
            Flavor-Packed Kabab &amp; Tikka Rice in Karachi
          </h3>

          <div
            className={`relative mt-3 overflow-hidden text-sm leading-relaxed text-neutral-600 transition-all duration-300 sm:mt-4 sm:text-base ${
              expanded ? 'max-h-[2000px]' : 'max-h-[3.2rem] sm:max-h-[3.6rem]'
            }`}
          >
            <p>
              If you crave flavorful and traditional BBQ, Angeethi PK proudly stands as one of
              the top spots in the city. Famous for serving Kabab Rice in Karachi, the menu
              offers perfectly grilled kababs paired with aromatic rice. Food lovers admire the
              Spicy Kabab Rice Karachi option, seasoned to elevate every bite. Alongside this,
              juicy Tikka Rice in Karachi brings tender chicken tikka on a bed of fluffy rice,
              ideal for a hearty meal any time of day.
            </p>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 flex items-center gap-1 text-sm font-semibold text-neutral-800 hover:text-black sm:mt-4"
          >
            {expanded ? 'Show Less' : 'Show More'}
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Brand / contact / social row */}
        <div className="flex flex-col items-center gap-8 border-b border-neutral-200 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {/* Logo */}
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full bg-white sm:h-36 sm:w-36">
            <Image
              src={merchantLogo}
              alt="Angeethi"
              width={144}
              height={144}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Contact info */}
          <div className="text-center sm:text-left">
            <h4 className="text-2xl font-bold text-neutral-900">Angeethi</h4>
            <p className="mt-2 text-sm text-neutral-700 sm:text-base">
              <span className="font-semibold">Phone:</span> 03092772497
            </p>
            <p className="mt-1 text-sm text-neutral-700 sm:text-base">
              <span className="font-semibold">Email:</span> angeethiofficial@gmail.com
            </p>
            <p className="mt-1 text-sm text-neutral-700 sm:text-base">
              <span className="font-semibold">Address:</span> Roshan Tower, Shop no 6 &amp; 7,
              Tipu Sultan Rd, Karachi, 75350
            </p>
            {/* App download badges */}
            {showApps && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
                {androidLink && (
                  <a
                    href={androidLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-black px-3 text-white shadow-sm hover:opacity-90"
                  >
                    <Image src={androidIcon} alt="Android app" width={22} height={22} className="object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }} />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[9px] uppercase tracking-wide text-neutral-300">Get it on</span>
                      <span className="text-sm font-bold">Android</span>
                    </div>
                  </a>
                )}
                {iosLink && (
                  <a
                    href={iosLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-black px-3 text-white shadow-sm hover:opacity-90"
                  >
                    <Image src={iosIcon} alt="iOS app" width={22} height={22} className="object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }} />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[9px] uppercase tracking-wide text-neutral-300">Download on the</span>
                      <span className="text-sm font-bold">App Store</span>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Follow us + links */}
          <div className="text-center sm:text-right">
            <h4 className="text-lg font-bold text-neutral-900">Follow Us:</h4>
            <div className="mt-3 flex justify-center gap-3 sm:justify-end">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-neutral-600 sm:justify-end">
              <Link href="/website/privacy" className="underline hover:text-black">Privacy Policy</Link>
              <Link href="/website/faqs" className="underline hover:text-black">Faqs</Link>
              <Link href="/website/blogs" className="underline hover:text-black">Blogs</Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-500">
          <span>© {new Date().getFullYear()} All Rights Reserved</span>
          {/* <Image
            src="https://assets.indolj.io/upload/indolj-logo.png"
            alt="Indolj"
            width={80}
            height={20}
            className="h-4 w-auto object-contain sm:h-5"
          /> */}
        </div>
      </div>
    </footer>
  )
}
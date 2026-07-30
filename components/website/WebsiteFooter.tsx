'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, ArrowUp } from 'lucide-react'

export function WebsiteFooter() {
  return (
    <footer className="relative overflow-visible bg-[#c8102e] pt-10 text-white rounded-tl-3xl rounded-tr-3xl sm:pt-12 md:pt-16">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 pb-8 sm:grid-cols-2 sm:gap-8 sm:px-5 sm:pb-10 md:grid-cols-4 md:gap-10 md:px-8">
        {/* Brand */}
        <div className="text-center sm:text-left">
          <div className="mb-3 mx-auto overflow-hidden rounded-full w-12 h-12 sm:mx-0 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-[#f7c948]">
            <Image
              src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
              alt="United King"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>
          <p className="text-[11px] italic text-[#f7c948] sm:text-xs">the Food Kingdom</p>
        </div>

        {/* Information */}
        <div className="text-center sm:text-left">
          <h4 className="mb-2.5 text-sm font-bold md:mb-3 md:text-base">Information</h4>
          <p className="mb-2.5 text-sm md:mb-3">021-111-022-022</p>
          <ul className="space-y-1.5 text-sm text-white/90 md:space-y-2">
            <li><Link href="/website/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/website/complaint" className="hover:underline">Submit Complaint</Link></li>
            <li><Link href="/website/contact" className="hover:underline">Contact Us</Link></li>
          </ul>
        </div>

        {/* App preview — visible but compact on mobile; taller on tablet+ */}
        <div className="relative flex justify-center md:justify-start order-last sm:order-none sm:col-span-2 md:col-span-1 pt-4 sm:pt-0">
          <div className="absolute -top-10 w-20 sm:-top-12 sm:w-24 md:-top-16 md:w-28 lg:w-36">
            <Image
              src="https://unitedkingonline.com/_next/image?url=%2Fassets%2Fimages%2Funitedking%2Fmobile-mockup.png&w=2048&q=75"
              alt="App preview"
              width={144}
              height={280}
              className="w-full object-contain drop-shadow-2xl"
            />
          </div>
          <div className="h-28 w-20 sm:h-32 sm:w-24 md:h-44 md:w-28 lg:w-36" />
        </div>

        {/* Get The App */}
        <div className="text-center sm:text-left">
          <h4 className="mb-2.5 text-base font-bold md:mb-3 md:text-lg">Get The App!</h4>
          <p className="mb-3 text-sm text-white/90 md:mb-4">Easy, Fast and Convenient.</p>
          <div className="mx-auto flex max-w-[220px] flex-col gap-2 sm:mx-0">
            <a
              href="https://apps.apple.com/us/app/united-king/id1616868468"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-black px-3 py-2 text-left text-[11px] text-white hover:bg-neutral-800 transition-colors sm:px-4 sm:text-xs"
            >
              Download on App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.indolj.unitedking"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-black px-3 py-2 text-left text-[11px] text-white hover:bg-neutral-800 transition-colors sm:px-4 sm:text-xs"
            >
              GET IT ON Google Play
            </a>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex flex-col items-center gap-3 border-t border-white/20 px-3 py-3 text-[11px] text-white/80 sm:px-4 sm:py-4 md:flex-row md:justify-between md:px-8 md:text-xs sm:flex-row sm:justify-between">
        <button aria-label="Search" className="rounded-full bg-white/10 p-1.5 sm:p-2 order-2 sm:order-1">
          <Search size={14} className="sm:hidden" />
          <Search size={16} className="hidden sm:block" />
        </button>
        <p className="text-center order-1 sm:order-2 px-2">
          Powered by Trestech &nbsp;|&nbsp;
          <a href="#" className="hover:underline">Privacy</a> &nbsp;
          <a href="#" className="hover:underline">Faqs</a>
        </p>
        <button
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full bg-white/10 p-1.5 sm:p-2 order-3"
        >
          <ArrowUp size={14} className="sm:hidden" />
          <ArrowUp size={16} className="hidden sm:block" />
        </button>
      </div>
    </footer>
  )
}

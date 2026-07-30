'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, ArrowUp } from 'lucide-react'

export function WebsiteFooter() {
  return (
    <footer className="relative overflow-visible bg-[#c8102e] pt-16 text-white rounded-tl-3xl rounded-tr-3xl">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pb-10 md:grid-cols-4 md:px-8">
        <div>
          <div className="mb-3 overflow-hidden rounded-full w-16 h-16 border-2 border-[#f7c948]">
            <Image
              src="https://assets.indolj.io/upload/1776252259-1652698752-uk-1.jpg"
              alt="United King"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <p className="text-xs italic text-[#f7c948]">the Food Kingdom</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold">Information</h4>
          <p className="mb-3 text-sm">021-111-022-022</p>
          <ul className="space-y-2 text-sm text-white/90">
            <li><Link href="/website/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/website/complaint" className="hover:underline">Submit Complaint</Link></li>
            <li><Link href="/website/contact" className="hover:underline">Contact Us</Link></li>
          </ul>
        </div>

        <div className="relative flex justify-center md:justify-start">
          <div className="absolute -top-16 w-28 sm:w-36">
            <Image
              src="https://unitedkingonline.com/_next/image?url=%2Fassets%2Fimages%2Funitedking%2Fmobile-mockup.png&w=2048&q=75"
              alt="App preview"
              width={144}
              height={280}
              className="w-full object-contain drop-shadow-2xl"
            />
          </div>
          <div className="h-44 w-28 sm:w-36" />
        </div>

        <div>
          <h4 className="mb-3 text-lg font-bold">Get The App!</h4>
          <p className="mb-4 text-sm text-white/90">Easy, Fast and Convenient.</p>
          <div className="flex flex-col gap-2">
            <a
              href="https://apps.apple.com/us/app/united-king/id1616868468"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-black px-4 py-2 text-left text-xs text-white hover:bg-neutral-800 transition-colors"
            >
              Download on App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.indolj.unitedking"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-black px-4 py-2 text-left text-xs text-white hover:bg-neutral-800 transition-colors"
            >
              GET IT ON Google Play
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/20 px-4 py-4 text-xs text-white/80 md:px-8">
        <button aria-label="Search" className="rounded-full bg-white/10 p-2">
          <Search size={16} />
        </button>
        <p className="text-center">
          Powered by Trestech &nbsp;|&nbsp;
          <a href="#" className="hover:underline">Privacy</a> &nbsp;
          <a href="#" className="hover:underline">Faqs</a>
        </p>
        <button
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full bg-white/10 p-2"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </footer>
  )
}

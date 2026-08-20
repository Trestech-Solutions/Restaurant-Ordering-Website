'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { BLOG_POSTS } from '@/lib/data/blog-posts'

export default function BlogPage() {
  return (
    <div className="min-h-screen font-sans text-neutral-800">

      {/* ── Hero Text ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[800px] px-4 pt-20 pb-12 text-center md:px-8">
        <h1 className="text-2xl font-bold leading-snug text-neutral-900 sm:text-3xl">
          United King – Discover the latest treats, special offers, and behind-the-scenes stories
          from United King. Because every sweet and snack has a tale to tell.
        </h1>
      </section>

      {/* ── Blog Grid ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/website/blog/${post.slug}`}
              className="group flex flex-col rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <p className="mb-2 text-xs font-bold tracking-widest text-[#000000]">
                  {post.category}
                </p>
                <h2 className="mb-2 text-base font-bold leading-snug text-neutral-900 group-hover:text-[#000000] transition-colors">
                  {post.title}
                </h2>
                <p className="flex-1 text-sm leading-relaxed text-neutral-500 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
                  <Clock size={13} />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  User,
  Menu,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowUp,
  Gift,
  Sparkles,
  Flame,
  Cake,
  IceCreamCone,
  Cookie,
  ShoppingCart,
} from "lucide-react";
import { ProductCard, type ProductData } from "@/components/website/ProductCard";
import { useCart } from "@/lib/context/CartContext";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const categories = [
  { label: "New Arrival", icon: Sparkles, active: true, badge: "NEW" },
  { label: "Deals Treasure", icon: Gift },
  { label: "Savories", icon: Flame },
  { label: "MANGOVERSE", icon: Flame },
  { label: "Fast Food & Deals", icon: Flame },
  { label: "Cakes", icon: Cake },
  { label: "Sweets", icon: Gift },
  { label: "Desserts", icon: IceCreamCone },
  { label: "Biscuits & Cookies", icon: Cookie },
  { label: "Gift Essentials", icon: Gift },
];

const products: ProductData[] = [
  {
    id: "kulfi-falooda",
    name: "Kulfi Falooda",
    description:
      "Enjoy the authentic taste of Classic Plain Kulfi Falooda, rich, creamy, and perfectly...",
    price: "1148",
    originalPrice: "1350",
    fromLabel: true,
    options: ["6 Pcs.", "12 Pcs."],
    tag: "New Arrival",
    discount: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "peshawari-ice-cream",
    name: "Peshawari Ice Cream (475 ML)",
    description:
      "Indulge in the rich and creamy delight of Peshawari Ice Cream, inspired by traditiona...",
    price: "895",
    options: [],
    tag: "New Arrival",
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "kulfi-assorted",
    name: "Riwayati Kulfi - Assorted (6pcs)",
    description:
      "Enjoy a wide range of delicious kulfi flavours perfect for every occasion. From classic...",
    price: "1010",
    options: [],
    image:
      "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "kulfi-malai-khoya",
    name: "Riwayati Kulfi - Malai Khoya",
    description:
      "Malai Khoya kulfi is a popular choice to beat the summer heat or satisfy your sweet...",
    price: "190",
    options: ["1 PC", "6 PCS"],
    image:
      "https://images.unsplash.com/photo-1560801868-27a72fc9c47f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "kulfi-mango",
    name: "Riwayati Kulfi - Mango",
    description:
      "Mango Kulfi is a delicious frozen dessert that combines the richness of kulfi with the...",
    price: "170",
    options: ["1 PC", "6 PCS"],
    image:
      "https://images.unsplash.com/photo-1488900128323-21503983a07e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "kulfi-pista",
    name: "Riwayati Kulfi - Pista",
    description:
      "Kulfi Pista Matki is sure to please your taste buds and leave you wanting more. It...",
    price: "170",
    options: ["1 PC", "6 PCS"],
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&auto=format&fit=crop",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("New Arrival");
  const { totalItems, openCart, location } = useCart();

  return (
    <div className="min-h-screen bg-[#f7f3ee] font-sans text-neutral-800">

      {/* ---------------- Top bar ---------------- */}
      <div className="bg-[#c8102e] text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2.5 md:px-8">
          <button className="flex items-center gap-2 rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900">
            <MapPin size={16} />
            <span className="text-left leading-tight">
              Change Location
              <br />
              <span className="font-normal">{location || "NED University"}</span>
            </span>
          </button>

          <a
            href="tel:021111022022"
            className="hidden items-center gap-2 text-sm font-medium sm:flex"
          >
            <Phone size={16} />
            021-111-022-022
          </a>

          <div className="flex flex-1 justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
              <span className="text-center text-[10px] font-extrabold leading-tight text-[#c8102e]">
                UNITED
                <br />
                KING
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-4 text-sm md:flex">
            <a href="#" className="flex items-center gap-1.5 hover:underline">
              <User size={16} />
              Sign in / Register
            </a>
            <span className="text-white/50">|</span>
            <button className="rounded bg-[#f7c948] px-3 py-1.5 text-xs font-semibold text-neutral-900">
              Corporate &amp; Special Event Orders
            </button>
          </div>

          {/* Cart button */}
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative rounded-full p-2 hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f7c948] text-[10px] font-bold text-neutral-900">
                {totalItems}
              </span>
            )}
          </button>

          <button aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="relative h-[320px] w-full sm:h-[420px] md:h-[520px]">
          <Image
            src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1600&auto=format&fit=crop"
            alt="Assorted traditional sweets"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-16">
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#2b2b2b] sm:text-5xl md:text-6xl">
              Traditional
              <br />
              Sweets
            </h1>
            <p className="mt-4 max-w-sm text-lg font-medium text-neutral-700 sm:text-xl">
              Zaiqa Aesa Jo Banaye
              <br />
              Har Din Khaas
            </p>
          </div>

          <button
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            aria-label="Next slide"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === 0 ? "bg-neutral-700" : "bg-neutral-400/60"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-4 right-4 hidden rounded-md bg-white/95 px-4 py-2 shadow-md sm:flex sm:flex-col sm:gap-1">
            <span className="text-[10px] font-bold tracking-wide text-neutral-700">
              SECURE PAYMENTS
            </span>
            <div className="flex gap-2">
              <span className="rounded border border-neutral-300 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                VISA
              </span>
              <span className="rounded border border-neutral-300 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                MasterCard
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Category nav ---------------- */}
      <nav className="bg-[#c8102e]">
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-2 md:px-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.label === activeCategory;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`relative flex min-w-[92px] flex-col items-center gap-1.5 px-3 py-3 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#f7c948] text-neutral-900"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {cat.badge && (
                  <span className="absolute left-1 top-1 rounded bg-white px-1 py-0.5 text-[8px] font-bold text-[#c8102e]">
                    {cat.badge}
                  </span>
                )}
                <Icon size={22} strokeWidth={1.6} />
                <span className="text-center leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------------- Sub-category pill ---------------- */}
      <div className="border-b border-neutral-200 bg-white py-3">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <span className="inline-block rounded-full bg-[#f7c948] px-5 py-1.5 text-sm font-semibold text-neutral-900">
            Ice Cream
          </span>
        </div>
      </div>

      {/* ---------------- Search ---------------- */}
      <div className="mx-auto max-w-[1400px] px-4 pt-8 md:px-8">
        <div className="flex items-center overflow-hidden rounded-full border border-neutral-300 bg-white shadow-sm">
          <input
            type="text"
            placeholder="Search for peshawari"
            className="flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-neutral-400"
          />
          <button
            aria-label="Search"
            className="mr-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f7941d] text-white"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* ---------------- Promo banner ---------------- */}
      <div className="mx-auto mt-6 max-w-[1400px] px-4 md:px-8">
        <div className="relative h-[160px] w-full overflow-hidden rounded-xl sm:h-[220px] md:h-[260px]">
          <Image
            src="https://images.unsplash.com/photo-1633436375153-d7045cb93e38?q=80&w=1600&auto=format&fit=crop"
            alt="Kulfi Falooda"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f7c948]/70 to-[#f7c948]/90" />
          <div className="absolute inset-0 flex items-center justify-end pr-6 sm:pr-12">
            <h2 className="font-serif text-3xl font-bold text-neutral-900 sm:text-5xl">
              Kulfi Falooda
            </h2>
          </div>
        </div>
      </div>

      {/* ---------------- Product grid ---------------- */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button className="rounded-md bg-[#c8102e] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#a80d26]">
            Next
          </button>
        </div>
      </section>

      {/* ---------------- About blurb ---------------- */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
        <h3 className="font-serif text-2xl font-bold text-neutral-900 sm:text-3xl">
          Discover the Delightful Range at United King
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600">
          United King is Karachi&apos;s premier bakery, offering a wide selection of cakes,
          sweets, mithai, frozen food and fast food. From traditional desserts to sugar-free
          and unfried options, we have something for everyone to make your gatherings and
          events memorable. Order online for convenient delivery or visit our bakery to
          experience the magic of United King.
        </p>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative bg-[#c8102e] pt-12 text-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pb-10 md:grid-cols-4 md:px-8">
          <div>
            <div className="mb-4 inline-flex items-center justify-center rounded-md border-2 border-[#f7c948] px-4 py-2">
              <span className="text-lg font-extrabold text-[#f7c948]">United King</span>
            </div>
            <p className="text-xs italic text-[#f7c948]">the Food Kingdom</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold">Information</h4>
            <p className="mb-3 text-sm">021-111-022-022</p>
            <ul className="space-y-2 text-sm text-white/90">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Submit Complaint</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
            </ul>
          </div>

          <div className="flex justify-center md:justify-start">
            <div className="h-52 w-28 rounded-2xl border-4 border-neutral-900 bg-neutral-900 shadow-xl sm:h-64 sm:w-36">
              <div className="h-full w-full overflow-hidden rounded-xl bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
                  alt="United King app preview"
                  width={144}
                  height={256}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-bold">Get The App!</h4>
            <p className="mb-4 text-sm text-white/90">
              App is where the fun is! It&apos;s Easy, Fast and Convenient.
            </p>
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-left text-xs">
                <span>Download on the App Store</span>
              </button>
              <button className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-left text-xs">
                <span>GET IT ON Google Play</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/20 px-4 py-4 text-xs text-white/80 md:px-8">
          <button aria-label="Search" className="rounded-full bg-white/10 p-2">
            <Search size={16} />
          </button>
          <p className="text-center">
            Powered by IndoJ &nbsp;|&nbsp;{" "}
            <a href="#" className="hover:underline">Privacy Policy</a>{" "}
            &nbsp;
            <a href="#" className="hover:underline">Faqs</a>{" "}
            &nbsp;
            <a href="#" className="hover:underline">Blog</a>
          </p>
          <button aria-label="Back to top" className="rounded-full bg-white/10 p-2">
            <ArrowUp size={16} />
          </button>
        </div>

        {/* Floating WhatsApp button */}
        <a
          href="#"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
        >
          <MessageCircle size={26} fill="white" />
        </a>
      </footer>
    </div>
  );
}

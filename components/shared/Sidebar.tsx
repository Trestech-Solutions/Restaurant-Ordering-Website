'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useSidebar } from '@/lib/context/SidebarContext'

interface NavItem {
  label: string
  href: string
  icon: string
  expandable?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'solar:widget-5-bold-duotone' },
      { label: 'All Orders', href: '/dashboard/orders', icon: 'solar:cart-large-2-bold-duotone' },
    ],
  },
  {
    title: 'WEBSITE CHANNEL',
    items: [{ label: 'Website Builder', href: '/dashboard/website-builder', icon: 'solar:global-bold-duotone' }],
  },
  {
    title: 'WHATSAPP CHANNEL',
    items: [{ label: 'WhatsApp Bot', href: '/dashboard/whatsapp-bot', icon: 'solar:chat-round-dots-bold-duotone' }],
  },
  {
    title: 'MENU',
    items: [
      { label: 'Menu Items', href: '/dashboard/menu-items', icon: 'solar:chef-hat-bold-duotone' },
      { label: 'Categories', href: '/dashboard/categories', icon: 'solar:layers-bold-duotone' },
    ],
  },
  {
    title: 'AUDIENCE',
    items: [
      { label: 'Customers', href: '/dashboard/customers', icon: 'solar:users-group-rounded-bold-duotone', expandable: true },
      { label: 'Reviews', href: '/dashboard/reviews', icon: 'solar:star-bold-duotone', expandable: true },
      { label: 'Offers & Discounts', href: '/dashboard/offers', icon: 'solar:gift-bold-duotone', expandable: true },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Delivery & Hours', href: '/dashboard/delivery-hours', icon: 'solar:clock-circle-bold-duotone', expandable: true },
      { label: 'Riders', href: '/dashboard/riders', icon: 'solar:scooter-bold-duotone', expandable: true },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Analytics', href: '/dashboard/analytics', icon: 'solar:chart-2-bold-duotone' },
      { label: 'Settings', href: '/dashboard/settings', icon: 'solar:settings-bold-duotone' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed } = useSidebar()

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-200`}
    >
      {/* Logo Section */}
      <div className="relative border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="relative h-9 w-9 shrink-0">
            <Image src="/apple-icon.png" alt="Trestech" fill className="object-contain" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-gray-900 truncate">Trestech</span>}
        </div>

        <button
          onClick={() => toggleCollapsed()}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <Icon icon={collapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-left-linear'} width={14} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !collapsed && (
              <h3 className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">{section.title}</h3>
            )}
            {section.title && collapsed && <div className="mx-3 border-t border-gray-100 mb-2" />}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        collapsed ? 'justify-center px-0' : ''
                      } ${active ? 'bg-primary-dashboard/10 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          active ? 'bg-primary-dashboard text-white' : 'text-gray-400'
                        }`}
                      >
                        <Icon icon={item.icon} width={20} />
                      </span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.expandable && (
                        <Icon icon="solar:alt-arrow-right-linear" width={16} className="text-gray-300" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
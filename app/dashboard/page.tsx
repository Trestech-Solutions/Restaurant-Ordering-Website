'use client'

import { useState, useEffect } from 'react'
import { usePlatform } from '@/lib/context/PlatformContext'
import { StatCardSection } from '@/components/dashboard/StatCardSection'
import { OrdersTable } from '@/components/dashboard/OrdersTable'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { dashboardStats, sampleOrders } from '@/lib/data/sample-data'

export default function DashboardPage() {
  const { activePlatform } = usePlatform()
  const [channel, setChannel] = useState<'all' | 'whatsapp' | 'website'>('all')

  useEffect(() => {
    if (activePlatform === 'omnichannelal') {
      setChannel('all')
    } else if (activePlatform === 'whatsapp') {
      setChannel('whatsapp')
    } else if (activePlatform === 'website') {
      setChannel('website')
    }
  }, [activePlatform])

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Overview</h1>
          <p className="mt-1 text-base text-gray-600">Real-time performance across your active channels.</p>
        </div>

        {/* Channel Filter - Only show if Omnichannel */}
        {activePlatform === 'omnichannelal' && (
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChannel('all')}
              className={`px-5 py-2 rounded-md font-semibold text-sm transition-all ${
                channel === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setChannel('whatsapp')}
              className={`px-5 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${
                channel === 'whatsapp'
                  ? 'bg-primary-dashboard text-white'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setChannel('website')}
              className={`px-5 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${
                channel === 'website'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              Website
            </button>
          </div>
        )}
      </div>

      {/* Combined Overall Stats */}
      {(channel === 'all' || channel === 'all') && (
        <StatCardSection
          title="Combined Overall"
          variant="default"
          stats={[
            {
              label: 'Total Orders',
              value: dashboardStats.combinedTotal || 342,
              icon: (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.960 9.541a1 1 0 00.894.459h7.26a1 1 0 00.894-.459l2.368-5.745.017-.041L16.78 3H3a1 1 0 000-2zm16 16a1 1 0 001-1v-2a1 1 0 00-1-1H1a1 1 0 00-1 1v2a1 1 0 001 1h18zM1 9a1 1 0 011-1h1v6H2a1 1 0 01-1-1V9z" />
                </svg>
              ),
              trend: { direction: 'up', percentage: 8 },
            },
            {
              label: 'Total Revenue',
              value: dashboardStats.combinedRevenue || 21500,
              icon: (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" />
                </svg>
              ),
              trend: { direction: 'up', percentage: 15 },
            },
            {
              label: 'Active Customers',
              value: dashboardStats.combinedCustomers || 1204,
              icon: (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0zM16 7a1 1 0 10-2 0v4h-4v2h6V7z" />
                </svg>
              ),
              trend: { direction: 'up', percentage: 12 },
            },
          ]}
        />
      )}

      {/* WhatsApp Performance */}
      {(channel === 'all' || channel === 'whatsapp') && (
        <StatCardSection
          title="WhatsApp Performance"
          variant="whatsapp"
          stats={[
            {
              label: 'WhatsApp Orders',
              value: dashboardStats.whatsappOrders || 198,
              trend: { direction: 'up', percentage: 12 },
            },
            {
              label: 'WhatsApp Revenue',
              value: dashboardStats.whatsappRevenue || 11600,
              trend: { direction: 'up', percentage: 18 },
            },
            {
              label: 'WhatsApp Pending',
              value: dashboardStats.whatsappPending || 8,
              trend: { direction: 'up', percentage: 2 },
            },
          ]}
        />
      )}

      {/* Website Performance */}
      {(channel === 'all' || channel === 'website') && (
        <StatCardSection
          title="Website Performance"
          variant="website"
          stats={[
            {
              label: 'Website Orders',
              value: dashboardStats.websiteOrders || 144,
              trend: { direction: 'up', percentage: 5 },
            },
            {
              label: 'Website Revenue',
              value: dashboardStats.websiteRevenue || 9900,
              trend: { direction: 'up', percentage: 10 },
            },
            {
              label: 'Website Pending',
              value: dashboardStats.websitePending || 4,
              trend: { direction: 'up', percentage: 1 },
            },
          ]}
        />
      )}

      {/* Live Order Status */}
      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H5.75A4.75 4.75 0 001 6.25v7.5A4.75 4.75 0 005.75 18.5h8.5A4.75 4.75 0 0019 13.75v-7.5A4.75 4.75 0 0014.25 1.5h-3.75m0-1v3m-5-3v3m9 13v-8" />
          </svg>
          Live Order Status
        </h2>

        <Card className="border border-gray-200">
          <CardHeader
            title="Recent Orders"
            subtitle="Latest orders from all channels"
          />
          <CardBody>
            <OrdersTable orders={sampleOrders.slice(0, 3)} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { usePlatform } from '@/lib/context/PlatformContext'
import { OrdersTable } from '@/components/dashboard/OrdersTable'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { sampleOrders } from '@/lib/data/sample-data'
import type { Order } from '@/lib/types'

const STATUS_FILTERS = ['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'] as const

export default function OrdersPage() {
  const { activePlatform } = usePlatform()
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'website'>('all')

  useEffect(() => {
    if (activePlatform === 'omnichannelal') {
      setChannelFilter('all')
    } else if (activePlatform === 'whatsapp') {
      setChannelFilter('whatsapp')
    } else if (activePlatform === 'website') {
      setChannelFilter('website')
    }
  }, [activePlatform])

  const filteredOrders = useMemo(() => {
    return sampleOrders.filter((order) => {
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
      const matchesSearch =
        searchQuery === '' ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesChannel = channelFilter === 'all' || order.source.toLowerCase() === channelFilter
      return matchesStatus && matchesSearch && matchesChannel
    })
  }, [selectedStatus, searchQuery, channelFilter])

  const getStatusCount = (status: string) => {
    if (status === 'all') return sampleOrders.length
    return sampleOrders.filter((o) => o.status === status).length
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    } as const
    return colorMap[status] || 'default'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track all restaurant orders
          </p>
        </div>
        <Button variant="primary">+ New Order</Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader title="Filter Orders" />
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by order number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Channel Filter - Only show if Omnichannel */}
          {activePlatform === 'omnichannelal' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setChannelFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channelFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Channels
              </button>
              <button
                onClick={() => setChannelFilter('whatsapp')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channelFilter === 'whatsapp'
                    ? 'bg-primary-dashboard text-white'
                    : 'bg-primary-dashboard/10 text-primary-dashboard hover:bg-primary-dashboard/20'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setChannelFilter('website')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channelFilter === 'website'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Website
              </button>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({getStatusCount(status)})
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader title={`${filteredOrders.length} Orders Found`} />
        <CardBody>
          <OrdersTable orders={filteredOrders} />
        </CardBody>
      </Card>
    </div>
  )
}

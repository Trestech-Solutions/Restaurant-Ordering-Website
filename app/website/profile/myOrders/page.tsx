'use client'

import { useState, useMemo } from 'react'
import { useCart } from '@/lib/hooks/useCart'
import { ProfileLayout } from '@/components/website/ProfileLayout'
import { Loader2, Package, ChevronDown, ChevronUp, Clock, Bike, Store, Receipt } from 'lucide-react'
import { useGetOrderHistory } from '@/api/client/customer'
import { useGetOrder as useGetOrderDetail } from '@/api/client/checkout'
import type { OrderHistoryItem } from '@/api/types'

const NON_TERMINAL_STATUSES = new Set([
  'Pending', 'Received', 'Accepted', 'Preparing',
  'Ready', 'Out for Delivery', 'Out-for-delivery', 'Out_For_Delivery',
  'On The Way', 'Out For Delivery', 'In Progress', 'Processing',
  'Assigned', 'Dispatched', 'Shipped',
])

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function fmtMoney(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return 'Rs. 0'
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (isNaN(n)) return 'Rs. 0'
  return 'Rs. ' + Math.round(n).toLocaleString()
}

function statusClasses(status: string): { pill: string; dot: string } {
  const s = (status || '').toLowerCase()
  if (s.includes('cancel'))        return { pill: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
  if (s.includes('deliver'))       return { pill: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
  if (s.includes('ready') || s.includes('out') || s.includes('dispatch') || s.includes('ship'))
                                    return { pill: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' }
  if (s.includes('prepar') || s.includes('progress') || s.includes('process') || s.includes('accepted') || s.includes('received'))
                                    return { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
  return { pill: 'bg-neutral-100 text-neutral-700', dot: 'bg-neutral-400' }
}

function isActiveOrder(o: { status: string }): boolean {
  const s = (o.status || '').toLowerCase()
  return NON_TERMINAL_STATUSES.has(o.status) || !['delivered', 'cancelled', 'canceled', 'rejected', 'refunded', 'failed', 'completed'].includes(s)
}

export default function MyOrdersPage() {
  const { user } = useCart()
  const [tab, setTab] = useState<'active' | 'past'>('active')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: history = [], isLoading, refetch } = useGetOrderHistory()

  const { active, past } = useMemo(() => {
    const list: OrderHistoryItem[] = Array.isArray(history) ? history : []
    return {
      active: list.filter(isActiveOrder),
      past:   list.filter((o) => !isActiveOrder(o)),
    }
  }, [history])

  const orders = tab === 'active' ? active : past

  if (!user) return null

  return (
    <ProfileLayout>
      {/* Tabs + counts */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm mb-4">
        {(['active', 'past'] as const).map((t) => {
          const count = t === 'active' ? active.length : past.length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-4 text-sm font-semibold capitalize transition-colors relative ${
                tab === t
                  ? 'bg-[#000000] text-white'
                  : 'bg-white text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {t === 'active' ? 'Active Orders' : 'Past Orders'}
              <span className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] ${
                tab === t ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#000000]"
          type="button"
        >
          <Loader2 size={12} className={isLoading ? 'animate-spin text-[#000000]' : ''} />
          Refresh
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 rounded-xl border border-neutral-200 bg-white shadow-sm text-sm text-neutral-500">
          <Loader2 size={14} className="animate-spin text-[#000000]" /> Loading orders…
        </div>
      )}

      {/* Order cards */}
      {!isLoading && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                <Package size={24} className="text-neutral-400" />
              </div>
              <p className="text-sm text-[#000000] font-semibold">{tab === 'active' ? 'No active orders' : 'No past orders'}!</p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                {tab === 'active'
                  ? 'Your active orders will appear here once you place them.'
                  : 'Completed and cancelled orders will appear here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <OrderRow
                  key={o.id}
                  order={o}
                  expanded={expandedId === o.id}
                  onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </ProfileLayout>
  )
}

function OrderRow({
  order, expanded, onToggle,
}: {
  order: OrderHistoryItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cls = statusClasses(order.status)
  return (
    <div>
      <button
        onClick={onToggle}
        type="button"
        className="w-full text-left px-6 py-5 hover:bg-neutral-50/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt size={14} className="text-[#000000]" />
              <p className="text-base font-bold text-neutral-900">Order #{order.order_no}</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cls.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cls.dot}`} />
                {order.status}
              </span>
            </div>
            <p className="text-xs text-neutral-400 inline-flex items-center gap-1">
              <Clock size={11} /> {fmtDate(order.placed_at)}
            </p>
          </div>
          <div className="text-right space-y-0.5 shrink-0">
            <p className="text-sm font-bold text-neutral-900">{fmtMoney(order.total)}</p>
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">
              {order.payment_method}
            </p>
            <div className="pt-1 flex justify-end text-neutral-400">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            {order.order_type?.toLowerCase().includes('pickup')
              ? <><Store size={12} /> Pickup</>
              : <><Bike size={12} /> Delivery</>
            }
          </span>
          {order.branch_name && (
            <span className="inline-flex items-center gap-1.5">
              <Store size={12} /> {order.branch_name}
            </span>
          )}
          {order.items_count > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Package size={12} /> {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
            </span>
          )}
          {order.estimated_delivery_at && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} /> ETA {fmtDate(order.estimated_delivery_at)}
            </span>
          )}
        </div>
      </button>

      {expanded && <OrderDetail orderId={order.id} />}
    </div>
  )
}

function OrderDetail({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useGetOrderDetail({ orderId })
  if (isLoading) {
    return (
      <div className="px-6 pb-5 flex items-center gap-2 text-xs text-neutral-500">
        <Loader2 size={12} className="animate-spin text-[#000000]" /> Loading details…
      </div>
    )
  }
  if (!order) {
    return null
  }
  const items = (order as any).items || []
  return (
    <div className="border-t border-neutral-100 bg-neutral-50/60 px-6 py-4 space-y-3">
      {items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          {items.map((it: any, idx: number) => {
            const qty = it.quantity ?? 1
            const price = parseFloat(String(it.unit_price ?? it.price ?? 0))
            const name  = it.product_name || it.name || `Item ${idx + 1}`
            const img   = it.product_image
            return (
              <div key={idx} className="flex items-center gap-3 px-4 py-3 text-sm">
                {img && (
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-800 truncate">{name}</p>
                  {it.variant_name && (
                    <p className="text-[11px] text-neutral-400">{it.variant_name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-neutral-800">
                    {fmtMoney(price * qty)}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {qty} × {fmtMoney(price)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-2 text-xs">
        <Row k="Subtotal"         v={fmtMoney((order as any).subtotal)} />
        {Number((order as any).discount || 0) > 0 &&
          <Row k="Discount"       v={fmtMoney((order as any).discount)} vClass="text-red-600 font-semibold" />
        }
        {Number((order as any).delivery_fee || 0) > 0 &&
          <Row k="Delivery Fee"   v={fmtMoney((order as any).delivery_fee)} />
        }
        {Number((order as any).tax || 0) > 0 &&
          <Row k="Tax"            v={fmtMoney((order as any).tax)} />
        }
        <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-sm">
          <span className="font-bold text-neutral-800">Grand Total</span>
          <span className="font-bold text-[#000000]">{fmtMoney((order as any).grand_total ?? (order as any).total)}</span>
        </div>
      </div>

      {/* Address / customer info, if present */}
      {((order as any).delivery_address || (order as any).customer_name || (order as any).customer_phone) && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-1.5 text-xs">
          {(order as any).customer_name && (
            <p className="text-sm font-semibold text-neutral-800">{(order as any).customer_name}</p>
          )}
          {(order as any).customer_phone && (
            <p className="text-neutral-500">📞 {(order as any).customer_phone}</p>
          )}
          {(order as any).delivery_address && (
            <p className="text-neutral-500">📍 {(order as any).delivery_address}</p>
          )}
          {(order as any).special_instructions && (
            <p className="text-neutral-500 pt-1">
              <span className="font-semibold">Note:</span> {(order as any).special_instructions}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ k, v, vClass }: { k: string; v: string; vClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{k}</span>
      <span className={vClass ?? 'text-neutral-800 font-medium'}>{v}</span>
    </div>
  )
}

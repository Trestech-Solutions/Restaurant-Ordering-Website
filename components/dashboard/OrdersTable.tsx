import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

interface OrdersTableProps {
  orders: Order[]
  isLoading?: boolean
}

function getStatusBadgeVariant(status: Order['status']) {
  const variantMap = {
    pending: 'warning',
    preparing: 'info',
    ready: 'success',
    completed: 'success',
    cancelled: 'error',
  } as const
  return variantMap[status]
}

function formatStatusLabel(status: string) {
  const labelMap: Record<string, string> = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return labelMap[status] || status
}

export function OrdersTable({ orders, isLoading = false }: OrdersTableProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
  }

  if (orders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No orders found</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell isHeader>Order</TableCell>
          <TableCell isHeader>Customer</TableCell>
          <TableCell isHeader>Items</TableCell>
          <TableCell isHeader>Status</TableCell>
          <TableCell isHeader>Total</TableCell>
          <TableCell isHeader>Time</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} isClickable>
            <TableCell className="font-medium text-primary-dashboard">{order.orderNumber}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {formatStatusLabel(order.status)}
              </Badge>
            </TableCell>
            <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{order.timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  description?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = 'bg-blue-bg',
  iconColor = 'text-blue',
  trend,
  description,
}: StatCardProps) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={`text-xs font-semibold ${trend.direction === 'up' ? 'text-primary-dashboard' : 'text-red'}`}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
            </span>
            <span className="text-xs text-muted-foreground">
              {trend.direction === 'up' ? 'increase' : 'decrease'}
            </span>
          </div>
        )}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBgColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </Card>
  )
}

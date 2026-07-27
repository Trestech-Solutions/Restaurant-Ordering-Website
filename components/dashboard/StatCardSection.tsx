import React from 'react'
import { Card } from '@/components/ui/Card'

interface StatItem {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { direction: 'up' | 'down'; percentage: number }
}

interface StatCardSectionProps {
  title: string
  subtitle?: string
  variant?: 'default' | 'whatsapp' | 'website'
  stats: StatItem[]
}

export function StatCardSection({
  title,
  subtitle,
  variant = 'default',
  stats,
}: StatCardSectionProps) {
  const getBgClass = () => {
    switch (variant) {
      case 'whatsapp':
        return 'bg-primary-dashboard-bg'
      case 'website':
        return 'bg-blue-bg'
      default:
        return 'bg-white'
    }
  }

  const getBorderClass = () => {
    switch (variant) {
      case 'whatsapp':
        return 'border-primary-dashboard-border'
      case 'website':
        return 'border-blue-border'
      default:
        return 'border-gray-200'
    }
  }

  const getTitleClass = () => {
    switch (variant) {
      case 'whatsapp':
        return 'text-primary-dashboard'
      case 'website':
        return 'text-blue'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="mb-8">
      <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${getTitleClass()} mb-4`}>
        {variant === 'whatsapp' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        )}
        {variant === 'website' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
          </svg>
        )}
        {variant === 'default' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        )}
        {title}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className={`p-6 ${getBgClass()} ${getBorderClass()} border`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              {stat.icon && <div>{stat.icon}</div>}
            </div>

            <div className="mb-2">
              <div className="text-3xl font-bold tracking-tight text-gray-900">
                {typeof stat.value === 'number' && stat.label.includes('Revenue')
                  ? `$${stat.value.toLocaleString()}`
                  : stat.value.toLocaleString()}
              </div>
            </div>

            {stat.trend && (
              <div className="text-sm font-medium text-gray-600">
                <span className={stat.trend.direction === 'up' ? 'text-primary-dashboard' : 'text-red-600'}>
                  {stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.percentage}% from last week
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

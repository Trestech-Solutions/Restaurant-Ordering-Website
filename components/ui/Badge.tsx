import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-muted text-foreground',
    success: 'bg-primary-dashboard-bg text-primary-dashboard border border-primary-dashboard-border',
    warning: 'bg-amber-bg text-amber',
    error: 'bg-red-bg text-red',
    info: 'bg-blue-bg text-blue border border-blue-border',
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

'use client'

import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { StatCard } from '@/components/dashboard/StatCard'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react'
import { sampleAnalytics } from '@/lib/data/sample-data'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-2 text-muted-foreground">Comprehensive business metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${sampleAnalytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconBgColor="bg-primary-dashboard-bg"
          iconColor="text-primary-dashboard"
          trend={{ direction: 'up', percentage: 15 }}
        />
        <StatCard
          title="Total Orders"
          value={sampleAnalytics.totalOrders.toLocaleString()}
          icon={Package}
          iconBgColor="bg-blue-bg"
          iconColor="text-blue"
          trend={{ direction: 'up', percentage: 8 }}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${sampleAnalytics.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          iconBgColor="bg-primary-dashboard-bg"
          iconColor="text-primary-dashboard"
          trend={{ direction: 'up', percentage: 5 }}
        />
        <StatCard
          title="Customers Served"
          value={sampleAnalytics.customersServed.toLocaleString()}
          icon={Users}
          iconBgColor="bg-purple-bg"
          iconColor="text-purple"
          trend={{ direction: 'up', percentage: 12 }}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader title="Revenue Trend" subtitle="Daily revenue over the past week" />
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleAnalytics.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Orders by Hour */}
      <Card>
        <CardHeader title="Orders by Hour" subtitle="Distribution of orders throughout the day" />
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleAnalytics.ordersByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Top Menu Items */}
      <Card>
        <CardHeader title="Top Menu Items" subtitle="Best-selling items this month" />
        <CardBody>
          <div className="space-y-4">
            {sampleAnalytics.topItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${item.price}</p>
                  <p className="text-xs text-muted-foreground">Top seller</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

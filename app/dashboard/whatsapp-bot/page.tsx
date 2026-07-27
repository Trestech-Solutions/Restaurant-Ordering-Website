'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MessageCircle, QrCode, Activity, Copy } from 'lucide-react'

export default function WhatsAppBotPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false)
  const [businessHours, setBusinessHours] = useState(false)

  const handleConnect = () => {
    console.log('[v0] WhatsApp Bot Connection Requested')
    setIsConnected(!isConnected)
  }

  const handleToggleAutoReply = () => {
    console.log('[v0] Auto Reply Toggled:', !autoReplyEnabled)
    setAutoReplyEnabled(!autoReplyEnabled)
  }

  const handleToggleBusinessHours = () => {
    console.log('[v0] Business Hours Only Toggled:', !businessHours)
    setBusinessHours(!businessHours)
  }

  const handleSaveTemplates = () => {
    const templates = ['Order confirmation', 'Delivery notification', 'Customer inquiry']
    console.log('[v0] Message Templates Saved:', templates)
    alert('Templates saved! Check console for details.')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <MessageCircle className="h-8 w-8" />
            WhatsApp Business Bot
          </h1>
          <p className="mt-2 text-muted-foreground">Automate customer interactions via WhatsApp</p>
        </div>
        <Button
          variant={isConnected ? 'danger' : 'primary'}
          onClick={handleConnect}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          {isConnected ? 'Disconnect' : 'Connect Account'}
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader title="Connection Status" />
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">WhatsApp Account</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isConnected ? '+1-555-0100 • Connected' : 'Not connected'}
              </p>
            </div>
            <Badge variant={isConnected ? 'success' : 'error'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* QR Code */}
      {!isConnected && (
        <Card>
          <CardHeader title="Scan QR Code to Connect" subtitle="Use your WhatsApp Business account" />
          <CardBody>
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">QR Code will appear here</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  1. Open WhatsApp on your phone
                  <br />
                  2. Go to Settings → Linked Devices
                  <br />
                  3. Scan this QR code
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Settings */}
      {isConnected && (
        <>
          <Card>
            <CardHeader title="Bot Settings" />
            <CardBody>
              <div className="space-y-4">
                {/* Auto Reply */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Auto Reply</p>
                    <p className="text-sm text-muted-foreground">
                      Send automatic responses to customer messages
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAutoReply}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoReplyEnabled ? 'bg-primary-dashboard' : 'bg-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Business Hours */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Business Hours Only</p>
                    <p className="text-sm text-muted-foreground">
                      Only respond during business hours
                    </p>
                  </div>
                  <button
                    onClick={handleToggleBusinessHours}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      businessHours ? 'bg-primary-dashboard' : 'bg-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        businessHours ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Business Hours Config */}
                {businessHours && (
                  <div className="rounded-lg border border-border bg-muted p-4">
                    <p className="text-sm font-medium text-foreground mb-3">Hours</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      />
                      <input
                        type="time"
                        defaultValue="21:00"
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Message Templates */}
          <Card>
            <CardHeader
              title="Message Templates"
              action={
                <Button variant="ghost" size="sm" onClick={handleSaveTemplates}>
                  Save
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-4">
                {[
                  { title: 'Order Confirmation', content: 'Your order #123 has been confirmed!' },
                  {
                    title: 'Delivery Notification',
                    content: 'Your order is on the way! ETA: 45 minutes',
                  },
                  {
                    title: 'Customer Inquiry',
                    content: 'Thank you for contacting us. How can we help?',
                  },
                ].map((template, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <p className="font-medium text-foreground">{template.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{template.content}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader title="Bot Capabilities" />
            <CardBody>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { icon: '📋', label: 'Order Tracking' },
                  { icon: '🕐', label: 'Reservation Booking' },
                  { icon: '📞', label: 'Customer Support' },
                  { icon: '🎁', label: 'Promotions & Offers' },
                  { icon: '🔔', label: 'Notifications' },
                  { icon: '📞', label: 'Contact Information' },
                ].map((capability, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="text-lg">{capability.icon}</span>
                    <span className="text-sm font-medium text-foreground">{capability.label}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* API Key */}
          <Card>
            <CardHeader title="API Configuration" />
            <CardBody>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Key</p>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 text-sm text-foreground font-mono">
                    whatsapp_1a2b3c4d5e6f7g8h9i0j
                  </code>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-border transition-colors">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Use this key to integrate WhatsApp Bot with your external systems
                </p>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}

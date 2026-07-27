'use client'

import { useState } from 'react'
import { usePlatform, type Platform } from '@/lib/context/PlatformContext'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MessageCircle, Globe, Grid3x3 } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const { activePlatform, setActivePlatform } = usePlatform()

  const handlePlatformChange = (platform: Platform) => {
    setActivePlatform(platform)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your restaurant profile, billing, and platform preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 bg-white rounded-t-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚙️ General
        </button>
        <button
          onClick={() => setActiveTab('platform')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'platform'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⬛ Platform
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'billing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💳 Billing
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'team'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Team
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'alerts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🚨 Alerts
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🔒 Security
        </button>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <Card>
          <CardHeader title="Restaurant Profile" subtitle="This information will be displayed to your customers." />
          <CardBody>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Restaurant Name</label>
                  <input type="text" defaultValue="Bistro" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                  <input type="text" defaultValue="+1 (555) 019-2834" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue="Artisan Burgers & Craft Pasta" rows={4} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Address</label>
                <input type="text" defaultValue="123 Culinary Ave, Food" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
              </div>
              <Button variant="primary">Save Changes</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Platform Tab */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              Platform Mode <span className="text-xs font-semibold bg-gray-900 text-white px-2 py-1 rounded">Developer Feature</span>
            </h2>
            <p className="text-gray-600 mb-6">Toggle the active channels to see how the dashboard adapts. In production, this would be tied to the customer&apos;s subscription tier.</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* WhatsApp Only */}
            <button
              onClick={() => handlePlatformChange('whatsapp')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                activePlatform === 'whatsapp'
                  ? 'border-primary-dashboard bg-primary-dashboard/10'
                  : 'border-gray-200 bg-white hover:border-primary-dashboard/30'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-lg ${activePlatform === 'whatsapp' ? 'bg-primary-dashboard/20' : 'bg-gray-100'}`}>
                  <MessageCircle className={`w-8 h-8 ${activePlatform === 'whatsapp' ? 'text-primary-dashboard' : 'text-gray-600'}`} />
                </div>
              </div>
              <h3 className="font-bold text-center text-gray-900 mb-2">WhatsApp Only</h3>
              <p className="text-sm text-gray-600 text-center">Focuses dashboard strictly on bot management and chat orders.</p>
            </button>

            {/* Website Only */}
            <button
              onClick={() => handlePlatformChange('website')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                activePlatform === 'website'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-lg ${activePlatform === 'website' ? 'bg-blue-200' : 'bg-gray-100'}`}>
                  <Globe className={`w-8 h-8 ${activePlatform === 'website' ? 'text-blue-700' : 'text-gray-600'}`} />
                </div>
              </div>
              <h3 className="font-bold text-center text-gray-900 mb-2">Website Only</h3>
              <p className="text-sm text-gray-600 text-center">Focuses dashboard strictly on the website builder and web orders.</p>
            </button>

            {/* Omnichannel */}
            <button
              onClick={() => handlePlatformChange('omnichannelal')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                activePlatform === 'omnichannelal'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-lg ${activePlatform === 'omnichannelal' ? 'bg-gray-300' : 'bg-gray-100'}`}>
                  <Grid3x3 className={`w-8 h-8 ${activePlatform === 'omnichannelal' ? 'text-gray-900' : 'text-gray-600'}`} />
                </div>
              </div>
              <h3 className="font-bold text-center text-gray-900 mb-2">Omnichannel (Both)</h3>
              <p className="text-sm text-gray-600 text-center">Full suite combining WhatsApp automation with a branded website.</p>
            </button>
          </div>
        </div>
      )}

      {/* Other Tabs Placeholder */}
      {['billing', 'team', 'alerts', 'security'].includes(activeTab) && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500 capitalize">{activeTab} settings coming soon</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

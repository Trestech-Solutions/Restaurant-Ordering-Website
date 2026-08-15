'use client'

import { useState, useEffect } from 'react'
import { OrderTypeModal } from './OrderTypeModal'
import { useCart } from '@/lib/hooks/useCart'

/**
 * - Shows OrderTypeModal on first visit (when no location saved).
 * - Also shows it whenever openLocationModal() is called from anywhere
 *   (e.g. the "Change Location" button in the topbar).
 */
export function WebsiteBootstrap() {
  const { location, locationModalOpen, closeLocationModal } = useCart()
  const [showOnce, setShowOnce] = useState(false)

  // Show on first load only if location not yet set
  useEffect(() => {
    if (!location) setShowOnce(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss the first-visit modal once location is picked
  useEffect(() => {
    if (location) setShowOnce(false)
  }, [location])

  const isOpen = showOnce || locationModalOpen

  if (!isOpen) return null

  return (
    <OrderTypeModal
      onClose={() => {
        setShowOnce(false)
        closeLocationModal()
      }}
    />
  )
}

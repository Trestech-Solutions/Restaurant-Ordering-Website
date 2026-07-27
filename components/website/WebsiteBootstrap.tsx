'use client'

import { useState, useEffect } from 'react'
import { OrderTypeModal } from './OrderTypeModal'
import { useCart } from '@/lib/context/CartContext'

/**
 * Shows the OrderTypeModal when the website first loads.
 * Dismissed once the user selects a location.
 */
export function WebsiteBootstrap() {
  const { location } = useCart()
  const [showModal, setShowModal] = useState(false)

  // Only show on client mount — avoids SSR mismatch
  useEffect(() => {
    setShowModal(true)
  }, [])

  // Auto-dismiss once location is set via the modal
  useEffect(() => {
    if (location) setShowModal(false)
  }, [location])

  if (!showModal) return null

  return <OrderTypeModal onClose={() => setShowModal(false)} />
}

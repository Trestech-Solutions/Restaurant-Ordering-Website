'use client'

import { useState, useEffect } from 'react'
import { OrderTypeModal } from './OrderTypeModal'
import { useCart } from '@/lib/context/CartContext'

/**
 * Shows the OrderTypeModal only when no location has been saved yet.
 * Once a location is set it persists in localStorage, so the modal
 * won't appear again on subsequent page visits or navigations.
 * It can be re-triggered by clicking "Change Location" in the topbar.
 */
export function WebsiteBootstrap() {
  const { location } = useCart()
  const [showModal, setShowModal] = useState(false)

  // After the CartProvider hydrates from localStorage, show the modal
  // only if there is still no location saved.
  useEffect(() => {
    if (!location) {
      setShowModal(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss as soon as the user picks a location
  useEffect(() => {
    if (location) setShowModal(false)
  }, [location])

  if (!showModal) return null

  return <OrderTypeModal onClose={() => setShowModal(false)} />
}

'use client'

import WebsiteLayout from './website/layout'
import HomePage from './website/home/page'

export default function RootHomePage() {
  return (
    <WebsiteLayout>
      <HomePage />
    </WebsiteLayout>
  )
}
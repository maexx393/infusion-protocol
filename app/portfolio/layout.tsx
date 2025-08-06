'use client'

import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar activeTab="portfolio" onTabChange={() => {}} />
        <main className="flex-1 px-6 pb-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
} 
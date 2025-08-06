'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { DashboardGrid } from '@/components/dashboard-grid'
import { AIPortfolioDashboard } from '@/components/dashboard/ai-portfolio-dashboard'
import { AchievementCard } from '@/components/gamification/achievement-card'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'



export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar activeTab="dashboard" onTabChange={() => {}} />
        
        <main className="flex-1 px-6 pb-6 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8 pt-4">
            {/* Hero Section */}
            <div className="text-center py-12">
              <h1 className="text-5xl font-bold text-white mb-4">
                InFusion DeFi
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                AI-powered DeFi protocol for Cross-Chain swaps and portfolio management
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/trading">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
                    Start Trading
                  </Button>
                </Link>
                <Button variant="neutral-secondary" className="border-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <DashboardGrid />
            </div>

            {/* AI Portfolio Dashboard */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <AIPortfolioDashboard />
            </div>

            {/* Gamification */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AchievementCard
                  achievement={{
                    id: '1',
                    title: 'First Swap',
                    description: 'Complete your first cross-chain swap',
                    icon: '🔄',
                    category: 'swap',
                    rarity: 'common',
                    progress: 1,
                    maxProgress: 1,
                    unlocked: true,
                    unlockedAt: new Date(),
                    xpReward: 100,
                    points: 50
                  }}
                />
                <AchievementCard
                  achievement={{
                    id: '2',
                    title: 'Multi-Chain Explorer',
                    description: 'Use 5 different blockchain networks',
                    icon: '🌐',
                    category: 'chain',
                    rarity: 'rare',
                    progress: 3,
                    maxProgress: 5,
                    unlocked: false,
                    xpReward: 500,
                    points: 250
                  }}
                />
                <AchievementCard
                  achievement={{
                    id: '3',
                    title: 'AI Strategist',
                    description: 'Execute 10 AI-powered strategies',
                    icon: '🤖',
                    category: 'social',
                    rarity: 'epic',
                    progress: 7,
                    maxProgress: 10,
                    unlocked: false,
                    xpReward: 1000,
                    points: 500
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  )
} 
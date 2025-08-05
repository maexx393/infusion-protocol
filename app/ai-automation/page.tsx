'use client'

import { AIAutomationDashboard } from '@/components/ai/ai-automation-dashboard'

export default function AIAutomationPage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">AI Automation</h1>
        <p className="text-xl text-gray-300">
          Intelligent wallet automation powered by AI agents
        </p>
      </div>
      
      <AIAutomationDashboard />
    </div>
  )
} 
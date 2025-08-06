'use client'

import { UnifiedCrossChainSwap } from '@/components/swap/unified-cross-chain-swap'

export default function SwapPage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Atomic Swap</h1>
      </div>
      
      <UnifiedCrossChainSwap />
    </div>
  )
} 
'use client'

import React from 'react'
import { UnifiedCrossChainSwap } from '@/components/swap/unified-cross-chain-swap'
import { motion } from 'framer-motion'

export default function InfusionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            InFusion
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Agentic AI-Powered Cross-Chain DeFi Protocol
          </p>
          <p className="text-sm text-gray-400">
            Real atomic swaps with AI orchestration across Solana, EVM, NEAR, Bitcoin & Algorand
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <UnifiedCrossChainSwap />
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12 text-gray-400 text-sm"
        >
          <p>Powered by Real AI Agents • Production Cross-Chain Infrastructure • Revenue-Generating On-Chain Fees</p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="px-3 py-1 bg-purple-600/20 rounded-full text-purple-300 text-xs">
              Atomic Swaps
            </span>
            <span className="px-3 py-1 bg-blue-600/20 rounded-full text-blue-300 text-xs">
              AI Orchestration  
            </span>
            <span className="px-3 py-1 bg-green-600/20 rounded-full text-green-300 text-xs">
              Real Production
            </span>
          </div>
        </motion.footer>
      </div>
    </main>
  )
}
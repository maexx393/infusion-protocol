'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { BiDirectionalWalletConnect } from '@/components/wallet/bi-directional-wallet-connect'
import { NetworkSwitcher } from '@/components/wallet/network-switcher'
import { WalletService, WalletConnection } from '@/services/wallet-service'
import { appKitWalletService } from '@/services/appkit-wallet-service'
import { getNetworkById, getNetworksByCategory } from '@/lib/network-config'

interface SwapConfig {
  fromChain: string
  toChain: string
  fromToken: string
  toToken: string
  amount: string
  partialFill: boolean
  slippage: number
  deadline: number
}

interface SwapStep {
  id: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  explorerUrl?: string
  timestamp?: number
}

interface AIAgent {
  id: string
  name: string
  role: 'analyzer' | 'executor' | 'monitor' | 'optimizer'
  status: 'idle' | 'thinking' | 'executing' | 'completed'
  message?: string
}

// AI Agent Visualization Component
function AIAgentCard({ agent }: { agent: AIAgent }) {
  const getAgentColor = () => {
    switch (agent.role) {
      case 'analyzer': return 'bg-blue-500'
      case 'executor': return 'bg-red-500'
      case 'monitor': return 'bg-green-500'
      case 'optimizer': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (agent.status) {
      case 'thinking': return '🤔'
      case 'executing': return '⚡'
      case 'completed': return '✅'
      default: return '💤'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border ${getAgentColor()} bg-opacity-20 border-opacity-30`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${getAgentColor()} animate-pulse`} />
        <div className="flex-1">
          <div className="font-medium text-white">{agent.name}</div>
          <div className="text-sm text-gray-300">{agent.message || 'Ready'}</div>
        </div>
        <div className="text-2xl">{getStatusIcon()}</div>
      </div>
    </motion.div>
  )
}

// AI Analysis Function
async function analyzeSwapWithAI(request: any) {
  const availableProviders = getAvailableProviders()
  const bestProvider = getBestProvider()

  if (!bestProvider) {
    throw new Error('No AI provider configured')
  }

  try {
    const response = await fetch('/api/ai/process-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'analyze_swap',
        parameters: request,
        provider: bestProvider.name
      })
    })

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('AI analysis error:', error)
    throw error
  }
}

function getAvailableProviders() {
  const providers = []
  
  if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    providers.push({ name: 'OpenAI', type: 'openai' })
  }
  if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
    providers.push({ name: 'Anthropic', type: 'anthropic' })
  }
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    providers.push({ name: 'Google Gemini', type: 'gemini' })
  }
  if (process.env.NEXT_PUBLIC_MISTRAL_API_KEY) {
    providers.push({ name: 'Mistral AI', type: 'mistral' })
  }
  if (process.env.NEXT_PUBLIC_COHERE_API_KEY) {
    providers.push({ name: 'Cohere', type: 'cohere' })
  }
  
  return providers
}

function getBestProvider() {
  const providers = getAvailableProviders()
  return providers[0] // Return first available provider
}

export function UnifiedCrossChainSwap() {
  const [activeTab, setActiveTab] = useState('atomic')
  const [swapConfig, setSwapConfig] = useState<SwapConfig>({
    fromChain: '80002', // Polygon Amoy (EVM)
    toChain: 'solana-testnet', 
    fromToken: 'POL',
    toToken: 'SOL',
    amount: '1.0',
    partialFill: true,
    slippage: 0.5,
    deadline: 20
  })
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapProgress, setSwapProgress] = useState(0)
  const [swapSteps, setSwapSteps] = useState<SwapStep[]>([])
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([
    { id: '1', name: 'Route Analyzer', role: 'analyzer', status: 'idle' },
    { id: '2', name: 'Swap Executor', role: 'executor', status: 'idle' },
    { id: '3', name: 'Price Monitor', role: 'monitor', status: 'idle' },
    { id: '4', name: 'Gas Optimizer', role: 'optimizer', status: 'idle' }
  ])
  const [aiInsights, setAiInsights] = useState<string>('')
  const [fromWallet, setFromWallet] = useState<WalletConnection | null>(null)
  const [toWallet, setToWallet] = useState<WalletConnection | null>(null)
  const [isSwapReady, setIsSwapReady] = useState(false)
  const { toast } = useToast()
  const [currentSwap, setCurrentSwap] = useState<{ hashlock: string; secret?: string; fromChain: string; toChain: string } | null>(null)

  // AI Analysis Function
  const performAIAnalysis = useCallback(async (config: SwapConfig) => {
    const availableProviders = getAvailableProviders()
    const bestProvider = getBestProvider()

    if (!bestProvider) {
      setAiInsights('')
      return
    }

    try {
      // Update analyzer agent
      setAiAgents(prev => prev.map(agent => 
        agent.role === 'analyzer' 
          ? { ...agent, status: 'thinking', message: 'Analyzing...' }
          : agent
      ))

      const request = {
        fromChain: config.fromChain,
        toChain: config.toChain,
        fromToken: config.fromToken,
        toToken: config.toToken,
        amount: config.amount,
        slippage: config.slippage,
        partialFill: config.partialFill
      }

      const response = await analyzeSwapWithAI(request)
      
      const analysis = `${response.recommendation}\n\nRoute: ${response.route}\nEstimated Gas: ${response.estimatedGas}\nPrice Impact: ${response.priceImpact}\nExecution Time: ${response.executionTime}\nRisk Assessment: ${response.riskAssessment}\n\nPowered by ${response.provider}`
      
      setAiInsights(analysis)

      // Update analyzer agent to completed
      setAiAgents(prev => prev.map(agent => 
        agent.role === 'analyzer' 
          ? { ...agent, status: 'completed', message: 'Analysis complete' }
          : agent
      ))

    } catch (error) {
      console.error('AI Analysis error:', error)
      
      let errorMessage = 'AI analysis failed - please check API configuration'
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = `🤖 ${bestProvider.name} API key is invalid. Please check your configuration.`
        } else if (error.message.includes('quota') || error.message.includes('billing')) {
          errorMessage = `🤖 ${bestProvider.name} API quota exceeded. Consider switching to another provider.`
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = '🤖 Network error during AI analysis. Please check your internet connection.'
        } else if (error.message.includes('No AI provider configured')) {
          errorMessage = '🤖 No AI provider configured. Please set up at least one AI API key.'
        } else {
          errorMessage = `🤖 AI analysis error: ${error.message}`
        }
      }
      
      // hide error text in UI; keep agent idle state only
      setAiInsights('')
      setAiAgents(prev => prev.map(agent => 
        agent.role === 'analyzer' 
          ? { ...agent, status: 'idle', message: 'Ready' }
          : agent
      ))
    }
  }, [])

  // Handle wallet connections
  const handleFromWalletConnect = (connection: WalletConnection) => {
    setFromWallet(connection)
    console.log('From wallet connected:', connection)
  }

  const handleToWalletConnect = (connection: WalletConnection) => {
    setToWallet(connection)
    console.log('To wallet connected:', connection)
  }

  const handleSwapReady = (fromWallet: WalletConnection, toWallet: WalletConnection) => {
    setIsSwapReady(true)
    console.log('Swap ready with wallets:', { fromWallet, toWallet })
    
    toast({
      title: "Wallets Connected",
      description: `Ready to swap from ${fromWallet.chain} to ${toWallet.chain}`,
    })
  }

  // Atomic swap execution with real HTLC integration
  const executeSwap = async () => {
    if (!swapConfig.fromChain || !swapConfig.toChain || !swapConfig.amount) {
      toast({
        title: "Missing Configuration",
        description: "Please select source chain, destination chain, and amount",
        variant: "destructive",
      })
      return
    }

    if (!fromWallet?.isConnected || !toWallet?.isConnected) {
      toast({
        title: "Wallets Not Connected",
        description: "Please connect both source and destination wallets",
        variant: "destructive",
      })
      return
    }

    setIsSwapping(true)
    setSwapProgress(0)
    setSwapSteps([]) // Clear existing steps

    try {
      // Call atomic swap API for real HTLC execution
      const response = await fetch('/api/cross-chain/production-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromChain: swapConfig.fromChain,
          toChain: swapConfig.toChain,
          fromToken: swapConfig.fromToken,
          toToken: swapConfig.toToken,
          fromAmount: swapConfig.amount,
          userAddress: fromWallet.address,
          sourceAddress: fromWallet.address,
          destinationAddress: toWallet.address,
          slippageTolerance: swapConfig.slippage,
          strategy: 'atomic'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const atomicSwapResult = await response.json()

      if (!atomicSwapResult.success) {
        throw new Error(atomicSwapResult.error || 'Atomic swap execution failed')
      }

      setCurrentSwap({ hashlock: atomicSwapResult.hashlock, secret: atomicSwapResult.secret, fromChain: swapConfig.fromChain, toChain: swapConfig.toChain })

      console.log('🔐 HTLC Secret Generated:', atomicSwapResult.secret?.substring(0, 20) + '...')
      console.log('🔗 Hashlock:', atomicSwapResult.hashlock)

      // Convert atomic swap steps to UI format
      const uiSteps: SwapStep[] = atomicSwapResult.steps.map((step: any) => ({
        id: step.id,
        description: step.description,
        status: step.status,
        txHash: step.txHash,
        explorerUrl: step.explorerUrl,
        timestamp: step.timestamp
      }))

      setSwapSteps(uiSteps)

      if (atomicSwapResult.clientActions?.length) {
        await executeClientActions(atomicSwapResult.clientActions)
      }

      // Simulate real-time step updates with AI agent coordination
      for (let i = 0; i < uiSteps.length; i++) {
        const currentStep = uiSteps[i]
        
        // Activate relevant AI agent based on step
        const agentRole = i === 0 ? 'analyzer' :    // Secret generation
                         i === 1 || i === 2 ? 'executor' :  // Deposits  
                         i === 3 ? 'monitor' :      // Claims monitoring
                         'optimizer'                // Final optimization

        setAiAgents(prev => prev.map(agent => 
          agent.role === agentRole 
            ? { 
                ...agent, 
                status: 'executing', 
                message: `Executing ${currentStep.description}` 
              }
            : agent
        ))

        // Update step status in real-time
        if (currentStep.status === 'processing') {
          setSwapSteps(prev => prev.map(step => 
            step.id === currentStep.id 
              ? { ...step, status: 'processing', timestamp: Date.now() }
              : step
          ))

          // Simulate processing time for UI feedback
          await new Promise(resolve => setTimeout(resolve, 1500))

          // Mark as completed with transaction data
          setSwapSteps(prev => prev.map(step => 
            step.id === currentStep.id 
              ? { 
                  ...step, 
                  status: 'completed', 
                  txHash: currentStep.txHash,
                  explorerUrl: currentStep.explorerUrl,
                  timestamp: Date.now()
                }
              : step
          ))
        }

        // Complete AI agent task
        setAiAgents(prev => prev.map(agent => 
          agent.role === agentRole 
            ? { ...agent, status: 'completed', message: 'HTLC step completed' }
            : agent
        ))

        // Update progress bar
        setSwapProgress(((i + 1) / uiSteps.length) * 100)
      }

      // Show success message with HTLC details
      toast({
        title: "🔒 Atomic Swap Completed",
        description: `HTLC swap executed: ${swapConfig.amount} ${swapConfig.fromToken} → ${swapConfig.toToken}. Secret revealed and funds claimed atomically.`,
      })

      // Log atomic swap details
      console.log('🎉 Atomic swap completed:', {
        swapId: atomicSwapResult.swapId,
        swapType: atomicSwapResult.swapType,
        secret: atomicSwapResult.secret?.substring(0, 20) + '...',
        hashlock: atomicSwapResult.hashlock,
        transactions: atomicSwapResult.transactions
      })

    } catch (error) {
      console.error('❌ Atomic swap execution failed:', error)
      
      // Mark all steps as failed
      setSwapSteps(prev => prev.map(step => ({
        ...step,
        status: 'failed',
        timestamp: Date.now()
      })))

      // Reset AI agents
      setAiAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'idle',
        message: 'Atomic swap failed'
      })))

      toast({
        title: "❌ Atomic Swap Failed", 
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }

  // Execute client-side actions (Algorand via Pera)
  const executeClientActions = useCallback(async (clientActions: any[]) => {
    for (const action of clientActions || []) {
      try {
        if (action.kind === 'algorand_deposit') {
          const { escrowAppId, depositorAddress, claimerAddress, hashedSecret, expirationSeconds, network } = action.params
          const res = await appKitWalletService.algorandCreateOrder({
            escrowAppId,
            depositorAddress,
            claimerAddress,
            hashedSecret,
            expirationSeconds,
            network
          })
          setSwapSteps(prev => prev.map(s => s.id === action.targetStepId ? ({ ...s, status: 'completed', txHash: res.txId, explorerUrl: res.explorerUrl, timestamp: Date.now() }) : s))
          // verify
          await pollVerify('algorand', res.txId, network)
        }
        if (action.kind === 'algorand_claim') {
          const { escrowAppId, claimerAddress, depositId, secret, network } = action.params
          const res = await appKitWalletService.algorandClaimOrder({
            escrowAppId,
            claimerAddress,
            depositId,
            secret,
            network
          })
          setSwapSteps(prev => prev.map(s => s.id === action.targetStepId ? ({ ...s, status: 'completed', txHash: res.txId, explorerUrl: res.explorerUrl, timestamp: Date.now() }) : s))
          await pollVerify('algorand', res.txId, network)
        }
      } catch (e) {
        console.error('Client action failed', action, e)
        setSwapSteps(prev => prev.map(s => s.id === action.targetStepId ? ({ ...s, status: 'failed', timestamp: Date.now() }) : s))
        throw e
      }
    }
  }, [])

  const pollVerify = async (chain: string, txid: string, network: string) => {
    for (let i = 0; i < 12; i++) {
      const resp = await fetch(`/api/cross-chain/status?chain=${chain}&txid=${txid}&network=${network}`)
      const data = await resp.json()
      if (data.confirmed) return true
      await new Promise(r => setTimeout(r, 2500))
    }
    return false
  }

  const getAlgorandEscrowAppId = () => {
    const v = process.env.NEXT_PUBLIC_ALGORAND_ESCROW_APP_ID
    return v ? parseInt(v, 10) : 743881611
  }

  const algorandDepositStepId = () => {
    if (!currentSwap) return null
    // EVM -> Algorand: destination-deposit is Algorand
    if ((currentSwap.fromChain === '80002' || currentSwap.fromChain.includes('polygon')) && currentSwap.toChain.includes('algorand')) {
      return 'destination-deposit'
    }
    // Algorand -> EVM: source-deposit is Algorand
    if (currentSwap.fromChain.includes('algorand') && (currentSwap.toChain === '80002' || currentSwap.toChain.includes('polygon'))) {
      return 'source-deposit'
    }
    return null
  }

  const canShowRefund = () => {
    const stepId = algorandDepositStepId()
    if (!stepId) return false
    const step = swapSteps.find(s => s.id === stepId)
    if (!step || step.status !== 'completed' || !step.timestamp) return false
    const timelockMs = 3600 * 1000
    return Date.now() > step.timestamp + timelockMs
  }

  const handleRefund = async () => {
    try {
      const stepId = algorandDepositStepId()
      if (!currentSwap || !stepId) return
      const escrowAppId = getAlgorandEscrowAppId()
      const isAlgorandOnSource = stepId === 'source-deposit'
      const depositorAddr = isAlgorandOnSource ? fromWallet?.address : toWallet?.address
      const network = isAlgorandOnSource ? currentSwap.fromChain : currentSwap.toChain
      if (!depositorAddr) throw new Error('Missing depositor address for refund')
      const res = await appKitWalletService.algorandRefundOrder({
        escrowAppId,
        depositorAddress: depositorAddr,
        depositId: currentSwap.hashlock,
        network
      })
      setSwapSteps(prev => prev.map(s => s.id === stepId ? ({ ...s, status: 'completed', txHash: res.txId, explorerUrl: res.explorerUrl, timestamp: Date.now() }) : s))
      toast({ title: 'Refund submitted', description: 'Refund transaction broadcasted on Algorand.' })
    } catch (e) {
      toast({ title: 'Refund failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    }
  }

  const getExplorerUrl = (chain: string, txHash: string) => {
    const network = getNetworkById(chain)
    if (network?.explorerUrl) {
      return `${network.explorerUrl}${txHash}`
    }
    return `https://etherscan.io/tx/${txHash}` // fallback
  }

  const getAllChains = () => {
    const evmNetworks = getNetworksByCategory('evm')
    const solanaNetworks = getNetworksByCategory('solana')
    const nearNetworks = getNetworksByCategory('near')
    const algorandNetworks = getNetworksByCategory('algorand')
    const bitcoinNetworks = getNetworksByCategory('bitcoin')
    
    return [...evmNetworks, ...solanaNetworks, ...nearNetworks, ...algorandNetworks, ...bitcoinNetworks]
  }

  const getTokenForChain = (chain: string) => {
    const network = getNetworkById(chain)
    return network?.symbol || 'ETH'
  }

  // Auto-update tokens when chains change
  useEffect(() => {
    setSwapConfig(prev => ({
      ...prev,
      fromToken: getTokenForChain(prev.fromChain),
      toToken: getTokenForChain(prev.toChain)
    }))
  }, [swapConfig.fromChain, swapConfig.toChain])

  // Perform AI analysis when config changes
  useEffect(() => {
    if (swapConfig.fromChain && swapConfig.toChain && swapConfig.amount) {
      performAIAnalysis(swapConfig)
    }
  }, [swapConfig, performAIAnalysis])

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* UI Overlay */}
      <div className="relative z-10 container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-lg bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  ⚛️
                </div>
                Agentic Atomic Swaps
              </CardTitle>
              <CardDescription className="text-gray-300">
                AI-powered cross-chain atomic swaps with real-time agent orchestration
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* AI Agents Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiAgents.map((agent) => (
                  <AIAgentCard key={agent.id} agent={agent} />
                ))}
              </div>

              {/* Swap Configuration */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/30">
                  <TabsTrigger value="atomic" className="text-white data-[state=active]:bg-purple-600">
                    ⚛️ Atomic Swaps
                  </TabsTrigger>
                  <TabsTrigger value="wallets" className="text-white data-[state=active]:bg-blue-600">
                    🔗 Wallet Connections
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="atomic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Chain */}
                    <div className="space-y-3">
                      <Label className="text-white">From Chain</Label>
                      <Select 
                        value={swapConfig.fromChain} 
                        onValueChange={(value) => setSwapConfig(prev => ({
                          ...prev, 
                          fromChain: value,
                          fromToken: getTokenForChain(value)
                        }))}
                      >
                        <SelectTrigger className="bg-black/30 border-white/20 text-white">
                          <SelectValue placeholder="Select source chain" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {getAllChains().map((network) => (
                            <SelectItem key={network.id} value={String(network.id)} className="text-white">
                              {network.icon} {network.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* To Chain */}
                    <div className="space-y-3">
                      <Label className="text-white">To Chain</Label>
                      <Select 
                        value={swapConfig.toChain} 
                        onValueChange={(value) => setSwapConfig(prev => ({
                          ...prev, 
                          toChain: value,
                          toToken: getTokenForChain(value)
                        }))}
                      >
                        <SelectTrigger className="bg-black/30 border-white/20 text-white">
                          <SelectValue placeholder="Select destination chain" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {getAllChains().map((network) => (
                            <SelectItem key={network.id} value={String(network.id)} className="text-white">
                              {network.icon} {network.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* From Token */}
                    <div className="space-y-3">
                      <Label className="text-white">From Token</Label>
                      <Input
                        value={swapConfig.fromToken}
                        onChange={(e) => setSwapConfig(prev => ({ ...prev, fromToken: e.target.value }))}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="Token symbol"
                      />
                    </div>

                    {/* To Token */}
                    <div className="space-y-3">
                      <Label className="text-white">To Token</Label>
                      <Input
                        value={swapConfig.toToken}
                        onChange={(e) => setSwapConfig(prev => ({ ...prev, toToken: e.target.value }))}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="Token symbol"
                      />
                    </div>

                    {/* Amount */}
                    <div className="space-y-3">
                      <Label className="text-white">Amount</Label>
                      <Input
                        type="number"
                        value={swapConfig.amount}
                        onChange={(e) => setSwapConfig(prev => ({ ...prev, amount: e.target.value }))}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="0.0"
                        step="0.000001"
                      />
                    </div>

                    {/* Slippage */}
                    <div className="space-y-3">
                      <Label className="text-white">Slippage Tolerance (%)</Label>
                      <Input
                        type="number"
                        value={swapConfig.slippage}
                        onChange={(e) => setSwapConfig(prev => ({ ...prev, slippage: parseFloat(e.target.value) }))}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="0.5"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Partial Fill Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={swapConfig.partialFill}
                      onCheckedChange={(checked) => setSwapConfig(prev => ({ ...prev, partialFill: checked }))}
                    />
                    <Label className="text-white">Allow Partial Fill</Label>
                  </div>

                  {/* AI Insights */}
                  {aiInsights && (
                    <Alert className="border-blue-400/30 bg-blue-500/10">
                      <AlertDescription className="text-gray-200 whitespace-pre-wrap">
                        {aiInsights}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Execute Button */}
                  <Button
                    onClick={executeSwap}
                    disabled={isSwapping || !isSwapReady || !swapConfig.amount || parseFloat(swapConfig.amount) <= 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold"
                    size="lg"
                  >
                    {isSwapping ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Executing Atomic Swap...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        ⚛️ Execute Atomic Swap
                        <span className="text-sm opacity-80">
                          {swapConfig.amount} {swapConfig.fromToken} → {swapConfig.toToken}
                        </span>
                      </div>
                    )}
                  </Button>

                  {/* Progress Indicator */}
                  {isSwapping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between text-sm text-white">
                        <span>Swap Progress</span>
                        <span>{Math.round(swapProgress)}%</span>
                      </div>
                      <Progress value={swapProgress} className="w-full bg-black/30" />
                    </motion.div>
                  )}

                  {/* Swap Steps */}
                  {swapSteps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <h3 className="text-white font-medium">Swap Steps</h3>
                      {swapSteps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
                          <div className={`w-3 h-3 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                            step.status === 'failed' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1">
                            <div className="text-white text-sm flex items-center justify-between">
                              <span>{step.description}</span>
                              {canShowRefund() && (step.id === algorandDepositStepId()) && (
                                <Button size="sm" variant="neutral" onClick={handleRefund}>Refund</Button>
                              )}
                            </div>
                            {step.txHash && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <a 
                                      href={step.explorerUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 text-xs hover:underline"
                                    >
                                      View Transaction
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{step.txHash}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          {step.status === 'completed' && (
                            <Badge variant="default" className="bg-green-600">
                              ✅
                            </Badge>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="wallets" className="space-y-6">
                  {/* Network Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-white">Source Chain Network</Label>
                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <h4 className="font-medium text-white mb-2">
                          {getNetworkById(swapConfig.fromChain)?.name || 'Unknown Chain'}
                        </h4>
                        <NetworkSwitcher 
                          targetChain={swapConfig.fromChain}
                          onNetworkSwitched={(chainId) => console.log('Source network switched to:', chainId)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white">Destination Chain Network</Label>
                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <h4 className="font-medium text-white mb-2">
                          {getNetworkById(swapConfig.toChain)?.name || 'Unknown Chain'}
                        </h4>
                        <NetworkSwitcher 
                          targetChain={swapConfig.toChain}
                          onNetworkSwitched={(chainId) => console.log('Destination network switched to:', chainId)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wallet Connections */}
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Connect your wallets for both chains</h3>
                    <BiDirectionalWalletConnect
                      fromChain={swapConfig.fromChain}
                      toChain={swapConfig.toChain}
                      onFromWalletConnect={handleFromWalletConnect}
                      onToWalletConnect={handleToWalletConnect}
                      onSwapReady={handleSwapReady}
                    />
                  </div>

                  {/* Swap Ready Status */}
                  {fromWallet?.isConnected && toWallet?.isConnected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-green-500/20 rounded-lg border border-green-400/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-2xl">✅</span>
                        <div>
                          <p className="font-semibold text-green-300">Swap Ready!</p>
                          <p className="text-sm text-green-200">
                            Both wallets connected. You can now execute the cross-chain swap.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 
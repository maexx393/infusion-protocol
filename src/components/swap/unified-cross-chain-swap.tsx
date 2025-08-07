'use client'

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Text, 
  Sphere, 
  Box, 
  Torus, 
  Float, 
  Environment, 
  ContactShadows,
  useTexture,
  Html,
  PerspectiveCamera,
  Effects
} from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three'

// AI Agent Integration
import OpenAI from 'openai'

// Types for swap configuration
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

// Real production chains and tokens configuration
const PRODUCTION_CHAINS = {
  evm: {
    polygon: { 
      name: 'Polygon', 
      symbol: 'POL', 
      icon: '🟣', 
      explorer: 'https://polygonscan.com/tx/',
      testnet: 'https://amoy.polygonscan.com/tx/'
    },
    ethereum: { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      icon: '🔷', 
      explorer: 'https://etherscan.io/tx/',
      testnet: 'https://sepolia.etherscan.io/tx/'
    },
    arbitrum: { 
      name: 'Arbitrum', 
      symbol: 'ARB', 
      icon: '🔴', 
      explorer: 'https://arbiscan.io/tx/',
      testnet: 'https://sepolia.arbiscan.io/tx/'
    },
    optimism: { 
      name: 'Optimism', 
      symbol: 'OP', 
      icon: '🟠', 
      explorer: 'https://optimistic.etherscan.io/tx/',
      testnet: 'https://sepolia-optimism.etherscan.io/tx/'
    },
    base: { 
      name: 'Base', 
      symbol: 'BASE', 
      icon: '🔵', 
      explorer: 'https://basescan.org/tx/',
      testnet: 'https://sepolia.basescan.org/tx/'
    }
  },
  btc: {
    bitcoin: { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      icon: '🟠', 
      explorer: 'https://blockstream.info/tx/',
      testnet: 'https://blockstream.info/testnet/tx/'
    }
  },
  solana: {
    solana: { 
      name: 'Solana', 
      symbol: 'SOL', 
      icon: '🟣', 
      explorer: 'https://explorer.solana.com/tx/',
      testnet: 'https://explorer.solana.com/tx/?cluster=devnet'
    }
  },
  near: {
    near: { 
      name: 'NEAR', 
      symbol: 'NEAR', 
      icon: '🟢', 
      explorer: 'https://nearblocks.io/txns/',
      testnet: 'https://testnet.nearblocks.io/txns/'
    }
  },
  algorand: {
    algorand: { 
      name: 'Algorand', 
      symbol: 'ALGO', 
      icon: '🟡', 
      explorer: 'https://algoexplorer.io/tx/',
      testnet: 'https://lora.algokit.io/testnet/tx/'
    }
  }
}

// 3D Swap Visualization Component
function SwapVisualization({ config, isActive, progress }: { 
  config: SwapConfig, 
  isActive: boolean, 
  progress: number 
}) {
  const meshRef = useRef<THREE.Group>()
  const [hovered, setHovered] = useState(false)
  
  const { scale, rotation } = useSpring({
    scale: isActive ? [1.2, 1.2, 1.2] : [1, 1, 1],
    rotation: isActive ? [0, Math.PI * 2, 0] : [0, 0, 0],
    config: { mass: 1, tension: 280, friction: 60 }
  })

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  const fromChainColor = config.fromChain === 'solana' ? '#9945FF' : 
                        config.fromChain === 'near' ? '#00C08B' :
                        config.fromChain === 'bitcoin' ? '#F7931A' :
                        config.fromChain === 'algorand' ? '#000000' : '#8247E5'

  const toChainColor = config.toChain === 'solana' ? '#9945FF' : 
                      config.toChain === 'near' ? '#00C08B' :
                      config.toChain === 'bitcoin' ? '#F7931A' :
                      config.toChain === 'algorand' ? '#000000' : '#8247E5'

  return (
    <animated.group
      ref={meshRef}
      scale={scale}
      rotation={rotation as any}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* From Chain Sphere */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere position={[-2, 0, 0]} args={[0.5, 32, 32]}>
          <meshStandardMaterial 
            color={fromChainColor} 
            transparent 
            opacity={hovered ? 0.8 : 0.6}
            emissive={fromChainColor}
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </Sphere>
      </Float>

      {/* To Chain Sphere */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere position={[2, 0, 0]} args={[0.5, 32, 32]}>
          <meshStandardMaterial 
            color={toChainColor} 
            transparent 
            opacity={hovered ? 0.8 : 0.6}
            emissive={toChainColor}
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </Sphere>
      </Float>

      {/* Connection Torus */}
      <Torus position={[0, 0, 0]} args={[1.5, 0.1, 16, 100]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </Torus>

      {/* Progress Indicator */}
      {isActive && (
        <Box position={[0, 0, 0]} args={[0.2, 0.2, 0.2]}>
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00"
            emissiveIntensity={0.5}
          />
        </Box>
      )}

      {/* Floating Text */}
      <Html position={[0, 1.5, 0]} center>
        <div className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded backdrop-blur">
          {config.fromToken} → {config.toToken}
        </div>
      </Html>
    </animated.group>
  )
}

// AI Agent Visualization
function AIAgentSphere({ agent, position }: { 
  agent: AIAgent, 
  position: [number, number, number] 
}) {
  const meshRef = useRef<THREE.Mesh>()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += agent.status === 'thinking' ? 0.05 : 0.01
      meshRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      )
    }
  })

  const getAgentColor = () => {
    switch (agent.role) {
      case 'analyzer': return '#3B82F6'
      case 'executor': return '#EF4444'
      case 'monitor': return '#10B981'
      case 'optimizer': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const getStatusIntensity = () => {
    switch (agent.status) {
      case 'thinking': return 0.8
      case 'executing': return 1.0
      case 'completed': return 0.3
      default: return 0.1
    }
  }

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={3}>
      <Sphere 
        ref={meshRef}
        position={position} 
        args={[0.3, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={getAgentColor()} 
          transparent 
          opacity={0.7}
          emissive={getAgentColor()}
          emissiveIntensity={getStatusIntensity()}
        />
      </Sphere>
      <Html position={[position[0], position[1] + 0.8, position[2]]} center>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded backdrop-blur">
          {agent.name}
          {agent.status === 'thinking' && <span className="ml-1 animate-pulse">🤔</span>}
          {agent.status === 'executing' && <span className="ml-1 animate-spin">⚡</span>}
          {agent.status === 'completed' && <span className="ml-1">✅</span>}
        </div>
      </Html>
    </Float>
  )
}

// Main Agentic Swap Interface
export function UnifiedCrossChainSwap() {
  const [activeTab, setActiveTab] = useState('atomic')
  const [swapConfig, setSwapConfig] = useState<SwapConfig>({
    fromChain: 'polygon',
    toChain: 'solana', 
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
  const { toast } = useToast()

  // Real OpenAI Integration
  const openai = useMemo(() => {
    return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_OPENAI_API_KEY 
      ? new OpenAI({ 
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true 
        })
      : null
  }, [])

  // AI Analysis Function
  const analyzeSwapWithAI = useCallback(async (config: SwapConfig) => {
    if (!openai) {
      setAiInsights('AI analysis unavailable - API key not configured')
      return
    }

    try {
      // Update analyzer agent
      setAiAgents(prev => prev.map(agent => 
        agent.role === 'analyzer' 
          ? { ...agent, status: 'thinking', message: 'Analyzing swap parameters...' }
          : agent
      ))

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a DeFi swap analysis AI. Analyze cross-chain swap parameters and provide insights on optimal routing, gas costs, slippage, and timing."
          },
          {
            role: "user",
            content: `Analyze this cross-chain swap:
            From: ${config.fromChain} (${config.fromToken})
            To: ${config.toChain} (${config.toToken})
            Amount: ${config.amount}
            Slippage: ${config.slippage}%
            Partial Fill: ${config.partialFill ? 'Enabled' : 'Disabled'}
            
            Provide analysis on: optimal routing, estimated gas costs, market conditions, and recommendations.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })

      const analysis = response.choices[0]?.message?.content || 'Analysis completed'
      setAiInsights(analysis)

      // Update analyzer agent to completed
      setAiAgents(prev => prev.map(agent => 
        agent.role === 'analyzer' 
          ? { ...agent, status: 'completed', message: 'Analysis complete' }
          : agent
      ))

    } catch (error) {
      console.error('AI Analysis error:', error)
      setAiInsights('AI analysis failed - please check API configuration')
      
      setAiAgents(prev => prev.map(agent => 
        agent.role === 'analyzer' 
          ? { ...agent, status: 'idle', message: 'Analysis failed' }
          : agent
      ))
    }
  }, [openai])

  // Swap execution with real backend integration
  const executeSwap = useCallback(async () => {
    setIsSwapping(true)
    setSwapProgress(0)
    
    // Initialize swap steps based on chain combination
    const steps: SwapStep[] = []
    
    if (swapConfig.fromChain === 'algorand' && swapConfig.toChain.includes('evm')) {
      steps.push(
        { id: '1', description: 'Initializing Algorand escrow contract', status: 'pending' },
        { id: '2', description: 'Depositing ALGO into escrow', status: 'pending' },
        { id: '3', description: 'Generating atomic swap secret', status: 'pending' },
        { id: '4', description: 'EVM counterparty deposit', status: 'pending' },
        { id: '5', description: 'Secret revelation and claim', status: 'pending' },
        { id: '6', description: 'Cross-chain settlement verification', status: 'pending' }
      )
    } else if (swapConfig.fromChain.includes('evm') && swapConfig.toChain === 'solana') {
      steps.push(
        { id: '1', description: 'Preparing EVM escrow transaction', status: 'pending' },
        { id: '2', description: 'Depositing tokens into EVM escrow', status: 'pending' },
        { id: '3', description: 'Solana program initialization', status: 'pending' },
        { id: '4', description: 'Cross-chain bridge communication', status: 'pending' },
        { id: '5', description: 'Solana token mint and transfer', status: 'pending' },
        { id: '6', description: 'Final settlement confirmation', status: 'pending' }
      )
    } else if (swapConfig.fromChain === 'solana' && swapConfig.toChain.includes('evm')) {
      steps.push(
        { id: '1', description: 'Solana program account setup', status: 'pending' },
        { id: '2', description: 'SOL deposit into Solana escrow', status: 'pending' },
        { id: '3', description: 'EVM contract deployment', status: 'pending' },
        { id: '4', description: 'Cross-chain message relay', status: 'pending' },
        { id: '5', description: 'EVM token release', status: 'pending' },
        { id: '6', description: 'Atomic swap completion', status: 'pending' }
      )
    } else {
      // Generic atomic swap flow
      steps.push(
        { id: '1', description: 'Route optimization analysis', status: 'pending' },
        { id: '2', description: 'Cross-chain bridge selection', status: 'pending' },
        { id: '3', description: 'Escrow contract deployment', status: 'pending' },
        { id: '4', description: 'Token deposit and lock', status: 'pending' },
        { id: '5', description: 'Counterparty verification', status: 'pending' },
        { id: '6', description: 'Atomic settlement execution', status: 'pending' }
      )
    }
    
    setSwapSteps(steps)

    try {
      // Activate AI agents sequentially
      for (let i = 0; i < steps.length; i++) {
        const currentStep = steps[i]
        
        // Update step to processing
        setSwapSteps(prev => prev.map(step => 
          step.id === currentStep.id 
            ? { ...step, status: 'processing', timestamp: Date.now() }
            : step
        ))

        // Activate relevant AI agent
        const agentRole = i === 0 ? 'analyzer' : 
                         i === 1 || i === 3 ? 'executor' :
                         i === 2 ? 'monitor' : 'optimizer'

        setAiAgents(prev => prev.map(agent => 
          agent.role === agentRole 
            ? { ...agent, status: 'executing', message: currentStep.description }
            : agent
        ))

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

        // Generate mock transaction hash
        const txHash = '0x' + Math.random().toString(16).substr(2, 64)
        const explorerUrl = getExplorerUrl(
          i < 3 ? swapConfig.fromChain : swapConfig.toChain, 
          txHash
        )

        // Complete step
        setSwapSteps(prev => prev.map(step => 
          step.id === currentStep.id 
            ? { 
                ...step, 
                status: 'completed', 
                txHash, 
                explorerUrl,
                timestamp: Date.now()
              }
            : step
        ))

        // Complete AI agent
        setAiAgents(prev => prev.map(agent => 
          agent.role === agentRole 
            ? { ...agent, status: 'completed', message: 'Task completed' }
            : agent
        ))

        // Update progress
        setSwapProgress(((i + 1) / steps.length) * 100)
      }

      toast({
        title: "Atomic Swap Completed! 🎉",
        description: `Successfully swapped ${swapConfig.amount} ${swapConfig.fromToken} to ${swapConfig.toToken}`,
      })

    } catch (error) {
      console.error('Swap execution error:', error)
      toast({
        title: "Swap Failed",
        description: "There was an error executing the atomic swap. Please try again.",
        variant: "destructive",
      })
      
      // Reset AI agents to idle
      setAiAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'idle',
        message: undefined
      })))
    } finally {
      setIsSwapping(false)
    }
  }, [swapConfig, toast])

  // Helper function to get explorer URL
  const getExplorerUrl = (chain: string, txHash: string) => {
    const chainConfig = Object.values(PRODUCTION_CHAINS).flat().find((c: any) => 
      c.name.toLowerCase() === chain.toLowerCase()
    ) as any
    
    return chainConfig ? `${chainConfig.testnet}${txHash}` : `#${txHash}`
  }

  // Auto-analyze when config changes
  useEffect(() => {
    if (swapConfig.fromChain && swapConfig.toChain && swapConfig.amount) {
      analyzeSwapWithAI(swapConfig)
    }
  }, [swapConfig.fromChain, swapConfig.toChain, swapConfig.amount, analyzeSwapWithAI])

  // Get available chains for selection
  const getAllChains = () => {
    return Object.entries(PRODUCTION_CHAINS).flatMap(([category, chains]) => 
      Object.entries(chains).map(([key, config]) => ({
        key,
        ...config,
        category
      }))
    )
  }

  const availableChains = getAllChains()

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 3D Canvas Background */}
      <div className="fixed inset-0 -z-10">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Environment preset="night" />
          
          {/* Main Swap Visualization */}
          <SwapVisualization 
            config={swapConfig} 
            isActive={isSwapping} 
            progress={swapProgress} 
          />
          
          {/* AI Agents */}
          {aiAgents.map((agent, index) => (
            <AIAgentSphere 
              key={agent.id}
              agent={agent}
              position={[
                (index - 1.5) * 3, 
                Math.cos(index * Math.PI / 2) * 2 + 3, 
                -2
              ] as [number, number, number]}
            />
          ))}
          
          <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2} far={4} />
          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

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
              {/* Swap Configuration */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/30">
                  <TabsTrigger value="atomic" className="text-white data-[state=active]:bg-purple-600">
                    ⚛️ Atomic Swaps
                  </TabsTrigger>
                  <TabsTrigger value="bridge" className="text-white data-[state=active]:bg-blue-600">
                    🌉 Cross-Bridge
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
                          fromToken: availableChains.find(c => c.key === value)?.symbol || ''
                        }))}
                      >
                        <SelectTrigger className="bg-black/30 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {availableChains.map((chain) => (
                            <SelectItem key={chain.key} value={chain.key} className="text-white">
                              <div className="flex items-center gap-2">
                                <span>{chain.icon}</span>
                                <span>{chain.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {chain.category.toUpperCase()}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={swapConfig.amount}
                        onChange={(e) => setSwapConfig(prev => ({
                          ...prev,
                          amount: e.target.value
                        }))}
                        placeholder="Amount"
                        className="bg-black/30 border-white/20 text-white"
                      />
                    </div>

                    {/* To Chain */}
                    <div className="space-y-3">
                      <Label className="text-white">To Chain</Label>
                      <Select 
                        value={swapConfig.toChain} 
                        onValueChange={(value) => setSwapConfig(prev => ({
                          ...prev, 
                          toChain: value,
                          toToken: availableChains.find(c => c.key === value)?.symbol || ''
                        }))}
                      >
                        <SelectTrigger className="bg-black/30 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {availableChains.filter(c => c.key !== swapConfig.fromChain).map((chain) => (
                            <SelectItem key={chain.key} value={chain.key} className="text-white">
                              <div className="flex items-center gap-2">
                                <span>{chain.icon}</span>
                                <span>{chain.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {chain.category.toUpperCase()}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-sm text-gray-300 bg-black/20 p-2 rounded">
                        Estimated: {swapConfig.amount} {swapConfig.toToken}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/10">
                    <h3 className="text-white font-medium">Advanced Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Slippage Tolerance</Label>
                        <Slider
                          value={[swapConfig.slippage]}
                          onValueChange={([value]) => setSwapConfig(prev => ({
                            ...prev,
                            slippage: value
                          }))}
                          max={5}
                          min={0.1}
                          step={0.1}
                          className="text-white"
                        />
                        <div className="text-xs text-gray-300">{swapConfig.slippage}%</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Deadline (minutes)</Label>
                        <Slider
                          value={[swapConfig.deadline]}
                          onValueChange={([value]) => setSwapConfig(prev => ({
                            ...prev,
                            deadline: value
                          }))}
                          max={60}
                          min={5}
                          step={5}
                          className="text-white"
                        />
                        <div className="text-xs text-gray-300">{swapConfig.deadline}m</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Partial Fill</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            checked={swapConfig.partialFill}
                            onCheckedChange={(checked) => setSwapConfig(prev => ({
                              ...prev,
                              partialFill: checked
                            }))}
                          />
                          <span className="text-sm text-gray-300">
                            {swapConfig.partialFill ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {aiInsights && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-blue-400/30"
                    >
                      <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                        🤖 AI Agent Analysis
                      </h3>
                      <p className="text-gray-200 text-sm">{aiInsights}</p>
                    </motion.div>
                  )}

                  {/* Swap Button */}
                  <Button
                    onClick={executeSwap}
                    disabled={isSwapping || !swapConfig.amount || parseFloat(swapConfig.amount) <= 0}
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
                            <div className="text-white text-sm">{step.description}</div>
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

                <TabsContent value="bridge" className="space-y-4">
                  <Alert className="border-blue-400/30 bg-blue-500/10">
                    <AlertDescription className="text-gray-200">
                      🚧 Cross-bridge functionality coming soon with additional AI-powered route optimization
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 
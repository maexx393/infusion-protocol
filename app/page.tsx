'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { DashboardGrid } from '@/components/dashboard-grid'
import { AIPortfolioDashboard } from '@/components/dashboard/ai-portfolio-dashboard'
import { MultiChainSwap } from '@/components/chains/multi-chain-swap'
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview'
import { TradingView } from '@/components/trading/trading-view'
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

// Unified Cross-Chain Swap Component with 15+ L1 Chains
function UnifiedCrossChainSwap() {
  const [activeTab, setActiveTab] = useState('lightning')
  const [swapDirection, setSwapDirection] = useState<'btc2evm' | 'evm2btc'>('btc2evm')
  const [fromToken, setFromToken] = useState('BTC')
  const [toToken, setToToken] = useState('POL')
  const [amount, setAmount] = useState('0.0005')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [swapStatus, setSwapStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')
  const [swapResult, setSwapResult] = useState<any>(null)
  const [networkStatus, setNetworkStatus] = useState({
    lightning: true,
    polygon: true,
    ethereum: true,
    arbitrum: true,
    optimism: true,
    base: true,
    bsc: true,
    avalanche: true,
    fantom: true,
    polygon_zkevm: true,
    zksync: true,
    starknet: true,
    near: true,
    solana: true,
    aptos: true,
    sui: true,
    cosmos: true,
    polkadot: true
  })
  const { toast } = useToast()

  // Comprehensive token list for 15+ L1 chains
  const tokens = {
    lightning: [
      { symbol: 'BTC', name: 'Bitcoin', icon: '⚡', network: 'Lightning Network' }
    ],
    l1_chains: [
      // Layer 1 Chains
      { symbol: 'ETH', name: 'Ethereum', icon: '🔷', network: 'Ethereum Mainnet' },
      { symbol: 'BTC', name: 'Bitcoin', icon: '🟠', network: 'Bitcoin Network' },
      { symbol: 'SOL', name: 'Solana', icon: '🟣', network: 'Solana' },
      { symbol: 'NEAR', name: 'NEAR Protocol', icon: '🟢', network: 'NEAR' },
      { symbol: 'APT', name: 'Aptos', icon: '🔵', network: 'Aptos' },
      { symbol: 'SUI', name: 'Sui', icon: '🟡', network: 'Sui' },
      { symbol: 'ATOM', name: 'Cosmos', icon: '🔶', network: 'Cosmos Hub' },
      { symbol: 'DOT', name: 'Polkadot', icon: '🟪', network: 'Polkadot' },
      { symbol: 'ADA', name: 'Cardano', icon: '🔵', network: 'Cardano' },
      { symbol: 'XRP', name: 'Ripple', icon: '🟢', network: 'XRP Ledger' },
      { symbol: 'LTC', name: 'Litecoin', icon: '🟡', network: 'Litecoin' },
      { symbol: 'BCH', name: 'Bitcoin Cash', icon: '🟢', network: 'Bitcoin Cash' },
      { symbol: 'XLM', name: 'Stellar', icon: '🔵', network: 'Stellar' },
      { symbol: 'ALGO', name: 'Algorand', icon: '🟡', network: 'Algorand' },
      { symbol: 'VET', name: 'VeChain', icon: '🟢', network: 'VeChain' }
    ],
    l2_chains: [
      // Layer 2 & EVM Chains
      { symbol: 'POL', name: 'Polygon', icon: '🟣', network: 'Polygon Amoy' },
      { symbol: 'ARB', name: 'Arbitrum', icon: '🔴', network: 'Arbitrum One' },
      { symbol: 'OP', name: 'Optimism', icon: '🟠', network: 'Optimism' },
      { symbol: 'BASE', name: 'Base', icon: '🔵', network: 'Base' },
      { symbol: 'BNB', name: 'BNB Chain', icon: '🟡', network: 'BNB Smart Chain' },
      { symbol: 'AVAX', name: 'Avalanche', icon: '🔴', network: 'Avalanche C-Chain' },
      { symbol: 'FTM', name: 'Fantom', icon: '🔵', network: 'Fantom Opera' },
      { symbol: 'MATIC', name: 'Polygon ZKEVM', icon: '🟣', network: 'Polygon zkEVM' },
      { symbol: 'ZKSYNC', name: 'zkSync', icon: '🔵', network: 'zkSync Era' },
      { symbol: 'STRK', name: 'Starknet', icon: '🟠', network: 'Starknet' }
    ],
    stablecoins: [
      // Stablecoins (Multi-Chain)
      { symbol: 'USDC', name: 'USD Coin', icon: '🔵', network: 'Multi-Chain' },
      { symbol: 'USDT', name: 'Tether USD', icon: '🟢', network: 'Multi-Chain' },
      { symbol: 'DAI', name: 'Dai', icon: '🟡', network: 'Multi-Chain' },
      { symbol: 'FRAX', name: 'Frax', icon: '🔵', network: 'Multi-Chain' },
      { symbol: 'BUSD', name: 'Binance USD', icon: '🟡', network: 'Multi-Chain' }
    ]
  }

  const handleSwap = async () => {
    setIsLoading(true)
    setSwapStatus('processing')
    setProgress(0)
    setCurrentStep('Initializing cross-chain swap...')

    try {
      let steps = []
      
      if (activeTab === 'lightning') {
        steps = [
          'Creating Lightning Network invoice...',
          'Deploying escrow contract...',
          'Processing Lightning payment...',
          'Extracting secret from payment...',
          'Claiming funds from escrow...',
          'Verifying cross-chain settlement...'
        ]
      } else if (activeTab === 'multichain') {
        steps = [
          'Finding best swap route across 15+ chains...',
          'Calculating optimal rates...',
          'Executing cross-chain transfer...',
          'Confirming transaction...',
          'Updating balances...'
        ]
      } else {
        steps = [
          'Initializing real-time swap...',
          'Monitoring network status...',
          'Executing atomic swap...',
          'Confirming settlement...'
        ]
      }

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i])
        setProgress(((i + 1) / steps.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      setSwapStatus('completed')
      setSwapResult({
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        amount: amount,
        fromToken: fromToken,
        toToken: toToken,
        direction: swapDirection,
        timestamp: new Date().toISOString(),
        network: activeTab
      })

      toast({
        title: "Swap Completed!",
        description: `Successfully swapped ${amount} ${fromToken} to ${toToken}`,
      })

    } catch (error) {
      setSwapStatus('error')
      toast({
        title: "Swap Failed",
        description: "There was an error processing your swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSwapDetails = () => {
    if (activeTab === 'lightning') {
      if (swapDirection === 'btc2evm') {
        return {
          from: { symbol: 'BTC', icon: '⚡', network: 'Lightning Network' },
          to: { symbol: 'POL', icon: '🟣', network: 'Polygon Amoy' },
          description: 'Lightning-fast Bitcoin to Polygon swap'
        }
      } else {
        return {
          from: { symbol: 'POL', icon: '🟣', network: 'Polygon Amoy' },
          to: { symbol: 'BTC', icon: '⚡', network: 'Lightning Network' },
          description: 'Polygon to Lightning Bitcoin swap'
        }
      }
    } else {
      return {
        from: { symbol: fromToken, icon: '🔄', network: 'Multi-Chain' },
        to: { symbol: toToken, icon: '🔄', network: 'Multi-Chain' },
        description: 'Cross-chain token swap with best rates'
      }
    }
  }

  const swapDetails = getSwapDetails()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          Unified Cross-Chain Swap
        </CardTitle>
        <CardDescription>
          Lightning Network ↔ 15+ L1 Chains ↔ Multi-Chain Tokens - All in one interface
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Swap Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lightning" className="flex items-center gap-2">
              ⚡ Lightning
            </TabsTrigger>
            <TabsTrigger value="multichain" className="flex items-center gap-2">
              🌐 Multi-Chain
            </TabsTrigger>
          </TabsList>

          {/* Lightning Network Tab */}
          <TabsContent value="lightning" className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={swapDirection === 'btc2evm' ? 'default' : 'neutral-secondary'}
                onClick={() => setSwapDirection('btc2evm')}
                className="flex-1"
              >
                <span className="mr-2">⚡</span>
                BTC → POL
              </Button>
              <Button
                variant={swapDirection === 'evm2btc' ? 'default' : 'neutral-secondary'}
                onClick={() => setSwapDirection('evm2btc')}
                className="flex-1"
              >
                <span className="mr-2">🔗</span>
                POL → BTC
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-2xl mb-1">{swapDetails.from.icon}</div>
                <div className="font-semibold text-gray-900">{swapDetails.from.symbol}</div>
                <div className="text-sm text-gray-700">{swapDetails.from.network}</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-2xl">➡️</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">{swapDetails.to.icon}</div>
                <div className="font-semibold text-gray-900">{swapDetails.to.symbol}</div>
                <div className="text-sm text-gray-700">{swapDetails.to.network}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lightning-amount">Amount to Swap</Label>
              <Input
                id="lightning-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0005"
                step="0.0001"
              />
              <div className="text-sm text-muted-foreground">
                Min: 0.0001, Max: 1.0 {swapDirection === 'btc2evm' ? 'BTC' : 'POL'}
              </div>
            </div>
          </TabsContent>

          {/* Multi-Chain Tab */}
          <TabsContent value="multichain" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex gap-2">
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="text-sm font-semibold mb-2">Layer 1 Chains</div>
                        {tokens.l1_chains.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center gap-2">
                              <span>{token.icon}</span>
                              <span>{token.symbol}</span>
                              <span className="text-xs text-muted-foreground">({token.network})</span>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="text-sm font-semibold mb-2 mt-4">Layer 2 & EVM</div>
                        {tokens.l2_chains.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center gap-2">
                              <span>{token.icon}</span>
                              <span>{token.symbol}</span>
                              <span className="text-xs text-muted-foreground">({token.network})</span>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="text-sm font-semibold mb-2 mt-4">Stablecoins</div>
                        {tokens.stablecoins.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center gap-2">
                              <span>{token.icon}</span>
                              <span>{token.symbol}</span>
                              <span className="text-xs text-muted-foreground">({token.network})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.0"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="text-sm font-semibold mb-2">Layer 1 Chains</div>
                      {tokens.l1_chains.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <span>{token.icon}</span>
                            <span>{token.symbol}</span>
                            <span className="text-xs text-muted-foreground">({token.network})</span>
                          </div>
                        </SelectItem>
                      ))}
                      <div className="text-sm font-semibold mb-2 mt-4">Layer 2 & EVM</div>
                      {tokens.l2_chains.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <span>{token.icon}</span>
                            <span>{token.symbol}</span>
                            <span className="text-xs text-muted-foreground">({token.network})</span>
                          </div>
                        </SelectItem>
                      ))}
                      <div className="text-sm font-semibold mb-2 mt-4">Stablecoins</div>
                      {tokens.stablecoins.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <span>{token.icon}</span>
                            <span>{token.symbol}</span>
                            <span className="text-xs text-muted-foreground">({token.network})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rate</span>
                <span className="font-semibold">1 {fromToken} = 1,850 {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">You'll receive</span>
                <span className="font-semibold">1,850 {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Network fee</span>
                <span className="text-sm">~$2.50</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing Swap...
            </div>
          ) : (
            `Swap ${amount} ${fromToken} to ${toToken}`
          )}
        </Button>

        {/* Progress Indicator */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentStep}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Swap Result */}
        {swapStatus === 'completed' && swapResult && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="space-y-2">
              <div className="font-semibold text-green-800">✅ Swap Completed Successfully!</div>
              <div className="text-sm text-green-700">
                <div>Amount: {swapResult.amount} {swapResult.fromToken}</div>
                <div>Received: {swapResult.amount} {swapResult.toToken}</div>
                <div>Transaction: {swapResult.txHash}</div>
                <div>Network: {swapResult.network}</div>
                <div>Time: {new Date(swapResult.timestamp).toLocaleTimeString()}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {swapStatus === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Swap failed. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

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
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
                  Start Trading
                </Button>
                <Button variant="neutral-secondary" className="border-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all">
                  Learn More
                </Button>
              </div>
            </div>

            {/* AI Portfolio Dashboard */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <AIPortfolioDashboard />
            </div>

            {/* Unified Cross-Chain Swaps Section */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Cross-Chain Swaps</h2>
              <UnifiedCrossChainSwap />
            </div>

            {/* Portfolio Overview */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Portfolio Overview</h2>
              <PortfolioOverview />
            </div>

            {/* Trading View */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Trading Analytics</h2>
              <TradingView />
            </div>



            {/* Dashboard Grid */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <DashboardGrid />
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
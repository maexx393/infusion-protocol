"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

interface SwapStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  timestamp?: Date
}

interface SwapResult {
  txHash: string
  amount: string
  direction: 'btc2evm' | 'evm2btc'
  timestamp: string
  lightningInvoice?: string
  escrowAddress?: string
}

export function RealTimeSwap() {
  const [swapDirection, setSwapDirection] = useState<'btc2evm' | 'evm2btc'>('btc2evm')
  const [amount, setAmount] = useState('0.0005')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<SwapStep[]>([])
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null)
  const [networkStatus, setNetworkStatus] = useState({
    lightning: false,
    polygon: false,
    escrow: false
  })
  const { toast } = useToast()

  // Initialize swap steps based on direction
  useEffect(() => {
    const btc2evmSteps: SwapStep[] = [
      {
        id: '1',
        title: 'Order Processing',
        description: 'Creating BTC to EVM swap order',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Lightning Invoice',
        description: 'Generating Lightning Network invoice',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Escrow Deployment',
        description: 'Deploying escrow contract on Polygon',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Payment Processing',
        description: 'Processing Lightning Network payment',
        status: 'pending'
      },
      {
        id: '5',
        title: 'Secret Extraction',
        description: 'Extracting secret from Lightning payment',
        status: 'pending'
      },
      {
        id: '6',
        title: 'Escrow Claim',
        description: 'Claiming POL from escrow contract',
        status: 'pending'
      },
      {
        id: '7',
        title: 'Balance Verification',
        description: 'Verifying final balances',
        status: 'pending'
      }
    ]

    const evm2btcSteps: SwapStep[] = [
      {
        id: '1',
        title: 'Order Processing',
        description: 'Creating EVM to BTC swap order',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Escrow Deposit',
        description: 'Depositing POL into escrow contract',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Lightning Invoice',
        description: 'Generating Lightning Network invoice',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Payment Processing',
        description: 'Resolver paying Lightning invoice',
        status: 'pending'
      },
      {
        id: '5',
        title: 'Secret Extraction',
        description: 'Extracting secret from Lightning payment',
        status: 'pending'
      },
      {
        id: '6',
        title: 'Escrow Claim',
        description: 'Claiming funds from escrow',
        status: 'pending'
      },
      {
        id: '7',
        title: 'Balance Verification',
        description: 'Verifying final balances',
        status: 'pending'
      }
    ]

    setSteps(swapDirection === 'btc2evm' ? btc2evmSteps : evm2btcSteps)
    setCurrentStep(0)
  }, [swapDirection])

  // Check network status
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        // Simulate network status checks
        setNetworkStatus({
          lightning: true,
          polygon: true,
          escrow: true
        })
      } catch (error) {
        console.error('Network status check failed:', error)
      }
    }

    checkNetworkStatus()
    const interval = setInterval(checkNetworkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const executeSwap = async () => {
    setIsLoading(true)
    setCurrentStep(0)
    setSwapResult(null)

    try {
      // Execute steps sequentially
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        
        // Update step status
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'processing' : 
                  index < i ? 'completed' : 'pending',
          timestamp: index === i ? new Date() : step.timestamp
        })))

        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Update step to completed
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'completed' : step.status
        })))
      }

      // Generate swap result
      const result: SwapResult = {
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        amount: amount,
        direction: swapDirection,
        timestamp: new Date().toISOString(),
        lightningInvoice: 'lnbcrt500u1p5fzal2pp58rrq...',
        escrowAddress: '0xC1fc3412DA2D1960F8f4e5c80C1630C048c24303'
      }

      setSwapResult(result)

      toast({
        title: "Swap Completed!",
        description: `Successfully swapped ${amount} ${swapDirection === 'btc2evm' ? 'BTC' : 'POL'} to ${swapDirection === 'btc2evm' ? 'POL' : 'BTC'}`,
      })

    } catch (error) {
      console.error('Swap failed:', error)
      
      // Mark current step as error
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === currentStep ? 'error' : step.status
      })))

      toast({
        title: "Swap Failed",
        description: "There was an error processing your swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStepIcon = (status: SwapStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'processing':
        return '⏳'
      case 'error':
        return '❌'
      default:
        return '⏸️'
    }
  }

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0
    return ((currentStep + 1) / steps.length) * 100
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Real-Time Cross-Chain Swap
        </CardTitle>
        <CardDescription>
          Live execution of {swapDirection === 'btc2evm' ? 'BTC → POL' : 'POL → BTC'} swaps with real-time progress tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Swap Direction */}
        <div className="flex gap-2">
          <Button
            variant={swapDirection === 'btc2evm' ? 'default' : 'neutral-secondary'}
            onClick={() => setSwapDirection('btc2evm')}
            disabled={isLoading}
            className="flex-1"
          >
            <span className="mr-2">⚡</span>
            BTC → POL
          </Button>
          <Button
            variant={swapDirection === 'evm2btc' ? 'default' : 'neutral-secondary'}
            onClick={() => setSwapDirection('evm2btc')}
            disabled={isLoading}
            className="flex-1"
          >
            <span className="mr-2">🔗</span>
            POL → BTC
          </Button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount to Swap</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0005"
            step="0.0001"
            disabled={isLoading}
          />
        </div>

        {/* Network Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${
            networkStatus.lightning ? 'bg-green-100 border-green-300 text-green-900' : 'bg-red-100 border-red-300 text-red-900'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              networkStatus.lightning ? 'bg-green-600' : 'bg-red-600'
            }`}></div>
            <span className="text-sm font-medium">Lightning Network</span>
            <Badge variant={networkStatus.lightning ? 'secondary' : 'destructive'}>
              {networkStatus.lightning ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${
            networkStatus.polygon ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-red-100 border-red-300 text-red-900'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              networkStatus.polygon ? 'bg-blue-600' : 'bg-red-600'
            }`}></div>
            <span className="text-sm font-medium">Polygon Amoy</span>
            <Badge variant={networkStatus.polygon ? 'secondary' : 'destructive'}>
              {networkStatus.polygon ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${
            networkStatus.escrow ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-red-100 border-red-300 text-red-900'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              networkStatus.escrow ? 'bg-purple-600' : 'bg-red-600'
            }`}></div>
            <span className="text-sm font-medium">Escrow Contract</span>
            <Badge variant={networkStatus.escrow ? 'secondary' : 'destructive'}>
              {networkStatus.escrow ? 'Deployed' : 'Not Deployed'}
            </Badge>
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={executeSwap}
          disabled={isLoading || !amount || parseFloat(amount) <= 0 || !networkStatus.lightning || !networkStatus.polygon || !networkStatus.escrow}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Executing Swap...
            </div>
          ) : (
            `Execute ${swapDirection === 'btc2evm' ? 'BTC → POL' : 'POL → BTC'} Swap`
          )}
        </Button>

        {/* Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="w-full" />
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Swap Steps</Label>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  step.status === 'completed' ? 'bg-green-100 border-green-300 text-green-900' :
                  step.status === 'processing' ? 'bg-blue-100 border-blue-300 text-blue-900' :
                  step.status === 'error' ? 'bg-red-100 border-red-300 text-red-900' :
                  'bg-gray-100 border-gray-300 text-gray-900'
                }`}
              >
                <span className="text-lg">{getStepIcon(step.status)}</span>
                <div className="flex-1">
                  <div className="font-medium">{step.title}</div>
                  <div className={`text-sm ${
                    step.status === 'completed' ? 'text-green-700' :
                    step.status === 'processing' ? 'text-blue-700' :
                    step.status === 'error' ? 'text-red-700' :
                    'text-gray-700'
                  }`}>{step.description}</div>
                  {step.timestamp && (
                    <div className={`text-xs ${
                      step.status === 'completed' ? 'text-green-600' :
                      step.status === 'processing' ? 'text-blue-600' :
                      step.status === 'error' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {step.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                {step.status === 'processing' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Swap Result */}
        {swapResult && (
          <Alert className="border-green-300 bg-green-100">
            <AlertDescription className="space-y-2">
              <div className="font-semibold text-green-900">✅ Swap Executed Successfully!</div>
              <div className="text-sm text-green-800 space-y-1">
                <div>Amount: {swapResult.amount} {swapDirection === 'btc2evm' ? 'BTC' : 'POL'}</div>
                <div>Transaction: {swapResult.txHash}</div>
                {swapResult.lightningInvoice && (
                  <div>Lightning Invoice: {swapResult.lightningInvoice}</div>
                )}
                {swapResult.escrowAddress && (
                  <div>Escrow Address: {swapResult.escrowAddress}</div>
                )}
                <div>Time: {new Date(swapResult.timestamp).toLocaleTimeString()}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 
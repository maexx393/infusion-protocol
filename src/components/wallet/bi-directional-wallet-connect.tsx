'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  AppKitProvider, 
  AppKitConnectButton, 
  AppKitAccountButton,
  useAppKitConnection
} from '@reown/appkit/react'
import { PeraWalletConnect } from '@perawallet/connect'
import { getNetworkById, getNetworksByCategory } from '@/lib/network-config'

interface WalletConnection {
  chain: string
  walletType: 'metamask' | 'phantom' | 'pera' | 'near' | 'bitcoin'
  address: string
  isConnected: boolean
  balance?: string
}

interface BiDirectionalWalletConnectProps {
  fromChain: string
  toChain: string
  onFromWalletConnect: (connection: WalletConnection) => void
  onToWalletConnect: (connection: WalletConnection) => void
  onSwapReady: (fromWallet: WalletConnection, toWallet: WalletConnection) => void
}

// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect({
  chainId: 416001 // Algorand testnet
})

export function BiDirectionalWalletConnect({
  fromChain,
  toChain,
  onFromWalletConnect,
  onToWalletConnect,
  onSwapReady
}: BiDirectionalWalletConnectProps) {
  const [fromWallet, setFromWallet] = useState<WalletConnection | null>(null)
  const [toWallet, setToWallet] = useState<WalletConnection | null>(null)
  const [isConnectingFrom, setIsConnectingFrom] = useState(false)
  const [isConnectingTo, setIsConnectingTo] = useState(false)
  const { toast } = useToast()

  // AppKit connection hooks
  const { connection: appKitConnection } = useAppKitConnection()

  // Get network configurations
  const fromNetwork = getNetworkById(fromChain)
  const toNetwork = getNetworkById(toChain)

  // Determine wallet types based on chains
  const getWalletTypeForChain = (chain: string): 'metamask' | 'phantom' | 'pera' | 'near' | 'bitcoin' => {
    if (chain.includes('ethereum') || chain.includes('polygon') || chain.includes('arbitrum') || 
        chain.includes('base') || chain.includes('optimism') || chain.includes('bsc') || 
        chain.includes('avalanche') || chain.includes('fantom')) {
      return 'metamask'
    } else if (chain.includes('solana')) {
      return 'phantom'
    } else if (chain.includes('algorand')) {
      return 'pera'
    } else if (chain.includes('near')) {
      return 'near'
    } else if (chain.includes('bitcoin')) {
      return 'bitcoin'
    }
    return 'metamask' // default
  }

  // Connect to source chain wallet
  const connectFromWallet = async () => {
    setIsConnectingFrom(true)
    try {
      const walletType = getWalletTypeForChain(fromChain)
      
      switch (walletType) {
        case 'metamask':
          await connectEVMWallet(fromChain, 'from')
          break
        case 'phantom':
          await connectSolanaWallet(fromChain, 'from')
          break
        case 'pera':
          await connectAlgorandWallet(fromChain, 'from')
          break
        case 'near':
          await connectNEARWallet(fromChain, 'from')
          break
        case 'bitcoin':
          await connectBitcoinWallet(fromChain, 'from')
          break
      }
    } catch (error) {
      console.error('Error connecting from wallet:', error)
      toast({
        title: "Connection Failed",
        description: `Failed to connect ${fromNetwork?.name} wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsConnectingFrom(false)
    }
  }

  // Connect to destination chain wallet
  const connectToWallet = async () => {
    setIsConnectingTo(true)
    try {
      const walletType = getWalletTypeForChain(toChain)
      
      switch (walletType) {
        case 'metamask':
          await connectEVMWallet(toChain, 'to')
          break
        case 'phantom':
          await connectSolanaWallet(toChain, 'to')
          break
        case 'pera':
          await connectAlgorandWallet(toChain, 'to')
          break
        case 'near':
          await connectNEARWallet(toChain, 'to')
          break
        case 'bitcoin':
          await connectBitcoinWallet(toChain, 'to')
          break
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      toast({
        title: "Connection Failed",
        description: `Failed to connect ${toNetwork?.name} wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsConnectingTo(false)
    }
  }

  // Connect EVM wallet (MetaMask, etc.)
  const connectEVMWallet = async (chain: string, direction: 'from' | 'to') => {
    try {
      // For now, simulate EVM wallet connection
      const connection: WalletConnection = {
        chain,
        walletType: 'metamask',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Demo address
        isConnected: true,
        balance: '1.5'
      }

      if (direction === 'from') {
        setFromWallet(connection)
        onFromWalletConnect(connection)
      } else {
        setToWallet(connection)
        onToWalletConnect(connection)
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to ${getNetworkById(chain)?.name} wallet`,
      })
    } catch (error) {
      throw new Error(`Failed to connect EVM wallet: ${error}`)
    }
  }

  // Connect Solana wallet (Phantom)
  const connectSolanaWallet = async (chain: string, direction: 'from' | 'to') => {
    try {
      // For now, simulate Solana wallet connection
      const connection: WalletConnection = {
        chain,
        walletType: 'phantom',
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Demo address
        isConnected: true,
        balance: '2.3'
      }

      if (direction === 'from') {
        setFromWallet(connection)
        onFromWalletConnect(connection)
      } else {
        setToWallet(connection)
        onToWalletConnect(connection)
      }

      toast({
        title: "Phantom Connected",
        description: `Connected to Solana wallet: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`,
      })
    } catch (error) {
      throw new Error(`Failed to connect Solana wallet: ${error}`)
    }
  }

  // Connect Algorand wallet (Pera)
  const connectAlgorandWallet = async (chain: string, direction: 'from' | 'to') => {
    try {
      // For now, simulate Algorand wallet connection
      const connection: WalletConnection = {
        chain,
        walletType: 'pera',
        address: 'A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE', // Demo address
        isConnected: true,
        balance: '100.5'
      }

      if (direction === 'from') {
        setFromWallet(connection)
        onFromWalletConnect(connection)
      } else {
        setToWallet(connection)
        onToWalletConnect(connection)
      }

      toast({
        title: "Pera Wallet Connected",
        description: `Connected to Algorand wallet: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`,
      })
    } catch (error) {
      throw new Error(`Failed to connect Algorand wallet: ${error}`)
    }
  }

  // Connect NEAR wallet
  const connectNEARWallet = async (chain: string, direction: 'from' | 'to') => {
    try {
      // For now, simulate NEAR wallet connection
      const connection: WalletConnection = {
        chain,
        walletType: 'near',
        address: 'alice.defiunite.testnet', // Demo address
        isConnected: true,
        balance: '50.2'
      }

      if (direction === 'from') {
        setFromWallet(connection)
        onFromWalletConnect(connection)
      } else {
        setToWallet(connection)
        onToWalletConnect(connection)
      }

      toast({
        title: "NEAR Wallet Connected",
        description: `Connected to NEAR wallet`,
      })
    } catch (error) {
      throw new Error(`Failed to connect NEAR wallet: ${error}`)
    }
  }

  // Connect Bitcoin wallet
  const connectBitcoinWallet = async (chain: string, direction: 'from' | 'to') => {
    try {
      // For now, simulate Bitcoin wallet connection
      const connection: WalletConnection = {
        chain,
        walletType: 'bitcoin',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Demo address
        isConnected: true,
        balance: '0.001'
      }

      if (direction === 'from') {
        setFromWallet(connection)
        onFromWalletConnect(connection)
      } else {
        setToWallet(connection)
        onToWalletConnect(connection)
      }

      toast({
        title: "Bitcoin Wallet Connected",
        description: `Connected to Bitcoin Lightning wallet`,
      })
    } catch (error) {
      throw new Error(`Failed to connect Bitcoin wallet: ${error}`)
    }
  }

  // Disconnect wallet
  const disconnectWallet = (direction: 'from' | 'to') => {
    if (direction === 'from') {
      setFromWallet(null)
      onFromWalletConnect({ chain: '', walletType: 'metamask', address: '', isConnected: false })
    } else {
      setToWallet(null)
      onToWalletConnect({ chain: '', walletType: 'metamask', address: '', isConnected: false })
    }

    toast({
      title: "Wallet Disconnected",
      description: `${direction === 'from' ? 'Source' : 'Destination'} wallet disconnected`,
    })
  }

  // Check if swap is ready
  useEffect(() => {
    if (fromWallet?.isConnected && toWallet?.isConnected) {
      onSwapReady(fromWallet, toWallet)
    }
  }, [fromWallet, toWallet, onSwapReady])

  // Get wallet icon
  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'metamask': return '🦊'
      case 'phantom': return '👻'
      case 'pera': return '🔵'
      case 'near': return '🟢'
      case 'bitcoin': return '🟠'
      default: return '💳'
    }
  }

  // Get network icon
  const getNetworkIcon = (chain: string) => {
    if (chain.includes('ethereum')) return '🔷'
    if (chain.includes('polygon')) return '🟣'
    if (chain.includes('solana')) return '🟣'
    if (chain.includes('algorand')) return '🟡'
    if (chain.includes('near')) return '🟢'
    if (chain.includes('bitcoin')) return '🟠'
    return '🔗'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔗 Bi-Directional Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect wallets for both sending and receiving chains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Source Chain Wallet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNetworkIcon(fromChain)}</span>
                <h3 className="font-semibold">Source Chain: {fromNetwork?.name}</h3>
                <Badge variant="secondary">{getWalletTypeForChain(fromChain)}</Badge>
              </div>
              {fromWallet?.isConnected && (
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              )}
            </div>

            {!fromWallet?.isConnected ? (
              <Button 
                onClick={connectFromWallet} 
                disabled={isConnectingFrom}
                className="w-full"
              >
                {isConnectingFrom ? 'Connecting...' : `Connect ${fromNetwork?.name} Wallet`}
              </Button>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getWalletIcon(fromWallet.walletType)}</span>
                  <div>
                    <p className="font-mono text-sm">
                      {fromWallet.address.slice(0, 6)}...{fromWallet.address.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {fromWallet.balance || '0.0'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => disconnectWallet('from')}
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Destination Chain Wallet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNetworkIcon(toChain)}</span>
                <h3 className="font-semibold">Destination Chain: {toNetwork?.name}</h3>
                <Badge variant="secondary">{getWalletTypeForChain(toChain)}</Badge>
              </div>
              {toWallet?.isConnected && (
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              )}
            </div>

            {!toWallet?.isConnected ? (
              <Button 
                onClick={connectToWallet} 
                disabled={isConnectingTo}
                className="w-full"
              >
                {isConnectingTo ? 'Connecting...' : `Connect ${toNetwork?.name} Wallet`}
              </Button>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getWalletIcon(toWallet.walletType)}</span>
                  <div>
                    <p className="font-mono text-sm">
                      {toWallet.address.slice(0, 6)}...{toWallet.address.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {toWallet.balance || '0.0'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => disconnectWallet('to')}
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          {/* Swap Ready Status */}
          {fromWallet?.isConnected && toWallet?.isConnected && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <div>
                  <p className="font-semibold text-green-800">Swap Ready!</p>
                  <p className="text-sm text-green-600">
                    Both wallets connected. You can now execute the cross-chain swap.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Extend window object for Solana
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
    }
  }
} 
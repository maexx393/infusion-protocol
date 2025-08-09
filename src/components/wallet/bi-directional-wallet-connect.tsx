'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { getNetworkById } from '@/lib/network-config'
import { appKitWalletService, WalletConnection } from '@/services/appkit-wallet-service'

interface BiDirectionalWalletConnectProps {
  fromChain: string
  toChain: string
  onFromWalletConnect: (connection: WalletConnection) => void
  onToWalletConnect: (connection: WalletConnection) => void
  onSwapReady: (fromWallet: WalletConnection, toWallet: WalletConnection) => void
}

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

  // Get network configurations
  const fromNetwork = getNetworkById(fromChain)
  const toNetwork = getNetworkById(toChain)

  // Connect to source chain wallet
  const connectFromWallet = async () => {
    setIsConnectingFrom(true)
    try {
      const connection = await appKitWalletService.connectWallet(fromChain)
      setFromWallet(connection)
      onFromWalletConnect(connection)
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${fromNetwork?.name} wallet: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`,
      })
    } catch (error) {
      console.error('Error connecting from wallet:', error)
      const msg = error instanceof Error ? error.message : 'Unknown error'
      if (msg.includes('Redirecting to NEAR Wallet')) {
        toast({
          title: 'NEAR Wallet Authorization',
          description: 'Opening NEAR web wallet for sign-in... Return after approving.',
        })
      } else {
        toast({
          title: 'Connection Failed',
          description: `Failed to connect ${fromNetwork?.name} wallet: ${msg}`,
          variant: 'destructive',
        })
      }
    } finally {
      setIsConnectingFrom(false)
    }
  }

  // Connect to destination chain wallet
  const connectToWallet = async () => {
    setIsConnectingTo(true)
    try {
      const connection = await appKitWalletService.connectWallet(toChain)
      setToWallet(connection)
      onToWalletConnect(connection)
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${toNetwork?.name} wallet: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`,
      })
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      const msg = error instanceof Error ? error.message : 'Unknown error'
      if (msg.includes('Redirecting to NEAR Wallet')) {
        toast({
          title: 'NEAR Wallet Authorization',
          description: 'Opening NEAR web wallet for sign-in... Return after approving.',
        })
      } else {
        toast({
          title: 'Connection Failed',
          description: `Failed to connect ${toNetwork?.name} wallet: ${msg}`,
          variant: 'destructive',
        })
      }
    } finally {
      setIsConnectingTo(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = (direction: 'from' | 'to') => {
    const chain = direction === 'from' ? fromChain : toChain
    appKitWalletService.disconnectWallet(chain)
    
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
            Connect wallets for both sending and receiving chains using AppKit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Source Chain Wallet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNetworkIcon(fromChain)}</span>
                <h3 className="font-semibold">Source Chain: {fromNetwork?.name}</h3>
                <Badge variant="secondary">{appKitWalletService.getWalletTypeForChain(fromChain)}</Badge>
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
                {isConnectingFrom ? 'Connecting...' : `Connect ${fromNetwork?.name ?? 'Source'} Wallet`}
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
                  variant="neutral" 
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
                <Badge variant="secondary">{appKitWalletService.getWalletTypeForChain(toChain)}</Badge>
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
                {isConnectingTo ? 'Connecting...' : `Connect ${toNetwork?.name ?? 'Destination'} Wallet`}
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
                  variant="neutral" 
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
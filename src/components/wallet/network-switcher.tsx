'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getNetworkById, getNetworksByCategory } from '@/lib/network-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface NetworkSwitcherProps {
  targetChain: string
  onNetworkSwitched?: (chainId: string) => void
}

export function NetworkSwitcher({ targetChain, onNetworkSwitched }: NetworkSwitcherProps) {
  const [currentChainId, setCurrentChainId] = useState<string>('')
  const [isSwitching, setIsSwitching] = useState(false)
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('')
  const { toast } = useToast()

  const targetNetwork = getNetworkById(targetChain)
  const evmNetworks = getNetworksByCategory('evm')
  const isEvmTarget = targetNetwork?.category === 'evm'

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      getCurrentChain()

      const handleChainChanged = (chainId: string) => {
        setCurrentChainId(chainId)
      }

      const handleConnect = async (info: { chainId?: string }) => {
        if (info?.chainId) {
          setCurrentChainId(info.chainId)
        } else {
          await getCurrentChain()
        }
      }

      const handleDisconnect = () => {
        setCurrentChainId('')
      }

      ;(window.ethereum as any).on('chainChanged', handleChainChanged)
      ;(window.ethereum as any).on('connect', handleConnect as any)
      ;(window.ethereum as any).on('disconnect', handleDisconnect as any)

      return () => {
        ;(window.ethereum as any)?.removeListener('chainChanged', handleChainChanged)
        ;(window.ethereum as any)?.removeListener('connect', handleConnect as any)
        ;(window.ethereum as any)?.removeListener('disconnect', handleDisconnect as any)
      }
    }
  }, [])

  useEffect(() => {
    // Initialize selectedNetworkId to target if EVM, otherwise first EVM network
    if (isEvmTarget && targetNetwork) {
      setSelectedNetworkId(String(targetNetwork.id))
    } else if (evmNetworks.length > 0) {
      setSelectedNetworkId(String(evmNetworks[0].id))
    }
  }, [isEvmTarget, targetNetwork, evmNetworks])

  const getCurrentChain = async () => {
    try {
      const chainId = await (window.ethereum as any)?.request({ method: 'eth_chainId' })
      setCurrentChainId(chainId)
    } catch (error) {
      console.error('Failed to get current chain:', error)
    }
  }

  const switchToNetwork = async (network: any) => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to switch networks",
        variant: "destructive",
      })
      return
    }

    setIsSwitching(true)
    try {
      const targetChainId = `0x${Number(network.id).toString(16)}`

      // Try to switch to the network
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      })

      setCurrentChainId(targetChainId)
      onNetworkSwitched?.(network.id.toString())

      toast({
        title: "Network Switched",
        description: `Successfully switched to ${network.name}`,
      })
    } catch (switchError: any) {
      // If the network doesn't exist in MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${Number(network.id).toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency || {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl]
            }],
          })

          setCurrentChainId(`0x${Number(network.id).toString(16)}`)
          onNetworkSwitched?.(network.id.toString())

          toast({
            title: "Network Added & Switched",
            description: `Successfully added and switched to ${network.name}`,
          })
        } catch (addError) {
          toast({
            title: "Failed to Add Network",
            description: `Could not add ${network.name} to MetaMask`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Network Switch Failed",
          description: `Failed to switch to ${network.name}: ${switchError.message}`,
          variant: "destructive",
        })
      }
    } finally {
      setIsSwitching(false)
    }
  }

  const isCurrentNetwork = (network: any) => {
    return currentChainId === `0x${Number(network.id).toString(16)}`
  }

  if (!targetNetwork) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Not Supported</CardTitle>
          <CardDescription>
            The selected network is not supported by this application.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Configuration</CardTitle>
        <CardDescription>
          Switch your wallet to a supported network for cross-chain swaps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Network Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">Current Network</p>
            <p className="text-sm text-muted-foreground">
              {isEvmTarget
                ? (currentChainId ? `Chain ID: ${currentChainId}` : 'Not connected')
                : `${targetNetwork.name} (non-EVM)`}
            </p>
          </div>
          {currentChainId && isEvmTarget && (
            <Badge variant={isCurrentNetwork(targetNetwork) ? "default" : "secondary"}>
              {isCurrentNetwork(targetNetwork) ? "Connected" : "Wrong Network"}
            </Badge>
          )}
        </div>

        {/* Target Network */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">{targetNetwork.icon}</span>
            <div>
              <p className="font-medium">{targetNetwork.name}</p>
              <p className="text-sm text-muted-foreground">
                Chain ID: {targetNetwork.id}
              </p>
            </div>
          </div>
          {isEvmTarget && (
            <Button
              onClick={() => switchToNetwork(targetNetwork)}
              disabled={isSwitching || isCurrentNetwork(targetNetwork)}
              size="sm"
            >
              {isSwitching ? 'Switching...' : 
               isCurrentNetwork(targetNetwork) ? 'Connected' : 'Switch'}
            </Button>
          )}
        </div>

        {/* Other Supported Networks */}
        <div>
          <p className="text-sm font-medium mb-2">Other Supported Networks</p>
          <div className="flex items-center gap-2">
            <Select value={selectedNetworkId} onValueChange={(v) => setSelectedNetworkId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {evmNetworks.map((net) => (
                  <SelectItem key={net.id} value={String(net.id)}>
                    {net.icon} {net.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                        {isEvmTarget && (
              <Button
                onClick={() => {
                  const net = getNetworkById(selectedNetworkId)
                  if (net) switchToNetwork(net)
                }}
                disabled={isSwitching || (selectedNetworkId ? isCurrentNetwork(getNetworkById(selectedNetworkId) as any) : false)}
                size="sm"
              >
                Switch
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// (Global window types for ethereum are defined in src/types/global.d.ts)
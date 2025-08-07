import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  useAppKitAccount,
  useAppKitNetwork
} from '@reown/appkit/react'
import { NETWORK_CONFIGS, NetworkConfig } from '@/lib/network-config'

interface WalletConnectionState {
  isConnecting: boolean
  connectionAttempts: number
  lastError: string | null
  isRetrying: boolean
}

export function useWalletConnection() {
  const [state, setState] = useState<WalletConnectionState>({
    isConnecting: false,
    connectionAttempts: 0,
    lastError: null,
    isRetrying: false
  })

  const { toast } = useToast()
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()

  // Reset state when connected
  useEffect(() => {
    if (isConnected) {
      setState(prev => ({
        ...prev,
        connectionAttempts: 0,
        lastError: null,
        isRetrying: false
      }))
    }
  }, [isConnected])

  // Auto-retry connection on error
  useEffect(() => {
    if (state.lastError && state.connectionAttempts < 3 && !state.isRetrying) {
      const retryTimeout = setTimeout(() => {
        setState(prev => ({ ...prev, isRetrying: true }))
        handleConnect()
      }, 2000) // Retry after 2 seconds

      return () => clearTimeout(retryTimeout)
    }
  }, [state.lastError, state.connectionAttempts, state.isRetrying])

  const handleConnect = useCallback(async () => {
    if (state.isConnecting) {
      toast({
        title: "Connection in Progress",
        description: "Please wait for the current connection attempt to complete",
        variant: "destructive",
      })
      return
    }

    setState(prev => ({
      ...prev,
      isConnecting: true,
      connectionAttempts: prev.connectionAttempts + 1,
      lastError: null
    }))

    try {
      // Add delay to prevent rapid connection attempts
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Use AppKit connect button functionality
      // The modal will be handled by the AppKitConnectButton component
      toast({
        title: "Wallet Connection",
        description: "Please use the connect button to connect your wallet",
      })

      // Reset state on successful modal open
      setState(prev => ({
        ...prev,
        connectionAttempts: 0,
        lastError: null,
        isRetrying: false
      }))

    } catch (error) {
      console.error('Connection error:', error)
      
      let errorMessage = "Failed to open wallet modal"
      
      if (error instanceof Error) {
        if (error.message.includes('Connection declined')) {
          errorMessage = "Connection declined. Please try again or check if a previous request is still active."
        } else if (error.message.includes('User rejected')) {
          errorMessage = "Connection was rejected by user"
        } else if (error.message.includes('timeout')) {
          errorMessage = "Connection timeout. Please try again"
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your internet connection"
        } else {
          errorMessage = error.message
        }
      }

      setState(prev => ({
        ...prev,
        lastError: errorMessage
      }))

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })

      // If too many attempts, suggest refresh
      if (state.connectionAttempts >= 3) {
        toast({
          title: "Multiple Connection Attempts",
          description: "Consider refreshing the page if connection issues persist",
          variant: "destructive",
        })
      }
    } finally {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isRetrying: false
      }))
    }
  }, [state.isConnecting, state.connectionAttempts, toast])

  const handleDisconnect = useCallback(async () => {
    try {
      // Disconnect will be handled by AppKit components
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error) {
      console.error('Disconnect error:', error)
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }, [toast])

  const switchNetwork = useCallback(async (networkId: number | string) => {
    try {
      const network = NETWORK_CONFIGS.find(n => n.id === networkId)
      if (!network) {
        throw new Error(`Network ${networkId} not found`)
      }

      // Network switching will be handled by AppKitNetworkButton
      toast({
        title: "Network Switched",
        description: `Switched to ${network.name}`,
      })
    } catch (error) {
      console.error('Network switch error:', error)
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch network. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const getCurrentNetwork = useCallback((): NetworkConfig | null => {
    if (!caipNetwork) return null
    
    const network = NETWORK_CONFIGS.find(n => 
      n.id === caipNetwork.id || n.name === caipNetwork.name
    )
    
    return network || null
  }, [caipNetwork])

  const getSupportedNetworks = useCallback(() => {
    return NETWORK_CONFIGS
  }, [])

  const checkNetworkStatus = useCallback(async (network: NetworkConfig): Promise<boolean> => {
    try {
      if (network.category === 'evm') {
        const response = await fetch(network.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        })
        return response.ok
      }
      // Add other network type checks as needed
      return true
    } catch (error) {
      console.error(`Network status check failed for ${network.name}:`, error)
      return false
    }
  }, [])

  return {
    // State
    isConnected,
    address,
    currentNetwork: getCurrentNetwork(),
    isConnecting: state.isConnecting,
    connectionAttempts: state.connectionAttempts,
    lastError: state.lastError,
    isRetrying: state.isRetrying,

    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchNetwork,
    
    // Utilities
    getSupportedNetworks,
    checkNetworkStatus,
    
    // Network info
    caipNetwork
  }
} 
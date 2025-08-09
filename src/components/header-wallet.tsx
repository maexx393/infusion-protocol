'use client'

import { 
  AppKitConnectButton, 
  AppKitAccountButton, 
  AppKitNetworkButton,
  useAppKitAccount,
  useAppKitNetwork
} from '@reown/appkit/react'
import { NETWORK_CONFIGS } from '@/lib/network-config'

export function HeaderWallet() {
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()

  const getCurrentNetwork = () => {
    if (!caipNetwork) return null
    
    const network = NETWORK_CONFIGS.find(n => 
      n.id === caipNetwork.id || n.name === caipNetwork.name
    )
    
    return network || null
  }

  const currentNetwork = getCurrentNetwork()

  if (!isConnected) {
    return (
      <AppKitConnectButton
        size="md"
        label="Connect Wallet"
        loadingLabel="Connecting..."
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium"
      />
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Network Status */}
      <div className="hidden sm:flex items-center space-x-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-gray-300">
          {currentNetwork ? currentNetwork.name : 'Connected'}
        </span>
      </div>

      {/* Wallet Address */}
      <div className="hidden md:flex items-center space-x-2">
        <span className="text-white text-sm font-medium">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
        </span>
      </div>

      {/* Network and Account Buttons */}
      <div className="flex items-center space-x-1">
        <AppKitNetworkButton />
        <AppKitAccountButton />
      </div>
    </div>
  )
} 
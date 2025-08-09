'use client'

import { 
  AppKitConnectButton, 
  AppKitAccountButton, 
  AppKitNetworkButton
} from '@reown/appkit/react'

export function WalletConnect() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AppKitConnectButton
        size="md"
        label="Connect Wallet"
        loadingLabel="Connecting..."
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
      />
    </div>
  )
}

// Add ethereum to window type for backward compatibility
declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
} 
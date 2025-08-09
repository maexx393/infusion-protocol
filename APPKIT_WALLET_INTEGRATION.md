# 🔗 AppKit Wallet Integration Guide

## Overview

This document outlines the implementation of **Reown AppKit** wallet connections for cross-chain atomic swaps, replacing custom wallet implementations with the standardized AppKit framework.

## 🚀 AppKit Integration

### **Supported Networks & Wallets**

#### **EVM Networks (via AppKit)**
- **Ethereum Mainnet/Sepolia** - MetaMask, WalletConnect
- **Polygon Mainnet/Amoy** - MetaMask, WalletConnect  
- **Arbitrum One/Sepolia** - MetaMask, WalletConnect
- **Base Mainnet/Sepolia** - MetaMask, WalletConnect
- **Optimism Mainnet/Sepolia** - MetaMask, WalletConnect
- **BNB Smart Chain/Testnet** - MetaMask, WalletConnect
- **Avalanche Mainnet/Fuji** - MetaMask, WalletConnect
- **Fantom Mainnet/Testnet** - MetaMask, WalletConnect

#### **Solana Networks (via AppKit)**
- **Solana Mainnet** - Phantom, Solflare
- **Solana Devnet** - Phantom, Solflare

#### **Algorand Networks (via Pera Wallet)**
- **Algorand Mainnet** - Pera Wallet
- **Algorand Testnet** - Pera Wallet

#### **NEAR Networks (via NEAR Wallet)**
- **NEAR Mainnet** - NEAR Wallet
- **NEAR Testnet** - NEAR Wallet

#### **Bitcoin Networks (via Bitcoin Wallet)**
- **Bitcoin Mainnet** - Bitcoin Lightning Wallet
- **Bitcoin Testnet** - Bitcoin Lightning Wallet

## 🏗️ Architecture

### **Core Components**

1. **AppKit Configuration** (`src/lib/appkit-config.ts`)
   - Centralized AppKit setup with all adapters
   - Network configuration for all supported chains
   - Metadata and project configuration

2. **AppKit Provider** (`src/components/appkit-provider.tsx`)
   - React provider wrapping the application
   - Wagmi and QueryClient integration
   - AppKit instance export

3. **AppKit Wallet Service** (`src/services/appkit-wallet-service.ts`)
   - Service layer for wallet connections
   - Integration with AppKit modal and connection management
   - Fallback implementations for unsupported chains

4. **Bi-Directional Wallet Connect** (`src/components/wallet/bi-directional-wallet-connect.tsx`)
   - UI component for wallet connections
   - Integration with AppKit wallet service
   - Real-time connection status and balance display

## 🔧 Implementation Details

### **AppKit Configuration Setup**

```typescript
// src/lib/appkit-config.ts
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'

// Create adapters for different blockchain types
const wagmiAdapter = new WagmiAdapter({
  networks: evmNetworks,
  projectId,
  ssr: true
})

const solanaAdapter = new SolanaAdapter({
  networks: solanaNetworks,
  projectId,
  ssr: true
})

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
  networks: allNetworks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})
```

### **AppKit Provider Integration**

```typescript
// src/components/appkit-provider.tsx
export function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### **Wallet Service with AppKit Integration**

```typescript
// src/services/appkit-wallet-service.ts
export class AppKitWalletService {
  // Connect EVM wallet using AppKit
  async connectEVMWallet(chain: string): Promise<WalletConnection> {
    try {
      // Use AppKit to open the modal for EVM wallet connection
      await appKit.modal.open()

      // Wait for connection to be established
      const connection = await this.waitForConnection(chain, 'metamask')
      
      if (!connection) {
        throw new Error('Failed to connect EVM wallet')
      }

      return connection
    } catch (error) {
      throw new Error(`Failed to connect EVM wallet: ${error}`)
    }
  }

  // Connect Solana wallet using AppKit
  async connectSolanaWallet(chain: string): Promise<WalletConnection> {
    try {
      // Use AppKit to open the modal for Solana wallet connection
      await appKit.modal.open()

      // Wait for connection to be established
      const connection = await this.waitForConnection(chain, 'phantom')
      
      if (!connection) {
        throw new Error('Failed to connect Solana wallet')
      }

      return connection
    } catch (error) {
      throw new Error(`Failed to connect Solana wallet: ${error}`)
    }
  }
}
```

## 🛠️ Setup Requirements

### **Dependencies**

```json
{
  "@reown/appkit": "^1.0.0",
  "@reown/appkit-adapter-wagmi": "^1.0.0",
  "@reown/appkit-adapter-solana": "^1.0.0",
  "@reown/appkit-adapter-bitcoin": "^1.0.0",
  "wagmi": "^2.0.0",
  "viem": "^2.0.0",
  "@tanstack/react-query": "^5.0.0",
  "@solana/web3.js": "^1.87.0",
  "@perawallet/connect": "^1.4.2",
  "near-api-js": "^2.1.2"
}
```

### **Environment Variables**

```bash
# AppKit Configuration
NEXT_PUBLIC_PROJECT_ID="your-walletconnect-project-id"

# EVM Networks
NEXT_PUBLIC_ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_OPTIMISM_RPC=https://mainnet.optimism.io

# Solana Networks
NEXT_PUBLIC_SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_TESTNET_RPC=https://api.devnet.solana.com

# Algorand Networks
NEXT_PUBLIC_ALGORAND_MAINNET_RPC=https://mainnet-api.algonode.cloud
NEXT_PUBLIC_ALGORAND_TESTNET_RPC=https://testnet-api.algonode.cloud

# NEAR Networks
NEXT_PUBLIC_NEAR_MAINNET_RPC=https://rpc.mainnet.near.org
NEXT_PUBLIC_NEAR_TESTNET_RPC=https://rpc.testnet.near.org

# Bitcoin Networks
NEXT_PUBLIC_BITCOIN_MAINNET_RPC=https://blockstream.info/api
NEXT_PUBLIC_BITCOIN_TESTNET_RPC=https://blockstream.info/testnet/api
```

## 🎯 Usage Examples

### **Basic AppKit Integration**

```typescript
// Wrap your app with AppKit provider
import { AppKitProvider } from '@/components/appkit-provider'

function App() {
  return (
    <AppKitProvider>
      <YourApp />
    </AppKitProvider>
  )
}
```

### **Wallet Connection**

```typescript
import { appKitWalletService } from '@/services/appkit-wallet-service'

// Connect to any supported network
const connection = await appKitWalletService.connectWallet('80002') // Polygon Amoy
console.log('Connected:', connection.address)
console.log('Balance:', connection.balance)
```

### **Multi-Chain Connection**

```typescript
// Connect source wallet (EVM via AppKit)
const fromWallet = await appKitWalletService.connectWallet('80002') // Polygon Amoy

// Connect destination wallet (Solana via AppKit)
const toWallet = await appKitWalletService.connectWallet('solana-devnet')

// Check if both are connected
if (fromWallet.isConnected && toWallet.isConnected) {
  console.log('Ready for cross-chain swap!')
}
```

## 🔒 Security Features

### **AppKit Security**
- **WalletConnect v2** integration for secure connections
- **Project ID validation** for dApp identification
- **Network validation** before transactions
- **Connection state management** with proper cleanup

### **Fallback Security**
- **Pera Wallet** for Algorand (official SDK)
- **NEAR Wallet** for NEAR Protocol (official integration)
- **Bitcoin Wallet** for Bitcoin Lightning (standard implementation)

## 🚨 Error Handling

### **AppKit Errors**

```typescript
try {
  const connection = await appKitWalletService.connectWallet(chain)
} catch (error) {
  if (error.message.includes('modal')) {
    // AppKit modal error
    showModalError()
  } else if (error.message.includes('connection')) {
    // Connection timeout
    showConnectionError()
  } else {
    // Generic error
    showGenericError(error.message)
  }
}
```

### **Common Error Scenarios**

1. **AppKit Modal Not Opening**
   - Check project ID configuration
   - Verify AppKit provider is properly wrapped
   - Ensure all dependencies are installed

2. **Connection Timeout**
   - AppKit modal opened but no wallet connected
   - User didn't complete the connection flow
   - Network issues with WalletConnect

3. **Unsupported Network**
   - Network not configured in AppKit
   - Wallet doesn't support the network
   - Fallback to custom implementation

## 🔄 Integration with Atomic Swaps

### **Pre-Swap Validation**

```typescript
// Validate wallet connections before swap
if (!fromWallet?.isConnected || !toWallet?.isConnected) {
  throw new Error('Both wallets must be connected')
}

// Use connected wallet addresses in swap
const swapRequest = {
  fromChain: fromWallet.chain,
  toChain: toWallet.chain,
  userAddress: fromWallet.address,
  // ... other swap parameters
}
```

### **Real-Time Balance Updates**

```typescript
// Monitor balance changes during swap
const monitorBalance = async (chain: string, address: string) => {
  const connection = appKitWalletService.getConnectedWallet(chain)
  if (connection) {
    // Re-fetch balance
    const newBalance = await appKitWalletService.getBalance(chain, address)
    // Update UI
    updateBalanceDisplay(chain, newBalance)
  }
}
```

## 📊 Performance Considerations

### **AppKit Optimizations**
- **SSR Support** with proper configuration
- **Lazy Loading** of wallet adapters
- **Connection Caching** in AppKit service
- **Modal State Management** for better UX

### **Fallback Optimizations**
- **Dynamic Imports** for heavy wallet libraries
- **Connection Pooling** for RPC calls
- **Error Recovery** with retry mechanisms
- **Balance Caching** to reduce API calls

## 🔮 Future Enhancements

### **Planned AppKit Features**
- [ ] **Algorand Support** in AppKit (currently using Pera fallback)
- [ ] **NEAR Support** in AppKit (currently using NEAR Wallet fallback)
- [ ] **Bitcoin Support** in AppKit (currently using custom implementation)
- [ ] **Multi-Wallet Support** per network
- [ ] **Hardware Wallet Integration** (Ledger, Trezor)

### **Potential Integrations**
- [ ] **WalletConnect v3** when available
- [ ] **RainbowKit** compatibility layer
- [ ] **Web3Modal** integration
- [ ] **Custom Wallet Adapters**

## 🧪 Testing

### **AppKit Testing**

```typescript
describe('AppKit Wallet Service', () => {
  it('should connect to EVM wallet via AppKit', async () => {
    const connection = await appKitWalletService.connectEVMWallet('80002')
    expect(connection.isConnected).toBe(true)
    expect(connection.walletType).toBe('metamask')
  })

  it('should connect to Solana wallet via AppKit', async () => {
    const connection = await appKitWalletService.connectSolanaWallet('solana-devnet')
    expect(connection.isConnected).toBe(true)
    expect(connection.walletType).toBe('phantom')
  })
})
```

### **Integration Testing**

```typescript
describe('Bi-Directional Wallet Connect', () => {
  it('should connect both wallets using AppKit', async () => {
    // Test full connection flow
    await connectFromWallet()
    await connectToWallet()
    expect(isSwapReady).toBe(true)
  })
})
```

## 📝 Migration Guide

### **From Custom to AppKit**

1. **Replace Custom Wallet Service**
   ```typescript
   // OLD: Custom wallet service
   import { walletService } from '@/services/wallet-service'
   
   // NEW: AppKit wallet service
   import { appKitWalletService } from '@/services/appkit-wallet-service'
   ```

2. **Update Provider Setup**
   ```typescript
   // OLD: Custom provider
   <CustomWalletProvider>
   
   // NEW: AppKit provider
   <AppKitProvider>
   ```

3. **Update Connection Logic**
   ```typescript
   // OLD: Direct wallet connection
   const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
   
   // NEW: AppKit modal connection
   await appKit.modal.open()
   const connection = await appKitWalletService.connectWallet(chain)
   ```

## 🏆 Benefits of AppKit Integration

### **Standardization**
- **Unified API** across all blockchain networks
- **Consistent UX** with standardized modal
- **Better Compatibility** with wallet ecosystems

### **Maintenance**
- **Reduced Code** for wallet integrations
- **Automatic Updates** through AppKit
- **Better Error Handling** with standardized errors

### **User Experience**
- **Familiar Interface** for wallet connections
- **Multi-Wallet Support** in single modal
- **Network Switching** within AppKit

### **Developer Experience**
- **Simplified Integration** with single service
- **Better Documentation** and examples
- **Active Community** support

This implementation provides a **production-ready AppKit integration** that leverages the power of Reown AppKit while maintaining fallback support for networks not yet supported by AppKit, ensuring comprehensive cross-chain wallet connectivity for atomic swaps. 
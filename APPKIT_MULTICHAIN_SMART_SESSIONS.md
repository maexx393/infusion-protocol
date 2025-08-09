# 🔗 AppKit Multichain & Smart Sessions Integration

## Overview

This document outlines the complete implementation of **Reown AppKit** with multichain support (EVM, Solana, Bitcoin, Algorand, NEAR) and **Smart Sessions** for agentic wallet interactions in cross-chain atomic swaps.

## 🚀 **Complete AppKit Integration**

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

#### **Bitcoin Networks (via AppKit)**
- **Bitcoin Mainnet** - Bitcoin wallets
- **Bitcoin Testnet** - Bitcoin wallets

#### **Algorand Networks (Custom Implementation)**
- **Algorand Mainnet** - Pera Wallet
- **Algorand Testnet** - Pera Wallet

#### **NEAR Networks (Custom Implementation)**
- **NEAR Mainnet** - NEAR Wallet
- **NEAR Testnet** - NEAR Wallet

## 🏗️ **Architecture**

### **Core Components**

1. **AppKit Configuration** (`src/lib/appkit-config.ts`)
   - Centralized AppKit setup with all adapters
   - Network configuration for all supported chains
   - Extended AppKit interface for type safety

2. **AppKit Provider** (`src/components/appkit-provider.tsx`)
   - React provider with Wagmi and QueryClient integration
   - Proper SSR support and configuration

3. **AppKit Wallet Service** (`src/services/appkit-wallet-service.ts`)
   - Service layer integrating with AppKit modal system
   - EVM, Solana, and Bitcoin connections via AppKit
   - Custom implementations for Algorand and NEAR
   - Smart Session integration

4. **Smart Session Service** (`src/services/smart-session-service.ts`)
   - Agentic wallet interactions
   - Permission-based transaction execution
   - Session management and validation

5. **Bi-Directional Wallet Connect** (`src/components/wallet/bi-directional-wallet-connect.tsx`)
   - UI component for wallet connections
   - Integration with AppKit wallet service
   - Real-time connection status and balance display

## 🔧 **Implementation Details**

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

const bitcoinAdapter = new BitcoinAdapter({
  networks: bitcoinNetworks,
  projectId,
  ssr: true
})

// Create AppKit instance with all adapters
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

### **Smart Sessions Integration**

```typescript
// src/services/smart-session-service.ts
export class SmartSessionService {
  // Request Smart Session permissions
  async requestPermissions(request: SmartSessionRequest): Promise<SmartSessionResponse> {
    // Open AppKit modal for Smart Session request
    await extendedAppKit.modal.open()
    
    // Wait for Smart Session approval
    const sessionResponse = await this.waitForSmartSessionApproval(request)
    
    return sessionResponse
  }

  // Execute transaction using Smart Session
  async executeTransaction(sessionId: string, chainId: string, transaction: any): Promise<string> {
    // Validate session and execute transaction
    const session = this.activeSessions.get(sessionId)
    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Smart Session not found or expired')
    }
    
    return this.executeWithSmartSession(sessionId, chainId, transaction)
  }
}
```

### **Multichain Wallet Connections**

```typescript
// src/services/appkit-wallet-service.ts
export class AppKitWalletService {
  // Connect wallet using AppKit
  async connectWallet(chain: string): Promise<WalletConnection> {
    const walletType = this.getWalletTypeForChain(chain)
    
    switch (walletType) {
      case 'metamask':
        return this.connectEVMWallet(chain)
      case 'phantom':
        return this.connectSolanaWallet(chain)
      case 'bitcoin':
        return this.connectBitcoinWallet(chain)
      case 'pera':
        return this.connectAlgorandWallet(chain)
      case 'near':
        return this.connectNEARWallet(chain)
      default:
        throw new Error(`Unsupported wallet type for chain: ${chain}`)
    }
  }

  // Connect EVM wallet with Smart Session
  async connectEVMWallet(chain: string): Promise<WalletConnection> {
    // Use AppKit to open the modal for EVM wallet connection
    if (extendedAppKit.modal) {
      await extendedAppKit.modal.open()
    }

    // Wait for connection to be established
    const connection = await this.waitForConnection(chain, 'metamask')
    
    // Request Smart Session for atomic swaps
    const smartSession = await this.requestSmartSession(chain, connection.address)
    if (smartSession) {
      connection.smartSessionId = smartSession.sessionId
    }

    return connection
  }
}
```

## 🛠️ **Setup Requirements**

### **Dependencies**

```json
{
  "@reown/appkit": "^1.0.0",
  "@reown/appkit-adapter-wagmi": "^1.0.0",
  "@reown/appkit-adapter-solana": "^1.0.0",
  "@reown/appkit-adapter-bitcoin": "^1.0.0",
  "@reown/appkit-experimental": "^1.0.0",
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
```

## 🎯 **Usage Examples**

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

### **Multichain Wallet Connection**

```typescript
import { appKitWalletService } from '@/services/appkit-wallet-service'

// Connect to any supported network
const connection = await appKitWalletService.connectWallet('80002') // Polygon Amoy
console.log('Connected:', connection.address)
console.log('Balance:', connection.balance)
console.log('Smart Session:', connection.smartSessionId)
```

### **Smart Session Transaction Execution**

```typescript
import { smartSessionService } from '@/services/smart-session-service'

// Execute transaction using Smart Session
const txHash = await smartSessionService.executeTransaction(
  sessionId,
  chainId,
  {
    to: '0x...',
    data: '0x...',
    value: '0x0'
  }
)
```

### **Multi-Chain Atomic Swap with Smart Sessions**

```typescript
// Connect source wallet (EVM via AppKit with Smart Session)
const fromWallet = await appKitWalletService.connectWallet('80002') // Polygon Amoy

// Connect destination wallet (Solana via AppKit)
const toWallet = await appKitWalletService.connectWallet('solana-devnet')

// Execute atomic swap using Smart Session
if (fromWallet.smartSessionId) {
  const swapTx = await smartSessionService.executeTransaction(
    fromWallet.smartSessionId,
    fromWallet.chain,
    {
      to: contractAddress,
      data: swapData,
      value: amount
    }
  )
  console.log('Atomic swap executed:', swapTx)
}
```

## 🔒 **Smart Sessions Features**

### **Permission-Based Security**
- **Contract Call Permissions**: Specific functions allowed on specific contracts
- **Transaction Permissions**: General transaction execution
- **Balance Permissions**: Balance checking capabilities
- **Session Duration**: Configurable session timeouts
- **Automatic Revocation**: Sessions expire automatically

### **Agentic Wallet Interactions**
- **One-Time Approval**: Users approve permissions once per session
- **Automatic Execution**: Transactions execute without repeated approvals
- **Permission Validation**: All transactions validated against granted permissions
- **Session Management**: Active session tracking and management

### **Atomic Swap Integration**
```typescript
// Create Smart Session for atomic swaps
createAtomicSwapSession(chainId: string, contractAddress: string): SmartSessionRequest {
  return {
    permissions: [
      {
        type: 'contract-call',
        data: {
          address: contractAddress,
          functions: [
            { functionName: 'deposit', valueLimit: '0x0' },
            { functionName: 'claim', valueLimit: '0x0' },
            { functionName: 'refund', valueLimit: '0x0' }
          ]
        }
      },
      { type: 'transaction', data: {} },
      { type: 'balance', data: {} }
    ],
    sessionDuration: 3600, // 1 hour
    description: 'Atomic swap session for cross-chain transactions'
  }
}
```

## 🚨 **Error Handling**

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

### **Smart Session Errors**

```typescript
try {
  const txHash = await smartSessionService.executeTransaction(sessionId, chainId, transaction)
} catch (error) {
  if (error.message.includes('expired')) {
    // Session expired - request new session
    await requestNewSession()
  } else if (error.message.includes('permission')) {
    // Permission denied
    showPermissionError()
  } else {
    // Transaction failed
    showTransactionError(error.message)
  }
}
```

## 🔄 **Integration with Atomic Swaps**

### **Pre-Swap Smart Session Setup**

```typescript
// Validate wallet connections and Smart Sessions before swap
if (!fromWallet?.isConnected || !toWallet?.isConnected) {
  throw new Error('Both wallets must be connected')
}

if (!fromWallet.smartSessionId) {
  throw new Error('Smart Session required for atomic swaps')
}

// Use connected wallet addresses and Smart Session in swap
const swapRequest = {
  fromChain: fromWallet.chain,
  toChain: toWallet.chain,
  userAddress: fromWallet.address,
  smartSessionId: fromWallet.smartSessionId,
  // ... other swap parameters
}
```

### **Real-Time Smart Session Monitoring**

```typescript
// Monitor Smart Session status during swap
const monitorSmartSession = async (sessionId: string) => {
  const isActive = smartSessionService.isSessionActive(sessionId)
  if (!isActive) {
    // Session expired - handle gracefully
    await handleSessionExpiration(sessionId)
  }
}
```

## 📊 **Performance Considerations**

### **AppKit Optimizations**
- **SSR Support** with proper configuration
- **Lazy Loading** of wallet adapters
- **Connection Caching** in AppKit service
- **Modal State Management** for better UX

### **Smart Session Optimizations**
- **Session Pooling** for multiple transactions
- **Permission Caching** to reduce validation overhead
- **Automatic Cleanup** of expired sessions
- **Batch Transaction Support** for multiple operations

### **Multichain Optimizations**
- **Parallel Connections** for multiple chains
- **Network-Specific Optimizations** for each blockchain
- **Fallback Mechanisms** for unsupported networks
- **Balance Caching** to reduce API calls

## 🔮 **Future Enhancements**

### **Planned AppKit Features**
- [ ] **Native Algorand Support** in AppKit (currently using Pera fallback)
- [ ] **Native NEAR Support** in AppKit (currently using NEAR Wallet fallback)
- [ ] **Enhanced Smart Sessions** with more granular permissions
- [ ] **Multi-Wallet Support** per network
- [ ] **Hardware Wallet Integration** (Ledger, Trezor)

### **Potential Integrations**
- [ ] **WalletConnect v3** when available
- [ ] **RainbowKit** compatibility layer
- [ ] **Web3Modal** integration
- [ ] **Custom Wallet Adapters**
- [ ] **Cross-Chain Smart Sessions** for atomic swaps

## 🧪 **Testing**

### **AppKit Testing**

```typescript
describe('AppKit Wallet Service', () => {
  it('should connect to EVM wallet via AppKit', async () => {
    const connection = await appKitWalletService.connectEVMWallet('80002')
    expect(connection.isConnected).toBe(true)
    expect(connection.walletType).toBe('metamask')
    expect(connection.smartSessionId).toBeDefined()
  })

  it('should connect to Solana wallet via AppKit', async () => {
    const connection = await appKitWalletService.connectSolanaWallet('solana-devnet')
    expect(connection.isConnected).toBe(true)
    expect(connection.walletType).toBe('phantom')
  })

  it('should connect to Bitcoin wallet via AppKit', async () => {
    const connection = await appKitWalletService.connectBitcoinWallet('bitcoin-testnet')
    expect(connection.isConnected).toBe(true)
    expect(connection.walletType).toBe('bitcoin')
  })
})
```

### **Smart Session Testing**

```typescript
describe('Smart Session Service', () => {
  it('should create and manage Smart Sessions', async () => {
    const sessionRequest = smartSessionService.createAtomicSwapSession('80002', '0x...')
    const session = await smartSessionService.requestPermissions(sessionRequest)
    
    expect(session.sessionId).toBeDefined()
    expect(session.expiresAt).toBeGreaterThan(Date.now())
    expect(smartSessionService.isSessionActive(session.sessionId)).toBe(true)
  })

  it('should execute transactions with Smart Sessions', async () => {
    const txHash = await smartSessionService.executeTransaction(
      sessionId,
      chainId,
      transaction
    )
    expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/)
  })
})
```

## 📝 **Migration Guide**

### **From Custom to AppKit with Smart Sessions**

1. **Replace Custom Wallet Service**
   ```typescript
   // OLD: Custom wallet service
   import { walletService } from '@/services/wallet-service'
   
   // NEW: AppKit wallet service with Smart Sessions
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
   
   // NEW: AppKit modal connection with Smart Session
   const connection = await appKitWalletService.connectWallet(chain)
   console.log('Smart Session ID:', connection.smartSessionId)
   ```

4. **Update Transaction Execution**
   ```typescript
   // OLD: Direct transaction
   const tx = await wallet.sendTransaction(transaction)
   
   // NEW: Smart Session transaction
   const txHash = await smartSessionService.executeTransaction(
     sessionId,
     chainId,
     transaction
   )
   ```

## 🏆 **Benefits of AppKit + Smart Sessions**

### **Standardization**
- **Unified API** across all blockchain networks
- **Consistent UX** with standardized modal
- **Better Compatibility** with wallet ecosystems

### **Security**
- **Permission-Based Access** with Smart Sessions
- **Session Management** with automatic expiration
- **Transaction Validation** against granted permissions

### **User Experience**
- **One-Time Approval** for multiple transactions
- **Agentic Interactions** without constant popups
- **Seamless Cross-Chain** operations

### **Developer Experience**
- **Simplified Integration** with single service
- **Smart Session Management** for complex workflows
- **Better Error Handling** with standardized errors

This implementation provides a **production-ready AppKit integration** with **Smart Sessions** that leverages the power of Reown AppKit while maintaining comprehensive support for all blockchain networks through both AppKit and custom implementations, enabling **agentic wallet interactions** for seamless cross-chain atomic swaps! 🎉 
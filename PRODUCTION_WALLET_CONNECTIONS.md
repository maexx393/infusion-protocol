# 🔗 Production Wallet Connections Guide

## Overview

This document outlines the implementation of real production wallet connections for cross-chain atomic swaps, replacing the previous simulated connections with actual blockchain wallet integrations.

## 🚀 Supported Wallets & Networks

### EVM Networks (MetaMask)
- **Ethereum Mainnet/Sepolia**
- **Polygon Mainnet/Amoy**
- **Arbitrum One/Sepolia**
- **Base Mainnet/Sepolia**
- **Optimism Mainnet/Sepolia**
- **BNB Smart Chain/Testnet**
- **Avalanche Mainnet/Fuji**
- **Fantom Mainnet/Testnet**

### Solana Networks (Phantom)
- **Solana Mainnet**
- **Solana Devnet**

### Algorand Networks (Pera)
- **Algorand Mainnet**
- **Algorand Testnet**

### NEAR Networks (NEAR Wallet)
- **NEAR Mainnet**
- **NEAR Testnet**

### Bitcoin Networks (Lightning)
- **Bitcoin Mainnet**
- **Bitcoin Testnet**

## 🏗️ Architecture

### Core Components

1. **WalletService** (`src/services/wallet-service.ts`)
   - Singleton service managing all wallet connections
   - Handles connection, disconnection, and balance fetching
   - Supports all blockchain types

2. **BiDirectionalWalletConnect** (`src/components/wallet/bi-directional-wallet-connect.tsx`)
   - React component for UI wallet connections
   - Integrates with WalletService for real connections
   - Provides user feedback and error handling

3. **NetworkSwitcher** (`src/components/wallet/network-switcher.tsx`)
   - Manages EVM network switching
   - Auto-adds missing networks to MetaMask
   - Real-time network status monitoring

### Connection Flow

```typescript
// 1. User clicks connect button
const connectFromWallet = async () => {
  const connection = await walletService.connectWallet(fromChain)
  setFromWallet(connection)
  onFromWalletConnect(connection)
}

// 2. WalletService determines wallet type and connects
async connectWallet(chain: string): Promise<WalletConnection> {
  const walletType = this.getWalletTypeForChain(chain)
  
  switch (walletType) {
    case 'metamask': return this.connectEVMWallet(chain)
    case 'phantom': return this.connectSolanaWallet(chain)
    case 'pera': return this.connectAlgorandWallet(chain)
    case 'near': return this.connectNEARWallet(chain)
    case 'bitcoin': return this.connectBitcoinWallet(chain)
  }
}
```

## 🔧 Implementation Details

### EVM Wallet Connection (MetaMask)

```typescript
async connectEVMWallet(chain: string): Promise<WalletConnection> {
  // 1. Check MetaMask availability
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  // 2. Request account access
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  })

  // 3. Ensure correct network
  await this.ensureEVMNetwork(chain)

  // 4. Get balance
  const balance = await window.ethereum.request({
    method: 'eth_getBalance',
    params: [address, 'latest']
  })

  return {
    chain,
    walletType: 'metamask',
    address,
    isConnected: true,
    balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
  }
}
```

### Solana Wallet Connection (Phantom)

```typescript
async connectSolanaWallet(chain: string): Promise<WalletConnection> {
  // 1. Check Phantom availability
  if (!window.solana?.isPhantom) {
    throw new Error('Phantom wallet not found')
  }

  // 2. Connect to Phantom
  const response = await window.solana.connect()
  const address = response.publicKey.toString()
  
  // 3. Get balance via RPC
  const connection = new Connection(network.rpcUrl)
  const balance = await connection.getBalance(new PublicKey(address))

  return {
    chain,
    walletType: 'phantom',
    address,
    isConnected: true,
    balance: (balance / LAMPORTS_PER_SOL).toFixed(4)
  }
}
```

### Algorand Wallet Connection (Pera)

```typescript
async connectAlgorandWallet(chain: string): Promise<WalletConnection> {
  // 1. Import PeraWalletConnect dynamically
  const { PeraWalletConnect } = await import('@perawallet/connect')
  
  // 2. Initialize with correct network
  const peraWallet = new PeraWalletConnect({
    chainId: chain.includes('testnet') ? 416001 : 416002
  })

  // 3. Connect and get accounts
  const accounts = await peraWallet.connect()
  const address = accounts[0]

  // 4. Get balance via RPC
  const balanceResponse = await fetch(network.rpcUrl, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'account_info',
      params: [address]
    })
  })

  return {
    chain,
    walletType: 'pera',
    address,
    isConnected: true,
    balance: calculatedBalance
  }
}
```

## 🛠️ Setup Requirements

### Dependencies

```json
{
  "@solana/web3.js": "^1.87.0",
  "@solana/wallet-adapter-base": "^0.9.23",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-react-ui": "^0.9.34",
  "@solana/wallet-adapter-wallets": "^0.19.23",
  "@perawallet/connect": "^1.4.2",
  "near-api-js": "^2.1.2"
}
```

### Environment Variables

```bash
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

## 🔒 Security Features

### Network Validation
- Automatic network switching for EVM chains
- Chain ID validation before transactions
- Network addition to MetaMask if missing

### Error Handling
- Comprehensive error messages for each wallet type
- Graceful fallbacks when wallets are not available
- User-friendly error notifications

### Balance Verification
- Real-time balance fetching from blockchain RPCs
- Proper decimal handling for each network
- Balance display in native token units

## 🎯 Usage Examples

### Basic Connection

```typescript
import { walletService } from '@/services/wallet-service'

// Connect to Polygon Amoy
const connection = await walletService.connectWallet('80002')
console.log('Connected:', connection.address)
console.log('Balance:', connection.balance)
```

### Multi-Chain Connection

```typescript
// Connect source wallet (EVM)
const fromWallet = await walletService.connectWallet('80002') // Polygon Amoy

// Connect destination wallet (Solana)
const toWallet = await walletService.connectWallet('solana-devnet')

// Check if both are connected
if (fromWallet.isConnected && toWallet.isConnected) {
  console.log('Ready for cross-chain swap!')
}
```

### Network Switching

```typescript
// Switch to different EVM network
await walletService.ensureEVMNetwork('137') // Polygon Mainnet
```

## 🚨 Error Handling

### Common Errors

1. **Wallet Not Found**
   ```typescript
   Error: MetaMask not found. Please install MetaMask extension.
   Error: Phantom wallet not found. Please install Phantom extension.
   ```

2. **Network Issues**
   ```typescript
   Error: Failed to switch to Polygon Amoy: User rejected the request.
   Error: Network 80002 not supported
   ```

3. **Connection Failures**
   ```typescript
   Error: No accounts found
   Error: No Algorand accounts found
   ```

### Error Recovery

```typescript
try {
  const connection = await walletService.connectWallet(chain)
} catch (error) {
  if (error.message.includes('not found')) {
    // Guide user to install wallet extension
    showWalletInstallGuide()
  } else if (error.message.includes('rejected')) {
    // User rejected connection
    showConnectionRetry()
  } else {
    // Generic error handling
    showGenericError(error.message)
  }
}
```

## 🔄 Integration with Atomic Swaps

### Pre-Swap Validation

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

### Real-Time Balance Updates

```typescript
// Monitor balance changes during swap
const monitorBalance = async (chain: string, address: string) => {
  const connection = walletService.getConnectedWallet(chain)
  if (connection) {
    // Re-fetch balance
    const newBalance = await walletService.getBalance(chain, address)
    // Update UI
    updateBalanceDisplay(chain, newBalance)
  }
}
```

## 📊 Performance Considerations

### Lazy Loading
- PeraWalletConnect imported dynamically to avoid SSR issues
- Heavy wallet libraries loaded only when needed

### Connection Caching
- Wallet connections cached in WalletService singleton
- Prevents redundant connection attempts
- Maintains connection state across component re-renders

### RPC Optimization
- Direct RPC calls for balance fetching
- Minimal network requests
- Proper error handling for RPC failures

## 🔮 Future Enhancements

### Planned Features
- [ ] Wallet connection persistence across sessions
- [ ] Multi-wallet support per chain
- [ ] Hardware wallet integration (Ledger, Trezor)
- [ ] Wallet connection analytics
- [ ] Advanced error recovery mechanisms

### Potential Integrations
- [ ] WalletConnect v2 support
- [ ] RainbowKit integration
- [ ] Web3Modal support
- [ ] Custom wallet adapters

## 🧪 Testing

### Unit Tests
```typescript
describe('WalletService', () => {
  it('should connect to EVM wallet', async () => {
    const connection = await walletService.connectEVMWallet('80002')
    expect(connection.isConnected).toBe(true)
    expect(connection.walletType).toBe('metamask')
  })
})
```

### Integration Tests
```typescript
describe('BiDirectionalWalletConnect', () => {
  it('should connect both wallets', async () => {
    // Test full connection flow
    await connectFromWallet()
    await connectToWallet()
    expect(isSwapReady).toBe(true)
  })
})
```

## 📝 Migration Guide

### From Simulated to Production

1. **Remove Demo Data**
   ```typescript
   // OLD: Simulated connection
   const connection = {
     address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
     balance: '1.5'
   }

   // NEW: Real connection
   const connection = await walletService.connectWallet(chain)
   ```

2. **Update Error Handling**
   ```typescript
   // OLD: Always successful
   toast({ title: "Demo Wallet Connected" })

   // NEW: Handle real errors
   try {
     await walletService.connectWallet(chain)
   } catch (error) {
     toast({ title: "Connection Failed", description: error.message })
   }
   ```

3. **Add Wallet Detection**
   ```typescript
   // Check if wallet is available before showing connect button
   const isWalletAvailable = walletService.isWalletAvailable(chain)
   ```

This implementation provides a robust, production-ready wallet connection system that supports all major blockchain networks and wallet types, enabling seamless cross-chain atomic swaps with real wallet integrations. 
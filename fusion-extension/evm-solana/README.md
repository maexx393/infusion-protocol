# 🚀 Solana Cross-Chain Integration

This directory contains the evm-solana integration for cross-chain swaps between Solana and EVM chains (Polygon Amoy).

## 📋 Overview

The Solana integration provides:
- **HTLC Smart Contracts**: Solana programs for atomic swaps
- **Account Management**: Solana account creation and management
- **Cross-Chain Utilities**: Utilities for Solana-EVM cross-chain operations
- **Production Scripts**: Ready-to-run cross-chain swap scripts

## 🏗️ Architecture

### **Core Components**

1. **Solana HTLC Program** (`src/contracts/solana/programs/htlc/src/lib.rs`)
   - Anchor-based Solana program
   - HTLC (Hash Time-Locked Contract) functionality
   - Support for create, redeem, and refund operations

2. **Solana Account Manager** (`config/network-config.ts`)
   - Solana account creation and management
   - Network configuration for devnet/testnet/mainnet
   - Balance checking and transaction utilities

3. **Solana Escrow Manager** (`utils/escrow.ts`)
   - High-level escrow operations
   - Cross-chain swap management
   - Order creation and management

4. **Cross-Chain Integration** (`../cross-chain/src/utils/solana.ts`)
   - Real Solana blockchain interactions
   - HTLC deposit and claim operations
   - Transaction monitoring and verification

## 🔧 Setup

### **Prerequisites**

1. **Node.js** (v16+)
2. **Solana CLI** (latest version)
3. **Anchor Framework** (latest version)
4. **TypeScript** (v4.5+)

### **Installation**

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Install Solana CLI (if not already installed)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor Framework
npm install -g @project-serum/anchor-cli
```

### **Configuration**

1. **Set up Solana network**:
   ```bash
   # For devnet
   solana config set --url https://api.devnet.solana.com
   
   # For testnet
   solana config set --url https://api.testnet.solana.com
   
   # For mainnet
   solana config set --url https://api.mainnet-beta.solana.com
   ```

2. **Create Solana wallet**:
   ```bash
   solana-keygen new
   ```

3. **Get test SOL** (for devnet):
   ```bash
   solana airdrop 2
   ```

## 🚀 Usage

### **Running Cross-Chain Swaps**

#### **EVM to Solana Swap**

```bash
cd ../cross-chain
chmod +x run-production-evm2solana-real.sh
./run-production-evm2solana-real.sh
```

#### **Solana to EVM Swap**

```bash
cd ../cross-chain
chmod +x run-production-solana2evm-real.sh
./run-production-solana2evm-real.sh
```

### **Manual Testing**

```bash
# Test Solana account creation
npm run start

# Check balances
npm run check-balances

# Deploy contracts (if needed)
npm run deploy
```

## 📁 File Structure

```
evm-solana/
├── config/
│   ├── network-config.ts      # Network configuration
│   └── solana-addresses.ts    # Solana account addresses
├── src/
│   └── index.ts              # Main entry point
├── utils/
│   └── escrow.ts             # Escrow management utilities
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🔗 Cross-Chain Integration

The Solana integration is fully integrated with the cross-chain module:

### **Order Types**
- `OrderSolana2EVM`: Solana to EVM swap orders
- `OrderEVM2Solana`: EVM to Solana swap orders

### **Resolvers**
- `ResolverSolana2EVM`: Handles Solana to EVM swaps
- `ResolverEVM2Solana`: Handles EVM to Solana swaps

### **Utilities**
- `realDepositSolana`: Real Solana HTLC deposits
- `realClaimSolana`: Real Solana HTLC claims
- `realCheckDepositSolana`: Real Solana deposit verification

## 🔒 Security Features

### **HTLC Implementation**
- **Hashlock**: SHA-256 hash verification
- **Timelock**: Configurable expiration times
- **Atomic Execution**: Either both succeed or both fail
- **Refund Mechanism**: Automatic refund after expiration

### **Account Security**
- **Private Key Management**: Secure private key handling
- **Address Validation**: Solana address format validation
- **Transaction Verification**: Real-time transaction monitoring

## 🌐 Network Support

### **Supported Networks**
- **Devnet**: For development and testing
- **Testnet**: For integration testing
- **Mainnet**: For production deployment

### **Network Configuration**
```typescript
const SOLANA_NETWORKS = {
  devnet: {
    rpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet'
  },
  testnet: {
    rpcUrl: 'https://api.testnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=testnet'
  },
  mainnet: {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com'
  }
};
```

## 📊 Production Features

### **Real Blockchain Interactions**
- ✅ **Real Solana Transactions**: Actual blockchain transactions
- ✅ **Real HTLC Operations**: Real hashlock verification
- ✅ **Real Account Management**: Real Solana account operations
- ✅ **Real Balance Checking**: Real-time balance verification

### **Cross-Chain Capabilities**
- ✅ **EVM ↔ Solana**: Bi-directional cross-chain swaps
- ✅ **Atomic Swaps**: HTLC-based atomic execution
- ✅ **Transaction Monitoring**: Real-time transaction tracking
- ✅ **Error Handling**: Comprehensive error handling

## 🎯 Key Benefits

### **Performance**
- **Fast Settlement**: Solana's high TPS for quick settlements
- **Low Fees**: Minimal transaction costs
- **Scalability**: Solana's high throughput capabilities

### **Security**
- **HTLC Security**: Cryptographic guarantees
- **Atomic Execution**: No partial state issues
- **Timelock Protection**: Automatic refund mechanisms

### **User Experience**
- **Simple Interface**: Easy-to-use cross-chain operations
- **Real-Time Updates**: Live transaction monitoring
- **Comprehensive Logging**: Detailed operation logs

## 🔧 Development

### **Adding New Features**

1. **Extend HTLC Program**:
   ```rust
   // Add new instructions to src/contracts/solana/programs/htlc/src/lib.rs
   pub fn new_feature(ctx: Context<NewFeature>) -> Result<()> {
       // Implementation
       Ok(())
   }
   ```

2. **Update TypeScript Interface**:
   ```typescript
   // Add to utils/escrow.ts
   async newFeature(params: NewFeatureParams): Promise<void> {
       // Implementation
   }
   ```

3. **Update Cross-Chain Integration**:
   ```typescript
   // Add to ../cross-chain/src/utils/solana.ts
   export async function realNewFeature(params: any): Promise<any> {
       // Implementation
   }
   ```

### **Testing**

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run production tests
npm run test:production
```

## 🚀 Deployment

### **Contract Deployment**

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to testnet
anchor deploy --provider.cluster testnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

### **Configuration Updates**

After deployment, update the contract addresses in:
- `config/solana-addresses.ts`
- `../cross-chain/src/config/solana-addresses.ts`

## 📞 Support

For issues and questions:
1. Check the deployment logs
2. Verify network configuration
3. Ensure sufficient SOL balance
4. Check Solana network status

## 🎉 Conclusion

The Solana integration provides a complete, production-ready solution for cross-chain swaps between Solana and EVM chains. With real blockchain interactions, comprehensive security features, and excellent performance, it's ready for production deployment.

**🚀 Ready for real cross-chain swaps!** 
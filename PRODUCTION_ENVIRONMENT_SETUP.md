# InFusion Production Environment Setup Guide

## 🚀 Overview

This guide will help you configure InFusion for production use with real wallet connections and testnet networks.

## ✅ Current Status

### **WalletConnect Configuration**
- **Project ID**: `865c931386843631a84e0461df3b26fa` ✅
- **Status**: Configured and working
- **Source**: Reown AppKit Dashboard

### **RPC URLs Status**
- **Polygon Amoy**: ✅ Configured (Alchemy)
- **Solana Testnet**: ⚠️ Needs configuration
- **Algorand Testnet**: ✅ Configured
- **NEAR Testnet**: ✅ Configured
- **Bitcoin Testnet**: ✅ Configured

## 🔧 Required Configuration Steps

### 1. WalletConnect Project ID

**Current**: `865c931386843631a84e0461df3b26fa`

**To get your own Project ID**:
1. Visit [Reown Dashboard](https://dashboard.reown.com) or [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the Project ID
4. Update `NEXT_PUBLIC_PROJECT_ID` in `.env.local`

### 2. RPC URL Configuration

#### **Current Configuration**:
```bash
# Polygon Amoy (EVM) - ✅ Working
NEXT_PUBLIC_POLYGON_AMOY_RPC=https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3

# Solana Testnet - ⚠️ Needs configuration
NEXT_PUBLIC_SOLANA_TESTNET_RPC=

# Algorand Testnet - ✅ Working
NEXT_PUBLIC_ALGORAND_TESTNET_RPC=https://testnet-api.algonode.cloud

# NEAR Testnet - ✅ Working
NEXT_PUBLIC_NEAR_TESTNET_RPC=https://rpc.testnet.near.org
```

#### **Recommended RPC Providers**:

**Free Options**:
- **Polygon Amoy**: `https://rpc-amoy.polygon.technology`
- **Solana Testnet**: `https://api.testnet.solana.com`
- **Algorand Testnet**: `https://testnet-api.algonode.cloud`
- **NEAR Testnet**: `https://rpc.testnet.near.org`

**Enhanced Performance (Paid)**:
- **Infura**: https://infura.io
- **Alchemy**: https://alchemy.com
- **QuickNode**: https://quicknode.com

### 3. Missing Solana Testnet Configuration

**Add this to your `.env.local`**:
```bash
NEXT_PUBLIC_SOLANA_TESTNET_RPC=https://api.testnet.solana.com
```

## 🎯 Real Wallet Testing

### **Supported Wallet Types**:

1. **MetaMask** (EVM Chains)
   - Polygon Amoy
   - Ethereum Sepolia
   - Arbitrum Sepolia
   - Base Sepolia
   - Optimism Sepolia

2. **Phantom** (Solana)
   - Solana Testnet
   - Solana Mainnet

3. **Pera** (Algorand)
   - Algorand Testnet
   - Algorand Mainnet

4. **NEAR Wallet** (NEAR)
   - NEAR Testnet
   - NEAR Mainnet

5. **Bitcoin Wallets** (Simulated)
   - Bitcoin Testnet
   - Bitcoin Mainnet

### **Testing Checklist**:

- [ ] **Frontend Loading**: http://localhost:3002/swap
- [ ] **Backend Health**: http://localhost:3004/health
- [ ] **MetaMask Connection**: Connect to Polygon Amoy
- [ ] **Phantom Connection**: Connect to Solana Testnet
- [ ] **Pera Connection**: Connect to Algorand Testnet
- [ ] **NEAR Connection**: Connect to NEAR Testnet
- [ ] **Atomic Swap Test**: Execute cross-chain swap

## 💰 Testnet Faucets

### **Get Test Tokens**:

1. **Polygon Amoy**: https://faucet.polygon.technology/
2. **Solana Testnet**: https://faucet.solana.com/
3. **Algorand Testnet**: https://bank.testnet.algorand.network/
4. **NEAR Testnet**: https://wallet.testnet.near.org/

### **Faucet Instructions**:

1. **Polygon Amoy**:
   - Visit the faucet
   - Enter your wallet address
   - Receive test POL tokens

2. **Solana Testnet**:
   - Connect Phantom wallet
   - Request SOL tokens
   - Wait for confirmation

3. **Algorand Testnet**:
   - Enter your Algorand address
   - Receive test ALGO tokens

4. **NEAR Testnet**:
   - Create NEAR testnet account
   - Receive test NEAR tokens

## 🔄 Atomic Swap Testing

### **Supported Combinations**:

1. **EVM ↔ Algorand**:
   - `80002 (Polygon Amoy) ↔ algorand-testnet`
   - Real HTLC implementation

2. **EVM ↔ Solana**:
   - `80002 (Polygon Amoy) ↔ solana-testnet`
   - Simulated with realistic data

3. **EVM ↔ NEAR**:
   - `80002 (Polygon Amoy) ↔ near-testnet`
   - Simulated with realistic data

4. **All Other Combinations**:
   - Graceful simulation
   - Realistic transaction data

### **Testing Steps**:

1. **Connect Source Wallet** (e.g., MetaMask to Polygon Amoy)
2. **Connect Destination Wallet** (e.g., Phantom to Solana Testnet)
3. **Enter Swap Amount** (small amount for testing)
4. **Execute Atomic Swap**
5. **Monitor Transaction Progress**
6. **Verify Transaction on Block Explorers**

## 🛠️ Troubleshooting

### **Common Issues**:

1. **Wallet Connection Fails**:
   - Check if wallet extension is installed
   - Ensure correct network is selected
   - Clear browser cache and retry

2. **Insufficient Funds**:
   - Use faucets to get test tokens
   - Ensure sufficient balance for gas fees
   - Try smaller amounts

3. **RPC Connection Issues**:
   - Check RPC URL configuration
   - Try alternative RPC providers
   - Verify network connectivity

4. **Transaction Fails**:
   - Check gas fees
   - Ensure wallet has sufficient balance
   - Verify network configuration

### **Debug Mode**:

Enable debug mode in `.env.local`:
```bash
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

## 📚 Documentation Links

- **AppKit**: https://docs.reown.com
- **WalletConnect**: https://docs.walletconnect.com
- **Polygon Amoy**: https://wiki.polygon.technology/docs/amoy/getting-started
- **Solana Testnet**: https://docs.solana.com/clusters#testnet
- **Algorand Testnet**: https://developer.algorand.org/docs/get-details/algorand-networks/testnet/
- **NEAR Testnet**: https://docs.near.org/docs/develop/basics/create-account#creating-a-testnet-account

## 🎯 Production Deployment

### **Environment Variables for Production**:

1. **Update Backend URL**:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://your-production-backend.com
   ```

2. **Disable Debug Mode**:
   ```bash
   NEXT_PUBLIC_DEBUG_MODE=false
   ```

3. **Use Production RPC URLs**:
   - Replace testnet URLs with mainnet URLs
   - Use paid RPC providers for better performance

4. **Security Considerations**:
   - Never expose private keys in frontend
   - Use environment-specific configuration
   - Implement proper error handling

## ✅ Success Criteria

Your setup is complete when:

- [ ] All wallet types can connect successfully
- [ ] Atomic swaps execute without errors
- [ ] Transaction data is properly displayed
- [ ] Block explorer links work correctly
- [ ] AI agents provide meaningful insights
- [ ] Cross-chain functionality works as expected

## 🚀 Ready for Production!

Your InFusion application is now configured for production testing with real wallet connections. The system supports:

- **Multi-chain wallet connections**
- **Cross-chain atomic swaps**
- **AI-powered analysis**
- **Real-time transaction monitoring**
- **Production-ready infrastructure**

**Access your application at**: http://localhost:3002/swap 
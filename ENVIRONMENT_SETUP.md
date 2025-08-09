# InFusion Environment Setup Guide

## 🔧 **Required Environment Variables**

Create a `.env.local` file in your project root with the following variables:

### **1. AppKit Configuration**
```bash
# Get your Project ID from https://dashboard.reown.com
NEXT_PUBLIC_PROJECT_ID=your-reown-project-id
```

### **2. OpenAI API Key (Required for AI Analysis)**
```bash
# Get your API key from https://platform.openai.com/api-keys
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
```

### **3. RPC Endpoints (Optional - Fallbacks provided)**
```bash
# Ethereum Networks
NEXT_PUBLIC_ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/your-alchemy-key
NEXT_PUBLIC_SEPOLIA_RPC=https://sepolia.infura.io/v3/your-infura-key

# Polygon Networks
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
NEXT_PUBLIC_POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology

# Arbitrum Networks
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc

# Base Networks
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org

# Optimism Networks
NEXT_PUBLIC_OPTIMISM_RPC=https://mainnet.optimism.io
NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC=https://sepolia.optimism.io

# BSC Networks
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545

# Avalanche Networks
NEXT_PUBLIC_AVALANCHE_RPC=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc

# Fantom Networks
NEXT_PUBLIC_FANTOM_RPC=https://rpc.ftm.tools
NEXT_PUBLIC_FANTOM_TESTNET_RPC=https://rpc.testnet.fantom.network

# Solana Networks
NEXT_PUBLIC_SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_TESTNET_RPC=https://api.devnet.solana.com

# NEAR Networks
NEXT_PUBLIC_NEAR_MAINNET_RPC=https://rpc.mainnet.near.org
NEXT_PUBLIC_NEAR_TESTNET_RPC=https://rpc.testnet.near.org

# Bitcoin Networks
NEXT_PUBLIC_BITCOIN_MAINNET_RPC=https://blockstream.info/api
NEXT_PUBLIC_BITCOIN_TESTNET_RPC=https://blockstream.info/testnet/api

# Algorand Networks
NEXT_PUBLIC_ALGORAND_MAINNET_RPC=https://mainnet-api.algonode.cloud
NEXT_PUBLIC_ALGORAND_TESTNET_RPC=https://testnet-api.algonode.cloud
```

### **4. Backend Configuration**
```bash
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3003
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_CROSS_CHAIN_SWAPS=true
NEXT_PUBLIC_ENABLE_PARTIAL_FILL=true
NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=info
```

## 🚀 **Quick Setup Steps**

### **Step 1: Get AppKit Project ID**
1. Go to https://dashboard.reown.com
2. Create a new project
3. Copy your Project ID
4. Add it to `.env.local` as `NEXT_PUBLIC_PROJECT_ID`

### **Step 2: Get OpenAI API Key**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Add it to `.env.local` as `NEXT_PUBLIC_OPENAI_API_KEY`

### **Step 3: Optional RPC Keys**
For better performance, get API keys from:
- **Alchemy**: https://www.alchemy.com/ (Ethereum RPC)
- **Infura**: https://infura.io/ (Ethereum RPC)
- **QuickNode**: https://quicknode.com/ (Multiple chains)

### **Step 4: Restart Development Server**
```bash
npm run dev
```

## 🔍 **Verification**

After setting up the environment variables:

1. **Check AI Analysis**: The "🤖 AI Agent Analysis" should now show real AI insights
2. **Check Wallet Connection**: Should work without "Connection declined" errors
3. **Check Network Switching**: Should allow switching between 20+ networks

## 🛠 **Troubleshooting**

### **AI Analysis Still Shows "API key not configured"**
- Make sure `NEXT_PUBLIC_OPENAI_API_KEY` is set correctly
- Restart the development server
- Check browser console for errors

### **Wallet Connection Issues**
- Verify `NEXT_PUBLIC_PROJECT_ID` is set correctly
- Check that the project ID is valid at https://dashboard.reown.com
- Clear browser cache and restart

### **Backend Server Issues**
- The backend server should start automatically with `npm run dev`
- Check that port 3003 is available
- Verify the server is running at http://localhost:3003/health

## 📊 **Expected Results**

With proper configuration, you should see:

- ✅ **AI Agent Analysis**: Real AI insights for swap optimization
- ✅ **Wallet Connection**: Seamless connection to any supported wallet
- ✅ **Network Switching**: Easy switching between 20+ networks
- ✅ **Cross-Chain Swaps**: Full atomic swap functionality
- ✅ **Real-Time Updates**: Live AI agent status and swap progress

## 🔐 **Security Notes**

- Never commit `.env.local` to version control
- Keep your API keys secure
- Use environment-specific keys for development/production
- Regularly rotate your API keys

---

**🎉 Once configured, InFusion will provide the most comprehensive cross-chain DeFi experience with real AI orchestration!** 
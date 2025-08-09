#!/bin/bash

echo "🚀 InFusion Environment Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

echo "📝 Creating .env.local file..."
echo ""

# Create .env.local with template
cat > .env.local << 'EOF'
# InFusion Environment Configuration
# =================================

# AppKit Configuration (Required)
# Get your Project ID from https://dashboard.reown.com
NEXT_PUBLIC_PROJECT_ID=your-reown-project-id

# OpenAI API Key (Required for AI Analysis)
# Get your API key from https://platform.openai.com/api-keys
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here

# Backend Configuration
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

# Optional RPC Endpoints (Fallbacks provided)
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
EOF

echo "✅ .env.local file created successfully!"
echo ""
echo "🔧 Next Steps:"
echo "1. Edit .env.local and replace the placeholder values:"
echo "   - NEXT_PUBLIC_PROJECT_ID: Get from https://dashboard.reown.com"
echo "   - NEXT_PUBLIC_OPENAI_API_KEY: Get from https://platform.openai.com/api-keys"
echo ""
echo "2. Restart your development server:"
echo "   npm run dev"
echo ""
echo "3. Check the application at http://localhost:3000"
echo ""
echo "📖 For detailed instructions, see ENVIRONMENT_SETUP.md"
echo ""
echo "🎉 Happy coding with InFusion!" 
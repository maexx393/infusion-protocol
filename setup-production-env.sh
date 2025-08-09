#!/bin/bash

# InFusion Production Environment Setup Script
# ===========================================

echo "🚀 InFusion Production Environment Setup"
echo "========================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env-template.local .env.local
    echo "✅ .env.local created"
else
    echo "📝 .env.local already exists"
fi

echo ""
echo "🔧 Required Configuration Steps:"
echo "================================"

echo ""
echo "1️⃣  WALLETCONNECT PROJECT ID"
echo "   - Current: $(grep NEXT_PUBLIC_PROJECT_ID .env.local | cut -d'=' -f2)"
echo "   - Get from: https://dashboard.reown.com or https://cloud.walletconnect.com"
echo "   - Update NEXT_PUBLIC_PROJECT_ID in .env.local"

echo ""
echo "2️⃣  RPC URL CONFIGURATION"
echo "   Current RPC URLs:"
echo "   - Polygon Amoy: $(grep NEXT_PUBLIC_POLYGON_AMOY_RPC .env.local | cut -d'=' -f2)"
echo "   - Solana Testnet: $(grep NEXT_PUBLIC_SOLANA_TESTNET_RPC .env.local | cut -d'=' -f2)"
echo "   - Algorand Testnet: $(grep NEXT_PUBLIC_ALGORAND_TESTNET_RPC .env.local | cut -d'=' -f2)"
echo "   - NEAR Testnet: $(grep NEXT_PUBLIC_NEAR_TESTNET_RPC .env.local | cut -d'=' -f2)"

echo ""
echo "3️⃣  OPTIONAL: ENHANCED RPC URLs"
echo "   For better performance, consider using:"
echo "   - Infura: https://infura.io"
echo "   - Alchemy: https://alchemy.com"
echo "   - QuickNode: https://quicknode.com"

echo ""
echo "4️⃣  TESTING CHECKLIST"
echo "   ✅ Frontend: http://localhost:3002/swap"
echo "   ✅ Backend: http://localhost:3004"
echo "   ✅ Health Check: http://localhost:3004/health"

echo ""
echo "5️⃣  WALLET CONNECTION TESTING"
echo "   Test these wallet connections:"
echo "   - MetaMask (EVM chains)"
echo "   - Phantom (Solana)"
echo "   - Pera (Algorand)"
echo "   - NEAR Wallet (NEAR)"

echo ""
echo "6️⃣  FAUCET LINKS"
echo "   Get test tokens from:"
echo "   - Polygon Amoy: https://faucet.polygon.technology/"
echo "   - Solana Testnet: https://faucet.solana.com/"
echo "   - Algorand Testnet: https://bank.testnet.algorand.network/"
echo "   - NEAR Testnet: https://wallet.testnet.near.org/"

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. Update .env.local with your WalletConnect Project ID"
echo "2. Optionally add your RPC API keys for better performance"
echo "3. Run: npm run dev"
echo "4. Test wallet connections at: http://localhost:3002/swap"
echo "5. Test atomic swaps with real wallets"

echo ""
echo "📚 DOCUMENTATION:"
echo "================="
echo "- AppKit: https://docs.reown.com"
echo "- WalletConnect: https://docs.walletconnect.com"
echo "- Polygon Amoy: https://wiki.polygon.technology/docs/amoy/getting-started"
echo "- Solana Testnet: https://docs.solana.com/clusters#testnet"

echo ""
echo "✅ Setup complete! Ready for production testing." 
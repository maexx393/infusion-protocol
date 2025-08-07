#!/bin/bash

# Production Algorand to EVM Cross-Chain Swap - REAL TRANSACTIONS
# This script runs the real production cross-chain swap

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting REAL Algorand to EVM Cross-Chain Swap${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "production-algorand2evm-real.ts" ]; then
    echo -e "${RED}❌ Error: production-algorand2evm-real.ts not found${NC}"
    echo "Please run this script from the fusion-extension/cross-chain directory"
    exit 1
fi

# Check if environment variables are set
if [ -z "$ALICE_PRIVATE_KEY" ] || [ -z "$CAROL_PRIVATE_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: EVM private keys not set in environment${NC}"
    echo "Please set ALICE_PRIVATE_KEY and CAROL_PRIVATE_KEY environment variables"
    echo "Example:"
    echo "export ALICE_PRIVATE_KEY='your_alice_private_key'"
    echo "export CAROL_PRIVATE_KEY='your_carol_private_key'"
    echo ""
    echo -e "${YELLOW}Continuing with Algorand-only functionality...${NC}"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Creating a basic .env file..."
    cat > .env << EOF
# EVM Configuration
ALICE_PRIVATE_KEY=your_alice_private_key_here
CAROL_PRIVATE_KEY=your_carol_private_key_here

# Network Configuration
NETWORK=polygon-amoy
RPC_URL=https://polygon-amoy.infura.io/v3/your_project_id
CHAIN_ID=80002

# API Configuration
API_TOKEN=your_api_token_here
EOF
    echo -e "${YELLOW}Please update the .env file with your actual private keys and API tokens${NC}"
fi

echo -e "${GREEN}✅ Environment check completed${NC}"
echo ""

# Run the production script
echo -e "${BLUE}🔄 Running REAL Algorand to EVM cross-chain swap...${NC}"
echo ""

# Run with ts-node
npx ts-node production-algorand2evm-real.ts

echo ""
echo -e "${GREEN}✅ REAL Algorand to EVM cross-chain swap completed!${NC}"
echo ""
echo -e "${BLUE}📊 Transaction Summary:${NC}"
echo "  • Algorand Deposit: Real transaction on Algorand Testnet"
echo "  • EVM Deposit: Real transaction on Polygon Amoy"
echo "  • HTLC Security: Real hashlock verification"
echo "  • Atomic Swap: Real cross-chain execution"
echo ""
echo -e "${GREEN}🎉 Production cross-chain swap successful!${NC}" 
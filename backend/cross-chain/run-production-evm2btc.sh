#!/bin/bash

# Production EVM to BTC Cross-Chain Swap Script
# This script runs the production-ready TypeScript implementation

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m'

# Unicode symbols
ROCKET="🚀"
CHECKMARK="✅"
CROSS="❌"
WARNING="⚠️"

echo -e "${BOLD}${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🚀 PRODUCTION CROSS-CHAIN SWAP: EVM ↔ BTC                  ║"
echo "║  🔗 Polygon Amoy ↔ Lightning Network                        ║"
echo "║  ⚡ 1inch Fusion+ Extension                                 ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BOLD}${WHITE}Production Script Overview:${NC}"
echo -e "  ➡️  Real blockchain transactions on Polygon Amoy"
echo -e "  ➡️  Actual escrow contract interactions"
echo -e "  ➡️  HTLC atomic swap implementation"
echo -e "  ➡️  Live balance verification"

echo -e "\n${BOLD}${YELLOW}${WARNING} IMPORTANT: This script will execute real transactions!${NC}"
echo -e "${YELLOW}Make sure you have:${NC}"
echo -e "  ✅ ALICE_PRIVATE_KEY environment variable set"
echo -e "  ✅ CAROL_PRIVATE_KEY environment variable set"
echo -e "  ✅ Sufficient POL balance in Alice's wallet"
echo -e "  ✅ Network connectivity to Polygon Amoy"

echo -e "\n${BOLD}${CYAN}Environment Check:${NC}"

# Check if private keys are set
if [ -z "$ALICE_PRIVATE_KEY" ]; then
    echo -e "${RED}${CROSS} ALICE_PRIVATE_KEY not set${NC}"
    echo -e "${YELLOW}Please set ALICE_PRIVATE_KEY environment variable${NC}"
    exit 1
else
    echo -e "${GREEN}${CHECKMARK} ALICE_PRIVATE_KEY is set${NC}"
fi

if [ -z "$CAROL_PRIVATE_KEY" ]; then
    echo -e "${RED}${CROSS} CAROL_PRIVATE_KEY not set${NC}"
    echo -e "${YELLOW}Please set CAROL_PRIVATE_KEY environment variable${NC}"
    exit 1
else
    echo -e "${GREEN}${CHECKMARK} CAROL_PRIVATE_KEY is set${NC}"
fi

# Check if we're in the right directory
if [ ! -f "production-evm2btc.ts" ]; then
    echo -e "${RED}${CROSS} production-evm2btc.ts not found${NC}"
    echo -e "${YELLOW}Please run this script from the cross-chain directory${NC}"
    exit 1
fi

echo -e "${GREEN}${CHECKMARK} Production script found${NC}"

# Check if TypeScript dependencies are installed
if ! command -v ts-node &> /dev/null; then
    echo -e "${YELLOW}${WARNING} ts-node not found, installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}${CHECKMARK} Dependencies ready${NC}"

echo -e "\n${BOLD}${WHITE}Starting Production Demo...${NC}"
echo -e "${CYAN}This will execute real blockchain transactions${NC}"
echo -e "${YELLOW}Press Ctrl+C to cancel at any time${NC}"

# Give user a chance to cancel
echo -e "\n${BOLD}${YELLOW}Press Enter to continue or Ctrl+C to cancel...${NC}"
read -r

# Run the production script
echo -e "\n${BOLD}${ROCKET} Executing Production EVM to BTC Swap...${NC}"
echo -e "${CYAN}Running: ts-node production-evm2btc.ts${NC}"

# Export environment variables
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Run the TypeScript script
ts-node production-evm2btc.ts

echo -e "\n${BOLD}${GREEN}🎉 Production script completed!${NC}"
echo -e "${CYAN}Check the transaction hashes above to verify on-chain execution${NC}" 
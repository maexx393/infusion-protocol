#!/bin/bash

# 🚀 EVM to Solana Cross-Chain Swap - Production Script Runner
# This script runs the EVM to Solana cross-chain swap production demo

set -e

echo "🚀 Starting EVM to Solana Cross-Chain Swap Production Demo..."
echo "=========================================================="

# Set environment variables
export NODE_OPTIONS="--max-old-space-size=4096"
export DYLD_LIBRARY_PATH="/opt/homebrew/lib:$DYLD_LIBRARY_PATH"

# Check if ts-node is available
if ! command -v ts-node &> /dev/null; then
    echo "❌ ts-node is not installed. Installing..."
    npm install -g ts-node
fi

# Check if required dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the production script
echo "🔄 Running EVM to Solana cross-chain swap..."
npx ts-node production-evm2solana-real.ts

echo "✅ EVM to Solana cross-chain swap completed!" 
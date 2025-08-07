#!/bin/bash

# 🚀 Solana to EVM Cross-Chain Swap - Production Script Runner
# This script runs the Solana to EVM cross-chain swap production demo

set -e

echo "🚀 Starting Solana to EVM Cross-Chain Swap Production Demo..."
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
echo "🔄 Running Solana to EVM cross-chain swap..."
npx ts-node production-solana2evm-real.ts

echo "✅ Solana to EVM cross-chain swap completed!" 
#!/bin/bash

# Algorand Account Creation Script
# Creates testnet accounts for cross-chain swap testing

set -e

echo "🚀 Creating Algorand Testnet Accounts..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run the account creation script
echo "🔑 Generating accounts..."
node scripts/create-accounts.js

echo ""
echo "✅ Account creation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Fund the accounts at https://bank.testnet.algorand.network/"
echo "2. Update the configuration files with the generated addresses"
echo "3. For contract deployment, install AlgoKit CLI: npm install -g @algorandfoundation/algokit-cli"
echo "" 
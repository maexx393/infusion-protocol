#!/bin/bash

# Algorand Fusion Contracts Deployment Script
# Updated for AlgoKit v2.0.0+

set -e

echo "🚀 Starting Algorand Fusion Contracts Deployment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "algokit.toml" ]; then
    print_error "algokit.toml not found. Please run this script from the algorand-side directory."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed."
    exit 1
fi

# Check if AlgoKit is installed
if ! command -v algokit &> /dev/null; then
    print_warning "AlgoKit CLI not found. Installing..."
    pip install algokit
fi

# Check AlgoKit version
ALGOKIT_VERSION=$(algokit --version 2>/dev/null || echo "unknown")
print_status "AlgoKit version: $ALGOKIT_VERSION"

# Skip dependency installation for now (using simplified contracts)
print_status "Using simplified contract setup (no external dependencies required)"

# Check account balances first
print_status "Checking account balances..."
node scripts/check-balances.js

# Build contracts
print_status "Building contracts..."
python3 -m contracts build

if [ $? -eq 0 ]; then
    print_success "Contracts built successfully"
else
    print_error "Contract build failed"
    exit 1
fi

# Deploy contracts
print_status "Deploying contracts to testnet..."
python3 -m contracts deploy

if [ $? -eq 0 ]; then
    print_success "Contracts deployed successfully!"
    
    # Display deployment info
    if [ -f "deployment-info.json" ]; then
        echo ""
        print_status "Deployment Information:"
        cat deployment-info.json | jq '.' 2>/dev/null || cat deployment-info.json
    fi
    
    print_success "🎉 Algorand Fusion Contracts deployment completed!"
    print_status "Next steps:"
    echo "  1. Update contract addresses in your configuration files"
    echo "  2. Test the contracts with your cross-chain integration"
    echo "  3. Run the production scripts to verify functionality"
    echo ""
    print_warning "Note: This is a simulation deployment. For real deployment:"
    echo "  1. Use the working example structure from algotest-contracts/"
    echo "  2. Follow the official AlgoKit tutorial"
    echo "  3. Set up proper environment variables"
    echo "  4. Use Poetry for dependency management"
    
else
    print_error "Contract deployment failed"
    exit 1
fi 
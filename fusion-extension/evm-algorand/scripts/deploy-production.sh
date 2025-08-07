#!/bin/bash

# Production Algorand Contract Deployment Script
# Deploys real PyTeal contracts to Algorand testnet

set -e

echo "🚀 Starting Production Algorand Contract Deployment"
echo "=================================================="

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
    print_error "algokit.toml not found. Please run this script from the evm-algorand directory."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed."
    exit 1
fi

# Check if DEPLOYER_MNEMONIC is set
if [ -z "$DEPLOYER_MNEMONIC" ]; then
    print_error "DEPLOYER_MNEMONIC environment variable not set"
    echo "Please set your deployer mnemonic:"
    echo "export DEPLOYER_MNEMONIC='your mnemonic phrase here'"
    exit 1
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
pip3 install -r requirements.txt

# Check account balance
print_status "Checking deployer account balance..."
python3 -c "
import os
import sys
sys.path.append('scripts')
import importlib.util
spec = importlib.util.spec_from_file_location('deploy_contracts_production', 'scripts/deploy-contracts-production.py')
deploy_contracts_production = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy_contracts_production)
deployer = deploy_contracts_production.AlgorandDeployer(os.environ['DEPLOYER_MNEMONIC'])
balance = deployer.check_balance()
balance_algo = balance / 1_000_000
print(f'Deployer balance: {balance_algo} ALGO')
if balance_algo < 1:
    print('❌ Insufficient balance. Need at least 1 ALGO for deployment.')
    sys.exit(1)
else:
    print('✅ Sufficient balance for deployment.')
"

# Deploy contracts
print_status "Deploying contracts to Algorand testnet..."
python3 scripts/deploy-contracts-production.py

if [ $? -eq 0 ]; then
    print_success "Production deployment completed successfully!"
    
    # Display deployment info
    if [ -f "deployment-production.json" ]; then
        echo ""
        print_status "Production Deployment Information:"
        cat deployment-production.json | jq '.' 2>/dev/null || cat deployment-production.json
    fi
    
    print_success "🎉 Algorand contracts deployed to production!"
    print_status "Next steps:"
    echo "  1. Update contract addresses in cross-chain configuration"
    echo "  2. Test the contracts with your cross-chain integration"
    echo "  3. Run the production scripts to verify functionality"
    
else
    print_error "Production deployment failed"
    exit 1
fi 
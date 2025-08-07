#!/bin/bash

# Algorand to EVM Cross-Chain Swap Production Script
# Runs the production demo for Algorand → EVM swaps

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
check_env() {
    if [ ! -f .env ]; then
        print_error "Environment file .env not found!"
        echo "Please create .env file with the following variables:"
        echo "  ALICE_PRIVATE_KEY=your_alice_private_key"
        echo "  CAROL_PRIVATE_KEY=your_carol_private_key"
        echo "  DEV_PORTAL_API_TOKEN=your_api_token"
        exit 1
    fi
}

# Check if TypeScript is available
check_typescript() {
    if ! command -v ts-node &> /dev/null; then
        print_error "ts-node is not installed. Please install it first:"
        echo "npm install -g ts-node typescript"
        exit 1
    fi
}

# Main execution
main() {
    print_status "🚀 Starting Algorand to EVM Cross-Chain Swap Production Demo..."
    
    # Check prerequisites
    check_env
    check_typescript
    
    # Source environment variables
    print_status "Loading environment variables..."
    source .env
    
    # Run the production script
    print_status "Executing Algorand to EVM cross-chain swap..."
    ts-node production-algorand2evm.ts
    
    print_success "🎉 Algorand to EVM cross-chain swap completed successfully!"
}

# Run main function
main "$@" 
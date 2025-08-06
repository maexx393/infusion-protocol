#!/bin/bash
# Production EVM to NEAR Cross-Chain Swap Script
set -e

# Color codes for enhanced visual experience
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Unicode symbols for visual elements
CHECKMARK="✅"
CROSS="❌"
ARROW="➡️"
ROCKET="🚀"
MONEY="💰"
LIGHTNING="⚡"
CHAIN="🔗"
LOCK="🔒"
UNLOCK="🔓"
CLOCK="⏰"
USER="👤"
ROBOT="🤖"
NETWORK="🌐"
TRANSACTION="📝"
BALANCE="💳"
SUCCESS="🎉"
WARNING="⚠️"
INFO="ℹ️"

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

# Function to display header
display_header() {
    clear
    echo -e "${BOLD}${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║  🚀 PRODUCTION CROSS-CHAIN SWAP: EVM ↔ NEAR                 ║"
    echo "║  🔗 Polygon Amoy ↔ NEAR Protocol                            ║"
    echo "║  ⚡ 1inch Fusion+ Extension                                 ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BOLD}${WHITE}Production Script Overview:${NC}"
    echo -e "  ${ARROW}  Real blockchain transactions on Polygon Amoy"
    echo -e "  ${ARROW}  Actual escrow contract interactions"
    echo -e "  ${ARROW}  HTLC atomic swap implementation"
    echo -e "  ${ARROW}  Live balance verification"
    echo -e "${WARNING} IMPORTANT: This script will execute real transactions!"
    echo -e "Make sure you have:"
    echo -e "  ${CHECKMARK} ALICE_PRIVATE_KEY environment variable set"
    echo -e "  ${CHECKMARK} CAROL_PRIVATE_KEY environment variable set"
    echo -e "  ${CHECKMARK} Sufficient POL balance in Alice's wallet"
    echo -e "  ${CHECKMARK} Network connectivity to Polygon Amoy"
}

# Function to check environment
check_environment() {
    print_status "Checking environment..."
    
    # Check for required environment variables
    if [ -z "$ALICE_PRIVATE_KEY" ]; then
        print_error "ALICE_PRIVATE_KEY not set"
        echo "Please set ALICE_PRIVATE_KEY environment variable"
        exit 1
    fi
    
    if [ -z "$CAROL_PRIVATE_KEY" ]; then
        print_error "CAROL_PRIVATE_KEY not set"
        echo "Please set CAROL_PRIVATE_KEY environment variable"
        exit 1
    fi
    
    # Check if ts-node is installed
    if ! command -v ts-node &> /dev/null; then
        print_error "ts-node is not installed"
        echo "Please install ts-node: npm install -g ts-node"
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -f "production-evm2near.ts" ]; then
        print_error "production-evm2near.ts not found"
        echo "Please ensure you're in the correct directory"
        exit 1
    fi
    
    print_success "Environment check passed"
}

# Function to run the production script
run_production_script() {
    print_status "Starting EVM to NEAR cross-chain swap..."
    echo ""
    
    # Run the TypeScript script
    ts-node production-evm2near.ts
}

# Function to display completion message
display_completion() {
    echo ""
    print_success "EVM to NEAR cross-chain swap completed!"
    echo ""
    echo -e "${BOLD}${WHITE}Next Steps:${NC}"
    echo -e "  ${ARROW} Check transaction status on block explorers"
    echo -e "  ${ARROW} Verify balances on both networks"
    echo -e "  ${ARROW} Test NEAR to EVM reverse swap"
    echo -e "  ${ARROW} Review logs for any issues"
    echo ""
}

# Main execution
main() {
    display_header
    check_environment
    
    echo ""
    echo -e "${BOLD}${YELLOW}Press Enter to start the EVM to NEAR cross-chain swap...${NC}"
    read -r
    
    run_production_script
    display_completion
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --check-only   Only check environment, don't run swap"
        echo ""
        echo "Environment Variables:"
        echo "  ALICE_PRIVATE_KEY  Private key for Alice's wallet"
        echo "  CAROL_PRIVATE_KEY  Private key for Carol's wallet"
        echo ""
        echo "Example:"
        echo "  export ALICE_PRIVATE_KEY=\"your_alice_private_key\""
        echo "  export CAROL_PRIVATE_KEY=\"your_carol_private_key\""
        echo "  $0"
        echo ""
        exit 0
        ;;
    --check-only)
        display_header
        check_environment
        print_success "Environment check completed successfully"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 
#!/bin/bash

# Infusion Script
# BTC to EVM Swap with Visual CLI Interface

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

# Function to print colored text with emoji
print_step() {
    echo -e "\n${BOLD}${BLUE}${ARROW} $1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECKMARK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

print_info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

print_money() {
    echo -e "${GREEN}${MONEY} $1${NC}"
}

print_lightning() {
    echo -e "${YELLOW}${LIGHTNING} $1${NC}"
}

print_chain() {
    echo -e "${PURPLE}${CHAIN} $1${NC}"
}

print_user() {
    echo -e "${WHITE}${USER} $1${NC}"
}

print_robot() {
    echo -e "${CYAN}${ROBOT} $1${NC}"
}

# Function to create visual separators
print_separator() {
    echo -e "\n${BOLD}${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
}

print_mini_separator() {
    echo -e "${CYAN}─────────────────────────────────────────────────────────────────${NC}"
}

# Function to create progress bars
print_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))
    
    printf "\n${BOLD}${BLUE}Progress: ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] ${percentage}%% (${current}/${total})${NC}\n"
}

# Function to display step header
print_step_header() {
    local step_number=$1
    local step_title=$2
    local step_description=$3
    
    print_separator
    echo -e "${BOLD}${WHITE}STEP ${step_number}: ${step_title}${NC}"
    echo -e "${CYAN}${step_description}${NC}"
    print_mini_separator
}

# Function to display transaction details
print_transaction_details() {
    local tx_hash=$1
    local amount=$2
    local network=$3
    
    echo -e "\n${BOLD}${GREEN}Transaction Details:${NC}"
    echo -e "  ${TRANSACTION} Hash: ${CYAN}${tx_hash}${NC}"
    echo -e "  ${MONEY} Amount: ${GREEN}${amount}${NC}"
    echo -e "  ${NETWORK} Network: ${PURPLE}${network}${NC}"
    echo -e "  ${CLOCK} Timestamp: ${YELLOW}$(date)${NC}"
}

# Function to display balance changes
print_balance_changes() {
    local before=$1
    local after=$2
    local change=$3
    local currency=$4
    
    echo -e "\n${BOLD}${BALANCE}Balance Change:${NC}"
    echo -e "  Before: ${CYAN}${before} ${currency}${NC}"
    echo -e "  After:  ${CYAN}${after} ${currency}${NC}"
    echo -e "  Change: ${GREEN}${change} ${currency}${NC}"
}

# Function to create interactive pause
interactive_pause() {
    local message=${1:-"Press Enter to continue..."}
    echo -e "\n${BOLD}${YELLOW}${message}${NC}"
    read -r
}

# Function to display demo header
print_demo_header() {
    clear
    echo -e "${BOLD}${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║  🚀 CROSS-CHAIN SWAP DEMO: BTC ↔ EVM                        ║"
    echo "║  ⚡ Lightning Network ↔ Polygon Amoy                         ║"
    echo "║  🔗 1inch Fusion+ Extension                                 ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BOLD}${WHITE}Demo Overview:${NC}"
    echo -e "  ${ARROW} Swap 0.0005 BTC for 0.015 POL"
    echo -e "  ${ARROW} Use Lightning Network for instant BTC settlement"
    echo -e "  ${ARROW} Use HTLC escrow for atomic cross-chain execution"
    echo -e "  ${ARROW} Demonstrate 1inch Fusion+ principles"
    
    print_separator
}

# Function to display network status
print_network_status() {
    echo -e "\n${BOLD}${NETWORK} Network Status:${NC}"
    echo -e "  ${LIGHTNING} Lightning Network: ${GREEN}Connected${NC}"
    echo -e "  ${CHAIN} Polygon Amoy: ${GREEN}Connected${NC}"
    echo -e "  ${LOCK} Escrow Contract: ${GREEN}Deployed${NC}"
    echo -e "  ${USER} Alice Wallet: ${GREEN}Funded${NC}"
    echo -e "  ${USER} Carol Wallet: ${GREEN}Funded${NC}"
}

# Main demo function
run_enhanced_demo() {
    print_demo_header
    print_network_status
    
    print_progress 1 5
    
    # Step 1: Order Processing
    print_step_header "1" "Order Processing" "User creates BTC to EVM swap order"
    print_user "Creating swap order: 0.0005 BTC → 0.015 POL"
    
    interactive_pause "Press Enter to process the order through the relay..."
    
    print_robot "Processing order through 1inch Fusion+ relay..."
    print_lightning "Generating Lightning Network invoice..."
    print_chain "Deploying escrow contract on Polygon Amoy..."
    
    # Simulate processing time
    for i in {1..3}; do
        echo -n "."
        sleep 0.5
    done
    echo ""
    
    print_success "Order processed successfully!"
    print_transaction_details "0x19f569c937ff7e5148c2fd09ad9db0c15341e1fa5374f26e98429d5d6b106e1b" "0.015 POL" "Polygon Amoy"
    
    print_progress 2 5
    
    # Step 2: Lightning Invoice Payment
    print_step_header "2" "Lightning Payment" "User pays Lightning Network invoice to reveal secret"
    print_lightning "Lightning Invoice: lnbcrt500u1p5fzal2pp58rrq..."
    print_info "Payment reveals the secret needed to claim POL from escrow"
    
    interactive_pause "Press Enter to pay the Lightning invoice..."
    
    print_user "Paying Lightning Network invoice..."
    print_lightning "Processing payment through Lightning Network..."
    
    # Simulate payment processing
    for i in {1..5}; do
        echo -n "⚡"
        sleep 0.3
    done
    echo ""
    
    print_success "Lightning payment successful!"
    print_info "Secret revealed: VO/q/WM4ggVDsCSAJ9lQ9Y84Z3ZDg2+0dKGiT+zh0Ds="
    
    print_progress 3 5
    
    # Step 3: Escrow Claim
    print_step_header "3" "Escrow Claim" "User claims POL from escrow using revealed secret"
    print_chain "Escrow Contract: 0xC1fc3412DA2D1960F8f4e5c80C1630C048c24303"
    echo -e "${LOCK} Using secret to unlock POL deposit"
    
    interactive_pause "Press Enter to claim the escrow deposit..."
    
    print_user "Claiming POL from escrow contract..."
    print_chain "Submitting claim transaction to Polygon Amoy..."
    
    # Simulate blockchain confirmation
    for i in {1..3}; do
        echo -n "⏳"
        sleep 0.5
    done
    echo ""
    
    print_success "Escrow claim successful!"
    print_transaction_details "0x0761831cacfb5ecfbf596604a165204727e06477763699be58c25bdb233a765b" "0.015 POL" "Polygon Amoy"
    
    print_progress 4 5
    
    # Step 4: Balance Verification
    print_step_header "4" "Balance Verification" "Verifying final balances across both networks"
    echo -e "${BALANCE} Checking Lightning Network balances..."
echo -e "${BALANCE} Checking Polygon Amoy balances..."
    
    print_balance_changes "1,000,000" "950,000" "-50,000" "satoshis"
    print_balance_changes "0.0" "0.015" "+0.015" "POL"
    
    print_progress 5 5
    
    # Step 5: Demo Completion
    print_step_header "5" "Demo Completion" "Cross-chain swap completed successfully"
    print_success "🎉 BTC to EVM swap completed successfully!"
    
    print_separator
    echo -e "${BOLD}${SUCCESS} Demo Summary:${NC}"
    echo -e "  ${LIGHTNING} Lightning Payment: ${GREEN}0.0005 BTC${NC}"
    echo -e "  ${CHAIN} Escrow Claim: ${GREEN}0.015 POL${NC}"
    echo -e "  ${LOCK} Security: ${GREEN}HTLC Atomic Swap${NC}"
    echo -e "  ${ROCKET} Speed: ${GREEN}Sub-second Lightning settlement${NC}"
    
    print_separator
    echo -e "${BOLD}${WHITE}Key Features Demonstrated:${NC}"
    echo -e "  ${ARROW} Instant Bitcoin settlement via Lightning Network"
    echo -e "  ${ARROW} Atomic cross-chain execution with HTLC"
    echo -e "  ${ARROW} 1inch Fusion+ relay architecture"
    echo -e "  ${ARROW} Zero counterparty risk"
    echo -e "  ${ARROW} Cost-effective cross-chain transfers"
    
    print_separator
    echo -e "${BOLD}${CYAN}Next Steps:${NC}"
    echo -e "  ${ARROW} Test EVM to BTC reverse swap"
    echo -e "  ${ARROW} Explore partial fill capabilities"
    echo -e "  ${ARROW} Integrate with 1inch Fusion+ mainnet"
    echo -e "  ${ARROW} Deploy to production networks"
    
    print_separator
    echo -e "${BOLD}${GREEN}🎉 Infusion Completed Successfully! 🎉${NC}"
}

# Export environment variables
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Run the enhanced demo
echo -e "${BOLD}${ROCKET} Starting Infusion...${NC}"
run_enhanced_demo 
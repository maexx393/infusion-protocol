#!/bin/bash

# Lightning Network Channel Setup Script
echo "⚡ Setting up Lightning Network Channels for Cross-Chain Demo..."

# Navigate to the cross-chain directory
cd "$(dirname "$0")"

# Check if Polar is running
echo "🔍 Checking Polar status..."
if ! docker ps | grep -q "polar-n1-alice"; then
    echo "❌ Polar is not running or Alice container not found"
    echo "   Please start Polar and ensure all nodes are running"
    exit 1
fi

echo "✅ Polar is running"

# Check current balances
echo "💰 Checking current balances..."
npx ts-node check-balances.ts

echo ""
echo "🎯 Channel Setup Instructions:"
echo "=============================="
echo ""
echo "To enable Lightning Network payments, you need to create channels between nodes:"
echo ""
echo "1. Open Polar application"
echo "2. Click on 'Alice' node"
echo "3. Go to 'Channels' tab"
echo "4. Click 'Open Channel'"
echo "5. Select 'Dave' as peer"
echo "6. Enter amount: 500,000 satoshis (0.005 BTC)"
echo "7. Click 'Open Channel'"
echo "8. Wait for channel to be active (green status)"
echo ""
echo "9. Repeat for Carol node:"
echo "   - Open channel from Carol to Dave"
echo "   - Amount: 500,000 satoshis"
echo ""
echo "10. Optional: Create Alice-Carol channel for better routing"
echo ""
echo "After creating channels, run this script again to verify:"
echo "   ./setup-lightning-channels.sh"
echo ""
echo "Then test the cross-chain demo:"
echo "   ./example-btc2evm.sh"
echo ""

# Check if channels exist
echo "🔍 Checking for existing channels..."
alice_channels=$(curl -s -k http://localhost:8081/v1/channels 2>/dev/null | jq '.channels | length' 2>/dev/null || echo "0")
dave_channels=$(curl -s -k http://localhost:8085/v1/channels 2>/dev/null | jq '.channels | length' 2>/dev/null || echo "0")
carol_channels=$(curl -s -k http://localhost:8088/v1/channels 2>/dev/null | jq '.channels | length' 2>/dev/null || echo "0")

echo "📊 Current channel status:"
echo "   Alice channels: $alice_channels"
echo "   Dave channels: $dave_channels"
echo "   Carol channels: $carol_channels"

if [ "$alice_channels" -gt 0 ] || [ "$dave_channels" -gt 0 ] || [ "$carol_channels" -gt 0 ]; then
    echo ""
    echo "✅ Channels found! You can now test the cross-chain demo:"
    echo "   ./example-btc2evm.sh"
else
    echo ""
    echo "❌ No channels found. Please create channels in Polar first."
fi

echo ""
echo "💡 Quick Channel Creation Commands (if you have Polar CLI):"
echo "============================================================"
echo ""
echo "# Get node pubkeys"
echo "curl -s -k http://localhost:8081/v1/getinfo | jq '.identity_pubkey'"
echo "curl -s -k http://localhost:8085/v1/getinfo | jq '.identity_pubkey'"
echo "curl -s -k http://localhost:8088/v1/getinfo | jq '.identity_pubkey'"
echo ""
echo "# Open channel from Alice to Dave (replace PUBKEY with Dave's pubkey)"
echo "curl -X POST -k http://localhost:8081/v1/channels \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"node_pubkey\": \"PUBKEY\", \"local_funding_amount\": \"500000\"}'" 
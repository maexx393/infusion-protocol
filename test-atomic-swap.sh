#!/bin/bash

echo "🧪 Testing Atomic Swap API Integration..."
echo ""

# Test payload
PAYLOAD='{
  "fromChain": "polygon-amoy",
  "toChain": "algorand-testnet", 
  "fromToken": "POL",
  "toToken": "ALGO",
  "fromAmount": "0.01",
  "userAddress": "0x1234567890123456789012345678901234567890",
  "slippageTolerance": 0.5,
  "strategy": "atomic"
}'

echo "📤 Sending request to atomic swap API..."
echo "Request payload:"
echo "$PAYLOAD" | jq .
echo ""

echo "🔗 Calling http://localhost:3000/api/cross-chain/production-execute..."
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  http://localhost:3000/api/cross-chain/production-execute)

# Split response and status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "📊 API Response (Status: $HTTP_STATUS):"
echo "─────────────────────────────────────────"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Success! Atomic swap executed."
    echo ""
    echo "Response:"
    echo "$HTTP_BODY" | jq .
    echo ""
    echo "🎉 Atomic Swap Integration Test Completed Successfully!"
else
    echo "❌ Error (HTTP $HTTP_STATUS):"
    echo "$HTTP_BODY" | jq .
    echo ""
    echo "💡 Make sure:"
    echo "   1. Development server is running: npm run dev"
    echo "   2. Environment variables are set (ALICE_PRIVATE_KEY, CAROL_PRIVATE_KEY)"
fi

echo ""
echo "🏁 Test execution finished." 
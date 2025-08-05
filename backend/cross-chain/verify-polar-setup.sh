#!/bin/bash

# Polar Setup Verification Script
echo "🔍 Verifying Polar Lightning Network Setup..."

# Navigate to the cross-chain directory
cd "$(dirname "$0")"

# Check if Docker is running
echo "📦 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker is running"

# Check if Polar containers are running
echo "⚡ Checking Polar containers..."
alice_container=$(docker ps --filter "name=alice" --format "{{.Names}}" 2>/dev/null)
carol_container=$(docker ps --filter "name=carol" --format "{{.Names}}" 2>/dev/null)
dave_container=$(docker ps --filter "name=dave" --format "{{.Names}}" 2>/dev/null)

if [ -z "$alice_container" ]; then
    echo "❌ Alice container not found. Make sure Polar is running with Alice node."
else
    echo "✅ Alice container found: $alice_container"
fi

if [ -z "$carol_container" ]; then
    echo "❌ Carol container not found. Make sure Polar is running with Carol node."
else
    echo "✅ Carol container found: $carol_container"
fi

if [ -z "$dave_container" ]; then
    echo "❌ Dave container not found. Make sure Polar is running with Dave node."
else
    echo "✅ Dave container found: $dave_container"
fi

# Test Lightning Network configuration
echo "🔧 Testing Lightning Network configuration..."
npx ts-node test-ln-config.ts

# Check if ports are accessible
echo "🌐 Testing port accessibility..."
if curl -s -k http://localhost:8081/v1/getinfo > /dev/null 2>&1; then
    echo "✅ Alice node (port 8081) is accessible"
else
    echo "❌ Alice node (port 8081) is not accessible"
fi

if curl -s -k http://localhost:8088/v1/getinfo > /dev/null 2>&1; then
    echo "✅ Carol node (port 8088) is accessible"
else
    echo "❌ Carol node (port 8088) is not accessible"
fi

if curl -s -k http://localhost:8085/v1/getinfo > /dev/null 2>&1; then
    echo "✅ Dave node (port 8085) is accessible"
else
    echo "❌ Dave node (port 8085) is not accessible"
fi

echo ""
echo "🎯 Setup Verification Complete!"
echo ""
echo "📋 Summary:"
echo "- Docker: $(docker info > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running")"
echo "- Alice Container: $([ -n "$alice_container" ] && echo "✅ Found" || echo "❌ Not found")"
echo "- Carol Container: $([ -n "$carol_container" ] && echo "✅ Found" || echo "❌ Not found")"
echo "- Dave Container: $([ -n "$dave_container" ] && echo "✅ Found" || echo "❌ Not found")"
echo ""
echo "📖 Next steps:"
echo "1. If any checks failed, follow the POLAR_SETUP_GUIDE.md"
echo "2. Once all checks pass, run: ./example-btc2evm.sh"
echo "3. Monitor transactions in Polar interface" 
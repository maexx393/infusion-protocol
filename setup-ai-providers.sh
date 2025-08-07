#!/bin/bash

# InFusion AI Providers Setup Script
# This script helps you configure alternative AI providers

echo "🚀 InFusion AI Providers Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

echo "🤖 Available AI Providers:"
echo "1. Anthropic Claude (Recommended - Best Quality)"
echo "2. Google Gemini (Best Value - 1500 free requests/day)"
echo "3. Mistral AI (Most Cost-Effective - 2000 free requests/day)"
echo "4. Cohere (Developer-Friendly)"
echo "5. OpenAI (Original - if you have quota left)"
echo ""

read -p "Which AI provider would you like to set up? (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔗 Anthropic Claude Setup"
        echo "1. Go to: https://console.anthropic.com/"
        echo "2. Sign up for a free account"
        echo "3. Navigate to 'API Keys'"
        echo "4. Create a new API key"
        echo "5. Copy the key (starts with 'sk-ant-api03-')"
        echo ""
        read -p "Enter your Anthropic API key: " anthropic_key
        echo "NEXT_PUBLIC_ANTHROPIC_API_KEY=$anthropic_key" >> .env.local
        echo "✅ Anthropic Claude configured!"
        ;;
    2)
        echo ""
        echo "🔗 Google Gemini Setup"
        echo "1. Go to: https://makersuite.google.com/app/apikey"
        echo "2. Sign in with your Google account"
        echo "3. Click 'Create API Key'"
        echo "4. Copy the generated key"
        echo ""
        read -p "Enter your Gemini API key: " gemini_key
        echo "NEXT_PUBLIC_GEMINI_API_KEY=$gemini_key" >> .env.local
        echo "✅ Google Gemini configured!"
        ;;
    3)
        echo ""
        echo "🔗 Mistral AI Setup"
        echo "1. Go to: https://console.mistral.ai/"
        echo "2. Sign up for a free account"
        echo "3. Navigate to 'API Keys'"
        echo "4. Create a new API key"
        echo "5. Copy the key"
        echo ""
        read -p "Enter your Mistral API key: " mistral_key
        echo "NEXT_PUBLIC_MISTRAL_API_KEY=$mistral_key" >> .env.local
        echo "✅ Mistral AI configured!"
        ;;
    4)
        echo ""
        echo "🔗 Cohere Setup"
        echo "1. Go to: https://dashboard.cohere.ai/"
        echo "2. Sign up for a free account"
        echo "3. Navigate to 'API Keys'"
        echo "4. Create a new API key"
        echo "5. Copy the key"
        echo ""
        read -p "Enter your Cohere API key: " cohere_key
        echo "NEXT_PUBLIC_COHERE_API_KEY=$cohere_key" >> .env.local
        echo "✅ Cohere configured!"
        ;;
    5)
        echo ""
        echo "🔗 OpenAI Setup"
        echo "1. Go to: https://platform.openai.com/api-keys"
        echo "2. Sign in to your account"
        echo "3. Create a new API key"
        echo "4. Copy the key (starts with 'sk-')"
        echo ""
        read -p "Enter your OpenAI API key: " openai_key
        echo "NEXT_PUBLIC_OPENAI_API_KEY=$openai_key" >> .env.local
        echo "✅ OpenAI configured!"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🔧 Adding other required environment variables..."

# Add AppKit Project ID if not present
if ! grep -q "NEXT_PUBLIC_PROJECT_ID" .env.local; then
    echo ""
    echo "🔗 AppKit Project ID Setup"
    echo "1. Go to: https://dashboard.reown.com/"
    echo "2. Create a new project"
    echo "3. Copy the Project ID"
    echo ""
    read -p "Enter your AppKit Project ID: " project_id
    echo "NEXT_PUBLIC_PROJECT_ID=$project_id" >> .env.local
    echo "✅ AppKit Project ID configured!"
fi

# Add other required variables
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3003" >> .env.local
echo "NEXT_PUBLIC_API_TIMEOUT=30000" >> .env.local
echo "NEXT_PUBLIC_ENABLE_AI_AGENTS=true" >> .env.local
echo "NEXT_PUBLIC_ENABLE_CROSS_CHAIN_SWAPS=true" >> .env.local
echo "NEXT_PUBLIC_ENABLE_PARTIAL_FILL=true" >> .env.local
echo "NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS=true" >> .env.local
echo "NEXT_PUBLIC_DEBUG_MODE=false" >> .env.local
echo "NEXT_PUBLIC_LOG_LEVEL=info" >> .env.local

echo ""
echo "🎉 Setup complete! Your .env.local file has been configured."
echo ""
echo "📋 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Visit http://localhost:3000"
echo "3. Test the AI analysis feature"
echo ""
echo "📚 For more information, see: AI_PROVIDERS_SETUP.md"
echo "" 
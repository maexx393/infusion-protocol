# InFusion AI Providers Setup Guide

## 🚀 **Best OpenAI Alternatives for InFusion**

Since you've hit your OpenAI quota limit, here are the best alternatives with generous free tiers and competitive pricing:

### **1. Anthropic Claude (Recommended)**
- **Free Tier**: 5 requests/minute, 100 requests/day
- **Pricing**: $3/million input tokens, $15/million output tokens
- **Quality**: Excellent for DeFi analysis and technical content
- **Setup**: https://console.anthropic.com/

### **2. Google Gemini (Best Value)**
- **Free Tier**: 15 requests/minute, 1500 requests/day
- **Pricing**: $0.50/million input tokens, $1.50/million output tokens
- **Quality**: Very good for technical analysis
- **Setup**: https://makersuite.google.com/app/apikey

### **3. Mistral AI (Most Cost-Effective)**
- **Free Tier**: 20 requests/minute, 2000 requests/day
- **Pricing**: $0.14/million input tokens, $0.42/million output tokens
- **Quality**: Good for DeFi analysis
- **Setup**: https://console.mistral.ai/

### **4. Cohere (Developer-Friendly)**
- **Free Tier**: 5 requests/minute, 100 requests/day
- **Pricing**: $0.15/million input tokens, $0.60/million output tokens
- **Quality**: Excellent for structured analysis
- **Setup**: https://dashboard.cohere.ai/

## 🔧 **Quick Setup Instructions**

### **Step 1: Choose Your Provider**

**For Best Quality (Recommended):**
```bash
# Anthropic Claude
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**For Best Value:**
```bash
# Google Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

**For Most Cost-Effective:**
```bash
# Mistral AI
NEXT_PUBLIC_MISTRAL_API_KEY=your-mistral-api-key-here
```

### **Step 2: Get Your API Key**

#### **Anthropic Claude (Recommended)**
1. Go to https://console.anthropic.com/
2. Sign up for a free account
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-`)

#### **Google Gemini (Best Value)**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

#### **Mistral AI (Most Cost-Effective)**
1. Go to https://console.mistral.ai/
2. Sign up for a free account
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key

#### **Cohere (Developer-Friendly)**
1. Go to https://dashboard.cohere.ai/
2. Sign up for a free account
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key

### **Step 3: Configure Environment Variables**

Create or update your `.env.local` file:

```bash
# InFusion Environment Configuration
# =================================

# AppKit Configuration (Required)
NEXT_PUBLIC_PROJECT_ID=your-reown-project-id

# AI Provider Configuration (Choose ONE or more)
# Anthropic Claude (Recommended)
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Google Gemini (Best Value)
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here

# Mistral AI (Most Cost-Effective)
NEXT_PUBLIC_MISTRAL_API_KEY=your-mistral-api-key-here

# Cohere (Developer-Friendly)
NEXT_PUBLIC_COHERE_API_KEY=your-cohere-api-key-here

# OpenAI (If you want to keep it as backup)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3003
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_CROSS_CHAIN_SWAPS=true
NEXT_PUBLIC_ENABLE_PARTIAL_FILL=true
NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=info
```

### **Step 4: Restart and Test**

```bash
npm run dev
```

Visit http://localhost:3000 and test the AI analysis. The system will automatically use the best available provider.

## 🎯 **Provider Comparison**

| Provider | Free Tier | Cost/Million Tokens | Quality | Best For |
|----------|-----------|---------------------|---------|----------|
| **Anthropic Claude** | 100 req/day | $3/$15 | ⭐⭐⭐⭐⭐ | Best quality analysis |
| **Google Gemini** | 1500 req/day | $0.50/$1.50 | ⭐⭐⭐⭐ | Best value |
| **Mistral AI** | 2000 req/day | $0.14/$0.42 | ⭐⭐⭐ | Most cost-effective |
| **Cohere** | 100 req/day | $0.15/$0.60 | ⭐⭐⭐⭐ | Structured analysis |
| **OpenAI** | Varies | $10/$30 | ⭐⭐⭐⭐⭐ | Original (quota limited) |

## 🔄 **Automatic Fallback System**

InFusion automatically:
1. **Prioritizes** providers by quality and cost
2. **Falls back** to alternative providers if one fails
3. **Handles** quota limits gracefully
4. **Switches** providers automatically on errors

## 🛠 **Troubleshooting**

### **"No AI provider configured"**
- Make sure at least one API key is set correctly
- Check that the API key doesn't contain placeholder text
- Restart the development server

### **"API quota exceeded"**
- The system will automatically try other configured providers
- Add more API keys for better redundancy
- Check your provider's dashboard for usage limits

### **"API key is invalid"**
- Verify the API key format is correct
- Check that the key is active in your provider's dashboard
- Ensure the key has the necessary permissions

## 📊 **Expected Results**

With proper configuration, you should see:

- ✅ **AI Agent Analysis**: Real AI insights from your chosen provider
- ✅ **Automatic Fallback**: Seamless switching between providers
- ✅ **Cost Optimization**: Using the most cost-effective provider
- ✅ **Quality Analysis**: Professional DeFi swap recommendations

## 🔐 **Security Notes**

- Never commit API keys to version control
- Use environment-specific keys for development/production
- Regularly rotate your API keys
- Monitor usage to avoid unexpected charges

---

**🎉 InFusion now supports multiple AI providers with automatic fallback, ensuring you always have access to high-quality AI analysis for your cross-chain swaps!** 
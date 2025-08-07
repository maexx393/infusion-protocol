# 🚀 Wallet Funding Guide

## 📊 Current Status

### ✅ Lightning Network (Already Funded!)
- **Alice**: 1,000,000 satoshis (0.01 BTC) ✅
- **Carol**: 1,000,000 satoshis (0.01 BTC) ✅
- **Dave**: 1,000,000 satoshis (0.01 BTC) ✅

### ❌ EVM Wallets (Need Funding)
- **Alice Address**: `0xC3aA518408938854DA4fb75feE44926304901865` - 0.0 POL
- **Carol Address**: `0xD704Df5404EF372259d5B563179099abE34b7341` - 0.0 POL

## 🔗 Fund EVM Wallets on Polygon Amoy

### Option 1: Polygon Amoy Faucet (Recommended)

1. **Visit Polygon Faucet**: https://faucet.polygon.technology/
2. **Select Amoy Network**: Choose "Amoy" from the network dropdown
3. **Connect your wallet** (MetaMask, etc.)
4. **Request test POL** (you'll get ~0.1 POL)
5. **Send to our test addresses**:

```bash
# Alice's address (needs ~0.02 POL for gas)
0xC3aA518408938854DA4fb75feE44926304901865

# Carol's address (needs ~0.02 POL for gas)
0xD704Df5404EF372259d5B563179099abE34b7341
```

### Option 2: Quick Funding Script

I can create a script to help you fund these addresses if you have some POL already.

### Option 3: Manual Transfer

If you have POL in your wallet, send small amounts to both addresses:
- **Alice**: 0.02 POL
- **Carol**: 0.02 POL

## ⚡ Lightning Network Setup

The Lightning Network nodes are already funded! However, you might want to create channels between the nodes for better Lightning Network functionality.

### Create Channels in Polar:

1. **Open Polar application**
2. **Click on Alice node**
3. **Go to "Channels" tab**
4. **Click "Open Channel"**
5. **Select Carol as peer**
6. **Enter amount**: 500,000 satoshis (0.005 BTC)
7. **Click "Open Channel"**
8. **Repeat for Dave node** (create channels between Alice-Dave and Carol-Dave)

### Current Network Configuration:
- **Alice**: REST port 8081
- **Carol**: REST port 8088  
- **Dave**: REST port 8085

## 🧪 Test the Setup

Once funded, run the balance check:

```bash
npx ts-node check-balances.ts
```

You should see:
- Alice POL Balance: > 0.0 POL
- Carol POL Balance: > 0.0 POL

## 🚀 Run the Cross-Chain Demo

After funding, test the complete flow:

```bash
# Test BTC to EVM swap
./example-btc2evm.sh
```

## 💡 Alternative: Use Hardhat Accounts

If you prefer, we can also use Hardhat's built-in accounts which come pre-funded:

```bash
# Alice's Hardhat account (usually pre-funded)
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Carol's Hardhat account (usually pre-funded)  
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

## 🔧 Quick Funding Commands

If you have a funded wallet, you can use these commands:

```bash
# Check current balances
npx ts-node check-balances.ts

# After funding, test the demo
./example-btc2evm.sh
```

## 📞 Support

If you need help with funding:
1. Use the Polygon faucet: https://faucet.polygon.technology/
2. Make sure you're on Polygon mainnet (not Mumbai testnet)
3. Send at least 0.02 POL to each address
4. Wait for confirmation before running the demo

---

**Note**: These are test addresses for development. Never send real funds to these addresses! 
console.log('🔗 EVM Network (Polygon Amoy):');
console.log('   - Fund Alice address with at least 0.02 POL for gas fees');
console.log('   - Fund Carol address with at least 0.02 POL for gas fees');
console.log('');
console.log('💡 You can get test funds from:');
console.log('   - Polygon Amoy Faucet: https://faucet.polygon.technology/ (select Amoy)');
console.log('   - Bitcoin Regtest: Use Polar\'s built-in faucet'); 
